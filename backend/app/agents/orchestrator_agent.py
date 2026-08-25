import time
import hashlib
import logging
from typing import Dict, Any, List

from app.agents.user_interaction_agent import user_interaction_agent
from app.agents.retrieval_agent import retrieval_agent
from app.agents.recommendation_agent import recommendation_agent
from app.agents.pricing_agent import pricing_agent
from app.agents.inventory_agent import inventory_agent
from app.services.product_service import product_service
from app.services.pricing_service import pricing_service
from app.services.inventory_service import inventory_service
from app.services.delivery_service import delivery_service
from app.services.cache_service import cache_service
from app.tools.product_tools import search_reviews

logger = logging.getLogger("shopmind")

class OrchestratorAgent:
    """Orchestrates workflow with explicit routing, cache safety, and debug telemetry."""
    async def execute(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        agents_used = []
        logs = []
        sources = []
        
        # Step 1: User Interaction Agent Intent Extraction
        logs.append("✓ Step 1 → Understand requirements & extract intent")
        agents_used.append("User Interaction Agent")
        intent = await user_interaction_agent.process_user_query(query, context)
        intent_type = intent.get("intent_type", "full_recommendation")
        
        # Safe Cache Key Computation (Requirement #4 & #5)
        raw_key_str = f"{query.strip().lower()}_{context.get('id', '')}_{intent_type}"
        cache_key = "cache_" + hashlib.sha256(raw_key_str.encode("utf-8")).hexdigest()[:16]
        
        # Check Cache AFTER Intent Extraction
        cached = cache_service.get(cache_key)
        if cached:
            if cached.get("intent", {}).get("intent_type") == intent_type:
                logger.info(f"[CACHE] HIT for key={cache_key} | query='{query}' | intent={intent_type}")
                cached_copy = cached.copy()
                cached_copy["is_cached"] = True
                return cached_copy

        logger.info(f"[CHAT] query='{query}'")
        logger.info(f"[INTENT] intent_type='{intent_type}' | intent={intent}")
        logger.info(f"[CACHE] MISS for key={cache_key}")

        # ROUTING BRANCH 1: Pricing Only Query
        if intent_type == "pricing_only":
            logger.info("[ORCHESTRATOR] Selected agents=['Pricing & Offers Agent']")
            logs.append("✓ Step 2 → Pricing Agent checking active discounts & coupons")
            agents_used.append("Pricing & Offers Agent")
            
            p = self._find_target_product(query, context)
            if p:
                disc_info = pricing_service.get_discount(p["id"])
                orig = disc_info["original_price"]
                disc = disc_info["discount_amount"]
                final_p = disc_info["final_price"]
                
                lines = [
                    f"{p['name']} currently has a discount of ₹{disc:,.0f}.",
                    "",
                    f"• Original Price: ₹{orig:,.0f}",
                    f"• Discount: ₹{disc:,.0f}",
                    f"• **Final Price: ₹{final_p:,.0f}**"
                ]
                answer = "\n".join(lines)
                sources.append({"source": "simulated_pricing_api", "product_id": p["id"], "snippet": disc_info["special_offer"], "score": 1.0})
            else:
                answer = "Discounts are currently available across select items in our catalog. Please specify a product name for exact details."
                
            res = {
                "answer": answer,
                "products": [], # NO unrelated product cards returned
                "agents_used": agents_used,
                "logs": logs,
                "sources": sources,
                "intent": intent,
                "is_cached": False
            }
            cache_service.set(cache_key, res)
            return res

        # ROUTING BRANCH 2: Retrieval Only Query (Reviews / Specs)
        if intent_type == "retrieval_only":
            logger.info("[ORCHESTRATOR] Selected agents=['Retrieval Agent']")
            logs.append("✓ Step 2 → Retrieval Agent searching customer reviews & RAG index")
            agents_used.append("Retrieval Agent")
            
            retrieved_docs = retrieval_agent.retrieve_context(query)
            for doc in retrieved_docs:
                sources.append({
                    "source": doc.get("source", "rag_index"),
                    "product_id": doc.get("product_id"),
                    "snippet": doc.get("text", "")[:120] + "...",
                    "score": doc.get("score", 0.85)
                })
                
            p = self._find_target_product(query, context)
            reviews = search_reviews(product_id=p["id"] if p else None, query=query if not p else None)
            
            if reviews:
                target_title = p["name"] if p else "the product"
                rev_lines = ["Here is what customers say about " + target_title + ":", ""]
                for r in reviews[:3]:
                    rev_lines.append(f"• **{r['user']}** (⭐ {r['rating']}/5): \"{r['headline']}\" — {r['content']}")
                answer = "\n".join(rev_lines)
            elif retrieved_docs:
                answer = f"Retrieved Context for '{query}':\n\n" + "\n\n".join([d['text'] for d in retrieved_docs[:2]])
            else:
                answer = f"Information regarding customer reviews for '{query}' is currently unavailable."
                
            res = {
                "answer": answer,
                "products": [], # NO unrelated product cards returned
                "agents_used": agents_used,
                "logs": logs,
                "sources": sources,
                "intent": intent,
                "is_cached": False
            }
            cache_service.set(cache_key, res)
            return res

        # ROUTING BRANCH 3: Inventory Only Query
        if intent_type == "inventory_only":
            logger.info("[ORCHESTRATOR] Selected agents=['Inventory Agent']")
            logs.append("✓ Step 2 → Inventory Agent checking real-time stock & shipping date")
            agents_used.append("Inventory Agent")
            
            p = self._find_target_product(query, context)
            if p:
                stock_info = inventory_service.check_stock(p["id"])
                deliv_info = delivery_service.get_delivery_estimate(p["id"])
                st_text = "In Stock" if stock_info.get("in_stock") else "Out of Stock"
                deliv_text = deliv_info.get("delivery_estimate", "2 business days")
                
                answer = f"{p['name']} is currently **{st_text}** with an estimated delivery time of **{deliv_text}**."
                sources.append({"source": "simulated_inventory_api", "product_id": p["id"], "snippet": f"{st_text}, {deliv_text}", "score": 1.0})
            else:
                answer = f"Stock Check: Products in our catalog are in stock with express 2-day delivery available."
                
            res = {
                "answer": answer,
                "products": [],
                "agents_used": agents_used,
                "logs": logs,
                "sources": sources,
                "intent": intent,
                "is_cached": False
            }
            cache_service.set(cache_key, res)
            return res

        # ROUTING BRANCH 4: Unknown Query (Clarification Request - Requirement #7)
        if intent_type == "unknown":
            logger.info("[ORCHESTRATOR] Selected intent=unknown -> Clarification Request")
            answer = "I'm not sure whether you want product recommendations, pricing information, stock availability, or customer reviews. Could you please clarify your request?"
            res = {
                "answer": answer,
                "products": [],
                "agents_used": agents_used,
                "logs": logs,
                "sources": [],
                "intent": intent,
                "is_cached": False
            }
            return res

        # ROUTING BRANCH 5: Complex / Full Product Search Recommendation Workflow
        logger.info("[ORCHESTRATOR] Selected agents=['Retrieval Agent', 'Recommendation Agent', 'Pricing & Offers Agent', 'Inventory & Delivery Agent']")
        logs.append("✓ Step 2 → Retrieval Agent searching product knowledge base")
        agents_used.append("Retrieval Agent")
        retrieved_docs = retrieval_agent.retrieve_context(query)
        for doc in retrieved_docs:
            sources.append({
                "source": doc.get("source", "rag_index"),
                "product_id": doc.get("product_id"),
                "snippet": doc.get("text", "")[:120] + "...",
                "score": doc.get("score", 0.8)
            })

        logs.append("✓ Step 3 → Recommendation Agent ranking suitable recommendations")
        agents_used.append("Recommendation Agent")
        recommended_products = recommendation_agent.rank_recommendations(intent, retrieved_docs)

        logs.append("✓ Step 4 → Pricing Agent checking active discounts & coupons")
        agents_used.append("Pricing & Offers Agent")
        products_with_pricing = pricing_agent.process_pricing(recommended_products)

        logs.append("✓ Step 5 → Inventory Agent verifying real-time stock & delivery dates")
        agents_used.append("Inventory & Delivery Agent")
        final_products = inventory_agent.process_inventory(products_with_pricing)

        logs.append("✓ Step 6 → Generating grounded response")
        answer = self._format_grounded_answer(query, final_products, retrieved_docs)

        res = {
            "answer": answer,
            "products": final_products,
            "agents_used": agents_used,
            "logs": logs,
            "sources": sources,
            "intent": intent,
            "is_cached": False
        }
        cache_service.set(cache_key, res)
        return res

    def _find_target_product(self, query: str, context: Dict[str, Any]) -> Any:
        q_lower = query.lower()
        if "samsung" in q_lower or "m14" in q_lower:
            return product_service.get_by_id("P001")
        elif "redmi" in q_lower or "note 13" in q_lower:
            return product_service.get_by_id("P002")
        elif "realme" in q_lower or "narzo" in q_lower:
            return product_service.get_by_id("P003")
        elif "poco" in q_lower:
            return product_service.get_by_id("P004")
        elif "oneplus" in q_lower:
            return product_service.get_by_id("P005")
        elif "macbook" in q_lower:
            return product_service.get_by_id("P006")
        elif "asus" in q_lower or "tuf" in q_lower:
            return product_service.get_by_id("P007")
        elif "lenovo" in q_lower:
            return product_service.get_by_id("P008")
        elif "sony" in q_lower:
            return product_service.get_by_id("P009")
        elif "boat" in q_lower:
            return product_service.get_by_id("P010")
        elif "nike" in q_lower:
            return product_service.get_by_id("P011")
        elif "puma" in q_lower:
            return product_service.get_by_id("P012")
            
        candidates = product_service.search(query=query)
        return candidates[0] if candidates else None

    def _format_grounded_answer(self, query: str, products: List[Dict[str, Any]], docs: List[Dict[str, Any]]) -> str:
        if not products:
            return "I searched our catalog for '" + query + "', but could not find matching products within your criteria. Please try broadening your budget or search terms."
            
        suffix = "s" if len(products) > 1 else ""
        header = f"I found {len(products)} suitable option{suffix} based on your request:"
        lines = [header, ""]
        for idx, p in enumerate(products, 1):
            price = p["price"]
            discount = p["discount"]
            final_p = p["final_price"]
            rating = p["rating"]
            deliv = p.get("inventory_info", {}).get("delivery_estimate", "2 days")
            
            lines.append(f"{idx}. **{p['name']}**")
            lines.append(f"   • Original Price: ₹{price:,}")
            lines.append(f"   • Discount: ₹{discount:,}")
            lines.append(f"   • **Final Price: ₹{final_p:,}**")
            lines.append(f"   • Rating: ⭐ {rating} / 5")
            lines.append(f"   • Delivery: {deliv}")
            lines.append("")
            
        best = products[0]
        lines.append(f"**Best Value Choice**: {best['name']} (Final Price: ₹{best['final_price']:,}, Rating: {best['rating']})")
        return "\n".join(lines)

orchestrator_agent = OrchestratorAgent()

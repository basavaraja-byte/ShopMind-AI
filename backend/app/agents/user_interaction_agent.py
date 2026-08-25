import re
from typing import Dict, Any
from app.llm.provider import llm_service
from app.llm.schemas import UserIntent

class UserInteractionAgent:
    """Agent 1: Accepts query, extracts explicit intent classification & target products."""
    async def process_user_query(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        query_lower = query.lower()
        
        # Follow-up context resolution: "Show cheaper options"
        if "cheaper" in query_lower and context.get("budget"):
            new_budget = float(context["budget"]) * 0.85
            intent_obj = UserIntent(
                intent="cheaper_alternatives",
                category=context.get("category", "mobile"),
                budget=new_budget,
                brand=context.get("brand"),
                requirements=context.get("requirements", []) + ["cheaper option"],
                intent_type="full_recommendation"
            )
            return intent_obj.model_dump()
            
        # Follow-up context resolution: "What about Samsung?"
        if "samsung" in query_lower and ("what about" in query_lower or ("show" in query_lower and not "discount" in query_lower)):
            intent_obj = UserIntent(
                intent="brand_filter",
                category=context.get("category", "mobile"),
                budget=context.get("budget", 20000.0),
                brand="Samsung",
                requirements=context.get("requirements", []),
                intent_type="full_recommendation"
            )
            return intent_obj.model_dump()

        # Strict Intent Classification Rules
        
        # 1. Stock / Inventory Query
        if any(w in query_lower for w in ["stock", "available", "availability", "in stock"]):
            if not ("under" in query_lower or "recommend" in query_lower or "suggest" in query_lower):
                intent_obj = UserIntent(
                    intent="check_inventory",
                    intent_type="inventory_only",
                    brand="Samsung" if "samsung" in query_lower else None
                )
                return intent_obj.model_dump()

        # 2. Pricing / Discount Query
        if any(w in query_lower for w in ["discount", "offer", "coupon", "price of", "cost of"]):
            if not ("under" in query_lower or "recommend" in query_lower or "suggest" in query_lower or "find" in query_lower):
                intent_obj = UserIntent(
                    intent="check_discount",
                    intent_type="pricing_only",
                    brand="Samsung" if "samsung" in query_lower else None
                )
                return intent_obj.model_dump()

        # 3. Retrieval / Reviews Query
        if any(w in query_lower for w in ["say about", "reviews", "customer review", "feedback", "rating", "nfc", "does this phone have"]):
            if not ("under" in query_lower or "recommend" in query_lower or "suggest" in query_lower or "find" in query_lower):
                intent_obj = UserIntent(
                    intent="search_reviews",
                    intent_type="retrieval_only",
                    brand="Samsung" if "samsung" in query_lower else None
                )
                return intent_obj.model_dump()

        # 4. Recommendation Query (e.g., "I need a phone under ₹20,000", "running shoes under 5000")
        if any(w in query_lower for w in ["need", "want", "find", "search", "recommend", "suggest", "under", "below"]):
            category = "mobile"
            if "laptop" in query_lower: category = "laptop"
            elif "shoe" in query_lower or "running" in query_lower: category = "running shoes"
            elif "headphone" in query_lower or "sound" in query_lower: category = "headphones"
            elif "watch" in query_lower: category = "smart watches"
            elif "tablet" in query_lower or "ipad" in query_lower: category = "tablets"

            budget = None
            nums = re.findall(r'\d+(?:,\d+)*', query)
            if nums:
                val = float(nums[0].replace(',', ''))
                if val >= 1000:
                    budget = val

            intent_obj = UserIntent(
                intent="product_recommendation",
                category=category,
                budget=budget,
                intent_type="full_recommendation"
            )
            return intent_obj.model_dump()

        # General LLM Zero-Shot & Few-Shot Intent Extraction
        raw_json = await llm_service.generate_json(query)
        try:
            intent_obj = UserIntent(**raw_json)
        except Exception:
            intent_obj = UserIntent(
                intent="unknown",
                intent_type="unknown"
            )
        return intent_obj.model_dump()

user_interaction_agent = UserInteractionAgent()

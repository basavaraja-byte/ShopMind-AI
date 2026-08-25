from typing import List, Dict, Any
from app.config.settings import settings
from app.services.product_service import product_service

class RecommendationAgent:
    """Filters & ranks products using configurable weights (Requirement #11)."""
    def rank_recommendations(self, intent: Dict[str, Any], retrieved_docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        category = intent.get("category")
        budget = intent.get("budget")
        brand = intent.get("brand")
        reqs = intent.get("requirements", [])
        
        candidates = product_service.search(category=category, max_budget=budget, brand=brand)
        if not candidates and category:
            candidates = product_service.search(category=category)
            
        weights = settings.RANKING_WEIGHTS
        w_budget = weights.get("budget_fit", 0.35)
        w_rating = weights.get("rating", 0.35)
        w_req = weights.get("requirement_match", 0.30)
        
        scored = []
        for p in candidates:
            price = p["price"]
            rating = p["rating"]
            
            # Budget Fit Score
            budget_score = 1.0
            if budget and budget > 0:
                if price <= budget:
                    budget_score = 1.0 - (price / (budget * 1.5))
                else:
                    budget_score = 0.2
            budget_score = max(0.0, min(1.0, budget_score))
            
            # Rating Score
            rating_score = (rating / 5.0)
            
            # Requirement Match Score
            req_score = 0.5
            desc_specs = (p["description"] + " " + str(p.get("specifications", {}))).lower()
            matches = [r for r in reqs if r.lower() in desc_specs]
            if reqs:
                req_score = len(matches) / len(reqs)
                
            total_score = (w_budget * budget_score) + (w_rating * rating_score) + (w_req * req_score)
            
            p["match_score"] = round(total_score * 100, 1)
            p["score_reason"] = f"Budget fit ({round(budget_score*100)}%), Rating {rating}/5, Requirement match ({len(matches)}/{len(reqs)})"
            scored.append((total_score, p))
            
        scored.sort(key=lambda x: x[0], reverse=True)
        return [item for _, item in scored[:3]]

recommendation_agent = RecommendationAgent()

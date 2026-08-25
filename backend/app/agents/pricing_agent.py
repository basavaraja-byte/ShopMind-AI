from typing import List, Dict, Any
from app.tools.pricing_tools import get_discount

class PricingAgent:
    """Checks prices, discounts, and offers for recommended products."""
    def process_pricing(self, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        for p in products:
            offer_data = get_discount(p["id"])
            p["pricing_info"] = offer_data
        return products

pricing_agent = PricingAgent()

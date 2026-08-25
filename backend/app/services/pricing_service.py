from typing import Dict, Any
from app.services.product_service import product_service

class PricingService:
    """Abstract interface for pricing & discounts."""
    def get_discount(self, product_id: str) -> Dict[str, Any]:
        raise NotImplementedError

class SimulatedPricingService(PricingService):
    """Simulated pricing service abstraction."""
    def get_discount(self, product_id: str) -> Dict[str, Any]:
        p = product_service.get_by_id(product_id)
        if not p: return {"error": f"Product '{product_id}' not found"}
        price = p["price"]
        discount = p["discount"]
        return {
            "product_id": p["id"],
            "product_name": p["name"],
            "original_price": price,
            "discount_amount": discount,
            "final_price": price - discount,
            "special_offer": "Instant ₹2,000 promotional offer" if discount >= 2000 else "Standard catalog discount",
            "service_label": "Simulated Pricing API"
        }

pricing_service = SimulatedPricingService()

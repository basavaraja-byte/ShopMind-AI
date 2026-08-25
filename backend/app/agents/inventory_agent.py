from typing import List, Dict, Any
from app.tools.inventory_tools import check_stock, get_delivery_estimate

class InventoryAgent:
    """Checks stock availability and fast delivery estimates."""
    def process_inventory(self, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        for p in products:
            stock = check_stock(p["id"])
            delivery = get_delivery_estimate(p["id"])
            p["inventory_info"] = {
                "in_stock": stock.get("in_stock", True),
                "status": stock.get("status", "In Stock"),
                "delivery_estimate": delivery.get("delivery_estimate", "2 business days")
            }
        return products

inventory_agent = InventoryAgent()

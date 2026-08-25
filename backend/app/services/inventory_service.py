from typing import Dict, Any
from app.services.product_service import product_service

class InventoryService:
    """Abstract interface for inventory checking."""
    def check_stock(self, product_id: str) -> Dict[str, Any]:
        raise NotImplementedError

class SimulatedInventoryService(InventoryService):
    """Simulated real-time inventory service abstraction."""
    def check_stock(self, product_id: str) -> Dict[str, Any]:
        p = product_service.get_by_id(product_id)
        if not p: return {"error": f"Product '{product_id}' not found"}
        return {
            "product_id": p["id"],
            "product_name": p["name"],
            "in_stock": bool(p["stock"]),
            "status": "In Stock" if p["stock"] else "Out of Stock",
            "service_label": "Simulated Inventory API"
        }

inventory_service = SimulatedInventoryService()

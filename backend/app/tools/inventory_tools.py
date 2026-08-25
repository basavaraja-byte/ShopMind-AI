from typing import Dict, Any
from app.tools.product_tools import get_product_details

def check_stock(product_id: str) -> Dict[str, Any]:
    """Check real-time stock availability for a product."""
    product = get_product_details(product_id)
    if not product:
        return {"error": f"Product '{product_id}' not found."}
        
    return {
        "product_id": product["id"],
        "product_name": product["name"],
        "in_stock": bool(product["stock"]),
        "status": "In Stock" if product["stock"] else "Out of Stock"
    }

def get_delivery_estimate(product_id: str) -> Dict[str, Any]:
    """Get estimated delivery time and availability."""
    product = get_product_details(product_id)
    if not product:
        return {"error": f"Product '{product_id}' not found."}
        
    days = product["delivery_days"]
    return {
        "product_id": product["id"],
        "product_name": product["name"],
        "delivery_days": days,
        "delivery_estimate": f"{days} business days",
        "express_shipping": "Available" if days <= 2 else "Standard shipping"
    }

from typing import Dict, Any, Optional
from app.tools.product_tools import get_product_details

def get_discount(product_id: str) -> Dict[str, Any]:
    """Calculate original price, discount amount, net price and promotional offers."""
    product = get_product_details(product_id)
    if not product:
        return {"error": f"Product '{product_id}' not found."}
        
    price = product["price"]
    discount = product["discount"]
    final_price = price - discount
    discount_pct = round((discount / price) * 100, 1) if price > 0 else 0
    
    return {
        "product_id": product["id"],
        "product_name": product["name"],
        "original_price": price,
        "discount_amount": discount,
        "discount_percentage": f"{discount_pct}%",
        "final_price": final_price,
        "special_offer": "Instant ₹2,000 discount applied" if discount >= 2000 else "Standard discount"
    }

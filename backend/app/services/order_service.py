import random
import string
from typing import List, Dict, Any, Optional
from datetime import datetime

class OrderService:
    """
    Simulated Order & Checkout service for ShopMind AI.
    Handles order creation, promo code validation, tax/shipping calculations,
    and order status lookup.
    """

    PROMO_CODES = {
        "SHOPMIND10": {"discount_percent": 10, "description": "10% off entire order"},
        "AIWELCOME": {"flat_discount": 1000, "description": "₹1,000 off new user discount"},
        "FREESHIP": {"free_shipping": True, "description": "Free Express Delivery"}
    }

    def __init__(self):
        self.orders: Dict[str, Dict[str, Any]] = {}

    @staticmethod
    def generate_order_id() -> str:
        digits = ''.join(random.choices(string.digits, k=5))
        return f"ORD-{digits}"

    def validate_promo(self, code: str) -> Optional[Dict[str, Any]]:
        code_upper = code.strip().upper()
        if code_upper in self.PROMO_CODES:
            return {"code": code_upper, **self.PROMO_CODES[code_upper]}
        return None

    def create_order(
        self,
        items: List[Dict[str, Any]],
        shipping_address: Dict[str, str],
        payment_method: str = "Credit Card",
        promo_code: Optional[str] = None
    ) -> Dict[str, Any]:
        order_id = self.generate_order_id()
        
        # Calculate subtotal
        subtotal = 0.0
        processed_items = []
        for item in items:
            unit_price = float(item.get("final_price") or item.get("price", 0))
            qty = int(item.get("quantity", 1))
            line_total = unit_price * qty
            subtotal += line_total
            processed_items.append({
                "product_id": item.get("id"),
                "name": item.get("name"),
                "brand": item.get("brand"),
                "unit_price": unit_price,
                "quantity": qty,
                "line_total": line_total
            })

        # Process promo discount
        discount_amount = 0.0
        promo_info = None
        shipping_fee = 150.0 if subtotal < 50000 else 0.0 # Free shipping above ₹50k default

        if promo_code:
            valid_promo = self.validate_promo(promo_code)
            if valid_promo:
                promo_info = valid_promo
                if "discount_percent" in valid_promo:
                    discount_amount = (subtotal * valid_promo["discount_percent"]) / 100.0
                elif "flat_discount" in valid_promo:
                    discount_amount = min(subtotal, float(valid_promo["flat_discount"]))
                elif valid_promo.get("free_shipping"):
                    shipping_fee = 0.0

        tax = round((subtotal - discount_amount) * 0.18, 2) # 18% GST standard
        total_payable = round(max(0.0, subtotal - discount_amount + shipping_fee + tax), 2)

        order_record = {
            "order_id": order_id,
            "status": "Confirmed",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "items": processed_items,
            "shipping_address": shipping_address,
            "payment_method": payment_method,
            "subtotal": round(subtotal, 2),
            "discount": round(discount_amount, 2),
            "shipping_fee": round(shipping_fee, 2),
            "tax": tax,
            "total_payable": total_payable,
            "estimated_delivery": "2-3 Business Days",
            "promo_applied": promo_info["code"] if promo_info else None
        }

        self.orders[order_id] = order_record
        return order_record

    def get_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        return self.orders.get(order_id.upper())

    def list_orders(self) -> List[Dict[str, Any]]:
        return list(self.orders.values())

order_service = OrderService()

import os
import logging
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config.settings import settings
from app.db.database import seed_db_if_empty
from app.agents.orchestrator_agent import orchestrator_agent
from app.memory.conversation import memory_manager
from app.services.product_service import product_service
from app.services.pricing_service import pricing_service
from app.services.inventory_service import inventory_service
from app.services.delivery_service import delivery_service
from app.services.feedback_service import feedback_service
from app.services.order_service import order_service
from app.tools.product_tools import search_reviews
from app.llm.schemas import FeedbackRequest

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("shopmind")

seed_db_if_empty()

app = FastAPI(
    title="ShopMind AI API",
    description="Intelligent Multi-Agent E-Commerce Assistant API",
    version="1.2.0"
)

# Configurable Production CORS Origins
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class SearchRequest(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    max_budget: Optional[float] = None
    min_rating: Optional[float] = None
    brand: Optional[str] = None

class CompareRequest(BaseModel):
    product_ids: List[str]

class OrderItemSchema(BaseModel):
    id: str
    name: str
    brand: Optional[str] = ""
    price: float
    final_price: Optional[float] = None
    quantity: int = 1

class ShippingAddressSchema(BaseModel):
    name: str
    email: str
    address: str
    city: str
    zip_code: str

class CheckoutRequest(BaseModel):
    items: List[OrderItemSchema]
    shipping_address: ShippingAddressSchema
    payment_method: Optional[str] = "Credit Card"
    promo_code: Optional[str] = None

class ValidatePromoRequest(BaseModel):
    code: str

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": "ShopMind AI",
        "version": "1.2.0",
        "llm_provider": settings.LLM_PROVIDER,
        "database": "sqlite_connected",
        "rag": "ready",
        "env": settings.ENV
    }

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    conv = memory_manager.get_or_create_conversation(req.conversation_id)
    conversation_id = conv["id"]
    context = conv["context"]
    
    memory_manager.add_message(conversation_id, "user", req.message)
    result = await orchestrator_agent.execute(req.message, context)
    
    if result.get("intent"):
        memory_manager.update_context(conversation_id, result["intent"])
        
    memory_manager.add_message(conversation_id, "assistant", result["answer"], {"products": result["products"]})
    
    return {
        "answer": result["answer"],
        "products": result["products"],
        "agents_used": result["agents_used"],
        "logs": result["logs"],
        "sources": result.get("sources", []),
        "is_cached": result.get("is_cached", False),
        "conversation_id": conversation_id
    }

@app.post("/api/feedback")
async def record_feedback(req: FeedbackRequest):
    return feedback_service.store_feedback(
        conversation_id=req.conversation_id,
        message_id=req.message_id,
        rating=req.rating,
        comment=req.comment
    )

@app.get("/api/products")
async def list_products(category: Optional[str] = None):
    return product_service.search(category=category)

@app.get("/api/products/{id}")
async def get_product(id: str):
    p = product_service.get_by_id(id)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p

@app.post("/api/products/search")
async def search_products_endpoint(req: SearchRequest):
    return product_service.search(
        query=req.query, category=req.category, max_budget=req.max_budget, min_rating=req.min_rating, brand=req.brand
    )

@app.post("/api/products/compare")
async def compare_products_endpoint(req: CompareRequest):
    items = []
    for pid in req.product_ids:
        details = product_service.get_by_id(pid)
        if details: items.append(details)
    return {"products": items}

@app.get("/api/products/{id}/reviews")
async def get_product_reviews(id: str):
    return search_reviews(product_id=id)

@app.get("/api/products/{id}/offers")
async def get_product_offers(id: str):
    return pricing_service.get_discount(id)

@app.get("/api/products/{id}/inventory")
async def get_product_inventory(id: str):
    stock = inventory_service.check_stock(id)
    delivery = delivery_service.get_delivery_estimate(id)
    return {"stock": stock, "delivery": delivery}

# Cart & Order Management Endpoints
@app.post("/api/cart/validate-promo")
async def validate_promo_endpoint(req: ValidatePromoRequest):
    promo = order_service.validate_promo(req.code)
    if not promo:
        raise HTTPException(status_code=400, detail="Invalid or expired promo code.")
    return promo

@app.post("/api/cart/checkout")
async def checkout_endpoint(req: CheckoutRequest):
    if not req.items:
        raise HTTPException(status_code=400, detail="Cart cannot be empty.")
    
    order = order_service.create_order(
        items=[item.model_dump() for item in req.items],
        shipping_address=req.shipping_address.model_dump(),
        payment_method=req.payment_method,
        promo_code=req.promo_code
    )
    return order

@app.get("/api/orders")
async def list_orders_endpoint():
    return order_service.list_orders()

@app.get("/api/orders/{order_id}")
async def get_order_endpoint(order_id: str):
    order = order_service.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", settings.PORT))
    uvicorn.run("app.main:app", host=settings.HOST, port=port, reload=True)

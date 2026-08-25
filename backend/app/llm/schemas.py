from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class UserIntent(BaseModel):
    intent: str = Field(default="product_recommendation", description="Primary query intent classification")
    category: Optional[str] = Field(default=None, description="Extracted product category")
    budget: Optional[float] = Field(default=None, description="Max budget constraint in INR")
    brand: Optional[str] = Field(default=None, description="Target brand preference")
    requirements: List[str] = Field(default_factory=list, description="List of feature requirements")
    intent_type: str = Field(default="full_recommendation", description="Routing type: full_recommendation, inventory_only, pricing_only, retrieval_only")

class AgentDecision(BaseModel):
    selected_agents: List[str]
    routing_reason: str

class RecommendationResult(BaseModel):
    product_id: str
    match_score: float
    score_reason: str

class PricingResult(BaseModel):
    product_id: str
    original_price: float
    discount_amount: float
    final_price: float
    special_offer: str

class InventoryResult(BaseModel):
    product_id: str
    in_stock: bool
    status: str
    delivery_estimate: str

class SourceItem(BaseModel):
    source: str
    product_id: Optional[str] = None
    snippet: str
    score: float = 0.0

class FinalResponse(BaseModel):
    answer: str
    products: List[Dict[str, Any]]
    agents_used: List[str]
    logs: List[str]
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    conversation_id: str
    is_cached: bool = False

class FeedbackRequest(BaseModel):
    conversation_id: str
    message_id: Optional[str] = None
    rating: str # 'positive' or 'negative'
    comment: Optional[str] = None

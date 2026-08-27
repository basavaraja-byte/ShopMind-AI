import pytest
import asyncio
from app.db.database import seed_db_if_empty
from app.agents.orchestrator_agent import orchestrator_agent
from app.memory.conversation import memory_manager
from app.services.cache_service import cache_service
from app.services.order_service import order_service

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    seed_db_if_empty()
    cache_service.clear()

@pytest.mark.asyncio
async def test_a_inventory_only():
    res = await orchestrator_agent.execute("Is Samsung Galaxy M14 in stock?", {})
    assert res["agents_used"] == ["User Interaction Agent", "Inventory Agent"]
    assert res["products"] == []
    assert "In Stock" in res["answer"]

@pytest.mark.asyncio
async def test_b_pricing_only():
    res = await orchestrator_agent.execute("Is there a discount on Samsung Galaxy M14?", {})
    assert res["agents_used"] == ["User Interaction Agent", "Pricing & Offers Agent"]
    assert res["products"] == []
    assert "12,000" in res["answer"] or "16,999" in res["answer"]

@pytest.mark.asyncio
async def test_c_retrieval_only():
    res = await orchestrator_agent.execute("What do customers say about Samsung Galaxy M14?", {})
    assert res["agents_used"] == ["User Interaction Agent", "Retrieval Agent"]
    assert res["products"] == [] # Must NOT return unrelated products!
    assert "Rahul M." in res["answer"] or "camera" in res["answer"].lower()

@pytest.mark.asyncio
async def test_d_recommendation_workflow():
    res = await orchestrator_agent.execute("I need a phone under 120,000", {})
    assert "Recommendation Agent" in res["agents_used"]
    assert len(res["products"]) > 0

@pytest.mark.asyncio
async def test_e_complex_multi_agent():
    query = "I need a phone under 120,000 with good camera, good reviews, discount and fast delivery."
    res = await orchestrator_agent.execute(query, {})
    assert len(res["agents_used"]) >= 4
    assert len(res["products"]) > 0

@pytest.mark.asyncio
async def test_f_running_shoes():
    res = await orchestrator_agent.execute("I need running shoes under 15,000.", {})
    assert "Recommendation Agent" in res["agents_used"]
    assert any(p["category"] == "running shoes" for p in res["products"])

@pytest.mark.asyncio
async def test_sequential_cache_safety():
    cache_service.clear()
    
    # 1. Pricing query -> Cache MISS
    r1 = await orchestrator_agent.execute("Is there a discount on Samsung Galaxy M14?", {"id": "s1"})
    assert r1["is_cached"] is False
    assert "Pricing & Offers Agent" in r1["agents_used"]
    
    # 2. Retrieval query -> Cache MISS (Must NOT return pricing cache!)
    r2 = await orchestrator_agent.execute("What do customers say about Samsung Galaxy M14?", {"id": "s1"})
    assert r2["is_cached"] is False
    assert "Retrieval Agent" in r2["agents_used"]
    
    # 3. Inventory query -> Cache MISS
    r3 = await orchestrator_agent.execute("Is Samsung Galaxy M14 in stock?", {"id": "s1"})
    assert r3["is_cached"] is False
    assert "Inventory Agent" in r3["agents_used"]
    
    # 4. Repeat Pricing query -> Cache HIT ONLY for Pricing!
    r4 = await orchestrator_agent.execute("Is there a discount on Samsung Galaxy M14?", {"id": "s1"})
    assert r4["is_cached"] is True
    assert "Pricing & Offers Agent" in r4["agents_used"]
    assert r4["products"] == []

def test_promo_validation():
    p1 = order_service.validate_promo("SHOPMIND10")
    assert p1 is not None
    assert p1["discount_percent"] == 10
    
    p2 = order_service.validate_promo("INVALIDCODE")
    assert p2 is None

def test_order_creation():
    items = [{
        "id": "prod_1",
        "name": "Samsung Galaxy M14 5G",
        "brand": "Samsung",
        "price": 16999,
        "final_price": 14999,
        "quantity": 2
    }]
    address = {
        "name": "John Doe",
        "email": "john@example.com",
        "address": "123 Tech Lane",
        "city": "Bengaluru",
        "zip_code": "560001"
    }
    order = order_service.create_order(
        items=items,
        shipping_address=address,
        payment_method="UPI",
        promo_code="SHOPMIND10"
    )
    assert order["order_id"].startswith("ORD-")
    assert order["status"] == "Confirmed"
    assert order["subtotal"] == 29998.0
    assert order["discount"] == 2999.8
    assert order["payment_method"] == "UPI"
    assert order_service.get_order(order["order_id"]) is not None

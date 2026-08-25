import pytest
import asyncio
from app.db.database import seed_db_if_empty
from app.agents.orchestrator_agent import orchestrator_agent
from app.memory.conversation import memory_manager
from app.services.cache_service import cache_service

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
    assert "₹2,000" in res["answer"]
    assert "₹16,999" in res["answer"]

@pytest.mark.asyncio
async def test_c_retrieval_only():
    res = await orchestrator_agent.execute("What do customers say about Samsung Galaxy M14?", {})
    assert res["agents_used"] == ["User Interaction Agent", "Retrieval Agent"]
    assert res["products"] == [] # Must NOT return unrelated products!
    assert "Rahul M." in res["answer"] or "camera" in res["answer"].lower()

@pytest.mark.asyncio
async def test_d_recommendation_workflow():
    res = await orchestrator_agent.execute("I need a phone under ₹20,000", {})
    assert "Recommendation Agent" in res["agents_used"]
    assert len(res["products"]) > 0

@pytest.mark.asyncio
async def test_e_complex_multi_agent():
    query = "I need a phone under ₹20,000 with good camera, good reviews, discount and fast delivery."
    res = await orchestrator_agent.execute(query, {})
    assert len(res["agents_used"]) >= 4
    assert len(res["products"]) > 0

@pytest.mark.asyncio
async def test_f_running_shoes():
    res = await orchestrator_agent.execute("I need running shoes under ₹5,000.", {})
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

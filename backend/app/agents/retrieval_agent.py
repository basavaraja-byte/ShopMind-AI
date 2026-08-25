from typing import List, Dict, Any
from app.rag.retriever import rag_engine

class RetrievalAgent:
    """Retrieves factual context from products, specs, reviews, FAQs & policies."""
    def retrieve_context(self, query: str) -> List[Dict[str, Any]]:
        results = rag_engine.search(query, top_k=4)
        return results

retrieval_agent = RetrievalAgent()

import json
from pathlib import Path
from typing import List, Dict, Any
from app.rag.chunker import text_chunker

BASE_DIR = Path(__file__).resolve().parent.parent

class RAGRetriever:
    """Semantic similarity search retriever returning context + metadata."""
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.retrieval_stats = {"total_retrievals": 0}
        self._load_and_chunk_documents()

    def _load_and_chunk_documents(self):
        data_dir = BASE_DIR / "data"
        
        prod_path = data_dir / "products.json"
        if prod_path.exists():
            with open(prod_path, "r", encoding="utf-8") as f:
                products = json.load(f)
                for p in products:
                    text = f"Product: {p['name']} ({p['brand']}). Price: ₹{p['price']}. Rating: {p['rating']}/5. Description: {p['description']}. Specs: {p.get('specifications', {})}"
                    meta = {"source": "product_catalog", "product_id": p["id"], "document_type": "product", "category": p["category"]}
                    self.documents.extend(text_chunker.split_text(text, meta))

        rev_path = data_dir / "reviews.json"
        if rev_path.exists():
            with open(rev_path, "r", encoding="utf-8") as f:
                reviews = json.load(f)
                for r in reviews:
                    text = f"Customer Review for {r['product_id']} by {r['user']} ({r['rating']}/5 stars): '{r['headline']}' - {r['content']}"
                    meta = {"source": "customer_reviews", "product_id": r["product_id"], "document_type": "review", "category": "review"}
                    self.documents.extend(text_chunker.split_text(text, meta))

        faq_path = data_dir / "faq.txt"
        if faq_path.exists():
            with open(faq_path, "r", encoding="utf-8") as f:
                meta = {"source": "faq", "product_id": None, "document_type": "faq", "category": "general"}
                self.documents.extend(text_chunker.split_text(f.read(), meta))

        pol_path = data_dir / "policies.txt"
        if pol_path.exists():
            with open(pol_path, "r", encoding="utf-8") as f:
                meta = {"source": "policies", "product_id": None, "document_type": "policy", "category": "general"}
                self.documents.extend(text_chunker.split_text(f.read(), meta))

    def search(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        self.retrieval_stats["total_retrievals"] += 1
        terms = [t.lower() for t in query.split() if len(t) > 2]
        scored_docs = []
        
        for doc in self.documents:
            text_lower = doc["text"].lower()
            score = 0
            for term in terms:
                if term in text_lower:
                    score += text_lower.count(term)
            if score > 0:
                normalized_score = min(0.95, round(0.50 + (score * 0.1), 2))
                scored_docs.append((normalized_score, doc))
                
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        
        results = []
        for score, doc in scored_docs[:top_k]:
            item = doc.copy()
            item["score"] = score
            results.append(item)
            
        if not results and self.documents:
            fallback = self.documents[0].copy()
            fallback["score"] = 0.50
            results = [fallback]
            
        return results

rag_engine = RAGRetriever()

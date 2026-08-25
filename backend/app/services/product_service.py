import json, sqlite3
from typing import List, Dict, Any, Optional
from app.db.database import get_db_connection

class ProductService:
    """Abstract interface for product data services."""
    def search(self, query=None, category=None, max_budget=None, min_rating=None, brand=None) -> List[Dict[str, Any]]:
        raise NotImplementedError
    def get_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        raise NotImplementedError

class SQLiteProductService(ProductService):
    """SQLite Product Service Implementation over prototype catalog."""
    def search(self, query=None, category=None, max_budget=None, min_rating=None, brand=None) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = "SELECT * FROM products WHERE 1=1"
        params = []
        
        if category:
            sql += " AND LOWER(category) LIKE ?"
            params.append(f"%{category.lower()}%")
        if brand:
            sql += " AND LOWER(brand) LIKE ?"
            params.append(f"%{brand.lower()}%")
        if max_budget is not None:
            sql += " AND price <= ?"
            params.append(max_budget)
        if min_rating is not None:
            sql += " AND rating >= ?"
            params.append(min_rating)
        if query:
            sql += " AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)"
            params.extend([f"%{query.lower()}%", f"%{query.lower()}%"])
            
        sql += " ORDER BY rating DESC"
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        
        results = []
        for r in rows:
            item = dict(r)
            if item.get("specifications"):
                try: item["specifications"] = json.loads(item["specifications"])
                except Exception: pass
            item["final_price"] = item["price"] - item["discount"]
            item["data_source_label"] = "Prototype Catalog Data"
            results.append(item)
        conn.close()
        return results

    def get_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ? OR LOWER(name) LIKE ?", (product_id, f"%{product_id.lower()}%"))
        row = cursor.fetchone()
        conn.close()
        if not row: return None
        item = dict(row)
        if item.get("specifications"):
            try: item["specifications"] = json.loads(item["specifications"])
            except Exception: pass
        item["final_price"] = item["price"] - item["discount"]
        item["data_source_label"] = "Prototype Catalog Data"
        return item

product_service = SQLiteProductService()

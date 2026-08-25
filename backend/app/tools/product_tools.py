import json
import sqlite3
from typing import List, Dict, Any, Optional
from app.db.database import get_db_connection

def search_products(
    query: Optional[str] = None,
    category: Optional[str] = None,
    max_budget: Optional[float] = None,
    min_rating: Optional[float] = None,
    brand: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Search catalog products with filters (category, budget, rating, brand)."""
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
            try:
                item["specifications"] = json.loads(item["specifications"])
            except Exception:
                pass
        item["final_price"] = item["price"] - item["discount"]
        results.append(item)
        
    conn.close()
    return results

def get_product_details(product_id: str) -> Optional[Dict[str, Any]]:
    """Fetch complete specifications and pricing for a product ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ? OR LOWER(name) LIKE ?", (product_id, f"%{product_id.lower()}%"))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    item = dict(row)
    if item.get("specifications"):
        try:
            item["specifications"] = json.loads(item["specifications"])
        except Exception:
            pass
    item["final_price"] = item["price"] - item["discount"]
    return item

def search_reviews(product_id: Optional[str] = None, query: Optional[str] = None) -> List[Dict[str, Any]]:
    """Search customer reviews for specific products or keywords."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sql = "SELECT r.*, p.name as product_name FROM reviews r JOIN products p ON r.product_id = p.id WHERE 1=1"
    params = []
    
    if product_id:
        sql += " AND (r.product_id = ? OR LOWER(p.name) LIKE ?)"
        params.extend([product_id, f"%{product_id.lower()}%"])
        
    if query:
        sql += " AND (LOWER(r.headline) LIKE ? OR LOWER(r.content) LIKE ?)"
        params.extend([f"%{query.lower()}%", f"%{query.lower()}%"])
        
    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(r) for r in rows]

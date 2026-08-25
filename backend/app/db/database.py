import json
import sqlite3
from pathlib import Path
from app.config.settings import settings

BASE_DIR = Path(__file__).resolve().parent.parent

def get_db_path() -> str:
    if "sqlite:///" in settings.DATABASE_URL:
        db_rel = settings.DATABASE_URL.replace("sqlite:///", "")
        return str(BASE_DIR.parent / db_rel) if db_rel.startswith("./") else db_rel
    return settings.DATABASE_URL

def get_db_connection():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            brand TEXT NOT NULL,
            price REAL NOT NULL,
            rating REAL NOT NULL,
            stock BOOLEAN NOT NULL,
            delivery_days INTEGER NOT NULL,
            discount REAL NOT NULL,
            description TEXT,
            specifications TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT NOT NULL,
            rating INTEGER NOT NULL,
            user TEXT NOT NULL,
            headline TEXT NOT NULL,
            content TEXT NOT NULL,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            context TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            data TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id TEXT NOT NULL,
            message_id TEXT,
            rating TEXT NOT NULL,
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def seed_db_if_empty():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as count FROM products")
    row = cursor.fetchone()
    if row["count"] == 0:
        data_dir = BASE_DIR / "data"
        products_file = data_dir / "products.json"
        reviews_file = data_dir / "reviews.json"
        
        if products_file.exists():
            with open(products_file, "r", encoding="utf-8") as f:
                products = json.load(f)
                for p in products:
                    cursor.execute('''
                        INSERT INTO products (id, name, category, brand, price, rating, stock, delivery_days, discount, description, specifications)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        p["id"], p["name"], p["category"], p["brand"], p["price"],
                        p["rating"], p["stock"], p["delivery_days"], p["discount"],
                        p["description"], json.dumps(p.get("specifications", {}))
                    ))
                    
        if reviews_file.exists():
            with open(reviews_file, "r", encoding="utf-8") as f:
                reviews = json.load(f)
                for r in reviews:
                    cursor.execute('''
                        INSERT INTO reviews (product_id, rating, user, headline, content)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (r["product_id"], r["rating"], r["user"], r["headline"], r["content"]))
                    
        conn.commit()
        print("Database seeded with mock catalog & reviews.")
        
    conn.close()

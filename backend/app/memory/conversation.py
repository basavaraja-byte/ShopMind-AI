import json
import uuid
import sqlite3
from typing import Dict, Any, Optional
from app.db.database import get_db_connection

class ConversationManager:
    """Session-based memory store tracking conversation history & context."""
    def get_or_create_conversation(self, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if conversation_id:
            cursor.execute("SELECT * FROM conversations WHERE id = ?", (conversation_id,))
            row = cursor.fetchone()
            if row:
                conn.close()
                ctx = json.loads(row["context"]) if row["context"] else {}
                return {"id": row["id"], "context": ctx}

        new_id = conversation_id or str(uuid.uuid4())[:8]
        cursor.execute("INSERT OR REPLACE INTO conversations (id, context) VALUES (?, ?)", (new_id, json.dumps({})))
        conn.commit()
        conn.close()
        return {"id": new_id, "context": {}}

    def update_context(self, conversation_id: str, new_context: Dict[str, Any]):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT context FROM conversations WHERE id = ?", (conversation_id,))
        row = cursor.fetchone()
        
        existing = {}
        if row and row["context"]:
            existing = json.loads(row["context"])
            
        existing.update(new_context)
        cursor.execute("UPDATE conversations SET context = ? WHERE id = ?", (json.dumps(existing), conversation_id))
        conn.commit()
        conn.close()

    def add_message(self, conversation_id: str, sender: str, message: str, data: Optional[Dict[str, Any]] = None):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO messages (conversation_id, sender, message, data) VALUES (?, ?, ?, ?)",
            (conversation_id, sender, message, json.dumps(data) if data else None)
        )
        conn.commit()
        conn.close()

memory_manager = ConversationManager()

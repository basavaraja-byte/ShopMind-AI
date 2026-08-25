import sqlite3
from typing import Dict, Any
from app.db.database import get_db_connection

class FeedbackService:
    """User feedback logging service (Requirement #10)."""
    def store_feedback(self, conversation_id: str, message_id: str, rating: str, comment: str = None) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
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
        cursor.execute(
            "INSERT INTO feedback (conversation_id, message_id, rating, comment) VALUES (?, ?, ?, ?)",
            (conversation_id, message_id, rating, comment)
        )
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Feedback recorded."}

feedback_service = FeedbackService()

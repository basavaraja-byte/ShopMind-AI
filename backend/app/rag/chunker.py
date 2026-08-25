from typing import List, Dict, Any
from app.config.settings import settings

class RecursiveTextChunker:
    """Explicit chunking strategy preserving semantic boundaries & metadata (Requirement #4)."""
    def __init__(self, chunk_size: int = settings.CHUNK_SIZE, chunk_overlap: int = settings.CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_text(self, text: str, base_metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        chunks = []
        if not text:
            return chunks
            
        paragraphs = text.split("\n\n")
        current_chunk = ""
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            if len(current_chunk) + len(para) <= self.chunk_size:
                current_chunk += ("\n\n" if current_chunk else "") + para
            else:
                if current_chunk:
                    chunk_meta = base_metadata.copy()
                    chunk_meta["text"] = current_chunk
                    chunks.append(chunk_meta)
                current_chunk = para
                
        if current_chunk:
            chunk_meta = base_metadata.copy()
            chunk_meta["text"] = current_chunk
            chunks.append(chunk_meta)
            
        return chunks

text_chunker = RecursiveTextChunker()

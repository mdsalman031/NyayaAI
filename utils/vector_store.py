"""
Vector Store — FAISS-based semantic search for case summaries.
Falls back to in-memory if FAISS not installed.
"""

import json
from typing import List, Dict


class VectorStore:
    """
    Semantic search over case summaries.
    Uses FAISS + sentence-transformers if available, 
    otherwise falls back to TF-IDF in-memory store.
    """

    def __init__(self):
        self.use_faiss = False
        self.memory_store: List[Dict] = []  # Fallback store

        try:
            import faiss
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
            self.dimension = 384
            self.index = faiss.IndexFlatL2(self.dimension)
            self.id_map: List[str] = []
            self.data_map: List[dict] = []
            self.use_faiss = True
            print("[vector] FAISS vector store initialized")
        except ImportError:
            print("[vector] FAISS not available. Using in-memory fallback.")

    def add(self, case_id: str, text: str, metadata: dict):
        """Add a case to the vector store."""
        if self.use_faiss:
            import numpy as np
            embedding = self.model.encode([text])[0]
            self.index.add(np.array([embedding], dtype="float32"))
            self.id_map.append(case_id)
            self.data_map.append({
                "id": case_id,
                "text": text[:200],
                "case_title": metadata.get("case_title", ""),
                "court": metadata.get("court", ""),
                "year": metadata.get("year", ""),
            })
        else:
            # Fallback: keyword store
            self.memory_store.append({
                "id": case_id,
                "text": text.lower(),
                "case_title": metadata.get("case_title", ""),
                "court": metadata.get("court", ""),
                "year": metadata.get("year", ""),
            })

    def search(self, query: str, top_k: int = 5) -> List[dict]:
        """Search for semantically similar cases."""
        if self.use_faiss and len(self.id_map) > 0:
            import numpy as np
            query_embedding = self.model.encode([query])[0]
            distances, indices = self.index.search(
                np.array([query_embedding], dtype="float32"), 
                min(top_k, len(self.id_map))
            )
            results = []
            for idx, dist in zip(indices[0], distances[0]):
                if idx < len(self.data_map):
                    item = self.data_map[idx].copy()
                    item["score"] = float(1 / (1 + dist))
                    results.append(item)
            return results

        # Fallback: keyword match
        query_lower = query.lower()
        results = []
        for item in self.memory_store:
            if any(word in item["text"] for word in query_lower.split()):
                results.append({
                    "id": item["id"],
                    "case_title": item["case_title"],
                    "court": item["court"],
                    "year": item["year"],
                    "score": 0.5,
                })
        return results[:top_k]

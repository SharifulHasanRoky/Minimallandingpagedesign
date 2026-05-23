"""Local vector store using Chroma + free embeddings.

Embedding strategy (free, in this order):
1. sentence-transformers/all-MiniLM-L6-v2  (downloaded once, ~80MB, fast)
2. Falls back to a deterministic hashing-trick embedder so the system
   ALWAYS works even with no internet on first run. Quality is poor,
   but recall still beats nothing and the API stays stable.

The collection is persisted under data/chroma/.
"""

from __future__ import annotations

import hashlib
import math
from threading import Lock
from typing import Any

from ..logging import get_logger
from ..settings import settings

log = get_logger("memory.vector")

_COLLECTION = "coworker_memory"
_DIM = 384  # MiniLM dim; the hash fallback also produces 384-dim vectors


class _HashEmbedder:
    """Deterministic, dependency-free fallback. Token-bag hashed into 384-dim L2-normalized vec."""

    def encode(self, texts: list[str]) -> list[list[float]]:
        out: list[list[float]] = []
        for t in texts:
            vec = [0.0] * _DIM
            for tok in (t or "").lower().split():
                h = int(hashlib.md5(tok.encode("utf-8")).hexdigest(), 16)
                idx = h % _DIM
                sign = 1.0 if (h >> 32) & 1 else -1.0
                vec[idx] += sign
            norm = math.sqrt(sum(v * v for v in vec)) or 1.0
            out.append([v / norm for v in vec])
        return out


class VectorStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._client = None
        self._collection = None
        self._embedder: Any | None = None
        self._embedder_kind: str = "uninitialized"

    def _ensure(self) -> None:
        if self._collection is not None:
            return
        with self._lock:
            if self._collection is not None:
                return
            try:
                import chromadb
                from chromadb.config import Settings as ChromaSettings

                self._client = chromadb.PersistentClient(
                    path=str(settings.chroma_dir),
                    settings=ChromaSettings(anonymized_telemetry=False),
                )
                self._collection = self._client.get_or_create_collection(
                    name=_COLLECTION,
                    metadata={"hnsw:space": "cosine"},
                )
            except Exception as e:  # noqa: BLE001
                log.warning("chroma.unavailable", err=str(e)[:200])
                self._client = None
                self._collection = None

            # Try MiniLM, fall back to hash embedder.
            try:
                from sentence_transformers import SentenceTransformer

                model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

                class _STEmbedder:
                    def encode(self, texts: list[str]) -> list[list[float]]:
                        return model.encode(texts, normalize_embeddings=True).tolist()

                self._embedder = _STEmbedder()
                self._embedder_kind = "sentence-transformers/all-MiniLM-L6-v2"
            except Exception as e:  # noqa: BLE001
                log.info("embedder.fallback_to_hash", reason=str(e)[:200])
                self._embedder = _HashEmbedder()
                self._embedder_kind = "hash-fallback"

    # ── Public API ─────────────────────────────────────────────────────
    def info(self) -> dict[str, Any]:
        self._ensure()
        return {
            "embedder": self._embedder_kind,
            "dim": _DIM,
            "collection": _COLLECTION,
            "ready": self._collection is not None,
        }

    def upsert(self, doc_id: str, text: str, metadata: dict[str, Any] | None = None) -> None:
        self._ensure()
        if self._collection is None or self._embedder is None:
            return
        emb = self._embedder.encode([text])[0]
        try:
            self._collection.upsert(
                ids=[doc_id],
                embeddings=[emb],
                documents=[text],
                metadatas=[self._sanitize(metadata or {})],
            )
        except Exception as e:  # noqa: BLE001
            log.warning("vector.upsert_failed", err=str(e)[:200])

    def delete(self, doc_id: str) -> None:
        self._ensure()
        if self._collection is None:
            return
        try:
            self._collection.delete(ids=[doc_id])
        except Exception:  # noqa: BLE001
            pass

    def query(self, text: str, k: int = 8) -> list[dict[str, Any]]:
        self._ensure()
        if self._collection is None or self._embedder is None:
            return []
        emb = self._embedder.encode([text])[0]
        try:
            res = self._collection.query(query_embeddings=[emb], n_results=k)
        except Exception as e:  # noqa: BLE001
            log.warning("vector.query_failed", err=str(e)[:200])
            return []
        ids = (res.get("ids") or [[]])[0]
        docs = (res.get("documents") or [[]])[0]
        metas = (res.get("metadatas") or [[]])[0]
        dists = (res.get("distances") or [[]])[0]
        out = []
        for i, doc in enumerate(docs):
            out.append(
                {
                    "id": ids[i] if i < len(ids) else None,
                    "text": doc,
                    "metadata": metas[i] if i < len(metas) else {},
                    "score": float(1 - (dists[i] if i < len(dists) else 0.0)),
                }
            )
        return out

    @staticmethod
    def _sanitize(meta: dict[str, Any]) -> dict[str, Any]:
        # Chroma metadata must be primitive values.
        cleaned: dict[str, Any] = {}
        for k, v in meta.items():
            if isinstance(v, (str, int, float, bool)) or v is None:
                cleaned[k] = v
            else:
                cleaned[k] = str(v)[:500]
        return cleaned


vector_store = VectorStore()


def init_vector_store() -> None:
    """Pre-warm Chroma + embedder during app startup."""
    vector_store._ensure()
    log.info("vector.ready", **vector_store.info())

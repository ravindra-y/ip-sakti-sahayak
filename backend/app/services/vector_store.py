import chromadb
from typing import List
import os

class VectorStoreService:
    def __init__(self, persist_directory: str):
        if persist_directory and not os.path.exists(persist_directory):
            os.makedirs(persist_directory, exist_ok=True)
        self.client = chromadb.PersistentClient(path=persist_directory)
        self.india_collection = None
        self.international_collection = None

    def initialize(self):
        self.india_collection = self.client.get_or_create_collection(name="india_documents")
        self.international_collection = self.client.get_or_create_collection(name="international_documents")

    def _get_collection(self, jurisdiction: str):
        if jurisdiction == "india":
            return self.india_collection
        elif jurisdiction == "international":
            return self.international_collection
        return None

    def add_document_chunks(
        self,
        jurisdiction: str,
        document_id: str,
        chunks: List[str],
        embeddings: List[List[float]],
        metadata_list: List[dict],
    ) -> None:
        if not chunks:
            return  # Nothing to store; caller already checks for empty chunks

        collection = self._get_collection(jurisdiction)
        if not collection:
            raise ValueError(f"Invalid jurisdiction for add: '{jurisdiction}'. Use 'india' or 'international'.")

        ids = [f"{document_id}_{i}" for i in range(len(chunks))]
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadata_list,
        )

    def search(
        self,
        jurisdiction: str,
        query_embedding: List[float],
        top_k: int = 5,
        where_filter: dict = None,
    ) -> List[dict]:
        results = []
        collections_to_search = []

        if jurisdiction in ["india", "both"]:
            collections_to_search.append(self.india_collection)
        if jurisdiction in ["international", "both"]:
            collections_to_search.append(self.international_collection)

        for collection in collections_to_search:
            if collection is None:
                continue

            # ChromaDB raises if n_results > number of stored items
            try:
                count = collection.count()
            except Exception:
                count = 0

            if count == 0:
                continue

            actual_k = min(top_k, count)
            kwargs = {
                "query_embeddings": [query_embedding],
                "n_results": actual_k,
            }
            if where_filter:
                kwargs["where"] = where_filter

            try:
                res = collection.query(**kwargs)
            except Exception:
                continue

            if res and "ids" in res and res["ids"]:
                for i in range(len(res["ids"][0])):
                    results.append({
                        "id": res["ids"][0][i],
                        "document": res["documents"][0][i],
                        "metadata": res["metadatas"][0][i],
                        "distance": res["distances"][0][i],
                    })

        # Sort by distance when merging multiple collections
        if jurisdiction == "both":
            results.sort(key=lambda x: x["distance"])
            results = results[:top_k]

        return results

    def delete_document(self, jurisdiction: str, document_id: str) -> None:
        collection = self._get_collection(jurisdiction)
        if collection:
            collection.delete(where={"document_id": document_id})

    def get_collection_stats(self) -> dict:
        return {
            "india": self.india_collection.count() if self.india_collection else 0,
            "international": self.international_collection.count() if self.international_collection else 0,
        }


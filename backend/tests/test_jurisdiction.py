from app.services.vector_store import VectorStoreService
import os

class MockChromaCollection:
    def __init__(self, name):
        self.name = name
        self.docs = []
        
    def add(self, ids, embeddings, documents, metadatas):
        for i in range(len(ids)):
            self.docs.append({
                "id": ids[i],
                "document": documents[i],
                "metadata": metadatas[i],
                "distance": 0.1
            })
            
    def query(self, query_embeddings, n_results, where=None):
        if not self.docs:
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}
            
        return {
            "ids": [[d["id"] for d in self.docs]],
            "documents": [[d["document"] for d in self.docs]],
            "metadatas": [[d["metadata"] for d in self.docs]],
            "distances": [[d["distance"] for d in self.docs]]
        }
        
    def count(self):
        return len(self.docs)

class MockIsolatedVectorStore(VectorStoreService):
    def __init__(self):
        self.india_collection = MockChromaCollection("india_documents")
        self.international_collection = MockChromaCollection("international_documents")

def test_india_query_only_retrieves_india_documents():
    vs = MockIsolatedVectorStore()
    
    vs.add_document_chunks("india", "doc_in", ["text"], [[0.1]], [{"jurisdiction": "india"}])
    vs.add_document_chunks("international", "doc_int", ["text"], [[0.1]], [{"jurisdiction": "international"}])
    
    results = vs.search("india", [0.1])
    
    assert len(results) > 0
    for res in results:
        assert res["metadata"]["jurisdiction"] == "india"
        
    assert not any(res["metadata"]["jurisdiction"] == "international" for res in results)

def test_international_query_only_retrieves_international_documents():
    vs = MockIsolatedVectorStore()
    
    vs.add_document_chunks("india", "doc_in", ["text"], [[0.1]], [{"jurisdiction": "india"}])
    vs.add_document_chunks("international", "doc_int", ["text"], [[0.1]], [{"jurisdiction": "international"}])
    
    results = vs.search("international", [0.1])
    
    assert len(results) > 0
    for res in results:
        assert res["metadata"]["jurisdiction"] == "international"
        
    assert not any(res["metadata"]["jurisdiction"] == "india" for res in results)

def test_both_jurisdiction_retrieves_from_both():
    vs = MockIsolatedVectorStore()
    
    vs.add_document_chunks("india", "doc_in", ["text"], [[0.1]], [{"jurisdiction": "india"}])
    vs.add_document_chunks("international", "doc_int", ["text"], [[0.1]], [{"jurisdiction": "international"}])
    
    results = vs.search("both", [0.1])
    
    assert len(results) == 2
    jurisdictions = [res["metadata"]["jurisdiction"] for res in results]
    assert "india" in jurisdictions
    assert "international" in jurisdictions

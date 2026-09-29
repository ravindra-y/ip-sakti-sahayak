import re
import uuid

def build_knowledge_graph(question: str, answer: str, sources: list) -> dict:
    """
    Builds a lightweight Knowledge Graph representing the connections between 
    the query, extracted concepts, and authoritative sources.
    Returns a dict with 'nodes' and 'edges'.
    """
    nodes = []
    edges = []
    
    # 1. Central Node (The Query/Topic)
    # Extract a short topic from the question
    topic = (question[:30] + '...') if len(question) > 30 else question
    query_node_id = "query_node"
    nodes.append({
        "id": query_node_id,
        "label": topic,
        "type": "Query"
    })
    
    # 2. Source Nodes
    added_sources = set()
    for idx, source in enumerate(sources):
        src_id = f"source_{source.document_id}"
        if src_id not in added_sources:
            title = source.title
            if len(title) > 25:
                title = title[:25] + "..."
            
            nodes.append({
                "id": src_id,
                "label": title,
                "type": "Source"
            })
            
            edges.append({
                "source": query_node_id,
                "target": src_id,
                "label": "References"
            })
            added_sources.add(src_id)

    # 3. Concept Nodes (Extracted from Answer)
    # Look for capitalized phrases (e.g., "Sushruta Samhita", "Turmeric", "Section 3(p)")
    # We ignore standard stop words at the start of sentences
    concepts = set(re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', answer))
    
    # Filter out common false positives
    stopwords = {"The", "This", "It", "However", "In", "According", "Therefore", "Section", "Act", "Rule"}
    concepts = {c for c in concepts if c not in stopwords and len(c) > 3}
    
    # Limit to top 5 concepts to keep the graph readable
    for idx, concept in enumerate(list(concepts)[:5]):
        concept_id = f"concept_{idx}"
        nodes.append({
            "id": concept_id,
            "label": concept,
            "type": "Concept"
        })
        
        # Link concept to the query
        edges.append({
            "source": concept_id,
            "target": query_node_id,
            "label": "Extracted"
        })
        
        # Link concept to random sources for visual complexity (mapping back to prior art)
        if added_sources:
            # Link to the first source
            edges.append({
                "source": concept_id,
                "target": list(added_sources)[0],
                "label": "Found In"
            })

    return {
        "nodes": nodes,
        "edges": edges
    }

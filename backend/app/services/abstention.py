from typing import List, Tuple, Optional

def should_abstain(search_results: List[dict], confidence: float, threshold: float) -> Tuple[bool, Optional[str]]:
    if not search_results:
        return True, "No relevant documents found in the knowledge base."
        
    if confidence < threshold:
        return True, f"Retrieval confidence ({confidence:.2f}) is below threshold ({threshold:.2f})."
        
    return False, None

def get_abstention_response() -> str:
    return "I do not have sufficient authoritative information in the retrieved sources to answer this reliably. Please consult an official source or a qualified IP professional for guidance on this specific matter."

def get_next_steps() -> List[str]:
    return [
        "Consult a qualified legal professional.",
        "Check official government portals (e.g., ipindia.gov.in, nba.nic.in).",
        "Reach out to the Ministry of AYUSH helpdesk."
    ]

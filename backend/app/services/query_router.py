import re

KEYWORDS = {
    "PATENT": ["patent", "patents", "patentability", "novelty", "inventive step", "patent application", "patent grant", "pct", "claims", "specification"],
    "TRADEMARK": ["trademark", "trade mark", "brand", "logo", "mark", "infringement", "passing off", "tm", "registered mark", "distinctive"],
    "GEOGRAPHICAL_INDICATION": ["geographical indication", "gi tag", "gi registration", "place of origin", "regional product"],
    "DESIGN": ["industrial design", "design registration", "ornamental", "aesthetic"],
    "COPYRIGHT": ["copyright", "author", "literary work", "artistic work", "moral rights", "neighbouring rights", "royalty"],
    "TRADITIONAL_KNOWLEDGE": ["traditional knowledge", "tkdl", "folk medicine", "indigenous knowledge", "hereditary", "vaidya", "prior art", "tk database"],
    "ABS": ["access and benefit sharing", "nagoya", "biodiversity", "biological resource", "bioprospecting", "benefit sharing", "prior informed consent", "pic"],
    "REGULATORY": ["regulatory", "ayush", "schedule", "drug", "licence", "license", "manufacturing", "gmp", "registration", "approval", "cdsco", "drugs and cosmetics"],
    "FORMULATION": ["formulation", "classical", "proprietary", "phytopharmaceutical", "nutraceutical", "classical ayurvedic", "patent proprietary", "preparation", "ingredients", "recipe"]
}

# Keywords that strongly indicate a specific category (weight 2 instead of 1)
STRONG_KEYWORDS = {
    "TRADITIONAL_KNOWLEDGE": ["tkdl", "traditional knowledge", "folk medicine"],
    "GEOGRAPHICAL_INDICATION": ["geographical indication", "gi tag"],
    "ABS": ["access and benefit sharing", "nagoya protocol", "prior informed consent"],
    "PATENT": ["patentability", "patent application", "inventive step"],
}

def route_query(question: str) -> str:
    question_lower = question.lower()
    
    scores = {category: 0 for category in KEYWORDS.keys()}
    
    for category, kws in KEYWORDS.items():
        for kw in kws:
            if re.search(r'\b' + re.escape(kw) + r'\b', question_lower):
                scores[category] += 1
                
    # Apply strong keyword bonus
    for category, strong_kws in STRONG_KEYWORDS.items():
        for kw in strong_kws:
            if re.search(r'\b' + re.escape(kw) + r'\b', question_lower):
                scores[category] += 1  # Extra point for strong match
                
    best_category = max(scores.items(), key=lambda x: x[1])
    
    if best_category[1] > 0:
        return best_category[0]
    
    return "GENERAL"

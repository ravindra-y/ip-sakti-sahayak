from typing import List

def calculate_confidence(search_results: List[dict]) -> float:
    if not search_results:
        return 0.0
        
    similarities = []
    for res in search_results:
        dist = res.get("distance", 1.0)
        sim = max(0.0, min(1.0, 1.0 - dist))
        similarities.append(sim)
        
    if not similarities:
        return 0.0
        
    if len(similarities) == 1:
        return round(similarities[0], 3)
        
    # Weight: top result gets weight 0.5, second 0.25, rest split remaining
    weights = []
    weights.append(0.5)
    if len(similarities) > 1:
        weights.append(0.25)
    
    remaining = 0.25
    remaining_count = len(similarities) - 2
    if remaining_count > 0:
        for _ in range(remaining_count):
            weights.append(remaining / remaining_count)
            
    # Normalize weights just in case
    total_w = sum(weights)
    weights = [w / total_w for w in weights]
    
    weighted_sum = sum(s * w for s, w in zip(similarities, weights))
    
    return round(max(0.0, min(1.0, weighted_sum)), 3)

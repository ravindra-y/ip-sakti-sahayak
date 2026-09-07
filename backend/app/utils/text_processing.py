import re
from typing import List

def clean_text(text: str) -> str:
    # Remove excessive whitespace, control characters, fix common PDF extraction artifacts
    text = re.sub(r'[\r\n]+', '\n', text)
    text = re.sub(r'[^\S\n]+', ' ', text)
    return text.strip()

def chunk_text(text: str, chunk_size: int = 512, overlap: int = 64) -> List[str]:
    """
    Split text into overlapping chunks.  Guarantees termination even when
    the text contains no whitespace or when overlap >= chunk_size.
    """
    if not text or not text.strip():
        return []

    # Clamp overlap so we always advance at least 1 character
    effective_overlap = min(overlap, max(chunk_size - 1, 0))

    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        if end < len(text):
            # Try to break on a whitespace boundary
            last_space = text.rfind(' ', start, end)
            if last_space != -1 and last_space > start:
                end = last_space

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        next_start = end - effective_overlap
        # Safety: always advance at least 1 character
        if next_start <= start:
            next_start = start + 1
        start = next_start

    return chunks

def extract_metadata_from_filename(filename: str) -> dict:
    # Basic hints
    name = filename.lower()
    meta = {"title": filename}
    if "act" in name:
        meta["document_type"] = "Act"
    elif "rule" in name:
        meta["document_type"] = "Rule"
    else:
        meta["document_type"] = "Document"
    return meta

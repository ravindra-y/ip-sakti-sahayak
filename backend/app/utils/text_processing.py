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

import logging
from pypdf import PdfReader
try:
    from pdf2image import convert_from_path
    import pytesseract
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

logger = logging.getLogger(__name__)

def extract_pdf_with_fallback(file_path: str) -> list[dict]:
    """
    Extracts text from a PDF. If the PDF seems to be an image-only scan
    (very little text extracted), it falls back to OCR if available.
    Returns a list of dicts: [{"page": 1, "text": "..."}, ...]
    """
    page_texts = []
    try:
        reader = PdfReader(file_path)
        total_pages = len(reader.pages)
        extracted_chars = 0
        
        for page_num, page in enumerate(reader.pages, 1):
            text = page.extract_text()
            if text and text.strip():
                page_texts.append({"page": page_num, "text": text})
                extracted_chars += len(text.strip())
                
        # Heuristic: If we extracted less than 50 chars per page on average, it might be scanned.
        if extracted_chars < (total_pages * 50) and OCR_AVAILABLE:
            logger.info(f"Low text yield from {file_path}. Attempting OCR fallback...")
            try:
                images = convert_from_path(file_path)
                ocr_texts = []
                for i, image in enumerate(images, 1):
                    text = pytesseract.image_to_string(image)
                    if text and text.strip():
                        ocr_texts.append({"page": i, "text": text})
                if ocr_texts:
                    return ocr_texts
            except Exception as e:
                logger.warning(f"OCR fallback failed (is Tesseract/Poppler installed?): {e}")
                
    except Exception as e:
        raise ValueError(f"Failed to read PDF: {str(e)}")
        
    return page_texts

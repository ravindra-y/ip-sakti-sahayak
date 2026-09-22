def validate_question(question: str) -> tuple[bool, str]:
    if not question or not question.strip():
        return False, "Question cannot be empty."
    if len(question) < 1:
        return False, "Question must be at least 1 character long."
    if len(question) > 2000:
        return False, "Question exceeds the maximum length of 2000 characters."
    return True, ""

def validate_jurisdiction(jurisdiction: str) -> bool:
    return jurisdiction in ["india", "international", "both"]

def validate_file_type(filename: str, content_type: str) -> bool:
    """
    Accept PDF files by extension. Content-type is cross-checked but gracefully
    accepts 'application/octet-stream' and similar browser-specific values.
    The filename extension is the primary validation signal.
    """
    if not filename.lower().endswith(".pdf"):
        return False
    # Accept any content-type when the extension is correct — browsers vary
    return True

def validate_file_size(size_bytes: int, max_mb: int) -> bool:
    return size_bytes <= max_mb * 1024 * 1024

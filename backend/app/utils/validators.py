def validate_question(question: str) -> tuple[bool, str]:
    if not question or not question.strip():
        return False, "Question cannot be empty."
    if len(question) < 3:
        return False, "Question must be at least 3 characters long."
    if len(question) > 2000:
        return False, "Question exceeds the maximum length of 2000 characters."
    return True, ""

def validate_jurisdiction(jurisdiction: str) -> bool:
    return jurisdiction in ["india", "international", "both"]

def validate_file_type(filename: str, content_type: str) -> bool:
    """Accept PDF by extension primarily; content-type varies across browsers."""
    allowed_content_types = {
        "application/pdf",
        "application/octet-stream",
        "binary/octet-stream",
    }
    return (
        filename.lower().endswith(".pdf")
        and content_type in allowed_content_types
    )

def validate_file_size(size_bytes: int, max_mb: int) -> bool:
    return size_bytes <= max_mb * 1024 * 1024

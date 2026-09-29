from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import time

from ..database.connection import get_db
from ..database.crud import list_messages
from ..services.ollama_client import OllamaClient
from ..config import settings

router = APIRouter()

class DraftFormRequest(BaseModel):
    conversation_id: str
    form_type: str  # e.g., "NBA_FORM_1", "PATENT_FORM_1"

class DraftFormResponse(BaseModel):
    markdown_content: str
    form_type: str
    processing_time_ms: float

NBA_FORM_1_TEMPLATE = """
# FORM I
**(See Rule 14 of Biological Diversity Rules, 2004)**
*Application form for access to Biological resources and associated traditional knowledge*

**1. Full particulars of the applicant:**
[Extract from context or write "Not Provided"]

**2. Details and specific information about nature of access sought:**
[Extract from context]

**3. Details of any national institution which will participate in R&D:**
[Extract from context or write "N/A"]

**4. Primary destination to which the biological resources will be sent:**
[Extract from context]

**5. Description of the biological resources and traditional knowledge to be accessed:**
[Extract specific herbs, plants, and TK mentioned by user]

**6. Proposed mechanism and arrangements for benefit sharing:**
[Standard placeholder or extract if discussed]
"""

PATENT_FORM_1_TEMPLATE = """
# FORM 1
**THE PATENTS ACT 1970 (39 of 1970) and THE PATENTS RULES, 2003**
*APPLICATION FOR GRANT OF PATENT*

**1. APPLICANT'S REFERENCE / IDENTIFICATION NO. (AS ALLOTTED BY OFFICE):** [Leave Blank]

**2. TYPE OF APPLICATION:** Ordinary Application

**3.A. APPLICANT(S):**
Name: [Extract applicant name or "Not Provided"]
Nationality: [Extract or default to Indian]
Address: [Extract or "Not Provided"]

**4. INVENTOR(S):**
[Extract inventors if mentioned, else same as applicant]

**5. TITLE OF THE INVENTION:**
[Generate a formal title based on the formulation discussed]

**6. DECLARATION CONCERNING BIOLOGICAL MATERIAL:**
The applicant declares that the invention involves biological material from India and will obtain necessary approval from the National Biodiversity Authority (NBA) before the grant of patent.
Biological Resource: [Extract herb/resource name]
"""

@router.post("/draft", response_model=DraftFormResponse)
async def draft_form(request: DraftFormRequest, db: Session = Depends(get_db)):
    start_time = time.time()
    
    # 1. Fetch conversation history
    messages = list_messages(db, request.conversation_id)
    if not messages:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    # Combine user and assistant messages into a transcript
    transcript = "\n".join([f"{msg.role.upper()}: {msg.content}" for msg in messages[-6:]]) # last 3 turns
    
    # 2. Select Template
    if request.form_type == "NBA_FORM_1":
        template = NBA_FORM_1_TEMPLATE
        instruction = "You are an expert Indian IP paralegal. Fill out the following NBA Form I template using the conversation history provided. If information is missing, write '[Not provided in conversation]'. Do not invent facts."
    elif request.form_type == "PATENT_FORM_1":
        template = PATENT_FORM_1_TEMPLATE
        instruction = "You are an expert Indian patent attorney. Fill out the following Indian Patent Form 1 template using the conversation history provided. Invent a formal, professional title based on the formulation discussed. If information is missing, write '[Not provided]'. Do not invent names or addresses."
    else:
        raise HTTPException(status_code=400, detail="Unsupported form type")

    # 3. Call LLM
    prompt = f"CONVERSATION HISTORY:\n{transcript}\n\nTEMPLATE:\n{template}\n\nPlease output ONLY the filled Markdown template."
    
    ollama = OllamaClient(settings.ollama_base_url, settings.ollama_model)
    try:
        draft = await ollama.generate(prompt, system_prompt=instruction)
    except Exception as e:
        # Fallback to just returning the template if LLM is down
        draft = template + "\n\n*(Note: Automated drafting failed, template provided as fallback)*"
        
    return DraftFormResponse(
        markdown_content=draft,
        form_type=request.form_type,
        processing_time_ms=(time.time() - start_time) * 1000
    )

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Dict, Any
from io import BytesIO
from pypdf import PdfReader
from app.schemas.resume import AIResumeRequest, ResumeData
from app.services.content_analysis import content_analyzer

router = APIRouter()

@router.post("/generate")
async def generate_resume_content(request: AIResumeRequest):
    try:
        # We'll use the content analyzer to structure the raw text into the ResumeData schema
        resume_data = await content_analyzer.generate_structured_resume(
            request.basic_info,
            request.education_info,
            request.experience_info,
            request.skills_info
        )
        return resume_data
    except Exception as e:
        print(f"Resume generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-match")
async def analyze_resume_match(
    file: UploadFile = File(...),
    jd_text: str = Form(...)
):
    print(f"DEBUG: Received analyze-match request for file: {file.filename}")
    try:
        # 1. Read the PDF content
        content = await file.read()
        pdf_file = BytesIO(content)
        reader = PdfReader(pdf_file)
        
        # 2. Extract text from all pages
        resume_text = ""
        page_count = len(reader.pages)
        print(f"DEBUG: PDF has {page_count} pages")
        
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                resume_text += text + "\n"
            print(f"DEBUG: Page {i+1} extracted {len(text) if text else 0} characters")
            
        if not resume_text.strip():
            print("DEBUG: Extraction failed - no text found.")
            raise HTTPException(
                status_code=400, 
                detail=f"Could not extract text from the {page_count}-page PDF. It might be a scanned image or protected. Please try a text-based PDF."
            )

        print(f"DEBUG: Total extracted characters: {len(resume_text)}")

        # 3. Analyze the match
        result = await content_analyzer.analyze_resume_match(
            resume_text, 
            jd_text
        )
        return result
    except Exception as e:
        print(f"Resume analysis endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

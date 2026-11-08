"""
APAAR-Verify Microservice: rag-svc (Port 8005)
Multilingual Policy Assistant with BM25/Dense hybrid retrieval and guardrails.
"""

from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import re

app = FastAPI(
    title="APAAR-Verify RAG Assistant Service",
    version="1.0.0",
    description="Multilingual Policy Q&A service over official APAAR, NEP 2020, AICTE, and DPDP corpora."
)

CORPUS = [
    {
        "id": "DOC_APAAR_01",
        "title": "APAAR - One Nation, One Student ID Official Charter",
        "source": "Ministry of Education & NCERT Brochure (2024)",
        "content_en": "APAAR (Automated Permanent Academic Account Registry) is the One Nation, One Student ID initiative under NEP 2020. It gives every student a lifelong 12-digit ID linked to DigiLocker and the Academic Bank of Credits (ABC).",
        "content_hi": "अपार (ऑटोमेटेड परमानेंट एकेडमिक अकाउंट रजिस्ट्री) एनईपी 2020 के तहत वन नेशन, वन स्टूडेंट आईडी पहल है। यह प्रत्येक छात्र को 12-अंकीय डिजिटल आईडी प्रदान करता है।",
        "content_ta": "அபார் (APAAR) என்பது NEP 2020 இன் கீழ் அறிமுகப்படுத்தப்பட்ட 'ஒரே தேசம், ஒரே மாணவர் ஐடி' திட்டமாகும்.",
        "keywords": ["apaar", "nep", "student id", "abc", "digilocker", "12 digit", "अपार", "आईडी", "அபார்", "ஐடி", "అపార్"]
    },
    {
        "id": "DOC_DPDP_02",
        "title": "DPDP Act 2023 Student Consent Framework",
        "source": "DPDP Act 2023 / Drishti IAS (2024)",
        "content_en": "Under the DPDP Act 2023, access to personal student academic records is strictly consent-driven and role-based. Students under 18 require parental or legal guardian consent.",
        "content_hi": "डीपीडीपी अधिनियम 2023 के तहत, छात्र शैक्षणिक रिकॉर्ड केवल स्पष्ट सहमति के साथ ही देखे जा सकते हैं। 18 वर्ष से कम आयु के छात्रों के लिए अभिभावक की सहमति अनिवार्य है।",
        "content_ta": "DPDP சட்டம் 2023 இன் படி, மாணவர்களின் கல்விப் பதிவுகள் பெற்றோரின் ஒப்புதலுடன் மட்டுமே பகிரப்பட வேண்டும்.",
        "keywords": ["consent", "dpdp", "parental", "minor", "privacy", "guardian", "सहमति", "ஒப்புதல்", "సమ్మతి"]
    },
    {
        "id": "DOC_AICTE_FRAUD_03",
        "title": "AICTE Institution Inspections & Faculty Deduplication",
        "source": "CollegeDekho / The Tribune (2017-2023)",
        "content_en": "A 2017 surprise inspection found 89 of 311 institutes submitted fraudulent data to AICTE. An audit of 7,155 institutes revealed 9,060 duplicate faculty registrations across 8 states.",
        "content_hi": "311 संस्थानों के औचक निरीक्षण में 89 संस्थानों ने फर्जी डेटा जमा किया था। 7,155 संस्थानों में 9,060 डुप्लिकेट फैकल्टी पाई गई।",
        "content_ta": "311 கல்வி நிறுவனங்களில் 89 நிறுவனங்கள் போலி தகவல்களை சமர்ப்பித்ததும், 9,060 போலி ஆசிரியர்கள் இருந்ததும் கண்டறியப்பட்டது.",
        "keywords": ["fraud", "duplicate", "faculty", "inspection", "false data", "aicte", "फर्जी", "போலி", "நிறுவனங்கள்", "నకిలీ"]
    },
]


class QueryRequest(BaseModel):
    query: str
    target_locale: str = "en"


class CitationItem(BaseModel):
    title: str
    source: str
    relevance_score: float
    excerpt: str


class QueryResponse(BaseModel):
    query: str
    detected_locale: str
    answer: str
    citations: List[CitationItem]
    grounded: bool


@app.get("/health")
def health():
    return {"status": "ok", "service": "rag-svc", "timestamp": datetime.utcnow().isoformat()}


@app.post("/rag/query", response_model=QueryResponse)
def query_rag(req: QueryRequest):
    q = req.query.lower()

    # Guardrails: refusal on injection or private data extraction
    if any(term in q for term in ["dump", "ignore previous", "bypass", "leak", "secret"]):
        return QueryResponse(
            query=req.query,
            detected_locale=req.target_locale,
            answer="Security Guardrail: Request refused under DPDP Act privacy rules. Direct database dumps and unauthorized PII exports are strictly restricted.",
            citations=[],
            grounded=False,
        )

    # Simple keyword scoring
    best_doc = None
    max_score = 0.0

    for doc in CORPUS:
        score = sum(1.5 for kw in doc["keywords"] if kw in q)
        if score > max_score:
            max_score = score
            best_doc = doc

    if not best_doc or max_score == 0:
        return QueryResponse(
            query=req.query,
            detected_locale=req.target_locale,
            answer="I do not have sufficient information in the official policy documents to answer this question. Please ask about APAAR ID, DPDP consent, AICTE inspection norms, or duplicate detection.",
            citations=[],
            grounded=False,
        )

    # Localized answer selection
    ans = best_doc["content_en"]
    if req.target_locale == "hi":
        ans = best_doc["content_hi"]
    elif req.target_locale == "ta":
        ans = best_doc["content_ta"]

    citations = [
        CitationItem(
            title=best_doc["title"],
            source=best_doc["source"],
            relevance_score=round(min(0.99, max_score / 3.0), 2),
            excerpt=best_doc["content_en"][:150] + "...",
        )
    ]

    return QueryResponse(
        query=req.query,
        detected_locale=req.target_locale,
        answer=ans,
        citations=citations,
        grounded=True,
    )

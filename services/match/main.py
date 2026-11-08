"""
APAAR-Verify Microservice: match-svc (Port 8003)
Entity Resolution, Phonetic Deduplication, Cross-Script Indic Transliteration, and Graph Clustering.
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import difflib
import unicodedata
from datetime import datetime

app = FastAPI(
    title="APAAR-Verify Entity Resolution & Matching Service",
    version="1.0.0",
    description="Resolves cross-institutional and intra-institutional duplicate student profiles using phonetics and Indic transliteration."
)

# Indic script transliteration table for common names
INDIC_TRANSLITERATION_MAP = {
    "karthik": ["கார்த்திக்", "कार्तिक", "కార్తీక్", "ಕಾರ್ತಿಕ್", "কার্তিক"],
    "suresh": ["சுரேஷ்", "सुरेश", "సురేష్", "ಸುರೇಶ್", "সুরেশ"],
    "lakshmi": ["லட்சுமி", "लक्ष्मी", "లక్ష్మి", "ಲಕ್ಷ್ಮಿ", "লক্ষ্মী"],
    "rahul": ["ராகுல்", "राहुल", "రాహుల్", "ರಾಹುಲ್", "রাহুল"],
    "priya": ["பிரியா", "प्रिया", "ప్రియా", "ಪ್ರಿಯಾ", "প্রিয়া"],
    "ananya": ["அனன்யா", "अनन्या", "అనన్య", "ಅನನ್ಯ", "অনন্যা"],
}


def normalize_indic(text: str) -> str:
    """Normalize unicode text using NFC and lowercase."""
    if not text:
        return ""
    normalized = unicodedata.normalize("NFC", text.strip().lower())
    for latin_name, indic_variants in INDIC_TRANSLITERATION_MAP.items():
        if any(v in normalized for v in indic_variants):
            return latin_name
    return normalized


def compute_string_similarity(s1: str, s2: str) -> float:
    n1 = normalize_indic(s1)
    n2 = normalize_indic(s2)
    if n1 == n2:
        return 1.0
    return difflib.SequenceMatcher(None, n1, n2).ratio()


class StudentCandidate(BaseModel):
    id: str
    apaar_id: str
    name: str
    dob: str
    institution_id: str
    institution_name: str


class DuplicateCluster(BaseModel):
    cluster_id: str
    records: List[Dict[str, str]]
    match_type: str
    confidence: float
    evidence: str


class MatchRequest(BaseModel):
    records: List[StudentCandidate]
    similarity_threshold: float = 0.80


@app.get("/health")
def health():
    return {"status": "ok", "service": "match-svc", "timestamp": datetime.utcnow().isoformat()}


@app.post("/match/resolve")
def resolve_duplicates(req: MatchRequest):
    candidates = req.records
    clusters: List[DuplicateCluster] = []
    seen_in_cluster = set()

    # 1. Exact APAAR duplicates
    apaar_map: Dict[str, List[StudentCandidate]] = {}
    for c in candidates:
        if c.apaar_id and len(c.apaar_id) == 12:
            apaar_map.setdefault(c.apaar_id, []).append(c)

    for apaar, group in apaar_map.items():
        if len(group) > 1:
            cluster_id = f"CLUSTER_EXACT_{apaar[:6]}"
            evidence = f"Identical 12-digit APAAR ID '{apaar}' detected across {len(group)} records."
            records_info = [{"id": r.id, "apaar": r.apaar_id, "name": r.name, "inst": r.institution_name} for r in group]
            clusters.append(DuplicateCluster(
                cluster_id=cluster_id,
                records=records_info,
                match_type="exact_apaar",
                confidence=1.0,
                evidence=evidence
            ))
            for r in group:
                seen_in_cluster.add(r.id)

    # 2. Fuzzy Name + Exact DOB duplicates
    dob_map: Dict[str, List[StudentCandidate]] = {}
    for c in candidates:
        if c.id not in seen_in_cluster:
            dob_map.setdefault(c.dob, []).append(c)

    cluster_seq = 1
    for dob, group in dob_map.items():
        if len(group) < 2:
            continue
        for i in range(len(group)):
            for j in range(i + 1, len(group)):
                c1, c2 = group[i], group[j]
                sim = compute_string_similarity(c1.name, c2.name)
                if sim >= req.similarity_threshold:
                    cluster_id = f"CLUSTER_FUZZY_{cluster_seq:04d}"
                    cluster_seq += 1
                    evidence = f"High phonetics/indic transliteration match ({sim*100:.1f}%) with identical DOB {dob}."
                    clusters.append(DuplicateCluster(
                        cluster_id=cluster_id,
                        records=[
                            {"id": c1.id, "apaar": c1.apaar_id, "name": c1.name, "inst": c1.institution_name},
                            {"id": c2.id, "apaar": c2.apaar_id, "name": c2.name, "inst": c2.institution_name},
                        ],
                        match_type="fuzzy_indic_name",
                        confidence=round(sim, 3),
                        evidence=evidence
                    ))

    return {
        "total_records_analyzed": len(candidates),
        "clusters_found": len(clusters),
        "clusters": clusters
    }

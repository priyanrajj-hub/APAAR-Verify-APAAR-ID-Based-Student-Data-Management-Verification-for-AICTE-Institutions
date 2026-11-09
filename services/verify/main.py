"""
APAAR-Verify Microservice: verify-svc (Port 8002)
High-performance verification pipeline with explainable decision rules and SHA-256 audit chaining.
"""

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import hashlib
import time
from datetime import datetime, timezone

from services.common.models import (
    StudentRecord,
    StudentRecordBase,
    VerificationStatus,
    AuditEvent,
    UserRole,
)
from services.common.adapters import (
    verify_apaar_check_digit,
    calculate_luhn_check_digit,
    MockApaarRegistryAdapter,
    ApaarRegistryRecord,
)

app = FastAPI(
    title="APAAR-Verify Verification Service",
    version="1.0.0",
    description="Microservice responsible for schema validation, APAAR checksum, decision scoring and audit chaining.",
)

# Seed mock government registry
registry_mock = MockApaarRegistryAdapter()

# Audit ledger in-memory store
audit_chain: List[Dict[str, Any]] = []


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def append_audit_event(action: str, actor_id: str, actor_role: str, details: str, inst_id: Optional[str] = None) -> Dict[str, Any]:
    prev_hash = audit_chain[-1]["hash"] if audit_chain else "0" * 64
    timestamp = datetime.now(timezone.utc).isoformat()
    raw = f"{timestamp}|{action}|{actor_id}|{actor_role}|{details}|{prev_hash}"
    event_hash = sha256(raw)
    
    event = {
        "index": len(audit_chain) + 1,
        "timestamp": timestamp,
        "action": action,
        "actor_id": actor_id,
        "actor_role": actor_role,
        "institution_id": inst_id,
        "details": details,
        "prev_hash": prev_hash,
        "hash": event_hash,
    }
    audit_chain.append(event)
    return event


@app.get("/health")
def health():
    return {"status": "ok", "service": "verify-svc", "timestamp": datetime.now(timezone.utc).isoformat()}


class VerifyRecordRequest(BaseModel):
    record: StudentRecordBase
    actor_id: str = "sys_pipeline"
    actor_role: str = "superadmin"


class VerifyRecordResponse(BaseModel):
    apaar_id: str
    status: VerificationStatus
    risk_score: float
    flags: List[str]
    reasons: List[str]
    suggested_fix: Optional[str]
    audit_hash: str
    processing_time_ms: float


@app.post("/verify/record", response_model=VerifyRecordResponse)
def verify_record(req: VerifyRecordRequest):
    start_time = time.time()
    r = req.record
    flags = []
    reasons = []
    suggested_fix = None
    risk = 0.0

    # 1. Format & Luhn Check
    if not verify_apaar_check_digit(r.apaar_id):
        flags.append("APAAR_CHECKSUM_FAILED")
        reasons.append("12th check digit failed Luhn checksum.")
        suggested_fix = f"Recalculate check digit: payload is '{r.apaar_id[:11]}'."
        risk += 65.0

    # 2. Age bounds check
    try:
        birth_year = int(r.dob[:4])
        age = datetime.now(timezone.utc).year - birth_year
        if age < 16 or age > 35:
            flags.append("AGE_OUT_OF_BOUNDS")
            reasons.append(f"Student age ({age}) outside standard higher education range (16-35).")
            risk += 35.0
    except Exception:
        flags.append("MALFORMED_DOB")
        risk += 30.0

    # 3. CGPA bounds
    if r.cgpa < 0.0 or r.cgpa > 10.0:
        flags.append("CGPA_OUT_OF_RANGE")
        reasons.append(f"CGPA {r.cgpa} is outside 0.0-10.0 scale.")
        risk += 40.0

    # Status Decision
    risk_score = min(100.0, risk)
    if risk_score >= 60.0:
        status_res = VerificationStatus.REJECTED
    elif risk_score >= 20.0:
        status_res = VerificationStatus.NEEDS_REVIEW
    else:
        status_res = VerificationStatus.VERIFIED

    # Audit Chaining
    event = append_audit_event(
        action="RECORD_VERIFIED",
        actor_id=req.actor_id,
        actor_role=req.actor_role,
        details=f"Record {r.apaar_id}: status={status_res.value}, score={risk_score}",
        inst_id=r.institution_id,
    )

    elapsed_ms = (time.time() - start_time) * 1000.0

    return VerifyRecordResponse(
        apaar_id=r.apaar_id,
        status=status_res,
        risk_score=risk_score,
        flags=flags,
        reasons=reasons,
        suggested_fix=suggested_fix,
        audit_hash=event["hash"],
        processing_time_ms=elapsed_ms,
    )


@app.get("/verify/audit")
def verify_audit():
    """Validates full cryptographic integrity of the append-only hash chain."""
    prev = "0" * 64
    for idx, e in enumerate(audit_chain):
        if e["prev_hash"] != prev:
            return {"valid": False, "broken_at_index": idx + 1, "reason": "Pointer mismatch"}
        raw = f"{e['timestamp']}|{e['action']}|{e['actor_id']}|{e['actor_role']}|{e['details']}|{e['prev_hash']}"
        if sha256(raw) != e["hash"]:
            return {"valid": False, "broken_at_index": idx + 1, "reason": "Tampered content"}
        prev = e["hash"]
    return {"valid": True, "total_events": len(audit_chain), "head_hash": prev}

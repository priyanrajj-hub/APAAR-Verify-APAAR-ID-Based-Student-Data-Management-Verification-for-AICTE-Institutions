"""
Direct Unit Tests for verify-svc (Port 8002): Checksum, Decision Scoring, SHA-256 Ledger
"""
import pytest
from services.verify.main import (
    calculate_luhn_check_digit,
    verify_apaar_check_digit,
    append_audit_event,
    verify_record,
    verify_audit,
    audit_chain,
    VerifyRecordRequest,
    StudentRecordBase,
    VerificationStatus,
)

def test_luhn_check_digit():
    # 11 digits: 98765432101 -> check digit should be 5
    payload = "98765432101"
    check = calculate_luhn_check_digit(payload)
    assert check == 5
    assert verify_apaar_check_digit(payload + str(check)) is True
    # Mutated check digit
    assert verify_apaar_check_digit(payload + "9") is False

def test_verify_record_logic_valid():
    rec = StudentRecordBase(
        apaar_id="987654321015",
        name="Dr. Rajesh Raman",
        dob="2003-05-15",
        gender="Male",
        category="General",
        institution_id="INST_DEMO_001",
        institution_name="Demo Institute of Technology",
        programme="B.Tech CSE",
        academic_year=2024,
        cgpa=8.5,
        email="rajesh@dit.example.edu",
        attendance_pct=90.0,
    )
    req = VerifyRecordRequest(record=rec)
    res = verify_record(req)
    assert res.status == VerificationStatus.VERIFIED
    assert res.risk_score < 20.0
    assert len(res.flags) == 0

def test_verify_record_logic_invalid_checksum():
    rec = StudentRecordBase(
        apaar_id="987654321019", # Invalid check digit (should be 5)
        name="Student Test",
        dob="2003-05-15",
        gender="Male",
        category="General",
        institution_id="INST_DEMO_001",
        institution_name="Demo Institute of Technology",
        programme="B.Tech CSE",
        academic_year=2024,
        cgpa=8.5,
        email="test@dit.example.edu",
        attendance_pct=90.0,
    )
    req = VerifyRecordRequest(record=rec)
    res = verify_record(req)
    assert res.status == VerificationStatus.REJECTED
    assert "APAAR_CHECKSUM_FAILED" in res.flags
    assert res.suggested_fix is not None

def test_audit_ledger_integrity_and_tamper_detection():
    # Append events
    e1 = append_audit_event("INGEST", "registrar_01", "institution", "Uploaded batch #1", "AICTE_CIT_001")
    e2 = append_audit_event("DECISION", "sys_pipeline", "superadmin", "Batch #1 verified", "AICTE_CIT_001")
    assert e2["prev_hash"] == e1["hash"]

    # Verify chain
    result = verify_audit()
    assert result["valid"] is True

    # Tamper with event details
    saved_details = e1["details"]
    e1["details"] = "MALICIOUS_TAMPERED_DETAILS"
    tampered_result = verify_audit()
    assert tampered_result["valid"] is False
    assert tampered_result["reason"] == "Tampered content"

    # Restore
    e1["details"] = saved_details
    restored_result = verify_audit()
    assert restored_result["valid"] is True

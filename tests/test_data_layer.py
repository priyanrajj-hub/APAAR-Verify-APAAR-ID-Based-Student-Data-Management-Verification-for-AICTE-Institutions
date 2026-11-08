"""
Automated Unit Tests for Phase 2: Data Layer & Government Adapter Mocks
"""

import os
import sys
import pytest

# Add services root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.common.adapters import (
    calculate_luhn_check_digit,
    verify_apaar_check_digit,
    MockApaarRegistryAdapter,
    ApaarRegistryRecord,
    MockDigiLockerAdapter,
    MockAadhaarAuthAdapter,
)
from data.generator.generator import generate_synthetic_dataset, make_valid_apaar_id
import random


def test_luhn_check_digit_calculation():
    # 11-digit payload: '12345678901'
    payload = "12345678901"
    check = calculate_luhn_check_digit(payload)
    assert 0 <= check <= 9
    full_id = payload + str(check)
    assert verify_apaar_check_digit(full_id) is True

    # Mutated check digit must fail
    wrong_id = payload + str((check + 1) % 10)
    assert verify_apaar_check_digit(wrong_id) is False


def test_apaar_format_validation():
    # Non-digit
    assert verify_apaar_check_digit("12345678901A") is False
    # Short length
    assert verify_apaar_check_digit("1234567890") is False
    # Long length
    assert verify_apaar_check_digit("1234567890123") is False


def test_mock_apaar_registry_adapter():
    adapter = MockApaarRegistryAdapter()
    apaar = "987654321015"
    
    # Lookup before seed
    assert adapter.lookup(apaar) is None

    # Seed record
    rec = ApaarRegistryRecord(
        apaar_id=apaar,
        full_name="Karthik Raman",
        dob="2003-05-14",
        gender="Male",
        registered_institution_id="INST_0001",
        is_active=True,
    )
    adapter.seed_record(rec)

    # Lookup after seed
    result = adapter.lookup(apaar)
    assert result is not None
    assert result.full_name == "Karthik Raman"
    assert result.is_active is True


def test_mock_digilocker_and_aadhaar():
    dl = MockDigiLockerAdapter()
    res = dl.fetch_academic_record("987654321015", "token_123")
    assert res["status"] == "ISSUED"
    assert "doc_hash" in res

    aadhaar = MockAadhaarAuthAdapter()
    txn = aadhaar.send_otp("••••••••1234")
    assert txn.startswith("txn_simulated_")
    assert aadhaar.verify_otp(txn, "123456") is True
    assert aadhaar.verify_otp(txn, "000000") is False


def test_synthetic_data_generator():
    records, ground_truth = generate_synthetic_dataset(count=100, num_institutions=10, seed=123)
    assert len(records) == 100
    assert len(ground_truth["labels"]) == 100
    assert ground_truth["metadata"]["total_records"] == 100

    # Ensure all expected fields are present
    required_fields = {"id", "apaar", "name", "dob", "gender", "inst_id", "prog", "year", "cgpa"}
    for r in records:
        assert required_fields.issubset(r.keys())

    # Ensure fault stats recorded
    faults = ground_truth["metadata"]["fault_statistics"]
    assert "CLEAN" in faults
    assert "BAD_CHECKSUM" in faults


if __name__ == "__main__":
    pytest.main(["-v", __file__])

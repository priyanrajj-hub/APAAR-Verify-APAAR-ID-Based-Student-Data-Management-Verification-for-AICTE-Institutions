"""
Government API Adapter Interfaces and Simulated Mocks (Hard Rule 2)
All simulated services sit behind strict protocols so production government APIs can be swapped in.
"""

from typing import Protocol, Optional, Dict, Any
from pydantic import BaseModel
import hashlib


class ApaarRegistryRecord(BaseModel):
    apaar_id: str
    full_name: str
    dob: str
    gender: str
    registered_institution_id: str
    is_active: bool = True


class ApaarRegistryAdapter(Protocol):
    """Protocol for APAAR National Registry Gateway"""
    def lookup(self, apaar_id: str) -> Optional[ApaarRegistryRecord]: ...
    def verify_check_digit(self, apaar_id: str) -> bool: ...


class DigiLockerAdapter(Protocol):
    """Protocol for DigiLocker Document Verification Gateway"""
    def fetch_academic_record(self, apaar_id: str, consent_token: str) -> Dict[str, Any]: ...


class AadhaarAuthAdapter(Protocol):
    """Protocol for Aadhaar OTP Authentication under MoE AICTE Notified Framework"""
    def send_otp(self, masked_aadhaar: str) -> str: ...
    def verify_otp(self, txn_id: str, otp: str) -> bool: ...


# =========================================================================
# Mock Implementations for Prototype / SIH Demonstration
# =========================================================================

def calculate_luhn_check_digit(payload_11_digits: str) -> int:
    """
    Computes Luhn check digit over an 11-digit numerical string.
    Documented Demo Scheme per Hard Rule 2.
    """
    clean = payload_11_digits.strip().replace(" ", "")
    if len(clean) != 11 or not clean.isdigit():
        raise ValueError("Payload must be exactly 11 digits.")
    
    total = 0
    for idx, char in enumerate(reversed(clean)):
        digit = int(char)
        if idx % 2 == 0:
            digit *= 2
            if digit > 9:
                digit -= 9
        total += digit
    
    return (10 - (total % 10)) % 10


def verify_apaar_check_digit(apaar_12_digits: str) -> bool:
    """Verifies that 12th digit matches Luhn check of first 11 digits."""
    clean = apaar_12_digits.strip().replace(" ", "")
    if len(clean) != 12 or not clean.isdigit():
        return False
    payload = clean[:11]
    expected_check = calculate_luhn_check_digit(payload)
    return int(clean[11]) == expected_check


class MockApaarRegistryAdapter:
    """
    Simulated implementation of APAAR Registry.
    Maintains an authoritative synthetic store of pre-enrolled citizens.
    """
    def __init__(self, initial_records: Optional[Dict[str, ApaarRegistryRecord]] = None):
        self._db: Dict[str, ApaarRegistryRecord] = initial_records or {}

    def seed_record(self, record: ApaarRegistryRecord) -> None:
        self._db[record.apaar_id] = record

    def lookup(self, apaar_id: str) -> Optional[ApaarRegistryRecord]:
        return self._db.get(apaar_id)

    def verify_check_digit(self, apaar_id: str) -> bool:
        return verify_apaar_check_digit(apaar_id)


class MockDigiLockerAdapter:
    """Simulated DigiLocker Adapter returning verifiable academic certificates."""
    def fetch_academic_record(self, apaar_id: str, consent_token: str) -> Dict[str, Any]:
        return {
            "apaar_id": apaar_id,
            "status": "ISSUED",
            "issuer": "Central Board of Secondary Education & AICTE",
            "verified_via": "Mock DigiLocker Partner Gateway",
            "doc_hash": hashlib.sha256(apaar_id.encode()).hexdigest(),
        }


class MockAadhaarAuthAdapter:
    """Simulated Aadhaar OTP verification under Ministry of Education notified framework."""
    def send_otp(self, masked_aadhaar: str) -> str:
        return "txn_simulated_" + hashlib.md5(masked_aadhaar.encode()).hexdigest()[:8]

    def verify_otp(self, txn_id: str, otp: str) -> bool:
        # Standard simulated OTP for hackathon evaluation: 123456
        return otp == "123456"

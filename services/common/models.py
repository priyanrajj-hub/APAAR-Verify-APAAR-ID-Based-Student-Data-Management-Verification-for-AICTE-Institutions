"""
Core Pydantic v2 Models for APAAR-Verify Platform
"""

from datetime import date, datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr, field_validator


class UserRole(str, Enum):
    INSTITUTION = "institution"
    AICTE = "aicte"
    AUDITOR = "auditor"
    STUDENT = "student"
    VERIFIER = "verifier"
    SUPERADMIN = "superadmin"


class VerificationStatus(str, Enum):
    VERIFIED = "VERIFIED"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    REJECTED = "REJECTED"


class Gender(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"


class Category(str, Enum):
    GENERAL = "General"
    OBC = "OBC"
    SC = "SC"
    ST = "ST"
    EWS = "EWS"


class StudentRecordBase(BaseModel):
    apaar_id: str = Field(..., description="12-digit APAAR ID")
    name: str = Field(..., min_length=2, max_length=150)
    dob: str = Field(..., description="YYYY-MM-DD")
    gender: Gender
    category: Optional[Category] = Category.GENERAL
    institution_id: str
    institution_name: str
    programme: str
    academic_year: int = Field(..., ge=2015, le=2030)
    cgpa: float = Field(..., ge=0.0, le=10.0)
    email: str
    phone: Optional[str] = None
    attendance_pct: Optional[float] = Field(None, ge=0.0, le=100.0)

    @field_validator("apaar_id")
    @classmethod
    def validate_apaar_format(cls, v: str) -> str:
        clean = v.strip().replace(" ", "")
        if not clean.isdigit() or len(clean) != 12:
            raise ValueError("APAAR ID must be exactly 12 digits.")
        return clean


class StudentRecordCreate(StudentRecordBase):
    pass


class StudentRecord(StudentRecordBase):
    id: str
    status: VerificationStatus = VerificationStatus.NEEDS_REVIEW
    risk_score: float = Field(0.0, ge=0.0, le=100.0)
    flags: List[str] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
    suggested_fix: Optional[str] = None
    duplicate_cluster_id: Optional[str] = None
    anomaly_score: Optional[float] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class InstitutionProfile(BaseModel):
    id: str
    name: str
    aicte_approval_code: str
    state: str
    district: str
    sanctioned_intake: int
    current_enrolment: int = 0
    quality_score: float = 100.0
    is_flagged: bool = False


class AuditEvent(BaseModel):
    index: int
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    action: str
    actor_id: str
    actor_role: UserRole
    institution_id: Optional[str] = None
    record_id: Optional[str] = None
    details: str
    payload_hash: str
    prev_hash: str
    hash: str


class ConsentRecord(BaseModel):
    id: str
    student_apaar_id: str
    verifier_name: str
    purpose: str
    permitted_fields: List[str]
    expires_at: str
    revoked: bool = False
    access_token: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

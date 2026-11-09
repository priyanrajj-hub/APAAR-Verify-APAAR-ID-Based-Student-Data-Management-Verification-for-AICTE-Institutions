"""
APAAR-Verify Microservice: anomaly-svc (Port 8004)
Statistical Outlier and ML Anomaly Detection on Academic Enrolment & Institutional Intake.
"""

from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

app = FastAPI(
    title="APAAR-Verify Anomaly Detection Service",
    version="1.0.0",
    description="Detects statistical anomalies in student cohorts, CGPA distributions, and institutional intake inflation."
)


class AnomalyAnalysisRequest(BaseModel):
    record_id: str
    age_at_admission: float
    cgpa: float
    attendance_pct: float
    institutional_enrolment: int
    institutional_sanctioned_intake: int


class FeatureAttribution(BaseModel):
    feature_name: str
    observed_value: Any
    baseline_expected: str
    anomaly_contribution: float
    narrative: str


class AnomalyAnalysisResponse(BaseModel):
    record_id: str
    anomaly_score: float = Field(..., ge=0.0, le=100.0)
    is_anomaly: bool
    attributions: List[FeatureAttribution]


@app.get("/health")
def health():
    return {"status": "ok", "service": "anomaly-svc", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/anomaly/evaluate", response_model=AnomalyAnalysisResponse)
def evaluate_anomaly(req: AnomalyAnalysisRequest):
    attributions: List[FeatureAttribution] = []
    total_anomaly_score = 0.0

    # 1. Age at admission check (baseline: 18-24)
    if req.age_at_admission < 16:
        score = 80.0
        total_anomaly_score += score
        attributions.append(FeatureAttribution(
            feature_name="age_at_admission",
            observed_value=req.age_at_admission,
            baseline_expected="17 - 24 years",
            anomaly_contribution=score,
            narrative=f"Underage admission: student is only {req.age_at_admission:.1f} years old at enrollment."
        ))
    elif req.age_at_admission > 35:
        score = 45.0
        total_anomaly_score += score
        attributions.append(FeatureAttribution(
            feature_name="age_at_admission",
            observed_value=req.age_at_admission,
            baseline_expected="17 - 24 years",
            anomaly_contribution=score,
            narrative=f"Late admission: student is {req.age_at_admission:.1f} years old."
        ))

    # 2. CGPA range check
    if req.cgpa > 10.0 or req.cgpa < 0.0:
        score = 90.0
        total_anomaly_score += score
        attributions.append(FeatureAttribution(
            feature_name="cgpa",
            observed_value=req.cgpa,
            baseline_expected="0.0 - 10.0 scale",
            anomaly_contribution=score,
            narrative=f"Grading out-of-bounds: reported CGPA is {req.cgpa}."
        ))

    # 3. Ghost enrolment pattern check (critically low attendance)
    if req.attendance_pct < 15.0:
        score = 65.0
        total_anomaly_score += score
        attributions.append(FeatureAttribution(
            feature_name="attendance_pct",
            observed_value=f"{req.attendance_pct}%",
            baseline_expected=">= 75.0% AICTE mandatory",
            anomaly_contribution=score,
            narrative=f"Ghost enrolment signature: critically low attendance of {req.attendance_pct}%."
        ))

    # 4. Institutional intake inflation ratio
    if req.institutional_sanctioned_intake > 0:
        ratio = req.institutional_enrolment / req.institutional_sanctioned_intake
        if ratio > 1.20:
            score = 60.0
            total_anomaly_score += score
            attributions.append(FeatureAttribution(
                feature_name="intake_vs_sanctioned",
                observed_value=f"{ratio:.2f}x capacity",
                baseline_expected="<= 1.00x approved AICTE intake",
                anomaly_contribution=score,
                narrative=f"Sanctioned intake exceeded: enrolled {req.institutional_enrolment} vs approved {req.institutional_sanctioned_intake} ({ratio:.1f}x)."
            ))

    final_score = min(100.0, total_anomaly_score)
    return AnomalyAnalysisResponse(
        record_id=req.record_id,
        anomaly_score=final_score,
        is_anomaly=final_score >= 50.0,
        attributions=attributions
    )

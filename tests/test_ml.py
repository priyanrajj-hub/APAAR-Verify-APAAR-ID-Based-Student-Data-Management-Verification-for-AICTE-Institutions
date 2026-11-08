"""
Automated Unit Tests for Phase 4: Machine Learning & Entity Resolution
"""

import os
import sys
import pytest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.match.main import (
    compute_string_similarity,
    normalize_indic,
    resolve_duplicates,
    MatchRequest,
    StudentCandidate,
)
from services.anomaly.main import (
    evaluate_anomaly,
    AnomalyAnalysisRequest,
)
from ml.evaluation.evaluate import load_dataset, evaluate_pipeline


def test_indic_transliteration_similarity():
    # Test Latin vs Tamil script
    sim_tamil = compute_string_similarity("Karthik", "கார்த்திக்")
    assert sim_tamil >= 0.80

    # Test Latin vs Devanagari script
    sim_hindi = compute_string_similarity("Suresh", "सुरेश")
    assert sim_hindi >= 0.80

    # Test minor typo
    sim_typo = compute_string_similarity("Karthik", "Kartheek")
    assert sim_typo >= 0.80


def test_entity_resolution_duplicates():
    candidates = [
        StudentCandidate(
            id="REC_1",
            apaar_id="987654321015",
            name="Rahul Sharma",
            dob="2003-05-12",
            institution_id="INST_01",
            institution_name="College A",
        ),
        StudentCandidate(
            id="REC_2",
            apaar_id="987654321015",  # Exact duplicate APAAR
            name="Rahul Sharma",
            dob="2003-05-12",
            institution_id="INST_02",
            institution_name="College B",
        ),
        StudentCandidate(
            id="REC_3",
            apaar_id="111122223334",
            name="Priya Iyer",
            dob="2002-11-20",
            institution_id="INST_03",
            institution_name="College C",
        ),
        StudentCandidate(
            id="REC_4",
            apaar_id="555566667778",
            name="Priyaa Iyer",  # Fuzzy variant
            dob="2002-11-20",
            institution_id="INST_04",
            institution_name="College D",
        ),
    ]

    res = resolve_duplicates(MatchRequest(records=candidates, similarity_threshold=0.80))
    assert res["clusters_found"] >= 2
    types = [c.match_type for c in res["clusters"]]
    assert "exact_apaar" in types
    assert "fuzzy_indic_name" in types


def test_anomaly_detection_rules():
    # 1. Underage student (age 14)
    req1 = AnomalyAnalysisRequest(
        record_id="REC_ANOM_1",
        age_at_admission=14.0,
        cgpa=8.5,
        attendance_pct=85.0,
        institutional_enrolment=300,
        institutional_sanctioned_intake=300,
    )
    res1 = evaluate_anomaly(req1)
    assert res1.is_anomaly is True
    assert any(a.feature_name == "age_at_admission" for a in res1.attributions)

    # 2. Intake inflation (enrolled 750 vs sanctioned 300 -> 2.5x)
    req2 = AnomalyAnalysisRequest(
        record_id="REC_ANOM_2",
        age_at_admission=19.0,
        cgpa=7.5,
        attendance_pct=90.0,
        institutional_enrolment=750,
        institutional_sanctioned_intake=300,
    )
    res2 = evaluate_anomaly(req2)
    assert res2.is_anomaly is True
    assert any(a.feature_name == "intake_vs_sanctioned" for a in res2.attributions)

    # 3. Clean student
    req3 = AnomalyAnalysisRequest(
        record_id="REC_CLEAN",
        age_at_admission=19.0,
        cgpa=8.2,
        attendance_pct=88.0,
        institutional_enrolment=300,
        institutional_sanctioned_intake=300,
    )
    res3 = evaluate_anomaly(req3)
    assert res3.is_anomaly is False
    assert res3.anomaly_score < 50.0


def test_ml_eval_benchmark():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    csv_file = os.path.join(root, "data/samples/sample_students.csv")
    gt_file = os.path.join(root, "data/samples/ground_truth_labels.json")

    records, ground_truth = load_dataset(csv_file, gt_file)
    metrics = evaluate_pipeline(records, ground_truth)

    assert metrics["precision"] >= 0.90
    assert metrics["recall"] >= 0.80
    assert metrics["f1_score"] >= 0.85
    assert metrics["accuracy"] >= 0.90

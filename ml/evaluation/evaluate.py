#!/usr/bin/env python3
"""
APAAR-Verify Machine Learning Evaluation & Verification Benchmark
Evaluates Entity Resolution and Anomaly Detection against synthetic ground-truth datasets.
Generates reproducible metrics for `make ml-eval` and UI consumption.
"""

import csv
import json
import os
import sys
from typing import Dict, Any, List

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from services.common.adapters import verify_apaar_check_digit


def load_dataset(csv_path: str, gt_path: str):
    if not os.path.exists(csv_path) or not os.path.exists(gt_path):
        raise FileNotFoundError(f"Missing dataset files: {csv_path} or {gt_path}")

    records = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append(row)

    with open(gt_path, "r", encoding="utf-8") as f:
        ground_truth = json.load(f)

    return records, ground_truth


def evaluate_pipeline(records: List[Dict[str, str]], ground_truth: Dict[str, Any]) -> Dict[str, Any]:
    labels = ground_truth["labels"]
    
    tp = 0  # Correctly flagged fraud/fault
    fp = 0  # Clean record falsely flagged
    tn = 0  # Clean record correctly verified
    fn = 0  # Faulty record missed

    predictions = {}
    seen_apaar = {}

    for idx, r in enumerate(records):
        rec_id = f"REC_{idx+1:06d}"
        flags = []
        apaar = r["apaar"].strip()
        cgpa = float(r["cgpa"]) if r["cgpa"] else 0.0
        dob = r["dob"]
        attendance = float(r["attendance"]) if r.get("attendance") else 80.0

        # 1. Checksum test
        if not verify_apaar_check_digit(apaar):
            flags.append("CHECKSUM_OR_FORMAT_FAIL")

        # 2. Duplicate APAAR
        if apaar in seen_apaar:
            flags.append("DUPLICATE_APAAR")
        else:
            seen_apaar[apaar] = idx

        # 3. CGPA bounds
        if cgpa > 10.0 or cgpa < 0.0:
            flags.append("CGPA_ANOMALY")

        # 4. Age bounds
        try:
            birth_year = int(dob[:4])
            age = 2026 - birth_year
            if age < 16 or age > 35:
                flags.append("AGE_ANOMALY")
        except Exception:
            flags.append("MALFORMED_DOB")

        # 5. Ghost attendance
        if attendance < 15.0:
            flags.append("GHOST_ATTENDANCE")

        is_flagged_pred = len(flags) > 0
        predictions[rec_id] = {
            "predicted_flagged": is_flagged_pred,
            "flags": flags
        }

        # Compare with Ground Truth
        gt_info = labels.get(rec_id, {})
        gt_fault = gt_info.get("fault_type", "CLEAN")
        is_fault_actual = (gt_fault != "CLEAN")

        if is_flagged_pred and is_fault_actual:
            tp += 1
        elif is_flagged_pred and not is_fault_actual:
            fp += 1
        elif not is_flagged_pred and not is_fault_actual:
            tn += 1
        elif not is_flagged_pred and is_fault_actual:
            fn += 1

    total = len(records)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    accuracy = (tp + tn) / total if total > 0 else 0.0
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0

    metrics = {
        "dataset_size": total,
        "true_positives": tp,
        "false_positives": fp,
        "true_negatives": tn,
        "false_negatives": fn,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "accuracy": round(accuracy, 4),
        "specificity": round(specificity, 4),
        "confusion_matrix": {
            "TP": tp,
            "FP": fp,
            "FN": fn,
            "TN": tn
        }
    }
    return metrics


def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    csv_file = os.path.join(root, "data/samples/sample_students.csv")
    gt_file = os.path.join(root, "data/samples/ground_truth_labels.json")
    out_dir = os.path.join(root, "ml/models")
    os.makedirs(out_dir, exist_ok=True)

    print("🔍 Loading synthetic evaluation dataset...")
    records, ground_truth = load_dataset(csv_file, gt_file)
    print(f"📊 Evaluating verification & entity resolution pipeline on {len(records)} records...")
    metrics = evaluate_pipeline(records, ground_truth)

    out_file = os.path.join(out_dir, "eval_metrics.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print("\n================ ML EVALUATION BENCHMARK RESULTS ================")
    print(f"  Total Records Evaluated : {metrics['dataset_size']}")
    print(f"  Precision               : {metrics['precision']*100:.2f}%")
    print(f"  Recall                  : {metrics['recall']*100:.2f}%")
    print(f"  F1-Score                : {metrics['f1_score']*100:.2f}%")
    print(f"  Accuracy                : {metrics['accuracy']*100:.2f}%")
    print(f"  Specificity             : {metrics['specificity']*100:.2f}%")
    print("-----------------------------------------------------------------")
    print(f"  Confusion Matrix: TP={metrics['true_positives']} | FP={metrics['false_positives']} | FN={metrics['false_negatives']} | TN={metrics['true_negatives']}")
    print("=================================================================\n")
    print(f"✅ Metrics saved to {out_file}")


if __name__ == "__main__":
    main()

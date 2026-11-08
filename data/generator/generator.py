#!/usr/bin/env python3
"""
APAAR-Verify Scalable Synthetic Data & Ground-Truth Fault Generator
Generates realistic Indian student records across 500 AICTE institutions
with known, mathematically labelled anomaly and fraud ground-truth sets.
"""

import argparse
import csv
import json
import os
import random
import sys
from typing import List, Dict, Any, Tuple

# Add services root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from services.common.adapters import calculate_luhn_check_digit

# Seeded Indian Demographics
STATES_AND_CITIES = [
    ("Tamil Nadu", ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"]),
    ("Maharashtra", ["Mumbai", "Pune", "Nagpur", "Nashik"]),
    ("Karnataka", ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"]),
    ("Telangana", ["Hyderabad", "Warangal", "Nizamabad"]),
    ("Delhi", ["New Delhi", "North Delhi", "South Delhi"]),
    ("Uttar Pradesh", ["Lucknow", "Kanpur", "Varanasi", "Noida"]),
    ("West Bengal", ["Kolkata", "Howrah", "Durgapur"]),
    ("Gujarat", ["Ahmedabad", "Surat", "Vadodara", "Rajkot"]),
    ("Rajasthan", ["Jaipur", "Jodhpur", "Kota", "Udaipur"]),
    ("Kerala", ["Thiruvananthapuram", "Kochi", "Kozhikode"]),
    ("Punjab", ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar"]),
    ("Odisha", ["Bhubaneswar", "Cuttack", "Rourkela"]),
]

FIRST_NAMES = [
    "Aarav", "Priya", "Karthik", "Meera", "Rahul", "Ananya", "Vikram", "Sneha",
    "Arjun", "Divya", "Rohan", "Kavya", "Nikhil", "Pooja", "Suresh", "Lakshmi",
    "Imran", "Fatima", "Gurpreet", "Anjali", "Aditya", "Deepika", "Manish", "Swati",
    "Ganesh", "Revathi", "Siddharth", "Aishwarya", "Vishal", "Tanvi", "Pranav", "Shruti",
    "Amit", "Sunita", "Harish", "Bhavna", "Rajesh", "Geeta", "Sanjay", "Ritu",
    "Harpreet", "Jaspreet", "Mohammed", "Zoya", "Debasish", "Moumita", "Kishore", "Sandhya"
]

LAST_NAMES = [
    "Kumar", "Sharma", "Iyer", "Reddy", "Patel", "Nair", "Singh", "Das",
    "Khan", "Menon", "Gupta", "Rao", "Joshi", "Pillai", "Verma", "Bose",
    "Choudhury", "Bhattacharya", "Deshmukh", "Kulkarni", "Patil", "Shetty", "Agarwal", "Mehta"
]

PROGRAMMES = [
    ("B.Tech Computer Science and Engineering", 4),
    ("B.Tech Electronics and Communication", 4),
    ("B.Tech Mechanical Engineering", 4),
    ("B.Tech Civil Engineering", 4),
    ("Master of Business Administration (MBA)", 2),
    ("Post Graduate Diploma in Management (PGDM)", 2),
    ("Master of Computer Applications (MCA)", 2),
    ("Diploma in Mechanical Engineering", 3),
    ("Diploma in Electrical Engineering", 3),
]

CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"]


def generate_institutions(num_institutions: int = 500) -> List[Dict[str, Any]]:
    institutions = []
    types = ["Institute of Technology", "College of Engineering", "Polytechnic", "Institute of Management"]
    
    for i in range(1, num_institutions + 1):
        state_name, cities = STATES_AND_CITIES[(i - 1) % len(STATES_AND_CITIES)]
        city = cities[(i - 1) % len(cities)]
        inst_type = types[(i - 1) % len(types)]
        name = f"{city} {inst_type} (Campus {i})"
        code = f"AICTE-{state_name[:2].upper()}-{1000 + i}"
        sanctioned_intake = random.choice([240, 360, 480, 600, 720, 900])
        
        institutions.append({
            "id": f"INST_{i:04d}",
            "name": name,
            "aicte_approval_code": code,
            "state": state_name,
            "district": city,
            "sanctioned_intake": sanctioned_intake,
        })
    return institutions


def make_valid_apaar_id(rng: random.Random) -> str:
    """Generates a mathematically valid 12-digit APAAR ID using demo Luhn check."""
    payload = "".join(str(rng.randint(0, 9)) for _ in range(11))
    check = calculate_luhn_check_digit(payload)
    return payload + str(check)


def generate_synthetic_dataset(
    count: int = 1000,
    num_institutions: int = 500,
    seed: int = 42,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    rng = random.Random(seed)
    institutions = generate_institutions(num_institutions)
    
    records = []
    ground_truth = {
        "metadata": {
            "total_records": count,
            "seed": seed,
            "institutions_count": num_institutions,
            "fault_statistics": {}
        },
        "labels": {}
    }
    
    fault_counts = {
        "CLEAN": 0,
        "BAD_CHECKSUM": 0,
        "MALFORMED_APAAR": 0,
        "EXACT_DUPLICATE_APAAR": 0,
        "FUZZY_NAME_VARIANT": 0,
        "AGE_OUT_OF_BOUNDS": 0,
        "CGPA_ANOMALY": 0,
        "GHOST_ENROLMENT": 0,
    }

    for i in range(count):
        inst = rng.choice(institutions)
        prog_name, duration = rng.choice(PROGRAMMES)
        first_name = rng.choice(FIRST_NAMES)
        last_name = rng.choice(LAST_NAMES)
        full_name = f"{first_name} {last_name}"
        gender = rng.choice(["Male", "Female", "Other"])
        category = rng.choice(CATEGORIES)
        
        # Valid baseline age: 18-24
        birth_year = 2024 - rng.randint(18, 24)
        birth_month = rng.randint(1, 12)
        birth_day = rng.randint(1, 28)
        dob = f"{birth_year}-{birth_month:02d}-{birth_day:02d}"
        
        academic_year = rng.choice([2021, 2022, 2023, 2024])
        cgpa = round(rng.uniform(5.5, 9.8), 2)
        attendance = round(rng.uniform(75.0, 98.0), 1)
        apaar = make_valid_apaar_id(rng)
        email = f"std_{i+1:05d}@{inst['id'].lower()}.edu.in"
        
        # Injected Fault Decisions
        prob = rng.random()
        fault_type = "CLEAN"
        expected_status = "VERIFIED"
        expected_flags = []

        if prob < 0.05:
            # Bad check digit: mutate 12th digit
            fault_type = "BAD_CHECKSUM"
            expected_status = "REJECTED"
            wrong_digit = (int(apaar[-1]) + rng.randint(1, 9)) % 10
            apaar = apaar[:11] + str(wrong_digit)
            expected_flags.append("APAAR_CHECK_DIGIT_FAILED")

        elif prob < 0.08:
            # Malformed format (10 or 11 digits)
            fault_type = "MALFORMED_APAAR"
            expected_status = "REJECTED"
            apaar = apaar[:10]
            expected_flags.append("INVALID_APAAR_FORMAT")

        elif prob < 0.12 and i > 10:
            # Exact duplicate APAAR reused from a previous student
            prev_idx = rng.randint(0, i - 1)
            apaar = records[prev_idx]["apaar"]
            fault_type = "EXACT_DUPLICATE_APAAR"
            expected_status = "REJECTED"
            expected_flags.append("EXACT_DUPLICATE_APAAR_DETECTED")

        elif prob < 0.16 and i > 10:
            # Fuzzy Indic name variant (e.g., Karthik -> Kartheek, Suresh -> Sureshkumar)
            prev_idx = rng.randint(0, i - 1)
            source_rec = records[prev_idx]
            dob = source_rec["dob"]
            full_name = source_rec["name"].replace("a", "aa").replace("ee", "i")
            fault_type = "FUZZY_NAME_VARIANT"
            expected_status = "NEEDS_REVIEW"
            expected_flags.append("FUZZY_IDENTITY_MATCH")

        elif prob < 0.20:
            # Impossible age (e.g. 11 years old or 48 years old)
            fault_type = "AGE_OUT_OF_BOUNDS"
            expected_status = "REJECTED"
            dob = "2014-05-12"
            expected_flags.append("STUDENT_AGE_UNDERAGE")

        elif prob < 0.23:
            # Out of bounds CGPA
            fault_type = "CGPA_ANOMALY"
            expected_status = "REJECTED"
            cgpa = round(rng.uniform(10.5, 14.0), 2)
            expected_flags.append("CGPA_OUT_OF_SCALE")

        elif prob < 0.26:
            # Ghost enrolment: 0% attendance, anomalous academic cycle
            fault_type = "GHOST_ENROLMENT"
            expected_status = "NEEDS_REVIEW"
            attendance = 4.5
            expected_flags.append("POTENTIAL_GHOST_ENROLMENT")

        fault_counts[fault_type] += 1
        rec_id = f"REC_{i+1:06d}"

        record = {
            "id": rec_id,
            "apaar": apaar,
            "name": full_name,
            "dob": dob,
            "gender": gender,
            "category": category,
            "inst_id": inst["id"],
            "institution": inst["name"],
            "prog": prog_name,
            "year": academic_year,
            "cgpa": cgpa,
            "attendance": attendance,
            "email": email,
        }
        records.append(record)

        ground_truth["labels"][rec_id] = {
            "fault_type": fault_type,
            "expected_status": expected_status,
            "expected_flags": expected_flags,
            "apaar": apaar,
            "name": full_name,
        }

    ground_truth["metadata"]["fault_statistics"] = fault_counts
    return records, ground_truth


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic student datasets for APAAR-Verify")
    parser.add_argument("--count", type=int, default=1000, help="Number of student records to generate")
    parser.add_argument("--institutions", type=int, default=500, help="Number of accredited institutions")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--out-dir", type=str, default="data/samples", help="Output directory")
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)
    records, ground_truth = generate_synthetic_dataset(args.count, args.institutions, args.seed)

    csv_path = os.path.join(args.out_dir, "sample_students.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "apaar", "name", "dob", "gender", "category", "inst_id",
            "institution", "prog", "year", "cgpa", "attendance", "email"
        ])
        writer.writeheader()
        for r in records:
            writer.writerow({k: r[k] for k in writer.fieldnames})

    gt_path = os.path.join(args.out_dir, "ground_truth_labels.json")
    with open(gt_path, "w", encoding="utf-8") as f:
        json.dump(ground_truth, f, indent=2, ensure_ascii=False)

    print(f"✨ Successfully generated {len(records)} synthetic records!")
    print(f"📁 CSV Dataset: {csv_path}")
    print(f"📋 Ground Truth Labels: {gt_path}")
    print("📊 Fault Distribution:")
    for k, v in ground_truth["metadata"]["fault_statistics"].items():
        pct = (v / len(records)) * 100
        print(f"   - {k:22s}: {v:5d} ({pct:5.1f}%)")


if __name__ == "__main__":
    main()

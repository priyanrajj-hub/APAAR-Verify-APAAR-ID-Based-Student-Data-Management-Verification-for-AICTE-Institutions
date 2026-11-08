/**
 * Client-Side Synthetic Student Generator for Vercel Demo Mode
 */
import { StudentRecord, VerificationStatus } from '@apaar/shared-types';

const FN = [
  'Aarav', 'Priya', 'Karthik', 'Meera', 'Rahul', 'Ananya', 'Vikram', 'Sneha',
  'Arjun', 'Divya', 'Rohan', 'Kavya', 'Nikhil', 'Pooja', 'Suresh', 'Lakshmi',
  'Imran', 'Fatima', 'Gurpreet', 'Anjali', 'Aditya', 'Deepika', 'Manish', 'Swati'
];

const LN = [
  'Kumar', 'Sharma', 'Iyer', 'Reddy', 'Patel', 'Nair', 'Singh', 'Das',
  'Khan', 'Menon', 'Gupta', 'Rao', 'Joshi', 'Pillai', 'Verma', 'Bose'
];

const INST = [
  'Demo Institute of Tech',
  'Coimbatore College of Eng',
  'Pune Polytechnic',
  'Hyderabad Business School',
  'Delhi Tech University',
  'Jaipur Engineering College',
  'Kolkata Institute of Mgmt',
  'Bengaluru Tech Campus'
];

const PROG = ['B.Tech CSE', 'B.Tech ECE', 'B.Tech Mech', 'MBA', 'PGDM', 'Diploma'];

export function calculateLuhn(payload11: string): number {
  let s = 0;
  for (let i = 0; i < payload11.length; i++) {
    let n = +payload11[payload11.length - 1 - i];
    if (i % 2 === 0) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    s += n;
  }
  return (10 - (s % 10)) % 10;
}

export function generateValidApaar(rng: () => number): string {
  let p = '';
  for (let i = 0; i < 11; i++) {
    p += Math.floor(rng() * 10);
  }
  return p + calculateLuhn(p);
}

export function generateSyntheticBatch(count = 400, seed = 42): StudentRecord[] {
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  const pick = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];

  const records: StudentRecord[] = [];

  for (let i = 0; i < count; i++) {
    const birthYear = 2000 + Math.floor(rnd() * 7);
    const birthMonth = String(1 + Math.floor(rnd() * 9)).padStart(2, '0');
    const birthDay = String(10 + Math.floor(rnd() * 18)).padStart(2, '0');
    const dob = `${birthYear}-${birthMonth}-${birthDay}`;
    const apaar = generateValidApaar(rnd);
    const name = `${pick(FN)} ${pick(LN)}`;
    const inst = pick(INST);
    const prog = pick(PROG);
    const year = 2022 + Math.floor(rnd() * 4);
    const cgpa = +(5.5 + rnd() * 4.2).toFixed(2);
    const email = `s${i + 1}@${inst.toLowerCase().replace(/[^a-z]/g, '')}.edu.in`;

    records.push({
      id: `REC_${String(i + 1).padStart(5, '0')}`,
      apaarId: apaar,
      name,
      dob,
      gender: rnd() > 0.5 ? 'Male' : 'Female',
      category: 'General',
      institutionId: `INST_${(i % 8) + 1}`,
      institutionName: inst,
      programme: prog,
      academicYear: year,
      cgpa,
      email,
      attendancePct: +(70 + rnd() * 28).toFixed(1),
      status: 'VERIFIED',
      riskScore: 0,
      flags: [],
      reasons: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Inject intentional faults
  for (let i = 0; i < count; i++) {
    const r = records[i];
    const x = rnd();

    if (x < 0.05) {
      // Bad check digit
      r.apaarId = r.apaarId.slice(0, 11) + ((+r.apaarId[11] + 3) % 10);
    } else if (x < 0.08) {
      // Malformed format
      r.apaarId = r.apaarId.slice(0, 10);
    } else if (x < 0.12 && i > 0) {
      // Duplicate APAAR ID
      const prev = records[Math.floor(rnd() * i)];
      r.apaarId = prev.apaarId;
      r.name = prev.name;
      r.dob = prev.dob;
    } else if (x < 0.15 && i > 0) {
      // Fuzzy name variant with same DOB
      const prev = records[Math.floor(rnd() * i)];
      r.name = prev.name.replace(/a/i, 'aa');
      r.dob = prev.dob;
    } else if (x < 0.18) {
      // Out of range CGPA
      r.cgpa = +(10.5 + rnd() * 3.5).toFixed(2);
    } else if (x < 0.21) {
      // Underage student
      r.dob = '2014-04-12';
    } else if (x < 0.23) {
      // Missing required email
      r.email = '';
    }
  }

  return records;
}

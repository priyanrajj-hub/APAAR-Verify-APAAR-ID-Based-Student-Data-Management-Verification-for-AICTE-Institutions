/**
 * Pre-packaged messy test rosters for live judge evaluation
 */

export interface SampleRoster {
  id: string;
  name: string;
  description: string;
  expectedFaults: string;
  csvContent: string;
}

export const SAMPLE_ROSTERS: SampleRoster[] = [
  {
    id: 'messy_checksums_and_dates',
    name: '1. Messy Dates & Checksums',
    description: 'Tests non-standard date formats (DD/MM/YYYY) and invalid Luhn check-digits.',
    expectedFaults: '4 Luhn failures, 3 schema format flags, 1 date normalizer warning',
    csvContent: `apaar_id,student_name,dob,gender,course_code,admission_year,cgpa,institution_id,institution_name
987654321015,Aarav Sharma,2003-05-12,M,CSE,2022,8.45,INST_DEMO_001,Demo Institute of Technology
987654321018,Neha Patil,15/08/2002,F,ECE,2022,9.10,INST_DEMO_001,Demo Institute of Technology
987654321020,Rohan Iyer,2004-13-40,M,MECH,2023,7.20,INST_DEMO_001,Demo Institute of Technology
987654321033,Pooja Reddy,1970-01-01,F,CIVIL,2021,6.80,INST_DEMO_001,Demo Institute of Technology
987654321047,Vikram Singh,2015-06-19,M,AI_ML,2024,8.90,INST_DEMO_001,Demo Institute of Technology
987654321051,Ananya Deshmukh,2003-11-28,F,IT,2022,11.50,INST_DEMO_001,Demo Institute of Technology
987654321062,Karthik Subramanian,28-02-2003,M,CSE,2023,8.15,INST_DEMO_001,Demo Institute of Technology
987654321074,Divya Nair,2004-09-31,F,ECE,2023,7.90,INST_DEMO_001,Demo Institute of Technology
987654321089,Sanjay Kumar,invalid-date,M,MECH,2022,6.50,INST_DEMO_001,Demo Institute of Technology
987654321096,Sneha Joshi,2002-12-05,F,CSE,2021,8.75,INST_DEMO_001,Demo Institute of Technology`
  },
  {
    id: 'indic_scripts_and_transliteration',
    name: '2. Multi-Script Indic Names',
    description: 'Tests native Devanagari and Tamil script names with transliteration matching.',
    expectedFaults: 'Devanagari/Tamil script entity matching, transliteration confidence scoring',
    csvContent: `apaar_id,student_name,dob,gender,course_code,admission_year,cgpa,institution_id,institution_name
987654321105,राजेश शर्मा,2003-04-18,M,CSE,2022,8.60,INST_DEMO_001,Demo Institute of Technology
987654321113,Rajesh Sharma,2003-04-18,M,CSE,2022,8.60,INST_DEMO_001,Demo Institute of Technology
987654321121,கார்த்திக் சுந்தரம்,2002-10-14,M,ECE,2021,7.95,INST_DEMO_001,Demo Institute of Technology
987654321139,Karthik Sundaram,2002-10-14,M,ECE,2021,7.95,INST_DEMO_001,Demo Institute of Technology
987654321147,Mohammed Rizwan,2003-07-22,M,IT,2022,8.20,INST_DEMO_001,Demo Institute of Technology
987654321154,Mohd Rizwan,2003-07-22,M,IT,2022,8.20,INST_DEMO_001,Demo Institute of Technology
987654321162,Mr. Priya Dharshini,2004-01-30,F,AI_ML,2023,9.40,INST_DEMO_001,Demo Institute of Technology
987654321170,Deepak Choudhary,2003-09-08,M,CIVIL,2022,7.30,INST_DEMO_001,Demo Institute of Technology
987654321188,Deepak Chowdhary,2003-09-08,M,CIVIL,2022,7.30,INST_DEMO_001,Demo Institute of Technology
987654321196,Meera Krishnan,2004-05-16,F,ECE,2023,8.85,INST_DEMO_001,Demo Institute of Technology`
  },
  {
    id: 'cross_institute_duplicates',
    name: '3. Cross-Institution Duplicates',
    description: 'Tests detection of identical student IDs enrolled across multiple campuses.',
    expectedFaults: 'Multi-campus duplicate enrollment, scholarship conflict alert',
    csvContent: `apaar_id,student_name,dob,gender,course_code,admission_year,cgpa,institution_id,institution_name
987654321204,Aditya Verma,2003-03-25,M,CSE,2022,8.10,INST_DEMO_001,Demo Institute of Technology
987654321204,Aditya Verma,2003-03-25,M,CSE,2022,8.10,INST_DEMO_002,Metro Polytechnic (Demo)
987654321212,Kavita Nair,2002-11-19,F,ECE,2021,8.95,INST_DEMO_001,Demo Institute of Technology
987654321212,Kavitha Nair,2002-11-19,F,ECE,2021,8.95,INST_DEMO_003,Apex Engineering College (Demo)
987654321220,Pradeep Menon,2003-08-14,M,MECH,2022,7.40,INST_DEMO_001,Demo Institute of Technology
987654321220,Pradeep Menon,2003-08-14,M,MECH,2022,7.40,INST_DEMO_004,Western Technical Institute (Demo)
987654321238,Swathi Balaji,2004-02-11,F,AI_ML,2023,9.15,INST_DEMO_001,Demo Institute of Technology
987654321246,Harish Raghavan,2003-06-30,M,IT,2022,8.30,INST_DEMO_001,Demo Institute of Technology
987654321253,Tanvi Joshi,2004-04-05,F,CSE,2023,8.70,INST_DEMO_001,Demo Institute of Technology
987654321261,Naveen Kumar,2003-01-20,M,CIVIL,2022,6.90,INST_DEMO_001,Demo Institute of Technology`
  }
];

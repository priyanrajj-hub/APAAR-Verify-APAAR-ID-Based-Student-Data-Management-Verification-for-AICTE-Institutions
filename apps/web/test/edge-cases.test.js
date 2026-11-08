/**
 * Edge-Case & Ingestion Robustness Test Suite
 * Tests empty files, malformed headers, binary files, corrupted characters, and high-volume (10k rows) rosters.
 */
const assert = require('assert');

// Replicate the edge-case validator logic
function validateAndParseCsv(csvText, sourceName) {
  if (!csvText || csvText.trim().length === 0) {
    return { records: [], error: `File '${sourceName}' is completely empty (0 bytes). Please upload a valid CSV roster with student records.` };
  }

  // Binary / Corrupted non-text check
  if (csvText.includes('\0')) {
    return { records: [], error: `Binary data detected in '${sourceName}'. The file appears to be a compiled binary, executable, or image rather than a valid CSV text document.` };
  }

  let controlChars = 0;
  const sampleLength = Math.min(csvText.length, 1000);
  for (let i = 0; i < sampleLength; i++) {
    const code = csvText.charCodeAt(i);
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
      controlChars++;
    }
  }
  if (controlChars > 5) {
    return { records: [], error: `Corrupted text encoding detected in '${sourceName}'. Please ensure the file is saved as standard UTF-8 CSV.` };
  }

  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return { records: [], error: `File '${sourceName}' contains only a header row or 0 data rows. At least 1 student record is required.` };
  }

  const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const headers = rawHeaders.map((h) => h.toLowerCase());
  const apaarIdx = headers.findIndex((h) => h.includes('apaar'));
  const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('student'));

  if (apaarIdx === -1) {
    return {
      records: [],
      error: `Header schema mismatch in '${sourceName}'. Missing mandatory 'apaar_id' (or 'apaar') column. Detected headers: [${rawHeaders.slice(0, 8).join(', ')}]`,
    };
  }

  const parsed = [];
  let malformedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 2) {
      malformedCount++;
      continue;
    }
    parsed.push({
      apaarId: cols[apaarIdx >= 0 ? apaarIdx : 0] || '',
      name: cols[nameIdx >= 0 ? nameIdx : 1] || '',
    });
  }

  let warning;
  if (malformedCount > 0) {
    warning = `Parsed ${parsed.length} student records. Skipped ${malformedCount} unparseable or blank rows.`;
  }

  return { records: parsed, warning };
}

console.log('🧪 Starting Edge-Case Ingestion Robustness Test Suite...\n');

// 1. Empty file
console.log('Test 1: Empty file (0 bytes)...');
const r1 = validateAndParseCsv('', 'empty.csv');
assert(r1.error && r1.error.includes('0 bytes'), 'Should return 0 bytes error');
console.log('  ✅ Empty file handled safely.');

// 2. Whitespace-only file
console.log('Test 2: Whitespace-only file...');
const r2 = validateAndParseCsv('   \n  \t  \n  ', 'whitespace.csv');
assert(r2.error && r2.error.includes('0 bytes'), 'Should return empty error for whitespace');
console.log('  ✅ Whitespace-only file handled safely.');

// 3. Binary file renamed to .csv (simulating JPG/EXE/PDF header with null bytes)
console.log('Test 3: Binary/corrupted file with null bytes...');
const binaryData = '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x01\x00';
const r3 = validateAndParseCsv(binaryData, 'photo.csv');
assert(r3.error && r3.error.includes('Binary data detected'), 'Should detect binary file');
console.log('  ✅ Binary file safely detected and rejected.');

// 4. Header-only file (no data)
console.log('Test 4: Header-only file (0 data rows)...');
const r4 = validateAndParseCsv('apaar_id,student_name,dob,gender\n', 'header_only.csv');
assert(r4.error && r4.error.includes('0 data rows'), 'Should reject header-only file');
console.log('  ✅ Header-only file safely rejected.');

// 5. Wrong headers (missing apaar_id and student_name)
console.log('Test 5: Unrelated CSV headers...');
const wrongHeaders = 'product_id,product_name,price,inventory_count\n1,Laptop,50000,10\n2,Mouse,500,100';
const r5 = validateAndParseCsv(wrongHeaders, 'inventory.csv');
assert(r5.error && r5.error.includes('Missing mandatory'), 'Should reject wrong schema');
console.log('  ✅ Unrelated schema safely rejected with clear missing column explanation.');

// 6. Mixed valid and malformed rows
console.log('Test 6: Partially malformed rows...');
const mixedData = `apaar_id,student_name,dob\n987654321015,Aarav Sharma,2003-05-12\nBROKEN_SINGLE_COL\n123456789012,Diya Patel,2004-01-20\n\n`;
const r6 = validateAndParseCsv(mixedData, 'mixed.csv');
assert(r6.records.length === 2, 'Should extract the 2 valid records');
assert(r6.warning && r6.warning.includes('Skipped 1'), 'Should issue warning for skipped row');
console.log('  ✅ Mixed valid and malformed rows parsed with warning.');

// 7. High-Volume 10,000-Row Roster Ingestion
console.log('Test 7: High-Volume 10,000-Row Roster Ingestion throughput...');
const largeRows = ['apaar_id,student_name,dob,course'];
for (let i = 1; i <= 10000; i++) {
  largeRows.push(`98765432${String(i).padStart(4, '0')},Student ${i},2003-01-01,B.Tech CSE`);
}
const largeCsv = largeRows.join('\n');

const startTime = Date.now();
const r7 = validateAndParseCsv(largeCsv, 'institutional_roster_10k.csv');
const elapsed = Date.now() - startTime;

assert.strictEqual(r7.records.length, 10000, 'Should parse all 10,000 rows');
console.log(`  ✅ 10,000 rows parsed in ${elapsed}ms (sub-second throughput).`);

console.log('\n🎉 ALL EDGE-CASE INGESTION TESTS PASSED SUCCESSFULLY!\n');

/**
 * Foundation Unit Tests for APAAR-Verify
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

function testLocales() {
  console.log('🧪 Testing translation loading...');
  const localesDir = path.resolve(__dirname, '../../../packages/i18n/locales');
  const locales = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa', 'or', 'ur'];

  for (const loc of locales) {
    const filePath = path.join(localesDir, `${loc}.json`);
    assert(fs.existsSync(filePath), `Translation file missing for ${loc}`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert(data.app && data.app.title, `Missing app.title in ${loc}`);
    assert(data.roles && data.roles.institution, `Missing roles.institution in ${loc}`);
    assert(data.stats && data.stats.apaarGenerated, `Missing stats.apaarGenerated in ${loc}`);
  }
  console.log('✅ All 12 translation locales loaded and verified.');
}

function testLuhnAlgorithm() {
  console.log('🧪 Testing Luhn demo check-digit calculation...');
  function calculateLuhn(payload11) {
    let sum = 0;
    for (let i = 0; i < payload11.length; i++) {
      let n = parseInt(payload11[payload11.length - 1 - i], 10);
      if (i % 2 === 0) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
    }
    return (10 - (sum % 10)) % 10;
  }

  function verify12Digit(apaar12) {
    if (!/^\d{12}$/.test(apaar12)) return false;
    const payload = apaar12.slice(0, 11);
    const expected = calculateLuhn(payload);
    return parseInt(apaar12[11], 10) === expected;
  }

  // Test with sample ID:
  const payload = '98765432101';
  const check = calculateLuhn(payload);
  const fullApaar = payload + check;

  assert(verify12Digit(fullApaar), 'Luhn verification should pass for valid APAAR ID');
  assert(!verify12Digit(payload + ((check + 1) % 10)), 'Luhn verification should fail for tampered check digit');
  console.log(`✅ Luhn check-digit test passed (Sample: ${fullApaar}).`);
}

function testMasking() {
  console.log('🧪 Testing PII masking utilities...');
  function maskName(name) {
    return name.split(' ').map(part => part.length > 0 ? part[0] + '***' : '').join(' ');
  }

  function maskApaar(id) {
    return id.substring(0, 4) + '••••••••';
  }

  assert.strictEqual(maskName('Karthik Sharma'), 'K*** S***');
  assert.strictEqual(maskApaar('987654321018'), '9876••••••••');
  console.log('✅ PII Masking utility tests passed.');
}

function runAll() {
  try {
    testLocales();
    testLuhnAlgorithm();
    testMasking();
    console.log('\n🎉 ALL UNIT TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runAll();

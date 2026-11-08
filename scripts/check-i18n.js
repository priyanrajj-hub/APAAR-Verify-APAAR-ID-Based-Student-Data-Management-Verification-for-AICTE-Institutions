/**
 * Automated i18n Key Parity & Parity Checker
 * Fails CI if any locale is missing keys present in en.json
 */
const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.resolve(__dirname, '../packages/i18n/locales');
const BASE_LOCALE = 'en';

const REQUIRED_LOCALES = [
  'en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa', 'or', 'ur'
];

function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function runCheck() {
  console.log('🔍 Running i18n Key Parity Check across 12 Indian Languages...\n');

  const baseFile = path.join(LOCALES_DIR, `${BASE_LOCALE}.json`);
  if (!fs.existsSync(baseFile)) {
    console.error(`❌ Base locale file not found: ${baseFile}`);
    process.exit(1);
  }

  const baseData = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
  const baseKeys = new Set(flattenKeys(baseData));
  console.log(`📋 Base locale (${BASE_LOCALE}) defines ${baseKeys.size} translation keys.\n`);

  let hasError = false;

  for (const locale of REQUIRED_LOCALES) {
    const targetFile = path.join(LOCALES_DIR, `${locale}.json`);
    if (!fs.existsSync(targetFile)) {
      console.error(`❌ Missing locale translation file for: ${locale} (${targetFile})`);
      hasError = true;
      continue;
    }

    try {
      const targetData = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
      const targetKeys = new Set(flattenKeys(targetData));

      const missingKeys = [...baseKeys].filter(k => !targetKeys.has(k));
      const extraKeys = [...targetKeys].filter(k => !baseKeys.has(k));

      if (missingKeys.length > 0) {
        console.error(`❌ Locale '${locale}' is missing ${missingKeys.length} keys:`);
        missingKeys.slice(0, 5).forEach(k => console.error(`   - ${k}`));
        if (missingKeys.length > 5) console.error(`   ... and ${missingKeys.length - 5} more.`);
        hasError = true;
      } else {
        console.log(`✅ Locale '${locale}' has 100% key parity (${targetKeys.size}/${baseKeys.size} keys).`);
      }

      if (extraKeys.length > 0) {
        console.warn(`⚠️  Locale '${locale}' has ${extraKeys.length} unused extra keys.`);
      }
    } catch (err) {
      console.error(`❌ Failed to parse JSON for locale '${locale}':`, err.message);
      hasError = true;
    }
  }

  if (hasError) {
    console.error('\n❌ i18n parity check FAILED. Please sync missing translation keys.');
    process.exit(1);
  } else {
    console.log('\n✨ All 12 locales verified with 100% key parity! CI check PASSED.');
  }
}

runCheck();

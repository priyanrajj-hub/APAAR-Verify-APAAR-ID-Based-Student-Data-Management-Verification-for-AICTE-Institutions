const fs = require('fs');
const path = require('path');

const sample1Path = path.resolve(__dirname, '../../../data/samples/sample_messy_dates_and_checksums.csv');
const sample2Path = path.resolve(__dirname, '../../../data/samples/sample_transliteration_and_scripts.csv');
const sample3Path = path.resolve(__dirname, '../../../data/samples/sample_duplicate_students.csv');

module.exports = {
  SAMPLE_ROSTERS: [
    {
      id: 'messy_checksums_and_dates',
      csvContent: fs.readFileSync(sample1Path, 'utf8')
    },
    {
      id: 'indic_scripts_and_transliteration',
      csvContent: fs.readFileSync(sample2Path, 'utf8')
    },
    {
      id: 'cross_institute_duplicates',
      csvContent: fs.readFileSync(sample3Path, 'utf8')
    }
  ]
};

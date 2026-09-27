/**
 * roll-parser.js
 * Deterministic Roll Number Parser for Avanthi Cricket Carnival (ACC) 2026
 *
 * Implements strict academic classification:
 * - Regular B.Tech (YY811A...): Study Year = (26 - YY) + 1 -> B1 to B4
 * - Lateral B.Tech (YY815A...): Study Year = (26 - YY) + 2 -> B2 to B4
 * - Diploma (YY597-...): Study Year = (26 - YY) + 1 -> strictly D5
 * - PG (MBA/MCA/M.Tech): strictly M6 (no mandatory squad quota)
 */

const BRANCH_CODES = {
  '01': 'CIVIL',
  '02': 'EEE',
  '03': 'MECH',
  '04': 'ECE',
  '05': 'CSE',
  '12': 'IT',
  '42': 'CSM', // AI & ML
  '44': 'CSD', // Data Science
  'CM': 'CM',  // Diploma Computer Engineering
  'EC': 'EC',  // Diploma ECE
  'EE': 'EE',  // Diploma EEE
  'M':  'M'    // Diploma Mechanical
};

function parseRollNumber(rollInput) {
  if (!rollInput || typeof rollInput !== 'string') {
    return {
      valid: false,
      program: 'B.Tech',
      branch: 'CSE',
      entryType: 'Regular',
      admissionYear: 2026,
      year: 1,
      bucket: 'B1',
      label: 'B.Tech 1st Year (B1)'
    };
  }

  const roll = rollInput.trim().toUpperCase();

  // 1. PG Programs (MBA / MCA / M.Tech)
  if (roll.includes('MBA') || roll.includes('MCA') || roll.includes('MTECH') || roll.includes('M.TECH')) {
    let pgBranch = 'MBA';
    if (roll.includes('MCA')) pgBranch = 'MCA';
    if (roll.includes('MTECH') || roll.includes('M.TECH')) pgBranch = 'M.Tech';
    return {
      valid: true,
      program: 'PG',
      branch: pgBranch,
      entryType: 'Regular',
      admissionYear: 2025,
      year: 2,
      bucket: 'M6',
      label: 'PG — MBA/MCA/M.Tech (M6)'
    };
  }

  // 2. Diploma: Format YY597-BRANCH-NUM or YY597BRANCH...
  // Examples: 24597-CM-015, 26597-M-041
  const diplomaMatch = roll.match(/^(\d{2})597-?([A-Z]+)-?\d+/);
  if (diplomaMatch) {
    const yy = parseInt(diplomaMatch[1], 10);
    const branchCode = diplomaMatch[2];
    const branch = BRANCH_CODES[branchCode] || branchCode;
    const studyYear = Math.max(1, Math.min(3, (26 - yy) + 1));
    return {
      valid: true,
      program: 'Diploma',
      branch: branch,
      entryType: 'Regular',
      admissionYear: 2000 + yy,
      year: studyYear,
      bucket: 'D5',
      label: `Diploma Year ${studyYear} (D5)`
    };
  }

  // 3. B.Tech Regular (YY811A...) and Lateral Entry (YY815A...)
  // Examples: 25811A0403 (Year 2, B2), 25815A0403 (Year 3, B3), 23811A4201 (Year 4, B4), 26811A0501 (Year 1, B1)
  const btechMatch = roll.match(/^(\d{2})81(1|5)A([0-9A-Z]{2})\d+/);
  if (btechMatch) {
    const yy = parseInt(btechMatch[1], 10);
    const isLateral = btechMatch[2] === '5';
    const branchCode = btechMatch[3];
    const branch = BRANCH_CODES[branchCode] || (branchCode === '04' ? 'ECE' : branchCode === '05' ? 'CSE' : 'CSE');
    
    // Formula: Regular = (26 - yy) + 1; Lateral = (26 - yy) + 2
    let studyYear = (26 - yy) + (isLateral ? 2 : 1);
    if (studyYear < 1) studyYear = 1;
    if (studyYear > 4) studyYear = 4;
    
    const bucket = `B${studyYear}`;
    return {
      valid: true,
      program: 'B.Tech',
      branch: branch,
      entryType: isLateral ? 'Lateral' : 'Regular',
      admissionYear: 2000 + yy,
      year: studyYear,
      bucket: bucket,
      label: `B.Tech ${studyYear === 1 ? '1st' : studyYear === 2 ? '2nd' : studyYear === 3 ? '3rd' : '4th'} Year (${bucket})`
    };
  }

  // Fallback for custom or unmatched roll patterns
  return {
    valid: false,
    program: 'B.Tech',
    branch: 'CSE',
    entryType: 'Regular',
    admissionYear: 2026,
    year: 1,
    bucket: 'B1',
    label: 'B.Tech 1st Year (B1)'
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseRollNumber, BRANCH_CODES };
}
if (typeof window !== 'undefined') {
  window.parseRollNumber = parseRollNumber;
  window.BRANCH_CODES = BRANCH_CODES;
}

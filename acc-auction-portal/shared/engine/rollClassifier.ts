export type BucketId = 'B1' | 'B2' | 'B3' | 'B4' | 'D5' | 'M6';

export interface ClassificationResult {
  rollNumber: string;
  program: 'BTECH' | 'DIPLOMA' | 'MBA' | 'MCA' | 'MTECH';
  entryType: 'REGULAR' | 'LATERAL';
  branch: string;
  branchCode: string;
  admissionYear: number;
  studyYear: number;
  bucket: BucketId;
  referenceEligible: boolean;
}

const BRANCH_MAP: Record<string, string> = {
  '01': 'Civil Engineering',
  '02': 'EEE',
  '03': 'Mechanical Engineering',
  '04': 'ECE',
  '05': 'CSE',
  '12': 'IT',
  '42': 'CSM (AI & ML)',
  '44': 'CSD (Data Science)',
  '47': 'AIML',
  '66': 'IoT',
  'CM': 'Computer Engineering',
  'M': 'Mechanical Engineering',
  'EC': 'Electronics & Communication',
  'EE': 'Electrical Engineering',
  'C': 'Civil Engineering'
};

export function classifyRollNumber(rollNumber: string, currentAcademicStartYear: number = 2026): ClassificationResult {
  if (rollNumber.includes('597')) {
    const admissionYear = 2000 + parseInt(rollNumber.substring(0, 2), 10);
    const parts = rollNumber.split('-');
    const branchCode = parts[1];
    return {
      rollNumber,
      program: 'DIPLOMA',
      entryType: 'REGULAR',
      branch: BRANCH_MAP[branchCode] || 'Unknown',
      branchCode,
      admissionYear,
      studyYear: currentAcademicStartYear - admissionYear + 1,
      bucket: 'D5',
      referenceEligible: admissionYear === currentAcademicStartYear
    };
  }

  if (rollNumber.includes('811') || rollNumber.includes('815')) {
    const isLateral = rollNumber.includes('815');
    const admissionYear = 2000 + parseInt(rollNumber.substring(0, 2), 10);
    const entryType = isLateral ? 'LATERAL' : 'REGULAR';
    const studyYear = isLateral 
      ? currentAcademicStartYear - admissionYear + 2 
      : currentAcademicStartYear - admissionYear + 1;
    
    let bucket: BucketId = 'B4';
    if (studyYear === 1) bucket = 'B1';
    else if (studyYear === 2) bucket = 'B2';
    else if (studyYear === 3) bucket = 'B3';
    else if (studyYear >= 4) bucket = 'B4';

    const branchCode = rollNumber.substring(6, 8);
    
    return {
      rollNumber,
      program: 'BTECH',
      entryType,
      branch: BRANCH_MAP[branchCode] || 'Unknown',
      branchCode,
      admissionYear,
      studyYear,
      bucket,
      referenceEligible: admissionYear === currentAcademicStartYear
    };
  }

  // Fallback / PG
  const admissionYear = 2000 + parseInt(rollNumber.substring(0, 2), 10) || currentAcademicStartYear;
  return {
    rollNumber,
    program: 'MBA',
    entryType: 'REGULAR',
    branch: 'Unknown',
    branchCode: 'Unknown',
    admissionYear,
    studyYear: 1,
    bucket: 'M6',
    referenceEligible: admissionYear === currentAcademicStartYear
  };
}

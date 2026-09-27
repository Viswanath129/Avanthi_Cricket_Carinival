import { describe, it, expect } from 'vitest';
import { classifyRollNumber } from '../rollClassifier';

describe('Roll Number Classification', () => {
  it('25811A0403 → B2', () => {
    const result = classifyRollNumber('25811A0403', 2026);
    expect(result.bucket).toBe('B2');
    expect(result.studyYear).toBe(2);
    expect(result.entryType).toBe('REGULAR');
    expect(result.branch).toBe('ECE');
  });

  it('25815A0403 → B3', () => {
    const result = classifyRollNumber('25815A0403', 2026);
    expect(result.bucket).toBe('B3');
    expect(result.studyYear).toBe(3);
    expect(result.entryType).toBe('LATERAL');
  });

  it('23811A4201 → B4', () => {
    const result = classifyRollNumber('23811A4201', 2026);
    expect(result.bucket).toBe('B4');
    expect(result.studyYear).toBe(4);
  });

  it('24597-CM-015 → D5', () => {
    const result = classifyRollNumber('24597-CM-015', 2026);
    expect(result.bucket).toBe('D5');
    expect(result.program).toBe('DIPLOMA');
  });

  it('26597-M-041 → D5', () => {
    const result = classifyRollNumber('26597-M-041', 2026);
    expect(result.bucket).toBe('D5');
    expect(result.program).toBe('DIPLOMA');
  });

  it('26811A0501 → B1', () => {
    const result = classifyRollNumber('26811A0501', 2026);
    expect(result.bucket).toBe('B1');
    expect(result.studyYear).toBe(1);
  });

  it('marks referenceEligible for current year admission', () => {
    const result = classifyRollNumber('26811A0501', 2026);
    expect(result.referenceEligible).toBe(true);
  });

  it('marks NOT referenceEligible for older admission', () => {
    const result = classifyRollNumber('25811A0403', 2026);
    expect(result.referenceEligible).toBe(false);
  });
});

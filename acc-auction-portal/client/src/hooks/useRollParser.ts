import { useMemo } from 'react';
import { classifyRollNumber, ClassificationResult } from '@shared/engine/rollClassifier';

export interface UseRollParserReturn {
  raw: string;
  normalized: string;
  isReady: boolean;
  isValid: boolean;
  classification: ClassificationResult | null;
  error: string | null;
}

/**
 * Hook to live-parse student roll numbers according to ACC 2026 Academic Rollover rules.
 * Handles B.Tech Regular (YY811Abbnn), Lateral (YY815Abbnn), Diploma (YY597-BB-nnn), and PG.
 */
export function useRollParser(rollNumber: string, currentAcademicYear: number = 2026): UseRollParserReturn {
  const normalized = useMemo(() => {
    return rollNumber.trim().toUpperCase();
  }, [rollNumber]);

  return useMemo(() => {
    if (!normalized) {
      return {
        raw: rollNumber,
        normalized: '',
        isReady: false,
        isValid: false,
        classification: null,
        error: null,
      };
    }

    if (normalized.length < 6) {
      return {
        raw: rollNumber,
        normalized,
        isReady: false,
        isValid: false,
        classification: null,
        error: null,
      };
    }

    try {
      const result = classifyRollNumber(normalized, currentAcademicYear);
      return {
        raw: rollNumber,
        normalized,
        isReady: true,
        isValid: true,
        classification: result,
        error: null,
      };
    } catch (err: any) {
      return {
        raw: rollNumber,
        normalized,
        isReady: true,
        isValid: false,
        classification: null,
        error: err.message || 'Invalid roll number format',
      };
    }
  }, [rollNumber, normalized, currentAcademicYear]);
}

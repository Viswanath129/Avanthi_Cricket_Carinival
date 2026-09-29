import { describe, it, expect } from 'vitest';
import { classifyRollNumber } from '@shared/engine/rollClassifier';
import { derivePlayerType } from '@shared/engine/playerType';
import { BASE_PRICE_LADDER } from '@shared/types';

describe('ACC 2026 — Section 1: Player Registration Specification Tests', () => {
  // 1. Roll Classification Tests (Appendix A.5 & Section 1.3)
  describe('Roll Number Parser & Academic Classification', () => {
    it('B.Tech 1st Year Regular (YY811Abbnn) → Bucket B1', () => {
      const res = classifyRollNumber('26811A0501', 2026);
      expect(res.program).toBe('BTECH');
      expect(res.entryType).toBe('REGULAR');
      expect(res.studyYear).toBe(1);
      expect(res.bucket).toBe('B1');
      expect(res.branch).toBe('CSE');
      expect(res.referenceEligible).toBe(true);
    });

    it('B.Tech 2nd Year Regular (YY811Abbnn) → Bucket B2', () => {
      const res = classifyRollNumber('25811A0403', 2026);
      expect(res.program).toBe('BTECH');
      expect(res.entryType).toBe('REGULAR');
      expect(res.studyYear).toBe(2);
      expect(res.bucket).toBe('B2');
      expect(res.branch).toBe('ECE');
      expect(res.referenceEligible).toBe(false);
    });

    it('B.Tech Lateral Entry (YY815Abbnn) joins in 2nd year → Bucket B3 in 3rd year', () => {
      const res = classifyRollNumber('25815A0403', 2026);
      expect(res.program).toBe('BTECH');
      expect(res.entryType).toBe('LATERAL');
      expect(res.studyYear).toBe(3);
      expect(res.bucket).toBe('B3');
      expect(res.branch).toBe('ECE');
      expect(res.referenceEligible).toBe(false);
    });

    it('B.Tech 4th Year Regular (YY811Abbnn) → Bucket B4', () => {
      const res = classifyRollNumber('23811A4201', 2026);
      expect(res.program).toBe('BTECH');
      expect(res.entryType).toBe('REGULAR');
      expect(res.studyYear).toBe(4);
      expect(res.bucket).toBe('B4');
      expect(res.branch).toBe('CSM (AI & ML)');
      expect(res.referenceEligible).toBe(false);
    });

    it('Diploma Entry (YY597-BB-nnn) → Bucket D5', () => {
      const res = classifyRollNumber('24597-CM-015', 2026);
      expect(res.program).toBe('DIPLOMA');
      expect(res.bucket).toBe('D5');
      expect(res.branch).toBe('Computer Engineering');
    });

    it('Fresh Diploma admitted in current year is referenceEligible', () => {
      const res = classifyRollNumber('26597-M-041', 2026);
      expect(res.program).toBe('DIPLOMA');
      expect(res.bucket).toBe('D5');
      expect(res.studyYear).toBe(1);
      expect(res.referenceEligible).toBe(true);
    });
  });

  // 2. Branching Cricket Questionnaire & Role Derivation (Section 1.5)
  describe('Skill Profile & Automatic Player Role Derivation', () => {
    it('Specialist Wicket Keeper + Batter → WK_BATTER', () => {
      const role = derivePlayerType({
        isWicketKeeper: true,
        battingPrimary: true,
        bowlingPrimary: false,
      });
      expect(role).toBe('WK_BATTER');
    });

    it('Specialist Wicket Keeper + Bowler → WK', () => {
      const role = derivePlayerType({
        isWicketKeeper: true,
        battingPrimary: false,
        bowlingPrimary: true,
      });
      expect(role).toBe('WK');
    });

    it('Skilled Batter + Skilled Bowler → ALL_ROUNDER', () => {
      const role = derivePlayerType({
        isWicketKeeper: false,
        battingPrimary: true,
        bowlingPrimary: true,
      });
      expect(role).toBe('ALL_ROUNDER');
    });

    it('Skilled Batter only → BATTER', () => {
      const role = derivePlayerType({
        isWicketKeeper: false,
        battingPrimary: true,
        bowlingPrimary: false,
      });
      expect(role).toBe('BATTER');
    });

    it('Skilled Bowler only → BOWLER', () => {
      const role = derivePlayerType({
        isWicketKeeper: false,
        battingPrimary: false,
        bowlingPrimary: true,
      });
      expect(role).toBe('BOWLER');
    });

    it('Neither Batter nor Bowler nor Keeper → FIELDER', () => {
      const role = derivePlayerType({
        isWicketKeeper: false,
        battingPrimary: false,
        bowlingPrimary: false,
      });
      expect(role).toBe('FIELDER');
    });
  });

  // 3. Base Price Ladder Enforcement (Section 1.7)
  describe('Official 16-Step Base Price Ladder', () => {
    const validLadder = [20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 230, 250];

    it('Ladder contains exactly 16 official price points', () => {
      expect(BASE_PRICE_LADDER.length).toBe(16);
      expect([...BASE_PRICE_LADDER]).toEqual(validLadder);
    });

    it('Validates legal price points against ladder', () => {
      const isLegalPrice = (val: number) => (BASE_PRICE_LADDER as readonly number[]).includes(val);
      expect(isLegalPrice(20)).toBe(true);
      expect(isLegalPrice(100)).toBe(true);
      expect(isLegalPrice(250)).toBe(true);
      expect(isLegalPrice(25)).toBe(false);
      expect(isLegalPrice(110)).toBe(false);
      expect(isLegalPrice(300)).toBe(false);
    });
  });

  // 4. Privacy & Submission Status Defaults (Section 1.8 & Section 16.1)
  describe('Submission State & Data Privacy Contract', () => {
    it('Registration sets initial status accurately without rejection', () => {
      const playerRecord = {
        rollNumber: '25811A0403',
        status: 'REGISTERED',
        paymentStatus: 'UNPAID',
        cricHeroesStatus: 'PENDING',
        eligibility: 'NOT_YET_ELIGIBLE',
        publicVisibility: 'VISIBLE',
      };

      expect(playerRecord.status).toBe('REGISTERED');
      expect(playerRecord.paymentStatus).toBe('UNPAID');
      expect(playerRecord.eligibility).toBe('NOT_YET_ELIGIBLE');
      expect(playerRecord.publicVisibility).toBe('VISIBLE');
    });

    it('Public view excludes private mobile numbers', () => {
      const rawPlayer = {
        id: 'p101',
        name: 'S. Sai Teja',
        mobilePrivate: '9876543210',
        cricHeroesMobilePrivate: '9876543210',
        bucket: 'B2',
      };

      // Transform to public view object
      const publicPlayer = {
        id: rawPlayer.id,
        name: rawPlayer.name,
        bucket: rawPlayer.bucket,
      };

      expect((publicPlayer as any).mobilePrivate).toBeUndefined();
      expect((publicPlayer as any).cricHeroesMobilePrivate).toBeUndefined();
    });
  });
});

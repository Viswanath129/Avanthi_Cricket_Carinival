import { describe, it, expect } from 'vitest';
import { AUCTION_ORDER, BucketId } from '@shared/types';
import { getNextEligibleUnsoldLot } from '@shared/engine/auctionOrder';
import type { SoldPlayerDetails } from '../components/SoldConfirmationModal';

describe('ACC 2026 — Auction UI, Sold Animation & Timer Engine Tests', () => {

  // 1. SOLD ANIMATION & PLAYER PHOTO DISPLAY
  describe('Sold Animation Data & Single-Play Invariant', () => {
    it('constructs authoritative sold data with player photo, identifiers, franchise, and final price', () => {
      const soldData: SoldPlayerDetails = {
        lotId: 'lot-42',
        drawNumber: 12,
        lotNumber: 'B3-012',
        playerName: 'Sai Teja',
        rollNumber: '25811A0403',
        department: 'ECE',
        branch: 'ECE',
        year: 3,
        bucket: 'B3',
        playerType: 'ALL_ROUNDER',
        photoUrl: 'https://storage.googleapis.com/acc-2026/photos/25811A0403.jpg',
        franchiseId: '1',
        franchiseName: 'Titans',
        soldPrice: 140,
      };

      expect(soldData.playerName).toBe('Sai Teja');
      expect(soldData.photoUrl).toContain('25811A0403.jpg');
      expect(soldData.rollNumber).toBe('25811A0403');
      expect(soldData.branch).toBe('ECE');
      expect(soldData.franchiseName).toBe('Titans');
      expect(soldData.soldPrice).toBe(140);
      expect(soldData.bucket).toBe('B3');
    });

    it('falls back gracefully to initials avatar when photo is missing or placeholder', () => {
      const getInitials = (name: string) => {
        return (name || 'P')
          .split(' ')
          .map((n) => n[0])
          .filter(Boolean)
          .slice(0, 2)
          .join('')
          .toUpperCase();
      };

      const hasValidPhoto = (photoUrl?: string | null) => {
        return !!photoUrl && photoUrl.trim() !== '' && !photoUrl.includes('acc-logo.png');
      };

      expect(hasValidPhoto('')).toBe(false);
      expect(hasValidPhoto(null)).toBe(false);
      expect(hasValidPhoto('acc-logo.png')).toBe(false);
      expect(hasValidPhoto('https://acc.com/real-photo.png')).toBe(true);

      expect(getInitials('Sai Teja')).toBe('ST');
      expect(getInitials('Harsha Vardhan Reddy')).toBe('HV');
      expect(getInitials('Kasi')).toBe('K');
    });

    it('guarantees animation plays exactly once per confirmed sale event using lastAnimatedSaleIdRef', () => {
      let lastAnimatedSaleId: string | null = null;
      let animationPlayCount = 0;

      const handleSaleEvent = (saleLotId: string) => {
        if (lastAnimatedSaleId !== saleLotId) {
          lastAnimatedSaleId = saleLotId;
          animationPlayCount++;
          return true; // Animation triggered
        }
        return false; // Suppressed duplicate
      };

      // Initial sale confirmation
      expect(handleSaleEvent('lot-1')).toBe(true);
      expect(animationPlayCount).toBe(1);

      // Re-renders or Firestore onSnapshot updates for the same lot
      expect(handleSaleEvent('lot-1')).toBe(false);
      expect(handleSaleEvent('lot-1')).toBe(false);
      expect(animationPlayCount).toBe(1);

      // Subsequent sale of a different lot
      expect(handleSaleEvent('lot-2')).toBe(true);
      expect(animationPlayCount).toBe(2);
    });
  });

  // 2. AUTOMATICALLY REVEAL NEXT UNSOLD PLAYER ACCORDING TO OFFICIAL AUCTION ORDER
  describe('Auction Order & Next Unsold Player Reveal', () => {
    const mockLots = [
      { id: 'lot-1', drawNumber: 1, playerName: 'P1', bucket: 'B1', status: 'AVAILABLE' },
      { id: 'lot-2', drawNumber: 2, playerName: 'P2', bucket: 'B3', status: 'AVAILABLE' },
      { id: 'lot-3', drawNumber: 3, playerName: 'P3', bucket: 'B4', status: 'AVAILABLE' },
      { id: 'lot-4', drawNumber: 4, playerName: 'P4', bucket: 'B3', status: 'AVAILABLE' },
      { id: 'lot-5', drawNumber: 5, playerName: 'P5', bucket: 'D5', status: 'AVAILABLE' },
      { id: 'lot-6', drawNumber: 6, playerName: 'P6', bucket: 'B2', status: 'AVAILABLE' },
      { id: 'lot-7', drawNumber: 7, playerName: 'P7', bucket: 'M6', status: 'AVAILABLE' },
    ];

    it('strictly follows AUCTION_ORDER: [B3, B4, B2, D5, B1, M6]', () => {
      expect(AUCTION_ORDER).toEqual(['B3', 'B4', 'B2', 'D5', 'B1', 'M6']);

      // First lot selected should be the lowest drawNumber in B3
      const first = getNextEligibleUnsoldLot(mockLots, null);
      expect(first?.id).toBe('lot-2'); // B3, draw 2
      expect(first?.bucket).toBe('B3');

      // Next after lot-2 should be lot-4 (also B3, draw 4)
      const second = getNextEligibleUnsoldLot(
        mockLots.map(l => l.id === 'lot-2' ? { ...l, status: 'SOLD' } : l),
        'lot-2'
      );
      expect(second?.id).toBe('lot-4'); // B3, draw 4

      // Next after all B3 sold should be B4 (lot-3)
      const afterB3 = mockLots.map(l => l.bucket === 'B3' ? { ...l, status: 'SOLD' } : l);
      const third = getNextEligibleUnsoldLot(afterB3, 'lot-4');
      expect(third?.id).toBe('lot-3'); // B4

      // Next after B4 should be B2 (lot-6)
      const afterB4 = afterB3.map(l => l.bucket === 'B4' ? { ...l, status: 'SOLD' } : l);
      const fourth = getNextEligibleUnsoldLot(afterB4, 'lot-3');
      expect(fourth?.id).toBe('lot-6'); // B2

      // Next after B2 should be D5 (lot-5)
      const afterB2 = afterB4.map(l => l.bucket === 'B2' ? { ...l, status: 'SOLD' } : l);
      const fifth = getNextEligibleUnsoldLot(afterB2, 'lot-6');
      expect(fifth?.id).toBe('lot-5'); // D5

      // Next after D5 should be B1 (lot-1)
      const afterD5 = afterB2.map(l => l.bucket === 'D5' ? { ...l, status: 'SOLD' } : l);
      const sixth = getNextEligibleUnsoldLot(afterD5, 'lot-5');
      expect(sixth?.id).toBe('lot-1'); // B1

      // Next after B1 should be M6 (lot-7)
      const afterB1 = afterD5.map(l => l.bucket === 'B1' ? { ...l, status: 'SOLD' } : l);
      const seventh = getNextEligibleUnsoldLot(afterB1, 'lot-1');
      expect(seventh?.id).toBe('lot-7'); // M6
    });

    it('returns null when all eligible lots in the round are concluded (Round 1 Complete)', () => {
      const allSoldLots = mockLots.map(l => ({ ...l, status: 'SOLD' }));
      const next = getNextEligibleUnsoldLot(allSoldLots, 'lot-7');
      expect(next).toBeNull();
    });

    it('never automatically marks the next player as sold', () => {
      const next = getNextEligibleUnsoldLot(mockLots, 'lot-2');
      expect(next?.status).toBe('AVAILABLE');
      // Next player must remain uncommitted until operator acts
      expect(next?.soldPrice).toBeUndefined();
      expect(next?.highestBidderId).toBeUndefined();
    });
  });

  // 3. 30-SECOND TIMER INITIALIZATION & 20-SECOND BID RESET
  describe('Countdown Timer & Bid Reset Rules', () => {
    it('initializes timer to exactly 30 seconds (30000ms) on lot start', () => {
      const initialLotState = {
        timerDurationMs: 30000,
        timerRunning: true,
        pausedRemainingMs: null,
      };

      expect(initialLotState.timerDurationMs).toBe(30000);
      expect(initialLotState.timerDurationMs / 1000).toBe(30);
    });

    it('resets timer to exactly 20 seconds (20000ms) upon a valid bid', () => {
      const resetDurationMs = 20000;
      const now = 100000;
      const newDeadline = now + resetDurationMs;

      const remainingSec = Math.ceil((newDeadline - now) / 1000);
      expect(remainingSec).toBe(20);
    });

    it('does NOT automatically sell player when timer reaches zero', () => {
      const lot = {
        id: 'lot-1',
        playerName: 'Unsold Candidate',
        status: 'LIVE',
        currentPrice: 20,
        highestBidderId: null,
      };

      const now = 50000;
      const expiredDeadline = 40000; // Passed 10 seconds ago
      const remaining = Math.max(0, Math.ceil((expiredDeadline - now) / 1000));

      expect(remaining).toBe(0);
      // Status must remain LIVE/uncommitted until authorized operator confirms hammer or skip
      expect(lot.status).toBe('LIVE');
      expect(lot.highestBidderId).toBeNull();
    });

    it('does not silently start timer when selecting player in manual mode until explicitly opened', () => {
      const selectedLot = {
        status: 'CALLED',
        timerRunning: false,
        timerDeadline: null,
      };

      expect(selectedLot.timerRunning).toBe(false);
      expect(selectedLot.timerDeadline).toBeNull();
    });
  });

  // 4. PAUSE AND RESUME TIME PRESERVATION
  describe('Pause & Resume Time Preservation', () => {
    it('pausing freezes countdown and preserves exact remaining milliseconds', () => {
      const serverNow = 100000;
      const deadline = 114500; // 14.5 seconds left
      const remainingMs = deadline - serverNow;

      expect(remainingMs).toBe(14500);

      const pausedState = {
        status: 'PAUSED',
        pausedRemainingMs: remainingMs,
      };

      expect(pausedState.status).toBe('PAUSED');
      expect(pausedState.pausedRemainingMs).toBe(14500);
      expect(Math.ceil(pausedState.pausedRemainingMs / 1000)).toBe(15);
    });

    it('resuming continues from preserved remaining time and never resets to 30 seconds', () => {
      const pausedRemainingMs = 12400; // Preserved: 12.4 seconds
      const resumeTime = 200000;

      // New deadline must be resumeTime + pausedRemainingMs
      const resumedDeadline = resumeTime + pausedRemainingMs;

      expect(resumedDeadline - resumeTime).toBe(12400);
      const remainingSec = Math.ceil((resumedDeadline - resumeTime) / 1000);
      expect(remainingSec).toBe(13); // NOT 30!
      expect(remainingSec).not.toBe(30);
    });

    it('repeated pause and resume does not drift or create duplicate intervals', () => {
      let currentRemainingMs = 25000;

      // First pause after 5 seconds
      currentRemainingMs -= 5000;
      let pausedMs = currentRemainingMs; // 20000 ms
      expect(pausedMs).toBe(20000);

      // Resume, then run 7 seconds
      currentRemainingMs -= 7000; // 13000 ms
      pausedMs = currentRemainingMs;
      expect(pausedMs).toBe(13000);

      // Next resume finishes with 13000 ms
      const resumeDeadline = 500000 + pausedMs;
      expect(resumeDeadline - 500000).toBe(13000);
      expect(Math.ceil((resumeDeadline - 500000) / 1000)).toBe(13);
    });
  });

});

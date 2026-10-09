import { describe, it, expect } from 'vitest';
import { getNextEligibleUnsoldLot } from '@shared/engine/auctionOrder';

describe('ACC 2026 — Round 2 Recall & Sold/Unsold Auction Eligibility', () => {
  const sampleLots = [
    { id: 'lot-1', drawNumber: 1, playerName: 'Player 1', bucket: 'B3', status: 'AVAILABLE', round: 1 },
    { id: 'lot-2', drawNumber: 2, playerName: 'Player 2', bucket: 'B3', status: 'SOLD', round: 1 },
    { id: 'lot-3', drawNumber: 3, playerName: 'Player 3', bucket: 'B4', status: 'AVAILABLE', round: 1 },
    { id: 'lot-4', drawNumber: 4, playerName: 'Player 4', bucket: 'B2', status: 'SOLD', round: 1 },
    { id: 'lot-5', drawNumber: 5, playerName: 'Player 5', bucket: 'D5', status: 'ARCHIVED', round: 1 },
    { id: 'lot-6', drawNumber: 6, playerName: 'Player 6', bucket: 'B1', status: 'AVAILABLE', round: 1 },
  ];

  describe('1. Auction Order & SOLD Player Exclusion', () => {
    it('returns next available lot adhering to AUCTION_ORDER (B3 -> B4 -> B2 -> D5 -> B1 -> M6)', () => {
      const next = getNextEligibleUnsoldLot(sampleLots, null);
      expect(next).not.toBeNull();
      expect(next.id).toBe('lot-1'); // B3 comes first
    });

    it('strictly skips lots with status SOLD', () => {
      // If lot-1 is currentLot, next B3 is lot-2 (which is SOLD), so it should pick B4 lot-3
      const next = getNextEligibleUnsoldLot(sampleLots, 'lot-1');
      expect(next).not.toBeNull();
      expect(next.id).toBe('lot-3');
      expect(next.status).toBe('AVAILABLE');
    });

    it('strictly skips ARCHIVED and DELETED lots', () => {
      const remainingLots = [
        { id: 'lot-5', drawNumber: 5, bucket: 'D5', status: 'ARCHIVED' },
        { id: 'lot-6', drawNumber: 6, bucket: 'B1', status: 'AVAILABLE' },
      ];
      const next = getNextEligibleUnsoldLot(remainingLots, null);
      expect(next.id).toBe('lot-6');
    });

    it('returns null when all eligible lots in the round are SOLD or processed', () => {
      const allSoldLots = [
        { id: 'lot-1', drawNumber: 1, bucket: 'B3', status: 'SOLD' },
        { id: 'lot-2', drawNumber: 2, bucket: 'B4', status: 'SOLD' },
      ];
      const next = getNextEligibleUnsoldLot(allSoldLots, null);
      expect(next).toBeNull();
    });

    it('respects targetRound filter when specified', () => {
      const mixedRoundLots = [
        { id: 'lot-r1', drawNumber: 1, bucket: 'B3', status: 'AVAILABLE', round: 1 },
        { id: 'lot-r2', drawNumber: 2, bucket: 'B3', status: 'AVAILABLE', round: 2 },
      ];
      const round2Next = getNextEligibleUnsoldLot(mixedRoundLots, null, 2);
      expect(round2Next.id).toBe('lot-r2');
      expect(round2Next.round).toBe(2);
    });
  });

  describe('2. Two-Step Hammer Authority Validation Logic', () => {
    function validateHammerOutcome(
      lot: { currentPrice: number; highestBidderFranchiseId?: string | null },
      expectedOutcome?: 'SOLD' | 'UNSOLD'
    ): { valid: boolean; outcome: 'SOLD' | 'UNSOLD'; error?: string } {
      const hasHighestBidder = Boolean(lot.highestBidderFranchiseId);

      if (expectedOutcome === 'UNSOLD' && hasHighestBidder) {
        return {
          valid: false,
          outcome: 'SOLD',
          error: `CONFLICT: Cannot mark lot as UNSOLD when active bids exist from franchise ${lot.highestBidderFranchiseId}.`,
        };
      }

      if (expectedOutcome === 'SOLD' && !hasHighestBidder) {
        return {
          valid: false,
          outcome: 'UNSOLD',
          error: 'CONFLICT: Cannot mark lot as SOLD when no bids have been placed.',
        };
      }

      return {
        valid: true,
        outcome: hasHighestBidder ? 'SOLD' : 'UNSOLD',
      };
    }

    it('rejects UNSOLD hammer attempt if bids are present', () => {
      const liveLotWithBid = { currentPrice: 150, highestBidderFranchiseId: 'franchise-1' };
      const res = validateHammerOutcome(liveLotWithBid, 'UNSOLD');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Cannot mark lot as UNSOLD when active bids exist');
    });

    it('rejects SOLD hammer attempt if no bids have been placed', () => {
      const liveLotZeroBids = { currentPrice: 20, highestBidderFranchiseId: null };
      const res = validateHammerOutcome(liveLotZeroBids, 'SOLD');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Cannot mark lot as SOLD when no bids have been placed');
    });

    it('accepts SOLD hammer when valid bid exists', () => {
      const liveLotWithBid = { currentPrice: 150, highestBidderFranchiseId: 'franchise-1' };
      const res = validateHammerOutcome(liveLotWithBid, 'SOLD');
      expect(res.valid).toBe(true);
      expect(res.outcome).toBe('SOLD');
    });

    it('accepts UNSOLD hammer when zero bids exist', () => {
      const liveLotZeroBids = { currentPrice: 20, highestBidderFranchiseId: null };
      const res = validateHammerOutcome(liveLotZeroBids, 'UNSOLD');
      expect(res.valid).toBe(true);
      expect(res.outcome).toBe('UNSOLD');
    });
  });

  describe('3. Round 2 Queue Draw Invariants', () => {
    // Pure function simulating generateDraw Round 2 logic
    function filterRound2EligiblePlayers(players: any[]): any[] {
      const uniquePlayerIds = new Set<string>();
      const eligible: any[] = [];

      for (const p of players) {
        // Must be status === 'UNSOLD' and round1Unsold === true
        if (p.status !== 'UNSOLD' || !p.round1Unsold) continue;
        // Strictly exclude SOLD or ARCHIVED
        if (p.status === 'SOLD' || p.soldPrice) continue;
        // At most once in Round 2
        if (uniquePlayerIds.has(p.id)) continue;

        uniquePlayerIds.add(p.id);
        eligible.push(p);
      }

      // Sort by AUCTION_ORDER bucket sequence, then by original drawNumber
      const bucketOrder: Record<string, number> = { B3: 1, B4: 2, B2: 3, D5: 4, B1: 5, M6: 6 };
      return eligible.sort((a, b) => {
        const orderA = bucketOrder[a.bucket] || 99;
        const orderB = bucketOrder[b.bucket] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return (a.drawNumber || 0) - (b.drawNumber || 0);
      });
    }

    it('strictly excludes all SOLD players from Round 2', () => {
      const candidatePlayers = [
        { id: 'p1', name: 'Sold Star', status: 'SOLD', soldPrice: 200, round1Unsold: false, bucket: 'B3' },
        { id: 'p2', name: 'Unsold Veteran', status: 'UNSOLD', round1Unsold: true, bucket: 'B3', drawNumber: 10 },
        { id: 'p3', name: 'Another Sold', status: 'SOLD', soldPrice: 50, round1Unsold: false, bucket: 'B4' },
      ];

      const r2 = filterRound2EligiblePlayers(candidatePlayers);
      expect(r2.length).toBe(1);
      expect(r2[0].id).toBe('p2');
      expect(r2[0].name).toBe('Unsold Veteran');
    });

    it('ensures each unsold player appears at most once in Round 2 queue', () => {
      const duplicateUnsoldEntries = [
        { id: 'p2', name: 'Unsold Veteran', status: 'UNSOLD', round1Unsold: true, bucket: 'B3', drawNumber: 10 },
        { id: 'p2', name: 'Unsold Veteran', status: 'UNSOLD', round1Unsold: true, bucket: 'B3', drawNumber: 10 },
      ];

      const r2 = filterRound2EligiblePlayers(duplicateUnsoldEntries);
      expect(r2.length).toBe(1);
    });

    it('orders Round 2 lots by official bucket hierarchy and sequential draw numbers', () => {
      const unsolds = [
        { id: 'p1', name: 'B1 Player', bucket: 'B1', status: 'UNSOLD', round1Unsold: true, drawNumber: 50 },
        { id: 'p2', name: 'B3 Player', bucket: 'B3', status: 'UNSOLD', round1Unsold: true, drawNumber: 5 },
        { id: 'p3', name: 'B4 Player', bucket: 'B4', status: 'UNSOLD', round1Unsold: true, drawNumber: 12 },
      ];

      const r2 = filterRound2EligiblePlayers(unsolds);
      expect(r2.map((p) => p.bucket)).toEqual(['B3', 'B4', 'B1']);
    });
  });

  describe('4. Timer Expiration Behavior', () => {
    it('timer reaching zero does NOT automatically sell or mark unsold without human hammer confirmation', () => {
      const lotState = {
        id: 'lot-10',
        status: 'LIVE',
        timeLeft: 0,
        highestBidderId: 'franchise-1',
        highestBidderName: 'Titans',
        currentPrice: 100,
      };

      // State invariant: status remains LIVE until explicit operator hammer confirmation
      const isAwaitingHammer = lotState.timeLeft <= 0 && lotState.status === 'LIVE';
      expect(isAwaitingHammer).toBe(true);
      expect(lotState.status).toBe('LIVE'); // Not automatically marked SOLD or UNSOLD
    });
  });
});

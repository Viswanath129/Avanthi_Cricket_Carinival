import { describe, expect, it } from 'vitest';

type Bid = { sessionId: string; franchiseId: string; amount: number };
type Lot = { id: string; sessionId: string; deadline: number; status: 'BIDDING' | 'SOLD' | 'UNSOLD'; currentPrice: number; highestBidderId: string | null };

function finalize(lot: Lot, active: { lotId: string; sessionId: string }, bids: Bid[], requested: 'SOLD' | 'UNSOLD', now: number) {
  if (lot.status === 'SOLD' || lot.status === 'UNSOLD') return { ok: false, reason: 'already finalized' };
  if (active.lotId !== lot.id || active.sessionId !== lot.sessionId) return { ok: false, reason: 'stale session' };
  const winning = bids.filter((bid) => bid.sessionId === lot.sessionId).sort((a, b) => b.amount - a.amount)[0];
  if (requested === 'UNSOLD') {
    if (winning) return { ok: false, reason: 'valid bid exists' };
    if (now < lot.deadline) return { ok: false, reason: 'timer has not expired' };
    return { ok: true, outcome: 'UNSOLD' };
  }
  if (!winning || winning.franchiseId !== lot.highestBidderId || winning.amount !== lot.currentPrice) return { ok: false, reason: 'no valid winning bid' };
  return { ok: true, outcome: 'SOLD' };
}

describe('authoritative auction-session finalization contract', () => {
  const sessionId = 'session-new';
  const active = { lotId: 'lot-1', sessionId };
  const baseLot: Lot = { id: 'lot-1', sessionId, deadline: 30_000, status: 'BIDDING', currentPrice: 20, highestBidderId: null };

  it('starts a revealed lot with a new 30-second authoritative session deadline', () => {
    const now = 1_000;
    const revealed = { ...baseLot, deadline: now + 30_000 };
    expect(revealed.deadline - now).toBe(30_000);
    expect(revealed.sessionId).toBe(sessionId);
  });

  it('confirms an expired no-bid auction as UNSOLD but rejects it before expiry', () => {
    expect(finalize(baseLot, active, [], 'UNSOLD', 30_000)).toMatchObject({ ok: true, outcome: 'UNSOLD' });
    expect(finalize(baseLot, active, [], 'UNSOLD', 29_999)).toMatchObject({ ok: false, reason: 'timer has not expired' });
  });

  it('confirms SOLD only for the accepted winning bid', () => {
    const soldLot = { ...baseLot, currentPrice: 80, highestBidderId: 'franchise-a' };
    expect(finalize(soldLot, active, [{ sessionId, franchiseId: 'franchise-a', amount: 80 }], 'SOLD', 10_000))
      .toMatchObject({ ok: true, outcome: 'SOLD' });
  });

  it('rejects stale session IDs, duplicate hammers, and concurrent bid state that no longer matches the lot', () => {
    expect(finalize(baseLot, { lotId: 'lot-1', sessionId: 'session-old' }, [], 'UNSOLD', 30_000)).toMatchObject({ ok: false, reason: 'stale session' });
    expect(finalize({ ...baseLot, status: 'SOLD' }, active, [], 'UNSOLD', 30_000)).toMatchObject({ ok: false, reason: 'already finalized' });
    expect(finalize({ ...baseLot, currentPrice: 80, highestBidderId: 'franchise-a' }, active, [{ sessionId, franchiseId: 'franchise-b', amount: 90 }], 'SOLD', 10_000))
      .toMatchObject({ ok: false, reason: 'no valid winning bid' });
  });
});

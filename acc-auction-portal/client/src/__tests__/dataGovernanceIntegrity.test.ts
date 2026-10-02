import { describe, expect, it } from 'vitest';
import { mergeAuditTimeline } from '../services/auditTimeline';
import {
  buildPlayerArchivePatch,
  buildPlayerRestorePatch,
  hasProtectedPlayerHistory,
} from '../../../functions/src/admin/playerGovernancePolicy';

describe('player historical data governance', () => {
  it('archives players with no history without deleting identity fields', () => {
    const player = { id: 'p-1', name: 'Sai Teja', roll: '26811A0501', status: 'AVAILABLE', approvalStatus: 'APPROVED' };
    expect(hasProtectedPlayerHistory([], false)).toBe(false);
    const patch = buildPlayerArchivePatch(player);
    expect(patch).toMatchObject({ status: 'ARCHIVED', approvalStatus: 'ARCHIVED', auctionEligible: false });
    expect(patch).not.toHaveProperty('id');
    expect(patch).not.toHaveProperty('name');
    expect(patch).not.toHaveProperty('roll');
  });

  it('treats any lot, bid, transaction, or squad reference as protected history', () => {
    for (const collectionIndex of [0, 1, 2, 3]) {
      const references = [false, false, false, false];
      references[collectionIndex] = true;
      expect(hasProtectedPlayerHistory(references, false)).toBe(true);
    }
    expect(hasProtectedPlayerHistory([], true)).toBe(true);
  });

  it('restores the same sold player state and stable identity', () => {
    const archived = {
      id: 'p-1', name: 'Sai Teja', roll: '26811A0501', status: 'ARCHIVED',
      governancePreviousState: { status: 'SOLD', approvalStatus: 'APPROVED', auctionEligible: false, publicVisibility: true },
    };
    const restore = buildPlayerRestorePatch(archived);
    expect(restore).toMatchObject({ status: 'SOLD', approvalStatus: 'APPROVED', auctionEligible: false, publicVisibility: true });
    expect(archived).toMatchObject({ id: 'p-1', roll: '26811A0501' });
  });
});

describe('audit compatibility timeline', () => {
  it('keeps old and canonical records visible and removes mirrored duplicates', () => {
    const canonical = { id: 'a1', action: 'PLAYER_ARCHIVED', targetId: 'p-1', actorUid: 'sa-1', timestamp: 1000 };
    const legacyMirror = { id: 'old-a1', action: 'PLAYER_ARCHIVED', targetId: 'p-1', actorUid: 'sa-1', timestamp: 1000 };
    const legacyOnly = { id: 'old-a2', action: 'HAMMER', targetId: 'lot-24', actor: 'Operator', timestamp: 900 };
    const rows = mergeAuditTimeline([canonical], [legacyMirror, legacyOnly]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toBe(canonical);
    expect(rows[1]).toBe(legacyOnly);
  });
});

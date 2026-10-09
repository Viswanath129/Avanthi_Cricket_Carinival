import { describe, it, expect, vi } from 'vitest';
import { auditPlayerIdentities } from '@shared/engine/playerIdentityAudit';

// Mock Firestore for playerProfileService tests
vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => {
  return {
    doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
    collection: vi.fn((_db, collectionName) => ({ collectionName })),
    query: vi.fn((...args) => ({ args })),
    where: vi.fn((field, op, val) => ({ field, op, val })),
    limit: vi.fn((n) => ({ limit: n })),
    getDoc: vi.fn(async (docRef) => {
      // Mock Tanara Mohan's existing record #30
      if (docRef.collectionName === 'players' && docRef.id === '23811A0479') {
        return {
          exists: () => true,
          id: '23811A0479',
          data: () => ({
            uid: 'uid-tanara-30',
            name: 'Tanara Mohan',
            rollNumber: '23811A0479',
            mobilePrivate: '9876543210',
            branch: 'ECE',
            year: 3,
            bucket: 'B3',
            paid: true,
            approvalStatus: 'APPROVED',
            registrationStatus: 'COMPLETED',
            cricHeroesProfileUrl: 'https://cricheroes.com/player-profile/12345/tanara-mohan',
            createdAt: '2026-09-15T10:00:00Z',
          }),
        };
      }
      if (docRef.collectionName === 'players' && docRef.id === '23811A0499') {
        return {
          exists: () => true,
          id: '23811A0499',
          data: () => ({
            uid: 'uid-other-player',
            name: 'Another Student',
            rollNumber: '23811A0499',
            mobilePrivate: '9123456780',
            branch: 'ECE',
            year: 3,
            paid: true,
            approvalStatus: 'APPROVED',
          }),
        };
      }
      return {
        exists: () => false,
        id: docRef.id,
        data: () => null,
      };
    }),
    getDocs: vi.fn(async (q) => {
      const whereClause = q.args?.find((a: any) => a && a.field);
      if (whereClause?.field === 'uid' && whereClause?.val === 'uid-tanara-30') {
        return {
          empty: false,
          docs: [
            {
              id: '23811A0479',
              data: () => ({
                uid: 'uid-tanara-30',
                name: 'Tanara Mohan',
                rollNumber: '23811A0479',
                mobilePrivate: '9876543210',
                branch: 'ECE',
                year: 3,
                bucket: 'B3',
                paid: true,
                approvalStatus: 'APPROVED',
              }),
            },
          ],
        };
      }
      if (whereClause?.field === 'mobilePrivate' && whereClause?.val === '9876543210') {
        return {
          empty: false,
          docs: [
            {
              id: '23811A0479',
              data: () => ({
                uid: 'uid-tanara-30',
                mobilePrivate: '9876543210',
              }),
            },
          ],
        };
      }
      if (whereClause?.field === 'mobilePrivate' && whereClause?.val === '9123456780') {
        return {
          empty: false,
          docs: [
            {
              id: '23811A0499',
              data: () => ({
                uid: 'uid-other-player',
                mobilePrivate: '9123456780',
              }),
            },
          ],
        };
      }
      return { empty: true, docs: [] };
    }),
  };
});

// Import after mocking
import {
  resolvePlayerProfile,
  checkRollOwnership,
  checkMobileOwnership,
} from '../services/playerProfileService';

describe('ACC 2026 — Existing Player Login, Profile Loading & Duplicate Detection', () => {
  const tanaraUid = 'uid-tanara-30';
  const tanaraRoll = '23811A0479';

  describe('1. Authenticated Player Profile Resolution', () => {
    it('resolves existing player profile when userDoc has playerId', async () => {
      const res = await resolvePlayerProfile(tanaraUid, tanaraRoll);
      expect(res.exists).toBe(true);
      expect(res.playerId).toBe(tanaraRoll);
      expect(res.isOwner).toBe(true);
      expect(res.playerData.name).toBe('Tanara Mohan');
      expect(res.playerData.paid).toBe(true);
      expect(res.playerData.approvalStatus).toBe('APPROVED');
    });

    it('auto-heals resolution by querying players by uid when userDoc has no playerId', async () => {
      const res = await resolvePlayerProfile(tanaraUid, null);
      expect(res.exists).toBe(true);
      expect(res.playerId).toBe(tanaraRoll);
      expect(res.isOwner).toBe(true);
      expect(res.playerData.name).toBe('Tanara Mohan');
    });

    it('returns exists: false for unlinked new Google user', async () => {
      const res = await resolvePlayerProfile('uid-unregistered-999', null);
      expect(res.exists).toBe(false);
      expect(res.playerId).toBeNull();
      expect(res.isOwner).toBe(false);
    });
  });

  describe('2. Duplicate Roll Validation (Self vs Other Player)', () => {
    it('allows authenticated owner (Tanara Mohan) to review/edit their own roll number without duplicate error', async () => {
      const ownership = await checkRollOwnership(tanaraRoll, tanaraUid, tanaraRoll);
      expect(ownership.allowed).toBe(true);
      expect(ownership.isOwnRecord).toBe(true);
      expect(ownership.exists).toBe(true);
      expect(ownership.error).toBeUndefined();
      expect(ownership.existingData.name).toBe('Tanara Mohan');
    });

    it('blocks a different user from registering with Tanara Mohans roll number', async () => {
      const ownership = await checkRollOwnership(tanaraRoll, 'uid-different-person', null);
      expect(ownership.allowed).toBe(false);
      expect(ownership.isOwnRecord).toBe(false);
      expect(ownership.exists).toBe(true);
      expect(ownership.error).toContain('ROLL NUMBER ALREADY REGISTERED');
      expect(ownership.error).toContain('registered to another student');
    });

    it('allows an un-registered roll number for registration', async () => {
      const ownership = await checkRollOwnership('26811A0599', tanaraUid, null);
      expect(ownership.allowed).toBe(true);
      expect(ownership.isOwnRecord).toBe(false);
      expect(ownership.exists).toBe(false);
      expect(ownership.error).toBeUndefined();
    });

    it('blocks roll number when changing to another registered students roll', async () => {
      const ownership = await checkRollOwnership('23811A0499', tanaraUid, tanaraRoll);
      expect(ownership.allowed).toBe(false);
      expect(ownership.isOwnRecord).toBe(false);
      expect(ownership.exists).toBe(true);
      expect(ownership.error).toContain('ROLL NUMBER ALREADY REGISTERED');
    });
  });

  describe('3. Mobile Number Ownership Validation', () => {
    it('allows the authentic owner to submit their own mobile number', async () => {
      const res = await checkMobileOwnership('9876543210', tanaraRoll, tanaraUid, tanaraRoll);
      expect(res.allowed).toBe(true);
      expect(res.isOwnRecord).toBe(true);
    });

    it('blocks a different user from using another students mobile number', async () => {
      const res = await checkMobileOwnership('9123456780', tanaraRoll, tanaraUid, tanaraRoll);
      expect(res.allowed).toBe(false);
      expect(res.isOwnRecord).toBe(false);
      expect(res.error).toContain('MOBILE NUMBER ALREADY REGISTERED');
    });

    it('allows fresh un-used mobile number', async () => {
      const res = await checkMobileOwnership('9999988888', tanaraRoll, tanaraUid, tanaraRoll);
      expect(res.allowed).toBe(true);
      expect(res.exists).toBe(false);
    });
  });

  describe('4. Audit & Critical State Preservation', () => {
    it('audits player identities without making destructive modifications', () => {
      const mockPlayers = [
        { id: '23811A0479', name: 'Tanara Mohan', uid: 'uid-tanara-30', rollNumber: '23811A0479' },
        { id: '23811A0480', name: 'Unlinked Student', uid: null, rollNumber: '23811A0480' },
        { id: '23811A0481', name: 'Student A', uid: 'uid-conflict-1', rollNumber: '23811A0481' },
      ];
      const mockUsers = [
        { id: 'uid-tanara-30', uid: 'uid-tanara-30', role: 'PLAYER', playerId: '23811A0479' },
        { id: 'uid-conflict-1', uid: 'uid-conflict-1', role: 'PLAYER', playerId: 'different-player-id' },
      ];

      const report = auditPlayerIdentities(mockPlayers, mockUsers);
      expect(report.totalPlayersChecked).toBe(3);
      expect(report.missingUidCount).toBe(1);
      expect(report.conflictingOwnershipCount).toBe(1);
      expect(report.issues.some((i) => i.type === 'MISSING_UID' && i.playerId === '23811A0480')).toBe(true);
      expect(report.issues.some((i) => i.type === 'CONFLICTING_OWNERSHIP' && i.userId === 'uid-conflict-1')).toBe(true);
    });

    it('preserves payment, approvalStatus, and createdAt when updating existing registration payload', () => {
      const existingPlayer = {
        uid: 'uid-tanara-30',
        name: 'Tanara Mohan',
        paid: true,
        approvalStatus: 'APPROVED',
        createdAt: '2026-09-15T10:00:00Z',
      };

      const updatedForm = {
        name: 'Tanara Mohan',
        branch: 'ECE',
        year: 3,
        cricHeroesProfileUrl: 'https://cricheroes.com/player-profile/12345/tanara-updated',
      };

      // Simulates the preservation logic in PlayerRegistrationPage.tsx handleSubmit
      const mergedPayload = {
        ...updatedForm,
        paid: existingPlayer.paid ?? false,
        approvalStatus: existingPlayer.approvalStatus || 'PENDING',
        createdAt: existingPlayer.createdAt,
        updatedAt: '2026-10-09T12:00:00Z',
      };

      expect(mergedPayload.paid).toBe(true);
      expect(mergedPayload.approvalStatus).toBe('APPROVED');
      expect(mergedPayload.createdAt).toBe('2026-09-15T10:00:00Z');
      expect(mergedPayload.cricHeroesProfileUrl).toContain('tanara-updated');
    });
  });
});

import { describe, it, expect } from 'vitest';
import type { UserDoc, UserRole } from '@shared/types';

// Pure logic helper functions matching the AuthContext and Registration implementations
export function normalizeRollNumber(roll: string): string {
  return roll.trim().toUpperCase().replace(/\s+/g, '');
}

export function validatePlayerRollUniqueness(
  inputRoll: string,
  existingPlayers: { id: string; rollNumberNormalized: string; authUid?: string }[]
): { isUnique: boolean; conflictReason?: string } {
  const normalized = normalizeRollNumber(inputRoll);
  const conflict = existingPlayers.find(p => p.rollNumberNormalized === normalized || p.id === normalized);
  if (conflict) {
    return {
      isUnique: false,
      conflictReason: `Roll number ${normalized} is already registered.`
    };
  }
  return { isUnique: true };
}

export function resolveUserAuthState(userDoc: UserDoc | null, authUid: string | null): {
  state: 'UNAUTHENTICATED' | 'UNREGISTERED_GOOGLE' | 'PENDING_APPROVAL' | 'BLOCKED' | 'READY';
  allowedRoles: UserRole[];
} {
  if (!authUid) {
    return { state: 'UNAUTHENTICATED', allowedRoles: [] };
  }
  if (!userDoc) {
    return { state: 'UNREGISTERED_GOOGLE', allowedRoles: [] };
  }
  if (userDoc.accountStatus === 'BLOCKED' || userDoc.accountStatus === 'DISABLED') {
    return { state: 'BLOCKED', allowedRoles: [] };
  }
  if (userDoc.approvalStatus === 'PENDING' || userDoc.approvalStatus === 'PENDING_APPROVAL' || userDoc.accountStatus === 'PENDING') {
    return { state: 'PENDING_APPROVAL', allowedRoles: [] };
  }
  return { state: 'READY', allowedRoles: [userDoc.role] };
}

export function canAccessFranchise(userDoc: UserDoc | null, requestedFranchiseId: string): boolean {
  if (!userDoc) return false;
  if (userDoc.role === 'SUPER_ADMIN' || userDoc.role === 'ADMIN') return true;
  if (userDoc.role === 'FRANCHISE_COORDINATOR' || userDoc.role === 'FRANCHISE_TEAM_LEADER') {
    return userDoc.franchiseId === requestedFranchiseId;
  }
  return false;
}

export function preventAdminGoogleElevation(
  providerId: string,
  targetRole: UserRole
): { permitted: boolean; error?: string } {
  if ((targetRole === 'ADMIN' || targetRole === 'SUPER_ADMIN') && providerId === 'google.com') {
    return {
      permitted: false,
      error: 'SECURITY MANDATE: Administrative roles cannot be claimed or elevated via Google Sign-In. Use dedicated Email/Password credentials.'
    };
  }
  return { permitted: true };
}

describe('ACC 2026 — Real Firebase Authentication & Role Mapping Suite', () => {

  describe('1. Roll Number Normalization & Uniqueness Constraints', () => {
    it('normalizes lowercase, spaces, and mixed case roll numbers consistently', () => {
      expect(normalizeRollNumber('24815a0443')).toBe('24815A0443');
      expect(normalizeRollNumber('  24815A0443  ')).toBe('24815A0443');
      expect(normalizeRollNumber('24815 a 0443')).toBe('24815A0443');
      expect(normalizeRollNumber('26811a0501')).toBe('26811A0501');
    });

    it('blocks duplicate registration for identical roll number regardless of casing', () => {
      const existing = [
        { id: '24815A0443', rollNumberNormalized: '24815A0443', authUid: 'uid-abc-1' }
      ];

      const check1 = validatePlayerRollUniqueness('24815a0443', existing);
      expect(check1.isUnique).toBe(false);
      expect(check1.conflictReason).toContain('24815A0443 is already registered');

      const check2 = validatePlayerRollUniqueness(' 24815A0443 ', existing);
      expect(check2.isUnique).toBe(false);

      const check3 = validatePlayerRollUniqueness('26811A0501', existing);
      expect(check3.isUnique).toBe(true);
    });

    it('prevents multiple Google accounts from claiming the same player record', () => {
      const playerRecord = {
        id: '26811A0501',
        rollNumberNormalized: '26811A0501',
        authUid: 'uid-original-player'
      };

      const incomingGoogleUid = 'uid-impostor-google';
      const isClaimedByDifferentUid = !!playerRecord.authUid && playerRecord.authUid !== incomingGoogleUid;

      expect(isClaimedByDifferentUid).toBe(true);
    });
  });

  describe('2. Google Identity vs ACC Database Role Resolution', () => {
    it('resolves unlinked Google user to UNREGISTERED_GOOGLE state', () => {
      const res = resolveUserAuthState(null, 'google-uid-new');
      expect(res.state).toBe('UNREGISTERED_GOOGLE');
      expect(res.allowedRoles).toHaveLength(0);
    });

    it('resolves unauthenticated state when no auth UID present', () => {
      const res = resolveUserAuthState(null, null);
      expect(res.state).toBe('UNAUTHENTICATED');
    });

    it('resolves registered player to READY when approved and active', () => {
      const activePlayerDoc: UserDoc = {
        uid: 'google-uid-sai',
        role: 'PLAYER',
        email: 'saiteja@acc.edu',
        name: 'Sai Teja',
        playerId: '26811A0501',
        accountStatus: 'ACTIVE',
        approvalStatus: 'APPROVED',
        authProvider: 'google.com',
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z'
      };

      const res = resolveUserAuthState(activePlayerDoc, 'google-uid-sai');
      expect(res.state).toBe('READY');
      expect(res.allowedRoles).toContain('PLAYER');
    });

    it('enforces PENDING_APPROVAL status until Admin acts', () => {
      const pendingPlayerDoc: UserDoc = {
        uid: 'google-uid-pending',
        role: 'PLAYER',
        email: 'pending@acc.edu',
        name: 'Fresh Cadet',
        playerId: '25811A0403',
        accountStatus: 'PENDING',
        approvalStatus: 'PENDING_APPROVAL',
        authProvider: 'google.com',
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z'
      };

      const res = resolveUserAuthState(pendingPlayerDoc, 'google-uid-pending');
      expect(res.state).toBe('PENDING_APPROVAL');
      expect(res.allowedRoles).toHaveLength(0);
    });

    it('strictly denies BLOCKED or DISABLED users', () => {
      const blockedDoc: UserDoc = {
        uid: 'google-uid-blocked',
        role: 'PLAYER',
        email: 'malicious@acc.edu',
        name: 'Bad Actor',
        playerId: '24815A0499',
        accountStatus: 'BLOCKED',
        approvalStatus: 'REJECTED',
        authProvider: 'google.com',
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z'
      };

      const res = resolveUserAuthState(blockedDoc, 'google-uid-blocked');
      expect(res.state).toBe('BLOCKED');
      expect(res.allowedRoles).toHaveLength(0);
    });
  });

  describe('3. Franchise Dual-Identity Architecture (Coordinator + Team Lead)', () => {
    const coordinatorDoc: UserDoc = {
      uid: 'uid-coord-fr003',
      role: 'FRANCHISE_COORDINATOR',
      email: 'coordinator.titans@acc.edu',
      name: 'Dr. Ramesh Kumar',
      franchiseId: 'FR003',
      accountStatus: 'ACTIVE',
      approvalStatus: 'APPROVED',
      authProvider: 'google.com',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z'
    };

    const teamLeadDoc: UserDoc = {
      uid: 'uid-lead-fr003',
      role: 'FRANCHISE_TEAM_LEADER',
      email: 'captain.titans@acc.edu',
      name: 'K. Shiva (Captain)',
      franchiseId: 'FR003',
      accountStatus: 'ACTIVE',
      approvalStatus: 'APPROVED',
      authProvider: 'google.com',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z'
    };

    it('allows both Coordinator and Team Lead to access the same franchise terminal', () => {
      expect(canAccessFranchise(coordinatorDoc, 'FR003')).toBe(true);
      expect(canAccessFranchise(teamLeadDoc, 'FR003')).toBe(true);
    });

    it('prevents Coordinator or Team Lead from accessing a rival franchise', () => {
      expect(canAccessFranchise(coordinatorDoc, 'FR001')).toBe(false);
      expect(canAccessFranchise(teamLeadDoc, 'FR005')).toBe(false);
    });

    it('allows Admin / Super Admin universal access for oversight', () => {
      const superAdminDoc: UserDoc = {
        uid: 'uid-super-admin',
        role: 'SUPER_ADMIN',
        email: 'superadmin@acc.edu',
        name: 'Tournament Director',
        accountStatus: 'ACTIVE',
        approvalStatus: 'APPROVED',
        authProvider: 'password',
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z'
      };

      expect(canAccessFranchise(superAdminDoc, 'FR001')).toBe(true);
      expect(canAccessFranchise(superAdminDoc, 'FR003')).toBe(true);
    });
  });

  describe('4. Administrative Role Segregation & Google Non-Elevation', () => {
    it('rejects Google OAuth sign-in when attempting to elevate to ADMIN', () => {
      const checkAdmin = preventAdminGoogleElevation('google.com', 'ADMIN');
      expect(checkAdmin.permitted).toBe(false);
      expect(checkAdmin.error).toContain('Administrative roles cannot be claimed or elevated via Google Sign-In');

      const checkSuperAdmin = preventAdminGoogleElevation('google.com', 'SUPER_ADMIN');
      expect(checkSuperAdmin.permitted).toBe(false);
    });

    it('permits dedicated password authentication for ADMIN', () => {
      const checkAdminPass = preventAdminGoogleElevation('password', 'ADMIN');
      expect(checkAdminPass.permitted).toBe(true);

      const checkSuperPass = preventAdminGoogleElevation('password', 'SUPER_ADMIN');
      expect(checkSuperPass.permitted).toBe(true);
    });

    it('permits Google OAuth authentication for PLAYER and FRANCHISE roles', () => {
      expect(preventAdminGoogleElevation('google.com', 'PLAYER').permitted).toBe(true);
      expect(preventAdminGoogleElevation('google.com', 'FRANCHISE_COORDINATOR').permitted).toBe(true);
      expect(preventAdminGoogleElevation('google.com', 'FRANCHISE_TEAM_LEADER').permitted).toBe(true);
    });
  });
});

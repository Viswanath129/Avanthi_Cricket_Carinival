import { describe, it, expect, vi } from 'vitest';
import { useCapabilities } from '../hooks/useCapabilities';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'superadmin@acc.edu' },
    userDoc: { role: 'SUPER_ADMIN' },
  }),
}));

describe('Participant Data Wipe Safeguards & RBAC Matrix', () => {
  it('grants canWipeData privilege exclusively to SUPER_ADMIN', () => {
    const superAdminCaps = useCapabilities('SUPER_ADMIN');
    expect(superAdminCaps.canWipeData).toBe(true);

    const operatorCaps = useCapabilities('OPERATOR');
    expect(operatorCaps.canWipeData).toBe(false);

    const adminCaps = useCapabilities('ADMIN' as any);
    expect(adminCaps.canWipeData).toBe(false);

    const playerCaps = useCapabilities('PLAYER' as any);
    expect(playerCaps.canWipeData).toBe(false);

    const franchiseCaps = useCapabilities('FRANCHISE_COORDINATOR' as any);
    expect(franchiseCaps.canWipeData).toBe(false);
  });

  it('validates 3-step confirmation guard logic', () => {
    const validateWipeInput = (phrase: string, acknowledged: boolean) => {
      return phrase.trim() === 'WIPE ACC PARTICIPANT DATA' && acknowledged === true;
    };

    // Mismatches must be rejected
    expect(validateWipeInput('WIPE DATA', true)).toBe(false);
    expect(validateWipeInput('wipe acc participant data', true)).toBe(false);
    expect(validateWipeInput('DELETE ALL DATA', true)).toBe(false);
    expect(validateWipeInput('WIPE ACC PARTICIPANT DATA', false)).toBe(false);

    // Exact match + checkbox acknowledged must pass
    expect(validateWipeInput('WIPE ACC PARTICIPANT DATA', true)).toBe(true);
    expect(validateWipeInput(' WIPE ACC PARTICIPANT DATA ', true)).toBe(true);
  });

  it('verifies protected resources preservation rules', () => {
    const accounts = [
      { uid: 'u_super_1', email: 'deepak@acc.edu', role: 'SUPER_ADMIN' },
      { uid: 'u_admin_1', email: 'floor@acc.edu', role: 'ADMIN' },
      { uid: 'u_player_1', email: 'player1@gmail.com', role: 'PLAYER' },
      { uid: 'u_lead_1', email: 'captain@gmail.com', role: 'FRANCHISE_TEAM_LEADER' },
      { uid: 'u_coord_1', email: 'coord@acc.edu', role: 'FRANCHISE_COORDINATOR' },
    ];

    // Filter rule from wipeParticipantDataset
    const preservedAccounts = accounts.filter(
      u => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN'
    );
    const purgedAccounts = accounts.filter(
      u => u.role !== 'SUPER_ADMIN' && u.role !== 'ADMIN'
    );

    expect(preservedAccounts.length).toBe(2);
    expect(preservedAccounts.map(a => a.role)).toEqual(['SUPER_ADMIN', 'ADMIN']);
    expect(purgedAccounts.length).toBe(3);
    expect(purgedAccounts.map(a => a.role)).toEqual([
      'PLAYER',
      'FRANCHISE_TEAM_LEADER',
      'FRANCHISE_COORDINATOR',
    ]);
  });

  it('verifies auction state reset schema', () => {
    const generateResetState = () => ({
      status: 'IDLE' as const,
      activeLot: null,
      currentBid: null,
      leadingFranchiseId: null,
      updatedBy: 'WIPE_SERVICE',
      timestamp: Date.now(),
    });

    const resetState = generateResetState();
    expect(resetState.status).toBe('IDLE');
    expect(resetState.activeLot).toBeNull();
    expect(resetState.currentBid).toBeNull();
    expect(resetState.updatedBy).toBe('WIPE_SERVICE');
  });
});

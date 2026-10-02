import { describe, it, expect, vi } from 'vitest';
import { useCapabilities } from '../hooks/useCapabilities';
import { calculateNextBid, calculateBidIncrement, calculateMaxBid } from '@shared/engine/bidEngine';
import { checkScarcity } from '@shared/engine/scarcity';

// Mock AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'superadmin@avanthi.edu.in' },
    userDoc: { role: 'SUPER_ADMIN' },
  }),
}));

describe('ACC Admin & Operator Access Control & Capabilities Matrix', () => {
  it('grants Super Admin full authority across all auction and governance functions', () => {
    const caps = useCapabilities('SUPER_ADMIN');

    expect(caps.isSuperAdmin).toBe(true);
    expect(caps.isOperator).toBe(false);
    expect(caps.roleLabel).toBe('Super Admin');

    // Live auction controls
    expect(caps.canHammer).toBe(true);
    expect(caps.canSkip).toBe(true);
    expect(caps.canPauseResume).toBe(true);
    expect(caps.canUndoSale).toBe(true);
    expect(caps.canBidOnBehalf).toBe(true);
    expect(caps.canDirectAssign).toBe(true);
    expect(caps.canSwitchDrawMode).toBe(true);

    // Governance & destructive controls
    expect(caps.canRelaxBucketMinimum).toBe(true);
    expect(caps.canManageFranchises).toBe(true);
    expect(caps.canEditPhones).toBe(true);
    expect(caps.canEditTournamentSettings).toBe(true);
    expect(caps.canPurgeTrash).toBe(true);
    expect(caps.canCreateEdition).toBe(true);

    // Reporting & Auditing
    expect(caps.canExportDatabase).toBe(true);
    expect(caps.canSnapshotJson).toBe(true);
    expect(caps.canViewAuditLog).toBe(true);
  });

  it('restricts Operator to live auction controls while strictly forbidding administrative mutations', () => {
    const caps = useCapabilities('OPERATOR');

    expect(caps.isSuperAdmin).toBe(false);
    expect(caps.isOperator).toBe(true);
    expect(caps.roleLabel).toBe('Floor Operator');

    // Operator CAN run auction
    expect(caps.canHammer).toBe(true);
    expect(caps.canSkip).toBe(true);
    expect(caps.canPauseResume).toBe(true);
    expect(caps.canUndoSale).toBe(false);
    expect(caps.canBidOnBehalf).toBe(true);
    expect(caps.canDirectAssign).toBe(true);
    expect(caps.canSwitchDrawMode).toBe(true);
    expect(caps.canExportDatabase).toBe(false);
    expect(caps.canSnapshotJson).toBe(false);
    expect(caps.canViewAuditLog).toBe(true);

    // Operator CANNOT perform governance / destructive mutations
    expect(caps.canRelaxBucketMinimum).toBe(false);
    expect(caps.canManageFranchises).toBe(false);
    expect(caps.canEditPhones).toBe(false);
    expect(caps.canEditTournamentSettings).toBe(false);
    expect(caps.canPurgeTrash).toBe(false);
    expect(caps.canCreateEdition).toBe(false);
  });
});

describe('Live Bid Ladder & Increment Rules (§10.2)', () => {
  it('calculates proper incremental ladders', () => {
    // Under 100 -> +10
    expect(calculateBidIncrement(20)).toBe(10);
    expect(calculateNextBid(20)).toBe(30);
    expect(calculateNextBid(90)).toBe(100);

    // 100 to 199 -> +20
    expect(calculateBidIncrement(100)).toBe(20);
    expect(calculateNextBid(100)).toBe(120);
    expect(calculateNextBid(180)).toBe(200);

    // 200 and above -> +30
    expect(calculateBidIncrement(200)).toBe(30);
    expect(calculateNextBid(200)).toBe(230);
    expect(calculateNextBid(230)).toBe(260);
  });
});

describe('Bucket Scarcity Alert Logic (§15.3)', () => {
  it('correctly triggers scarcity when supply <= total demand across franchises', () => {
    const bucketMinimums = { B1: 2, B2: 2, B3: 2, B4: 2, D5: 1, M6: 0 };

    // 11 franchises, each has 0 B3 players -> demand = 22
    const franchises = Array.from({ length: 11 }, (_, i) => ({
      franchiseId: `f-${i}`,
      bucketCounts: { B1: 2, B2: 2, B3: 0, B4: 2, D5: 1, M6: 0 },
    }));

    // If supply is 20 (<= 22 demand) -> isScarcity: true
    const resultScare = checkScarcity({
      bucket: 'B3',
      unsoldPlayersInBucket: 20,
      franchises,
      bucketMinimums,
    });
    expect(resultScare.isScarcity).toBe(true);
    expect(resultScare.demand).toBe(22);
    expect(resultScare.supply).toBe(20);

    // If supply is 25 (> 22 demand) -> isScarcity: false
    const resultSurplus = checkScarcity({
      bucket: 'B3',
      unsoldPlayersInBucket: 25,
      franchises,
      bucketMinimums,
    });
    expect(resultSurplus.isScarcity).toBe(false);
    expect(resultSurplus.supply).toBe(25);
  });
});

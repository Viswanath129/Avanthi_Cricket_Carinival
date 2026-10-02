export const HISTORY_REFERENCE_FIELDS: Record<string, string[]> = {
  lots: ['playerId', 'rollNumberNormalized', 'rollNumber'],
  bids: ['playerId', 'rollNumberNormalized', 'rollNumber'],
  acquisitions: ['playerId'],
  sales: ['playerId'],
  round2: ['playerId'],
  round2Records: ['playerId'],
  round2Selections: ['playerId'],
  allotments: ['playerId'],
  purseTransactions: ['playerId'],
  purseLedger: ['playerId'],
  franchiseTransactions: ['playerId'],
  transactions: ['playerId'],
  referrals: ['playerId'],
  playerReferrals: ['playerId'],
  auctionHistory: ['playerId', 'playerRoll'],
  auditLogs: ['entityId', 'targetId'],
  auditLog: ['entityId', 'targetId'],
};

export function hasProtectedPlayerHistory(referenceExists: boolean[], squadReferencesPlayer: boolean): boolean {
  return squadReferencesPlayer || referenceExists.some(Boolean);
}

export function buildPlayerArchivePatch(player: Record<string, any>): Record<string, unknown> {
  return {
    governancePreviousState: {
      status: player.status || null,
      approvalStatus: player.approvalStatus || null,
      verificationStatus: player.verificationStatus || null,
      accountStatus: player.accountStatus || null,
      auctionEligible: player.auctionEligible ?? null,
      publicVisibility: player.publicVisibility ?? null,
    },
    status: 'ARCHIVED', approvalStatus: 'ARCHIVED', verificationStatus: 'ARCHIVED',
    accountStatus: 'DISABLED', auctionEligible: false, publicVisibility: false,
  };
}

export function buildPlayerRestorePatch(player: Record<string, any>): Record<string, unknown> {
  const previous = player.governancePreviousState || {};
  return {
    status: previous.status || 'AVAILABLE',
    approvalStatus: previous.approvalStatus || 'PENDING_APPROVAL',
    verificationStatus: previous.verificationStatus || 'PENDING_VERIFICATION',
    accountStatus: previous.accountStatus || 'ACTIVE',
    auctionEligible: previous.auctionEligible ?? false,
    publicVisibility: previous.publicVisibility ?? false,
  };
}

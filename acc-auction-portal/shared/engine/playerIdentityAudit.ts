export interface PlayerIdentityAuditIssue {
  type: 'MISSING_UID' | 'CONFLICTING_OWNERSHIP' | 'DUPLICATE_ROLL' | 'UNLINKED_USER';
  severity: 'WARNING' | 'ERROR';
  playerId?: string;
  rollNumber?: string;
  userId?: string;
  message: string;
  details: Record<string, any>;
}

export interface PlayerIdentityAuditReport {
  totalPlayersChecked: number;
  totalUsersChecked: number;
  cleanMatches: number;
  missingUidCount: number;
  conflictingOwnershipCount: number;
  duplicateRollCount: number;
  unlinkedUserCount: number;
  issues: PlayerIdentityAuditIssue[];
}

/**
 * Audits players and users to detect missing UID mappings, duplicate roll numbers,
 * and conflicting ownership without making destructive changes.
 */
export function auditPlayerIdentities(
  players: any[],
  users: any[]
): PlayerIdentityAuditReport {
  const issues: PlayerIdentityAuditIssue[] = [];

  const userMap = new Map<string, any>();
  for (const u of users) {
    if (u?.id || u?.uid) {
      userMap.set(u.uid || u.id, u);
    }
  }

  const rollMap = new Map<string, string[]>();
  let cleanMatches = 0;
  let missingUidCount = 0;
  let conflictingOwnershipCount = 0;
  let duplicateRollCount = 0;

  for (const p of players) {
    const pId = p.id || p.playerId;
    const roll = (p.rollNumberNormalized || p.rollNumber || p.roll || pId || '').toUpperCase().trim();
    const uid = p.uid || p.authUid;

    // 1. Duplicate roll check
    if (roll) {
      const existing = rollMap.get(roll) || [];
      existing.push(pId);
      rollMap.set(roll, existing);
    }

    // 2. Missing UID check
    if (!uid) {
      missingUidCount++;
      issues.push({
        type: 'MISSING_UID',
        severity: 'WARNING',
        playerId: pId,
        rollNumber: roll,
        message: `Player #${roll || pId} (${p.name || 'Unknown'}) does not have an attached Firebase Auth UID.`,
        details: { playerId: pId, name: p.name, rollNumber: roll },
      });
      continue;
    }

    // 3. Ownership alignment check
    const matchedUser = userMap.get(uid);
    if (matchedUser) {
      if (matchedUser.playerId && matchedUser.playerId !== pId && matchedUser.playerId !== roll) {
        conflictingOwnershipCount++;
        issues.push({
          type: 'CONFLICTING_OWNERSHIP',
          severity: 'ERROR',
          playerId: pId,
          userId: uid,
          rollNumber: roll,
          message: `Conflicting ownership: User ${uid} is linked to playerId "${matchedUser.playerId}", but player record ${pId} points to user ${uid}.`,
          details: { playerLinkedId: pId, userLinkedId: matchedUser.playerId, userEmail: matchedUser.email },
        });
      } else {
        cleanMatches++;
      }
    } else {
      // User doc missing in /users/{uid}, but player record has uid (safe candidate for auto-healing)
      cleanMatches++;
    }
  }

  // Evaluate duplicate rolls
  rollMap.forEach((pIds, roll) => {
    if (pIds.length > 1) {
      duplicateRollCount++;
      issues.push({
        type: 'DUPLICATE_ROLL',
        severity: 'ERROR',
        rollNumber: roll,
        message: `Duplicate roll detected: Multiple player documents share roll number "${roll}": [${pIds.join(', ')}]`,
        details: { rollNumber: roll, playerIds: pIds },
      });
    }
  });

  // 4. Unlinked user accounts (users with role PLAYER but no playerId)
  let unlinkedUserCount = 0;
  for (const u of users) {
    if (u.role === 'PLAYER' && !u.playerId) {
      unlinkedUserCount++;
      issues.push({
        type: 'UNLINKED_USER',
        severity: 'WARNING',
        userId: u.uid || u.id,
        message: `User account "${u.email || u.uid}" has role PLAYER but no linked playerId.`,
        details: { uid: u.uid || u.id, email: u.email, displayName: u.displayName },
      });
    }
  }

  return {
    totalPlayersChecked: players.length,
    totalUsersChecked: users.length,
    cleanMatches,
    missingUidCount,
    conflictingOwnershipCount,
    duplicateRollCount,
    unlinkedUserCount,
    issues,
  };
}

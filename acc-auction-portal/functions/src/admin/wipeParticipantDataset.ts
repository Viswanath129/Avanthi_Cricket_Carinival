import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { db, verifyCaller, CallerInfo } from '../utils/auth';
import { writeAuditEvent } from '../utils/audit';

export interface WipePreviewCounts {
  players: number;
  publicPlayers: number;
  deletedPlayers: number;
  playerUniqueKeys: number;
  franchises: number;
  franchisesPublic: number;
  deletedFranchises: number;
  franchiseUsers: number;
  registrations: number;
  lots: number;
  bids: number;
  acquisitions: number;
  sales: number;
  round2Records: number;
  allotments: number;
  transactions: number;
  referrals: number;
  mediaEstimated: number;
  protectedAdmins: number;
  protectedAuditLogs: number;
}

export interface WipeDatasetRequest {
  action: 'PREVIEW' | 'EXECUTE';
  editionId?: string;
  environment?: 'DEMO' | 'LIVE';
  operationId?: string;
  confirmation?: string;
  acknowledgedScope?: boolean;
}

/**
 * Super Admin-only authoritative participant dataset wipe operation.
 * Completely purges participant-related collections and dependent tournament data,
 * resets auction floor state, and preserves administrative identities & immutable audit history.
 */
export const wipeParticipantDataset = onCall({ maxInstances: 1, timeoutSeconds: 300, memory: '512MiB' }, async (request) => {
  // 1. Authenticate & require Super Admin
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN']);
  
  const {
    action = 'PREVIEW',
    editionId = 'acc-2026',
    environment = 'DEMO',
    operationId,
    confirmation,
    acknowledgedScope
  } = (request.data || {}) as WipeDatasetRequest;

  if (!['PREVIEW', 'EXECUTE'].includes(action)) {
    throw new HttpsError('invalid-argument', "Invalid action. Must be 'PREVIEW' or 'EXECUTE'.");
  }

  if (editionId !== 'acc-2026') {
    throw new HttpsError('invalid-argument', `Unknown or unsupported edition: ${editionId}`);
  }

  // 2. Count protected records
  const superAdminSnap = await db.collection('users').where('role', 'in', ['SUPER_ADMIN', 'ADMIN']).get();
  const protectedAdminCount = superAdminSnap.size;
  const auditLogsSnap = await db.collection('auditLogs').limit(1).get();
  const auditLogCount = auditLogsSnap.empty ? 0 : 1; // Indicative presence of immutable log

  // Helper to count documents in a collection
  async function countCollection(colName: string): Promise<number> {
    try {
      const snap = await db.collection(colName).count().get();
      return snap.data().count;
    } catch {
      const snap = await db.collection(colName).select().get();
      return snap.size;
    }
  }

  // Gather real counts
  const [
    playerCount,
    publicPlayerCount,
    deletedPlayerCount,
    uniqueKeysCount,
    franchiseCount,
    franchisePublicCount,
    deletedFranchiseCount,
    franchiseUserCount,
    registrationCount,
    lotCount,
    bidCount,
    acquisitionCount,
    salesCount,
    round2Count,
    allotmentCount,
    txCount,
    referralCount
  ] = await Promise.all([
    countCollection('players'),
    countCollection('publicPlayers'),
    countCollection('deletedPlayers'),
    countCollection('playerUniqueKeys'),
    countCollection('franchises'),
    countCollection('franchisesPublic'),
    countCollection('deletedFranchises'),
    countCollection('franchiseUsers'),
    countCollection('registrations'),
    countCollection('lots'),
    countCollection('bids'),
    countCollection('acquisitions'),
    countCollection('sales'),
    countCollection('round2'),
    countCollection('allotments'),
    countCollection('purseTransactions'),
    countCollection('referrals')
  ]);

  const previewCounts: WipePreviewCounts = {
    players: playerCount,
    publicPlayers: publicPlayerCount,
    deletedPlayers: deletedPlayerCount,
    playerUniqueKeys: uniqueKeysCount,
    franchises: franchiseCount,
    franchisesPublic: franchisePublicCount,
    deletedFranchises: deletedFranchiseCount,
    franchiseUsers: franchiseUserCount,
    registrations: registrationCount,
    lots: lotCount,
    bids: bidCount,
    acquisitions: acquisitionCount,
    sales: salesCount,
    round2Records: round2Count,
    allotments: allotmentCount,
    transactions: txCount,
    referrals: referralCount,
    mediaEstimated: playerCount + franchiseCount,
    protectedAdmins: protectedAdminCount,
    protectedAuditLogs: auditLogCount
  };

  // If PREVIEW, return current live counts immediately
  if (action === 'PREVIEW') {
    return {
      success: true,
      editionId,
      environment,
      counts: previewCounts,
      protected: {
        administrators: protectedAdminCount,
        callerUid: caller.uid,
        callerRole: caller.role,
        auditTrailPreserved: true
      }
    };
  }

  // =========================================================================
  // EXECUTE ACTION
  // =========================================================================

  // 3. Validation checks for destructive operation
  if (confirmation !== 'WIPE ACC PARTICIPANT DATA') {
    throw new HttpsError('failed-precondition', "Confirmation text mismatch. You must type 'WIPE ACC PARTICIPANT DATA' exactly.");
  }

  if (acknowledgedScope !== true) {
    throw new HttpsError('failed-precondition', "You must explicitly check that you have reviewed the affected record scope.");
  }

  const opId = operationId || `wipe_${editionId}_${Date.now()}`;
  const lockRef = db.collection('settings').doc('data_wipe_lock');

  // 4. Acquire Lock & Idempotency check
  const lockAcquired = await db.runTransaction(async (txn) => {
    const snap = await txn.get(lockRef);
    if (snap.exists) {
      const data = snap.data()!;
      if (data.status === 'IN_PROGRESS') {
        const lastHeartbeat = data.heartbeat || 0;
        // If locked less than 3 minutes ago, block concurrent execution
        if (Date.now() - lastHeartbeat < 180000) {
          throw new HttpsError('aborted', 'A participant data wipe is currently in progress. Please wait.');
        }
      } else if (data.status === 'COMPLETED' && data.operationId === opId) {
        // Idempotent replay: operation already completed
        return { isReplay: true, result: data.summary };
      }
    }

    txn.set(lockRef, {
      operationId: opId,
      editionId,
      environment,
      actorUid: caller.uid,
      actorRole: caller.role,
      status: 'IN_PROGRESS',
      heartbeat: Date.now(),
      startedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { isReplay: false, result: null };
  });

  if (lockAcquired.isReplay) {
    return {
      success: true,
      alreadyApplied: true,
      operationId: opId,
      summary: lockAcquired.result
    };
  }

  // 5. Execute Bounded Batch Purge
  const collectionsToWipe = [
    'players',
    'publicPlayers',
    'playersPublic',
    'deletedPlayers',
    'playerUniqueKeys',
    'franchises',
    'franchisesPublic',
    'deletedFranchises',
    'franchiseUsers',
    'registrations',
    'lots',
    'bids',
    'acquisitions',
    'sales',
    'round2',
    'round2Records',
    'round2Selections',
    'allotments',
    'purseTransactions',
    'purseLedger',
    'franchiseTransactions',
    'transactions',
    'referrals',
    'playerReferrals',
    'auctionHistory'
  ];

  const deletedCounts: Record<string, number> = {};

  try {
    for (const colName of collectionsToWipe) {
      let countForCol = 0;
      let hasMore = true;

      while (hasMore) {
        // Fetch up to 400 documents at a time to stay well within Firestore's 500-write limit
        const snap = await db.collection(colName).limit(400).get();
        if (snap.empty) {
          hasMore = false;
          break;
        }

        const batch = db.batch();
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();

        countForCol += snap.size;
        // Keep lock alive
        await lockRef.update({ heartbeat: Date.now() }).catch(() => {});
        if (snap.size < 400) {
          hasMore = false;
        }
      }

      deletedCounts[colName] = countForCol;
    }

    // 6. Delete Exclusive Non-Admin Participant User Accounts (Preserve ADMIN and SUPER_ADMIN)
    let nonAdminUsersPurged = 0;
    const nonAdminUserSnap = await db.collection('users')
      .where('role', 'in', ['PLAYER', 'FRANCHISE_COORDINATOR', 'FRANCHISE_TEAM_LEADER', 'FRANCHISE'])
      .limit(400)
      .get();

    if (!nonAdminUserSnap.empty) {
      const batch = db.batch();
      for (const userDoc of nonAdminUserSnap.docs) {
        batch.delete(userDoc.ref);
        nonAdminUsersPurged++;
        // Also disable/delete from Firebase Auth if desired and not an admin
        try {
          await admin.auth().deleteUser(userDoc.id);
        } catch {
          // Ignore missing or unlinked auth records
        }
      }
      await batch.commit();
    }
    deletedCounts['exclusiveParticipantUsers'] = nonAdminUsersPurged;

    // 7. Reset Authoritative Auction State Documents
    const auctionStateRefs = [
      db.collection('acc_auctions').doc('acc-2026'),
      db.collection('acc_auctions').doc('live'),
      db.collection('editions').doc('acc-2026').collection('auction').doc('state')
    ];

    for (const aRef of auctionStateRefs) {
      try {
        await aRef.set({
          isFullReset: true,
          lotIndex: 0,
          currentBid: 0,
          leadingBidderId: null,
          timerSeconds: 30,
          timerDeadline: null,
          timerDuration: 30000,
          timerStartedAt: null,
          lastBidAt: null,
          timerVersion: 100,
          timerRunning: false,
          auctionPaused: false,
          pausedRemainingMs: null,
          passedFranchiseIds: [],
          franchises: [],
          deletedFranchises: [],
          players: [],
          deletedPlayers: [],
          currentLot: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: false });
      } catch (err) {
        console.warn(`[wipeParticipantDataset] Auction state reset note for ${aRef.path}:`, err);
      }
    }

    // 8. Delete Storage Objects for Players & Franchises (if bucket available)
    try {
      const bucket = admin.storage().bucket();
      const prefixes = ['players/', 'franchises/', 'coordinators/'];
      for (const prefix of prefixes) {
        await bucket.deleteFiles({ prefix, force: true }).catch(() => {});
      }
    } catch (storageErr) {
      console.warn('[wipeParticipantDataset] Storage deletion note (skipped or unavailable):', storageErr);
    }

    // 9. Write Comprehensive Audit Record
    await writeAuditEvent({
      actor: caller,
      action: 'WIPE_ALL_PARTICIPANT_DATA',
      targetType: 'EDITION',
      targetId: editionId,
      result: 'SUCCESS',
      editionId,
      metadata: {
        operationId: opId,
        environment,
        deletedCounts,
        previewCounts,
        preservedAdmins: protectedAdminCount
      }
    });

    // 10. Mark Lock Completed
    const summary = {
      operationId: opId,
      editionId,
      environment,
      completedAt: new Date().toISOString(),
      deletedCounts
    };

    await lockRef.set({
      operationId: opId,
      editionId,
      status: 'COMPLETED',
      heartbeat: Date.now(),
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      summary
    });

    return {
      success: true,
      operationId: opId,
      editionId,
      environment,
      deletedCounts,
      message: 'All participant records and dependent tournament data permanently purged.'
    };
  } catch (error: any) {
    // Record error in lock doc to allow retry
    await lockRef.set({
      operationId: opId,
      editionId,
      status: 'FAILED',
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
      error: error?.message || 'Unknown wipe failure'
    }).catch(() => {});

    await writeAuditEvent({
      actor: caller,
      action: 'WIPE_PARTICIPANT_DATA_FAILED',
      targetType: 'EDITION',
      targetId: editionId,
      result: 'FAILED',
      editionId,
      metadata: {
        operationId: opId,
        error: error?.message
      }
    });

    throw new HttpsError('internal', `Wipe operation failed: ${error?.message || error}`);
  }
});

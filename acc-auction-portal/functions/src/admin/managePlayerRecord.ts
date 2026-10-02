import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import { writeAuditEvent } from '../utils/audit';
import * as admin from 'firebase-admin';

type PlayerAction = 'ARCHIVE' | 'RESTORE' | 'PERMANENT_DELETE';

const HISTORY_REFERENCES: Record<string, string[]> = {
  lots: ['playerId', 'rollNumberNormalized'],
  bids: ['playerId', 'rollNumberNormalized'],
  acquisitions: ['playerId'],
  sales: ['playerId'],
  round2Records: ['playerId'],
  allotments: ['playerId'],
  purseTransactions: ['playerId'],
  referrals: ['playerId'],
  auctionHistory: ['playerId', 'playerRoll'],
  auditLogs: ['entityId', 'targetId'],
  auditLog: ['entityId', 'targetId'],
};

async function findProtectedHistory(
  txn: FirebaseFirestore.Transaction,
  playerIds: string[],
  rolls: string[],
  editionId?: string,
): Promise<boolean> {
  const refs: FirebaseFirestore.Query[] = [];
  for (const [collectionName, fields] of Object.entries(HISTORY_REFERENCES)) {
    for (const field of fields) {
      const values = field.toLowerCase().includes('roll') ? rolls : playerIds;
      if (values.length) refs.push(db.collection(collectionName).where(field, 'in', values.slice(0, 10)));
    }
  }
  const snapshots = await Promise.all(refs.map((ref) => txn.get(ref)));
  if (snapshots.some((snapshot) => !snapshot.empty)) return true;

  // Franchise squads are legacy embedded arrays, so inspect the selected
  // edition's canonical franchise documents instead of relying on display names.
  if (editionId) {
    const franchises = await txn.get(db.collection('franchises').where('editionId', '==', editionId));
    for (const franchise of franchises.docs) {
      const squad = franchise.get('squad');
      if (Array.isArray(squad) && squad.some((entry: any) =>
        playerIds.includes(String(entry?.playerId || entry?.id || '')) ||
        rolls.includes(String(entry?.rollNumberNormalized || entry?.roll || '').toUpperCase()))) return true;
    }
  }
  return false;
}

export const managePlayerRecord = onCall({ maxInstances: 3 }, async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN']);
  const { playerId, action, reason, confirmation } = request.data as {
    playerId?: string; action?: PlayerAction; reason?: string; confirmation?: string;
  };
  if (!playerId || typeof playerId !== 'string' || !['ARCHIVE', 'RESTORE', 'PERMANENT_DELETE'].includes(action || '')) {
    throw new HttpsError('invalid-argument', 'A player ID and supported action are required.');
  }
  const ref = db.collection('players').doc(playerId);
  const auditRef = db.collection('auditLogs').doc();
  const result = await db.runTransaction(async (txn) => {
    const snap = await txn.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Player record not found.');
    const player = snap.data()!;
    const roll = String(player.rollNumberNormalized || player.rollNumber || player.roll || '').toUpperCase();
    const ids = [snap.id, String(player.playerId || snap.id)];
    const rolls = roll ? [roll] : [];
    const protectedHistory = await findProtectedHistory(txn, ids, rolls, player.editionId);

    if (action === 'PERMANENT_DELETE') {
      if (protectedHistory) {
        writeAuditEvent({ actor: caller, action: 'PLAYER_DELETE_REJECTED', targetType: 'PLAYER', targetId: snap.id,
          result: 'REJECTED', editionId: player.editionId, metadata: { rollNumber: roll, reason: 'PROTECTED_AUCTION_HISTORY' }, transaction: txn });
        return { success: false, protectedHistory: true as const };
      }
      if (confirmation !== `DELETE ${roll || snap.id}`) throw new HttpsError('failed-precondition', `Type DELETE ${roll || snap.id} to confirm.`);
      txn.delete(ref);
      writeAuditEvent({ actor: caller, action: 'PLAYER_PERMANENTLY_DELETED', targetType: 'PLAYER', targetId: snap.id,
        editionId: player.editionId, metadata: { rollNumber: roll }, transaction: txn });
      return { success: true, alreadyApplied: false };
    }

    const publicRef = db.collection('playersPublic').doc(snap.id);
    if (action === 'ARCHIVE') {
      if (player.status === 'ARCHIVED' || player.status === 'DELETED') return { success: true, alreadyApplied: true };
      const before = { status: player.status || null, approvalStatus: player.approvalStatus || null,
        verificationStatus: player.verificationStatus || null, accountStatus: player.accountStatus || null,
        auctionEligible: player.auctionEligible ?? null, publicVisibility: player.publicVisibility ?? null };
      txn.update(ref, {
        governancePreviousState: before,
        status: 'ARCHIVED', approvalStatus: 'ARCHIVED', verificationStatus: 'ARCHIVED',
        accountStatus: 'DISABLED', auctionEligible: false, publicVisibility: false,
        archivedAt: admin.firestore.FieldValue.serverTimestamp(), archivedBy: caller.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      if (player.editionId) {
        txn.set(publicRef, { status: 'ARCHIVED', auctionStatus: 'ARCHIVED', approvalStatus: 'ARCHIVED', auctionEligible: false, publicVisibility: false }, { merge: true });
      }
      writeAuditEvent({ actor: caller, action: 'PLAYER_ARCHIVED', targetType: 'PLAYER', targetId: snap.id,
        editionId: player.editionId, before, after: { status: 'ARCHIVED' }, reason: reason || null, transaction: txn });
    } else {
      if (player.status !== 'ARCHIVED' && player.status !== 'DELETED') return { success: true, alreadyApplied: true };
      const before = { status: player.status, approvalStatus: player.approvalStatus || null };
      const previous = player.governancePreviousState || {};
      txn.update(ref, {
        status: previous.status || 'AVAILABLE', approvalStatus: previous.approvalStatus || 'PENDING_APPROVAL',
        verificationStatus: previous.verificationStatus || 'PENDING_VERIFICATION',
        accountStatus: previous.accountStatus || 'ACTIVE', auctionEligible: previous.auctionEligible ?? false,
        publicVisibility: previous.publicVisibility ?? false,
        governancePreviousState: admin.firestore.FieldValue.delete(), archivedAt: admin.firestore.FieldValue.delete(),
        archivedBy: admin.firestore.FieldValue.delete(), updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      writeAuditEvent({ actor: caller, action: 'PLAYER_RESTORED', targetType: 'PLAYER', targetId: snap.id,
        editionId: player.editionId, before, after: { status: previous.status || 'AVAILABLE' }, transaction: txn });
    }
    return { success: true, alreadyApplied: false };
  });
  if ('protectedHistory' in result) {
    throw new HttpsError('failed-precondition', 'Player has protected auction history and cannot be permanently deleted. Archive the player instead.');
  }
  return result;
});

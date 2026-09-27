import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';

export const approvePlayer = onCall(async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN']);
  
  const { playerId, action: approvalAction } = request.data;
  if (!playerId) throw new HttpsError('invalid-argument', 'playerId is required.');
  
  const playerRef = db.collection('players').doc(playerId);
  const playerSnap = await playerRef.get();
  if (!playerSnap.exists) throw new HttpsError('not-found', 'Player not found.');
  
  const player = playerSnap.data()!;
  const newStatus = approvalAction === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  
  await playerRef.update({
    'registration.status': newStatus,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  await db.collection('auditLogs').add({
    editionId: player.editionId,
    actorUid: caller.uid,
    actorRole: caller.role,
    action: `PLAYER_${approvalAction}`,
    entityType: 'PLAYER',
    entityId: playerId,
    beforeState: { status: player.registration?.status },
    afterState: { status: newStatus },
    reason: null,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return { success: true, playerId, status: newStatus };
});

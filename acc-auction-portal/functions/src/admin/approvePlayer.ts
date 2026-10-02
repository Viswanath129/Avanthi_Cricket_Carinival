import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';
import { writeAuditEvent } from '../utils/audit';

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
  
  await writeAuditEvent({ actor: caller, action: `PLAYER_${approvalAction}`, targetType: 'PLAYER', targetId: playerId,
    editionId: player.editionId, before: { status: player.registration?.status }, after: { status: newStatus } });
  
  return { success: true, playerId, status: newStatus };
});

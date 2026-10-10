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
  const approved = approvalAction === 'APPROVE';
  const newStatus = approved ? 'AVAILABLE' : 'REJECTED';
  const newApprovalStatus = approved ? 'APPROVED' : 'REJECTED';
  
  await playerRef.update({
    'registration.status': newApprovalStatus,
    status: newStatus,
    approvalStatus: newApprovalStatus,
    verificationStatus: approved ? 'VERIFIED' : 'REJECTED',
    auctionEligible: approved,
    publicVisibility: approved,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  await writeAuditEvent({ actor: caller, action: `PLAYER_${approvalAction}`, targetType: 'PLAYER', targetId: playerId,
    editionId: player.editionId, before: { status: player.status, approvalStatus: player.approvalStatus }, after: { status: newStatus, approvalStatus: newApprovalStatus } });
  
  return { success: true, playerId, status: newStatus, approvalStatus: newApprovalStatus };
});

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';
import { writeAuditEvent } from '../utils/audit';

export const markPayment = onCall(async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN']);
  
  const { playerId, paid } = request.data;
  if (!playerId) throw new HttpsError('invalid-argument', 'playerId is required.');
  if (typeof paid !== 'boolean') throw new HttpsError('invalid-argument', 'paid must be boolean.');
  
  const playerRef = db.collection('players').doc(playerId);
  const playerSnap = await playerRef.get();
  if (!playerSnap.exists) throw new HttpsError('not-found', 'Player not found.');
  const player = playerSnap.data()!;
  
  // A player becomes auctionable when: paid=true, status=APPROVED, cricheroes not pending creation
  const isAuctionable = paid && 
    player.registration?.status === 'APPROVED' &&
    player.cricheroes?.status !== 'PROFILE_CREATION_PENDING';
  
  await playerRef.update({
    'registration.paid': paid,
    auctionable: isAuctionable,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  await writeAuditEvent({ actor: caller, action: paid ? 'MARK_PAID' : 'MARK_UNPAID', targetType: 'PLAYER', targetId: playerId,
    editionId: player.editionId, before: { paid: player.registration?.paid }, after: { paid, auctionable: isAuctionable } });
  
  return { success: true, playerId, paid, auctionable: isAuctionable };
});

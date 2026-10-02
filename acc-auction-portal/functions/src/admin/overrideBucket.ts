import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';
import { writeAuditEvent } from '../utils/audit';

export const overrideBucket = onCall(async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN']);
  
  const { playerId, newBucket, newStudyYear, reason } = request.data;
  if (!playerId || !newBucket) throw new HttpsError('invalid-argument', 'playerId and newBucket are required.');
  if (!reason) throw new HttpsError('invalid-argument', 'Reason is required for manual overrides.');
  
  const playerRef = db.collection('players').doc(playerId);
  const playerSnap = await playerRef.get();
  if (!playerSnap.exists) throw new HttpsError('not-found', 'Player not found.');
  const player = playerSnap.data()!;
  
  const beforeState = {
    bucket: player.academic?.bucket,
    studyYear: player.academic?.studyYear,
    manualOverride: player.academic?.manualOverride,
  };
  
  await playerRef.update({
    'academic.bucket': newBucket,
    'academic.studyYear': newStudyYear || player.academic?.studyYear,
    'academic.manualOverride': true,
    'academic.overrideReason': reason,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  await writeAuditEvent({ actor: caller, action: 'OVERRIDE_BUCKET', targetType: 'PLAYER', targetId: playerId,
    editionId: player.editionId, before: beforeState,
    after: { bucket: newBucket, studyYear: newStudyYear, manualOverride: true, overrideReason: reason }, reason });
  
  return { success: true, playerId, newBucket };
});

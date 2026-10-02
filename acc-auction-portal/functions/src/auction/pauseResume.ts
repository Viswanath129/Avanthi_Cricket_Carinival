import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';
import { writeAuditEvent } from '../utils/audit';

export const pauseResumeAuction = onCall({ maxInstances: 5 }, async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
  
  const { editionId, action: controlAction } = request.data;
  if (!editionId) throw new HttpsError('invalid-argument', 'editionId is required.');
  if (!controlAction || !['PAUSE', 'RESUME'].includes(controlAction)) {
    throw new HttpsError('invalid-argument', 'action must be PAUSE or RESUME.');
  }
  
  const auctionRef = db.collection('editions').doc(editionId).collection('auction').doc('state');
  
  await auctionRef.set({
    status: controlAction === 'PAUSE' ? 'PAUSED' : 'LIVE',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  
  // Audit
  await writeAuditEvent({ actor: caller, action: controlAction, targetType: 'AUCTION', targetId: editionId,
    editionId, after: { status: controlAction === 'PAUSE' ? 'PAUSED' : 'LIVE' } });
  
  return { success: true, status: controlAction === 'PAUSE' ? 'PAUSED' : 'LIVE' };
});

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';

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
  await db.collection('auditLogs').add({
    editionId,
    actorUid: caller.uid,
    actorRole: caller.role,
    action: controlAction === 'PAUSE' ? 'PAUSE_AUCTION' : 'RESUME_AUCTION',
    entityType: 'AUCTION',
    entityId: editionId,
    beforeState: null,
    afterState: { status: controlAction === 'PAUSE' ? 'PAUSED' : 'LIVE' },
    reason: null,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return { success: true, status: controlAction === 'PAUSE' ? 'PAUSED' : 'LIVE' };
});

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';

export const skipLot = onCall({ maxInstances: 5 }, async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
  
  const { lotId } = request.data;
  if (!lotId) throw new HttpsError('invalid-argument', 'lotId is required.');
  
  const result = await db.runTransaction(async (txn) => {
    const lotRef = db.collection('lots').doc(lotId);
    const lotSnap = await txn.get(lotRef);
    if (!lotSnap.exists) throw new HttpsError('not-found', 'Lot not found.');
    const lot = lotSnap.data()!;
    
    if (lot.status !== 'LIVE' && lot.status !== 'CALLED') {
      throw new HttpsError('failed-precondition', `Cannot skip. Lot status: ${lot.status}`);
    }
    
    txn.update(lotRef, {
      status: 'SKIPPED',
      version: admin.firestore.FieldValue.increment(1),
    });
    
    const auditRef = db.collection('auditLogs').doc();
    txn.set(auditRef, {
      editionId: lot.editionId,
      actorUid: caller.uid,
      actorRole: caller.role,
      action: 'SKIP_LOT',
      entityType: 'LOT',
      entityId: lotId,
      beforeState: { status: lot.status },
      afterState: { status: 'SKIPPED' },
      reason: null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return { success: true, lotId };
  });
  
  return result;
});

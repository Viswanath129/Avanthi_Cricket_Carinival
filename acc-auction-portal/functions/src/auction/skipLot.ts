import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';
import { writeAuditEvent } from '../utils/audit';

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
    
    writeAuditEvent({ actor: caller, action: 'SKIP', targetType: 'LOT', targetId: lotId, editionId: lot.editionId,
      before: { status: lot.status }, after: { status: 'SKIPPED' }, transaction: txn });
    
    return { success: true, lotId };
  });
  
  return result;
});

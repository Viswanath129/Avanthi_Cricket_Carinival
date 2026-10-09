import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';
import { writeAuditEvent } from '../utils/audit';

export const openLot = onCall({ maxInstances: 5 }, async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
  
  const { lotId } = request.data;
  if (!lotId) throw new HttpsError('invalid-argument', 'lotId is required.');
  
  const result = await db.runTransaction(async (txn) => {
    const lotRef = db.collection('lots').doc(lotId);
    const lotSnap = await txn.get(lotRef);
    if (!lotSnap.exists) throw new HttpsError('not-found', 'Lot not found.');
    const lot = lotSnap.data()!;
    
    if (lot.status !== 'CALLED' && lot.status !== 'AVAILABLE') {
      throw new HttpsError('failed-precondition', `Cannot open lot. Current status: ${lot.status}`);
    }
    
    // Set initial timer to 30 seconds
    const timerDeadline = admin.firestore.Timestamp.fromMillis(Date.now() + 30000);
    
    txn.update(lotRef, {
      status: 'LIVE',
      currentPrice: lot.basePrice,
      highestBidderFranchiseId: null,
      timerDeadline,
      timerDurationMs: 30000,
      timerRunning: true,
      pausedRemainingMs: null,
      version: admin.firestore.FieldValue.increment(1),
    });
    
    // Update auction state to point to this lot
    const auctionRef = db.collection('editions').doc(lot.editionId).collection('auction').doc('state');
    txn.set(auctionRef, {
      currentLotId: lotId,
      status: 'LIVE',
      pausedRemainingMs: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    // Reset all franchise statuses to IN_PLAY for new lot
    const franchisesSnap = await txn.get(
      db.collection('franchises').where('editionId', '==', lot.editionId).where('status', '==', 'ACTIVE')
    );
    
    const franchiseStatuses: Record<string, string> = {};
    franchisesSnap.docs.forEach(doc => {
      franchiseStatuses[doc.id] = 'IN_PLAY';
    });
    
    txn.set(auctionRef, { franchiseStatuses }, { merge: true });
    
    // Audit
    writeAuditEvent({ actor: caller, action: 'OPEN_LOT', targetType: 'LOT', targetId: lotId, editionId: lot.editionId,
      before: { status: lot.status }, after: { status: 'LIVE', basePrice: lot.basePrice }, transaction: txn });
    
    return { success: true, lotId, basePrice: lot.basePrice };
  });
  
  return result;
});

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';
import { writeAuditEvent } from '../utils/audit';

export const undoSale = onCall({ maxInstances: 5 }, async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN']);
  
  const { acquisitionId, reason } = request.data;
  if (!acquisitionId) throw new HttpsError('invalid-argument', 'acquisitionId is required.');
  if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
    throw new HttpsError('invalid-argument', 'A reason is required for undo operations (min 3 characters).');
  }
  
  const result = await db.runTransaction(async (txn) => {
    const acqRef = db.collection('acquisitions').doc(acquisitionId);
    const acqSnap = await txn.get(acqRef);
    if (!acqSnap.exists) throw new HttpsError('not-found', 'Acquisition not found.');
    const acq = acqSnap.data()!;
    
    // Cannot undo already undone
    if (acq.status === 'UNDONE') {
      throw new HttpsError('failed-precondition', 'This acquisition has already been undone.');
    }
    
    // Mark acquisition as UNDONE (never delete)
    txn.update(acqRef, {
      status: 'UNDONE',
      undoneAt: admin.firestore.FieldValue.serverTimestamp(),
      undoReason: reason.trim(),
    });
    
    // Refund franchise purse and decrement squad
    const franchiseRef = db.collection('franchises').doc(acq.franchiseId);
    const franchiseSnap = await txn.get(franchiseRef);
    if (!franchiseSnap.exists) throw new HttpsError('internal', 'Franchise not found during undo.');
    const franchise = franchiseSnap.data()!;
    
    // We need to get the lot to know the bucket
    const lotRef = db.collection('lots').doc(acq.lotId);
    const lotSnap = await txn.get(lotRef);
    if (!lotSnap.exists) throw new HttpsError('failed-precondition', 'Auction lot is missing; sale cannot be safely undone.');
    const lot = lotSnap.data()!;
    if (lot.status !== 'SOLD') throw new HttpsError('failed-precondition', 'Auction lot is not in the SOLD state.');
    const bucketId = lot.bucketId;
    if (!bucketId) throw new HttpsError('failed-precondition', 'Auction lot has no bucket; sale cannot be safely undone.');
    
    const currentBucketCountForBucket = franchise.squad?.bucketCounts?.[bucketId] || 0;
    
    txn.update(franchiseRef, {
      purseRemaining: admin.firestore.FieldValue.increment(acq.price),
      'squad.count': admin.firestore.FieldValue.increment(-1),
      'squad.auctionPurchases': admin.firestore.FieldValue.increment(-1),
      [`squad.bucketCounts.${bucketId}`]: Math.max(0, currentBucketCountForBucket - 1),
    });
    
    // Return player to pool (mark lot as available/unsold for rebidding)
    txn.update(lotRef, {
      status: 'AVAILABLE',
      currentPrice: lot.basePrice,
      highestBidderFranchiseId: null,
      version: admin.firestore.FieldValue.increment(1),
    });
    
    // Return player to auctionable state
    if (acq.playerId) {
      const playerRef = db.collection('players').doc(acq.playerId);
      txn.update(playerRef, {
        auctionable: true,
      });
    }
    
    // Audit log
    writeAuditEvent({ actor: caller, action: 'AUCTION_UNDO', targetType: 'ACQUISITION', targetId: acquisitionId,
      editionId: acq.editionId, before: { status: 'ACTIVE', price: acq.price, franchiseId: acq.franchiseId, playerId: acq.playerId },
      after: { status: 'UNDONE', undoReason: reason.trim() }, reason: reason.trim(), transaction: txn });
    
    return {
      success: true,
      playerId: acq.playerId,
      franchiseId: acq.franchiseId,
      refundedAmount: acq.price,
      bucketId,
    };
  });
  
  return result;
});

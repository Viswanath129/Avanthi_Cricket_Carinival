import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';

export const undoSale = onCall({ maxInstances: 5 }, async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
  
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
    
    const currentBucketCount = franchise.squad?.bucketCounts?.[acq.lotId] || 0;
    
    // We need to get the lot to know the bucket
    const lotRef = db.collection('lots').doc(acq.lotId);
    const lotSnap = await txn.get(lotRef);
    const lot = lotSnap.exists ? lotSnap.data()! : null;
    const bucketId = lot?.bucketId || 'B1';
    
    const currentBucketCountForBucket = franchise.squad?.bucketCounts?.[bucketId] || 0;
    
    txn.update(franchiseRef, {
      purseRemaining: admin.firestore.FieldValue.increment(acq.price),
      'squad.count': admin.firestore.FieldValue.increment(-1),
      'squad.auctionPurchases': admin.firestore.FieldValue.increment(-1),
      [`squad.bucketCounts.${bucketId}`]: Math.max(0, currentBucketCountForBucket - 1),
    });
    
    // Return player to pool (mark lot as available/unsold for rebidding)
    if (lot) {
      txn.update(lotRef, {
        status: 'AVAILABLE',
        currentPrice: lot.basePrice,
        highestBidderFranchiseId: null,
        version: admin.firestore.FieldValue.increment(1),
      });
    }
    
    // Return player to auctionable state
    if (acq.playerId) {
      const playerRef = db.collection('players').doc(acq.playerId);
      txn.update(playerRef, {
        auctionable: true,
      });
    }
    
    // Audit log
    const auditRef = db.collection('auditLogs').doc();
    txn.set(auditRef, {
      editionId: acq.editionId,
      actorUid: caller.uid,
      actorRole: caller.role,
      action: 'UNDO_SALE',
      entityType: 'ACQUISITION',
      entityId: acquisitionId,
      beforeState: { status: 'ACTIVE', price: acq.price, franchiseId: acq.franchiseId, playerId: acq.playerId },
      afterState: { status: 'UNDONE', undoReason: reason.trim() },
      reason: reason.trim(),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    
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

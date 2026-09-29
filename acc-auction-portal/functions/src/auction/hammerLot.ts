import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';

export const hammerLot = onCall({ maxInstances: 5 }, async (request) => {
  // Super Admin or Operator can hammer
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
  
  const { lotId } = request.data;
  if (!lotId) throw new HttpsError('invalid-argument', 'lotId is required.');
  
  const result = await db.runTransaction(async (txn) => {
    const lotRef = db.collection('lots').doc(lotId);
    const lotSnap = await txn.get(lotRef);
    if (!lotSnap.exists) throw new HttpsError('not-found', 'Lot not found.');
    const lot = lotSnap.data()!;
    
    if (lot.status !== 'LIVE') {
      throw new HttpsError('failed-precondition', `Cannot hammer. Lot status is ${lot.status}, expected LIVE.`);
    }
    
    const hasHighestBidder = !!lot.highestBidderFranchiseId;
    const newStatus = hasHighestBidder ? 'SOLD' : 'UNSOLD';
    
    // Update lot status
    txn.update(lotRef, {
      status: newStatus,
      version: admin.firestore.FieldValue.increment(1),
    });
    
    if (hasHighestBidder) {
      // Create acquisition
      const acqRef = db.collection('acquisitions').doc();
      txn.set(acqRef, {
        editionId: lot.editionId,
        lotId,
        playerId: lot.playerId,
        franchiseId: lot.highestBidderFranchiseId,
        type: 'SOLD',
        price: lot.currentPrice,
        status: 'ACTIVE',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        undoneAt: null,
        undoReason: null,
      });
      
      // Update franchise - deduct purse, increment squad
      const franchiseRef = db.collection('franchises').doc(lot.highestBidderFranchiseId);
      const franchiseSnap = await txn.get(franchiseRef);
      if (!franchiseSnap.exists) throw new HttpsError('internal', 'Franchise not found during hammer.');
      const franchise = franchiseSnap.data()!;
      
      const currentBucketCount = franchise.squad?.bucketCounts?.[lot.bucketId] || 0;
      
      txn.update(franchiseRef, {
        purseRemaining: admin.firestore.FieldValue.increment(-lot.currentPrice),
        'squad.count': admin.firestore.FieldValue.increment(1),
        'squad.auctionPurchases': admin.firestore.FieldValue.increment(1),
        [`squad.bucketCounts.${lot.bucketId}`]: currentBucketCount + 1,
      });
      
      // Update player as acquired
      if (lot.playerId) {
        const playerRef = db.collection('players').doc(lot.playerId);
        txn.update(playerRef, {
          'registration.status': 'ACQUIRED',
          auctionable: false,
        });
      }
    }
    
    // Write audit log
    const auditRef = db.collection('auditLogs').doc();
    txn.set(auditRef, {
      editionId: lot.editionId,
      actorUid: caller.uid,
      actorRole: caller.role,
      action: hasHighestBidder ? 'HAMMER_SOLD' : 'HAMMER_UNSOLD',
      entityType: 'LOT',
      entityId: lotId,
      beforeState: { status: 'LIVE', currentPrice: lot.currentPrice, highestBidder: lot.highestBidderFranchiseId },
      afterState: { status: newStatus },
      reason: null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return {
      status: newStatus,
      playerId: lot.playerId,
      franchiseId: lot.highestBidderFranchiseId,
      price: lot.currentPrice,
    };
  });
  
  return result;
});

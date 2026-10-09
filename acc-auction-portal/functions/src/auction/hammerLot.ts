import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';
import { writeAuditEvent } from '../utils/audit';

export const hammerLot = onCall({ maxInstances: 5 }, async (request) => {
  // Super Admin or Operator can hammer
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
  
  const { lotId } = request.data || {};
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
    
    // Update lot status and clear timer
    txn.update(lotRef, {
      status: newStatus,
      timerRunning: false,
      timerDeadline: null,
      pausedRemainingMs: null,
      version: admin.firestore.FieldValue.increment(1),
    });
    
    let winningFranchiseName = 'None';
    
    if (hasHighestBidder) {
      // Read franchise - deduct purse, increment squad
      const franchiseRef = db.collection('franchises').doc(lot.highestBidderFranchiseId);
      const franchiseSnap = await txn.get(franchiseRef);
      if (!franchiseSnap.exists) throw new HttpsError('internal', 'Franchise not found during hammer.');
      const franchise = franchiseSnap.data()!;
      winningFranchiseName = franchise.name || 'Franchise';
      
      // Create acquisition
      const acqRef = db.collection('acquisitions').doc();
      txn.set(acqRef, {
        editionId: lot.editionId,
        lotId,
        drawNumber: lot.drawNumber || null,
        lotNumber: lot.lotNumber || null,
        playerId: lot.playerId,
        playerName: lot.playerName || 'Player',
        franchiseId: lot.highestBidderFranchiseId,
        franchiseName: winningFranchiseName,
        type: 'SOLD',
        price: lot.currentPrice,
        status: 'ACTIVE',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        undoneAt: null,
        undoReason: null,
      });
      
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
          status: 'SOLD',
          auctionStatus: 'SOLD',
          soldPrice: lot.currentPrice,
          soldFranchiseId: lot.highestBidderFranchiseId,
          soldFranchiseName: winningFranchiseName,
          auctionable: false,
        });
      }
    } else {
      // Mark player as UNSOLD
      if (lot.playerId) {
        const playerRef = db.collection('players').doc(lot.playerId);
        txn.update(playerRef, {
          status: 'UNSOLD',
          auctionStatus: 'UNSOLD',
        });
      }
    }
    
    // Update auction state with authoritative sale data
    const auctionRef = db.collection('editions').doc(lot.editionId).collection('auction').doc('state');
    const lastSaleData = hasHighestBidder ? {
      lotId,
      drawNumber: lot.drawNumber || null,
      lotNumber: lot.lotNumber || null,
      playerId: lot.playerId || null,
      playerName: lot.playerName || 'Player',
      rollNumber: lot.rollNumber || null,
      branch: lot.branch || null,
      year: lot.year || null,
      bucket: lot.bucket || lot.bucketId || null,
      playerType: lot.playerType || null,
      photoUrl: lot.photoUrl || null,
      franchiseId: lot.highestBidderFranchiseId,
      franchiseName: winningFranchiseName,
      soldPrice: lot.currentPrice,
      timestamp: Date.now(),
    } : null;

    txn.set(auctionRef, {
      status: hasHighestBidder ? 'SOLD' : 'UNSOLD',
      lastSale: lastSaleData,
      lastCompletedLotId: lotId,
      pausedRemainingMs: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    // Write audit log
    writeAuditEvent({ 
      actor: caller, 
      action: 'HAMMER', 
      targetType: 'LOT', 
      targetId: lotId,
      editionId: lot.editionId,
      before: { status: 'LIVE', currentPrice: lot.currentPrice, highestBidder: lot.highestBidderFranchiseId },
      after: { status: newStatus }, 
      metadata: { outcome: hasHighestBidder ? 'SOLD' : 'UNSOLD', price: lot.currentPrice, franchise: winningFranchiseName }, 
      transaction: txn 
    });
    
    return {
      status: newStatus,
      lotId,
      playerId: lot.playerId,
      playerName: lot.playerName,
      franchiseId: lot.highestBidderFranchiseId,
      franchiseName: winningFranchiseName,
      price: lot.currentPrice,
      photoUrl: lot.photoUrl || null,
      rollNumber: lot.rollNumber || null,
      bucket: lot.bucket || lot.bucketId || null,
    };
  });
  
  return result;
});

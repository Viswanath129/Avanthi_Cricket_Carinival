import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller, resolveFranchiseId } from '../utils/auth';
import { calculateNextBid, calculateMaxBid, checkBucketEligibility } from '../utils/bidLogic';
import * as admin from 'firebase-admin';
import { writeAuditEvent } from '../utils/audit';

export const placeBid = onCall({ maxInstances: 10 }, async (request) => {
  // 1. Authenticate
  const caller = await verifyCaller(request.auth?.uid, [
    'FRANCHISE_COORDINATOR', 'FRANCHISE_TEAM_LEADER', 'SUPER_ADMIN', 'ADMIN'
  ]);
  
  // 2. Extract input
  const { lotId, clientActionId } = request.data;
  if (!lotId || !clientActionId) {
    throw new HttpsError('invalid-argument', 'lotId and clientActionId are required.');
  }
  
  // 3. Resolve franchise
  let franchiseId: string;
  if (caller.role === 'SUPER_ADMIN' || caller.role === 'ADMIN') {
    if (!request.data.franchiseId) {
      throw new HttpsError('invalid-argument', 'franchiseId is required when placing bid on behalf.');
    }
    franchiseId = request.data.franchiseId;
  } else {
    franchiseId = await resolveFranchiseId(caller);
  }
  
  // 4. Execute as Firestore transaction
  const result = await db.runTransaction(async (txn) => {
    // Read lot
    const lotRef = db.collection('lots').doc(lotId);
    const lotSnap = await txn.get(lotRef);
    if (!lotSnap.exists) throw new HttpsError('not-found', 'Lot not found.');
    const lot = lotSnap.data()!;
    
    // Verify lot is LIVE
    if (lot.status !== 'LIVE') {
      throw new HttpsError('failed-precondition', `Lot is not live. Current status: ${lot.status}`);
    }

    // Verify auction countdown timer has not expired
    if (lot.timerDeadline) {
      const deadlineMs = lot.timerDeadline.toMillis
        ? lot.timerDeadline.toMillis()
        : (typeof lot.timerDeadline.seconds === 'number'
          ? lot.timerDeadline.seconds * 1000
          : Number(lot.timerDeadline));
      if (Date.now() >= deadlineMs) {
        throw new HttpsError('failed-precondition', 'Auction countdown timer expired. Bidding is closed for this lot.');
      }
    }
    
    // Read auction state to check franchise status
    const auctionRef = db.collection('editions').doc(lot.editionId).collection('auction').doc('state');
    const auctionSnap = await txn.get(auctionRef);
    if (!auctionSnap.exists) throw new HttpsError('not-found', 'Auction state not found.');
    const auctionState = auctionSnap.data()!;
    
    // Check franchise is IN_PLAY
    const franchiseStatus = auctionState.franchiseStatuses?.[franchiseId];
    if (franchiseStatus === 'PASSED') {
      throw new HttpsError('failed-precondition', 'Franchise has passed on this lot.');
    }
    if (franchiseStatus === 'BLOCKED') {
      throw new HttpsError('failed-precondition', 'Franchise is blocked from bidding.');
    }
    
    // Read franchise data
    const franchiseRef = db.collection('franchises').doc(franchiseId);
    const franchiseSnap = await txn.get(franchiseRef);
    if (!franchiseSnap.exists) throw new HttpsError('not-found', 'Franchise not found.');
    const franchise = franchiseSnap.data()!;
    
    // Check idempotency - has this clientActionId been used?
    const existingBids = await txn.get(
      db.collection('bids')
        .where('lotId', '==', lotId)
        .where('clientActionId', '==', clientActionId)
        .limit(1)
    );
    if (!existingBids.empty) {
      // Idempotent return - bid already processed
      return { alreadyProcessed: true, bidId: existingBids.docs[0].id };
    }
    
    // Calculate next bid amount
    const nextBid = calculateNextBid(lot.currentPrice);
    
    // Get edition for bucket minimums
    const editionRef = db.collection('editions').doc(lot.editionId);
    const editionSnap = await txn.get(editionRef);
    const edition = editionSnap.data()!;
    const bucketMinimums = edition.bucketMinimums || { B1: 2, B2: 2, B3: 2, B4: 2, D5: 2, M6: 0 };
    
    // Check bucket eligibility
    const eligibility = checkBucketEligibility(
      franchise.squad?.bucketCounts || {},
      lot.bucketId,
      franchise.squad?.auctionPurchases || 0,
      edition.bucketMinimums ? 15 : 15,
      bucketMinimums
    );
    
    if (!eligibility.eligible) {
      throw new HttpsError('failed-precondition', eligibility.reason || 'Bucket eligibility check failed.');
    }
    
    // Check max bid
    const maxBidResult = calculateMaxBid({
      purseRemaining: franchise.purseRemaining,
      auctionPurchasesSoFar: franchise.squad?.auctionPurchases || 0,
      bucketCounts: franchise.squad?.bucketCounts || {},
      currentPlayerBucket: lot.bucketId,
      minAuctionPurchases: 15,
      bucketMinimums,
    });
    
    if (nextBid > maxBidResult.maxBid) {
      throw new HttpsError('failed-precondition', `Bid of ₹${nextBid} exceeds maximum permissible bid of ₹${maxBidResult.maxBid}. ${maxBidResult.reason || ''}`);
    }
    
    // Validate purse can cover this bid
    if (nextBid > franchise.purseRemaining) {
      throw new HttpsError('failed-precondition', `Insufficient purse. Current: ₹${franchise.purseRemaining}, Required: ₹${nextBid}`);
    }
    
    // Count existing bids for sequence number
    const bidCountSnap = await txn.get(
      db.collection('bids').where('lotId', '==', lotId)
    );
    const sequenceNumber = bidCountSnap.size + 1;
    
    // Create bid document
    const bidRef = db.collection('bids').doc();
    txn.set(bidRef, {
      editionId: lot.editionId,
      lotId,
      franchiseId,
      amount: nextBid,
      previousAmount: lot.currentPrice,
      sequenceNumber,
      clientActionId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    writeAuditEvent({ actor: caller, action: caller.role === 'ADMIN' || caller.role === 'SUPER_ADMIN' ? 'BID_ON_BEHALF' : 'BID_PLACED',
      targetType: 'LOT', targetId: lotId, editionId: lot.editionId,
      metadata: { bidId: bidRef.id, franchiseId, amount: nextBid }, transaction: txn });
    
    // Update lot
    const newTimerDeadline = admin.firestore.Timestamp.fromMillis(Date.now() + 20000); // 20 sec reset
    txn.update(lotRef, {
      currentPrice: nextBid,
      highestBidderFranchiseId: franchiseId,
      highestBidderId: franchiseId,
      highestBidderName: franchise.name || 'Franchise',
      timerDeadline: newTimerDeadline,
      timerDurationMs: 20000,
      timerRunning: true,
      pausedRemainingMs: null,
      version: admin.firestore.FieldValue.increment(1),
    });
    
    return {
      alreadyProcessed: false,
      bidId: bidRef.id,
      amount: nextBid,
      franchiseId,
      sequenceNumber,
    };
  });
  
  return result;
});

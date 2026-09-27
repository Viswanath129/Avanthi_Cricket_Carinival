import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller, resolveFranchiseId } from '../utils/auth';
import { calculateNextBid, calculateMaxBid, checkBucketEligibility } from '../utils/bidLogic';
import * as admin from 'firebase-admin';

export const placeBid = onCall({ maxInstances: 10 }, async (request) => {
  // 1. Authenticate
  const caller = await verifyCaller(request.auth?.uid, [
    'FRANCHISE_COORDINATOR', 'FRANCHISE_TEAM_LEADER',
  ]);
  
  // 2. Extract input
  const { lotId, clientActionId } = request.data;
  if (!lotId || !clientActionId) {
    throw new HttpsError('invalid-argument', 'lotId and clientActionId are required.');
  }
  
  // 3. Resolve franchise
  const franchiseId = await resolveFranchiseId(caller);
  
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
    
    // Update lot
    const newTimerDeadline = admin.firestore.Timestamp.fromMillis(Date.now() + 20000); // 20 sec
    txn.update(lotRef, {
      currentPrice: nextBid,
      highestBidderFranchiseId: franchiseId,
      timerDeadline: newTimerDeadline,
      timerDurationMs: 20000,
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

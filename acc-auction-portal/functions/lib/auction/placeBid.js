"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeBid = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const bidLogic_1 = require("../utils/bidLogic");
const admin = __importStar(require("firebase-admin"));
exports.placeBid = (0, https_1.onCall)({ maxInstances: 10 }, async (request) => {
    // 1. Authenticate
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, [
        'FRANCHISE_COORDINATOR', 'FRANCHISE_TEAM_LEADER', 'SUPER_ADMIN', 'ADMIN'
    ]);
    // 2. Extract input
    const { lotId, clientActionId } = request.data;
    if (!lotId || !clientActionId) {
        throw new https_1.HttpsError('invalid-argument', 'lotId and clientActionId are required.');
    }
    // 3. Resolve franchise
    let franchiseId;
    if (caller.role === 'SUPER_ADMIN' || caller.role === 'ADMIN') {
        if (!request.data.franchiseId) {
            throw new https_1.HttpsError('invalid-argument', 'franchiseId is required when placing bid on behalf.');
        }
        franchiseId = request.data.franchiseId;
    }
    else {
        franchiseId = await (0, auth_1.resolveFranchiseId)(caller);
    }
    // 4. Execute as Firestore transaction
    const result = await auth_1.db.runTransaction(async (txn) => {
        // Read lot
        const lotRef = auth_1.db.collection('lots').doc(lotId);
        const lotSnap = await txn.get(lotRef);
        if (!lotSnap.exists)
            throw new https_1.HttpsError('not-found', 'Lot not found.');
        const lot = lotSnap.data();
        // Verify lot is LIVE
        if (lot.status !== 'LIVE') {
            throw new https_1.HttpsError('failed-precondition', `Lot is not live. Current status: ${lot.status}`);
        }
        // Read auction state to check franchise status
        const auctionRef = auth_1.db.collection('editions').doc(lot.editionId).collection('auction').doc('state');
        const auctionSnap = await txn.get(auctionRef);
        if (!auctionSnap.exists)
            throw new https_1.HttpsError('not-found', 'Auction state not found.');
        const auctionState = auctionSnap.data();
        // Check franchise is IN_PLAY
        const franchiseStatus = auctionState.franchiseStatuses?.[franchiseId];
        if (franchiseStatus === 'PASSED') {
            throw new https_1.HttpsError('failed-precondition', 'Franchise has passed on this lot.');
        }
        if (franchiseStatus === 'BLOCKED') {
            throw new https_1.HttpsError('failed-precondition', 'Franchise is blocked from bidding.');
        }
        // Read franchise data
        const franchiseRef = auth_1.db.collection('franchises').doc(franchiseId);
        const franchiseSnap = await txn.get(franchiseRef);
        if (!franchiseSnap.exists)
            throw new https_1.HttpsError('not-found', 'Franchise not found.');
        const franchise = franchiseSnap.data();
        // Check idempotency - has this clientActionId been used?
        const existingBids = await txn.get(auth_1.db.collection('bids')
            .where('lotId', '==', lotId)
            .where('clientActionId', '==', clientActionId)
            .limit(1));
        if (!existingBids.empty) {
            // Idempotent return - bid already processed
            return { alreadyProcessed: true, bidId: existingBids.docs[0].id };
        }
        // Calculate next bid amount
        const nextBid = (0, bidLogic_1.calculateNextBid)(lot.currentPrice);
        // Get edition for bucket minimums
        const editionRef = auth_1.db.collection('editions').doc(lot.editionId);
        const editionSnap = await txn.get(editionRef);
        const edition = editionSnap.data();
        const bucketMinimums = edition.bucketMinimums || { B1: 2, B2: 2, B3: 2, B4: 2, D5: 2, M6: 0 };
        // Check bucket eligibility
        const eligibility = (0, bidLogic_1.checkBucketEligibility)(franchise.squad?.bucketCounts || {}, lot.bucketId, franchise.squad?.auctionPurchases || 0, edition.bucketMinimums ? 15 : 15, bucketMinimums);
        if (!eligibility.eligible) {
            throw new https_1.HttpsError('failed-precondition', eligibility.reason || 'Bucket eligibility check failed.');
        }
        // Check max bid
        const maxBidResult = (0, bidLogic_1.calculateMaxBid)({
            purseRemaining: franchise.purseRemaining,
            auctionPurchasesSoFar: franchise.squad?.auctionPurchases || 0,
            bucketCounts: franchise.squad?.bucketCounts || {},
            currentPlayerBucket: lot.bucketId,
            minAuctionPurchases: 15,
            bucketMinimums,
        });
        if (nextBid > maxBidResult.maxBid) {
            throw new https_1.HttpsError('failed-precondition', `Bid of ₹${nextBid} exceeds maximum permissible bid of ₹${maxBidResult.maxBid}. ${maxBidResult.reason || ''}`);
        }
        // Validate purse can cover this bid
        if (nextBid > franchise.purseRemaining) {
            throw new https_1.HttpsError('failed-precondition', `Insufficient purse. Current: ₹${franchise.purseRemaining}, Required: ₹${nextBid}`);
        }
        // Count existing bids for sequence number
        const bidCountSnap = await txn.get(auth_1.db.collection('bids').where('lotId', '==', lotId));
        const sequenceNumber = bidCountSnap.size + 1;
        // Create bid document
        const bidRef = auth_1.db.collection('bids').doc();
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
//# sourceMappingURL=placeBid.js.map
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
exports.hammerLot = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const admin = __importStar(require("firebase-admin"));
const audit_1 = require("../utils/audit");
exports.hammerLot = (0, https_1.onCall)({ maxInstances: 5 }, async (request) => {
    // Super Admin or Operator can hammer
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
    const { lotId, auctionSessionId, expectedOutcome } = request.data || {};
    if (!lotId || !auctionSessionId)
        throw new https_1.HttpsError('invalid-argument', 'lotId and auctionSessionId are required.');
    const result = await auth_1.db.runTransaction(async (txn) => {
        const lotRef = auth_1.db.collection('lots').doc(lotId);
        const lotSnap = await txn.get(lotRef);
        if (!lotSnap.exists)
            throw new https_1.HttpsError('not-found', 'Lot not found.');
        const lot = lotSnap.data();
        const auctionRef = auth_1.db.collection('editions').doc(lot.editionId).collection('auction').doc('state');
        const auctionSnap = await txn.get(auctionRef);
        if (!auctionSnap.exists)
            throw new https_1.HttpsError('not-found', 'Active auction session not found.');
        const auctionState = auctionSnap.data();
        if (auctionState.currentLotId !== lotId) {
            throw new https_1.HttpsError('failed-precondition', 'Lot does not match the active auction session.');
        }
        if (auctionState.auctionSessionId !== auctionSessionId || lot.auctionSessionId !== auctionSessionId) {
            throw new https_1.HttpsError('failed-precondition', 'Auction session is stale or does not match the active lot.');
        }
        const eligibleStatuses = new Set(['LIVE', 'BIDDING', 'TIME_EXPIRED']);
        if (!eligibleStatuses.has(lot.status)) {
            throw new https_1.HttpsError('failed-precondition', `Cannot hammer. Lot status is ${lot.status}, expected LIVE, BIDDING, or TIME_EXPIRED.`);
        }
        // A sale is based on accepted bids in this session, never on a stale UI field.
        const acceptedBids = await txn.get(auth_1.db.collection('bids').where('lotId', '==', lotId));
        const sessionBids = acceptedBids.docs
            .map((bid) => bid.data())
            .filter((bid) => bid.auctionSessionId === auctionSessionId);
        const winningBid = sessionBids.reduce((winner, bid) => !winner || Number(bid.amount) > Number(winner.amount) ? bid : winner, null);
        const hasHighestBidder = Boolean(winningBid);
        // Auto-derive intent if not explicitly passed by operator
        const effectiveOutcome = expectedOutcome || (hasHighestBidder ? 'SOLD' : 'UNSOLD');
        if (!['SOLD', 'UNSOLD'].includes(effectiveOutcome)) {
            throw new https_1.HttpsError('invalid-argument', 'expectedOutcome must be SOLD or UNSOLD.');
        }
        // Strict validation of operator intent
        if (effectiveOutcome === 'UNSOLD' && hasHighestBidder) {
            throw new https_1.HttpsError('failed-precondition', 'Cannot confirm UNSOLD: A valid bid exists on this lot.');
        }
        if (effectiveOutcome === 'SOLD' && !hasHighestBidder) {
            throw new https_1.HttpsError('failed-precondition', 'Cannot confirm SOLD: No winning bid was placed on this lot.');
        }
        // UNSOLD requires expiry and zero accepted valid bids
        if (!hasHighestBidder) {
            if (!lot.timerDeadline) {
                throw new https_1.HttpsError('failed-precondition', 'Cannot confirm UNSOLD: active auction has no authoritative deadline.');
            }
            if (lot.timerDeadline) {
                const deadlineMs = lot.timerDeadline.toMillis
                    ? lot.timerDeadline.toMillis()
                    : (typeof lot.timerDeadline.seconds === 'number'
                        ? lot.timerDeadline.seconds * 1000
                        : Number(lot.timerDeadline));
                if (Date.now() < deadlineMs) {
                    throw new https_1.HttpsError('failed-precondition', 'Cannot confirm UNSOLD: Auction countdown timer has not expired yet.');
                }
            }
        }
        if (hasHighestBidder && (!lot.highestBidderFranchiseId ||
            winningBid.franchiseId !== lot.highestBidderFranchiseId || Number(winningBid.amount) !== Number(lot.currentPrice))) {
            throw new https_1.HttpsError('failed-precondition', 'Winning bid does not match the active lot. Refresh before hammering.');
        }
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
            const franchiseRef = auth_1.db.collection('franchises').doc(winningBid.franchiseId);
            const franchiseSnap = await txn.get(franchiseRef);
            if (!franchiseSnap.exists)
                throw new https_1.HttpsError('internal', 'Franchise not found during hammer.');
            const franchise = franchiseSnap.data();
            if (['DISABLED', 'BLOCKED', 'REJECTED'].includes(franchise.status)) {
                throw new https_1.HttpsError('failed-precondition', 'Winning franchise is no longer eligible to acquire this lot.');
            }
            winningFranchiseName = franchise.name || 'Franchise';
            // Create acquisition
            const acqRef = auth_1.db.collection('acquisitions').doc();
            txn.set(acqRef, {
                editionId: lot.editionId,
                lotId,
                drawNumber: lot.drawNumber || null,
                lotNumber: lot.lotNumber || null,
                playerId: lot.playerId,
                playerName: lot.playerName || 'Player',
                franchiseId: winningBid.franchiseId,
                franchiseName: winningFranchiseName,
                type: 'SOLD',
                price: lot.currentPrice,
                status: 'ACTIVE',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                undoneAt: null,
                undoReason: null,
            });
            const winningBucket = lot.bucket || lot.bucketId || 'B1';
            const currentBucketCount = franchise.squad?.bucketCounts?.[winningBucket] || 0;
            txn.update(franchiseRef, {
                purseRemaining: admin.firestore.FieldValue.increment(-lot.currentPrice),
                'squad.count': admin.firestore.FieldValue.increment(1),
                'squad.auctionPurchases': admin.firestore.FieldValue.increment(1),
                [`squad.bucketCounts.${winningBucket}`]: currentBucketCount + 1,
            });
            // Update player as acquired
            if (lot.playerId) {
                const playerRef = auth_1.db.collection('players').doc(lot.playerId);
                txn.update(playerRef, {
                    'registration.status': 'ACQUIRED',
                    status: 'SOLD',
                    auctionStatus: 'SOLD',
                    soldPrice: lot.currentPrice,
                    soldFranchiseId: winningBid.franchiseId,
                    soldFranchiseName: winningFranchiseName,
                    auctionable: false,
                    round: lot.round || 1,
                    soldAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        }
        else {
            // Mark player as UNSOLD (eligible for Round 2 recall)
            if (lot.playerId) {
                const playerRef = auth_1.db.collection('players').doc(lot.playerId);
                txn.update(playerRef, {
                    status: 'UNSOLD',
                    auctionStatus: 'UNSOLD',
                    auctionable: false,
                    round1Unsold: (lot.round || 1) === 1,
                    round: lot.round || 1,
                    unsoldAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        }
        // Update auction state with authoritative sale data
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
            franchiseId: winningBid.franchiseId,
            franchiseName: winningFranchiseName,
            soldPrice: lot.currentPrice,
            timestamp: Date.now(),
            round: lot.round || 1,
        } : null;
        const lastUnsoldData = !hasHighestBidder ? {
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
            timestamp: Date.now(),
            round: lot.round || 1,
            outcome: 'UNSOLD',
        } : null;
        txn.set(auctionRef, {
            status: hasHighestBidder ? 'SOLD' : 'UNSOLD',
            lastSale: lastSaleData,
            lastUnsold: lastUnsoldData,
            lastCompletedLotId: lotId,
            pausedRemainingMs: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // Write audit log
        (0, audit_1.writeAuditEvent)({
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
//# sourceMappingURL=hammerLot.js.map
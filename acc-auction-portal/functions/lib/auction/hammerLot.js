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
exports.hammerLot = (0, https_1.onCall)({ maxInstances: 5 }, async (request) => {
    // Only Super Admin can hammer
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['SUPER_ADMIN']);
    const { lotId } = request.data;
    if (!lotId)
        throw new https_1.HttpsError('invalid-argument', 'lotId is required.');
    const result = await auth_1.db.runTransaction(async (txn) => {
        const lotRef = auth_1.db.collection('lots').doc(lotId);
        const lotSnap = await txn.get(lotRef);
        if (!lotSnap.exists)
            throw new https_1.HttpsError('not-found', 'Lot not found.');
        const lot = lotSnap.data();
        if (lot.status !== 'LIVE') {
            throw new https_1.HttpsError('failed-precondition', `Cannot hammer. Lot status is ${lot.status}, expected LIVE.`);
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
            const acqRef = auth_1.db.collection('acquisitions').doc();
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
            const franchiseRef = auth_1.db.collection('franchises').doc(lot.highestBidderFranchiseId);
            const franchiseSnap = await txn.get(franchiseRef);
            if (!franchiseSnap.exists)
                throw new https_1.HttpsError('internal', 'Franchise not found during hammer.');
            const franchise = franchiseSnap.data();
            const currentBucketCount = franchise.squad?.bucketCounts?.[lot.bucketId] || 0;
            txn.update(franchiseRef, {
                purseRemaining: admin.firestore.FieldValue.increment(-lot.currentPrice),
                'squad.count': admin.firestore.FieldValue.increment(1),
                'squad.auctionPurchases': admin.firestore.FieldValue.increment(1),
                [`squad.bucketCounts.${lot.bucketId}`]: currentBucketCount + 1,
            });
            // Update player as acquired
            if (lot.playerId) {
                const playerRef = auth_1.db.collection('players').doc(lot.playerId);
                txn.update(playerRef, {
                    'registration.status': 'ACQUIRED',
                    auctionable: false,
                });
            }
        }
        // Write audit log
        const auditRef = auth_1.db.collection('auditLogs').doc();
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
//# sourceMappingURL=hammerLot.js.map
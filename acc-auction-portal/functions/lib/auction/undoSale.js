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
exports.undoSale = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const admin = __importStar(require("firebase-admin"));
const audit_1 = require("../utils/audit");
exports.undoSale = (0, https_1.onCall)({ maxInstances: 5 }, async (request) => {
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['SUPER_ADMIN']);
    const { acquisitionId, reason } = request.data;
    if (!acquisitionId)
        throw new https_1.HttpsError('invalid-argument', 'acquisitionId is required.');
    if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
        throw new https_1.HttpsError('invalid-argument', 'A reason is required for undo operations (min 3 characters).');
    }
    const result = await auth_1.db.runTransaction(async (txn) => {
        const acqRef = auth_1.db.collection('acquisitions').doc(acquisitionId);
        const acqSnap = await txn.get(acqRef);
        if (!acqSnap.exists)
            throw new https_1.HttpsError('not-found', 'Acquisition not found.');
        const acq = acqSnap.data();
        // Cannot undo already undone
        if (acq.status === 'UNDONE') {
            throw new https_1.HttpsError('failed-precondition', 'This acquisition has already been undone.');
        }
        // Mark acquisition as UNDONE (never delete)
        txn.update(acqRef, {
            status: 'UNDONE',
            undoneAt: admin.firestore.FieldValue.serverTimestamp(),
            undoReason: reason.trim(),
        });
        // Refund franchise purse and decrement squad
        const franchiseRef = auth_1.db.collection('franchises').doc(acq.franchiseId);
        const franchiseSnap = await txn.get(franchiseRef);
        if (!franchiseSnap.exists)
            throw new https_1.HttpsError('internal', 'Franchise not found during undo.');
        const franchise = franchiseSnap.data();
        // We need to get the lot to know the bucket
        const lotRef = auth_1.db.collection('lots').doc(acq.lotId);
        const lotSnap = await txn.get(lotRef);
        if (!lotSnap.exists)
            throw new https_1.HttpsError('failed-precondition', 'Auction lot is missing; sale cannot be safely undone.');
        const lot = lotSnap.data();
        if (lot.status !== 'SOLD')
            throw new https_1.HttpsError('failed-precondition', 'Auction lot is not in the SOLD state.');
        const bucketId = lot.bucketId;
        if (!bucketId)
            throw new https_1.HttpsError('failed-precondition', 'Auction lot has no bucket; sale cannot be safely undone.');
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
            const playerRef = auth_1.db.collection('players').doc(acq.playerId);
            txn.update(playerRef, {
                auctionable: true,
            });
        }
        // Audit log
        (0, audit_1.writeAuditEvent)({ actor: caller, action: 'AUCTION_UNDO', targetType: 'ACQUISITION', targetId: acquisitionId,
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
//# sourceMappingURL=undoSale.js.map
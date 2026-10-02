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
exports.openLot = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const admin = __importStar(require("firebase-admin"));
const audit_1 = require("../utils/audit");
exports.openLot = (0, https_1.onCall)({ maxInstances: 5 }, async (request) => {
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
    const { lotId } = request.data;
    if (!lotId)
        throw new https_1.HttpsError('invalid-argument', 'lotId is required.');
    const result = await auth_1.db.runTransaction(async (txn) => {
        const lotRef = auth_1.db.collection('lots').doc(lotId);
        const lotSnap = await txn.get(lotRef);
        if (!lotSnap.exists)
            throw new https_1.HttpsError('not-found', 'Lot not found.');
        const lot = lotSnap.data();
        if (lot.status !== 'CALLED' && lot.status !== 'AVAILABLE') {
            throw new https_1.HttpsError('failed-precondition', `Cannot open lot. Current status: ${lot.status}`);
        }
        // Set initial timer to 30 seconds
        const timerDeadline = admin.firestore.Timestamp.fromMillis(Date.now() + 30000);
        txn.update(lotRef, {
            status: 'LIVE',
            currentPrice: lot.basePrice,
            highestBidderFranchiseId: null,
            timerDeadline,
            timerDurationMs: 30000,
            version: admin.firestore.FieldValue.increment(1),
        });
        // Update auction state to point to this lot
        const auctionRef = auth_1.db.collection('editions').doc(lot.editionId).collection('auction').doc('state');
        txn.set(auctionRef, {
            currentLotId: lotId,
            status: 'LIVE',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // Reset all franchise statuses to IN_PLAY for new lot
        const franchisesSnap = await txn.get(auth_1.db.collection('franchises').where('editionId', '==', lot.editionId).where('status', '==', 'ACTIVE'));
        const franchiseStatuses = {};
        franchisesSnap.docs.forEach(doc => {
            franchiseStatuses[doc.id] = 'IN_PLAY';
        });
        txn.set(auctionRef, { franchiseStatuses }, { merge: true });
        // Audit
        (0, audit_1.writeAuditEvent)({ actor: caller, action: 'OPEN_LOT', targetType: 'LOT', targetId: lotId, editionId: lot.editionId,
            before: { status: lot.status }, after: { status: 'LIVE', basePrice: lot.basePrice }, transaction: txn });
        return { success: true, lotId, basePrice: lot.basePrice };
    });
    return result;
});
//# sourceMappingURL=openLot.js.map
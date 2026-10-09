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
exports.skipLot = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const admin = __importStar(require("firebase-admin"));
const audit_1 = require("../utils/audit");
exports.skipLot = (0, https_1.onCall)({ maxInstances: 5 }, async (request) => {
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
        const eligibleStatuses = new Set(['LIVE', 'CALLED', 'READY', 'PENDING', 'BIDDING', 'TIME_EXPIRED']);
        if (!eligibleStatuses.has(lot.status)) {
            throw new https_1.HttpsError('failed-precondition', `Cannot skip. Lot status: ${lot.status}`);
        }
        txn.update(lotRef, {
            status: 'SKIPPED',
            timerRunning: false,
            timerDeadline: null,
            pausedRemainingMs: null,
            version: admin.firestore.FieldValue.increment(1),
        });
        const auctionStateRef = auth_1.db.collection('editions').doc(lot.editionId).collection('auction').doc('state');
        txn.set(auctionStateRef, {
            status: 'SKIPPED',
            lastCompletedLotId: lotId,
            timerRunning: false,
            timerDeadline: null,
            pausedRemainingMs: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        (0, audit_1.writeAuditEvent)({ actor: caller, action: 'SKIP', targetType: 'LOT', targetId: lotId, editionId: lot.editionId,
            before: { status: lot.status }, after: { status: 'SKIPPED' }, transaction: txn });
        return { success: true, lotId };
    });
    return result;
});
//# sourceMappingURL=skipLot.js.map
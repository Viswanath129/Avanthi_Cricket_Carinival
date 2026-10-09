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
exports.pauseResumeAuction = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const admin = __importStar(require("firebase-admin"));
const audit_1 = require("../utils/audit");
exports.pauseResumeAuction = (0, https_1.onCall)({ maxInstances: 5 }, async (request) => {
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
    const { editionId, action: requestedAction } = request.data || {};
    if (!editionId)
        throw new https_1.HttpsError('invalid-argument', 'editionId is required.');
    const result = await auth_1.db.runTransaction(async (txn) => {
        const auctionRef = auth_1.db.collection('editions').doc(editionId).collection('auction').doc('state');
        const auctionSnap = await txn.get(auctionRef);
        const auctionState = auctionSnap.exists ? auctionSnap.data() : {};
        // Auto-toggle if action is not provided
        const currentStatus = auctionState.status || 'LIVE';
        const controlAction = requestedAction || (currentStatus === 'PAUSED' ? 'RESUME' : 'PAUSE');
        if (!['PAUSE', 'RESUME'].includes(controlAction)) {
            throw new https_1.HttpsError('invalid-argument', 'action must be PAUSE or RESUME.');
        }
        let currentLot = null;
        let lotRef = null;
        if (auctionState.currentLotId) {
            lotRef = auth_1.db.collection('lots').doc(auctionState.currentLotId);
            const lotSnap = await txn.get(lotRef);
            if (lotSnap.exists) {
                currentLot = lotSnap.data();
            }
        }
        if (controlAction === 'PAUSE') {
            let remainingMs = 30000;
            if (currentLot && currentLot.timerDeadline) {
                const deadlineMs = currentLot.timerDeadline.toMillis
                    ? currentLot.timerDeadline.toMillis()
                    : Number(currentLot.timerDeadline);
                remainingMs = Math.max(0, deadlineMs - Date.now());
            }
            else if (typeof auctionState.pausedRemainingMs === 'number') {
                remainingMs = auctionState.pausedRemainingMs;
            }
            txn.set(auctionRef, {
                status: 'PAUSED',
                pausedRemainingMs: remainingMs,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
            if (lotRef && currentLot) {
                txn.update(lotRef, {
                    timerRunning: false,
                    pausedRemainingMs: remainingMs,
                    version: admin.firestore.FieldValue.increment(1),
                });
            }
            (0, audit_1.writeAuditEvent)({
                actor: caller,
                action: 'PAUSE',
                targetType: 'AUCTION',
                targetId: editionId,
                editionId,
                after: { status: 'PAUSED', pausedRemainingMs: remainingMs },
                transaction: txn,
            });
            return { success: true, status: 'PAUSED', remainingMs };
        }
        else {
            // RESUME: continue exactly from preserved remaining time
            let remainingMs = 30000;
            if (currentLot && typeof currentLot.pausedRemainingMs === 'number') {
                remainingMs = currentLot.pausedRemainingMs;
            }
            else if (typeof auctionState.pausedRemainingMs === 'number') {
                remainingMs = auctionState.pausedRemainingMs;
            }
            // Ensure at least 1 second remaining if lot was not expired
            remainingMs = Math.max(1000, remainingMs);
            const newDeadline = admin.firestore.Timestamp.fromMillis(Date.now() + remainingMs);
            txn.set(auctionRef, {
                status: 'LIVE',
                pausedRemainingMs: null,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
            if (lotRef && currentLot) {
                txn.update(lotRef, {
                    timerDeadline: newDeadline,
                    timerRunning: true,
                    pausedRemainingMs: null,
                    version: admin.firestore.FieldValue.increment(1),
                });
            }
            (0, audit_1.writeAuditEvent)({
                actor: caller,
                action: 'RESUME',
                targetType: 'AUCTION',
                targetId: editionId,
                editionId,
                after: { status: 'LIVE', timerDeadline: newDeadline },
                transaction: txn,
            });
            return { success: true, status: 'LIVE', remainingMs };
        }
    });
    return result;
});
//# sourceMappingURL=pauseResume.js.map
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
        if (lot.status !== 'LIVE' && lot.status !== 'CALLED') {
            throw new https_1.HttpsError('failed-precondition', `Cannot skip. Lot status: ${lot.status}`);
        }
        txn.update(lotRef, {
            status: 'SKIPPED',
            version: admin.firestore.FieldValue.increment(1),
        });
        const auditRef = auth_1.db.collection('auditLogs').doc();
        txn.set(auditRef, {
            editionId: lot.editionId,
            actorUid: caller.uid,
            actorRole: caller.role,
            action: 'SKIP_LOT',
            entityType: 'LOT',
            entityId: lotId,
            beforeState: { status: lot.status },
            afterState: { status: 'SKIPPED' },
            reason: null,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, lotId };
    });
    return result;
});
//# sourceMappingURL=skipLot.js.map
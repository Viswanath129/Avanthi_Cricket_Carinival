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
exports.pauseResumeAuction = (0, https_1.onCall)({ maxInstances: 5 }, async (request) => {
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
    const { editionId, action: controlAction } = request.data;
    if (!editionId)
        throw new https_1.HttpsError('invalid-argument', 'editionId is required.');
    if (!controlAction || !['PAUSE', 'RESUME'].includes(controlAction)) {
        throw new https_1.HttpsError('invalid-argument', 'action must be PAUSE or RESUME.');
    }
    const auctionRef = auth_1.db.collection('editions').doc(editionId).collection('auction').doc('state');
    await auctionRef.set({
        status: controlAction === 'PAUSE' ? 'PAUSED' : 'LIVE',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    // Audit
    await auth_1.db.collection('auditLogs').add({
        editionId,
        actorUid: caller.uid,
        actorRole: caller.role,
        action: controlAction === 'PAUSE' ? 'PAUSE_AUCTION' : 'RESUME_AUCTION',
        entityType: 'AUCTION',
        entityId: editionId,
        beforeState: null,
        afterState: { status: controlAction === 'PAUSE' ? 'PAUSED' : 'LIVE' },
        reason: null,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, status: controlAction === 'PAUSE' ? 'PAUSED' : 'LIVE' };
});
//# sourceMappingURL=pauseResume.js.map
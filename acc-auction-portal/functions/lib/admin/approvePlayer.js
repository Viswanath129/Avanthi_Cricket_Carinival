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
exports.approvePlayer = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const admin = __importStar(require("firebase-admin"));
exports.approvePlayer = (0, https_1.onCall)(async (request) => {
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['SUPER_ADMIN']);
    const { playerId, action: approvalAction } = request.data;
    if (!playerId)
        throw new https_1.HttpsError('invalid-argument', 'playerId is required.');
    const playerRef = auth_1.db.collection('players').doc(playerId);
    const playerSnap = await playerRef.get();
    if (!playerSnap.exists)
        throw new https_1.HttpsError('not-found', 'Player not found.');
    const player = playerSnap.data();
    const newStatus = approvalAction === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    await playerRef.update({
        'registration.status': newStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await auth_1.db.collection('auditLogs').add({
        editionId: player.editionId,
        actorUid: caller.uid,
        actorRole: caller.role,
        action: `PLAYER_${approvalAction}`,
        entityType: 'PLAYER',
        entityId: playerId,
        beforeState: { status: player.registration?.status },
        afterState: { status: newStatus },
        reason: null,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, playerId, status: newStatus };
});
//# sourceMappingURL=approvePlayer.js.map
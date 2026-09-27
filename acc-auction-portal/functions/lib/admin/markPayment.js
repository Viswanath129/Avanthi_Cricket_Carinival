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
exports.markPayment = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const admin = __importStar(require("firebase-admin"));
exports.markPayment = (0, https_1.onCall)(async (request) => {
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['SUPER_ADMIN']);
    const { playerId, paid } = request.data;
    if (!playerId)
        throw new https_1.HttpsError('invalid-argument', 'playerId is required.');
    if (typeof paid !== 'boolean')
        throw new https_1.HttpsError('invalid-argument', 'paid must be boolean.');
    const playerRef = auth_1.db.collection('players').doc(playerId);
    const playerSnap = await playerRef.get();
    if (!playerSnap.exists)
        throw new https_1.HttpsError('not-found', 'Player not found.');
    const player = playerSnap.data();
    // A player becomes auctionable when: paid=true, status=APPROVED, cricheroes not pending creation
    const isAuctionable = paid &&
        player.registration?.status === 'APPROVED' &&
        player.cricheroes?.status !== 'PROFILE_CREATION_PENDING';
    await playerRef.update({
        'registration.paid': paid,
        auctionable: isAuctionable,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await auth_1.db.collection('auditLogs').add({
        editionId: player.editionId,
        actorUid: caller.uid,
        actorRole: caller.role,
        action: paid ? 'MARK_PAID' : 'MARK_UNPAID',
        entityType: 'PLAYER',
        entityId: playerId,
        beforeState: { paid: player.registration?.paid },
        afterState: { paid, auctionable: isAuctionable },
        reason: null,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, playerId, paid, auctionable: isAuctionable };
});
//# sourceMappingURL=markPayment.js.map
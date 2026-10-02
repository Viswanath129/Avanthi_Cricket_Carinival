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
exports.overrideBucket = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const admin = __importStar(require("firebase-admin"));
const audit_1 = require("../utils/audit");
exports.overrideBucket = (0, https_1.onCall)(async (request) => {
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['SUPER_ADMIN']);
    const { playerId, newBucket, newStudyYear, reason } = request.data;
    if (!playerId || !newBucket)
        throw new https_1.HttpsError('invalid-argument', 'playerId and newBucket are required.');
    if (!reason)
        throw new https_1.HttpsError('invalid-argument', 'Reason is required for manual overrides.');
    const playerRef = auth_1.db.collection('players').doc(playerId);
    const playerSnap = await playerRef.get();
    if (!playerSnap.exists)
        throw new https_1.HttpsError('not-found', 'Player not found.');
    const player = playerSnap.data();
    const beforeState = {
        bucket: player.academic?.bucket,
        studyYear: player.academic?.studyYear,
        manualOverride: player.academic?.manualOverride,
    };
    await playerRef.update({
        'academic.bucket': newBucket,
        'academic.studyYear': newStudyYear || player.academic?.studyYear,
        'academic.manualOverride': true,
        'academic.overrideReason': reason,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await (0, audit_1.writeAuditEvent)({ actor: caller, action: 'OVERRIDE_BUCKET', targetType: 'PLAYER', targetId: playerId,
        editionId: player.editionId, before: beforeState,
        after: { bucket: newBucket, studyYear: newStudyYear, manualOverride: true, overrideReason: reason }, reason });
    return { success: true, playerId, newBucket };
});
//# sourceMappingURL=overrideBucket.js.map
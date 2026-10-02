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
exports.managePlayerRecord = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const audit_1 = require("../utils/audit");
const playerGovernancePolicy_1 = require("./playerGovernancePolicy");
const admin = __importStar(require("firebase-admin"));
async function findProtectedHistory(txn, playerIds, rolls, _editionId) {
    const refs = [];
    for (const [collectionName, fields] of Object.entries(playerGovernancePolicy_1.HISTORY_REFERENCE_FIELDS)) {
        for (const field of fields) {
            const values = field.toLowerCase().includes('roll') ? rolls : field === 'targetId' ? [...playerIds, ...rolls] : playerIds;
            if (values.length)
                refs.push(auth_1.db.collection(collectionName).where(field, 'in', values.slice(0, 10)));
        }
    }
    const snapshots = await Promise.all(refs.map((ref) => txn.get(ref)));
    const directReferenceExists = snapshots.some((snapshot) => !snapshot.empty);
    // Franchise squads are legacy embedded arrays, so inspect the selected
    // edition's canonical franchise documents instead of relying on display names.
    let squadReferencesPlayer = false;
    const franchises = await txn.get(auth_1.db.collection('franchises'));
    for (const franchise of franchises.docs) {
        const squad = franchise.get('squad');
        if (Array.isArray(squad) && squad.some((entry) => playerIds.includes(String(entry?.playerId || entry?.id || '')) ||
            rolls.includes(String(entry?.rollNumberNormalized || entry?.roll || '').toUpperCase())))
            squadReferencesPlayer = true;
    }
    return (0, playerGovernancePolicy_1.hasProtectedPlayerHistory)([directReferenceExists], squadReferencesPlayer);
}
exports.managePlayerRecord = (0, https_1.onCall)({ maxInstances: 3 }, async (request) => {
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['SUPER_ADMIN']);
    const { playerId, action, reason, confirmation } = request.data;
    if (!playerId || typeof playerId !== 'string' || !['ARCHIVE', 'RESTORE', 'PERMANENT_DELETE'].includes(action || '')) {
        throw new https_1.HttpsError('invalid-argument', 'A player ID and supported action are required.');
    }
    const ref = auth_1.db.collection('players').doc(playerId);
    const result = await auth_1.db.runTransaction(async (txn) => {
        const snap = await txn.get(ref);
        if (!snap.exists)
            throw new https_1.HttpsError('not-found', 'Player record not found.');
        const player = snap.data();
        const roll = String(player.rollNumberNormalized || player.rollNumber || player.roll || '').toUpperCase();
        const ids = [...new Set([snap.id, String(player.playerId || snap.id)])];
        const rolls = roll ? [roll] : [];
        const protectedHistory = await findProtectedHistory(txn, ids, rolls, player.editionId);
        if (action === 'PERMANENT_DELETE') {
            if (protectedHistory) {
                (0, audit_1.writeAuditEvent)({ actor: caller, action: 'PLAYER_DELETE_REJECTED', targetType: 'PLAYER', targetId: snap.id,
                    result: 'REJECTED', editionId: player.editionId, metadata: { rollNumber: roll, reason: 'PROTECTED_AUCTION_HISTORY' }, transaction: txn });
                return { success: false, protectedHistory: true };
            }
            if (confirmation !== `DELETE ${roll || snap.id}`) {
                (0, audit_1.writeAuditEvent)({ actor: caller, action: 'PLAYER_DELETE_REJECTED', targetType: 'PLAYER', targetId: snap.id,
                    result: 'REJECTED', editionId: player.editionId, metadata: { rollNumber: roll, reason: 'CONFIRMATION_MISMATCH' }, transaction: txn });
                return { success: false, confirmationMismatch: true, confirmationTarget: roll || snap.id };
            }
            txn.delete(ref);
            (0, audit_1.writeAuditEvent)({ actor: caller, action: 'PLAYER_PERMANENTLY_DELETED', targetType: 'PLAYER', targetId: snap.id,
                editionId: player.editionId, metadata: { rollNumber: roll }, transaction: txn });
            return { success: true, alreadyApplied: false };
        }
        const publicRef = auth_1.db.collection('playersPublic').doc(snap.id);
        if (action === 'ARCHIVE') {
            if (player.status === 'ARCHIVED' || player.status === 'DELETED')
                return { success: true, alreadyApplied: true };
            const before = (0, playerGovernancePolicy_1.buildPlayerArchivePatch)(player).governancePreviousState;
            txn.update(ref, {
                ...(0, playerGovernancePolicy_1.buildPlayerArchivePatch)(player),
                archivedAt: admin.firestore.FieldValue.serverTimestamp(), archivedBy: caller.uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            if (player.editionId) {
                txn.set(publicRef, { status: 'ARCHIVED', auctionStatus: 'ARCHIVED', approvalStatus: 'ARCHIVED', auctionEligible: false, publicVisibility: false }, { merge: true });
            }
            (0, audit_1.writeAuditEvent)({ actor: caller, action: 'PLAYER_ARCHIVED', targetType: 'PLAYER', targetId: snap.id,
                editionId: player.editionId, before, after: { status: 'ARCHIVED' }, reason: reason || null, transaction: txn });
        }
        else {
            if (player.status !== 'ARCHIVED' && player.status !== 'DELETED')
                return { success: true, alreadyApplied: true };
            const before = { status: player.status, approvalStatus: player.approvalStatus || null };
            const restorePatch = (0, playerGovernancePolicy_1.buildPlayerRestorePatch)(player);
            txn.update(ref, {
                ...restorePatch,
                governancePreviousState: admin.firestore.FieldValue.delete(), archivedAt: admin.firestore.FieldValue.delete(),
                archivedBy: admin.firestore.FieldValue.delete(), updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            (0, audit_1.writeAuditEvent)({ actor: caller, action: 'PLAYER_RESTORED', targetType: 'PLAYER', targetId: snap.id,
                editionId: player.editionId, before, after: { status: restorePatch.status }, transaction: txn });
        }
        return { success: true, alreadyApplied: false };
    });
    if ('protectedHistory' in result) {
        throw new https_1.HttpsError('failed-precondition', 'Player has protected auction history and cannot be permanently deleted. Archive the player instead.');
    }
    if ('confirmationMismatch' in result) {
        throw new https_1.HttpsError('failed-precondition', `Type DELETE ${result.confirmationTarget} to confirm.`);
    }
    return result;
});
//# sourceMappingURL=managePlayerRecord.js.map
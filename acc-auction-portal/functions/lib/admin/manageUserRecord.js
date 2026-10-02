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
exports.manageUserRecord = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const admin = __importStar(require("firebase-admin"));
const audit_1 = require("../utils/audit");
/** Governance actions on the canonical user directory. Historical tournament
 * records are deliberately not touched by these operations. */
exports.manageUserRecord = (0, https_1.onCall)({ maxInstances: 3 }, async (request) => {
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['SUPER_ADMIN']);
    const { uid, action, confirmation } = request.data;
    if (!uid || typeof uid !== 'string' || !['DELETE', 'RESTORE', 'PERMANENT_DELETE'].includes(action || '')) {
        throw new https_1.HttpsError('invalid-argument', 'A user uid and supported action are required.');
    }
    if (uid === caller.uid)
        throw new https_1.HttpsError('failed-precondition', 'You cannot delete or restore your own account.');
    if (action === 'PERMANENT_DELETE' && confirmation !== `DELETE ${uid}`) {
        await (0, audit_1.writeAuditEvent)({ actor: caller, action: 'USER_DELETE_REJECTED', targetType: 'USER', targetId: uid,
            result: 'REJECTED', metadata: { reason: 'CONFIRMATION_MISMATCH' } });
        throw new https_1.HttpsError('failed-precondition', `Type DELETE ${uid} to permanently delete this account.`);
    }
    const userRef = auth_1.db.collection('users').doc(uid);
    const result = await auth_1.db.runTransaction(async (txn) => {
        const snap = await txn.get(userRef);
        if (!snap.exists)
            throw new https_1.HttpsError('not-found', 'User record not found.');
        const before = snap.data();
        if (before.role === 'SUPER_ADMIN')
            throw new https_1.HttpsError('failed-precondition', 'Super Admin accounts are protected.');
        if (action === 'DELETE') {
            if (before.status === 'DELETED') {
                return { success: true, alreadyApplied: true };
            }
            txn.update(userRef, {
                status: 'DELETED', accountStatus: 'DISABLED',
                deletedPreviousState: {
                    status: before.status || null,
                    accountStatus: before.accountStatus || null,
                    approvalStatus: before.approvalStatus || null,
                },
                deletedAt: admin.firestore.FieldValue.serverTimestamp(),
                deletedBy: caller.uid, updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        else if (action === 'RESTORE') {
            if (before.status !== 'DELETED') {
                return { success: true, alreadyApplied: true };
            }
            txn.update(userRef, {
                status: before.deletedPreviousState?.status || 'ACTIVE',
                accountStatus: before.deletedPreviousState?.accountStatus || 'ACTIVE',
                approvalStatus: before.deletedPreviousState?.approvalStatus || before.approvalStatus || null,
                deletedAt: null, deletedBy: null, deletedPreviousState: admin.firestore.FieldValue.delete(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        else {
            txn.delete(userRef);
        }
        (0, audit_1.writeAuditEvent)({ actor: caller,
            action: action === 'DELETE' ? 'USER_DISABLED' : action === 'RESTORE' ? 'USER_RESTORED' : 'USER_PERMANENTLY_DELETED',
            targetType: 'USER', targetId: uid, result: 'SUCCESS',
            metadata: { role: before.role || null, email: before.email || null }, transaction: txn });
        return { success: true, alreadyApplied: false };
    });
    // Disable/re-enable Firebase Auth where possible. The Firestore profile is
    // authoritative, so an Auth propagation failure cannot restore access.
    if (action === 'DELETE') {
        try {
            await admin.auth().updateUser(uid, { disabled: true });
        }
        catch (error) {
            if (error.code !== 'auth/user-not-found')
                throw error;
        }
    }
    else if (action === 'RESTORE') {
        try {
            await admin.auth().updateUser(uid, { disabled: false });
        }
        catch (error) {
            if (error.code !== 'auth/user-not-found')
                throw error;
        }
    }
    else {
        try {
            await admin.auth().deleteUser(uid);
        }
        catch (error) {
            if (error.code !== 'auth/user-not-found')
                throw error;
        }
    }
    return result;
});
//# sourceMappingURL=manageUserRecord.js.map
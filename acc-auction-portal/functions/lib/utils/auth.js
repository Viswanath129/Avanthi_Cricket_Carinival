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
exports.authAdmin = exports.db = void 0;
exports.verifyCaller = verifyCaller;
exports.resolveFranchiseId = resolveFranchiseId;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
if (!admin.apps.length) {
    admin.initializeApp();
}
exports.db = admin.firestore();
exports.authAdmin = admin.auth();
async function verifyCaller(uid, allowedRoles) {
    if (!uid)
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
    const userDoc = await exports.db.collection('users').doc(uid).get();
    if (!userDoc.exists)
        throw new https_1.HttpsError('not-found', 'User account not found.');
    const data = userDoc.data();
    const role = data.role;
    if (data.accountStatus === 'DISABLED' || data.accountStatus === 'BLOCKED' || data.status === 'DELETED') {
        throw new https_1.HttpsError('permission-denied', 'This account is disabled.');
    }
    if (!allowedRoles.includes(role)) {
        throw new https_1.HttpsError('permission-denied', `Role ${role} is not authorized for this operation.`);
    }
    return {
        uid,
        role,
        franchiseId: data.franchiseId || null,
    };
}
async function resolveFranchiseId(caller) {
    if (caller.role === 'FRANCHISE_COORDINATOR' || caller.role === 'FRANCHISE_TEAM_LEADER') {
        if (!caller.franchiseId) {
            // Look up from franchiseUsers
            const fuDoc = await exports.db.collection('franchiseUsers').doc(caller.uid).get();
            if (!fuDoc.exists)
                throw new https_1.HttpsError('not-found', 'Franchise user mapping not found.');
            return fuDoc.data().franchiseId;
        }
        return caller.franchiseId;
    }
    throw new https_1.HttpsError('permission-denied', 'Caller is not a franchise user.');
}
//# sourceMappingURL=auth.js.map
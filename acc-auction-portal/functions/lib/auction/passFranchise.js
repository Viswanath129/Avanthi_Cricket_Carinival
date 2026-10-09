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
exports.passFranchise = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const admin = __importStar(require("firebase-admin"));
exports.passFranchise = (0, https_1.onCall)({ maxInstances: 10 }, async (request) => {
    // Franchise can pass themselves, or admin can pass/unpass
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, [
        'SUPER_ADMIN', 'ADMIN', 'FRANCHISE_COORDINATOR', 'FRANCHISE_TEAM_LEADER',
    ]);
    let { lotId, editionId, franchiseId: targetFranchiseId, action: passAction, pass } = request.data || {};
    if (!lotId && editionId) {
        const aSnap = await auth_1.db.collection('editions').doc(editionId).collection('auction').doc('state').get();
        if (aSnap.exists) {
            lotId = aSnap.data()?.currentLotId;
        }
    }
    if (!lotId)
        throw new https_1.HttpsError('invalid-argument', 'lotId is required, or editionId with a live lot.');
    // Determine which franchise
    let franchiseId;
    if (caller.role === 'SUPER_ADMIN' || caller.role === 'ADMIN') {
        franchiseId = targetFranchiseId;
        if (!franchiseId)
            throw new https_1.HttpsError('invalid-argument', 'franchiseId is required for admin pass.');
    }
    else {
        franchiseId = await (0, auth_1.resolveFranchiseId)(caller);
    }
    const actionType = passAction || (pass === false ? 'UNPASS' : (pass === true ? 'PASS' : 'PASS'));
    const result = await auth_1.db.runTransaction(async (txn) => {
        const lotRef = auth_1.db.collection('lots').doc(lotId);
        const lotSnap = await txn.get(lotRef);
        if (!lotSnap.exists)
            throw new https_1.HttpsError('not-found', 'Lot not found.');
        const lot = lotSnap.data();
        if (lot.status !== 'LIVE') {
            throw new https_1.HttpsError('failed-precondition', 'Can only pass/unpass during a live lot.');
        }
        const auctionRef = auth_1.db.collection('editions').doc(lot.editionId).collection('auction').doc('state');
        if (actionType === 'PASS') {
            txn.set(auctionRef, {
                [`franchiseStatuses.${franchiseId}`]: 'PASSED',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        }
        else {
            // UNPASS - only allowed before hammer
            txn.set(auctionRef, {
                [`franchiseStatuses.${franchiseId}`]: 'IN_PLAY',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        }
        return { success: true, franchiseId, action: actionType };
    });
    return result;
});
//# sourceMappingURL=passFranchise.js.map
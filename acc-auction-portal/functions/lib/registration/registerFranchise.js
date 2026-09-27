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
exports.registerFranchise = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const admin = __importStar(require("firebase-admin"));
exports.registerFranchise = (0, https_1.onCall)(async (request) => {
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['FRANCHISE_COORDINATOR']);
    const data = request.data;
    if (!data.name || !data.editionId) {
        throw new https_1.HttpsError('invalid-argument', 'name and editionId are required.');
    }
    // Check for duplicate franchise name
    const existingName = await auth_1.db.collection('franchises')
        .where('name', '==', data.name.trim())
        .where('editionId', '==', data.editionId)
        .limit(1)
        .get();
    if (!existingName.empty) {
        throw new https_1.HttpsError('already-exists', 'A franchise with this name already exists.');
    }
    // Validate captain and VC are registered players
    if (data.captainPlayerId) {
        const captainSnap = await auth_1.db.collection('players').doc(data.captainPlayerId).get();
        if (!captainSnap.exists)
            throw new https_1.HttpsError('not-found', 'Captain player not found in registry.');
        // Check no other franchise has claimed this player as captain
        const captainClaim = await auth_1.db.collection('franchises')
            .where('captainPlayerId', '==', data.captainPlayerId)
            .where('editionId', '==', data.editionId)
            .limit(1)
            .get();
        if (!captainClaim.empty)
            throw new https_1.HttpsError('already-exists', 'This player is already claimed as captain by another franchise.');
    }
    if (data.viceCaptainPlayerId) {
        const vcSnap = await auth_1.db.collection('players').doc(data.viceCaptainPlayerId).get();
        if (!vcSnap.exists)
            throw new https_1.HttpsError('not-found', 'Vice-captain player not found in registry.');
        const vcClaim = await auth_1.db.collection('franchises')
            .where('viceCaptainPlayerId', '==', data.viceCaptainPlayerId)
            .where('editionId', '==', data.editionId)
            .limit(1)
            .get();
        if (!vcClaim.empty)
            throw new https_1.HttpsError('already-exists', 'This player is already claimed as vice-captain by another franchise.');
    }
    // Create franchise
    const franchiseRef = auth_1.db.collection('franchises').doc();
    await franchiseRef.set({
        editionId: data.editionId,
        name: data.name.trim(),
        shortName: data.shortName || data.name.trim().substring(0, 3).toUpperCase(),
        logoUrl: data.logoUrl || null,
        coordinator: {
            name: data.coordinatorName || '',
            department: data.coordinatorDepartment || '',
            photoUrl: data.coordinatorPhotoUrl || null,
            emailPrivate: data.coordinatorEmail || '',
            mobilePrivate: data.coordinatorMobile || '',
        },
        captainPlayerId: data.captainPlayerId || null,
        viceCaptainPlayerId: data.viceCaptainPlayerId || null,
        primaryAuthUid: caller.uid,
        secondaryAuthUid: null,
        purseInitial: 1000,
        purseRemaining: 1000,
        status: 'PENDING',
        squad: {
            count: 0,
            bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0, M6: 0 },
            auctionPurchases: 0,
            referredCount: 0,
        },
        referredPlayerIds: data.referredPlayerIds || [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Create franchise user mapping
    await auth_1.db.collection('franchiseUsers').doc(caller.uid).set({
        uid: caller.uid,
        franchiseId: franchiseRef.id,
        identityType: 'COORDINATOR',
        email: data.coordinatorEmail || '',
        mobile: data.coordinatorMobile || '',
        status: 'ACTIVE',
    });
    // Update user doc
    await auth_1.db.collection('users').doc(caller.uid).update({
        franchiseId: franchiseRef.id,
        identityType: 'COORDINATOR',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, franchiseId: franchiseRef.id };
});
//# sourceMappingURL=registerFranchise.js.map
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
exports.registerPlayer = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const admin = __importStar(require("firebase-admin"));
exports.registerPlayer = (0, https_1.onCall)(async (request) => {
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['PLAYER']);
    const data = request.data;
    if (!data.rollNumber || !data.name || !data.mobile || !data.editionId) {
        throw new https_1.HttpsError('invalid-argument', 'rollNumber, name, mobile, and editionId are required.');
    }
    // Check for duplicate roll number
    const existingRoll = await auth_1.db.collection('players')
        .where('rollNumber', '==', data.rollNumber.trim().toUpperCase())
        .where('editionId', '==', data.editionId)
        .limit(1)
        .get();
    if (!existingRoll.empty) {
        throw new https_1.HttpsError('already-exists', 'A player with this roll number already exists.');
    }
    // Check for duplicate mobile
    const existingMobile = await auth_1.db.collection('players')
        .where('mobilePrivate', '==', data.mobile.trim())
        .where('editionId', '==', data.editionId)
        .limit(1)
        .get();
    if (!existingMobile.empty) {
        throw new https_1.HttpsError('already-exists', 'A player with this mobile number already exists.');
    }
    // Create player document
    const playerRef = auth_1.db.collection('players').doc();
    const playerData = {
        editionId: data.editionId,
        uid: caller.uid,
        rollNumber: data.rollNumber.trim().toUpperCase(),
        name: data.name.trim(),
        emailPrivate: data.email || null,
        mobilePrivate: data.mobile.trim(),
        photoUrl: data.photoUrl || null,
        academic: data.academic || {},
        cricket: data.cricket || {},
        derived: data.derived || {},
        cricheroes: data.cricheroes || {
            profileUrl: null,
            registeredMobilePrivate: null,
            status: 'PROFILE_CREATION_PENDING',
        },
        reference: {
            eligible: data.referenceEligible || false,
            franchiseId: null,
            playerDeclaration: false,
            franchiseDeclaration: false,
            adminVerified: false,
        },
        stats: data.stats || {
            matches: 0, runs: 0, wickets: 0, strikeRate: 0,
            battingAverage: 0, bowlingAverage: 0, catches: 0, stumpings: 0,
        },
        registration: {
            status: 'SUBMITTED',
            paid: false,
            editingBlocked: false,
        },
        auctionable: false,
        basePrice: data.basePrice || 20,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await playerRef.set(playerData);
    // Create public projection
    await auth_1.db.collection('playersPublic').doc(playerRef.id).set({
        playerId: playerRef.id,
        editionId: data.editionId,
        name: data.name.trim(),
        photoUrl: data.photoUrl || null,
        academic: {
            program: data.academic?.program || '',
            branch: data.academic?.branch || '',
            studyYear: data.academic?.studyYear || 0,
            bucket: data.academic?.bucket || 'B1',
        },
        derived: data.derived || {},
        stats: data.stats || {},
        basePrice: data.basePrice || 20,
        auctionable: false,
        registration: { status: 'SUBMITTED', paid: false },
    });
    // Link user doc to player
    await auth_1.db.collection('users').doc(caller.uid).update({
        playerId: playerRef.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, playerId: playerRef.id };
});
//# sourceMappingURL=registerPlayer.js.map
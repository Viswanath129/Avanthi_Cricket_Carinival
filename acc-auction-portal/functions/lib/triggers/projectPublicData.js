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
exports.projectPublicFranchise = exports.projectPublicPlayer = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
// Initialize admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Strips PII from player record and writes to public projection
 */
exports.projectPublicPlayer = (0, firestore_1.onDocumentWritten)('players/{playerId}', async (event) => {
    const playerId = event.params.playerId;
    const snapshot = event.data?.after;
    if (!snapshot || !snapshot.exists) {
        // Player document was deleted
        await db.collection('playersPublic').doc(playerId).delete();
        return;
    }
    const raw = snapshot.data() || {};
    // Strip private contact info and identity keys
    const publicData = {
        id: playerId,
        name: raw.name || raw.personal?.name || 'Player',
        photoUrl: raw.photoUrl || raw.media?.photoUrl || null,
        photoThumbUrl: raw.photoThumbUrl || raw.media?.photoThumbUrl || null,
        bucket: raw.bucket || raw.classification?.bucket || 'B1',
        branch: raw.branch || raw.academic?.branch || 'GENERAL',
        year: raw.year || raw.academic?.year || 1,
        course: raw.course || raw.academic?.course || 'B.Tech',
        playerType: raw.playerType || raw.cricket?.playerType || 'ALL_ROUNDER',
        battingStyle: raw.battingStyle || raw.cricket?.battingStyle || null,
        bowlingStyle: raw.bowlingStyle || raw.cricket?.bowlingStyle || null,
        stats: raw.stats || raw.cricket?.stats || {},
        basePrice: raw.basePrice || 20,
        auctionStatus: raw.auctionStatus || raw.status || 'AVAILABLE',
        soldTo: raw.soldTo || raw.auction?.soldTo || null,
        soldPrice: raw.soldPrice || raw.auction?.soldPrice || null,
        editionId: raw.editionId || 'ACC_2026',
        approvalStatus: raw.approvalStatus || raw.registration?.status || 'PENDING_APPROVAL',
        auctionEligible: Boolean(raw.auctionEligible),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    // Explicit safety check: verify NO phone/mobile/email exists in publicData
    delete publicData.mobile;
    delete publicData.phone;
    delete publicData.phoneNumber;
    delete publicData.cricHeroesMobile;
    delete publicData.email;
    delete publicData.rollNumber;
    delete publicData.roll;
    await db.collection('playersPublic').doc(playerId).set(publicData, { merge: true });
});
/**
 * Strips PII from franchise record and writes to public projection
 */
exports.projectPublicFranchise = (0, firestore_1.onDocumentWritten)('franchises/{franchiseId}', async (event) => {
    const franchiseId = event.params.franchiseId;
    const snapshot = event.data?.after;
    if (!snapshot || !snapshot.exists) {
        // Franchise document was deleted
        await db.collection('franchisesPublic').doc(franchiseId).delete();
        return;
    }
    const raw = snapshot.data() || {};
    const publicData = {
        id: franchiseId,
        name: raw.name || 'Team',
        shortCode: raw.shortCode || raw.name?.slice(0, 3)?.toUpperCase() || 'ACC',
        logoUrl: raw.logoUrl || null,
        coordinatorName: raw.coordinatorName || raw.facultyCoordinator?.name || null,
        coordinatorDepartment: raw.coordinatorDepartment || raw.facultyCoordinator?.department || null,
        captainName: raw.captainName || raw.captain?.name || null,
        viceCaptainName: raw.viceCaptainName || raw.viceCaptain?.name || null,
        purseRemaining: typeof raw.purseRemaining === 'number' ? raw.purseRemaining : (raw.purse || 1000),
        maxPermissibleBid: typeof raw.maxPermissibleBid === 'number' ? raw.maxPermissibleBid : 720,
        slotsRemaining: typeof raw.slotsRemaining === 'number' ? raw.slotsRemaining : 15,
        squad: Array.isArray(raw.squad) ? raw.squad.map((p) => ({
            playerId: p.playerId || p.id,
            name: p.name,
            bucket: p.bucket,
            price: p.price,
        })) : [],
        bucketCounts: raw.bucketCounts || { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 },
        editionId: raw.editionId || 'ACC_2026',
        status: raw.status || 'ACTIVE',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    // Explicit safety check: verify NO coordinator or captain contact info
    delete publicData.coordinatorPhone;
    delete publicData.coordinatorMobile;
    delete publicData.captainPhone;
    delete publicData.captainMobile;
    delete publicData.pin;
    await db.collection('franchisesPublic').doc(franchiseId).set(publicData, { merge: true });
});
//# sourceMappingURL=projectPublicData.js.map
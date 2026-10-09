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
exports.generateDraw = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("../utils/auth");
const admin = __importStar(require("firebase-admin"));
const audit_1 = require("../utils/audit");
const AUCTION_ORDER = ['B3', 'B4', 'B2', 'D5', 'B1', 'M6'];
exports.generateDraw = (0, https_1.onCall)({ maxInstances: 2 }, async (request) => {
    const caller = await (0, auth_1.verifyCaller)(request.auth?.uid, ['SUPER_ADMIN']);
    const { editionId, round } = request.data;
    if (!editionId)
        throw new https_1.HttpsError('invalid-argument', 'editionId is required.');
    const roundNum = round || 1;
    let candidatePlayers = [];
    if (roundNum === 2) {
        // Round 2 re-auctions ONLY players confirmed UNSOLD in Round 1
        const unsoldSnap = await auth_1.db.collection('players')
            .where('editionId', '==', editionId)
            .where('status', '==', 'UNSOLD')
            .get();
        const seenPlayerIds = new Set();
        unsoldSnap.docs.forEach((doc) => {
            const data = doc.data();
            // Safety filter: Permanently exclude all players marked SOLD and require confirmed Round 1 unsold
            if (data.status !== 'SOLD' && data.auctionStatus !== 'SOLD' && (data.round1Unsold === true || data.status === 'UNSOLD') && !seenPlayerIds.has(doc.id)) {
                seenPlayerIds.add(doc.id);
                candidatePlayers.push({ id: doc.id, data });
            }
        });
        if (candidatePlayers.length === 0) {
            throw new https_1.HttpsError('failed-precondition', 'No eligible UNSOLD players found for Round 2 recall.');
        }
    }
    else {
        // Round 1: Initial auctionable players
        const playersSnap = await auth_1.db.collection('players')
            .where('editionId', '==', editionId)
            .where('auctionable', '==', true)
            .get();
        if (playersSnap.empty) {
            throw new https_1.HttpsError('failed-precondition', 'No auctionable players found for Round 1.');
        }
        const seenPlayerIds = new Set();
        playersSnap.docs.forEach((doc) => {
            const data = doc.data();
            if (data.status !== 'SOLD' && data.auctionStatus !== 'SOLD' && !seenPlayerIds.has(doc.id)) {
                seenPlayerIds.add(doc.id);
                candidatePlayers.push({ id: doc.id, data });
            }
        });
    }
    // Group by bucket
    const bucketGroups = {};
    candidatePlayers.forEach(player => {
        const bucket = player.data.academic?.bucket || player.data.bucket || 'M6';
        if (!bucketGroups[bucket])
            bucketGroups[bucket] = [];
        bucketGroups[bucket].push(player);
    });
    // Generate draw numbers and lots
    const batch = auth_1.db.batch();
    let globalSequence = 0;
    for (const bucketId of AUCTION_ORDER) {
        const players = bucketGroups[bucketId] || [];
        // Shuffle for random draw
        for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }
        players.forEach((player, index) => {
            globalSequence++;
            const lotRef = auth_1.db.collection('lots').doc();
            batch.set(lotRef, {
                editionId,
                playerId: player.id,
                playerName: player.data.name || 'Player',
                photoUrl: player.data.photoUrl || null,
                playerPhoto: player.data.photoUrl || null,
                rollNumber: player.data.rollNumber || null,
                branch: player.data.academic?.branch || null,
                year: player.data.academic?.studyYear || null,
                bucketId,
                bucket: bucketId,
                round: roundNum,
                sequence: globalSequence,
                drawNumber: index + 1,
                status: 'AVAILABLE',
                basePrice: roundNum === 2 ? 20 : (player.data.basePrice || 20),
                currentPrice: roundNum === 2 ? 20 : (player.data.basePrice || 20),
                highestBidderFranchiseId: null,
                highestBidderId: null,
                highestBidderName: null,
                timerDeadline: null,
                timerDurationMs: 0,
                timerRunning: false,
                pausedRemainingMs: null,
                version: 0,
            });
        });
    }
    await batch.commit();
    // Update edition auction state
    await auth_1.db.collection('editions').doc(editionId).collection('auction').doc('state').set({
        editionId,
        status: roundNum === 2 ? 'ROUND2' : 'NOT_STARTED',
        currentRound: roundNum,
        currentBucketIndex: 0,
        currentLotId: null,
        mode: 'GUEST',
        totalLotsProcessed: 0,
        franchiseStatuses: {},
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    // Audit
    await (0, audit_1.writeAuditEvent)({ actor: caller, action: 'GENERATE_DRAW', targetType: 'AUCTION', targetId: editionId,
        editionId, after: { totalLots: globalSequence, round: roundNum } });
    return { success: true, totalLots: globalSequence, round: roundNum };
});
//# sourceMappingURL=generateDraw.js.map
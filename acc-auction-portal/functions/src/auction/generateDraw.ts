import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';
import { writeAuditEvent } from '../utils/audit';

const AUCTION_ORDER = ['B3', 'B4', 'B2', 'D5', 'B1', 'M6'];

export const generateDraw = onCall({ maxInstances: 2 }, async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN']);
  
  const { editionId, round } = request.data;
  if (!editionId) throw new HttpsError('invalid-argument', 'editionId is required.');
  const roundNum = round || 1;
  
  let candidatePlayers: Array<{ id: string; data: any }> = [];

  if (roundNum === 2) {
    // Round 2 re-auctions ONLY players confirmed UNSOLD in Round 1
    const unsoldSnap = await db.collection('players')
      .where('editionId', '==', editionId)
      .where('status', '==', 'UNSOLD')
      .get();
    
    const seenPlayerIds = new Set<string>();
    unsoldSnap.docs.forEach((doc) => {
      const data = doc.data();
      // Safety filter: Permanently exclude all players marked SOLD or already acquired
      if (data.status !== 'SOLD' && data.auctionStatus !== 'SOLD' && !seenPlayerIds.has(doc.id)) {
        seenPlayerIds.add(doc.id);
        candidatePlayers.push({ id: doc.id, data });
      }
    });

    if (candidatePlayers.length === 0) {
      throw new HttpsError('failed-precondition', 'No eligible UNSOLD players found for Round 2 recall.');
    }
  } else {
    // Round 1: Initial auctionable players
    const playersSnap = await db.collection('players')
      .where('editionId', '==', editionId)
      .where('auctionable', '==', true)
      .get();
    
    if (playersSnap.empty) {
      throw new HttpsError('failed-precondition', 'No auctionable players found for Round 1.');
    }

    const seenPlayerIds = new Set<string>();
    playersSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.status !== 'SOLD' && data.auctionStatus !== 'SOLD' && !seenPlayerIds.has(doc.id)) {
        seenPlayerIds.add(doc.id);
        candidatePlayers.push({ id: doc.id, data });
      }
    });
  }
  
  // Group by bucket
  const bucketGroups: Record<string, Array<{id: string; data: any}>> = {};
  candidatePlayers.forEach(player => {
    const bucket = player.data.academic?.bucket || player.data.bucket || 'M6';
    if (!bucketGroups[bucket]) bucketGroups[bucket] = [];
    bucketGroups[bucket].push(player);
  });
  
  // Generate draw numbers and lots
  const batch = db.batch();
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
      const lotRef = db.collection('lots').doc();
      batch.set(lotRef, {
        editionId,
        playerId: player.id,
        bucketId,
        round: roundNum,
        sequence: globalSequence,
        drawNumber: index + 1,
        status: 'AVAILABLE',
        basePrice: roundNum === 2 ? 20 : (player.data.basePrice || 20),
        currentPrice: roundNum === 2 ? 20 : (player.data.basePrice || 20),
        highestBidderFranchiseId: null,
        timerDeadline: null,
        timerDurationMs: 0,
        version: 0,
      });
    });
  }
  
  await batch.commit();
  
  // Update edition auction state
  await db.collection('editions').doc(editionId).collection('auction').doc('state').set({
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
  await writeAuditEvent({ actor: caller, action: 'GENERATE_DRAW', targetType: 'AUCTION', targetId: editionId,
    editionId, after: { totalLots: globalSequence, round: roundNum } });
  
  return { success: true, totalLots: globalSequence, round: roundNum };
});

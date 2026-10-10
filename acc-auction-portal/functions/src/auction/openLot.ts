import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { writeAuditEvent } from '../utils/audit';

export const openLot = onCall({ maxInstances: 5 }, async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
  
  const { lotId } = request.data;
  if (!lotId) throw new HttpsError('invalid-argument', 'lotId is required.');
  
  const result = await db.runTransaction(async (txn) => {
    const lotRef = db.collection('lots').doc(lotId);
    const lotSnap = await txn.get(lotRef);
    if (!lotSnap.exists) throw new HttpsError('not-found', 'Lot not found.');
    const lot = lotSnap.data()!;
    
    const eligibleStatuses = new Set(['AVAILABLE', 'CALLED', 'READY', 'PENDING', 'LIVE', 'BIDDING', 'UNSOLD', 'ROUND_2', 'TIME_EXPIRED']);
    if (!eligibleStatuses.has(lot.status)) {
      throw new HttpsError('failed-precondition', `Cannot open lot. Current status: ${lot.status}`);
    }
    
    const auctionRef = db.collection('editions').doc(lot.editionId).collection('auction').doc('state');
    const auctionSnap = await txn.get(auctionRef);
    const activeAuction = auctionSnap.exists ? auctionSnap.data()! : null;
    if (activeAuction?.currentLotId && activeAuction.currentLotId !== lotId &&
      ['LIVE', 'BIDDING', 'PAUSED'].includes(activeAuction.status)) {
      throw new HttpsError('failed-precondition', 'Cannot open a new lot while another auction session is active. Finalize or pause the current lot first.');
    }

    // A new reveal creates a new server-owned session and a fresh 30 second deadline.
    const auctionSessionId = randomUUID();
    const timerDeadline = admin.firestore.Timestamp.fromMillis(Date.now() + 30000);

    // Enrich player metadata if not already present on lot
    let pName = lot.playerName;
    let pPhoto = lot.photoUrl || lot.playerPhoto;
    let pRoll = lot.rollNumber;
    let pBucket = lot.bucket || lot.bucketId;

    if ((!pName || !pPhoto || !pRoll) && lot.playerId) {
      try {
        const pSnap = await txn.get(db.collection('players').doc(lot.playerId));
        if (pSnap.exists) {
          const pData = pSnap.data()!;
          pName = pName || pData.name;
          pPhoto = pPhoto || pData.photoUrl;
          pRoll = pRoll || pData.rollNumber;
          pBucket = pBucket || pData.academic?.bucket || pData.bucket;
        }
      } catch (err) {
        console.warn('[OpenLot] Metadata enrichment fallback:', err);
      }
    }
    
    txn.update(lotRef, {
      status: 'LIVE',
      auctionStatus: 'BIDDING',
      currentPrice: lot.basePrice || 20,
      highestBidderFranchiseId: null,
      highestBidderId: null,
      highestBidderName: null,
      playerName: pName || 'Player',
      photoUrl: pPhoto || null,
      playerPhoto: pPhoto || null,
      rollNumber: pRoll || null,
      bucket: pBucket || null,
      timerDeadline,
      timerDurationMs: 30000,
      timerRunning: true,
      pausedRemainingMs: null,
      auctionSessionId,
      version: admin.firestore.FieldValue.increment(1),
    });
    
    // Update auction state to point to this lot with authoritative deadline
    txn.set(auctionRef, {
      currentLotId: lotId,
      auctionSessionId,
      status: 'LIVE',
      auctionStatus: 'BIDDING',
      timerDeadline,
      timerDurationMs: 30000,
      timerRunning: true,
      pausedRemainingMs: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    // Reset all franchise statuses to IN_PLAY for new lot
    const franchisesSnap = await txn.get(
      db.collection('franchises').where('editionId', '==', lot.editionId).where('status', '==', 'ACTIVE')
    );
    
    const franchiseStatuses: Record<string, string> = {};
    franchisesSnap.docs.forEach(doc => {
      franchiseStatuses[doc.id] = 'IN_PLAY';
    });
    
    txn.set(auctionRef, { franchiseStatuses }, { merge: true });
    
    // Audit
    writeAuditEvent({ actor: caller, action: 'OPEN_LOT', targetType: 'LOT', targetId: lotId, editionId: lot.editionId,
      before: { status: lot.status }, after: { status: 'LIVE', basePrice: lot.basePrice }, transaction: txn });
    
    return { success: true, lotId, auctionSessionId, basePrice: lot.basePrice };
  });
  
  return result;
});

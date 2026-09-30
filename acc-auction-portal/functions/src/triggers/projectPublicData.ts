import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Strips PII from player record and writes to public projection
 */
export const projectPublicPlayer = onDocumentWritten('players/{playerId}', async (event) => {
  const playerId = event.params.playerId;
  const snapshot = event.data?.after;

  if (!snapshot || !snapshot.exists) {
    // Player document was deleted
    await db.collection('playersPublic').doc(playerId).delete();
    return;
  }

  const raw = snapshot.data() || {};

  // Strip private contact info and identity keys
  const publicData: Record<string, any> = {
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
export const projectPublicFranchise = onDocumentWritten('franchises/{franchiseId}', async (event) => {
  const franchiseId = event.params.franchiseId;
  const snapshot = event.data?.after;

  if (!snapshot || !snapshot.exists) {
    // Franchise document was deleted
    await db.collection('franchisesPublic').doc(franchiseId).delete();
    return;
  }

  const raw = snapshot.data() || {};

  const publicData: Record<string, any> = {
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
    squad: Array.isArray(raw.squad) ? raw.squad.map((p: any) => ({
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

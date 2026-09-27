import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';

export const registerFranchise = onCall(async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['FRANCHISE_COORDINATOR']);
  
  const data = request.data;
  if (!data.name || !data.editionId) {
    throw new HttpsError('invalid-argument', 'name and editionId are required.');
  }
  
  // Check for duplicate franchise name
  const existingName = await db.collection('franchises')
    .where('name', '==', data.name.trim())
    .where('editionId', '==', data.editionId)
    .limit(1)
    .get();
  
  if (!existingName.empty) {
    throw new HttpsError('already-exists', 'A franchise with this name already exists.');
  }
  
  // Validate captain and VC are registered players
  if (data.captainPlayerId) {
    const captainSnap = await db.collection('players').doc(data.captainPlayerId).get();
    if (!captainSnap.exists) throw new HttpsError('not-found', 'Captain player not found in registry.');
    
    // Check no other franchise has claimed this player as captain
    const captainClaim = await db.collection('franchises')
      .where('captainPlayerId', '==', data.captainPlayerId)
      .where('editionId', '==', data.editionId)
      .limit(1)
      .get();
    if (!captainClaim.empty) throw new HttpsError('already-exists', 'This player is already claimed as captain by another franchise.');
  }
  
  if (data.viceCaptainPlayerId) {
    const vcSnap = await db.collection('players').doc(data.viceCaptainPlayerId).get();
    if (!vcSnap.exists) throw new HttpsError('not-found', 'Vice-captain player not found in registry.');
    
    const vcClaim = await db.collection('franchises')
      .where('viceCaptainPlayerId', '==', data.viceCaptainPlayerId)
      .where('editionId', '==', data.editionId)
      .limit(1)
      .get();
    if (!vcClaim.empty) throw new HttpsError('already-exists', 'This player is already claimed as vice-captain by another franchise.');
  }
  
  // Create franchise
  const franchiseRef = db.collection('franchises').doc();
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
  await db.collection('franchiseUsers').doc(caller.uid).set({
    uid: caller.uid,
    franchiseId: franchiseRef.id,
    identityType: 'COORDINATOR',
    email: data.coordinatorEmail || '',
    mobile: data.coordinatorMobile || '',
    status: 'ACTIVE',
  });
  
  // Update user doc
  await db.collection('users').doc(caller.uid).update({
    franchiseId: franchiseRef.id,
    identityType: 'COORDINATOR',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return { success: true, franchiseId: franchiseRef.id };
});

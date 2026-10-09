import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';

export const registerPlayer = onCall(async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['PLAYER']);
  
  const data = request.data;
  if (!data.rollNumber || !data.name || !data.mobile || !data.editionId) {
    throw new HttpsError('invalid-argument', 'rollNumber, name, mobile, and editionId are required.');
  }
  
  const normalizedRoll = data.rollNumber.trim().toUpperCase();
  const cleanMobile = data.mobile.trim().replace(/\D/g, '');

  // Check for duplicate roll number
  const existingRoll = await db.collection('players')
    .where('rollNumber', '==', normalizedRoll)
    .where('editionId', '==', data.editionId)
    .limit(1)
    .get();
  
  let playerRef: FirebaseFirestore.DocumentReference;
  let isExistingRecord = false;
  let previousData: any = null;

  if (!existingRoll.empty) {
    const existingDoc = existingRoll.docs[0];
    const existingData = existingDoc.data();
    const isOwner = existingData.uid === caller.uid || existingData.authUid === caller.uid;
    if (!isOwner) {
      throw new HttpsError('already-exists', 'A player with this roll number already exists and belongs to another account.');
    }
    playerRef = existingDoc.ref;
    isExistingRecord = true;
    previousData = existingData;
  } else {
    // Check if caller already has a player doc by uid
    const existingPlayerByUid = await db.collection('players')
      .where('uid', '==', caller.uid)
      .where('editionId', '==', data.editionId)
      .limit(1)
      .get();

    if (!existingPlayerByUid.empty) {
      playerRef = existingPlayerByUid.docs[0].ref;
      isExistingRecord = true;
      previousData = existingPlayerByUid.docs[0].data();
    } else {
      playerRef = db.collection('players').doc(normalizedRoll);
    }
  }
  
  // Check for duplicate mobile
  const existingMobile = await db.collection('players')
    .where('mobilePrivate', '==', cleanMobile)
    .where('editionId', '==', data.editionId)
    .limit(1)
    .get();
  
  if (!existingMobile.empty) {
    const match = existingMobile.docs[0];
    const isOwner = match.id === playerRef.id || match.data().uid === caller.uid;
    if (!isOwner) {
      throw new HttpsError('already-exists', 'A player with this mobile number already exists and belongs to another account.');
    }
  }
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
      status: previousData?.registration?.status || 'SUBMITTED',
      paid: previousData?.registration?.paid ?? false,
      editingBlocked: previousData?.registration?.editingBlocked ?? false,
    },
    accountStatus: previousData?.accountStatus || 'PENDING',
    approvalStatus: previousData?.approvalStatus || 'PENDING_APPROVAL',
    auctionable: previousData?.auctionable ?? false,
    basePrice: data.basePrice || previousData?.basePrice || 20,
    createdAt: previousData?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  await playerRef.set(playerData, { merge: true });
  
  // Create public projection
  await db.collection('playersPublic').doc(playerRef.id).set({
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
  await db.collection('users').doc(caller.uid).update({
    playerId: playerRef.id,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return { success: true, playerId: playerRef.id };
});

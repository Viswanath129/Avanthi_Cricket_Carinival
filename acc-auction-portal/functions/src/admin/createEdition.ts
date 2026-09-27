import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';

export const createEdition = onCall({ maxInstances: 2 }, async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN']);
  
  const { name, academicYear, currentAcademicStartYear } = request.data;
  if (!name || !academicYear) {
    throw new HttpsError('invalid-argument', 'name and academicYear are required.');
  }
  
  const editionRef = db.collection('editions').doc();
  await editionRef.set({
    name: name || 'ACC 2026',
    academicYear: academicYear || '2026-27',
    status: 'DRAFT',
    registrationStart: null,
    registrationEnd: null,
    auctionStart: null,
    currentAcademicStartYear: currentAcademicStartYear || 2026,
    bucketMinimums: { B1: 2, B2: 2, B3: 2, B4: 2, D5: 2, M6: 0 },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  // Create auction state sub-document
  await editionRef.collection('auction').doc('state').set({
    editionId: editionRef.id,
    status: 'NOT_STARTED',
    currentRound: 1,
    currentBucketIndex: 0,
    currentLotId: null,
    mode: 'GUEST',
    totalLotsProcessed: 0,
    franchiseStatuses: {},
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return { success: true, editionId: editionRef.id };
});

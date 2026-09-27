import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller, resolveFranchiseId } from '../utils/auth';
import * as admin from 'firebase-admin';

export const passFranchise = onCall({ maxInstances: 10 }, async (request) => {
  // Franchise can pass themselves, or admin can pass/unpass
  const caller = await verifyCaller(request.auth?.uid, [
    'SUPER_ADMIN', 'ADMIN', 'FRANCHISE_COORDINATOR', 'FRANCHISE_TEAM_LEADER',
  ]);
  
  const { lotId, franchiseId: targetFranchiseId, action: passAction } = request.data;
  if (!lotId) throw new HttpsError('invalid-argument', 'lotId is required.');
  
  // Determine which franchise
  let franchiseId: string;
  if (caller.role === 'SUPER_ADMIN' || caller.role === 'ADMIN') {
    franchiseId = targetFranchiseId;
    if (!franchiseId) throw new HttpsError('invalid-argument', 'franchiseId is required for admin pass.');
  } else {
    franchiseId = await resolveFranchiseId(caller);
  }
  
  const actionType = passAction || 'PASS'; // 'PASS' or 'UNPASS'
  
  const result = await db.runTransaction(async (txn) => {
    const lotRef = db.collection('lots').doc(lotId);
    const lotSnap = await txn.get(lotRef);
    if (!lotSnap.exists) throw new HttpsError('not-found', 'Lot not found.');
    const lot = lotSnap.data()!;
    
    if (lot.status !== 'LIVE') {
      throw new HttpsError('failed-precondition', 'Can only pass/unpass during a live lot.');
    }
    
    const auctionRef = db.collection('editions').doc(lot.editionId).collection('auction').doc('state');
    
    if (actionType === 'PASS') {
      txn.set(auctionRef, {
        [`franchiseStatuses.${franchiseId}`]: 'PASSED',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    } else {
      // UNPASS - only allowed before hammer
      txn.set(auctionRef, {
        [`franchiseStatuses.${franchiseId}`]: 'IN_PLAY',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }
    
    return { success: true, franchiseId, action: actionType };
  });
  
  return result;
});

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';

export const approveFranchise = onCall(async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN']);
  
  const { franchiseId } = request.data;
  if (!franchiseId) throw new HttpsError('invalid-argument', 'franchiseId is required.');
  
  const franchiseRef = db.collection('franchises').doc(franchiseId);
  const franchiseSnap = await franchiseRef.get();
  if (!franchiseSnap.exists) throw new HttpsError('not-found', 'Franchise not found.');
  
  const franchise = franchiseSnap.data()!;
  
  await franchiseRef.update({
    status: 'APPROVED',
    purseInitial: 1000,
    purseRemaining: 1000,
    squad: {
      count: 0,
      bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0, M6: 0 },
      auctionPurchases: 0,
      referredCount: 0,
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  await db.collection('auditLogs').add({
    editionId: franchise.editionId,
    actorUid: caller.uid,
    actorRole: caller.role,
    action: 'APPROVE_FRANCHISE',
    entityType: 'FRANCHISE',
    entityId: franchiseId,
    beforeState: { status: franchise.status },
    afterState: { status: 'APPROVED', purseInitial: 1000 },
    reason: null,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return { success: true, franchiseId };
});

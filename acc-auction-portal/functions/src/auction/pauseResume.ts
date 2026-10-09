import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';
import { writeAuditEvent } from '../utils/audit';

export const pauseResumeAuction = onCall({ maxInstances: 5 }, async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
  
  const { editionId, action: requestedAction } = request.data || {};
  if (!editionId) throw new HttpsError('invalid-argument', 'editionId is required.');
  
  const result = await db.runTransaction(async (txn) => {
    const auctionRef = db.collection('editions').doc(editionId).collection('auction').doc('state');
    const auctionSnap = await txn.get(auctionRef);
    const auctionState = auctionSnap.exists ? auctionSnap.data()! : {};
    
    // Auto-toggle if action is not provided
    const currentStatus = auctionState.status || 'LIVE';
    const controlAction = requestedAction || (currentStatus === 'PAUSED' ? 'RESUME' : 'PAUSE');
    
    if (!['PAUSE', 'RESUME'].includes(controlAction)) {
      throw new HttpsError('invalid-argument', 'action must be PAUSE or RESUME.');
    }
    
    let currentLot: FirebaseFirestore.DocumentData | null = null;
    let lotRef: FirebaseFirestore.DocumentReference | null = null;
    
    if (auctionState.currentLotId) {
      lotRef = db.collection('lots').doc(auctionState.currentLotId);
      const lotSnap = await txn.get(lotRef);
      if (lotSnap.exists) {
        currentLot = lotSnap.data()!;
      }
    }
    
    if (controlAction === 'PAUSE') {
      let remainingMs = 30000;
      if (currentLot && currentLot.timerDeadline) {
        const deadlineMs = currentLot.timerDeadline.toMillis 
          ? currentLot.timerDeadline.toMillis() 
          : Number(currentLot.timerDeadline);
        remainingMs = Math.max(0, deadlineMs - Date.now());
      } else if (typeof auctionState.pausedRemainingMs === 'number') {
        remainingMs = auctionState.pausedRemainingMs;
      }
      
      txn.set(auctionRef, {
        status: 'PAUSED',
        timerRunning: false,
        pausedRemainingMs: remainingMs,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      
      if (lotRef && currentLot) {
        txn.update(lotRef, {
          timerRunning: false,
          pausedRemainingMs: remainingMs,
          version: admin.firestore.FieldValue.increment(1),
        });
      }
      
      writeAuditEvent({
        actor: caller,
        action: 'PAUSE',
        targetType: 'AUCTION',
        targetId: editionId,
        editionId,
        after: { status: 'PAUSED', pausedRemainingMs: remainingMs },
        transaction: txn,
      });
      
      return { success: true, status: 'PAUSED', remainingMs };
    } else {
      // RESUME: continue exactly from preserved remaining time
      let remainingMs = 30000;
      if (currentLot && typeof currentLot.pausedRemainingMs === 'number') {
        remainingMs = currentLot.pausedRemainingMs;
      } else if (typeof auctionState.pausedRemainingMs === 'number') {
        remainingMs = auctionState.pausedRemainingMs;
      }
      
      // Ensure at least 1 second remaining if lot was not expired
      remainingMs = Math.max(1000, remainingMs);
      const newDeadline = admin.firestore.Timestamp.fromMillis(Date.now() + remainingMs);
      
      txn.set(auctionRef, {
        status: 'LIVE',
        auctionStatus: 'BIDDING',
        timerDeadline: newDeadline,
        timerDurationMs: remainingMs,
        timerRunning: true,
        pausedRemainingMs: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      
      if (lotRef && currentLot) {
        txn.update(lotRef, {
          timerDeadline: newDeadline,
          timerRunning: true,
          pausedRemainingMs: null,
          version: admin.firestore.FieldValue.increment(1),
        });
      }
      
      writeAuditEvent({
        actor: caller,
        action: 'RESUME',
        targetType: 'AUCTION',
        targetId: editionId,
        editionId,
        after: { status: 'LIVE', timerDeadline: newDeadline },
        transaction: txn,
      });
      
      return { success: true, status: 'LIVE', remainingMs };
    }
  });
  
  return result;
});

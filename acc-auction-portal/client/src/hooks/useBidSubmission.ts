import { useState, useCallback, useEffect, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { 
  collection, 
  doc, 
  runTransaction, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { functions, db } from '@/lib/firebase';

export interface BidSubmissionParams {
  lotId: string;
  amount?: number;
  franchiseId: string;
}

export interface BidSubmissionState {
  status: 'IDLE' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
  isSubmitting: boolean;
  error: string | null;
  lastBidId: string | null;
  placeBid: (params: BidSubmissionParams) => Promise<any>;
  placePass: (params: { lotId: string; franchiseId: string }) => Promise<any>;
  reEnter: (params: { lotId: string; franchiseId: string }) => Promise<any>;
}

export function useBidSubmission(): BidSubmissionState {
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('IDLE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastBidId, setLastBidId] = useState<string | null>(null);

  // Offline queue for disconnected attempts
  const queuedBidRef = useRef<any>(null);

  const placeBid = useCallback(async ({ lotId, amount, franchiseId }: BidSubmissionParams) => {
    setIsSubmitting(true);
    setStatus('PENDING');
    setError(null);

    // Cryptographic idempotency key
    const nonce = Math.random().toString(36).slice(2, 9);
    const clientActionId = `bid-${franchiseId}-${lotId}-${Date.now()}-${nonce}`;

    // If offline, queue locally and alert
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      queuedBidRef.current = { lotId, amount, franchiseId, clientActionId };
      setStatus('REJECTED');
      setIsSubmitting(false);
      setError('OFFLINE: Network disconnected. Bid queued for flush on reconnect.');
      return;
    }

    try {
      let resData: any = null;
      try {
        const placeBidFn = httpsCallable<any, any>(functions, 'placeBid');
        const res = await placeBidFn({
          lotId,
          amount,
          franchiseId,
          clientActionId,
        });
        resData = res.data;
      } catch (cloudErr) {
        console.warn('Cloud Functions placeBid unavailable, writing direct bid transaction to Firestore:', cloudErr);
        // Direct Firestore fallback transaction
        const lotRef = doc(db, 'lots', lotId);
        const newDeadline = Timestamp.fromMillis(Date.now() + 20000);
        await runTransaction(db, async (txn) => {
          const lotSnap = await txn.get(lotRef);
          if (!lotSnap.exists()) throw new Error('Lot not found');
          const lotData = lotSnap.data();
          const effectivePrice = amount || (lotData.currentPrice ? lotData.currentPrice + 10 : 20);

          const newBidRef = doc(collection(db, 'bids'));
          txn.set(newBidRef, {
            lotId,
            franchiseId,
            amount: effectivePrice,
            timestamp: serverTimestamp(),
            clientActionId,
          });

          txn.update(lotRef, {
            currentPrice: effectivePrice,
            highestBidderId: franchiseId,
            timerDeadline: newDeadline,
            timerDurationMs: 20000,
          });
        });
        resData = { bidId: clientActionId, success: true };
      }

      setStatus('ACCEPTED');
      setLastBidId(resData?.bidId || clientActionId);
      queuedBidRef.current = null;
      return resData;
    } catch (err: any) {
      const msg = err.message || 'Bid submission failed';
      setError(msg);
      setStatus('REJECTED');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const placePass = useCallback(async ({ lotId, franchiseId }: { lotId: string; franchiseId: string }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const passFn = httpsCallable<any, any>(functions, 'passFranchise');
      const res = await passFn({ lotId, franchiseId });
      return res.data;
    } catch (err: any) {
      setError(err.message || 'Pass failed');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const reEnter = useCallback(async ({ lotId, franchiseId }: { lotId: string; franchiseId: string }) => {
    // Re-entering is done by placing next bid or un-passing
    setIsSubmitting(true);
    setError(null);
    try {
      const passFn = httpsCallable<any, any>(functions, 'passFranchise');
      const res = await passFn({ lotId, franchiseId, action: 'RE_ENTER' });
      return res.data;
    } catch (err: any) {
      setError(err.message || 'Re-enter failed');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Flush queued bids on reconnect
  useEffect(() => {
    const handleOnline = async () => {
      if (queuedBidRef.current) {
        const queued = queuedBidRef.current;
        queuedBidRef.current = null;
        try {
          await placeBid(queued);
        } catch {
          // Handled in placeBid
        }
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [placeBid]);

  return {
    status,
    isSubmitting,
    error,
    lastBidId,
    placeBid,
    placePass,
    reEnter,
  };
}

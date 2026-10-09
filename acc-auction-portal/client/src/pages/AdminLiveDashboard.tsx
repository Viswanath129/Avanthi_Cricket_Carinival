import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  doc, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc, 
  setDoc,
  serverTimestamp, 
  Timestamp,
  runTransaction 
} from 'firebase/firestore';
import { ref as rtdbRef, onValue } from 'firebase/database';
import { httpsCallable } from 'firebase/functions';
import { useLocation } from 'wouter';
import { db, functions, rtdb } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { 
  calculateNextBid, 
  calculateBidIncrement, 
  calculateMaxBid, 
} from '@shared/engine/bidEngine';
import { 
  BucketId, 
  BUCKET_LABELS, 
  MANDATORY_BUCKETS, 
  AUCTION_ORDER 
} from '@shared/types';
import { checkScarcity } from '@shared/engine/scarcity';
import { checkBucketEligibility } from '@shared/engine/bucketEligibility';
import { mergeAuditTimeline, auditTimestampValue } from '@/services/auditTimeline';
import SoldConfirmationModal, { type SoldPlayerDetails } from '@/components/SoldConfirmationModal';
import { getNextEligibleUnsoldLot } from '@shared/engine/auctionOrder';

const EDITION_ID = 'acc-2026';

interface AdminLiveDashboardProps {
  mode?: 'SUPER_ADMIN' | 'OPERATOR';
}

export default function AdminLiveDashboard({ mode = 'SUPER_ADMIN' }: AdminLiveDashboardProps) {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const capabilities = useCapabilities(mode);

  // Firestore States
  const [auctionState, setAuctionState] = useState<any>(null);
  const [editionDoc, setEditionDoc] = useState<any>(null);
  const [currentLot, setCurrentLot] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [acquisitions, setAcquisitions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [allLots, setAllLots] = useState<any[]>([]);

  // RTDB Presence & Clock Offset
  const [serverOffset, setServerOffset] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // UI Interactive States
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [guestLotInput, setGuestLotInput] = useState<string>('');
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals
  const [hammerModalOpen, setHammerModalOpen] = useState(false);
  const [undoModalOpen, setUndoModalOpen] = useState(false);
  const [selectedUndoAcq, setSelectedUndoAcq] = useState<any>(null);
  const [undoReason, setUndoReason] = useState('');
  
  const [behalfModalOpen, setBehalfModalOpen] = useState(false);
  const [behalfFranchiseId, setBehalfFranchiseId] = useState<string>('');
  const [behalfAmount, setBehalfAmount] = useState<number>(20);

  const [directAssignModalOpen, setDirectAssignModalOpen] = useState(false);
  const [directAssignPlayerId, setDirectAssignPlayerId] = useState<string>('');
  const [directAssignFranchiseId, setDirectAssignFranchiseId] = useState<string>('');
  const [directAssignPrice, setDirectAssignPrice] = useState<number>(20);

  const [relaxModalOpen, setRelaxModalOpen] = useState(false);
  const [relaxBucket, setRelaxBucket] = useState<BucketId>('B1');
  const [relaxNewMin, setRelaxNewMin] = useState<number>(1);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Sold Confirmation Animation States
  const [soldModalOpen, setSoldModalOpen] = useState(false);
  const [soldModalData, setSoldModalData] = useState<SoldPlayerDetails | null>(null);
  const lastAnimatedSaleIdRef = useRef<string | null>(null);

  // Cloud Functions
  const openLotFn = httpsCallable(functions, 'openLot');
  const skipLotFn = httpsCallable(functions, 'skipLot');
  const hammerLotFn = httpsCallable(functions, 'hammerLot');
  const undoSaleFn = httpsCallable(functions, 'undoSale');
  const passFranchiseFn = httpsCallable(functions, 'passFranchise');
  const pauseResumeFn = httpsCallable(functions, 'pauseResumeAuction');
  const placeBidFn = httpsCallable(functions, 'placeBid');

  // Real-time Listeners
  useEffect(() => {
    // 1. RTDB connection & clock sync
    let unsubConn = () => {};
    let unsubOffset = () => {};
    try {
      const connectedRef = rtdbRef(rtdb, '.info/connected');
      const offsetRef = rtdbRef(rtdb, '.info/serverTimeOffset');
      unsubConn = onValue(connectedRef, (snap) => {
        setIsOnline(snap.val() === true);
      });
      unsubOffset = onValue(offsetRef, (snap) => {
        setServerOffset(snap.val() || 0);
      });
    } catch (err) {
      console.warn('RTDB presence sync fallback:', err);
    }

    // 2. Edition Document
    const editionUnsub = onSnapshot(doc(db, 'editions', EDITION_ID), (snap) => {
      if (snap.exists()) setEditionDoc(snap.data());
    });

    // 3. Auction State
    const stateUnsub = onSnapshot(doc(db, 'editions', EDITION_ID, 'auction', 'state'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAuctionState(data);

        // Authoritative sale broadcast check
        if (data.lastSale && data.lastSale.lotId) {
          const sale = data.lastSale;
          const saleAgeMs = Date.now() - (sale.timestamp || 0);
          if (lastAnimatedSaleIdRef.current !== sale.lotId && saleAgeMs < 15000) {
            lastAnimatedSaleIdRef.current = sale.lotId;
            setSoldModalData(sale);
            setSoldModalOpen(true);
          }
        }
      }
    });

    // 4. Franchises
    const franchQ = query(collection(db, 'franchises'), where('editionId', '==', EDITION_ID));
    const franchUnsub = onSnapshot(franchQ, (snap) => {
      setFranchises(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 5. Acquisitions (recent 50)
    const acqQ = query(
      collection(db, 'acquisitions'), 
      where('editionId', '==', EDITION_ID), 
      orderBy('createdAt', 'desc'), 
      limit(50)
    );
    const acqUnsub = onSnapshot(acqQ, (snap) => {
      setAcquisitions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 6. All Lots (for scarcity and draw queue)
    const allLotsQ = query(collection(db, 'lots'), where('editionId', '==', EDITION_ID));
    const allLotsUnsub = onSnapshot(allLotsQ, (snap) => {
      setAllLots(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Read both historical streams, display one chronological timeline.
    const auditRows = new Map<string, any>();
    const publishAudit = () => {
      setAuditLogs(mergeAuditTimeline(Array.from(auditRows.values())).slice(0, 50));
    };
    const auditUnsub = onSnapshot(query(collection(db, 'auditLogs'), where('editionId', '==', EDITION_ID), limit(100)), (snap) => {
      snap.docs.forEach(d => auditRows.set(`auditLogs:${d.id}`, { id: d.id, ...d.data() }));
      publishAudit();
    });
    const legacyAuditUnsub = onSnapshot(collection(db, 'auditLog'), (snap) => {
      snap.docs.forEach(d => auditRows.set(`auditLog:${d.id}`, { id: d.id, ...d.data(), legacy: true }));
      publishAudit();
    }, (error) => console.warn('Legacy audit timeline unavailable:', error));

    return () => {
      unsubConn();
      unsubOffset();
      editionUnsub();
      stateUnsub();
      franchUnsub();
      acqUnsub();
      allLotsUnsub();
      auditUnsub();
      legacyAuditUnsub();
    };
  }, []);

  // Listen to current lot and bids whenever currentLotId changes
  useEffect(() => {
    if (!auctionState?.currentLotId) {
      setCurrentLot(null);
      setBids([]);
      return;
    }

    const lotUnsub = onSnapshot(doc(db, 'lots', auctionState.currentLotId), (snap) => {
      if (snap.exists()) {
        setCurrentLot({ id: snap.id, ...snap.data() });
      } else {
        setCurrentLot(null);
      }
    });

    const bidsQ = query(
      collection(db, 'bids'),
      where('lotId', '==', auctionState.currentLotId),
      orderBy('timestamp', 'desc'),
      limit(25)
    );
    const bidsUnsub = onSnapshot(bidsQ, (snap) => {
      setBids(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      lotUnsub();
      bidsUnsub();
    };
  }, [auctionState?.currentLotId]);

  // Synchronized countdown timer
  useEffect(() => {
    if (currentLot?.timerRunning === false || !currentLot?.timerDeadline) {
      if (auctionState?.status === 'PAUSED' || currentLot?.timerRunning === false) {
        const pausedSec = typeof currentLot?.pausedRemainingMs === 'number'
          ? Math.max(0, Math.ceil(currentLot.pausedRemainingMs / 1000))
          : (typeof auctionState?.pausedRemainingMs === 'number'
            ? Math.max(0, Math.ceil(auctionState.pausedRemainingMs / 1000))
            : (typeof currentLot?.timerSeconds === 'number' ? currentLot.timerSeconds : 30));
        setTimeLeft(pausedSec);
      } else {
        setTimeLeft(0);
      }
      return;
    }

    if (auctionState?.status === 'PAUSED') {
      const pausedSec = typeof auctionState?.pausedRemainingMs === 'number'
        ? Math.max(0, Math.ceil(auctionState.pausedRemainingMs / 1000))
        : (typeof currentLot?.pausedRemainingMs === 'number'
          ? Math.max(0, Math.ceil(currentLot.pausedRemainingMs / 1000))
          : timeLeft);
      setTimeLeft(pausedSec);
      return;
    }

    const interval = setInterval(() => {
      const deadline = currentLot.timerDeadline.toMillis 
        ? currentLot.timerDeadline.toMillis() 
        : Number(currentLot.timerDeadline);

      const serverNow = Date.now() + serverOffset;
      const remaining = Math.max(0, Math.ceil((deadline - serverNow) / 1000));
      setTimeLeft(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [currentLot?.timerDeadline, currentLot?.timerRunning, currentLot?.pausedRemainingMs, currentLot?.timerSeconds, auctionState?.status, auctionState?.pausedRemainingMs, serverOffset]);

  // Current Bid & Next Bid calculation
  const highestBid = bids.length > 0 ? bids[0] : null;
  const currentBidPrice = highestBid?.amount || currentLot?.currentPrice || currentLot?.basePrice || 20;
  const nextMinBid = calculateNextBid(currentBidPrice);

  // Next eligible unsold lot calculation
  const nextEligibleLot = useMemo(() => {
    return getNextEligibleUnsoldLot(allLots, currentLot?.id);
  }, [allLots, currentLot?.id]);

  // Bucket Minimums
  const bucketMinimums: Record<BucketId, number> = useMemo(() => {
    return editionDoc?.bucketMinimums || {
      B1: 2,
      B2: 2,
      B3: 2,
      B4: 2,
      D5: 1,
      M6: 0,
    };
  }, [editionDoc?.bucketMinimums]);

  // Scarcity Engine Calculations
  const scarcityData = useMemo(() => {
    const buckets: BucketId[] = ['B3', 'B4', 'B2', 'D5', 'B1', 'M6'];
    const franchInput = franchises.map(f => ({
      franchiseId: f.id,
      bucketCounts: f.squad?.bucketCounts || { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0, M6: 0 },
    }));

    return buckets.map(b => {
      const unsold = allLots.filter(l => 
        (l.bucket === b || l.bucketId === b) && 
        (l.status === 'AVAILABLE' || l.status === 'CALLED' || l.status === 'UNSOLD' || l.status === 'ROUND_2')
      ).length;

      const res = checkScarcity({
        bucket: b,
        unsoldPlayersInBucket: unsold,
        franchises: franchInput,
        bucketMinimums,
      });

      return {
        bucket: b,
        label: BUCKET_LABELS[b],
        supply: res.supply,
        demand: res.demand,
        isScarcity: res.isScarcity,
      };
    });
  }, [allLots, franchises, bucketMinimums]);

  // Franchise Evaluation: Max Bid, Status (In-Play / Passed / Blocked)
  const evaluatedFranchises = useMemo(() => {
    const curBucket: BucketId = currentLot?.bucket || currentLot?.bucketId || 'B1';

    return franchises.map(f => {
      const purse = f.purseRemaining !== undefined ? f.purseRemaining : (f.purse ?? 2500);
      const squadCount = f.squad?.count ?? 0;
      const auctionPurchases = f.squad?.auctionPurchases ?? squadCount;
      const bucketCounts = f.squad?.bucketCounts || { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0, M6: 0 };

      // Calculate max bid
      const maxBidRes = calculateMaxBid({
        purseRemaining: purse,
        auctionPurchasesSoFar: auctionPurchases,
        bucketCounts,
        currentPlayerBucket: curBucket,
        minAuctionPurchases: 15,
        bucketMinimums,
      });

      // Check eligibility
      const eligRes = checkBucketEligibility({
        purseRemaining: purse,
        auctionPurchasesSoFar: auctionPurchases,
        bucketCounts,
        currentPlayerBucket: curBucket,
        currentPrice: nextMinBid,
        minAuctionPurchases: 15,
        bucketMinimums,
      });

      // Status classification
      const isExplicitPass = auctionState?.franchiseStatuses?.[f.id] === 'PASSED' || f.status === 'PASSED';
      let liveState: 'IN_PLAY' | 'PASSED' | 'BLOCKED' = 'IN_PLAY';
      let blockedReason: string | null = null;

      if (squadCount >= 15) {
        liveState = 'BLOCKED';
        blockedReason = 'SQUAD_CAP';
      } else if (isExplicitPass) {
        liveState = 'PASSED';
      } else if (!eligRes.eligible) {
        liveState = 'BLOCKED';
        blockedReason = maxBidRes.maxBid < nextMinBid ? 'NO_PURSE' : 'SLOT_PROTECTION';
      }

      // Mandatory remaining slots calculation
      let unmetSlots = 0;
      (Object.keys(bucketMinimums) as BucketId[]).forEach(b => {
        const min = bucketMinimums[b] || 0;
        const cnt = bucketCounts[b] || 0;
        unmetSlots += Math.max(0, min - cnt);
      });
      const slotsRemaining = Math.max(15 - squadCount, unmetSlots);

      return {
        ...f,
        purse,
        squadCount,
        auctionPurchases,
        bucketCounts,
        maxBid: maxBidRes.maxBid,
        liveState,
        blockedReason,
        slotsRemaining,
      };
    });
  }, [franchises, currentLot, nextMinBid, bucketMinimums, auctionState?.franchiseStatuses]);

  // Lists for Live Bid Panel
  const inPlayFranchises = evaluatedFranchises.filter(f => f.liveState === 'IN_PLAY');
  const passedFranchises = evaluatedFranchises.filter(f => f.liveState === 'PASSED');
  const blockedFranchises = evaluatedFranchises.filter(f => f.liveState === 'BLOCKED');

  // Audit Log helper
  const recordAudit = async (action: string, details: string) => {
    try {
      await httpsCallable(functions, 'recordAuditEvent')({
        editionId: EDITION_ID, targetType: 'AUCTION', targetId: EDITION_ID, action, details,
      });
    } catch (e) {
      console.warn('Audit record warning:', e);
    }
  };

  // ACTION HANDLERS
  const handleHammer = () => {
    if (!currentLot) return;
    setHammerModalOpen(true);
  };

  const confirmHammer = async () => {
    if (!currentLot) return;
    try {
      setIsActionLoading(true);
      setActionError(null);
      const isSold = !!highestBid;
      const winningFranchise = franchises.find(f => f.id === (highestBid?.franchiseId || currentLot?.highestBidderId));
      const soldDataToAnimate: SoldPlayerDetails = {
        lotId: currentLot.id,
        drawNumber: currentLot.drawNumber,
        lotNumber: currentLot.lotNumber,
        playerName: currentLot.playerName,
        rollNumber: currentLot.rollNumber,
        department: currentLot.department || currentLot.branch,
        branch: currentLot.branch,
        year: currentLot.year,
        bucket: currentLot.bucket || currentLot.bucketId,
        playerType: currentLot.playerType,
        photoUrl: currentLot.photoUrl,
        franchiseId: highestBid?.franchiseId || currentLot?.highestBidderId || '1',
        franchiseName: highestBid?.franchiseName || winningFranchise?.name || 'Franchise',
        soldPrice: currentBidPrice,
      };

      await hammerLotFn({ editionId: EDITION_ID, lotId: currentLot.id });
      await recordAudit(
        'HAMMER',
        `Committed lot #${currentLot.drawNumber} (${currentLot.playerName}) for ${currentBidPrice} Cr to ${highestBid?.franchiseName || 'UNSOLD'}`
      );
      setHammerModalOpen(false);

      if (isSold) {
        lastAnimatedSaleIdRef.current = currentLot.id;
        setSoldModalData(soldDataToAnimate);
        setSoldModalOpen(true);
      } else {
        // If unsold, advance to next unsold lot in auto mode or wait for operator
        if (auctionState?.drawMode === 'AUTO') {
          setTimeout(() => {
            handleAdvanceLotAuto();
          }, 800);
        }
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to hammer lot');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSoldAnimationComplete = () => {
    setSoldModalOpen(false);
    setSoldModalData(null);

    // Requirement 2: Finish sold animation then prepare next eligible unsold player according to official auction order
    if (auctionState?.drawMode === 'AUTO') {
      handleAdvanceLotAuto();
    }
  };

  const handleSkip = async () => {
    if (!currentLot) return;
    try {
      setIsActionLoading(true);
      setActionError(null);
      await skipLotFn({ editionId: EDITION_ID, lotId: currentLot.id });
      await recordAudit(
        'SKIP',
        `Skipped lot #${currentLot.drawNumber} (${currentLot.playerName}) to recall queue`
      );
    } catch (err: any) {
      setActionError(err.message || 'Failed to skip lot');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePauseResume = async () => {
    const isLive = auctionState?.status === 'LIVE';
    const nextStatus = isLive ? 'PAUSE' : 'RESUME';
    try {
      setIsActionLoading(true);
      setActionError(null);
      try {
        await pauseResumeFn({ editionId: EDITION_ID, action: nextStatus });
      } catch (cloudFnErr) {
        console.warn('pauseResumeFn unavailable, applying direct Firestore update:', cloudFnErr);
        if (nextStatus === 'PAUSE') {
          const deadline = currentLot?.timerDeadline?.toMillis ? currentLot.timerDeadline.toMillis() : Number(currentLot?.timerDeadline || 0);
          const remainingMs = deadline > 0 ? Math.max(0, deadline - (Date.now() + serverOffset)) : 30000;
          await updateDoc(doc(db, 'editions', EDITION_ID, 'auction', 'state'), {
            status: 'PAUSED',
            pausedRemainingMs: remainingMs,
            updatedAt: serverTimestamp(),
          });
          if (currentLot?.id) {
            await updateDoc(doc(db, 'lots', currentLot.id), {
              timerRunning: false,
              pausedRemainingMs: remainingMs,
            });
          }
        } else {
          const remainingMs = typeof currentLot?.pausedRemainingMs === 'number'
            ? currentLot.pausedRemainingMs
            : (typeof auctionState?.pausedRemainingMs === 'number' ? auctionState.pausedRemainingMs : 30000);
          const newDeadline = Timestamp.fromMillis(Date.now() + serverOffset + Math.max(1000, remainingMs));
          await updateDoc(doc(db, 'editions', EDITION_ID, 'auction', 'state'), {
            status: 'LIVE',
            pausedRemainingMs: null,
            updatedAt: serverTimestamp(),
          });
          if (currentLot?.id) {
            await updateDoc(doc(db, 'lots', currentLot.id), {
              timerDeadline: newDeadline,
              timerRunning: true,
              pausedRemainingMs: null,
            });
          }
        }
      }
      await recordAudit('PAUSE_RESUME', `${isLive ? 'Paused' : 'Resumed'} live auction`);
    } catch (err: any) {
      setActionError(err.message || 'Failed to toggle pause/resume');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleDrawMode = async () => {
    const currentMode = auctionState?.drawMode || 'GUEST';
    const nextMode = currentMode === 'GUEST' ? 'AUTO' : 'GUEST';
    try {
      setIsActionLoading(true);
      await updateDoc(doc(db, 'editions', EDITION_ID, 'auction', 'state'), {
        drawMode: nextMode,
        updatedAt: serverTimestamp(),
      });
      await recordAudit('SWITCH_DRAW_MODE', `Switched draw mode from ${currentMode} to ${nextMode}`);
    } catch (err: any) {
      setActionError(err.message || 'Failed to switch draw mode');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAdvanceLotGuest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!guestLotInput.trim()) return;

    const targetLotNum = parseInt(guestLotInput.trim(), 10);
    const target = allLots.find(l => 
      l.drawNumber === targetLotNum || 
      l.lotNumber?.toLowerCase() === guestLotInput.trim().toLowerCase()
    );

    if (!target) {
      setActionError(`Lot #${guestLotInput} not found in database.`);
      return;
    }

    try {
      setIsActionLoading(true);
      setActionError(null);
      try {
        await openLotFn({ editionId: EDITION_ID, lotId: target.id });
      } catch (cloudFnErr) {
        console.warn('openLotFn unavailable, applying direct Firestore update:', cloudFnErr);
        const deadline = Timestamp.fromMillis(Date.now() + 30000);
        await updateDoc(doc(db, 'lots', target.id), {
          status: 'LIVE',
          currentPrice: target.basePrice || 20,
          highestBidderId: null,
          highestBidderName: null,
          timerDeadline: deadline,
          timerDurationMs: 30000,
        });
        await setDoc(doc(db, 'editions', EDITION_ID, 'auction', 'state'), {
          currentLotId: target.id,
          status: 'LIVE',
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      await recordAudit('GUEST_DRAW', `Called lot #${target.drawNumber} (${target.playerName})`);
      setGuestLotInput('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to call lot');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAdvanceLotAuto = async (overrideLot?: any) => {
    // Find next eligible unsold lot according to official AUCTION_ORDER
    const nextLot = overrideLot || getNextEligibleUnsoldLot(allLots, currentLot?.id);
    if (!nextLot) {
      setActionError('Round 1 Complete! All available players in the current round have been processed. Unsold players are queued in Round 2 Recall.');
      return;
    }

    try {
      setIsActionLoading(true);
      setActionError(null);
      try {
        await openLotFn({ editionId: EDITION_ID, lotId: nextLot.id });
      } catch (cloudFnErr) {
        console.warn('openLotFn unavailable, applying direct Firestore update:', cloudFnErr);
        const deadline = Timestamp.fromMillis(Date.now() + 30000);
        await updateDoc(doc(db, 'lots', nextLot.id), {
          status: 'LIVE',
          currentPrice: nextLot.basePrice || 20,
          highestBidderId: null,
          highestBidderName: null,
          timerDeadline: deadline,
          timerDurationMs: 30000,
          timerRunning: true,
          pausedRemainingMs: null,
        });
        await setDoc(doc(db, 'editions', EDITION_ID, 'auction', 'state'), {
          currentLotId: nextLot.id,
          status: 'LIVE',
          pausedRemainingMs: null,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      await recordAudit('AUTO_DRAW', `System drew lot #${nextLot.drawNumber} (${nextLot.playerName})`);
    } catch (err: any) {
      setActionError(err.message || 'Failed to auto-draw next lot');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTogglePass = async (franchiseId: string, currentStatus: string) => {
    try {
      await passFranchiseFn({
        editionId: EDITION_ID,
        franchiseId,
        pass: currentStatus !== 'PASSED',
      });
      await recordAudit(
        'PASS_TOGGLE',
        `${currentStatus === 'PASSED' ? 'Unpassed' : 'Passed'} franchise ${franchiseId}`
      );
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleConfirmUndo = async () => {
    if (!selectedUndoAcq || !undoReason.trim()) return;
    try {
      setIsActionLoading(true);
      setActionError(null);
      await undoSaleFn({
        editionId: EDITION_ID,
        acquisitionId: selectedUndoAcq.id,
        reason: undoReason.trim(),
      });
      await recordAudit(
        'UNDO_SALE',
        `Reversed sale of ${selectedUndoAcq.playerName} (${selectedUndoAcq.price} Cr). Reason: ${undoReason.trim()}`
      );
      setUndoModalOpen(false);
      setSelectedUndoAcq(null);
      setUndoReason('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to undo sale');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmBehalfBid = async () => {
    if (!currentLot || !behalfFranchiseId || behalfAmount <= 0) return;
    try {
      setIsActionLoading(true);
      setActionError(null);
      await placeBidFn({
        lotId: currentLot.id,
        franchiseId: behalfFranchiseId,
        amount: behalfAmount,
        clientActionId: `behalf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      });
      await recordAudit(
        'BEHALF_BID',
        `Bid ${behalfAmount} Cr for franchise ${behalfFranchiseId} on behalf of operator`
      );
      setBehalfModalOpen(false);
    } catch (err: any) {
      setActionError(err.message || 'Failed to place behalf bid');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmDirectAssign = async () => {
    if (!directAssignPlayerId || !directAssignFranchiseId || directAssignPrice <= 0) return;
    try {
      setIsActionLoading(true);
      setActionError(null);

      const targetPlayer = allLots.find(l => l.playerId === directAssignPlayerId || l.id === directAssignPlayerId);
      const targetFranchise = franchises.find(f => f.id === directAssignFranchiseId);

      if (!targetPlayer || !targetFranchise) {
        setActionError('Invalid player or franchise selected.');
        return;
      }

      await runTransaction(db, async (txn) => {
        const franchRef = doc(db, 'franchises', targetFranchise.id);
        const franchSnap = await txn.get(franchRef);
        if (!franchSnap.exists()) throw new Error('Franchise not found');
        const fData = franchSnap.data();

        const curBucket = targetPlayer.bucket || targetPlayer.bucketId || 'B1';
        const curBucketCount = fData.squad?.bucketCounts?.[curBucket] || 0;

        // Deduct purse and increment squad
        txn.update(franchRef, {
          purseRemaining: (fData.purseRemaining ?? fData.purse ?? 2500) - directAssignPrice,
          'squad.count': (fData.squad?.count || 0) + 1,
          'squad.auctionPurchases': (fData.squad?.auctionPurchases || 0) + 1,
          [`squad.bucketCounts.${curBucket}`]: curBucketCount + 1,
        });

        // Update player/lot
        const lotRef = doc(db, 'lots', targetPlayer.id);
        txn.update(lotRef, {
          status: 'SOLD',
          highestBidderFranchiseId: targetFranchise.id,
          highestBidderName: targetFranchise.name,
          currentPrice: directAssignPrice,
        });

        // Create acquisition
        const acqRef = doc(collection(db, 'acquisitions'));
        txn.set(acqRef, {
          editionId: EDITION_ID,
          lotId: targetPlayer.id,
          playerId: targetPlayer.playerId || targetPlayer.id,
          playerName: targetPlayer.playerName,
          drawNumber: targetPlayer.drawNumber || 0,
          franchiseId: targetFranchise.id,
          franchiseName: targetFranchise.name,
          type: 'DIRECT_ASSIGN',
          price: directAssignPrice,
          status: 'ACTIVE',
          createdAt: serverTimestamp(),
        });
      });

      await recordAudit(
        'DIRECT_ASSIGN',
        `Directly assigned ${targetPlayer.playerName} to ${targetFranchise.name} for ${directAssignPrice} Cr`
      );

      setDirectAssignModalOpen(false);
      setDirectAssignPlayerId('');
      setDirectAssignFranchiseId('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to complete direct assignment');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmRelax = async () => {
    if (!capabilities.canRelaxBucketMinimum) return;
    try {
      setIsActionLoading(true);
      setActionError(null);
      await updateDoc(doc(db, 'editions', EDITION_ID), {
        [`bucketMinimums.${relaxBucket}`]: relaxNewMin,
        updatedAt: serverTimestamp(),
      });
      await recordAudit(
        'RELAX_BUCKET_MIN',
        `Uniformly relaxed ${relaxBucket} minimum from ${bucketMinimums[relaxBucket]} to ${relaxNewMin}`
      );
      setRelaxModalOpen(false);
    } catch (err: any) {
      setActionError(err.message || 'Failed to relax bucket minimum');
    } finally {
      setIsActionLoading(false);
    }
  };

  // EXPORT CSV HANDLER
  const handleExportCSV = useCallback(() => {
    try {
      // 1. Players CSV
      let playersCsv = 'DrawNumber,Name,RollNumber,Bucket,BasePrice,Status,Franchise,SoldPrice\n';
      allLots.forEach(l => {
        playersCsv += `"${l.drawNumber || ''}","${l.playerName || ''}","${l.rollNumber || ''}","${l.bucket || l.bucketId || ''}",${l.basePrice || 0},"${l.status || ''}","${l.highestBidderName || ''}",${l.currentPrice || 0}\n`;
      });

      // 2. Franchises CSV
      let franchCsv = 'Franchise,PurseRemaining,SquadCount,AuctionPurchases,B1,B2,B3,B4,D5,M6\n';
      evaluatedFranchises.forEach(f => {
        const b = f.bucketCounts || {};
        franchCsv += `"${f.name}",${f.purse},${f.squadCount},${f.auctionPurchases},${b.B1 || 0},${b.B2 || 0},${b.B3 || 0},${b.B4 || 0},${b.D5 || 0},${b.M6 || 0}\n`;
      });

      // 3. Acquisitions CSV
      let acqCsv = 'DrawNumber,PlayerName,Franchise,Price,Type,Status,CreatedAt\n';
      acquisitions.forEach(a => {
        acqCsv += `"${a.drawNumber || ''}","${a.playerName || ''}","${a.franchiseName || ''}",${a.price || 0},"${a.type || 'SOLD'}","${a.status || ''}","${a.createdAt?.toDate ? a.createdAt.toDate().toISOString() : ''}"\n`;
      });

      // Trigger download for players CSV
      const blob = new Blob([playersCsv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `acc-2026-players-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      recordAudit('EXPORT_CSV', 'Exported tournament database CSV bundle');
    } catch (err: any) {
      console.error('Export CSV error:', err);
    }
  }, [allLots, evaluatedFranchises, acquisitions]);

  // SNAPSHOT JSON HANDLER
  const handleSnapshotJSON = useCallback(() => {
    try {
      const snapshot = {
        editionId: EDITION_ID,
        timestamp: new Date().toISOString(),
        auctionState,
        bucketMinimums,
        currentLot,
        recentBids: bids,
        franchises: evaluatedFranchises,
        recentAcquisitions: acquisitions,
        scarcity: scarcityData,
        auditLogs,
      };

      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `acc-2026-snapshot-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      recordAudit('SNAPSHOT_JSON', 'Downloaded complete system state JSON snapshot');
    } catch (err: any) {
      console.error('Snapshot JSON error:', err);
    }
  }, [auctionState, bucketMinimums, currentLot, bids, evaluatedFranchises, acquisitions, scarcityData, auditLogs]);

  // KEYBOARD SHORTCUTS LISTENER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or modal is active
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';
      
      // Ctrl+E: Export CSV
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExportCSV();
        return;
      }
      // Ctrl+S: Snapshot JSON
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSnapshotJSON();
        return;
      }

      if (e.key === 'Escape') {
        if (helpModalOpen) {
          e.preventDefault();
          setHelpModalOpen(false);
          return;
        }
      }

      if (isInput) return;
      if (hammerModalOpen || undoModalOpen || behalfModalOpen || directAssignModalOpen || relaxModalOpen) return;

      switch (e.key.toLowerCase()) {
        case '?':
          e.preventDefault();
          setHelpModalOpen(prev => !prev);
          break;
        case 'h':
          e.preventDefault();
          if (capabilities.canHammer && currentLot) setHammerModalOpen(true);
          break;
        case 's':
          e.preventDefault();
          if (capabilities.canSkip && currentLot) handleSkip();
          break;
        case 'p':
          e.preventDefault();
          if (capabilities.canPauseResume) handlePauseResume();
          break;
        case 'u':
          e.preventDefault();
          if (capabilities.canUndoSale) setUndoModalOpen(true);
          break;
        case 'b':
          e.preventDefault();
          if (capabilities.canBidOnBehalf && currentLot) {
            setBehalfAmount(nextMinBid);
            setBehalfModalOpen(true);
          }
          break;
        case 'a':
          e.preventDefault();
          if (capabilities.canDirectAssign) setDirectAssignModalOpen(true);
          break;
        case 'd':
          e.preventDefault();
          if (capabilities.canSwitchDrawMode) handleToggleDrawMode();
          break;
        case 'r':
          e.preventDefault();
          if (capabilities.canRelaxBucketMinimum) setRelaxModalOpen(true);
          break;
        case ' ':
          e.preventDefault();
          if (auctionState?.drawMode === 'AUTO') handleAdvanceLotAuto();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    capabilities, 
    currentLot, 
    nextMinBid, 
    auctionState?.drawMode, 
    hammerModalOpen, 
    undoModalOpen, 
    behalfModalOpen, 
    directAssignModalOpen, 
    relaxModalOpen, 
    handleExportCSV, 
    handleSnapshotJSON
  ]);

  // Timer ring styling
  const getTimerStyles = () => {
    if (timeLeft > 10) return 'text-emerald-800 border-emerald-300 bg-emerald-50';
    if (timeLeft > 5) return 'text-amber-800 border-amber-300 bg-amber-50';
    return 'text-red-800 border-red-300 bg-red-50 animate-pulse';
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-slate-100 text-slate-900 font-sans select-none">
      
      {/* ========================================================= */}
      {/* 1. STATUS BAR (Fixed h-12, Zero Vertical Scroll)         */}
      {/* ========================================================= */}
      <header className="h-12 border-b border-slate-200 bg-white px-4 flex items-center justify-between shrink-0 text-xs">
        {/* Left: Branding & Role */}
        <div className="flex items-center gap-3">
          <span className="font-mono font-black text-base tracking-wider text-slate-900">ACC 2026</span>
          <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider text-[11px] border ${
            capabilities.isSuperAdmin 
              ? 'bg-amber-950/50 border-amber-700/60 text-amber-400' 
              : 'bg-blue-950/50 border-blue-700/60 text-blue-400'
          }`}>
            {capabilities.roleLabel}
          </span>
          <span className="text-slate-500 font-mono hidden md:inline">|</span>
          <span className="text-slate-600 font-mono hidden md:inline">Session 1 — Day 1</span>
        </div>

        {/* Center: Live Auction State, Draw Mode & Clock Sync */}
        <div className="flex items-center gap-4">
          {/* Auction Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono font-bold border text-[11px]">
            {auctionState?.status === 'LIVE' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 border-emerald-800/60 bg-emerald-950/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                AUCTION LIVE
              </span>
            ) : auctionState?.status === 'PAUSED' ? (
              <span className="flex items-center gap-1.5 text-amber-400 border-amber-800/60 bg-amber-950/40">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                PAUSED
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-600 border-slate-200 bg-white">
                <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                IDLE
              </span>
            )}
          </div>

          {/* Draw Mode Switcher */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white p-0.5">
            <button
              onClick={() => handleToggleDrawMode()}
              className={`px-2.5 py-0.5 rounded font-mono text-[11px] font-bold transition-colors ${
                auctionState?.drawMode === 'GUEST' ? 'bg-emerald-600 text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              GUEST
            </button>
            <button
              onClick={() => handleToggleDrawMode()}
              className={`px-2.5 py-0.5 rounded font-mono text-[11px] font-bold transition-colors ${
                auctionState?.drawMode === 'AUTO' ? 'bg-emerald-600 text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AUTO
            </button>
          </div>

          {/* Network Presence & Clock Sync Offset */}
          <div className="hidden lg:flex items-center gap-3 font-mono text-slate-600 text-[11px]">
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-500'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <span className="text-slate-500">·</span>
            <span>Synced ±{Math.abs(serverOffset)}ms</span>
          </div>
        </div>

        {/* Right: Operator Identity, Navigation & Sign Out */}
        <div className="flex items-center gap-3">
          <span className="text-slate-600 font-mono truncate max-w-[140px] hidden xl:inline">
            {user?.email || 'operator@acc.org'}
          </span>
          <button
            onClick={() => setLocation('/admin/management')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold font-mono tracking-wider transition-all shadow-sm"
            title="Open Full Tournament Management Console"
          >
            <span>⚙</span>
            <span>MANAGEMENT CONSOLE</span>
          </button>
          <a
            href="/live"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-mono transition-colors"
          >
            Public View ↗
          </a>
          <button
            onClick={() => signOut()}
            className="text-red-400 hover:text-red-300 font-mono text-[11px] font-semibold transition-colors"
          >
            EXIT
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. LOT STRIP (Current Lot Summary, Fixed h-20)            */}
      {/* ========================================================= */}
      <section className="h-20 border-b border-slate-200 bg-white/60 px-4 flex items-center justify-between gap-4 shrink-0">
        {currentLot ? (
          <>
            {/* Left: Photo, Draw Number, Name, Roll & Badges */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded border border-slate-300 bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 font-mono text-slate-500 text-[10px]">
                {currentLot.photoUrl ? (
                  <img src={currentLot.photoUrl} alt="Player" className="w-full h-full object-cover" />
                ) : (
                  <span>PHOTO</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-amber-400">
                    #{currentLot.lotNumber || `Lot-${currentLot.drawNumber || '01'}`}
                  </span>
                  <h2 className="font-bold text-base text-slate-900 tracking-tight truncate">
                    {currentLot.playerName}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 font-semibold">
                    {currentLot.bucket || currentLot.bucketId} · {BUCKET_LABELS[currentLot.bucket as BucketId] || 'Regular'}
                  </span>
                  {currentLot.playerType && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                      {currentLot.playerType}
                    </span>
                  )}
                  {currentLot.cricHeroesStatus === 'PENDING' && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-700/60 text-amber-400 font-bold">
                      CricHeroes: Pending
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600 mt-0.5">
                  <span>Roll: {currentLot.rollNumber}</span>
                  <span>·</span>
                  <span>Branch: {currentLot.branch || currentLot.academic?.branch || 'General'}</span>
                  <span>·</span>
                  <span>Year: {currentLot.year || currentLot.academic?.studyYear || 1}</span>
                  {currentLot.academic?.admissionYear === 2026 && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-400 font-semibold">Current-Year Admit (Referral Eligible)</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Cricket Career Highlights */}
            <div className="hidden xl:flex items-center gap-4 bg-white/60 border border-slate-200/80 px-4 py-1.5 rounded-lg font-mono text-xs">
              <div className="text-center">
                <span className="block text-[10px] text-slate-500 uppercase">Matches</span>
                <span className="font-bold text-slate-200 tabular-nums">{currentLot.stats?.matches || 0}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] text-slate-500 uppercase">Runs</span>
                <span className="font-bold text-slate-200 tabular-nums">{currentLot.stats?.runs || 0}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] text-slate-500 uppercase">Wkts</span>
                <span className="font-bold text-slate-200 tabular-nums">{currentLot.stats?.wickets || 0}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] text-slate-500 uppercase">SR</span>
                <span className="font-bold text-slate-200 tabular-nums">{currentLot.stats?.strikeRate || 0}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] text-slate-500 uppercase">Catches</span>
                <span className="font-bold text-slate-200 tabular-nums">{currentLot.stats?.catches || 0}</span>
              </div>
            </div>

            {/* Right: Base Price & Status Badge */}
            <div className="flex items-center gap-4 shrink-0 text-right">
              <div>
                <span className="block text-[10px] font-mono text-slate-500 uppercase">BASE PRICE</span>
                <span className="font-mono text-lg font-bold text-slate-200 tabular-nums">
                  {currentLot.basePrice || 20} Cr
                </span>
              </div>
              <div className="px-3 py-1.5 rounded bg-white border border-slate-200 font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
                {currentLot.status || 'AVAILABLE'}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-between text-slate-500 font-mono text-sm">
            <span>NO ACTIVE LOT ON FLOOR</span>
            <span className="text-xs">Draw next player using controls below or press Space (Auto) / Enter (Guest)</span>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* MAIN 3-COLUMN WORKSPACE (Laptop 1440x900 Zero-Scroll)     */}
      {/* ========================================================= */}
      <main className="flex-1 min-h-0 p-3 grid grid-cols-1 xl:grid-cols-12 gap-3 overflow-y-auto xl:overflow-hidden">
        
        {/* ======================================================= */}
        {/* COL 1 (Cols 1..4): 3. LIVE BID PANEL & 4. ACTION ROW    */}
        {/* ======================================================= */}
        <div className="col-span-1 xl:col-span-4 flex flex-col gap-3 min-h-0 overflow-hidden">
          
          {/* HERO BID CARD */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between shrink-0 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase font-semibold">CURRENT BID</span>
                <div className="text-5xl font-mono font-black text-amber-400 tracking-tight tabular-nums mt-0.5">
                  {currentBidPrice} <span className="text-xl font-bold text-amber-500/80">Cr</span>
                </div>
              </div>

              {/* Timer Pill */}
              <div className={`border rounded-xl px-4 py-2 text-center flex flex-col items-center justify-center font-mono min-w-28 shadow-sm ${getTimerStyles()}`}>
                <span className="text-[9px] uppercase tracking-wider block font-bold">TIMER</span>
                <span className="text-4xl font-black tabular-nums leading-none">{timeLeft.toFixed(1)}<small className="ml-1 text-sm">s</small></span>
              </div>
            </div>

            {/* Leading Franchise Display */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-mono text-slate-500 uppercase">LEADING FRANCHISE</span>
                <span className="font-bold text-base text-slate-900 truncate block">
                  {highestBid?.franchiseName || currentLot?.highestBidderName || 'NO BIDS YET'}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-mono text-slate-500 uppercase">NEXT VALID BID</span>
                <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                  {nextMinBid} Cr <span className="text-[10px] text-slate-500 font-normal">(+{calculateBidIncrement(currentBidPrice)})</span>
                </span>
              </div>
            </div>
          </div>

          {/* CHRONOLOGICAL BID FEED */}
          <div className="bg-white/70 border border-slate-200 rounded-lg p-2.5 flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80 shrink-0">
              <span className="font-mono text-xs font-bold text-slate-600 uppercase tracking-wider">BID ORDER HISTORY</span>
              <span className="font-mono text-[10px] text-slate-500">{bids.length} entries</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 pt-1.5 pr-1 font-mono text-xs">
              {bids.map((b, idx) => (
                <div 
                  key={b.id || idx} 
                  className={`flex justify-between items-center p-1.5 rounded border transition-colors ${
                    idx === 0 
                      ? 'bg-amber-950/20 border-amber-800/40 text-amber-300 font-semibold' 
                      : 'bg-white/40 border-slate-200/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] text-slate-500 w-4 tabular-nums">#{bids.length - idx}</span>
                    <span className="truncate">{b.franchiseName || b.franchiseId}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold tabular-nums">{b.amount} Cr</span>
                    <span className="text-[9px] text-slate-500">
                      {b.timestamp?.toDate ? b.timestamp.toDate().toLocaleTimeString().slice(0, 5) : ''}
                    </span>
                  </div>
                </div>
              ))}
              {bids.length === 0 && (
                <div className="py-6 text-center text-slate-600 font-mono text-xs">
                  Awaiting opening bids for current lot...
                </div>
              )}
            </div>
          </div>

          {/* 4. ACTION ROW (Fixed Bottom Section) */}
          <div className="bg-white border border-slate-200 rounded-lg p-2.5 shrink-0 flex flex-col gap-2">
            {/* Row 1: Core Auction Buttons (44px Accessible Touch Targets) */}
            <div className="grid grid-cols-4 gap-1.5 text-xs font-mono font-bold">
              <button
                onClick={handleHammer}
                disabled={!capabilities.canHammer || !currentLot || isActionLoading}
                className="min-h-[44px] py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-40 text-slate-900 rounded font-bold shadow-sm shadow-emerald-950/50 transition-all flex flex-col items-center justify-center cursor-pointer"
              >
                <span>HAMMER</span>
                <span className="text-[9px] opacity-80">[ H ]</span>
              </button>

              <button
                onClick={handleSkip}
                disabled={!capabilities.canSkip || !currentLot || isActionLoading}
                className="min-h-[44px] py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] disabled:opacity-40 text-slate-200 rounded transition-colors flex flex-col items-center justify-center border border-slate-300 cursor-pointer"
              >
                <span>SKIP</span>
                <span className="text-[9px] text-slate-600">[ S ]</span>
              </button>

              <button
                onClick={handlePauseResume}
                disabled={!capabilities.canPauseResume || isActionLoading}
                className="min-h-[44px] py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] disabled:opacity-40 text-slate-200 rounded transition-colors flex flex-col items-center justify-center border border-slate-300 cursor-pointer"
              >
                <span>{auctionState?.status === 'LIVE' ? 'PAUSE' : 'RESUME'}</span>
                <span className="text-[9px] text-slate-600">[ P ]</span>
              </button>

              <button
                onClick={() => setUndoModalOpen(true)}
                disabled={!capabilities.canUndoSale || isActionLoading}
                className="min-h-[44px] py-1.5 bg-red-950/40 hover:bg-red-900/60 active:scale-[0.98] disabled:opacity-40 text-red-300 rounded border border-red-800/60 transition-colors flex flex-col items-center justify-center cursor-pointer"
              >
                <span>UNDO</span>
                <span className="text-[9px] text-red-400/80">[ U ]</span>
              </button>
            </div>

            {/* Row 2: Secondary Controls (Behalf, Direct Assign, Relax Minimum) */}
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono font-semibold">
              <button
                onClick={() => {
                  setBehalfAmount(nextMinBid);
                  setBehalfModalOpen(true);
                }}
                disabled={!capabilities.canBidOnBehalf || !currentLot || isActionLoading}
                className="py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded border border-slate-300 transition-colors"
              >
                Behalf [ B ]
              </button>

              <button
                onClick={() => setDirectAssignModalOpen(true)}
                disabled={!capabilities.canDirectAssign || isActionLoading}
                className="py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded border border-slate-300 transition-colors"
              >
                Direct Assign [ A ]
              </button>

              {capabilities.canRelaxBucketMinimum ? (
                <button
                  onClick={() => setRelaxModalOpen(true)}
                  disabled={isActionLoading}
                  className="py-1.5 bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/60 text-purple-300 rounded transition-colors"
                >
                  Relax Min [ R ]
                </button>
              ) : (
                <button
                  onClick={handleExportCSV}
                  className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-300 transition-colors"
                >
                  Export CSV [ ^E ]
                </button>
              )}
            </div>

            {/* Next Up in Auction Order Preview Card */}
            <div className="p-2 rounded bg-slate-50 border border-slate-200 text-xs font-mono">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                <span>Next Up (Official Order)</span>
                {nextEligibleLot ? (
                  <span className="text-emerald-600 font-bold">Draw #{nextEligibleLot.drawNumber}</span>
                ) : (
                  <span className="text-amber-600 font-bold">Round 1 Complete</span>
                )}
              </div>
              {nextEligibleLot ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="font-bold text-slate-800">{nextEligibleLot.playerName}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5">
                      ({nextEligibleLot.bucket || nextEligibleLot.bucketId} · Base: {nextEligibleLot.basePrice || 20} Cr)
                    </span>
                  </div>
                  {(capabilities.isSuperAdmin || capabilities.isOperator) && (
                    <button
                      onClick={() => handleAdvanceLotAuto(nextEligibleLot)}
                      disabled={isActionLoading}
                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded shrink-0 shadow-xs"
                    >
                      Call Next
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic">
                  All eligible players in Round 1 processed. Unsold players queued for Round 2 recall.
                </div>
              )}
            </div>

            {/* Row 3: Lot Advance Input / Auto Advance Button */}
            <div className="pt-1 border-t border-slate-200/60 flex items-center gap-2">
              {auctionState?.drawMode === 'GUEST' ? (
                <form onSubmit={handleAdvanceLotGuest} className="flex-1 flex gap-1.5">
                  <input
                    type="text"
                    value={guestLotInput}
                    onChange={(e) => setGuestLotInput(e.target.value)}
                    placeholder="Guest Lot # (e.g. 14)"
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isActionLoading || !guestLotInput.trim()}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-900 rounded text-xs font-mono font-bold"
                  >
                    Call Lot
                  </button>
                </form>
              ) : (
                <button
                  onClick={handleAdvanceLotAuto}
                  disabled={isActionLoading}
                  className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-slate-900 rounded text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>START / OPEN LOT</span>
                  <span className="text-[10px] bg-emerald-900 px-1.5 py-0.2 rounded opacity-90">[ Space ]</span>
                </button>
              )}
            </div>

            {/* Error Banner */}
            {actionError && (
              <div className="p-1.5 rounded bg-red-950/80 border border-red-800 text-red-300 font-mono text-[10px] flex justify-between items-center">
                <span className="truncate">{actionError}</span>
                <button onClick={() => setActionError(null)} className="text-red-400 hover:text-slate-900 ml-2">&times;</button>
              </div>
            )}
          </div>

        </div>

        {/* ======================================================= */}
        {/* COL 2 (Cols 5..8): 6. SCARCITY, IN-PLAY LISTS, 7. AUDIT */}
        {/* ======================================================= */}
        <div className="col-span-1 xl:col-span-4 flex flex-col gap-3 min-h-0 overflow-hidden">
          
          {/* 6. SCARCITY OVERVIEW */}
          <div className="bg-white border border-slate-200 rounded-lg p-2.5 shrink-0">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="font-mono text-xs font-bold text-slate-600 uppercase tracking-wider">BUCKET SCARCITY OVERVIEW</span>
              <span className="font-mono text-[10px] text-slate-500">Supply / Demand</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-2">
              {scarcityData.map(s => (
                <div 
                  key={s.bucket} 
                  className={`p-1.5 rounded border font-mono text-[11px] flex flex-col justify-between ${
                    s.isScarcity 
                      ? 'bg-amber-950/30 border-amber-600/70 text-amber-300' 
                      : 'bg-white/50 border-slate-200/80 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{s.bucket}</span>
                    {s.isScarcity && <span className="text-[9px] text-amber-400 font-black animate-pulse">DEFICIT</span>}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1 flex justify-between">
                    <span>Avail: <strong className="text-slate-200">{s.supply}</strong></span>
                    <span>Need: <strong className="text-slate-200">{s.demand}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IN-PLAY / PASSED / BLOCKED QUICK CARDS */}
          <div className="bg-white/80 border border-slate-200 rounded-lg p-2.5 flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 shrink-0 font-mono text-xs">
              <span className="font-bold text-slate-600 uppercase tracking-wider">BIDDING SQUAD PARTICIPATION</span>
              <div className="flex gap-2 text-[10px]">
                <span className="text-emerald-400 font-bold">{inPlayFranchises.length} In-Play</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-600">{passedFranchises.length} Passed</span>
                <span className="text-slate-500">·</span>
                <span className="text-red-400 font-bold">{blockedFranchises.length} Blocked</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pt-2 pr-1 font-mono text-xs">
              {/* In Play Section */}
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block mb-1">
                  Active Bidders ({inPlayFranchises.length})
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {inPlayFranchises.map(f => (
                    <div key={f.id} className="p-1.5 rounded bg-white border border-emerald-900/40 flex justify-between items-center text-[11px]">
                      <span className="font-bold truncate text-slate-200">{f.name}</span>
                      <span className="text-emerald-400 font-semibold shrink-0">{f.purse} Cr</span>
                    </div>
                  ))}
                  {inPlayFranchises.length === 0 && (
                    <span className="text-slate-600 text-[10px] col-span-2">No active franchises in-play.</span>
                  )}
                </div>
              </div>

              {/* Blocked / Passed Section */}
              {(blockedFranchises.length > 0 || passedFranchises.length > 0) && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                    Restricted / Inactive
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {passedFranchises.map(f => (
                      <div key={f.id} className="p-1 rounded bg-white/60 border border-slate-200 flex justify-between items-center text-[10px] text-slate-600">
                        <span className="truncate">{f.name}</span>
                        <span className="text-slate-500 font-bold">PASSED</span>
                      </div>
                    ))}
                    {blockedFranchises.map(f => (
                      <div key={f.id} className="p-1 rounded bg-red-950/20 border border-red-900/40 flex justify-between items-center text-[10px]">
                        <span className="truncate text-slate-300">{f.name}</span>
                        <span className="text-red-400 font-bold uppercase">{f.blockedReason || 'BLOCKED'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 7. AUDIT STREAM */}
          <div className="bg-white/60 border border-slate-200 rounded-lg p-2.5 h-44 shrink-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 shrink-0 font-mono text-[11px]">
              <span className="font-bold text-slate-600 uppercase tracking-wider">IMMUTABLE AUDIT STREAM</span>
              <span className="text-[10px] text-slate-500">Real-time ledger</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pt-1.5 pr-1 font-mono text-[11px]">
              {auditLogs.map((log, idx) => (
                <div key={log.id || idx} className="p-1 rounded bg-white/60 border border-slate-200/70 text-slate-300">
                  <div className="flex justify-between items-center text-[9px] text-slate-500">
                    <span className="font-bold text-amber-500/90">{log.action}</span>
                    <span>
                      {log.timestamp ? new Date(auditTimestampValue(log.timestamp)).toLocaleTimeString() : 'now'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 truncate mt-0.5">
                    {log.details || log.metadata?.details || log.reason || `${log.targetType || log.entityType || ''} ${log.targetId || log.entityId || ''}`}
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="py-6 text-center text-slate-600 text-[10px]">
                  No audit events recorded yet this session.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ======================================================= */}
        {/* COL 3 (Cols 9..12): 5. 11 FRANCHISE LIVE TABLE          */}
        {/* ======================================================= */}
        <div className="col-span-1 xl:col-span-4 flex flex-col min-h-0 overflow-hidden bg-white border border-slate-200 rounded-lg p-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 shrink-0">
            <div>
              <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">FRANCHISE GRID (11 TEAMS)</span>
              <p className="text-[10px] font-mono text-slate-500">Live purse, max bid & bucket quotas</p>
            </div>
            <button
              onClick={handleSnapshotJSON}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[10px]"
            >
              Snapshot [ ^S ]
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pt-2 pr-1 font-mono text-xs">
            {evaluatedFranchises.map(f => {
              const isPassed = f.liveState === 'PASSED';
              const isBlocked = f.liveState === 'BLOCKED';

              return (
                <div 
                  key={f.id} 
                  className={`p-2 rounded border transition-colors ${
                    isBlocked 
                      ? 'bg-red-950/15 border-red-900/40 text-slate-600' 
                      : isPassed 
                        ? 'bg-white/40 border-slate-200/80 text-slate-600' 
                        : 'bg-white border-slate-200 text-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top line: Name & Pass Toggle */}
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900 truncate text-[11px]">{f.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        isBlocked ? 'bg-red-950 text-red-400 border border-red-800' :
                        isPassed ? 'bg-slate-800 text-slate-600' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {f.liveState}
                      </span>
                      <button
                        onClick={() => handleTogglePass(f.id, isPassed ? 'PASSED' : 'ACTIVE')}
                        className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                          isPassed 
                            ? 'border-emerald-800 text-emerald-400 hover:bg-emerald-950/40' 
                            : 'border-slate-300 text-slate-600 hover:bg-slate-800'
                        }`}
                      >
                        {isPassed ? 'UNPASS' : 'PASS'}
                      </button>
                    </div>
                  </div>

                  {/* Numbers Grid: Purse, Max Bid, Squad count */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] py-1 border-t border-slate-900 text-slate-600">
                    <div>
                      <span className="text-slate-500 uppercase block">Purse</span>
                      <span className="font-bold text-emerald-400 tabular-nums">{f.purse} Cr</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block">Max Bid</span>
                      <span className={`font-bold tabular-nums ${f.maxBid < nextMinBid ? 'text-red-400' : 'text-slate-200'}`}>
                        {f.maxBid} Cr
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block">Squad</span>
                      <span className="font-bold text-slate-200 tabular-nums">{f.squadCount}/15</span>
                    </div>
                  </div>

                  {/* Bucket breakdown pills */}
                  <div className="flex items-center gap-1 pt-1 text-[9px] text-slate-600 overflow-x-auto">
                    <span className="text-slate-500 shrink-0">Buckets:</span>
                    {(['B1', 'B2', 'B3', 'B4', 'D5', 'M6'] as BucketId[]).map(b => (
                      <span 
                        key={b} 
                        className={`px-1 py-0.2 rounded ${
                          (f.bucketCounts?.[b] || 0) >= (bucketMinimums[b] || 0)
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-amber-950/40 text-amber-400 font-bold'
                        }`}
                      >
                        {b}:{f.bucketCounts?.[b] || 0}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* ========================================================= */}
      {/* DESTRUCTIVE ACTION MODALS                                 */}
      {/* ========================================================= */}

      {/* 1. TWO-STEP HAMMER CONFIRMATION MODAL */}
      {hammerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-amber-500/60 rounded-xl p-5 w-full max-w-md shadow-2xl font-mono space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center text-xl font-bold">
                HAMMER
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">COMMIT LOT SALE (HAMMER)</h3>
                <p className="text-[11px] text-slate-600">Two-Step Authority Verification</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Player:</span>
                <span className="font-bold text-slate-900">{currentLot?.playerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Draw Number:</span>
                <span className="font-bold text-slate-300">#{currentLot?.drawNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Committed Price:</span>
                <span className="font-bold text-amber-400">{currentBidPrice} Credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Winning Franchise:</span>
                <span className="font-bold text-emerald-400">
                  {highestBid?.franchiseName || currentLot?.highestBidderName || 'NO BIDS (MARK UNSOLD)'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600">
              {highestBid
                ? 'Committing hammer will atomically deduct purse credits, add player to franchise squad roster, and log an immutable transaction.'
                : 'No bids placed. Committing hammer will record this player as UNSOLD.'}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setHammerModalOpen(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-800 text-slate-300 rounded font-bold text-xs"
              >
                CANCEL
              </button>
              <button
                onClick={confirmHammer}
                disabled={isActionLoading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-900 rounded font-bold text-xs shadow-md shadow-amber-600/30"
              >
                {isActionLoading ? 'COMMITTING...' : '[ CONFIRM HAMMER ]'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. UNDO SALE MODAL */}
      {undoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xl p-5 w-full max-w-2xl max-h-[85vh] flex flex-col font-mono">
            <h3 className="font-bold text-slate-900 text-base mb-1">UNDO PREVIOUS SALE</h3>
            <p className="text-xs text-slate-600 mb-3">
              Select an acquisition to atomically refund purse credits and return player to recall queue.
            </p>

            <div className="flex-1 overflow-y-auto border border-slate-200 rounded p-2 space-y-1.5 mb-3 text-xs">
              {acquisitions.map(acq => {
                const isSelected = selectedUndoAcq?.id === acq.id;
                const isUndone = acq.status === 'UNDONE';

                return (
                  <div
                    key={acq.id}
                    onClick={() => !isUndone && setSelectedUndoAcq(acq)}
                    className={`p-2 rounded border cursor-pointer flex justify-between items-center ${
                      isUndone ? 'bg-white border-slate-200 opacity-40 cursor-not-allowed' :
                      isSelected ? 'bg-slate-800 border-amber-500' :
                      'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-slate-500 mr-2">#{acq.drawNumber}</span>
                      <strong className="text-slate-900">{acq.playerName}</strong>
                      <span className="text-slate-600 ml-2">→ {acq.franchiseName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-bold">{acq.price} Cr</span>
                      {isUndone && <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">UNDONE</span>}
                    </div>
                  </div>
                );
              })}
              {acquisitions.length === 0 && (
                <div className="py-8 text-center text-slate-600">No completed sales recorded yet.</div>
              )}
            </div>

            {selectedUndoAcq && (
              <div className="mb-3 space-y-1">
                <label className="text-xs text-slate-600">Reason for rollback (Mandatory, min 3 chars):</label>
                <input
                  type="text"
                  value={undoReason}
                  onChange={(e) => setUndoReason(e.target.value)}
                  placeholder="e.g. Accidental double hammer, system lag"
                  className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  setUndoModalOpen(false);
                  setSelectedUndoAcq(null);
                  setUndoReason('');
                }}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-800 text-slate-300 rounded font-bold text-xs"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmUndo}
                disabled={!selectedUndoAcq || undoReason.trim().length < 3 || isActionLoading}
                className="px-4 py-2 bg-red-900/60 hover:bg-red-900 border border-red-700 text-red-200 rounded font-bold text-xs disabled:opacity-40"
              >
                {isActionLoading ? 'ROLLING BACK...' : 'CONFIRM ROLLBACK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. BID ON BEHALF MODAL */}
      {behalfModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xl p-5 w-full max-w-md font-mono space-y-4">
            <h3 className="font-bold text-slate-900 text-base">BID ON BEHALF OF FRANCHISE</h3>
            <p className="text-xs text-slate-600">
              Emergency floor intervention for terminal network/hardware outage.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Select Franchise:</label>
                <select
                  value={behalfFranchiseId}
                  onChange={(e) => setBehalfFranchiseId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Franchise --</option>
                  {franchises.map(f => (
                    <option key={f.id} value={f.id}>{f.name} (Purse: {f.purseRemaining || f.purse || 0} Cr)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Bid Amount (Credits):</label>
                <input
                  type="number"
                  value={behalfAmount}
                  onChange={(e) => setBehalfAmount(parseInt(e.target.value, 10) || 0)}
                  min={nextMinBid}
                  step={calculateBidIncrement(currentBidPrice)}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Minimum next valid bid: {nextMinBid} Cr</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setBehalfModalOpen(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-800 text-slate-300 rounded font-bold text-xs"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmBehalfBid}
                disabled={!behalfFranchiseId || behalfAmount < nextMinBid || isActionLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 rounded font-bold text-xs disabled:opacity-40"
              >
                {isActionLoading ? 'SUBMITTING...' : 'SUBMIT BEHALF BID'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DIRECT ASSIGN MODAL */}
      {directAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xl p-5 w-full max-w-md font-mono space-y-4">
            <h3 className="font-bold text-slate-900 text-base">DIRECT PLAYER ALLOCATION</h3>
            <p className="text-xs text-slate-600">
              Direct administrative assignment bypassing live bidding ladder.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Select Player:</label>
                <select
                  value={directAssignPlayerId}
                  onChange={(e) => {
                    setDirectAssignPlayerId(e.target.value);
                    const p = allLots.find(l => l.id === e.target.value || l.playerId === e.target.value);
                    if (p) setDirectAssignPrice(p.basePrice || 20);
                  }}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Choose Available Player --</option>
                  {allLots.filter(l => l.status === 'AVAILABLE' || l.status === 'UNSOLD').map(l => (
                    <option key={l.id} value={l.id}>
                      #{l.drawNumber} {l.playerName} ({l.bucket || l.bucketId}) - Base: {l.basePrice || 20} Cr
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Select Franchise:</label>
                <select
                  value={directAssignFranchiseId}
                  onChange={(e) => setDirectAssignFranchiseId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Choose Franchise --</option>
                  {franchises.map(f => (
                    <option key={f.id} value={f.id}>{f.name} (Purse: {f.purseRemaining || f.purse || 0} Cr)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Agreed Price (Credits):</label>
                <input
                  type="number"
                  value={directAssignPrice}
                  onChange={(e) => setDirectAssignPrice(parseInt(e.target.value, 10) || 0)}
                  min={20}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-cyan-500 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setDirectAssignModalOpen(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-800 text-slate-300 rounded font-bold text-xs"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmDirectAssign}
                disabled={!directAssignPlayerId || !directAssignFranchiseId || directAssignPrice <= 0 || isActionLoading}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-900 rounded font-bold text-xs disabled:opacity-40"
              >
                {isActionLoading ? 'ALLOCATING...' : 'CONFIRM ALLOCATION'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. RELAX BUCKET MINIMUM MODAL (Super Admin Only) */}
      {relaxModalOpen && capabilities.canRelaxBucketMinimum && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-purple-500/60 rounded-xl p-5 w-full max-w-md font-mono space-y-4">
            <h3 className="font-bold text-slate-900 text-base">RELAX BUCKET MINIMUM (UNIFORM)</h3>
            <p className="text-xs text-slate-600">
              Super Admin authority to uniformly reduce a mandatory bucket quota across all 11 franchises.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Mandatory Bucket:</label>
                <select
                  value={relaxBucket}
                  onChange={(e) => {
                    const b = e.target.value as BucketId;
                    setRelaxBucket(b);
                    setRelaxNewMin(Math.max(0, (bucketMinimums[b] || 2) - 1));
                  }}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-purple-500"
                >
                  {MANDATORY_BUCKETS.map((b: BucketId) => (
                    <option key={b} value={b}>{b} — {BUCKET_LABELS[b]} (Current: {bucketMinimums[b] || 0})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">New Uniform Minimum Requirement:</label>
                <input
                  type="number"
                  value={relaxNewMin}
                  onChange={(e) => setRelaxNewMin(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  min={0}
                  max={(bucketMinimums[relaxBucket] || 2)}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-purple-500 font-bold"
                />
              </div>

              <div className="p-2.5 rounded bg-purple-950/30 border border-purple-800/40 text-[10px] text-purple-300">
                Warning: Applying relaxation recalculates max bids and unlocks slot protections across all 11 franchises immediately.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setRelaxModalOpen(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-800 text-slate-300 rounded font-bold text-xs"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmRelax}
                disabled={isActionLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-slate-900 rounded font-bold text-xs shadow-md shadow-purple-600/30"
              >
                {isActionLoading ? 'APPLYING...' : 'APPLY RELAXATION'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. KEYBOARD SHORTCUTS HELP MODAL */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xl p-6 w-full max-w-lg font-mono space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-bold">HOTKEYS</span>
                Admin Auction Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Hammer Sale</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-800">H</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Skip Lot</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-800">S</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Pause / Resume</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-800">P</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Undo Sale</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-800">U</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Bid on Behalf</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-800">B</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Direct Assign</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-800">A</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Toggle Draw Mode</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-800">D</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Relax Bucket Min</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-800">R</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Auto Next Lot</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-800">Space</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Export CSV</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-800">Ctrl+E</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Snapshot JSON</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-800">Ctrl+S</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Toggle Help</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-800">?</kbd>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setHelpModalOpen(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs"
              >
                CLOSE [ ESC ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SOLD CONFIRMATION ANIMATION MODAL */}
      <SoldConfirmationModal
        isOpen={soldModalOpen}
        soldData={soldModalData}
        onClose={handleSoldAnimationComplete}
        autoCloseDurationMs={2800}
      />

    </div>
  );
}

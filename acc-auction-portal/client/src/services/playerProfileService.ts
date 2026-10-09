import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PlayerProfileResolution {
  exists: boolean;
  playerId: string | null;
  playerData: any | null;
  isOwner: boolean;
}

/**
 * Resolves the authoritative player record for an authenticated user UID.
 * Checks:
 * 1. Explicit playerId from userDoc
 * 2. players collection where uid == authUid
 * 3. players collection where authUid == authUid
 */
export async function resolvePlayerProfile(
  authUid?: string | null,
  userDocPlayerId?: string | null
): Promise<PlayerProfileResolution> {
  if (!authUid && !userDocPlayerId) {
    return { exists: false, playerId: null, playerData: null, isOwner: false };
  }

  // 1. Direct fetch if userDoc has playerId
  if (userDocPlayerId) {
    try {
      const pDoc = await getDoc(doc(db, 'players', userDocPlayerId));
      if (pDoc.exists()) {
        const data = pDoc.data();
        const isOwner = !authUid || data.uid === authUid || data.authUid === authUid || pDoc.id === userDocPlayerId;
        return {
          exists: true,
          playerId: pDoc.id,
          playerData: { ...data, id: pDoc.id },
          isOwner,
        };
      }
    } catch (err) {
      console.warn('[PlayerProfileService] Direct playerId lookup fallback:', err);
    }
  }

  // 2. Query players collection where uid == authUid
  if (authUid) {
    try {
      const qUid = query(collection(db, 'players'), where('uid', '==', authUid), limit(1));
      let snap = await getDocs(qUid);

      // 3. Query players collection where authUid == authUid
      if (snap.empty) {
        const qAuthUid = query(collection(db, 'players'), where('authUid', '==', authUid), limit(1));
        snap = await getDocs(qAuthUid);
      }

      if (!snap.empty) {
        const pDoc = snap.docs[0];
        return {
          exists: true,
          playerId: pDoc.id,
          playerData: { ...pDoc.data(), id: pDoc.id },
          isOwner: true,
        };
      }
    } catch (err) {
      console.warn('[PlayerProfileService] Query lookup by UID fallback:', err);
    }
  }

  return { exists: false, playerId: null, playerData: null, isOwner: false };
}

/**
 * Verifies whether a candidate roll number belongs to the currently authenticated player,
 * is available for registration, or belongs to another player (duplicate).
 */
export async function checkRollOwnership(
  rollNumber: string,
  authUid?: string | null,
  currentPlayerId?: string | null
): Promise<{
  allowed: boolean;
  isOwnRecord: boolean;
  exists: boolean;
  error?: string;
  existingData?: any;
}> {
  const normalized = rollNumber.trim().toUpperCase();
  if (!normalized) {
    return { allowed: false, isOwnRecord: false, exists: false, error: 'Roll number is required.' };
  }

  try {
    const snap = await getDoc(doc(db, 'players', normalized));
    if (!snap.exists()) {
      return { allowed: true, isOwnRecord: false, exists: false };
    }

    const data = snap.data();
    // Ownership matching: UID, authUid, or matching currentPlayerId
    const isOwn = Boolean(
      (authUid && (data.uid === authUid || data.authUid === authUid)) ||
      (currentPlayerId && (currentPlayerId === normalized || currentPlayerId === snap.id))
    );

    if (isOwn) {
      return {
        allowed: true,
        isOwnRecord: true,
        exists: true,
        existingData: { ...data, id: snap.id },
      };
    }

    return {
      allowed: false,
      isOwnRecord: false,
      exists: true,
      error: `ROLL NUMBER ALREADY REGISTERED. Roll number ${normalized} is registered to another student. If this is your roll number, please sign in with your own registered account.`,
      existingData: { ...data, id: snap.id },
    };
  } catch (err: any) {
    console.warn('[PlayerProfileService] checkRollOwnership fallback:', err);
    // On network failure, don't silently block legitimate users
    return { allowed: true, isOwnRecord: false, exists: false };
  }
}

/**
 * Verifies whether a mobile number belongs to the current player or a different player.
 */
export async function checkMobileOwnership(
  mobileNumber: string,
  rollNumber: string,
  authUid?: string | null,
  currentPlayerId?: string | null
): Promise<{
  allowed: boolean;
  isOwnRecord: boolean;
  exists: boolean;
  error?: string;
}> {
  const cleanDigits = mobileNumber.trim().replace(/\D/g, '');
  if (cleanDigits.length < 10) {
    return { allowed: true, isOwnRecord: false, exists: false };
  }

  const normalizedRoll = rollNumber.trim().toUpperCase();

  try {
    const mobQuery = query(collection(db, 'players'), where('mobilePrivate', '==', cleanDigits), limit(1));
    const mobSnap = await getDocs(mobQuery);

    if (mobSnap.empty) {
      return { allowed: true, isOwnRecord: false, exists: false };
    }

    const matchDoc = mobSnap.docs[0];
    const matchData = matchDoc.data();

    const isOwn = Boolean(
      matchDoc.id === normalizedRoll ||
      (currentPlayerId && matchDoc.id === currentPlayerId) ||
      (authUid && (matchData.uid === authUid || matchData.authUid === authUid))
    );

    if (isOwn) {
      return { allowed: true, isOwnRecord: true, exists: true };
    }

    return {
      allowed: false,
      isOwnRecord: false,
      exists: true,
      error: `MOBILE NUMBER ALREADY REGISTERED. Mobile number ${mobileNumber} is registered to another account.`,
    };
  } catch (err: any) {
    console.warn('[PlayerProfileService] checkMobileOwnership fallback:', err);
    return { allowed: true, isOwnRecord: false, exists: false };
  }
}

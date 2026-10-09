import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserDoc, UserRole, AccountStatus, ApprovalStatus } from '@shared/types';

export type AuthState = 
  | 'AUTH_LOADING'
  | 'PROFILE_LOADING'
  | 'ROLE_RESOLVING'
  | 'READY'
  | 'UNREGISTERED_GOOGLE'
  | 'PENDING_APPROVAL'
  | 'BLOCKED'
  | 'UNAUTHENTICATED'
  | 'ERROR';

export interface UnregisteredGoogleInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  userDoc: UserDoc | null;
  authState: AuthState;
  loading: boolean;
  unregisteredGoogleUser: UnregisteredGoogleInfo | null;
  error: string | null;
  signInWithGoogle: (intent?: 'PLAYER' | 'FRANCHISE') => Promise<{ success: boolean; userDoc?: UserDoc; isUnregistered?: boolean; message?: string }>;
  signInAdmin: (identifier: string, pass: string) => Promise<{ success: boolean; userDoc?: UserDoc; message?: string }>;
  switchGoogleAccount: (intent?: 'PLAYER' | 'FRANCHISE') => Promise<void>;
  sendAdminPasswordReset: (email: string) => Promise<void>;
  refreshUserDoc: () => Promise<UserDoc | null>;
  clearUnregisteredGoogleUser: () => void;
  signOut: () => Promise<void>;
  // Backwards compatibility alias
  signIn: (email: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [authState, setAuthState] = useState<AuthState>('AUTH_LOADING');
  const [unregisteredGoogleUser, setUnregisteredGoogleUser] = useState<UnregisteredGoogleInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Authoritative user resolution logic
  const resolveUserProfile = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setUser(null);
      setUserDoc(null);
      setUnregisteredGoogleUser(null);
      setAuthState('UNAUTHENTICATED');
      return null;
    }

    setUser(firebaseUser);
    setAuthState('PROFILE_LOADING');

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setAuthState('ROLE_RESOLVING');
        let data = userSnap.data() as UserDoc;

        // If player user has no playerId linked, look up players collection
        if ((!data.playerId || data.role === 'PLAYER') && !data.playerId) {
          try {
            const pQuery = query(collection(db, 'players'), where('uid', '==', firebaseUser.uid), limit(1));
            let pSnap = await getDocs(pQuery);
            if (pSnap.empty) {
              const pAuthQuery = query(collection(db, 'players'), where('authUid', '==', firebaseUser.uid), limit(1));
              pSnap = await getDocs(pAuthQuery);
            }
            if (!pSnap.empty) {
              const matchedPlayer = pSnap.docs[0];
              data = { ...data, playerId: matchedPlayer.id, role: data.role || 'PLAYER' };
              await updateDoc(userRef, { playerId: matchedPlayer.id, role: data.role || 'PLAYER', updatedAt: serverTimestamp() });
            }
          } catch (linkErr) {
            console.warn('[ACC Auth] Player lookup by UID fallback:', linkErr);
          }
        }

        setUserDoc(data);
        setUnregisteredGoogleUser(null);

        // Account status check
        const accStatus = data.accountStatus || (data.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING');
        if (accStatus === 'BLOCKED' || accStatus === 'DISABLED') {
          setAuthState('BLOCKED');
        } else if (accStatus === 'PENDING' || data.approvalStatus === 'PENDING_APPROVAL') {
          setAuthState('PENDING_APPROVAL');
        } else {
          setAuthState('READY');
        }
        return data;
      } else {
        // Check if an existing player record exists in /players with uid or authUid
        try {
          const pQuery = query(collection(db, 'players'), where('uid', '==', firebaseUser.uid), limit(1));
          let pSnap = await getDocs(pQuery);
          if (pSnap.empty) {
            const pAuthQuery = query(collection(db, 'players'), where('authUid', '==', firebaseUser.uid), limit(1));
            pSnap = await getDocs(pAuthQuery);
          }

          if (!pSnap.empty) {
            const matchedPlayer = pSnap.docs[0];
            const pData = matchedPlayer.data();
            const healedUserDoc: any = {
              uid: firebaseUser.uid,
              role: 'PLAYER',
              playerId: matchedPlayer.id,
              email: firebaseUser.email,
              displayName: pData.name || firebaseUser.displayName,
              photoURL: pData.photoUrl || firebaseUser.photoURL || null,
              accountStatus: pData.accountStatus || (pData.registration?.status === 'APPROVED' ? 'ACTIVE' : 'PENDING'),
              approvalStatus: pData.approvalStatus || (pData.registration?.status === 'APPROVED' ? 'APPROVED' : 'PENDING_APPROVAL'),
              status: 'ACTIVE',
              createdAt: pData.createdAt || serverTimestamp(),
              updatedAt: serverTimestamp(),
            };

            await setDoc(userRef, healedUserDoc, { merge: true });
            setUserDoc(healedUserDoc);
            setUnregisteredGoogleUser(null);

            const accStatus = healedUserDoc.accountStatus;
            if (accStatus === 'BLOCKED' || accStatus === 'DISABLED') {
              setAuthState('BLOCKED');
            } else if (accStatus === 'PENDING' || healedUserDoc.approvalStatus === 'PENDING_APPROVAL') {
              setAuthState('PENDING_APPROVAL');
            } else {
              setAuthState('READY');
            }
            return healedUserDoc;
          }
        } catch (healErr) {
          console.warn('[ACC Auth] Auto-healing player user doc fallback:', healErr);
        }

        // Authenticated with Google/Firebase, but no ACC record exists in /users/{uid} or /players
        setUserDoc(null);
        setUnregisteredGoogleUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        setAuthState('UNREGISTERED_GOOGLE');
        return null;
      }
    } catch (err: any) {
      console.error('[ACC Auth] Profile resolution failed:', err);
      setError(err.message || 'Failed to resolve user account profile.');
      setAuthState('ERROR');
      return null;
    }
  }, []);

  // Single authoritative onAuthStateChanged listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      await resolveUserProfile(currentUser);
    });

    return () => unsubscribe();
  }, [resolveUserProfile]);

  // Sign in with Google (for PLAYER, FRANCHISE_COORDINATOR, FRANCHISE_TEAM_LEADER)
  const signInWithGoogle = async (intent?: 'PLAYER' | 'FRANCHISE') => {
    setError(null);
    setAuthState('AUTH_LOADING');

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      const profile = await resolveUserProfile(googleUser);

      if (!profile) {
        // User is authenticated with Google but has no ACC profile record
        return { 
          success: false, 
          isUnregistered: true, 
          message: 'Google account authenticated, but not registered with an active ACC profile.' 
        };
      }

      // Role authorization verification against intent
      if (intent === 'PLAYER' && profile.role !== 'PLAYER') {
        await firebaseSignOut(auth);
        setUser(null);
        setUserDoc(null);
        setAuthState('UNAUTHENTICATED');
        const msg = `ACCESS DENIED: Your account is registered as ${profile.role}, not as an ACC Player.`;
        setError(msg);
        throw new Error(msg);
      }

      if (intent === 'FRANCHISE' && 
          profile.role !== 'FRANCHISE_COORDINATOR' && 
          profile.role !== 'FRANCHISE_TEAM_LEADER') {
        await firebaseSignOut(auth);
        setUser(null);
        setUserDoc(null);
        setAuthState('UNAUTHENTICATED');
        const msg = `ACCESS DENIED: Your account is registered as ${profile.role}. It is not an authorized Franchise Coordinator or Team Lead account.`;
        setError(msg);
        throw new Error(msg);
      }

      // Check account status
      if (profile.accountStatus === 'BLOCKED' || profile.accountStatus === 'DISABLED') {
        const msg = 'ACCESS DENIED: This account has been suspended or blocked by the Tournament Directorate.';
        setError(msg);
        throw new Error(msg);
      }

      return { success: true, userDoc: profile };
    } catch (err: any) {
      console.error('[ACC Auth] Google sign in error:', err);
      setError(err.message || 'Google authentication failed.');
      throw err;
    }
  };

  // Sign in Admin / Super Admin with Email & Password
  const signInAdmin = async (identifier: string, pass: string) => {
    setError(null);
    setAuthState('AUTH_LOADING');

    let email = identifier.trim();
    if (!email.includes('@')) {
      email = `${email.toLowerCase()}@acc.edu`;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const adminUser = result.user;

      const profile = await resolveUserProfile(adminUser);

      if (!profile) {
        await firebaseSignOut(auth);
        setUser(null);
        setUserDoc(null);
        setAuthState('UNAUTHENTICATED');
        const msg = 'ACCESS DENIED: No administrative database profile found for this credential.';
        setError(msg);
        throw new Error(msg);
      }

      // Strictly verify administrative role (no player or franchise elevation)
      if (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN') {
        await firebaseSignOut(auth);
        setUser(null);
        setUserDoc(null);
        setAuthState('UNAUTHENTICATED');
        const msg = `ACCESS DENIED: Account role is ${profile.role}. Administrative credentials are required for this portal.`;
        setError(msg);
        throw new Error(msg);
      }

      if (profile.accountStatus === 'BLOCKED' || profile.accountStatus === 'DISABLED') {
        await firebaseSignOut(auth);
        setUser(null);
        setUserDoc(null);
        setAuthState('UNAUTHENTICATED');
        const msg = 'ACCESS DENIED: Administrative account is disabled.';
        setError(msg);
        throw new Error(msg);
      }

      return { success: true, userDoc: profile };
    } catch (err: any) {
      console.error('[ACC Auth] Admin sign in error:', err);
      setError(err.message || 'Administrative authentication failed. Please check your credentials.');
      setAuthState('UNAUTHENTICATED');
      throw err;
    }
  };

  // Switch Google Account
  const switchGoogleAccount = async (intent?: 'PLAYER' | 'FRANCHISE') => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserDoc(null);
    setUnregisteredGoogleUser(null);
    setAuthState('UNAUTHENTICATED');
    await signInWithGoogle(intent);
  };

  // Admin Password Reset
  const sendAdminPasswordReset = async (email: string) => {
    let targetEmail = email.trim();
    if (!targetEmail.includes('@')) {
      targetEmail = `${targetEmail.toLowerCase()}@acc.edu`;
    }
    await sendPasswordResetEmail(auth, targetEmail);
  };

  // Refresh User Doc
  const refreshUserDoc = async () => {
    if (!auth.currentUser) return null;
    return await resolveUserProfile(auth.currentUser);
  };

  const clearUnregisteredGoogleUser = () => {
    setUnregisteredGoogleUser(null);
  };

  // Sign out cleanly
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } finally {
      setUser(null);
      setUserDoc(null);
      setUnregisteredGoogleUser(null);
      setError(null);
      setAuthState('UNAUTHENTICATED');

      // Purge any legacy local storage tokens if they existed
      try {
        localStorage.removeItem('acc_active_franchise_session');
        localStorage.removeItem('acc_current_user_2026');
      } catch {
        // ignore
      }
    }
  };

  // Backwards compatibility
  const signIn = async (email: string, pass: string) => {
    await signInAdmin(email, pass);
  };

  const loading = 
    authState === 'AUTH_LOADING' || 
    authState === 'PROFILE_LOADING' || 
    authState === 'ROLE_RESOLVING';

  return (
    <AuthContext.Provider
      value={{
        user,
        userDoc,
        authState,
        loading,
        unregisteredGoogleUser,
        error,
        signInWithGoogle,
        signInAdmin,
        switchGoogleAccount,
        sendAdminPasswordReset,
        refreshUserDoc,
        clearUnregisteredGoogleUser,
        signOut,
        signIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';

if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.firestore();
export const authAdmin = admin.auth();

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'FRANCHISE_COORDINATOR' | 'FRANCHISE_TEAM_LEADER' | 'PLAYER';

export interface CallerInfo {
  uid: string;
  role: UserRole;
  franchiseId: string | null;
}

export async function verifyCaller(uid: string | undefined, allowedRoles: UserRole[]): Promise<CallerInfo> {
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required.');
  
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) throw new HttpsError('not-found', 'User account not found.');
  
  const data = userDoc.data()!;
  const role = data.role as UserRole;

  if (data.accountStatus === 'DISABLED' || data.accountStatus === 'BLOCKED' || data.status === 'DELETED') {
    throw new HttpsError('permission-denied', 'This account is disabled.');
  }
  
  if (!allowedRoles.includes(role)) {
    throw new HttpsError('permission-denied', `Role ${role} is not authorized for this operation.`);
  }
  
  return {
    uid,
    role,
    franchiseId: data.franchiseId || null,
  };
}

export async function resolveFranchiseId(caller: CallerInfo): Promise<string> {
  if (caller.role === 'FRANCHISE_COORDINATOR' || caller.role === 'FRANCHISE_TEAM_LEADER') {
    if (!caller.franchiseId) {
      // Look up from franchiseUsers
      const fuDoc = await db.collection('franchiseUsers').doc(caller.uid).get();
      if (!fuDoc.exists) throw new HttpsError('not-found', 'Franchise user mapping not found.');
      return fuDoc.data()!.franchiseId;
    }
    return caller.franchiseId;
  }
  throw new HttpsError('permission-denied', 'Caller is not a franchise user.');
}

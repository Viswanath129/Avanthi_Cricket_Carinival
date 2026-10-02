import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, verifyCaller } from '../utils/auth';
import * as admin from 'firebase-admin';
import { writeAuditEvent } from '../utils/audit';

type Action = 'DELETE' | 'RESTORE' | 'PERMANENT_DELETE';

/** Governance actions on the canonical user directory. Historical tournament
 * records are deliberately not touched by these operations. */
export const manageUserRecord = onCall({ maxInstances: 3 }, async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN']);
  const { uid, action, confirmation } = request.data as {
    uid?: string; action?: Action; confirmation?: string;
  };
  if (!uid || typeof uid !== 'string' || !['DELETE', 'RESTORE', 'PERMANENT_DELETE'].includes(action || '')) {
    throw new HttpsError('invalid-argument', 'A user uid and supported action are required.');
  }
  if (uid === caller.uid) throw new HttpsError('failed-precondition', 'You cannot delete or restore your own account.');
  if (action === 'PERMANENT_DELETE' && confirmation !== `DELETE ${uid}`) {
    await writeAuditEvent({ actor: caller, action: 'USER_DELETE_REJECTED', targetType: 'USER', targetId: uid,
      result: 'REJECTED', metadata: { reason: 'CONFIRMATION_MISMATCH' } });
    throw new HttpsError('failed-precondition', `Type DELETE ${uid} to permanently delete this account.`);
  }

  const userRef = db.collection('users').doc(uid);
  const result = await db.runTransaction(async (txn) => {
    const snap = await txn.get(userRef);
    if (!snap.exists) throw new HttpsError('not-found', 'User record not found.');
    const before = snap.data()!;
    if (before.role === 'SUPER_ADMIN') throw new HttpsError('failed-precondition', 'Super Admin accounts are protected.');

    if (action === 'DELETE') {
      if (before.status === 'DELETED') {
        return { success: true, alreadyApplied: true };
      }
      txn.update(userRef, {
        status: 'DELETED', accountStatus: 'DISABLED',
        deletedPreviousState: {
          status: before.status || null,
          accountStatus: before.accountStatus || null,
          approvalStatus: before.approvalStatus || null,
        },
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        deletedBy: caller.uid, updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else if (action === 'RESTORE') {
      if (before.status !== 'DELETED') {
        return { success: true, alreadyApplied: true };
      }
      txn.update(userRef, {
        status: before.deletedPreviousState?.status || 'ACTIVE',
        accountStatus: before.deletedPreviousState?.accountStatus || 'ACTIVE',
        approvalStatus: before.deletedPreviousState?.approvalStatus || before.approvalStatus || null,
        deletedAt: null, deletedBy: null, deletedPreviousState: admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      txn.delete(userRef);
    }

    writeAuditEvent({ actor: caller,
      action: action === 'DELETE' ? 'USER_DISABLED' : action === 'RESTORE' ? 'USER_RESTORED' : 'USER_PERMANENTLY_DELETED',
      targetType: 'USER', targetId: uid, result: 'SUCCESS',
      metadata: { role: before.role || null, email: before.email || null }, transaction: txn });
    return { success: true, alreadyApplied: false };
  });

  // Disable/re-enable Firebase Auth where possible. The Firestore profile is
  // authoritative, so an Auth propagation failure cannot restore access.
  if (action === 'DELETE') {
    try { await admin.auth().updateUser(uid, { disabled: true }); } catch (error: any) {
      if (error.code !== 'auth/user-not-found') throw error;
    }
  } else if (action === 'RESTORE') {
    try { await admin.auth().updateUser(uid, { disabled: false }); } catch (error: any) {
      if (error.code !== 'auth/user-not-found') throw error;
    }
  } else {
    try { await admin.auth().deleteUser(uid); } catch (error: any) {
      if (error.code !== 'auth/user-not-found') throw error;
    }
  }
  return result;
});

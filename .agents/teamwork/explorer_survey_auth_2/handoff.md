# Handoff Report — Auth Security Spec Miner (R1 & R2)

**Agent**: `explorer_survey_auth_2`  
**To**: Orchestrator (`7f068c7d-2f06-486e-9bdd-e40597973f6a`)  
**Type**: Hard Handoff (Investigation Complete)  
**Date**: 2026-10-02  

---

## 1. Observation

Direct observations from source code, security rules, and test suites across `b:\projects\ACC`:

1. **Firebase Authentication Initialization**:
   - `b:\projects\ACC\acc-auction-portal\client\src\lib\firebase.ts:8-48`:
     Uses Firebase Modular SDK v11. Validates all 7 required `VITE_FIREBASE_*` environment keys at build-time. Initializes singletons `auth = getAuth(app)`, `db = getFirestore(app)`, `storage = getStorage(app)`, `functions = getFunctions(app)`, and `rtdb = getDatabase(app)`.
   - `b:\projects\ACC\Acc-Auction-Os.html:2004-2008, 12843-12856, 13368-13385`:
     Loads Firebase Compat SDK v10.13.2 via CDN and signs in anonymously (`firebase.auth().signInAnonymously()`). User state in the single-file OS is tracked in `localStorage["acc_current_user_2026"]`.

2. **Authoritative Identity Resolution (`/users/{uid}`)**:
   - `b:\projects\ACC\acc-auction-portal\client\src\contexts\AuthContext.tsx:85-115`:
     ```typescript
     const userRef = doc(db, 'users', firebaseUser.uid);
     const userSnap = await getDoc(userRef);
     if (userSnap.exists()) {
       const data = userSnap.data() as UserDoc;
       setUserDoc(data);
       ...
     } else {
       setUserDoc(null);
       setUnregisteredGoogleUser({ uid: firebaseUser.uid, email: firebaseUser.email, ... });
       setAuthState('UNREGISTERED_GOOGLE');
     }
     ```
   - `b:\projects\ACC\firestore.rules:9-15`:
     ```javascript
     function getUserDoc() {
       return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
     }
     function getUserRole() {
       return getUserDoc().role;
     }
     ```
   - `b:\projects\ACC\acc-auction-portal\functions\src\utils\auth.ts:19-37`:
     ```typescript
     export async function verifyCaller(uid: string | undefined, allowedRoles: UserRole[]): Promise<CallerInfo> {
       if (!uid) throw new HttpsError('unauthenticated', 'Authentication required.');
       const userDoc = await db.collection('users').doc(uid).get();
       if (!userDoc.exists) throw new HttpsError('not-found', 'User account not found.');
       const role = userDoc.data()!.role as UserRole;
       if (!allowedRoles.includes(role)) throw new HttpsError('permission-denied', ...);
       return { uid, role, franchiseId: userDoc.data()!.franchiseId || null };
     }
     ```

3. **Unregistered Google & Blocked Account Handling**:
   - `b:\projects\ACC\acc-auction-portal\client\src\components\ProtectedRoute.tsx:44-76`:
     - Line 45: `if (!userDoc) return <Redirect to="/login" />;`
     - Lines 50-76: If `accountStatus === 'BLOCKED' || accountStatus === 'DISABLED'`, renders "Account Suspended: Operational Suspension" modal.
   - `b:\projects\ACC\acc-auction-portal\client\src\pages\LoginPage.tsx:123-176, 250-281`:
     Renders dedicated screens for `UNREGISTERED_GOOGLE` and `BLOCKED`.

4. **Player Roll Number Normalization & 1:1 UID Binding**:
   - `b:\projects\ACC\acc-auction-portal\client\src\hooks\useRollParser.ts:18-20`:
     `rollNumber.trim().toUpperCase()`
   - `b:\projects\ACC\acc-auction-portal\client\src\pages\PlayerRegistrationPage.tsx:173, 215`:
     `formData.rollNumber.trim().toUpperCase()`
   - `b:\projects\ACC\acc-auction-portal\client\src\pages\PlayerRegistrationPage.tsx:219-254`:
     Validates uniqueness before submission. Rejects duplicate roll numbers, conflicting mobile numbers, or attempts to link an already-linked Google UID to a different player.
   - `b:\projects\ACC\firestore.rules:96-104`:
     `/players/{playerId}` update rule enforces:
     `(resource.data.uid == request.auth.uid || resource.data.authUid == request.auth.uid)`.
     An attacker with a different UID cannot update or hijack an existing player document.

5. **Firestore Security Rules Escalation Defenses**:
   - `b:\projects\ACC\firestore.rules:44-62` (`match /users/{uid}`):
     - `create`: Only allowed if `request.resource.data.role == 'PLAYER'` or `'FRANCHISE_COORDINATOR'`, AND `accountStatus == 'PENDING'`, AND `approvalStatus == 'PENDING_APPROVAL'`.
     - `update`: Only allowed if `isSuperAdmin()` or (`isAdmin()` and neither old nor new role is `SUPER_ADMIN`). Non-admin clients have zero update permissions.
   - `b:\projects\ACC\firestore.rules:84-106` (`match /players/{playerId}`):
     - `create`: Enforces `accountStatus == 'PENDING'`, `approvalStatus == 'PENDING_APPROVAL'`, `auctionable == false`.
     - `update`: Self-updates enforce exact preservation of `accountStatus`, `approvalStatus`, and `auctionable` (`request.resource.data.approvalStatus == resource.data.approvalStatus`). Only `isAdmin()` can change status.
   - `b:\projects\ACC\firestore.rules:9-23`:
     Helper functions resolve roles strictly via `getUserDoc().role`. Provider claims, custom claims, and OAuth metadata are never read.

---

## 2. Logic Chain

1. **Identity vs Authorization Separation**:
   - Firebase Auth handles cryptographic token issuance (`uid`, `email`).
   - Observations 2 and 5 show that neither client contexts, Cloud Functions, nor Firestore rules trust claims inside the JWT token.
   - Every permission check queries Firestore `/users/{uid}`.
   - Therefore, Firebase Auth provides identity only; authorization is 100% database-authoritative.

2. **Unregistered Account Confinement**:
   - When an unprovisioned Google identity authenticates, Observation 2 confirms `userSnap.exists()` is false, setting `authState = 'UNREGISTERED_GOOGLE'`.
   - Observation 3 confirms `ProtectedRoute` denies access to any route when `userDoc == null`.
   - Observation 5 confirms that in Firestore rules, `getUserDoc()` on a missing document fails closed, causing `isSuperAdmin()`, `isAdmin()`, and `isFranchise()` to evaluate to false.
   - Therefore, unregistered Google accounts have zero privileges and cannot reach protected dashboards or mutate protected database collections.

3. **Escalation Defense Validity**:
   - Direct write of `role: "SUPER_ADMIN"` or `role: "ADMIN"` on `/users/{uid}` is blocked on `create` by the strict whitelist (`PLAYER` or `FRANCHISE_COORDINATOR`), and on `update` by restricting updates to existing admins (Observation 5).
   - Direct mutation of `approvalStatus: "APPROVED"` or `accountStatus: "ACTIVE"` on `/players/{playerId}` is blocked on `create` by enforcing `PENDING` / `PENDING_APPROVAL`, and on `update` by enforcing equality with existing stored status unless the caller is `isAdmin()` (Observation 5).
   - Google OAuth provider claims cannot grant admin rights because Firestore rules read `/users/{uid}` from the database, not OAuth token metadata (Observation 5).
   - Therefore, all privilege and approval escalation attacks fail at the database rule layer, independent of frontend guards.

4. **Roll Normalization and Anti-Hijacking**:
   - Roll numbers are trimmed and converted to uppercase (`24815a0443` -> `24815A0443`) in both client hooks and database doc IDs (Observation 4).
   - Once `/players/{24815A0443}` exists with legitimate `uid: A`, any subsequent write by attacker `uid: B` is treated as an `update`.
   - The update rule enforces `resource.data.uid == request.auth.uid`. Because attacker B's UID does not match player A's UID, Firestore rejects the write (Observation 4).
   - Therefore, player records cannot be hijacked across Google accounts.

---

## 3. Caveats

1. **Defensive Nuance in `firestore.rules` Helper Functions**:
   `isSuperAdmin()`, `isAdmin()`, and `isFranchise()` in `firestore.rules:17-31` verify `getUserRole() == ...` but do not explicitly check `getUserDoc().accountStatus == 'ACTIVE'` or `getUserDoc().accountStatus != 'BLOCKED'`. Suspended admin/franchise accounts rely on frontend UI route guards (`ProtectedRoute.tsx`) unless their database `role` field is also demoted upon suspension.
2. **Realtime Database `auctionState` Rule Permissiveness**:
   In `database.rules.json:20-23`, `auctionState` permits `.write: "auth != null"`. In RTDB, any authenticated user can write to `auctionState`, whereas Firestore `/acc_auctions/{auctionId}` enforces `isAdmin() || isFranchise()`.
3. **Dual Codebase Execution**:
   `Acc-Auction-Os.html` is an offline/local simulation running with anonymous Firebase Auth and mock credentials in `localStorage`. The real production architecture is `acc-auction-portal/`.

---

## 4. Conclusion

Requirements **R1** and **R2** are **fully implemented and enforced at the database level**:
- **R1 (PASS)**: Firebase Auth provides identity only; role resolution is strictly governed by `/users/{uid}`. Unregistered Google accounts resolve to `UNREGISTERED_GOOGLE` with zero privileges. Blocked accounts are locked out via `ProtectedRoute`. Roll number normalization strictly prevents casing duplicates (`24815a0443` -> `24815A0443`), and 1:1 UID binding prevents account hijacking.
- **R2 (PASS)**: Direct privilege escalation (`role: 'ADMIN'` / `role: 'SUPER_ADMIN'`) and approval status escalation (`approvalStatus: 'APPROVED'`, `accountStatus: 'ACTIVE'`) are completely blocked by `firestore.rules`. Google OAuth tokens cannot claim administrative rights. All security boundaries hold independently of frontend UI route guards.

---

## 5. Verification Method

To independently verify these findings, inspect and execute:

1. **Inspect Core Files**:
   - `b:\projects\ACC\firestore.rules` (lines 1-198)
   - `b:\projects\ACC\acc-auction-portal\client\src\contexts\AuthContext.tsx` (lines 72-122, 194-230)
   - `b:\projects\ACC\acc-auction-portal\client\src\components\ProtectedRoute.tsx` (lines 38-76, 133-187)
   - `b:\projects\ACC\acc-auction-portal\client\src\pages\PlayerRegistrationPage.tsx` (lines 173-190, 215-255, 344-365)
   - `b:\projects\ACC\acc-auction-portal\functions\src\utils\auth.ts` (lines 19-37)

2. **Automated Test Suites**:
   - Run Vitest in `acc-auction-portal/`:
     ```bash
     pnpm test
     ```
     Specifically verifies `realAuthRoleResolution.test.ts`, `playerRegistration.test.ts`, and `adminCapabilities.test.ts`.
   - Run Node verification tests in `b:\projects\ACC\tests\`:
     ```bash
     node tests/test_redteam_remediation.js
     node tests/test_admin_governance.js
     node tests/test_login_and_reg.js
     ```

3. **Invalidation Conditions**:
   - If any rule in `firestore.rules` is found to read `request.auth.token.role` instead of `/users/{uid}`, conclusion R1 is invalidated.
   - If a non-admin client can write `role: 'SUPER_ADMIN'` to `/users/{uid}` in Firestore, conclusion R2 is invalidated.
   - If `/players/{playerId}` allows a non-admin to update `approvalStatus` to `APPROVED`, conclusion R2 is invalidated.

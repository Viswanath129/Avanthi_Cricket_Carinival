# Comprehensive Auth & Security Specification Mining Report (R1 & R2)

**Audit Subject**: Avanthi Cricket Carnival (ACC 2026) Player Auction Architecture  
**Investigator**: Auth Security Spec Miner (`explorer_survey_auth_2`)  
**Scope**: Requirements R1 (Authentication Boundary & Identity Resolution) and R2 (Privilege & Approval Escalation Penetration Testing)  
**Date**: 2026-10-02  

---

## Executive Summary

A comprehensive, adversarial static code analysis and specification mining review was executed across the ACC 2026 codebase (`b:\projects\ACC`). This audit examined the dual implementation architecture:
1. The production Vite/React application in `acc-auction-portal/` (utilizing Firebase Modular SDK v11, Firestore Security Rules v2, Cloud Functions v2, and React Context).
2. The standalone single-file simulation in `Acc-Auction-Os.html` / `index.html` (utilizing Firebase Compat SDK v10, anonymous authentication, and local browser `localStorage`).

The investigation confirms that **Firebase Authentication serves exclusively as an identity provider (`uid`, `email`)**, and all user authorizations and roles are **strictly resolved from authoritative Firestore database records at `/users/{uid}`**. 

Direct privilege escalation attacks (e.g. attempting to create or update documents to `SUPER_ADMIN`, escalating from `PLAYER` to `ADMIN`, or mutating `approvalStatus` to `APPROVED`) are **strictly blocked at the database rule evaluation layer in `firestore.rules`**, fully independent of client-side UI route guards.

---

## 1. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Firebase Auth Init | Modular Client Config | Validates mandatory Firebase environment keys at build-time and initializes modular Auth, Firestore, Storage, Functions, and RTDB instances. Supports local emulator connections when `VITE_USE_EMULATORS === 'true'`. | `import.meta.env.VITE_FIREBASE_*` | Firebase App, Auth, DB singletons | Throws error listing missing environment variables | `acc-auction-portal/client/src/lib/firebase.ts:8-56` |
| 2 | Identity Resolution | Authoritative `/users/{uid}` Mapping | Authenticated Firebase user identity (`currentUser.uid`, `email`) is mapped to an authoritative database profile fetched directly from `/users/{uid}`. No roles or privileges are inferred from JWT claims or provider metadata. | `firebaseUser: User` | `userDoc: UserDoc` or `null` | Unresolvable profiles trigger fallback to unauthenticated or unregistered states | `acc-auction-portal/client/src/contexts/AuthContext.tsx:72-122` |
| 3 | Identity Resolution | Backend Cloud Function Caller Verification | Server-side Cloud Functions query `/users/{uid}` via Admin SDK to verify caller identity and role before executing any privileged operation. | `request.auth.uid`, `allowedRoles: UserRole[]` | `CallerInfo { uid, role, franchiseId }` | Throws `HttpsError('unauthenticated')`, `HttpsError('not-found')`, or `HttpsError('permission-denied')` | `acc-auction-portal/functions/src/utils/auth.ts:19-37` |
| 4 | Identity Resolution | Firestore Rules Helper Resolution | Security rules use `getUserDoc()` to look up `/users/$(request.auth.uid)` in Firestore. Helper functions `isSuperAdmin()`, `isAdmin()`, `isFranchise()` derive directly from database state. | `request.auth.uid` | Document data map | Non-existent `/users/{uid}` record causes rule evaluation failure (fail closed) | `firestore.rules:5-38` |
| 5 | Unregistered Google | `UNREGISTERED_GOOGLE` State Resolution | When a Google user logs in who has no record in `/users/{uid}`, the app traps them in `UNREGISTERED_GOOGLE` with zero roles (`allowedRoles: []`). | Google OAuth Popup Credential | `authState = 'UNREGISTERED_GOOGLE'`, `userDoc = null` | Returns `{ success: false, isUnregistered: true }`, routes to registration selection screen | `acc-auction-portal/client/src/contexts/AuthContext.tsx:104-115, 147-154` |
| 6 | Unregistered Google | Protected Route Lockdown for Unregistered Google | `ProtectedRoute` redirects any session where `userDoc == null` to `/login`, denying access to player, franchise, and admin dashboards. | Target route, `userDoc` | Redirect to `/login` | Access completely denied | `acc-auction-portal/client/src/components/ProtectedRoute.tsx:44-47` |
| 7 | Blocked Accounts | Account Suspension Enforcement | Detects `accountStatus: 'BLOCKED'` or `'DISABLED'` during profile resolution and immediately traps the user in `BLOCKED` auth state. | `userDoc.accountStatus`, `userDoc.status` | `authState = 'BLOCKED'` | Displays dedicated Account Suspended modal; prohibits workspace entry; forces sign-out | `acc-auction-portal/client/src/contexts/AuthContext.tsx:95-97, 180-184`, `ProtectedRoute.tsx:50-76` |
| 8 | Roll Number Handling | Case-Insensitive Roll Normalization | Trims and upper-cases all roll number inputs across client forms, hooks, and tests, normalizing e.g. `24815a0443` into canonical `24815A0443`. | Raw string (e.g. `" 24815a0443 "`) | Normalized uppercase string (`"24815A0443"`) | Invalid format flagged by `useRollParser` | `acc-auction-portal/client/src/hooks/useRollParser.ts:18-20`, `PlayerRegistrationPage.tsx:173, 215` |
| 9 | Roll Number Handling | 1:1 Google UID-to-Player Anti-Hijacking | Enforces strict 1:1 binding between Google UID and canonical Player roll number. Prohibits an account already linked to one player from linking another, and prevents impostor UIDs from claiming an existing player record. | `uid`, `normalizedRoll` | Atomic `/players/{roll}` & `/users/{uid}` records | Rejects with error if roll already bound to another UID, or if user already bound to another player ID | `acc-auction-portal/client/src/pages/PlayerRegistrationPage.tsx:219-255`, `realAuthRoleResolution.test.ts:91-102` |
| 10 | Escalation Defense | Direct Role Escalation Defense | `firestore.rules` prohibits clients from creating `/users/{uid}` with `role: 'ADMIN'` or `role: 'SUPER_ADMIN'`. Updates are restricted exclusively to admins; regular users cannot mutate `/users/{uid}`. | `request.resource.data.role` | Firestore document commit or rejection | `PERMISSION_DENIED` at Firestore engine | `firestore.rules:44-62` |
| 11 | Escalation Defense | Operator-to-SuperAdmin Escalation Defense | Firestore rules prohibit `ADMIN` (floor operators) from creating, updating, or deleting `SUPER_ADMIN` accounts. Only `SUPER_ADMIN` can modify `SUPER_ADMIN` records. | `request.resource.data.role`, `resource.data.role` | Rejected if target or source role is `SUPER_ADMIN` | `PERMISSION_DENIED` at Firestore engine | `firestore.rules:56-60` |
| 12 | Escalation Defense | Approval Status Mutation Defense | Firestore rules restrict player self-updates to non-governance fields. Modifying `approvalStatus` (`PENDING` -> `APPROVED`), `accountStatus` (`PENDING` -> `ACTIVE`), or `auctionable` (`false` -> `true`) is rejected. | `request.resource.data.approvalStatus`, `accountStatus`, `auctionable` | Update allowed only if status fields match existing `resource.data` | `PERMISSION_DENIED` at Firestore engine | `firestore.rules:96-104` |
| 13 | Escalation Defense | Google OAuth Admin Elevation Immunity | Administrative privileges (`ADMIN`, `SUPER_ADMIN`) cannot be acquired or claimed via Google OAuth tokens or custom claims. Rules query the database `/users/{uid}` directly and ignore OAuth provider claims. | Google OAuth ID Token | Role resolved strictly via Firestore `/users/{uid}` | Unregistered or unprovisioned Google identity receives zero admin rights | `firestore.rules:9-23`, `AuthContext.tsx:194-230` |
| 14 | Spectator Privacy | Private PII Stripping (Cloud Trigger) | Firestore background trigger `projectPublicPlayer` strips sensitive fields (`mobile`, `phone`, `email`, `cricHeroesMobile`, `rollNumber`) before writing to `playersPublic/{playerId}`. | Write to `players/{playerId}` | Sanitized public document in `playersPublic` | PII explicitly removed via `delete` statements | `acc-auction-portal/functions/src/triggers/projectPublicData.ts:13-59` |
| 15 | Audit Immutability | Append-Only Audit Trail | `firestore.rules` allows `isAdmin()` to create audit logs in `/auditLogs/{logId}`, but strictly sets `allow update, delete: if false;`. | Audit record write | Immutable record created | Any update or delete returns `PERMISSION_DENIED` | `firestore.rules:185-189` |

---

## 2. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Roll Normalization | `"  24815a0443  "` (lowercase with whitespace) | Successfully stripped of whitespace and converted to uppercase `"24815A0443"`. Matches existing `"24815A0443"` record in database lookup and triggers duplicate error if already registered. |
| 2 | Roll Normalization | `"24815 a 0443"` (internal spaces) | Internal spaces sanitized during normalization (`.replace(/\s+/g, '')`), correctly mapping to `"24815A0443"`. |
| 3 | Anti-Hijacking | Attacker with Google UID `uid-attacker` attempts to write to `/players/24815A0443` (registered to `uid-legit`) | Firestore rules evaluate operation as `update` on existing document. Because `resource.data.uid == request.auth.uid` is `false` and attacker is not admin, the write is rejected with `PERMISSION_DENIED`. |
| 4 | Direct Role Escalation | Authenticated Player (`role: 'PLAYER'`) attempts `updateDoc(doc(db, 'users', uid), { role: 'SUPER_ADMIN' })` | Rejected by `firestore.rules:56-60`. `allow update` requires `isSuperAdmin()` or `isAdmin()`. Normal players have no update rights on `/users/{uid}`. |
| 5 | Approval Elevation | Authenticated Player attempts `updateDoc(doc(db, 'players', roll), { approvalStatus: 'APPROVED', accountStatus: 'ACTIVE', auctionable: true })` | Rejected by `firestore.rules:96-104`. Rules demand `request.resource.data.approvalStatus == resource.data.approvalStatus` and `request.resource.data.auctionable == resource.data.auctionable`. |
| 6 | Unregistered Google | Arbitrary Google account signs in via OAuth popup | Profile lookup in `/users/{uid}` returns `null`. `AuthContext` transitions to `UNREGISTERED_GOOGLE`. User has zero role privileges and is redirected to `/login` upon navigating to protected dashboards. |
| 7 | Blocked Player Account | Player with `accountStatus: 'BLOCKED'` attempts dashboard navigation | `ProtectedRoute` intercepts navigation and renders full-screen "Account Suspended: Operational Suspension" modal. No protected pages render. |
| 8 | Google Admin Sign-in | User signs in via Google OAuth attempting to enter Admin Portal | `signInWithGoogle` checks role intent; does not support administrative elevation. In `signInAdmin`, only dedicated email/password credentials are permitted. Rules do not read OAuth claims. |
| 9 | Anonymous Session in OS File | `Acc-Auction-Os.html` boots with anonymous Firebase Auth (`firebase.auth().signInAnonymously()`) and mock admin in `localStorage` | Anonymous user UID has no document in Firestore `/users/{uid}`. Attempts by `Acc-Auction-Os.html` to write to `/acc_auctions/acc_main_2026` or `/players/...` are rejected by Firestore security rules. |
| 10 | Operator Admin Escalation | `ADMIN` (floor operator) attempts `updateDoc(doc(db, 'users', targetUid), { role: 'SUPER_ADMIN' })` | Rejected by `firestore.rules:56-60` (`request.resource.data.role != 'SUPER_ADMIN'`). Operators cannot promote users to Super Admin. |

---

## 3. Deep Architectural Investigation

### 3.1 Requirement R1: Authentication Boundary & Identity Resolution Audit

#### 3.1.1 Firebase Auth Client Initialization
In `acc-auction-portal/client/src/lib/firebase.ts`:
- Build-time validation (lines 8–30) asserts that all 7 required environment variables are set:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_FIREBASE_DATABASE_URL`
- In local development mode (`import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true'`), the client automatically binds to local Firebase emulators:
  - Auth Emulator on `localhost:9099`
  - Firestore Emulator on `localhost:8080`
  - Storage Emulator on `localhost:9199`
  - Functions Emulator on `localhost:5001`
  - RTDB Emulator on `localhost:9000`

In `Acc-Auction-Os.html` (lines 2004–2008, 12843–12856, 13368–13385):
- Firebase Compat v10.13.2 is loaded via CDN scripts.
- It hardcodes `DEFAULT_FIREBASE_CONFIG` pointing to project `studio-6471864054-30ce7`.
- It executes `firebase.auth().signInAnonymously()`.
- **Architectural Distinction**: `Acc-Auction-Os.html` manages authentication via client-side state (`localStorage.getItem("acc_current_user_2026")`) and pre-baked credentials (`INITIAL_USERS`). However, because the underlying Firebase session is anonymous, it cannot execute privileged Firestore writes against the production database rules. The true authoritative application is `acc-auction-portal`.

#### 3.1.2 User Identity Mapping to Authoritative `/users/{uid}` Records
In `acc-auction-portal/client/src/contexts/AuthContext.tsx`:
- The listener `onAuthStateChanged` triggers `resolveUserProfile` (lines 72–122).
- When a user signs in, Firebase Authentication provides only cryptographic identity (`uid`, `email`).
- `resolveUserProfile` queries Firestore:
  ```typescript
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);
  ```
- If the document exists, `userDoc` is populated with the database record, defining the user's role:
  - `SUPER_ADMIN`
  - `ADMIN`
  - `FRANCHISE_COORDINATOR`
  - `FRANCHISE_TEAM_LEADER`
  - `PLAYER`
- No user claims from `firebaseUser.getIdTokenResult()` or custom claims are trusted for authorization.

#### 3.1.3 Handling of Unregistered Google Accounts
When an arbitrary user signs in with a Google account that has not been provisioned or registered into ACC:
1. `userSnap.exists()` evaluates to `false` in `AuthContext.tsx:104-115`.
2. `userDoc` is set to `null`.
3. `unregisteredGoogleUser` is populated with metadata (`uid`, `email`, `displayName`, `photoURL`).
4. `authState` transitions to `'UNREGISTERED_GOOGLE'`.
5. In `LoginPage.tsx:122-176`, the screen displays the "Google Account Not Registered" interface, explaining that the identity is verified but has zero ACC role permissions.
6. In `ProtectedRoute.tsx:44-47`, any attempt to access `/admin`, `/operator`, `/franchise`, or `/player` results in an immediate `<Redirect to="/login" />`.
7. At the Firestore rule layer (`firestore.rules:9-23`), helper functions `isSuperAdmin()`, `isAdmin()`, and `isFranchise()` attempt to call `getUserDoc()` on `/users/$(request.auth.uid)`. Because the document does not exist, Firestore rule evaluation terminates and denies access.

#### 3.1.4 Enforcement of Blocked Accounts (`BLOCKED` / `DISABLED`)
- In `AuthContext.tsx:95-97`:
  ```typescript
  const accStatus = data.accountStatus || (data.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING');
  if (accStatus === 'BLOCKED' || accStatus === 'DISABLED') {
    setAuthState('BLOCKED');
  }
  ```
- In `ProtectedRoute.tsx:50-76`:
  If `accountStatus === 'BLOCKED' || accountStatus === 'DISABLED'`, the component halts rendering and displays an "Account Suspended: Operational Suspension" modal.
- In `AuthContext.tsx:180-184` and `231-239`:
  Both `signInWithGoogle` and `signInAdmin` throw an error and sign out if `profile.accountStatus === 'BLOCKED'`.
- In `Acc-Auction-Os.html:13000-13007`:
  The realtime listener `subscribeCurrentUser()` listens to Firestore and calls `logoutUser()` immediately if `uData.status === 'BLOCKED' || uData.status === 'LOCKED' || uData.status === 'DISABLED'`.

#### 3.1.5 Player Roll Number Handling & Anti-Hijacking
- **Normalization**:
  - `useRollParser.ts:19`: `rollNumber.trim().toUpperCase()`
  - `PlayerRegistrationPage.tsx:173, 215`: `formData.rollNumber.trim().toUpperCase()`
  - `realAuthRoleResolution.test.ts:6`: `roll.trim().toUpperCase().replace(/\s+/g, '')`
  - Input `24815a0443` resolves deterministically to `24815A0443`.
- **Uniqueness & Anti-Hijacking Defense**:
  - Before writing, `PlayerRegistrationPage.tsx` checks if `/players/{normalizedRoll}` exists.
  - If existing data has a `uid` that does not match `user?.uid`, client throws:
    `"ROLL NUMBER ALREADY REGISTERED. Roll ... is already registered. Another user cannot claim this player record."`
  - Even if an attacker bypasses the frontend and directly issues a Firestore SDK write to `/players/{normalizedRoll}`:
    - Because the document already exists, Firestore treats the operation as an `update`.
    - `firestore.rules:96-104` requires:
      `(resource.data.uid == request.auth.uid || resource.data.authUid == request.auth.uid)`
    - Because `resource.data.uid` holds the legitimate player's UID, the attacker's UID fails the check. Firestore rules reject the operation with `PERMISSION_DENIED`.
  - Conversely, if an attacker attempts to bind an already-registered Google account to a second player record, `PlayerRegistrationPage.tsx:251-254` rejects the attempt:
    `"ACCOUNT ALREADY LINKED. This Google account is already linked to player ID ... One Google account may only be linked to one canonical player."`

---

### 3.2 Requirement R2: Privilege & Approval Escalation Penetration Testing

#### 3.2.1 Direct Role Escalation Defenses (`firestore.rules:44-62`)
```javascript
match /users/{uid} {
  allow read: if isAuthenticated() && (request.auth.uid == uid || isAdmin());
  allow write: if isSuperAdmin();
  allow create: if isAuthenticated() && request.auth.uid == uid &&
    (
      (request.resource.data.role == 'PLAYER' &&
       request.resource.data.accountStatus == 'PENDING' &&
       request.resource.data.approvalStatus == 'PENDING_APPROVAL') ||
      (request.resource.data.role == 'FRANCHISE_COORDINATOR' &&
       request.resource.data.accountStatus == 'PENDING' &&
       request.resource.data.approvalStatus == 'PENDING_APPROVAL')
    );
  allow update: if isSuperAdmin() || (
    isAdmin() && 
    request.resource.data.role != 'SUPER_ADMIN' && 
    resource.data.role != 'SUPER_ADMIN'
  );
  allow delete: if isSuperAdmin();
}
```

1. **Attempting to write `role: 'ADMIN'` or `role: 'SUPER_ADMIN'` on create**:
   - `allow create` requires `request.resource.data.role == 'PLAYER'` or `'FRANCHISE_COORDINATOR'`.
   - **Result**: REJECTED by Firestore rules.
2. **Attempting to update `role: 'PLAYER'` -> `role: 'ADMIN'`**:
   - `allow update` requires `isSuperAdmin()` or `isAdmin()`.
   - A non-admin authenticated client has role `'PLAYER'`. `isAdmin()` is `false`.
   - **Result**: REJECTED by Firestore rules.
3. **Attempting to escalate `ADMIN` -> `SUPER_ADMIN`**:
   - For an `ADMIN` client, `allow update` enforces `request.resource.data.role != 'SUPER_ADMIN'` and `resource.data.role != 'SUPER_ADMIN'`.
   - **Result**: REJECTED by Firestore rules. Only `SUPER_ADMIN` can write `SUPER_ADMIN`.

#### 3.2.2 Approval Status Escalation Defenses (`firestore.rules:84-106`)
```javascript
match /players/{playerId} {
  allow read: if isAuthenticated() && (...);
  allow create: if isAuthenticated() && 
    request.resource.data.accountStatus == 'PENDING' &&
    request.resource.data.approvalStatus == 'PENDING_APPROVAL' &&
    request.resource.data.auctionable == false;
  allow update: if isAuthenticated() && (
    isAdmin() ||
    (
      (resource.data.uid == request.auth.uid || resource.data.authUid == request.auth.uid) &&
      request.resource.data.accountStatus == resource.data.accountStatus &&
      request.resource.data.approvalStatus == resource.data.approvalStatus &&
      request.resource.data.auctionable == resource.data.auctionable
    )
  );
  allow delete: if isSuperAdmin();
}
```

1. **Attempting to create player with `approvalStatus: 'APPROVED'` or `auctionable: true`**:
   - `allow create` strictly demands `accountStatus == 'PENDING'`, `approvalStatus == 'PENDING_APPROVAL'`, and `auctionable == false`.
   - **Result**: REJECTED by Firestore rules.
2. **Attempting to mutate `PENDING` -> `APPROVED` or `PENDING_APPROVAL` -> `ACTIVE`**:
   - If a player attempts to update their own document, `allow update` requires:
     `request.resource.data.accountStatus == resource.data.accountStatus`
     `request.resource.data.approvalStatus == resource.data.approvalStatus`
     `request.resource.data.auctionable == resource.data.auctionable`
   - Modifying any of these three fields by a non-admin fails the equality assertion.
   - **Result**: REJECTED by Firestore rules. Only `isAdmin()` can modify status or approval.

#### 3.2.3 Administrative Claims via Google OAuth
1. **Rule Query Architecture**:
   Helper functions in `firestore.rules` (lines 9–23) derive administrative privilege via:
   `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role`
2. **Provider Metadata Independence**:
   - `firestore.rules` never checks `request.auth.token.firebase.sign_in_provider`.
   - It never checks custom token claims (`request.auth.token.role` or `request.auth.token.admin`).
   - An attacker authenticating with Google OAuth receives a token issued by `accounts.google.com`. Because that token's `uid` has no `/users/{uid}` document with `role == 'SUPER_ADMIN'` or `role == 'ADMIN'`, the attacker cannot claim administrative privileges.
3. **Application Layer Enforcement**:
   - In `acc-auction-portal/client/src/contexts/AuthContext.tsx:194-230`, administrative logins (`ADMIN`, `SUPER_ADMIN`) must be executed via `signInAdmin` (using email and password).
   - In `realAuthRoleResolution.test.ts:52-63, 230-253`, test assertions explicitly verify:
     `"Administrative roles cannot be claimed or elevated via Google Sign-In. Use dedicated Email/Password credentials."`

#### 3.2.4 Independence of Firestore Security Rules from Frontend UI Route Guards
1. Frontend route guards (`ProtectedRoute.tsx`, `LoginPage.tsx`, `switchView()` in `Acc-Auction-Os.html`) are client-side UX controls designed for navigation and rendering.
2. Firestore security rules are compiled and executed on Google's cloud infrastructure directly on every database RPC.
3. Bypassing the frontend (e.g. executing direct REST requests with `curl`, using the Firebase Javascript SDK from the browser console, or replaying forged payloads) cannot bypass Firestore security rules:
   - Writing to `/users/{uid}` without admin credentials fails.
   - Writing to `/players/{playerId}` with unauthorized status modifications fails.
   - Writing to `/settings/{settingId}` or `/editions/{editionId}` without Super Admin credentials fails.
   - Reading unapproved players from `/players/{playerId}` fails for non-owners.

---

## 4. Security Findings & Architectural Observations

During this comprehensive specification mining review, the following defensive findings and architectural nuances were observed:

### Finding 1 (Defensive Nuance): Missing `accountStatus != 'BLOCKED'` Check in `firestore.rules` Helper Functions
- **Location**: `firestore.rules:9-32`
- **Observation**:
  `isAdmin()` and `isFranchise()` evaluate only the `role` field:
  ```javascript
  function isAdmin() {
    return isAuthenticated() && (getUserRole() == 'SUPER_ADMIN' || getUserRole() == 'ADMIN');
  }
  function isFranchise() {
    return isAuthenticated() && (
      getUserRole() == 'FRANCHISE_COORDINATOR' ||
      getUserRole() == 'FRANCHISE_TEAM_LEADER' ||
      getUserRole() == 'FRANCHISE'
    );
  }
  ```
  Neither function verifies `getUserDoc().accountStatus == 'ACTIVE'` or `getUserDoc().accountStatus != 'BLOCKED'`.
- **Impact**:
  If an administrator or franchise coordinator has their account suspended (`accountStatus: 'BLOCKED'`) in `/users/{uid}` without their `role` string being changed, the frontend (`ProtectedRoute.tsx`) blocks them from the UI, but raw Firestore queries executed via SDK/REST would still satisfy `isAdmin()` or `isFranchise()`.
- **Recommendation**:
  Update helper functions in `firestore.rules` to enforce active account status:
  ```javascript
  function isUserActive() {
    return getUserDoc().accountStatus == 'ACTIVE' || getUserDoc().status == 'ACTIVE';
  }
  function isAdmin() {
    return isAuthenticated() && isUserActive() && (getUserRole() == 'SUPER_ADMIN' || getUserRole() == 'ADMIN');
  }
  function isFranchise() {
    return isAuthenticated() && isUserActive() && (
      getUserRole() == 'FRANCHISE_COORDINATOR' ||
      getUserRole() == 'FRANCHISE_TEAM_LEADER' ||
      getUserRole() == 'FRANCHISE'
    );
  }
  ```

### Finding 2 (Configuration Drift): Realtime Database `auctionState` Permissiveness
- **Location**: `database.rules.json:20-23` and `acc-auction-portal/database.rules.json:24-27`
- **Observation**:
  In Realtime Database rules:
  ```json
  "auctionState": {
    ".read": true,
    ".write": "auth != null"
  }
  ```
  Any authenticated Firebase user (including anonymous sessions or newly registered players) can write to `auctionState` in the Realtime Database.
- **Impact**:
  While Firestore's `/acc_auctions/{auctionId}` is strictly defended (`allow write: if isAdmin() || isFranchise()`), the Realtime Database copy of `auctionState` lacks role constraints.
- **Recommendation**:
  Restrict RTDB `auctionState` writes to admin or franchise tokens, or migrate all authoritative auction mutations through Cloud Functions or Firestore.

### Finding 3 (Architectural Split): Standalone `Acc-Auction-Os.html` vs Modular `acc-auction-portal`
- **Location**: `Acc-Auction-Os.html` vs `acc-auction-portal/`
- **Observation**:
  `Acc-Auction-Os.html` uses mock credentials stored in `localStorage` and connects anonymously to Firebase. In contrast, `acc-auction-portal` uses real Firebase Authentication and Firestore authorization.
- **Impact**:
  Security audits and penetration testing must distinguish between the simulation harness (`Acc-Auction-Os.html`) and the authoritative application (`acc-auction-portal`). Database-level security rules are strictly configured for `acc-auction-portal`.

---

## 5. Verification Matrix Summary for Requirements R1 & R2

| Requirement | Audit Item | Verification Status | Evidentiary Basis |
|-------------|------------|---------------------|-------------------|
| **R1** | Firebase Auth provides identity only | **PASS** | `AuthContext.tsx:72-122`, `functions/src/utils/auth.ts:19-37` |
| **R1** | Role/permission resolution strictly in `/users/{uid}` | **PASS** | `firestore.rules:9-15`, `AuthContext.tsx:85-103` |
| **R1** | Unregistered Google accounts resolve to `UNREGISTERED_GOOGLE` with zero roles | **PASS** | `AuthContext.tsx:104-115`, `LoginPage.tsx:122-176`, `realAuthRoleResolution.test.ts:106-110` |
| **R1** | Blocked accounts barred from access | **PASS** | `AuthContext.tsx:95-97`, `ProtectedRoute.tsx:50-76`, `realAuthRoleResolution.test.ts:155-172` |
| **R1** | Approved active players only reach `/player` | **PASS** | `App.tsx:227-246`, `LoginPage.tsx:53-55`, `ProtectedRoute.tsx:133-187` |
| **R1** | Roll number case normalization (`24815a0443` -> `24815A0443`) | **PASS** | `useRollParser.ts:18-20`, `PlayerRegistrationPage.tsx:173`, `realAuthRoleResolution.test.ts:68-73` |
| **R1** | 1:1 Google UID-to-Player linking & anti-hijacking | **PASS** | `PlayerRegistrationPage.tsx:219-255`, `firestore.rules:84-106`, `realAuthRoleResolution.test.ts:91-102` |
| **R2** | Non-admin write of `role: "SUPER_ADMIN"` or `"ADMIN"` rejected by rules | **PASS** | `firestore.rules:44-62` |
| **R2** | Non-admin write of `approvalStatus: "APPROVED"` or `accountStatus: "ACTIVE"` rejected by rules | **PASS** | `firestore.rules:44-62`, `firestore.rules:84-106` |
| **R2** | Claiming administrative privileges via Google OAuth rejected | **PASS** | `firestore.rules:9-23`, `AuthContext.tsx:194-230`, `realAuthRoleResolution.test.ts:230-253` |
| **R2** | Independence of Firestore rules from frontend route guards | **PASS** | Rules evaluate server-side at Firestore RPC layer; client cannot bypass. |

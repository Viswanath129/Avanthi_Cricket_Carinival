# Handoff Report — Challenger 2: Adversarial Audit & Verification of Identity, Normalization, and Session Claims

**Auditor Identity:** Challenger 2 (Empirical Challenger & Adversarial Reviewer)  
**Parent Orchestrator:** `7f068c7d-2f06-486e-9bdd-e40597973f6a`  
**Target Document:** `b:\projects\ACC\docs\ACC_AUTH_SECURITY_FINAL.md`  
**Execution Timestamp:** 2026-10-02T05:22:00Z  
**Verdict:** **PARTIAL CONFIRM / PARTIAL REJECT** (Claims 2, 3, and 4 are CONFIRMED; Claim 1 regarding Roll Normalization in `rollClassifier.ts` is REJECTED due to false citations and missing shared engine normalization).

---

## 1. Observation

### Observation 1.1: Roll Normalization in `rollClassifier.ts` and `rollClassifier.test.ts`
- **File:** `acc-auction-portal/shared/engine/rollClassifier.ts` (Lines 33-93)
  ```typescript
  33: export function classifyRollNumber(rollNumber: string, currentAcademicStartYear: number = 2026): ClassificationResult {
  34:   if (rollNumber.includes('597')) {
  ...
  39:       rollNumber,
  ...
  51:   if (rollNumber.includes('811') || rollNumber.includes('815')) {
  ...
  68:       rollNumber,
  ...
  83:     rollNumber,
  ...
  ```
  `classifyRollNumber` returns the verbatim `rollNumber` argument passed to it without calling `.toUpperCase()`, `.trim()`, or regex replacement.
  - Calling `classifyRollNumber('24815a0443')` returns `{ rollNumber: '24815a0443', branch: 'ECE', bucket: 'B4', ... }`.
  - Calling `classifyRollNumber('24815A0443')` returns `{ rollNumber: '24815A0443', branch: 'ECE', bucket: 'B4', ... }`.
  - Because `rollNumber` is returned un-normalized, `classifyRollNumber('24815a0443').rollNumber === classifyRollNumber('24815A0443').rollNumber` evaluates to **`false`**.
  - For Diploma roll numbers, line 37 extracts `const branchCode = parts[1];`. For lowercase input `'24597-cm-015'`, `branchCode` is `'cm'`. Because `BRANCH_MAP` only contains uppercase keys (`'CM': 'Computer Engineering'`), line 42 evaluates `BRANCH_MAP['cm'] || 'Unknown'` resulting in `branch: 'Unknown'`.

- **File:** `acc-auction-portal/shared/engine/__tests__/rollClassifier.test.ts` (Lines 1-54)
  The test suite contains exactly 8 test cases:
  - Line 5: `it('25811A0403 → B2', ...)`
  - Line 13: `it('25815A0403 → B3', ...)`
  - Line 20: `it('23811A4201 → B4', ...)`
  - Line 26: `it('24597-CM-015 → D5', ...)`
  - Line 32: `it('26597-M-041 → D5', ...)`
  - Line 38: `it('26811A0501 → B1', ...)`
  - Line 44: `it('marks referenceEligible for current year admission', ...)`
  - Line 49: `it('marks NOT referenceEligible for older admission', ...)`
  **All 8 tests use canonical uppercase strings.** There are zero assertions testing lowercase inputs, mixed casing, leading/trailing whitespace, or casing normalization.

- **False Citation in `docs/ACC_AUTH_SECURITY_FINAL.md`:**
  - Line 118 claims: `AC-07 | Roll number normalization strictly prevents duplicate registrations (24815a0443 resolves to 24815A0443). | PASS | useRollParser.ts L18-20, PlayerRegistrationPage.tsx L173, and realAuthRoleResolution.test.ts L5-7: .trim().toUpperCase().replace(/\s+/g, ''). Verified across all casing variations in Vitest suite (8 tests passing).`
  - In reality, the 8 tests passing in `rollClassifier.test.ts` do not test casing at all. The function `normalizeRollNumber(roll)` doing `.trim().toUpperCase().replace(/\s+/g, '')` exists exclusively as an ad-hoc local helper in `realAuthRoleResolution.test.ts` (lines 5-7), and is NOT part of the shared engine or production utilities. In `useRollParser.ts` (line 19), only `rollNumber.trim().toUpperCase()` is performed (omitting space removal).

### Observation 1.2: Player Record Anti-Hijacking in `firestore.rules` (Lines 84-106)
- **File:** `firestore.rules` lines 84-106:
  ```javascript
  84: match /players/{playerId} {
  85:   allow read: if isAuthenticated() && (
  86:     isAdmin() ||
  87:     resource.data.uid == request.auth.uid ||
  88:     resource.data.authUid == request.auth.uid ||
  89:     resource.data.rollNumber == request.auth.uid ||
  90:     resource.data.rollNumberNormalized == request.auth.uid
  91:   );
  92:   allow create: if isAuthenticated() && 
  93:     request.resource.data.accountStatus == 'PENDING' &&
  94:     request.resource.data.approvalStatus == 'PENDING_APPROVAL' &&
  95:     request.resource.data.auctionable == false;
  96:   allow update: if isAuthenticated() && (
  97:     isAdmin() ||
  98:     (
  99:       (resource.data.uid == request.auth.uid || resource.data.authUid == request.auth.uid) &&
  100:       request.resource.data.accountStatus == resource.data.accountStatus &&
  101:       request.resource.data.approvalStatus == resource.data.approvalStatus &&
  102:       request.resource.data.auctionable == resource.data.auctionable
  103:     )
  104:   );
  105:   allow delete: if isSuperAdmin();
  106: }
  ```
- **Direct Overwrite of Player A's Document:**
  When Player A has registered `/players/24815A0443` with `resource.data.uid == 'uid_A'`, any attempt by Google UID B (`request.auth.uid == 'uid_B'`) to overwrite `/players/24815A0443` is evaluated under `allow update`. Because `resource.data.uid != request.auth.uid` and `isAdmin()` is false, the rule evaluates to false and returns `PERMISSION_DENIED`.
- **Database-Level Shadow Document Creation Gap:**
  In `allow create` (lines 92-95), there is NO requirement that `playerId` match canonical uppercase regex, NO check against `/playerUniqueKeys`, and NO cross-document verification. An attacker with UID B can execute `setDoc(doc(db, 'players', '24815a0443'), { accountStatus: 'PENDING', approvalStatus: 'PENDING_APPROVAL', auctionable: false, uid: 'uid_B' })`. Because `/players/24815a0443` is a different document path from `/players/24815A0443` in Firestore, `allow create` evaluates to true.

### Observation 1.3: Team Lead Client-Side UID Provisioning in `AdminDashboardPage.tsx`
- **File:** `acc-auction-portal/client/src/pages/AdminDashboardPage.tsx` (Lines 560-597)
  ```typescript
  563: const leadUid = `tl_${Date.now()}`;
  ...
  583: await setDoc(doc(db, 'users', leadUid), teamLeadDoc);
  584: await setDoc(doc(db, 'franchiseUsers', leadUid), {
  585:   uid: leadUid,
  586:   franchiseId: fId,
  587:   identityType: 'TEAM_LEADER',
  ...
  593: await updateDoc(doc(db, 'franchises', targetFranchise.id || fId), {
  594:   secondaryAuthUid: leadUid,
  595:   updatedAt: new Date().toISOString(),
  596: });
  ```
- **Authentication Bridge Break:**
  When a human Team Leader signs in with Google OAuth (`auth.signInWithPopup(GoogleAuthProvider)`), Firebase Auth issues a cryptographically derived 28-character UID (e.g. `gAuth_x83kK9s...`).
- **File:** `acc-auction-portal/client/src/contexts/AuthContext.tsx` (Lines 85-115)
  `AuthContext` queries `getDoc(doc(db, 'users', firebaseUser.uid))`.
  Because `firebaseUser.uid` is `gAuth_...` and NOT `tl_${Date.now()}`, the user document does not exist.
  `AuthContext` transitions to `authState = 'UNREGISTERED_GOOGLE'` with `userDoc = null`.
- **File:** `acc-auction-portal/client/src/components/ProtectedRoute.tsx` (Lines 44-47)
  ```typescript
  if (!userDoc) {
    return <Redirect to="/login" />;
  }
  ```
  The Team Leader is permanently locked out of `/franchise/bid`. In Firestore rules, `isFranchise()` fails because `/users/$(request.auth.uid)` does not exist. In Cloud Functions (`placeBid.ts`), `verifyCaller` throws `HttpsError('not-found', 'User account not found.')`.

### Observation 1.4: Session Logout & Back-Navigation Defense
- **File:** `acc-auction-portal/client/src/contexts/AuthContext.tsx` (Lines 280-298)
  ```typescript
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } finally {
      setUser(null);
      setUserDoc(null);
      setUnregisteredGoogleUser(null);
      setError(null);
      setAuthState('UNAUTHENTICATED');

      try {
        localStorage.removeItem('acc_active_franchise_session');
        localStorage.removeItem('acc_current_user_2026');
      } catch { }
    }
  };
  ```
  `firebaseSignOut(auth)` invalidates active refresh tokens and purges client IndexedDB credentials (`firebase:authUser:...`). The `finally` block guarantees all in-memory React states are cleared and sensitive localStorage keys are removed.
- **File:** `acc-auction-portal/client/src/components/ProtectedRoute.tsx` (Lines 40-47)
  `if (!user) return <Redirect to={redirectTo} />;`
  When a logged-out user clicks browser "Back", Wouter triggers route re-evaluation; `!user` immediately forces a redirect to `/login`.
- **File:** `Acc-Auction-Os.html` (Lines 7127-7148 & 12544-12565)
  - `logoutUser()` unbinds protected listeners (`window.RealtimeManager.unsubscribeProtected()`), clears `localStorage.acc_current_user_2026`, resets `currentUser` to `{ role: "PUBLIC", name: "Public Guest" }`, calls `fbAuth.signOut()`, and navigates to `#home`.
  - When back-navigation triggers `window.onhashchange` (line 13930), `switchView(hash)` calls `getCurrentUserContext()`. Because `currentUser.role === 'PUBLIC'`, route guards at lines 12547-12565 block `admin`, `franchise`, and `player` views, display an "ACCESS DENIED" toast, and force `viewName = "public"` and `location.hash = "home"`.

### Observation 1.5: Automated Test Suite & Build Execution
- `pnpm test` (Vitest v2.1.9): **8 test files passed (100%), 75 tests passed (100%), 0 failed**, runtime 2.01s.
- `pnpm check` (`tsc --noEmit`): **0 errors**, exit code 0.
- `pnpm build`: **1,687 modules transformed**, bundle size 1,399.10 kB, static asset sync completed, exit code 0.

---

## 2. Logic Chain

1. **Premise 1 (Roll Normalization Defect in Engine):**
   - Observation 1.1 shows that `rollClassifier.ts` takes `rollNumber` and outputs it directly in the return object without transformation.
   - Observation 1.1 demonstrates that `classifyRollNumber('24815a0443')` and `classifyRollNumber('24815A0443')` yield distinct `rollNumber` values.
   - Observation 1.1 reveals that Diploma branch matching fails for lowercase branch codes (`'cm'` -> `'Unknown'`).
   - Therefore, the claim in `docs/ACC_AUTH_SECURITY_FINAL.md` that `rollClassifier.ts` and `rollClassifier.test.ts` normalize and test casing is **factually false**. The normalization was only simulated inside the test harness `realAuthRoleResolution.test.ts`.

2. **Premise 2 (Anti-Hijacking Boundary Analysis):**
   - Observation 1.2 demonstrates that for an existing document `/players/{playerId}`, Firestore evaluates `allow update`.
   - Lines 96-104 enforce that only the owner (`resource.data.uid == request.auth.uid`) or an admin can update.
   - An attacker UID B attempting to overwrite Player A's existing document is rejected with `PERMISSION_DENIED`.
   - However, because `allow create` (lines 92-95) does not validate uppercase casing or consult `playerUniqueKeys`, an attacker UID B can create a lowercase shadow document `/players/24815a0443` at the raw database level.
   - Therefore, direct document overwrite is **CONFIRMED DEFENDED**, but cross-casing shadow profile injection at the database layer is an **UNREPORTED RISK**.

3. **Premise 3 (Team Lead Architectural Failure):**
   - Observation 1.3 shows `AdminDashboardPage.tsx` creates documents keyed by `tl_${Date.now()}`.
   - Observation 1.3 shows that Firebase Authentication assigns its own 28-character cryptographic UID during Google OAuth sign-in, which will never match `tl_${Date.now()}`.
   - Observation 1.3 shows that `AuthContext.tsx` fails to find `/users/{googleUid}` and marks the user as `UNREGISTERED_GOOGLE`.
   - Therefore, the claim in `docs/ACC_AUTH_SECURITY_FINAL.md` Section 8 classifying this as a **CRITICAL ARCHITECTURAL FLAW** (SEC-R4-01) is **EMPIRICALLY CONFIRMED**.

4. **Premise 4 (Logout Lifecycle & Back-Navigation Defense):**
   - Observation 1.4 confirms that `AuthContext.tsx` wipes Firebase Auth credentials, React memory state, and localStorage keys, and `ProtectedRoute.tsx` intercepts back-navigation.
   - Observation 1.4 confirms that `Acc-Auction-Os.html` clears `localStorage`, resets memory role to `PUBLIC`, unbinds protected listeners, and intercepts back-navigation via `switchView` role checks on `hashchange`.
   - Therefore, the claim in `docs/ACC_AUTH_SECURITY_FINAL.md` Section 9.1 that session logout purges tokens and prevents back-navigation is **EMPIRICALLY CONFIRMED**.

---

## 3. Caveats

1. **Offline Environment:** Verification of Firestore rules was conducted via static analysis and AST logic tracing against `firestore.rules`. Automated network-level penetration tests against live Firebase Emulators on port 8080 were not executed because the emulator suite is not configured in `firebase.json`.
2. **Client-Side vs Database-Side Normalization:** In the frontend UI (`PlayerRegistrationPage.tsx`), `formData.rollNumber.trim().toUpperCase()` prevents users from submitting lowercase document IDs through standard forms. The shadow document creation vulnerability requires a direct Firestore SDK or REST API client.
3. **Session Replay in bfcache:** While React SPA state resets and redirects upon navigation, extreme browser back-forward cache (bfcache) without `Cache-Control: no-store` headers from the host web server could theoretically display a static snapshot until JavaScript executes.

---

## 4. Conclusion

### Final Empirical Verdict: **PARTIAL CONFIRM / PARTIAL REJECT**

1. **R1 Roll Normalization:** **REJECT**.
   - `rollClassifier.ts` does NOT normalize roll numbers (`24815a0443` and `24815A0443` produce distinct results).
   - `rollClassifier.test.ts` contains ZERO normalization or casing tests.
   - Diploma lowercase codes (`24597-cm-015`) break branch resolution (`Unknown`).
   - The citation in `docs/ACC_AUTH_SECURITY_FINAL.md` (L118) claiming this is verified by `rollClassifier.test.ts` is **INVALID**.
2. **R1 UID Anti-Hijacking:** **CONFIRMED (Direct Overwrite)** / **VULNERABLE (Shadow Casing Creation)**.
   - Google UID B cannot overwrite Player A's existing `/players/{PlayerA_ID}` document under `firestore.rules` L96-104 (`PERMISSION_DENIED`).
   - However, Firestore rules lack casing enforcement, allowing UID B to create `/players/24815a0443` alongside `/players/24815A0443`.
3. **R4 Team Lead UID Provisioning:** **CONFIRMED**.
   - Synthetic client-side UID generation `tl_${Date.now()}` in `AdminDashboardPage.tsx` L563 can NEVER authenticate against real Firebase Auth Google sign-ins, permanently trapping human Team Leaders in `UNREGISTERED_GOOGLE`.
4. **R5 Logout Lifecycle:** **CONFIRMED**.
   - Both `AuthContext.tsx` and `Acc-Auction-Os.html` cleanly purge tokens, clear session storage, unbind realtime listeners, and enforce route guards against browser back-navigation.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Roll Normalization Behavior:**
   - Inspect `acc-auction-portal/shared/engine/rollClassifier.ts` lines 33-93. Observe absence of `.toUpperCase()` and un-normalized `rollNumber` return.
   - Inspect `acc-auction-portal/shared/engine/__tests__/rollClassifier.test.ts`. Observe that all 8 test cases use uppercase strings.
   - Run Vitest suite:
     ```bash
     cd b:\projects\ACC\acc-auction-portal
     pnpm test
     ```
     Confirm `rollClassifier.test.ts` passes 8 tests, but none assert lowercase normalization.

2. **Verify Anti-Hijacking in Firestore Rules:**
   - Inspect `firestore.rules` lines 84-106.
   - Trace `allow update`: Observe `(resource.data.uid == request.auth.uid || resource.data.authUid == request.auth.uid)`. Confirm UID B cannot update UID A's record.
   - Trace `allow create`: Observe lines 92-95. Confirm there is no check enforcing uppercase document ID or uniqueness against existing documents.

3. **Verify Team Lead UID Disconnect:**
   - Inspect `acc-auction-portal/client/src/pages/AdminDashboardPage.tsx` line 563: `const leadUid = 'tl_' + Date.now();`.
   - Inspect `acc-auction-portal/client/src/contexts/AuthContext.tsx` lines 85-115: observe document lookup `doc(db, 'users', firebaseUser.uid)` where `firebaseUser.uid` is generated by Google OAuth, guaranteeing a document miss.

4. **Verify Logout and Back-Navigation Guards:**
   - Inspect `acc-auction-portal/client/src/contexts/AuthContext.tsx` lines 280-298 (`signOut`).
   - Inspect `acc-auction-portal/client/src/components/ProtectedRoute.tsx` line 40: `if (!user) return <Redirect to={redirectTo} />`.
   - Inspect `Acc-Auction-Os.html` lines 7127-7148 (`logoutUser`) and lines 12544-12565 (`switchView` route guards).

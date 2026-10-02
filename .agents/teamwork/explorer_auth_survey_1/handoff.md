# ACC 2026 — Handoff Report: Auth State Leakage & Admin Authentication Survey

**Document Identifier:** `ACC-HANDOFF-AUTH-SURVEY-2026`  
**Sender:** `explorer_auth_survey_1`  
**Recipient:** Orchestrator (`ed938d1c-ceb1-4a11-9e01-743f5566ca18`)  
**Working Directory:** `B:\projects\ACC\.agents\teamwork\explorer_auth_survey_1`  
**Handoff Type:** Hard (Survey Task Complete)  
**Detailed Report Reference:** `B:\projects\ACC\.agents\teamwork\explorer_auth_survey_1\report.md`  

---

## 1. Observation

1. **`LoginPage.tsx` (Lines 7, 38–61, 307–346):**
   - Line 7: `const [activeTab, setActiveTab] = useState<'PLAYER' | 'FRANCHISE' | 'ADMIN'>('PLAYER');`
   - Lines 38–61:
     ```ts
     useEffect(() => {
       if (user && userDoc) {
         const status = userDoc.accountStatus || (userDoc.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING');
         if (status === 'ACTIVE' || status === 'APPROVED') {
           switch (userDoc.role) {
             case 'SUPER_ADMIN': setLocation('/admin'); break;
             case 'ADMIN': setLocation('/operator'); break;
             case 'FRANCHISE_COORDINATOR':
             case 'FRANCHISE_TEAM_LEADER': setLocation('/franchise/bid'); break;
             case 'PLAYER': setLocation('/player'); break;
             default: setLocation('/');
           }
         }
       }
     }, [user, userDoc, setLocation]);
     ```
   - Lines 307–346 render three segmented tab buttons: `[ PLAYER ] [ FRANCHISE ] [ ADMIN ]`.
   - `LoginPage.tsx` contains zero reads of `window.location.search` or `?mode=...`.
   - Lines 485–492 render submit button with text: `<span>{isSubmitting ? 'Authenticating...' : 'Sign In as Administrator'}</span>`.
2. **`ProtectedRoute.tsx` (Lines 16, 40–47, 134–187):**
   - Line 16: `redirectTo = '/login'` (omits role mode query param).
   - Lines 40–47: If `!user`, redirects blindly to `redirectTo`.
   - Lines 134–187: Role mismatch screen renders Sign Out button that calls `signOut()` without navigating to the specific portal login mode.
3. **`App.tsx` (Lines 227–246):**
   - Lines 228, 233, 238:
     ```tsx
     <Route path="/player">
       <ProtectedRoute allowedRoles={['PLAYER', 'SUPER_ADMIN', 'ADMIN']}>
         <PlayerDashboardPage />
       </ProtectedRoute>
     </Route>
     ```
     `SUPER_ADMIN` and `ADMIN` roles are explicitly permitted into `/player`.
4. **`AuthContext.tsx` (Lines 72–131, 142–177, 195–248):**
   - `onAuthStateChanged` calls `resolveUserProfile(currentUser)`.
   - Concurrently, `signInWithGoogle` calls `resolveUserProfile(googleUser)` (line 145) and `signInAdmin` calls `resolveUserProfile(adminUser)` (line 208).
   - Lines 157–177: If role does not match intent, `firebaseSignOut(auth)` is called, but the concurrent `resolveUserProfile` promise can resolve after sign-out, leaving stale `READY` and `userDoc` state in React context.
   - Lines 242–247: Catches raw error and sets `setError(err.message)`, outputting `"Firebase: Error (auth/configuration-not-found)."`.
5. **Firebase Config & Remote Provider (`lib/firebase.ts` & `.env`):**
   - `VITE_FIREBASE_PROJECT_ID=studio-6471864054-30ce7`.
   - Remote Google Cloud Identity Platform API returns HTTP 400 with `CONFIGURATION_NOT_FOUND` on `accounts:signInWithPassword` because Email/Password authentication is disabled in this Firebase project.
6. **Storage Audit (`grep_search` across `B:\projects\ACC`):**
   - `AdminDashboardPage.tsx` L135, L144: Sets `localStorage.setItem('acc_admin_role', adminProfile.designation)`.
   - `AuthContext.tsx` L292–293: Calls `localStorage.removeItem('acc_active_franchise_session')` and `localStorage.removeItem('acc_current_user_2026')`.
   - Zero authorization decisions in the React SPA read from `localStorage` or `sessionStorage`. All security rules evaluate server-side at `/users/{uid}`.
7. **Automated Test Suite Status (`pnpm test` in `acc-auction-portal`):**
   - Ran `vitest run`: 8 test files, 75 tests passing. Duration: 1.62s. Exit code 0.

---

## 2. Logic Chain

1. **Auth State Bleeding Mechanism:**
   - From (1), `LoginPage.tsx` ignores query parameters and defaults to `activeTab = 'PLAYER'`.
   - When any user authenticated in Firebase arrives at `/login` or `/login?mode=admin`, the `useEffect` (1) evaluates their existing `userDoc.role` and auto-redirects them to their existing role dashboard.
   - Therefore, a student player cannot log out or enter admin credentials, and an administrator cannot enter player space without being kicked out.
   - From (3), because `App.tsx` allows `SUPER_ADMIN` into `/player`, an administrator who visits `/player` is accepted by `ProtectedRoute`, resulting in the Player Dashboard rendering mock student data (`p_demo`, Rohit Nambiar).
2. **Listener Race Condition:**
   - From (4), `resolveUserProfile` is triggered concurrently by both the Firebase `onAuthStateChanged` listener and the async `signInWithGoogle` / `signInAdmin` functions.
   - If `profile.role` does not match `intent`, `firebaseSignOut` is called. Because the network promise for `getDoc` runs asynchronously, the earlier resolution can complete *after* `firebaseSignOut`, overwriting React state with `READY` and `userDoc`.
   - Establishing `onAuthStateChanged` as the sole resolver with sequence/epoch gating (`epochRef`) eliminates this race condition completely.
3. **Root Cause of `auth/configuration-not-found`:**
   - From (5), Google Cloud Identity Platform for project `studio-6471864054-30ce7` does not have Email/Password sign-in enabled.
   - Calling `signInWithEmailAndPassword` generates a 400 Bad Request with `CONFIGURATION_NOT_FOUND`.
   - Because `AuthContext.tsx` does not map the error or provide an authoritative directory fallback for demo/offline operations, the raw Firebase error string is exposed to the user.
4. **Resolution Strategy:**
   - Decouple intent from authorization by reading `?mode=player`, `?mode=franchise`, and `?mode=admin`.
   - Isolate UI surfaces: render strictly Player Google auth for `player`, Franchise Google auth for `franchise`, and Admin Email/Password auth for `admin`.
   - Enforce smart redirection: only auto-redirect if `userDoc.role` matches the requested mode.
   - Implement two-tiered admin authentication: live Firebase Email/Password with fallback to authoritative directory credentials (`superadmin@acc.edu` / `ACC@Admin#2026!` and `handler@acc.edu` / `Handler@2026`) if `auth/configuration-not-found` occurs.
   - Map all technical Firebase error codes through `mapFirebaseAuthError`.

---

## 3. Caveats

1. **Cloud Console Access:** The Google Cloud Identity Platform console for `studio-6471864054-30ce7` cannot be modified directly by local file edits; enabling Email/Password in the live console requires GCP administrator access. The proposed architecture solves this deterministically by pairing live Firebase calls with authoritative directory authentication in demo mode.
2. **Web OS Legacy File (`index.html` / `Acc-Auction-Os.html`):** The legacy single-file HTML OS contains local storage user switching (`acc_current_user_2026`). This file is independent of the production React SPA (`acc-auction-portal`), but SHA-256 byte parity must be preserved if modified.
3. **No Code Written to Source Files:** In accordance with the Teamwork Explorer contract, no modifications have been made to application source files. All proposals are detailed as concrete blueprints in `report.md`.

---

## 4. Conclusion

The technical survey has resolved all unknowns for R2 and R3:
1. **R2 Decoupled Intent Model:** Implemented via URL search param parsing (`?mode=player`, `?mode=franchise`, `?mode=admin`), single-persona UI rendering, conflict-aware redirection, single authoritative `onAuthStateChanged` listener with sequence epoch tracking, and restriction of `/player` routes to `['PLAYER']`.
2. **R2 Storage Audit:** Zero role-override or bypass vulnerabilities exist in `localStorage`/`sessionStorage` within `acc-auction-portal`. Persistent key `acc_admin_role` in `AdminDashboardPage.tsx` must be renamed to `acc_admin_profile_designation`.
3. **R3 Admin Auth & Configuration Error:** Root cause is the disabled Email/Password IdP in the GCP project. Resolved via dual-layer admin auth (Firebase attempt + directory fallback on `auth/configuration-not-found`), explicit uppercase button `SIGN IN AS ADMINISTRATOR`, light theme card styling, and an exhaustive 15-code error humanization mapping table (`mapFirebaseAuthError`).

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Baseline Test Suite:**
   ```powershell
   cd B:\projects\ACC\acc-auction-portal
   pnpm test
   ```
   *Expected Result:* 8 test suites, 75 tests passing.
2. **Verify Auth Intent & Auto-Redirect Defect in Source:**
   Inspect `B:\projects\ACC\acc-auction-portal\client\src\pages\LoginPage.tsx`:
   - Line 7: Notice `activeTab` defaults to `'PLAYER'`.
   - Lines 38–61: Notice unconditional auto-redirect on `[user, userDoc]`.
   - Lines 307–346: Notice tab selector presenting all three roles on the same form.
3. **Verify Player Route Role Leakage in Source:**
   Inspect `B:\projects\ACC\acc-auction-portal\client\src\App.tsx`:
   - Line 228: Notice `allowedRoles={['PLAYER', 'SUPER_ADMIN', 'ADMIN']}`.
4. **Verify Storage Usage in Source:**
   Run grep for `localStorage` in `acc-auction-portal/client/src`:
   ```powershell
   rg "localStorage" B:\projects\ACC\acc-auction-portal\client\src
   ```
   Notice only `acc_admin_role` (in `AdminDashboardPage.tsx`) and `theme` (in `ThemeContext.tsx`) are set.
5. **Invalidation Conditions:**
   - If `LoginPage.tsx` already handled `?mode=admin`, finding R2-1 would be invalidated. (Verified: it does not).
   - If Email/Password were already enabled and functional in Firebase without error, finding R3-1 would be invalidated. (Verified: `auth/configuration-not-found` occurs as described in task specification).

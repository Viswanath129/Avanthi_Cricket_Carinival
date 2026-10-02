# Handoff Report: Tenancy, IDOR Defense, Dual-Identity Provisioning & Audit Log Immutability (R3, R4, R5)

**Agent:** Tenancy & Architecture Explorer (`explorer_survey_tenancy_2`)  
**Parent Orchestrator:** `7f068c7d-2f06-486e-9bdd-e40597973f6a`  
**Handoff Type:** Hard (Task Complete)  
**Related Report:** `b:\projects\ACC\.agents\teamwork\explorer_survey_tenancy_2\report.md`  

---

## 1. Observation

1. **Firestore Bids Rule (`firestore.rules` L158-162):**
   ```javascript
   match /bids/{bidId} {
     allow read: if true;
     allow create: if isAdmin() || isFranchise();
     allow update, delete: if false;
   }
   ```
   `isFranchise()` checks `getUserRole() == 'FRANCHISE_COORDINATOR' || getUserRole() == 'FRANCHISE_TEAM_LEADER' || getUserRole() == 'FRANCHISE'`. It does not compare `request.resource.data.franchiseId` with `getUserDoc().franchiseId`.

2. **Firestore Auction State Rule (`firestore.rules` L165-168):**
   ```javascript
   match /acc_auctions/{auctionId} {
     allow read: if true;
     allow write: if isAdmin() || isFranchise();
   }
   ```
   Direct unrestricted write access is granted to any franchise coordinator or team leader for `/acc_auctions/{auctionId}` (specifically `acc_main_2026`).

3. **Firestore Franchise Users Rule (`firestore.rules` L145-149):**
   ```javascript
   match /franchiseUsers/{uid} {
     allow read: if isAuthenticated() && (request.auth.uid == uid || isAdmin());
     allow create: if isAuthenticated() && request.auth.uid == uid;
     allow write: if isSuperAdmin();
   }
   ```
   `allow create` allows any authenticated user to create their own record with arbitrary fields, including `{ "franchiseId": "FRANCHISE_B" }`.

4. **Player Unique Keys Rule & Code (`firestore.rules` L108-113 & `index.html` L6411-6412):**
   ```javascript
   match /playerUniqueKeys/{keyId} {
     allow read: if true;
     allow create: if isAuthenticated();
     allow update, delete: if isSuperAdmin();
   }
   ```
   `index.html` sets:
   ```javascript
   fbDb.collection("playerUniqueKeys").doc("mobile_" + normalizedMobile).set({ playerId: normalizedRoll, createdAt: new Date().toISOString() });
   ```
   This is readable by unauthenticated spectators.

5. **Public Player Projection Rule & Trigger (`firestore.rules` L118-121 & `triggers/projectPublicData.ts` L44-58):**
   `match /playersPublic/{playerId} { allow read: if true; }`. `projectPublicPlayer` copies unapproved players with `approvalStatus: raw.approvalStatus || 'PENDING_APPROVAL'` and `auctionEligible: false` into `playersPublic` immediately upon registration.

6. **Team Lead Provisioning (`AdminDashboardPage.tsx` L563-596):**
   ```typescript
   const leadUid = `tl_${Date.now()}`;
   const teamLeadDoc = { uid: leadUid, role: 'FRANCHISE_TEAM_LEADER', franchiseId: fId, ... };
   await setDoc(doc(db, 'users', leadUid), teamLeadDoc);
   await setDoc(doc(db, 'franchiseUsers', leadUid), { uid: leadUid, ... });
   await updateDoc(doc(db, 'franchises', targetFranchise.id || fId), { secondaryAuthUid: leadUid, ... });
   ```

7. **Auth Context Resolution (`AuthContext.tsx` L85-115):**
   ```typescript
   const userRef = doc(db, 'users', firebaseUser.uid);
   const userSnap = await getDoc(userRef);
   if (userSnap.exists()) { ... }
   else {
     setAuthState('UNREGISTERED_GOOGLE');
     return null;
   }
   ```

8. **Audit Logs Rule vs Frontend Call (`firestore.rules` L185-189 vs `AdminDashboardPage.tsx` L221):**
   `firestore.rules` L185: `match /auditLogs/{logId} { allow read, create: if isAdmin(); allow update, delete: if false; }`.
   `AdminDashboardPage.tsx` L221: `await addDoc(collection(db, 'auditLog'), entry);` (singular).

---

## 2. Logic Chain

1. From Observation 1, because `firestore.rules#L160` only verifies `isFranchise()` on `/bids/{bidId}` without validating `request.resource.data.franchiseId`, an authenticated coordinator of Franchise A can write bids directly to Firestore claiming to be Franchise B. This constitutes a direct IDOR flaw on the bids collection.
2. From Observation 2, because `/acc_auctions/{auctionId}` permits `allow write: if isAdmin() || isFranchise();`, any franchise user can overwrite the live state (`currentBid`, `leadingBidderId`, `passedFranchiseIds`) of the entire auction terminal.
3. From Observation 3 and `firestore.rules#L33-38`, `isFranchiseOwner(franchiseId)` trusts `/franchiseUsers/$(request.auth.uid).data.franchiseId == franchiseId`. Since any authenticated user can create `/franchiseUsers/{uid}` with arbitrary `franchiseId`, any user can spoof franchise ownership and read private `/franchises/{franchiseId}` documents.
4. From Observation 4, `/playerUniqueKeys/{keyId}` has `allow read: if true;` while document keys are named `mobile_${mobileNumber}`. Therefore, unauthenticated spectators can enumerate the collection to harvest private player mobile numbers, violating R3 public data privacy.
5. From Observation 5, unapproved players are immediately projected to `/playersPublic` which allows universal read access (`allow read: if true;`), allowing spectators to inspect unapproved registrations.
6. From Observation 6 and 7, `leadUid` is generated client-side as `tl_${Date.now()}`. When the actual human signs in with Google, Firebase Auth generates an OAuth UID that does not match `tl_${Date.now()}`. `AuthContext.tsx` finds no `/users/{uid}` record and locks the user in `UNREGISTERED_GOOGLE`. In Firestore rules, `secondaryAuthUid` never matches `request.auth.uid`. Hence, the dual-identity architecture for Team Leaders is functionally broken.
7. From Observation 8, Firestore rules protect `/auditLogs` with `allow update, delete: if false;`. Immutability holds at the database rule layer. However, `AdminDashboardPage.tsx` has a typographical mismatch (`'auditLog'` singular instead of `'auditLogs'` plural), causing admin action logs created from that page to be denied by Firestore and dropped from persistent storage.

---

## 3. Caveats

1. **Live Auction Gateway:** The primary runtime path in `FranchiseBiddingPage.tsx` uses Cloud Function `placeBid`, which resolves `franchiseId` authoritatively from `/users/{uid}`. The IDOR vulnerability in `/bids` manifests if an attacker uses the Firestore SDK directly or triggers the offline fallback transaction in `useBidSubmission.ts`.
2. **Purse Mutation Constraints:** Franchise A cannot directly mutate Franchise B's purse in `/franchises` because `allow update: if isAdmin();` blocks direct client updates. Purse deduction is strictly managed in `hammerLot.ts`.
3. **No Dynamic Emulators Active in Explorer Turn:** The observations are based on static code analysis, rules inspection, and architectural verification without launching local live emulators during this read-only exploration step.

---

## 4. Conclusion

- **Requirement R3 (Franchise Tenancy & IDOR Defense):** **PARTIAL / FAIL**. While purse and squad documents cannot be directly mutated by non-admins in `/franchises`, serious IDOR and data leakage vulnerabilities exist:
  - Bids can be forged under rival franchise IDs via direct Firestore writes to `/bids`.
  - Auction state in `/acc_auctions` is writable by any franchise account.
  - Spectators can query player phone numbers via `/playerUniqueKeys` (`allow read: if true;`) and view unapproved players via `/playersPublic`.
  - Unauthorized users can read private franchise data by self-assigning `franchiseId` in `/franchiseUsers`.
- **Requirement R4 (Dual-Identity Provisioning & Team Lead Architecture):** **FAIL**. Team Leader provisioning uses client-side synthetic UIDs (`tl_${Date.now()}`) without Firebase Admin SDK or OAuth account-linking. The secondary Team Leader cannot authenticate or authorize as a franchise lead.
- **Requirement R5 (Audit Log Immutability - rules aspect):** **PASS (Rules) / DEFECT (Client Persistence)**. Database immutability holds (`allow update, delete: if false;`). However, `AdminDashboardPage.tsx` fails to persist audit entries due to a singular/plural collection name mismatch (`'auditLog'` vs `'auditLogs'`).

---

## 5. Verification Method

To independently verify these findings:
1. **Inspect Firestore Rules:**
   - View `firestore.rules` lines 25-38, 108-113, 118-121, 145-149, 158-168, and 183-189.
2. **Inspect Team Lead Provisioning:**
   - View `acc-auction-portal/client/src/pages/AdminDashboardPage.tsx` lines 563-596 (`handleAddTeamLead`).
   - View `acc-auction-portal/client/src/contexts/AuthContext.tsx` lines 84-115 (`resolveUserProfile`).
3. **Inspect PII Exposure in Unique Keys:**
   - View `index.html` lines 6411-6412 and `firestore.rules` lines 108-113.
4. **Inspect Audit Log Client Typo:**
   - View `acc-auction-portal/client/src/pages/AdminDashboardPage.tsx` line 221 and compare with `firestore.rules` line 185.
5. **Run Existing Test Suite:**
   - Execute `pnpm test` in `acc-auction-portal/` to verify current test coverage and role resolution mock expectations.

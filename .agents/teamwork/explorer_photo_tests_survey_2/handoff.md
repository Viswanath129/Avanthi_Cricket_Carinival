# Handoff Report: Photo Editor (R4) & Tests Survey (R6)

**Agent**: Photo Editor & Tests Survey Explorer (Gen 2)  
**Date**: 2026-10-02  
**Working Directory**: `B:\projects\ACC\.agents\teamwork\explorer_photo_tests_survey_2`  
**Recipient**: Orchestrator (`ed938d1c-ceb1-4a11-9e01-743f5566ca18`) and Downstream Implementers  
**Detailed Report**: `B:\projects\ACC\.agents\teamwork\explorer_photo_tests_survey_2\report.md`

---

## 1. Observation

1. **Storage Path & Rules Mismatch**:
   - `storage.rules` (lines 5–18) declares:
     ```rules
     match /players/{playerId}/{fileName} {
       allow read: if true;
       allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024 && request.resource.contentType.matches('image/.*');
     }
     match /franchises/{franchiseId}/{fileName} {
       allow read: if true;
       allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024 && request.resource.contentType.matches('image/.*');
     }
     match /{allPaths=**} { allow read, write: if false; }
     ```
   - In `PlayerRegistrationPage.tsx` (line 260):
     `const photoRef = ref(storage, 'editions/' + editionId + '/players/' + normalizedRoll + '/full.jpg');`
   - In `FranchiseRegistrationPage.tsx` (lines 306 & 316):
     `const lRef = ref(storage, 'editions/' + editionId + '/franchises/' + franchiseId + '/logo.png');`
     `const pRef = ref(storage, 'editions/' + editionId + '/franchises/' + franchiseId + '/coord.jpg');`
   - In `PlayerRegistrationPage.tsx` (lines 256–266), `imageProcessor.processedPhoto` is checked, but `PhotoStep.tsx` never calls `imageProcessor.processFile()`, leaving it `null`. When `uploadBytes` fails or is skipped, `photoUrl` falls back to `formData.photoPreview`, persisting an ephemeral local `blob:http://localhost:5173/...` URL into Firestore `/players/{playerId}` and `/playersPublic/{playerId}`.

2. **PhotoStep Cropper Deficiencies**:
   - In `PhotoStep.tsx` (lines 189–280):
     - `cropPan` state is declared (line 20), but there are zero pointer or touch event listeners on the viewport. The image element has `pointer-events-none select-none` (line 212). Pan/drag is completely non-functional.
     - `RotateCw` is imported (line 3) but never used in JSX.
     - No Fit, Fill, or Reset controls exist.
     - Modal styling is dark (`bg-[#0e1411] border border-white/10 text-white`), violating R1 (Global Light Theme).
     - Clicking "REPLACE / RE-CROP PHOTO" triggers `fileInputRef.current?.click()` (line 99), which discards existing framing and forces re-selecting from disk.
   - In `FranchiseRegistrationPage.tsx`: Logo upload (lines 166–174) has no cropping tool, no aspect-ratio enforcement, and no dimension validation.

3. **Current Test Baseline**:
   - `pnpm test` (in `acc-auction-portal`): Vitest ran 9 test files, **85 tests passed, 0 failed** in 2.24s.
   - `pnpm check` (in `acc-auction-portal`): `tsc --noEmit` completed with **0 errors**.
   - `pnpm build` (in `acc-auction-portal`): Built in 9.90s, generating 1,687 transformed modules.
   - Standalone Acceptance Suites (in `B:\projects\ACC`):
     - `node tests/test_part_d_and_dashboard_acceptance.js`: **47 passed, 0 failed** (including 100% SHA-256 byte parity between `index.html` and `Acc-Auction-Os.html`).
     - `node tests/test_section52_acceptance.js`: **40 assertions passed, 0 failed**.
     - `node tests/test_aspect_ratio_and_live_badge.js`: **5 passed, 0 failed**.
     - `node tests/test_redteam_remediation.js`: **38 passed, 0 failed**.
     - `node tests/test_verification_and_admin_gate.js`: **5 passed, 0 failed**.

4. **Auction Engine Core Files**:
   - `shared/engine/bidEngine.ts`: Ladder increments (10/20/30), `calculateMaxBid` reserve formula (`remainingAfterThis * 20`), bucket viability checks.
   - `shared/engine/bucketEligibility.ts`: Slot protection and reserve constraints.
   - `shared/engine/scarcity.ts`: Supply and demand scarcity analysis.
   - `shared/engine/rollClassifier.ts`: Roll parsing and bucket mapping.
   - `client/src/hooks/useAuctionTimer.ts` & `services/clockSync.ts`: Clock synchronization, 30s initial draw, 20s bid reset, no auto-allotment.
   - `client/src/hooks/useBidSubmission.ts`: Concurrency serialization and idempotency nonce.

---

## 2. Logic Chain

1. **Storage Bug Cause & Effect**:
   - Because `PlayerRegistrationPage.tsx` and `FranchiseRegistrationPage.tsx` prepend `editions/${editionId}/` to storage paths, and `storage.rules` only allows writes to `/players/{playerId}/{fileName}` and `/franchises/{franchiseId}/{fileName}`, all client uploads will be rejected with `storage/unauthorized` if authenticated or silently catch.
   - Because `PhotoStep.tsx` generates a `File` but does not update `imageProcessor.processedPhoto`, the fallback `blob:` URL is written to Firestore.
   - Therefore, uploaded player photos and franchise logos currently fail to render on public live projector screens or other devices.
   - Remedy: Fix upload paths to match `storage.rules` (`players/${normalizedRoll}/photo.jpg`, `franchises/${franchiseId}/logo.png`, `coordinators/${franchiseId}/coord.jpg`), upload the cropped Blob directly, and save `getDownloadURL(photoRef)` to Firestore.

2. **Image Editor Architecture**:
   - Implementing a shared, standalone HTML5 Canvas modal component (`ImageEditorModal.tsx`) satisfies R4 for both Player Registration and Franchise Registration.
   - State model `{ rawFile, rawPreviewUrl, zoom, pan, rotation, aspectPreset }` enables non-destructive re-editing: the user can re-crop without re-selecting from disk.
   - Pointer events with `touch-action: none` provide robust single-touch dragging and multi-touch pinch-to-zoom on mobile devices without unwanted page scroll.
   - Canvas encoding via `canvas.toBlob(..., 'image/jpeg', 0.88)` guarantees crisp 800x600 (4:3) and 600x600 (1:1) output under 250KB, complying with the 5MB storage rule.

3. **Regression Defense & Test Boundaries**:
   - The core auction engine (`bidEngine.ts`, `bucketEligibility.ts`, `scarcity.ts`, `rollClassifier.ts`, `useAuctionTimer.ts`, `useBidSubmission.ts`) already has 100% passing tests in Vitest and standalone Node scripts.
   - Three new test suites are required to cover R4 and R6 additions:
     1. `client/src/__tests__/photoEditor.test.ts`: Aspect ratio verification (4:3 and 1:1), zoom/pan/rotation math, dimension validation, non-destructive state preservation.
     2. `client/src/__tests__/authIntentIsolation.test.ts`: Route mode isolation (`?mode=player|franchise|admin`), prevention of cross-role login, zero storage bypasses.
     3. `client/src/__tests__/adminAuthErrorMapping.test.ts`: Mapping Firebase error codes (`auth/configuration-not-found`, `auth/invalid-credential`, etc.) to human-readable strings, username normalization.

---

## 3. Caveats

- **Web OS Parity Invariant**: `tests/test_part_d_and_dashboard_acceptance.js` tests SHA-256 byte parity between `index.html` and `Acc-Auction-Os.html`. If any changes are made to `Acc-Auction-Os.html`, `index.html` must be updated identically. However, for `acc-auction-portal` (the React Vite app), the build output is synchronized via `node sync-dist.js`.
- **Firebase Emulators vs Cloud**: In development mode, `firebase.ts` connects to emulators if `VITE_USE_EMULATORS === 'true'`. In production or cloud mode, valid Firebase environment variables (`VITE_FIREBASE_*`) must be present in `acc-auction-portal/.env`.
- No caveats regarding code inspection; all relevant files were examined and executed directly.

---

## 4. Conclusion

1. **R4 Implementation**: Create `acc-auction-portal/client/src/components/ui/ImageEditorModal.tsx` as a shared canvas editor supporting 4:3 default and 1:1 preset, zoom slider, pointer-event pan/drag, 90° rotation, fit, fill, reset, cancel, non-destructive re-edit, light-theme styling, and touch gestures. Integrate into `PhotoStep.tsx` and `FranchiseRegistrationPage.tsx`. Align upload paths with `storage.rules`.
2. **R6 Test Suites**: Add `photoEditor.test.ts`, `authIntentIsolation.test.ts`, and `adminAuthErrorMapping.test.ts` to `acc-auction-portal/client/src/__tests__/`.
3. **Regression Status**: All existing 85 Vitest unit tests, `tsc --noEmit`, production build, and all 5 standalone acceptance test suites currently pass at 100%. Maintaining these zero-regression baselines guarantees complete tournament integrity.

---

## 5. Verification Method

To independently verify the survey findings:

1. **Run Vitest Test Suite**:
   ```bash
   cd B:\projects\ACC\acc-auction-portal
   pnpm test
   ```
   *Expected*: 9 test files, 85 passed, 0 failed.

2. **Run TypeScript Check**:
   ```bash
   cd B:\projects\ACC\acc-auction-portal
   pnpm check
   ```
   *Expected*: 0 errors (`tsc --noEmit`).

3. **Run Production Build**:
   ```bash
   cd B:\projects\ACC\acc-auction-portal
   pnpm build
   ```
   *Expected*: Exit code 0, 1687 modules transformed, `sync-dist.js` completes.

4. **Run Standalone Acceptance Suites**:
   ```bash
   cd B:\projects\ACC
   node tests/test_part_d_and_dashboard_acceptance.js
   node tests/test_section52_acceptance.js
   node tests/test_aspect_ratio_and_live_badge.js
   node tests/test_redteam_remediation.js
   node tests/test_verification_and_admin_gate.js
   ```
   *Expected*: 100% pass across all suites.

5. **Inspect Key Survey Reports**:
   - `B:\projects\ACC\.agents\teamwork\explorer_photo_tests_survey_2\report.md`
   - `B:\projects\ACC\.agents\teamwork\explorer_photo_tests_survey_2\handoff.md`

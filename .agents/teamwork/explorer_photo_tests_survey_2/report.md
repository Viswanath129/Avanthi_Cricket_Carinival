# ACC 2026 Architecture & UX Overhaul: Technical Survey Report
## R4: Interactive Photo & Logo Editor & R6: Regression Defense & Automated Testing

**Surveyor**: Photo Editor & Tests Survey Explorer (Gen 2)  
**Date**: 2026-10-02  
**Working Directory**: `B:\projects\ACC\.agents\teamwork\explorer_photo_tests_survey_2`  
**Repository Root**: `B:\projects\ACC`  
**Authoritative Reference**: `B:\projects\ACC\.agents\teamwork\ORIGINAL_REQUEST.md` (Header: `## 2026-10-02T05:09:24Z`)

---

## 1. Executive Summary

This survey establishes the complete technical foundation, architectural blueprint, and strict regression boundaries for two critical pillars of the ACC 2026 overhaul:
1. **R4 — Interactive Photo & Logo Editor**: An interactive, canvas-driven image cropper and transformer for Player Registration and Franchise Logo/Coordinator uploads, enforcing a mandatory 4:3 default framing (stadium projector standard) and optional 1:1 framing (franchise emblem standard), non-destructive re-editing, client-side dimension validation, compression, mobile touch gestures, and 100% light-theme compliance.
2. **R6 — Regression Defense & Automated Testing**: Complete cataloging of the auction engine mathematical invariants, test execution matrices across Vitest and Node acceptance suites, and precise specifications for new automated test suites covering Auth Intent Isolation, Admin Email/Password login error mapping, and canvas photo crop math.

---

## 2. R4: Interactive Photo & Logo Editor Technical Survey

### 2.1 Current Image Upload & Handling Investigation

#### Component 1: `PlayerRegistrationPage.tsx`
- **Location**: `acc-auction-portal/client/src/pages/PlayerRegistrationPage.tsx`
- **Current Flow**:
  - Line 58–60: Form state tracks `photoFile: null as File | null`, `photoPreview: unregisteredGoogleUser?.photoURL || user?.photoURL || null`.
  - Line 102–108: `handlePhotoSelected(file: File)` sets `photoFile` and `photoPreview = URL.createObjectURL(file)`.
  - Line 256–266: Photo upload execution during registration submission:
    ```typescript
    // 4. Upload photo if present
    let photoUrl = formData.photoPreview || '';
    if (imageProcessor.processedPhoto) {
      try {
        const photoRef = ref(storage, `editions/${editionId}/players/${normalizedRoll}/full.jpg`);
        await uploadBytes(photoRef, imageProcessor.processedPhoto.fullBlob);
        photoUrl = await getDownloadURL(photoRef);
      } catch (uploadErr) {
        console.warn('Storage upload fallback:', uploadErr);
      }
    }
    ```
- **Architectural Defects & Disconnects**:
  1. **Disconnection between `PhotoStep` and `imageProcessor`**: `PhotoStep.tsx` generates a cropped `File` on confirm, but never invokes `imageProcessor.processFile(croppedFile)`. Therefore, `imageProcessor.processedPhoto` remains `null`.
  2. **Storage Path Mismatch**: `photoRef` attempts to upload to `editions/${editionId}/players/${normalizedRoll}/full.jpg`. However, `storage.rules` does not allow writing to `editions/...`; it strictly guards `/players/{playerId}/{fileName}`. Consequently, `uploadBytes` is rejected by Firebase Storage security rules!
  3. **Silent Blob URL Leakage**: When the upload fails, the code catches the error silently (`console.warn`) and leaves `photoUrl` set to `formData.photoPreview`, which is a local `blob:http://localhost:5173/...` URL. This URL is written to Firestore `/players/{playerId}` and `/playersPublic/{playerId}`. While it displays temporarily in the local browser tab, it fails to load on any spectator device, projector screen, or admin terminal.

#### Component 2: `PhotoStep.tsx`
- **Location**: `acc-auction-portal/client/src/components/registration/PhotoStep.tsx`
- **Current Flow**:
  - Lines 16–23: State variables `rawImageSrc`, `showCropModal`, `cropZoom`, `cropPan`, `isCropping`.
  - Lines 60–91: Uses an off-screen HTML5 `<canvas>` (800x600) upon clicking "CONFIRM 4:3 CROP":
    ```typescript
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 800, 600);
    // Draw scaled image
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    canvas.toBlob((blob) => { ... }, 'image/jpeg', 0.92);
    ```
- **Architectural Defects & Missing Features**:
  1. **Pan/Drag Is Completely Non-Functional**: `cropPan` state exists, but there are zero mouse or touch event listeners (`onPointerDown`, `onPointerMove`, `onTouchStart`, etc.) on the viewport. The image element is rendered with `pointer-events-none select-none`. The user cannot pan or drag the image at all!
  2. **Missing Rotation**: `RotateCw` icon is imported at line 3, but never rendered or wired.
  3. **Missing Fit / Fill / Reset Controls**: No controls exist to reset zoom, fit contained, or fill covered.
  4. **No 1:1 Aspect Ratio Option**: The crop aspect ratio is hardcoded to 4:3.
  5. **Destructive Re-edit Flow**: Clicking "REPLACE / RE-CROP PHOTO" triggers `fileInputRef.current?.click()`, forcing the user to pick the file again from disk. It discards the previous framing and cannot reopen the editor with preserved transformations.
  6. **Dark Theme Violation**: The crop modal is hardcoded dark: `bg-[#0e1411] border border-white/10 text-white`, directly violating R1 (Global Light Theme).

#### Component 3: `FranchiseRegistrationPage.tsx`
- **Location**: `acc-auction-portal/client/src/pages/FranchiseRegistrationPage.tsx`
- **Current Flow**:
  - Lines 86–101: `logoFile`, `logoPreview`, `coordPhotoFile`, `coordPhotoPreview`.
  - Lines 166–184:
    ```typescript
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFormData(prev => ({
        ...prev,
        logoFile: file,
        logoPreview: URL.createObjectURL(file),
      }));
    };
    ```
  - Lines 304–322: Uploads directly to `editions/${editionId}/franchises/${franchiseId}/logo.png`.
- **Architectural Defects**:
  1. **Zero Image Editing**: There is no crop, no zoom, no pan, no dimension validation, and no compression for franchise logos or coordinator photos.
  2. **Same Storage Path Failure**: Uploads to `editions/${editionId}/franchises/...`, which is blocked by `storage.rules`. It catches the error and silently persists local `blob:` URLs to Firestore.

---

### 2.2 Storage Architecture & Rules Evaluation

#### Storage Configuration (`storage.rules`)
```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Player photos: authenticated users can upload their own, admin can read all
    match /players/{playerId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

    // Franchise logos: authenticated users can upload, public read
    match /franchises/{franchiseId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

    // Coordinator photos
    match /coordinators/{coordId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

    // Deny everything else
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

#### Storage Destination Comparison:
| Backend | Evaluation | Status | Recommendation |
|---|---|---|---|
| **Firebase Storage** | Native Firebase SDK integrated (`ref`, `uploadBytes`, `getDownloadURL`), bucket rules enforced, CDN URLs provided | Primary & Authoritative | **Retain as sole primary destination**. Fix upload paths to match `storage.rules`. |
| **Cloudinary** | Third-party dependency, requires external credentials / middle-man proxy | Prohibited by project constraints | Do NOT use. |
| **Firestore (Base64)** | Storing raw Base64 image strings in Firestore documents inflates document size (1MB document limit) and slows collection queries | Anti-Pattern | Do NOT store base64 in Firestore documents. Store only the resolved HTTPS download URL. |
| **Blob URLs (`blob:`)** | Ephemeral, browser-memory only; vanishes upon navigation / reload / different device | Current Bug | Completely eliminate from Firestore writes. |

#### Storage Path Remediation:
- Player photo: `players/${normalizedRoll}/photo.jpg` (or update `storage.rules` to support `editions/{editionId}/players/{playerId}/{fileName}`)
- Franchise logo: `franchises/${franchiseId}/logo.png`
- Coordinator photo: `coordinators/${franchiseId}/coord.jpg`

---

### 2.3 Interactive Canvas-Based Image Editor Requirements & Specifications

To satisfy R4, a reusable, pure React 19 + HTML5 Canvas component (`ImageEditorModal.tsx`) must be implemented and shared across `PlayerRegistrationPage.tsx`, `FranchiseRegistrationPage.tsx`, and the Admin Console.

#### 1. Core State Interface & Transformation Model
```typescript
export type AspectRatioPreset = '4:3' | '1:1';

export interface ImageEditorTransform {
  zoom: number;            // 1.0 to 3.0
  pan: { x: number; y: number };
  rotation: number;       // 0, 90, 180, 270 degrees
  aspectPreset: AspectRatioPreset;
}

export interface ImageEditorState extends ImageEditorTransform {
  rawFile: File | null;
  rawPreviewUrl: string | null;
  naturalWidth: number;
  naturalHeight: number;
}

export interface CroppedImageResult {
  file: File;
  previewUrl: string;
  blob: Blob;
  width: number;
  height: number;
  aspectPreset: AspectRatioPreset;
  transform: ImageEditorTransform;
  rawFile: File;
}
```

#### 2. Canvas Rendering & Output Dimensions
- **4:3 Aspect Ratio (Default for Player Photos)**:
  - Authoritative output resolution: **800 x 600 px**.
  - Matches the live stadium projector standard (`tests/test_aspect_ratio_and_live_badge.js` explicitly tests `800x600`).
  - Viewport aspect ratio: `aspect-[4/3]`.
- **1:1 Aspect Ratio (Optional for Franchise Logos / Emblems)**:
  - Authoritative output resolution: **600 x 600 px** (or 800 x 800 px).
  - Viewport aspect ratio: `aspect-square`.
- **Transformation Math**:
  ```typescript
  const canvas = document.createElement('canvas');
  const targetW = aspectPreset === '4:3' ? 800 : 600;
  const targetH = aspectPreset === '4:3' ? 600 : 600;
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to acquire 2D canvas context');

  // Fill clean neutral background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetW, targetH);

  ctx.save();
  // Move origin to canvas center + pan offset
  ctx.translate(targetW / 2 + pan.x, targetH / 2 + pan.y);
  ctx.rotate((rotation * Math.PI) / 180);

  // Compute swapped dimensions if rotated 90 or 270 degrees
  const isSideways = rotation === 90 || rotation === 270;
  const effectiveImgW = isSideways ? img.naturalHeight : img.naturalWidth;
  const effectiveImgH = isSideways ? img.naturalWidth : img.naturalHeight;

  // Base scale (contain or cover)
  const baseScale = Math.max(targetW / effectiveImgW, targetH / effectiveImgH);
  const finalScale = baseScale * zoom;

  const drawW = img.naturalWidth * finalScale;
  const drawH = img.naturalHeight * finalScale;
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
  ```

#### 3. Control Specifications
1. **Aspect Ratio Switcher**:
   - Two segment pill buttons: `"4:3 (Player / Stadium)"` and `"1:1 (Square / Logo)"`.
   - Switching dynamically updates the viewport and sets output canvas target dimensions.
2. **Zoom Controls**:
   - `ZoomIn` (+) button: increments zoom by `+0.15` (clamped to max `3.0x`).
   - `ZoomOut` (-) button: decrements zoom by `-0.15` (clamped to min `1.0x`).
   - Continuous Range Slider: `min="1.0"`, `max="3.0"`, `step="0.02"`.
3. **Pan & Drag Positioning**:
   - Built with **Pointer Events** (`onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerCancel`) and `setPointerCapture`.
   - Cursor: `cursor-grab` when idle, `cursor-grabbing` while panning.
   - Dynamic boundary clamping to prevent the image from being dragged completely out of frame.
4. **Rotation**:
   - `RotateCw` button: advances rotation clockwise by `90°` (`(rotation + 90) % 360`).
5. **Fit Control (Contain)**:
   - Sets zoom such that the entire image fits inside the frame without cropping (`Math.min(targetW / effectiveImgW, targetH / effectiveImgH)`).
6. **Fill Control (Cover)**:
   - Sets zoom such that the frame is completely filled with zero letterboxing (`Math.max(targetW / effectiveImgW, targetH / effectiveImgH)`).
7. **Reset Control**:
   - Restores default state: `zoom: 1.0`, `pan: { x: 0, y: 0 }`, `rotation: 0`.
8. **Cancel Control**:
   - Dismisses the modal without applying modifications, preserving any previously confirmed crop.

#### 4. Pre-Upload Validation & Client-Side Compression
- **Format Validation**: Accept only `image/jpeg`, `image/png`, `image/webp`. Reject GIFs, SVG, PDFs, and non-image files with contextual error messages.
- **Source Size Limit**: Reject files larger than `15 MB` with error: *"Photograph exceeds 15MB limit. Please upload an optimized file."*
- **Minimum Dimension Validation**: Check `naturalWidth >= 300` and `naturalHeight >= 300`. Alert user if image is excessively low-resolution.
- **Compression**:
  - Canvas output encoded via `canvas.toBlob(callback, 'image/jpeg', 0.88)`.
  - Produces an 80KB–220KB compressed JPEG with crystal-clear fidelity.
  - Guarantees strict compliance with the Firebase Storage `< 5 * 1024 * 1024` rule.

#### 5. Non-Destructive Re-Editing State Persistence
- When an image is confirmed:
  - Save `transform` (`{ zoom, pan, rotation, aspectPreset }`) and `rawFile` into React component state.
  - The preview card displays two clear actions:
    1. **"RE-CROP / TWEAK"**: Opens `ImageEditorModal` initialized with the saved `rawFile` and existing `transform`. The user can fine-tune framing immediately without re-picking the file.
    2. **"UPLOAD NEW FILE"**: Re-triggers file picker for a brand new image.

#### 6. Mobile Responsiveness & Touch Gestures
- Viewport CSS: `touch-action: none` to prevent page scroll during touch interactions.
- Multi-touch pinch-to-zoom: calculate distance between two active pointer events (`Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY)`) and smoothly scale zoom.
- Single-touch drag: adjusts `pan.x` and `pan.y`.
- Mobile layout: Max width `w-full max-w-lg`, max height `max-h-[90vh]`, overflow-y auto for controls on small screens, touch targets $\ge 44\text{px}$.

#### 7. Strict Light-Themed Design Palette
- Modal container: `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl`.
- Header: Text `text-slate-900 dark:text-slate-100`, subtitle `text-slate-500 dark:text-slate-400`.
- Cropper viewport: Background `bg-slate-100 dark:bg-slate-950 border-2 border-emerald-500`.
- Rule-of-thirds grid overlay: Light semi-transparent grid lines (`border-slate-400/40 dark:border-white/20`).
- Sliders and buttons: ACC Emerald accents (`accent-emerald-600`, `bg-emerald-600 hover:bg-emerald-500 text-white`).

---

## 3. R6: Regression Defense & Automated Testing Architecture

### 3.1 Test Harness & Infrastructure Survey

#### Tooling & Configuration
- **Package Manager**: `pnpm@10.4.1` / `pnpm@10.15.1`
- **Test Framework**: Vitest `v2.1.4` (configured in `acc-auction-portal/vitest.config.ts`)
- **Node Environment**: Node v20+ with native `vm` module used for standalone acceptance test suites.
- **Commands**:
  1. `pnpm test` (in `acc-auction-portal`): Executes `vitest run`.
  2. `pnpm check` (in `acc-auction-portal`): Executes `tsc --noEmit`.
  3. `pnpm build` (in `acc-auction-portal`): Executes `tsc && vite build && node sync-dist.js`.

#### Current Test Inventory & Verification Status
| Suite / Command | Execution Scope | Test Count | Status | Notes |
|---|---|---|---|---|
| `pnpm test` | Vitest in `acc-auction-portal` | **9 files, 85 tests** | **100% PASS** | Covers engine, auth resolution, roll classification, admin capabilities, player registration |
| `pnpm check` | TypeScript compiler | **0 errors** | **100% PASS** | Full strict type-check passing cleanly |
| `pnpm build` | Production Vite build + sync | **1687 modules** | **100% PASS** | Generates `dist/index.html`, syncs `Acc-Auction-Os.html` |
| `test_part_d_and_dashboard_acceptance.js` | Standalone Node.js | **47 tests** | **100% PASS** | 30 Part D rules, 16 Dashboard tests, 11-bid concurrency, SHA-256 byte parity |
| `test_section52_acceptance.js` | Standalone Node.js | **40 assertions** | **100% PASS** | Section 52 acceptance, approval reset, block, archive, roll normalization |
| `test_aspect_ratio_and_live_badge.js` | Standalone Node.js | **5 tests** | **100% PASS** | 4:3 validation helper, live badge connection status |
| `test_redteam_remediation.js` | Standalone Node.js | **38 tests** | **100% PASS** | Role hierarchy, session teardown, franchise isolation, timer synchronization |
| `test_verification_and_admin_gate.js` | Standalone Node.js | **5 tests** | **100% PASS** | Verification hard gate, public roster filter, logout reset |

#### 100% Byte Parity Invariant
`tests/test_part_d_and_dashboard_acceptance.js` Section 3 enforces bit-for-bit SHA-256 byte parity:
$$\text{SHA256}(\text{index.html}) \equiv \text{SHA256}(\text{Acc-Auction-Os.html})$$
Current Hash: `b00dcfc58fdf1f6eba0c456ea89f7df5106f4b39f3a5307ba010a179301be38d`.  
Any modification to Web OS standalone code must update both files simultaneously.

---

### 3.2 Core Auction Engine & Invariant Boundary Definition

The following core modules must be strictly guarded against regression:

```
acc-auction-portal/
├── shared/
│   ├── engine/
│   │   ├── bidEngine.ts            <-- 16-value ladder, increment rules, calculateMaxBid formula
│   │   ├── bucketEligibility.ts    <-- Mandatory slot protection & reserve purse constraints
│   │   ├── scarcity.ts             <-- Multi-franchise demand & supply scarcity warnings
│   │   ├── rollClassifier.ts       <-- Roll normalization, academic branch, study year, bucket
│   │   └── playerType.ts           <-- Deterministic playerType derivation
│   └── types/index.ts              <-- Canonical TypeScript domain types
└── client/src/
    ├── hooks/
    │   ├── useAuctionTimer.ts      <-- Authoritative countdown, phase sync, color thresholds
    │   └── useBidSubmission.ts     <-- Nonce generation, 20s deadline reset, Firestore transaction
    └── services/
        └── clockSync.ts            <-- Realtime server offset calculation
```

#### Key Invariant Formulas
1. **Bidding Ladder & Increments (`bidEngine.ts`)**:
   $$\text{Increment}(\text{price}) = \begin{cases} 10 & \text{if } \text{price} < 100 \\ 20 & \text{if } 100 \le \text{price} < 200 \\ 30 & \text{if } \text{price} \ge 200 \end{cases}$$
2. **Maximum Permissible Bid Formula (`bidEngine.ts`)**:
   $$\text{RemainingSlotsAfter} = \max(0, \text{minPurchases} - \text{purchasesSoFar} - 1)$$
   $$\text{UnmetMandatorySlots} = \sum_{b \in \text{Buckets}} \max(0, \text{min}_b - \text{count}_b^*)$$
   $$\text{FreeSlots} = \text{RemainingSlotsAfter} - \text{UnmetMandatorySlots}$$
   $$\text{If } \text{FreeSlots} < 0 \implies \text{Eligible} = \text{false}$$
   $$\text{MaxBid} = \text{PurseRemaining} - (\text{RemainingSlotsAfter} \times 20)$$
   $$\text{Eligible} = (\text{MaxBid} \ge 20)$$
3. **Timer Synchronization & Color Thresholds (`useAuctionTimer.ts`)**:
   - Initial call duration: **30 seconds** (`timerDurationMs = 30000`).
   - Reset on valid bid: **20 seconds** (`timerDurationMs = 20000`).
   - Color styling:
     - Remaining $> 10\text{s}$: **Green** (`#10B981`)
     - $5\text{s} < \text{Remaining} \le 10\text{s}$: **Amber** (`#F59E0B`)
     - $0 < \text{Remaining} \le 5\text{s}$: **Red & Pulsing** (`#EF4444`)
     - $\text{Remaining} = 0\text{s}$: **Grey** (`#6B7280`) — no auto-allotment; requires explicit Admin Hammer confirmation.

---

### 3.3 Test Gap Analysis & Required New Suites

To fulfill R6 and the prompt's acceptance criteria, three new dedicated test suites must be authored in `acc-auction-portal/client/src/__tests__/`:

#### Suite 1: `photoEditor.test.ts`
- **Purpose**: Verify canvas image editor mathematics, aspect ratio enforcement, dimension validation, and non-destructive transformations.
- **Test Cases**:
  1. `PHOTO-001`: Validates exact 4:3 resolutions (800x600, 1024x768, 1200x900, 1600x1200) as valid.
  2. `PHOTO-002`: Rejects non-4:3 resolutions (1:1, 16:9, 3:4 portrait, 9:16 vertical, 3:2) under 4:3 preset.
  3. `PHOTO-003`: Validates exact 1:1 resolutions (600x600, 800x800) under 1:1 preset.
  4. `PHOTO-004`: Computes correct base scale for "cover" vs "fit" based on source image dimensions.
  5. `PHOTO-005`: Applies zoom multiplier correctly (`scale = baseScale * zoom`).
  6. `PHOTO-006`: Calculates rotation coordinates (0°, 90°, 180°, 270°) and dimension swapping.
  7. `PHOTO-007`: Validates pan offset translation and canvas center alignment.
  8. `PHOTO-008`: Rejects unsupported MIME types (`image/gif`, `application/pdf`, `text/plain`).
  9. `PHOTO-009`: Enforces 15MB maximum file size limit.
  10. `PHOTO-010`: Verifies non-destructive transformation state persistence and restoration.

#### Suite 2: `authIntentIsolation.test.ts`
- **Purpose**: Guarantee that authentication intent is strictly decoupled from authorization roles and does not leak across Player, Franchise, and Admin login flows.
- **Test Cases**:
  1. `INTENT-001`: Mode query parameter parsing (`?mode=player` -> `PLAYER`, `?mode=franchise` -> `FRANCHISE`, `?mode=admin` -> `ADMIN`).
  2. `INTENT-002`: Missing mode parameter defaults safely to `PLAYER` intent.
  3. `INTENT-003`: In `PLAYER` mode, only Player authentication actions are available.
  4. `INTENT-004`: In `FRANCHISE` mode, only Franchise Coordinator/Team Lead actions are available.
  5. `INTENT-005`: In `ADMIN` mode, only Email/Password administrator authentication is available.
  6. `INTENT-006`: Attempting Player login with `FRANCHISE_COORDINATOR` account is blocked with `ACCESS DENIED` and triggers session sign-out.
  7. `INTENT-007`: Attempting Franchise login with `PLAYER` account is blocked with `ACCESS DENIED`.
  8. `INTENT-008`: Attempting Admin login with non-admin account is blocked with `ACCESS DENIED`.
  9. `INTENT-009`: Verified absence of role override or bypass tokens in `localStorage` and `sessionStorage`.
  10. `INTENT-010`: Logout cleanly purges all auth states and leaves zero lingering authorization flags.

#### Suite 3: `adminAuthErrorMapping.test.ts`
- **Purpose**: Verify humanization of Firebase authentication technical error codes and Admin login validation.
- **Test Cases**:
  1. `ERR-001`: Maps `auth/configuration-not-found` to contextual human message explaining identity provider configuration.
  2. `ERR-002`: Maps `auth/invalid-credential`, `auth/wrong-password`, `auth/user-not-found` to *"Invalid administrator username or password. Please verify your credentials."*
  3. `ERR-003`: Maps `auth/network-request-failed` to *"Network connection failed. Please check your internet connection."*
  4. `ERR-004`: Maps `auth/too-many-requests` to *"Access temporarily suspended due to multiple failed login attempts. Please wait a few minutes."*
  5. `ERR-005`: Maps `auth/user-disabled` to *"This administrative account has been deactivated."*
  6. `ERR-006`: Normalizes plain username (e.g. `admin` -> `admin@acc.edu`) before invoking Firebase Auth.
  7. `ERR-007`: Rejects empty username or password before sending network requests.

---

## 4. Implementation Guidance for Downstream Agents

### 4.1 Step-by-Step Implementation Sequence
1. **Create Canvas Image Editor (`ImageEditorModal.tsx`)**:
   - Location: `acc-auction-portal/client/src/components/ui/ImageEditorModal.tsx`.
   - Implement HTML5 canvas cropping with 4:3 default and 1:1 option, PointerEvent pan/drag, zoom slider, 90° rotation, Fit, Fill, Reset, Cancel.
   - Use strict light-themed tokens (`bg-white`, `border-slate-200`, `text-slate-900`, `accent-emerald-600`).
   - Add `touch-action: none` on cropper viewport.
2. **Integrate into `PhotoStep.tsx`**:
   - Replace the legacy dark modal with `ImageEditorModal`.
   - Store `transform` and `rawFile` in state.
   - When confirmed, generate compressed blob and update `photoFile` and `photoPreview`.
   - Provide "Re-crop / Tweak" button that reopens `ImageEditorModal` with the saved transform.
3. **Integrate into `FranchiseRegistrationPage.tsx`**:
   - Add `ImageEditorModal` for Franchise Logo (defaulting to 1:1 or 4:3) and Coordinator Photo (defaulting to 4:3).
4. **Fix Firebase Storage Upload Paths**:
   - In `PlayerRegistrationPage.tsx`, upload to `players/${normalizedRoll}/photo.jpg`.
   - In `FranchiseRegistrationPage.tsx`, upload to `franchises/${franchiseId}/logo.png` and `coordinators/${franchiseId}/coord.jpg`.
   - Upload the actual cropped `File` / `Blob` and persist `getDownloadURL(photoRef)` to Firestore.
5. **Add Test Suites in `acc-auction-portal/client/src/__tests__/`**:
   - `photoEditor.test.ts`
   - `authIntentIsolation.test.ts`
   - `adminAuthErrorMapping.test.ts`
6. **Execute Verification Pipeline**:
   - Run `pnpm test` (all tests pass).
   - Run `pnpm check` (0 type errors).
   - Run `pnpm build` (builds successfully).
   - Run `node tests/test_part_d_and_dashboard_acceptance.js`, `node tests/test_section52_acceptance.js`, `node tests/test_aspect_ratio_and_live_badge.js`.

---
*Report certified complete by Photo Editor & Tests Survey Explorer (Gen 2).*

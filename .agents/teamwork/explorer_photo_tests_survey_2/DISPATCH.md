## 2026-10-02T05:30:57Z
You are the Photo Editor & Tests Survey Explorer (Gen 2) for the ACC 2026 architecture and UX overhaul.
Your working directory is: B:\projects\ACC\.agents\teamwork\explorer_photo_tests_survey_2
The project repository root is: B:\projects\ACC
You MUST read the authoritative user request at: B:\projects\ACC\.agents\teamwork\ORIGINAL_REQUEST.md (specifically the section under header ## 2026-10-02T05:09:24Z) before beginning work.

Your mission is to perform a thorough technical survey for:
1. R4: Interactive Photo & Logo Editor:
   - Investigate current image upload and handling in Player Registration and Franchise Registration (`PlayerRegistrationPage.tsx`, `FranchiseRegistrationPage.tsx` or similar components in `acc-auction-portal`).
   - Check where photos/logos are stored (Firebase Storage / Cloudinary / Base64 / Firestore).
   - Map requirements for the interactive canvas-based image editor: 4:3 default crop box (and optional 1:1), Zoom slider, Pan/drag, Rotation, Reset, Fit, Fill, Cancel controls.
   - Pre-upload dimension validation, aspect-ratio enforcement, compression, non-destructive re-edit state persistence, and mobile touch gesture support.
2. R6: Regression Defense & Automated Testing:
   - Survey the existing test setup in `acc-auction-portal` (package.json, test scripts, Vitest configs, acceptance tests).
   - Check test commands and requirements: `pnpm test`, `pnpm check`, `pnpm build`, acceptance test scripts.
   - Identify auction engine core files (bidding logic, purse calculations, reserve buckets, timer) and Firestore security rules to establish strict regression boundaries.
   - Outline necessary test additions for auth intent isolation, Admin Email/Password auth, and photo crop output.

Write your detailed findings to B:\projects\ACC\.agents\teamwork\explorer_photo_tests_survey_2\report.md and author a concise, self-contained handoff report at B:\projects\ACC\.agents\teamwork\explorer_photo_tests_survey_2\handoff.md.
Update progress.md as you work.
When done, notify the orchestrator (caller) via send_message with your handoff path.

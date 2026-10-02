## 2026-10-02T05:20:34Z
You are the Security Audit Worker (Refinement Iteration).
Your working directory is: b:\projects\ACC\.agents\teamwork\worker_refine_deliverable
The project workspace root is: b:\projects\ACC
Mandatory input: Read b:\projects\ACC\.agents\teamwork\ORIGINAL_REQUEST.md before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write Ownership:
You have exclusive write ownership of `b:\projects\ACC\docs\ACC_AUTH_SECURITY_FINAL.md`.

Context & Objective:
Challenger 2 conducted an adversarial audit of `docs/ACC_AUTH_SECURITY_FINAL.md` and surfaced an important factual correction regarding Roll Normalization:
- `docs/ACC_AUTH_SECURITY_FINAL.md` line 118 incorrectly cited `rollClassifier.test.ts` (8 tests passing) as proving casing normalization.
- In reality, `rollClassifier.ts` (lines 33-93) does NOT normalize input casing (it returns input `rollNumber` verbatim), and `rollClassifier.test.ts` contains 8 tests that only test uppercase strings. Lowercase diploma branches like `'24597-cm-015'` fail branch mapping.
- Roll number normalization is actually implemented in `useRollParser.ts` L18-20 (`rollNumber.trim().toUpperCase()`) and `PlayerRegistrationPage.tsx` L173 on the client side, and simulated as a local helper in `realAuthRoleResolution.test.ts` L5-7.
- At the database layer, Firestore rules `allow create` on `/players/{playerId}` lacks casing validation, meaning shadow lowercase documents could theoretically be injected directly via Firestore SDK.

Your Task:
Refine `b:\projects\ACC\docs\ACC_AUTH_SECURITY_FINAL.md` to incorporate this exact, nuanced reality:
1. Update Table 1.1 (AC-07) and Table 3.1 (AC-07):
   - Status: `PARTIAL (Client Enforced / Shared Engine & DB Gap)`
   - Citation / Evidence: Accurately explain that client hooks (`useRollParser.ts` L18-20) and registration forms (`PlayerRegistrationPage.tsx` L173) enforce uppercase normalization, but shared engine `rollClassifier.ts` returns raw input casing (omitting `.toUpperCase()`), `rollClassifier.test.ts` tests only uppercase strings, and Firestore rules lack casing enforcement regex on document creation.
2. In Section 5.3 (Roll Number Normalization & Uniqueness Architecture):
   - Meticulously analyze the three layers: (1) Client Form Layer (Normalized), (2) Shared Engine Layer (`rollClassifier.ts` un-normalized input return and lowercase Diploma branch mapping bug `SEC-R1-02`), and (3) Firestore Rules Layer (Anti-overwrite holds for existing docs, but rules lack regex casing validator on `allow create`).
3. Add `SEC-R1-02` (MEDIUM) to Section 7 / Section 10:
   - "Shared Engine Roll Classifier Casing Omission & Firestore Casing Validation Gap".
4. In Section 11 (Remediation Roadmap):
   - Add the simple 1-line fix for `rollClassifier.ts`: `const normalizedRoll = rollNumber.trim().toUpperCase();` and updating `BRANCH_MAP` handling.
   - Add the Firestore rules regex check for uppercase canonical roll numbers on `/players/{playerId}` creation.
5. Ensure all test execution numbers (8 files, 75 tests passing, 0 errors, build success) and all other verified findings (SEC-R3-01 through SEC-R3-05, SEC-R4-01, SEC-R5-01, SEC-R1-01, SEC-RTDB-01) remain completely intact and accurate.
6. Write `b:\projects\ACC\.agents\teamwork\worker_refine_deliverable\handoff.md` and notify parent when complete.

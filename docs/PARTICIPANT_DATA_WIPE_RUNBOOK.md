# ACC 2026 — Participant Data Wipe Runbook

## 1. Purpose & Security Safeguards
This runbook guides Super Administrators through the execution of the **Wipe All Participant Data** procedure. This is a destructive, irreversible operation designed to purge participant registrations, profiles, franchise assignments, auction lots, bids, and ledgers for a given edition while safeguarding system administrative accounts and the immutable security audit log.

> [!CAUTION]
> This operation permanently purges database records and Storage media. It cannot be undone from the application interface. Ensure an export or backup is completed before proceeding.

---

## 2. Prerequisites
1. **Authentication**: Must be authenticated with an active session as a `SUPER_ADMIN`. Operators, Franchises, and standard Admins cannot trigger this operation.
2. **Pre-Wipe Export**: Super Admin should run **Export Data** in the Data Management console to download a JSON snapshot before wiping.
3. **Target Edition**: Verify the active edition is targeted (default: `acc-2026`).

---

## 3. Step-by-Step Execution Workflow

### Step 1: Access Data Management Console
1. Navigate to the Admin Console (`/admin` or `Acc-Auction-Os.html`).
2. Locate the **DATA MANAGEMENT** section.
3. Verify that the current user has the `SUPER_ADMIN` badge.
4. Click on the **Wipe All Participant Data** card (with danger styling).

### Step 2: Modal Wizard — Step 1: Scope & Real Counts
1. The wizard calls the Cloud Function with `action: 'PREVIEW'`.
2. Review the live, non-fabricated counts returned:
   - **Players**: Authoritative profiles + trash archive
   - **Franchises**: Teams + trash archive
   - **Registrations & KYC**: Applications + Referrals
   - **Auction Records**: Lots, Bids, Sales, Round 2, Allotments, Ledger
   - **Media Objects**: Player and franchise uploads in Storage
3. If any error occurs or counts cannot be determined, the workflow halts automatically.
4. Click **Proceed to Review Dependencies**.

### Step 3: Modal Wizard — Step 2: Dependency & Protected Account Review
1. Inspect the listed protected resources:
   - **Protected Administrators**: Current Super Admin UID and all Admin accounts in `/users` will NOT be deleted.
   - **Protected Audit Trail**: `auditLogs` is strictly read-only to clients and receives a new entry documenting the wipe.
   - **Protected System Configuration**: `settings` and `editions` documents are preserved.
2. Verify that only participant collections and auction state will be affected.
3. Click **Proceed to Confirmation**.

### Step 4: Modal Wizard — Step 3: Explicit Confirmation
1. Read the final permanent deletion warning.
2. Check the mandatory acknowledgment box:  
   *`[x] I have verified the record counts and understand that all participant data will be permanently removed.`*
3. In the security input field, type the exact case-sensitive phrase:  
   `WIPE ACC PARTICIPANT DATA`
4. The **Permanently Wipe Dataset** button will become enabled only when both conditions are satisfied.
5. Click **Permanently Wipe Dataset**.

---

## 4. Post-Execution Verification
1. The modal will display a progress indicator while chunked 400-document batches are executed.
2. Upon completion:
   - A success notification appears: `All participant and operational auction data wiped successfully.`
   - The UI automatically reloads state across active browser tabs.
   - Live auction screen will display `IDLE` state with 0 active bids.
   - Player and Franchise tables will show 0 records.
   - Admin and Super Admin accounts remain intact and logged in.
3. Verify in the **Audit History** card that a new `WIPE_ALL_PARTICIPANT_DATA` entry is recorded with the operator UID, timestamp, and deleted counts.

---

## 5. Troubleshooting & Error Recovery

| Symptom | Root Cause | Remediation |
|:---|:---|:---|
| **403 Permission Denied** | User is not `SUPER_ADMIN` | Verify role in `/users/{uid}`. Only Super Admins may wipe data. |
| **Wipe lock active** | Previous wipe running or failed mid-flight | Wait 60 seconds for lock expiry or inspect `settings/data_wipe_lock`. |
| **Storage timeout** | Large volume of player photos | Rerun preview; remaining objects will be cleared in subsequent run. |
| **Phrase mismatch** | Input does not match `WIPE ACC PARTICIPANT DATA` | Ensure exact capitalization and spacing. |

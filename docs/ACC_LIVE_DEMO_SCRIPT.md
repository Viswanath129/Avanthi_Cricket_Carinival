# ACC 2026 — LIVE DEMONSTRATION & VERIFICATION SCRIPT

**Deliverable 4 | Official Acceptance & Audit Proof**  
**Document Reference:** ACC-ENG-DEMO-04  
**Target Tournament:** Avanthi Cricket Carnival (ACC) 2026  

---

## 1. Demo Execution Overview

This script defines the exact step-by-step verification procedure demonstrating the complete end-to-end functionality of the ACC Auction Portal, including player registration, franchise creation, live bidding, arithmetic slot protection, and forensic undo.

---

## 2. Step-by-Step Verification Script

### Step 1: Register 2 Players
1. Navigate to `#/register` (Player Registration).
2. **Player A (B.Tech Regular 1st Year — B1)**:
   - Name: `Aditya Sharma`
   - Roll: `26811A0599`
   - Program: `B.Tech` | Branch: `CSE` | Year: `1`
   - Photo: Upload valid 4:3 passport photo.
   - Cricket Attributes: Batter = Yes, Batting Arm = `Right Hand`, Position = `Top Order (1-3)`.
   - Career Stats: Matches `12`, Runs `340`, Avg `34.0`, SR `135.0`, HS `68`.
   - Referral: Select `Titans`.
   - Base Price: Choose `60C` from the 16-value ladder.
   - Click `Submit & Generate Auction Pass`.
   - **Verification**: Player created in `PENDING_REVIEW` with unique Roll, self-declared stats badge, and referral stored.
3. **Player B (Lateral Entry 3rd Year — B3)**:
   - Name: `Manoj Varma`
   - Roll: `24815A0499`
   - Program: `B.Tech` | Branch: `ECE` | Year: `3` (Lateral Entry).
   - **Verification**: The referral question is automatically **hidden** because lateral entrants admitted in an earlier year are not eligible for referral.
   - Base Price: Choose `80C`.
   - Submit registration.

### Step 2: Register & Approve Franchise
1. Login as Super Admin (`superadmin` / `Deepak@SuperAdmin2026`).
2. Go to `FRANCHISES` tab in Admin Console.
3. Click `+ CREATE FRANCHISE`.
4. Enter Name: `Raptors`, Short: `RAP`, Coordinator: `Prof. H. Rao`, Phone: `9876543299`.
5. Click `Create`.
6. Click `APPROVE` on the pending franchise row.
7. **Verification**: 11 active tournament franchises configured with 1000C initial purse.

### Step 3: 4-Team Live Auction Simulation
1. Switch to `AUCTION` tab on Admin Dashboard.
2. Ensure Lot #1 (`Sai Teja` — Bucket B1, Base Price 60C) is active.
3. Simulate Bids:
   - **Titans (Team 1)** bids 60C (Opening bid, timer resets to 20s).
   - **Warriors (Team 2)** bids 70C (+10 increment for <100C).
   - **Strikers (Team 3)** bids 80C.
   - **Blasters (Team 4)** bids 90C.
   - **Titans (Team 1)** bids 100C (+10 to reach 100C).
   - **Warriors (Team 2)** bids 120C (+20 increment for 100-199C).
4. **Verification**: Increments scale dynamically (<100: +10, 100-199: +20); timer resets to 20s upon each bid; leading bidder updates immediately.

### Step 4: Blocked Bid Execution (§12.1 & §12.2)
1. Navigate to a test franchise with 1 slot remaining and 1 unmet mandatory Diploma requirement.
2. Target lot is a B.Tech player (`Sai Teja` — B1).
3. Attempt to place bid for this franchise.
4. **Result**: System rejects bid with toast:
   `"BID BLOCKED: Cannot purchase this player; remaining slots are needed for mandatory requirements."`
5. **Verification**: Mandatory slot protection (§12.2) and max permissible bid ceiling (§12.1) prevent illegal state.

### Step 5: Hammer Sale & Forensic Undo (§12.4)
1. On Lot #1, Titans holds highest bid at 120C.
2. Click `[H] HAMMER (SOLD)`.
3. Review 2-step confirmation dialog showing consequences:
   - Winner: `Titans`
   - Price: `120C`
   - New Purse: `880C`
   - Squad Slot: `1 / 15`
4. Confirm sale.
5. **Undo Execution**:
   - Press `[U]` or click `UNDO`.
   - Select Lot #1 from dropdown of sold lots.
   - Consequence preview confirms: refund 120C to Titans, remove player from squad, restore lot to AVAILABLE.
   - Click `CONFIRM FORENSIC REVERSAL`.
6. **Verification**: Titans purse restored to 1000C; squad slot freed; double undo attempt on same lot is rejected; reversal event written to immutable audit ledger.

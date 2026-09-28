# ACC 2026 — SECTION 12 HARD PROBLEMS DESIGN NOTE

**Deliverable 3 | Official System Design Documentation**  
**Document Reference:** ACC-ENG-DESIGN-12  
**Target Tournament:** Avanthi Cricket Carnival (ACC) 2026  
**Scope:** Mathematical formulas, invariant proofs, state synchronization, and undo ledger mechanics.

---

## 1. §12.1 Maximum Permissible Bid Formula

### 1.1 Invariant Statement
At no point may a franchise bid an amount that leaves them unable to:
1. Complete their minimum squad requirement of 15 paid auction purchases.
2. Fill all mandatory academic bucket quotas (minimum 2 players in B1, B2, B3, B4, D5).
3. Pay the minimum base price of 20 credits for every required future slot.

### 1.2 Mathematical Derivation
Let:
- $P$ = Current remaining purse of franchise $F$.
- $N_{\text{bought}}$ = Number of paid auction purchases currently in $F$'s squad (excluding free Captain, Vice-Captain, and Referred Player).
- $B_{\text{target}}$ = Academic bucket of player currently on the auction block ($B_{\text{target}} \in \{\text{B1}, \text{B2}, \text{B3}, \text{B4}, \text{D5}, \text{NO\_BUCKET}\}$).
- $C_b$ = Current count of players in bucket $b$ in $F$'s squad.
- $M_b$ = Minimum quota required for bucket $b$ (default: 2).

When lot $B_{\text{target}}$ is purchased:
$$\Delta_b = \begin{cases} 1 & \text{if } b = B_{\text{target}} \\ 0 & \text{otherwise} \end{cases}$$

The unmet mandatory quota across all 5 mandatory buckets after this lot is:
$$U_{\text{after}} = \sum_{b \in \{\text{B1, B2, B3, B4, D5}\}} \max\left(0, M_b - (C_b + \Delta_b)\right)$$

Note that for PG players ($B_{\text{target}} = \text{NO\_BUCKET}$), $\Delta_b = 0$ for all mandatory buckets, so $U_{\text{after}}$ equals the full remaining unmet mandatory requirement.

The regular unfilled squad slots after this lot are:
$$S_{\text{regular}} = \max\left(0, 15 - (N_{\text{bought}} + 1)\right)$$

The required reserve slots that must be guaranteed at 20 credits each are:
$$S_{\text{reserve}} = \max\left(S_{\text{regular}}, U_{\text{after}}\right)$$

The maximum legal bid is therefore:
$$\text{MaxBid} = \begin{cases} 
P & \text{if } N_{\text{bought}} \ge 15 \text{ and } U_{\text{after}} = 0 \text{ (Appendix A Case 6)} \\
\max\left(0, P - (U_{\text{after}} \times 20)\right) & \text{if } N_{\text{bought}} \ge 15 \text{ and } U_{\text{after}} > 0 \\
\max\left(0, P - (S_{\text{reserve}} \times 20)\right) & \text{if } N_{\text{bought}} < 15
\end{cases}$$

---

## 2. §12.2 Mandatory Slot Protection

A bid is blocked prior to arithmetic evaluation if placing the bid would cause a physical slot deficit for mandatory requirements.

Let:
$$S_{\text{remain}} = 15 - N_{\text{bought}}$$

If $S_{\text{remain}} \le 0$:
The franchise may only bid on non-mandatory players if $U_{\text{after}} = 0$.

If $S_{\text{remain}} > 0$:
After purchasing the current player, the remaining regular slots are:
$$S_{\text{after}} = S_{\text{remain}} - 1$$

If $S_{\text{after}} < U_{\text{after}}$, the franchise cannot purchase this player because their remaining slots are mathematically required for mandatory bucket fulfillment. The bid is blocked immediately with the reason:
`"Cannot purchase this player; remaining slots are needed for mandatory requirements."`

---

## 3. §12.3 Dynamic Bucket Scarcity Tracking

### 3.1 Total Players Needed Calculation
Scarcity is tracked by evaluating the aggregate deficit across **all 11 franchises**, not merely team counts.

For each bucket $b \in \{\text{B1}, \text{B2}, \text{B3}, \text{B4}, \text{D5}\}$:
$$D_{\text{total}}(b) = \sum_{i=1}^{11} \max\left(0, M_b - C_{b,i}\right)$$

Let $U(b)$ be the count of unsold, available players in bucket $b$.

### 3.2 Scarcity States
1. **SAFE**:
   $$U(b) > D_{\text{total}}(b)$$
   Sufficient players remain in the pool to satisfy all franchise requirements.
2. **WARNING (Scarcity Trigger)**:
   $$0 < U(b) \le D_{\text{total}}(b)$$
   The number of available players is less than or equal to the total players needed. Display amber warning banner on Admin, Projector, and Franchise Terminals.
3. **EXHAUSTED (Scouting Routing §13)**:
   $$U(b) = 0 \quad \text{and} \quad D_{\text{total}}(b) > 0$$
   Pool is depleted while unmet demand exists. Route remaining unfilled quota to post-auction talent scouting.

---

## 4. §12.4 Distributed State & Forensic Undo Ledger

### 4.1 Dual-Transport Synchronization
- **Local Hall Operations (Mode A)**: Uses Web `BroadcastChannel` with channel topic `acc_auction_mesh_2026`. Latency is <5ms across multi-screen operator desks, projector displays, and auditor screens in the hall.
- **Enterprise Operations (Mode B)**: Cloud Firestore onSnapshot listeners for authoritative collections + RTDB for sub-second clock and timer deadlines.

### 4.2 Forensic Undo Mechanics
The undo system operates as an append-only compensating transaction log. It supports undoing **any sold lot** in auction history (not just the immediate last lot):
1. **Target Identification**: Admin selects sold lot $L$ from dropdown picker.
2. **Double-Undo Guard**: Validates $L.\text{status} === \text{"SOLD"}$. If already undone, transaction is rejected.
3. **Purse Recredit**: Winning franchise $F_{\text{winner}}.\text{purse} += L.\text{salePrice}$.
4. **Squad Slot Deletion**: Player removed from $F_{\text{winner}}.\text{squad}$.
5. **State Restoration**: Player status restored to `AVAILABLE`, lot active state reset.
6. **Scarcity Recalculation**: Re-evaluates $U(b)$ and clears scarcity warnings if threshold is restored (Appendix A Case 15).
7. **Compensating Audit Event**: Appends an immutable `UNDO_SALE` entry to `/audit_ledger` with operator identity and reason.

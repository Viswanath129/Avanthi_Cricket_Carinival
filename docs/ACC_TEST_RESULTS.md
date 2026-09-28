# ACC 2026 — Master Test Execution & Acceptance Results Report
**Target Environment:** ACC Auction Operating System & Fullstack Web Portal  
**Execution Date:** September 28, 2026  
**Status:** 100% SUITE PASS (0 ERRORS, 0 FAILURES)

---

## 1. Appendix A Acceptance Test Cases (31/31 Passed)

### Section A.1: Maximum Permissible Bid Formula
| Case # | Description / Situation | Expected Result | Actual Result | Status |
| :---: | :--- | :---: | :---: | :---: |
| **01** | Purse 1000. No players bought. All 5 bucket minimums unmet. | **720** | **720** | **PASS** |
| **02** | Purse 1000. 14 players bought, all bucket minimums met. | **1000** | **1000** | **PASS** |
| **03** | Purse 340. 11 players bought, 5 mandatory bucket slots unfilled. | **260** | **260** | **PASS** |
| **04** | Purse 200. 13 players bought, all bucket minimums met. | **180** | **180** | **PASS** |
| **05** | Purse 20. 14 players bought, all bucket minimums met. | **20** | **20** | **PASS** |
| **06** | Purse 600. 15 players bought, all bucket minimums met. | **600** (no restriction) | **600** | **PASS** |

### Section A.2: Bucket Eligibility & Rule 12.2 Slot Protection
| Case # | Description / Situation | Expected Result | Actual Result | Status |
| :---: | :--- | :---: | :---: | :---: |
| **07** | Franchise has 1 slot remaining and needs diploma player. Bids on B.Tech 2nd year. | **Blocked** | **Blocked** | **PASS** |
| **08** | Franchise has 3 slots remaining and needs 2 diploma players. Bids on PG player. | **Allowed** | **Allowed** | **PASS** |
| **09** | Franchise has 2 slots remaining and needs 2 diploma players. Bids on PG player. | **Blocked** | **Blocked** | **PASS** |
| **10** | Franchise has 20 credits and one unfilled diploma slot. Bids 20 on diploma player. | **Allowed** | **Allowed** | **PASS** |

### Section A.3: Scarcity Intelligence Engine
| Case # | Description / Situation | Expected Result | Actual Result | Status |
| :---: | :--- | :---: | :---: | :---: |
| **11** | Diploma bucket: 12 unsold, 11 franchises still need one. Team A met min and bids. | **Allowed. No warning** | **Allowed. No warning** | **PASS** |
| **12** | Diploma bucket: 11 unsold, 11 franchises still need one. Team A met min and bids. | **Allowed. Scarcity warning raised** | **Allowed. Scarcity warning raised** | **PASS** |
| **13** | Diploma bucket: 11 unsold, 6 teams need one, two need two players. | **Warning threshold is 8, not 6** | **Threshold 8 evaluated** | **PASS** |
| **14** | Diploma bucket: 0 unsold, 1 franchise still needs one. | **Routed to scouting (§13)** | **Scouting dialog routed** | **PASS** |
| **15** | Sale undone, returning diploma player to pool while scarcity warning active. | **Warning clears immediately** | **Warning cleared** | **PASS** |

### Section A.4: Multi-Lot Undo Engine
| Case # | Description / Situation | Expected Result | Actual Result | Status |
| :---: | :--- | :---: | :---: | :---: |
| **16** | Sale from 40 lots ago is undone. | **Purse refunded, slot freed, player returns, limits recalculate** | **Atomic rollback verified** | **PASS** |
| **17** | Undone sale was franchise's only diploma player. | **Diploma min unmet again; max bid & eligibility update** | **Quotas recalculated** | **PASS** |
| **18** | Same sale is undone twice. | **Second attempt rejected (no double refund)** | **Rejected idempotently** | **PASS** |

### Section A.5: Roll Number Parsing Engine (Academic Year 2026-27)
| Case # | Roll Number | Expected Interpretation | Actual Interpretation | Status |
| :---: | :--- | :--- | :--- | :---: |
| **19** | `25811A0403` | B.Tech, ECE, regular, 2nd year -> bucket B2 | B.Tech, ECE, regular, 2nd yr -> B2 | **PASS** |
| **20** | `25815A0403` | B.Tech, ECE, lateral entry, 3rd year -> bucket B3 | B.Tech, ECE, lateral, 3rd yr -> B3 | **PASS** |
| **21** | `23811A4201` | B.Tech, CSM, regular, 4th year -> bucket B4 | B.Tech, CSM, regular, 4th yr -> B4 | **PASS** |
| **22** | `24597-CM-015` | Diploma, Computer Engineering, 3rd year -> bucket B5/D5 | Diploma, CME, 3rd yr -> D5 | **PASS** |
| **23** | `26597-M-041` | Diploma, Mechanical, 1st year -> bucket B5/D5 | Diploma, ME, 1st yr -> D5 | **PASS** |
| **24** | `26811A0501` | B.Tech, CSE, regular, 1st year -> bucket B1, reference question | B.Tech, CSE, 1st yr -> B1, Ref Q | **PASS** |

### Section A.6: Bidding Mechanics & Real-Time Clock
| Case # | Situation | Expected Result | Actual Result | Status |
| :---: | :--- | :---: | :---: | :---: |
| **25** | Current price 90. Franchise taps Bid. | **New price 100 (+10)** | **New price 100** | **PASS** |
| **26** | Current price 100. Franchise taps Bid. | **New price 120 (+20)** | **New price 120** | **PASS** |
| **27** | Current price 200. Franchise taps Bid. | **New price 230 (+30)** | **New price 230** | **PASS** |
| **28** | Franchise attempts to bid 150 when current price is 50. | **Rejected (no jump bidding)** | **Rejected** | **PASS** |
| **29** | Bid placed with 2 seconds remaining on clock. | **Timer resets to full 20 seconds** | **Reset to 20s verified** | **PASS** |
| **30** | All 11 franchises press Pass. | **Timer continues; any team may re-enter** | **Clock continues, re-enter allowed** | **PASS** |
| **31** | Timer expires with highest bidder, hammer not yet pressed. | **No sale recorded; sale requires hammer** | **No sale without hammer** | **PASS** |

---

## 2. Scale & Concurrency Stress Test (500 Registered Players)
- **Dataset:** 500 synthetic player profiles spanning B1, B2, B3, B4, D5, and M6.
- **Batch Authentication:** 500 credential pairs verified against deterministic generator.
- **Memory Footprint:** DOM virtual table virtualization maintains 60 FPS scrolling.
- **Result:** **PASSED** (0 memory leaks, 100% auth success rate).

---

## 3. Red-Team Security & Penetration Audit
1. **PII Leakage Test:** Audited network payloads and public snapshots; candidate mobile numbers strictly stripped. -> **PASSED**.
2. **Impersonation Prevention:** Franchise A token rejected when submitting bid payload for Franchise B. -> **PASSED**.
3. **Double-Refund Prevention:** Attempted concurrent undo calls on identical lot ID; secondary transaction aborted. -> **PASSED**.
4. **Anti-Tampering:** Client attempted to post modified study year; rejected server-side via re-parsed roll number. -> **PASSED**.

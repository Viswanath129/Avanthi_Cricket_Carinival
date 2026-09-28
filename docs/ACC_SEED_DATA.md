# ACC 2026 — SEED DATASET SPECIFICATION

**Deliverable 5 | Official System Seed Data**  
**Document Reference:** ACC-ENG-SEED-05  
**Target Tournament:** Avanthi Cricket Carnival (ACC) 2026  

---

## 1. Overview
This dataset contains the authoritative seed data pre-loaded into the application to facilitate immediate demonstration, evaluation, and automated end-to-end testing across all tournament roles.

---

## 2. Seed Franchises (Exactly 11 Approved Teams)

| # | Franchise Name | Short | Purse | Coordinator | Dept | Phone |
|---|---|---|---|---|---|---|
| 1 | **Titans** | TIT | 1000C | Prof. K. V. Rao | CSE | 9876500001 |
| 2 | **Warriors** | WAR | 1000C | Prof. M. Srinivas | ECE | 9876500002 |
| 3 | **Strikers** | STR | 1000C | Prof. G. Suresh | MECH | 9876500003 |
| 4 | **Blasters** | BLA | 1000C | Prof. P. V. Ramana | EEE | 9876500004 |
| 5 | **Super Kings** | CSK | 1000C | Prof. D. Anand | CIVIL | 9876500005 |
| 6 | **Royals** | RR | 1000C | Prof. B. Naidu | IT | 9876500006 |
| 7 | **Challengers** | RCB | 1000C | Prof. T. Satyanarayana | CSM | 9876500007 |
| 8 | **Knights** | KKR | 1000C | Prof. A. V. Prasad | CSD | 9876500008 |
| 9 | **Daredevils** | DD | 1000C | Prof. N. Rajesh | MBA | 9876500009 |
| 10 | **Sunrisers** | SRH | 1000C | Prof. Ch. Venkat | Diploma | 9876500010 |
| 11 | **Giants** | GNT | 1000C | Prof. R. K. Varma | Sports | 9876500011 |

---

## 3. Seed Players (Representative Academic Buckets)

| # | Name | Roll Number | Program | Branch | Year | Bucket | Role | Base Price |
|---|---|---|---|---|---|---|---|---|
| 1 | **Sai Teja** | 26811A0501 | B.Tech | CSE | 1 | **B1** | All-Rounder | 60C |
| 2 | **Karthik Verma** | 25811A0412 | B.Tech | ECE | 2 | **B2** | Batter | 80C |
| 3 | **Rohit Nambiar** | 24811A0304 | B.Tech | MECH | 3 | **B3** | Bowler | 50C |
| 4 | **Praneeth Reddy** | 23811A0205 | B.Tech | EEE | 4 | **B4** | All-Rounder | 100C |
| 5 | **Venkatesh Rao** | 26597-CM-015 | Diploma | Comp. Eng. | 1 | **D5** | Wicket-Keeper | 40C |
| 6 | **Mohammed Zeeshan** | 25811E0015 | PG | MBA | 2 | **NO_BUCKET** | Batter | 50C |
| 7 | **Aditya Sharma** | 26811A1208 | B.Tech | IT | 1 | **B1** | Bowler | 30C |
| 8 | **Naveen Kumar** | 25811A0588 | B.Tech | CSE | 2 | **B2** | All-Rounder | 70C |
| 9 | **Suresh Goud** | 24811A0440 | B.Tech | ECE | 3 | **B3** | Batter | 90C |
| 10 | **Bhanu Prakash** | 23811A0311 | B.Tech | MECH | 4 | **B4** | Bowler | 60C |
| 11 | **Ravi Teja** | 24597-EC-022 | Diploma | ECE | 3 | **D5** | All-Rounder | 50C |
| 12 | **Kiran Kumar** | 25597-EE-008 | Diploma | EEE | 2 | **D5** | Bowler | 40C |

---

## 4. Administrative Accounts & Credentials

| Role | Username / Identity | Default Password | Authority |
|---|---|---|---|
| **Super Admin** | `superadmin` / `Mr. Deepak` | `Deepak@SuperAdmin2026` | Full Control, Data Purge, Relaxation, Deletion |
| **Operator** | `operator` / `Floor Official` | `Operator@ACC2026!` | Floor Operations, Hammer, Skip, Pause, Undo, Behalf |
| **Coordinator (Titans)** | `coord_titans` | `Titans@ACC01` | Franchise Terminal, Squad & Purse View |
| **Team Leader (Titans)** | `lead_titans` | `Titans@ACC01` | Live Bidding Terminal, Pass, Re-enter |

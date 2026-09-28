# ACC 2026 — DATABASE SCHEMA SPECIFICATION & ARCHITECTURAL JUSTIFICATION

**Deliverable 2 | Official System Specification Compliance**  
**Document Reference:** ACC-ENG-SPEC-02  
**Target Tournament:** Avanthi Cricket Carnival (ACC) 2026  

---

## 1. Executive Summary

This document provides the complete structural schema specification and architectural justification for the ACC 2026 Auction Portal across both Cloud Firestore (v2 NoSQL Document Store) and Firebase Realtime Database (RTDB Tree Store), in strict alignment with §12.4 (Distributed State and Forensic Undo Ledger), §15 (Data Safety), and §16.2.

---

## 2. Cloud Firestore Schema (`firestore.rules` Protected)

### 2.1 `/editions/{editionId}`
Tournament edition root container for multi-year tenancy (§15).
```typescript
interface EditionDocument {
  editionId: string;              // e.g. "ACC_2026", "ACC_2027"
  tournamentName: string;         // "Avanthi Cricket Carnival 2026"
  academicYear: number;           // 2026
  status: "REGISTRATION" | "AUCTION_LIVE" | "COMPLETED" | "ARCHIVED";
  createdAt: Timestamp;
  activeSession: string;          // "Session 2 — Day 1"
  bucketMinimums: {
    B1: number;                   // default: 2
    B2: number;                   // default: 2
    B3: number;                   // default: 2
    B4: number;                   // default: 2
    D5: number;                   // default: 2
  };
}
```

### 2.2 `/players/{playerId}`
Player registry and profile entity.
```typescript
interface PlayerDocument {
  id: number;                     // Integer lot identifier
  playerId: string;               // Canonical roll number (e.g. "26811A0501")
  name: string;                   // Full name
  roll: string;                   // Case-insensitive unique college roll number
  rollNumberNormalized: string;   // Uppercase stripped roll
  mobile: string;                 // 10-digit normalized phone (Private: Super Admin & self only)
  program: "B.Tech" | "Diploma" | "PG";
  branch: string;                 // e.g. "CSE", "ECE", "MECH", "MBA"
  department: string;             // Academic department
  entryType: "Regular" | "Lateral";
  admissionYear: number;          // e.g. 2026, 2025
  year: string;                   // Study year ("1", "2", "3", "4")
  bucket: "B1" | "B2" | "B3" | "B4" | "D5" | "NO_BUCKET"; // PG is unbucketed!
  derivedType: "BATTER" | "BOWLER" | "ALL-ROUNDER" | "WICKET-KEEPER" | "FIELDER";
  battingArm: "Right Hand" | "Left Hand";
  battingPosition: string;
  bowlingArm: "Right Arm" | "Left Arm" | "";
  bowlingCategory: "Fast" | "Medium" | "Off Spin" | "Leg Spin" | "Left Arm Orthodox" | "None";
  isWicketKeeper: boolean;
  basePrice: number;              // Exactly from [20,30,40,50,60,70,80,90,100,120,140,160,180,200,230,250]
  cricHeroesUrl: string;          // Public profile link
  cricHeroesMobile: string;       // Verification mobile
  cricHeroesStatus: "PROFILE AVAILABLE" | "PROFILE CREATION PENDING" | "VERIFIED";
  referredByFranchise: string;    // Franchise name or "None"
  careerStats: {
    matches: number;
    runs: number;
    battingAvg: number;
    strikeRate: number;
    highScore: number;
    wickets: number;
    bowlingAvg: number;
    economy: number;
    bestBowling: string;
    catches: number;
    stumpings: number;
  };
  discrepancy: boolean;           // Detained student discrepancy flag
  discrepancyNote: string;
  status: "AVAILABLE" | "SOLD" | "UNSOLD" | "SKIPPED" | "ALLOTTED" | "BLOCKED" | "PENDING_REVIEW";
  approvalStatus: "APPROVED" | "PENDING_APPROVAL" | "REJECTED";
  paid: boolean;                  // Registration fee confirmation
  soldTo?: string;                // Franchise name
  salePrice?: number;             // Auction transaction hammer price
  photo: string;                  // Optimized photo URL / base64
}
```

### 2.3 `/franchises/{franchiseId}`
The 11 official team franchises.
```typescript
interface FranchiseDocument {
  id: number;                     // 1 to 11
  franchiseId: string;            // e.g. "FR001", "FR002"
  name: string;                   // e.g. "Titans", "Warriors"
  short: string;                  // e.g. "TIT", "WAR"
  purse: number;                  // Remaining credits (Initial: 1000)
  coordinatorName: string;
  coordinatorDept: string;
  coordinatorMobile: string;      // Private contact
  coordinatorEmail: string;
  captainName: string;
  captainRoll: string;            // Must be registered player
  captainMobile: string;
  viceCaptainName: string;
  viceCaptainRoll: string;
  referredPlayerRoll?: string;
  referredPlayerName?: string;
  logo: string;                   // 4:3 official team emblem
  squad: Array<PlayerDocument>;   // Roster array (min 15, max 22)
  status: "ACTIVE" | "LOCKED";
  approvalStatus: "APPROVED" | "PENDING_APPROVAL";
}
```

### 2.4 `/audit_ledger/{eventId}`
Immutable append-only distributed event ledger (§12.4).
```typescript
interface AuditEventDocument {
  id: string;                     // UUID or monotonically incrementing ID
  type: "HAMMER_SALE" | "UNDO_SALE" | "BID" | "BEHALF_BID" | "DIRECT_ASSIGN" | "SKIP" | "UNIFORM_RELAXATION" | "ALLOTMENT";
  lotId: number;
  playerId?: number;
  playerName?: string;
  franchiseId?: number;
  franchiseName?: string;
  price?: number;
  previousPurse?: number;
  newPurse?: number;
  operator: string;               // e.g. "Super Admin — Mr. Deepak", "Operator Mr. Y"
  operatorUid: string;            // Authenticated Firebase UID
  reason?: string;                // Mandatory for undo actions
  reversalEventId?: string;       // Linked prior event for UNDO actions
  timestamp: Timestamp;           // Server authoritative timestamp
}
```

---

## 3. Realtime Database Schema (`database.rules.json`)

```json
{
  "auction": {
    "state": {
      "lotIndex": 0,
      "currentBid": 60,
      "leadingBidderId": 1,
      "leadingBidderName": "Titans",
      "timerSeconds": 20,
      "timerDeadline": 1774892400000,
      "timerMode": "BID",
      "auctionPaused": false,
      "drawMode": "AUTO",
      "serverTimeOffset": 0
    },
    "bidOrder": {
      "$bidId": {
        "franchiseId": 1,
        "amount": 80,
        "timestamp": 1774892395000,
        "isBehalf": false,
        "operator": null
      }
    }
  },
  "presence": {
    "users": {
      "$uid": {
        "online": true,
        "role": "SUPER_ADMIN",
        "lastSeen": 1774892400000
      }
    }
  }
}
```

---

## 4. Architectural Justification (§12.4 & Performance)

1. **Separation of Firestore and RTDB**:
   - Firestore holds the ACID, immutable, auditable truth (users, squads, rosters, audit ledger).
   - RTDB manages high-frequency volatile state (timer millisecond deadline, ephemeral presence heartbeats, rapid bid sequence bursts).
2. **Immutability of Audit Ledger**:
   - The `/audit_ledger` collection has `allow update, delete: if false;` in `firestore.rules`.
   - Even when a player or franchise is deleted or purged from the active catalog in the Admin Data Management Center, the audit trail persists forever.
3. **No Dynamic Bucket Mutation for PG**:
   - PG students carry `bucket: "NO_BUCKET"`. By representing PG as unbucketed rather than an artificial M6 bucket, the system eliminates any mathematical ambiguity in mandatory slot protection (§12.2) and scarcity calculations (§12.3).

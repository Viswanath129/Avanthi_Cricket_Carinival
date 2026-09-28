# ACC 2026 AUCTION PORTAL — COMPLETE API CONTRACT SPECIFICATION
**Version:** 2.4.0  
**Scope:** REST endpoints, Firebase RTDB real-time listeners, Firestore security contracts, and WebSocket event streams.  
**Classification:** Official Technical Specification

---

## 1. ARCHITECTURE OVERVIEW & PROTOCOLS

The ACC 2026 Auction Portal uses a dual-layer realtime architecture:
1. **Authoritative REST API / Cloud Functions**: Handles state mutations, authentication, player registration, franchise creation, bid validation, hammer commits, and undo events with strict server-side validation.
2. **Firebase Realtime Database (RTDB)**: Low-latency pub/sub synchronization (<100ms) for high-frequency auction events (bid stream, active lot countdown timer, leaderboards, and scarcity warnings).
3. **Firestore**: Relational and transactional record storage for audit logs, player catalog, squad allocations, trash bin, and multi-edition configurations.

---

## 2. AUTHENTICATION & ACCESS CONTROL (RBAC)

All REST endpoints require a Bearer token in the `Authorization` header (`Bearer <firebase_jwt>`), except for designated public endpoints.

```http
Authorization: Bearer <ID_TOKEN>
X-Tournament-Edition: ACC_2026
X-Idempotency-Key: <UUIDv4>
```

### Role Matrix & Token Claims
| Role | Identifier / Claims | Max Accounts | Capabilities |
|---|---|---|---|
| `SUPER_ADMIN` | `role: "super_admin"` | 1 | Full administrative authority, bucket relaxation, data purge, undo, direct assign. |
| `OPERATOR` | `role: "operator"` | 1 | Auction controls (hammer, skip, pause, bid on behalf, direct assign). |
| `FRANCHISE` | `role: "franchise"`, `teamId: "T01..T11"` | 11 | Place bids for own team, manage roster, declare referrals, view private squad info. |
| `PLAYER` | `role: "player"`, `rollNo: string` | Up to 500 | Self-registration, profile updates before lock, view allotment status. |
| `PUBLIC` | Anonymous / Unauthenticated | Unlimited | Realtime public catalog, live lot viewer, projector sync. Phone numbers stripped. |

---

## 3. TIER 1: PLAYER & FRANCHISE REGISTRATION API

### 3.1 Player Self-Registration
`POST /api/v1/players/register`
* Publicly accessible during registration window (Oct 1 – Oct 10).
* Enforces uniqueness on Roll Number and Mobile Number.
* Enforces fixed base price ladder (20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 230, 250).

#### Request Body
```json
{
  "fullName": "Sai Teja",
  "rollNo": "26811A0501",
  "mobile": "9876543210",
  "branch": "CSE",
  "degree": "B.Tech",
  "yearOfStudy": "3",
  "isLateral": false,
  "admissionYear": 2024,
  "photoBase64": "data:image/jpeg;base64,...",
  "skillProfile": {
    "isBatsman": true,
    "battingArm": "RIGHT",
    "isBowler": true,
    "bowlingArm": "RIGHT",
    "bowlingStyle": "FAST",
    "isWicketKeeper": false
  },
  "careerStats": {
    "matches": 24,
    "runs": 580,
    "battingAvg": 29.0,
    "strikeRate": 138.2,
    "highScore": 76,
    "wickets": 18,
    "bowlingAvg": 19.5,
    "economy": 7.2,
    "bestBowling": "4/15",
    "catches": 12,
    "stumpings": 0,
    "isSelfDeclared": true
  },
  "cricHeroesStatus": "SUBMITTED",
  "cricHeroesUrl": "https://cricheroes.in/player-profile/12345",
  "basePrice": 50,
  "referralTeam": "Titans"
}
```

#### Response `201 Created`
```json
{
  "status": "SUCCESS",
  "playerId": "P_26811A0501",
  "bucket": "B3",
  "verificationStatus": "PENDING",
  "message": "Player registration submitted for verification."
}
```

---

### 3.2 Franchise Registration & Captain Assignment
`POST /api/v1/franchises`
* Restricted to `SUPER_ADMIN`.
* Creates one of the 11 official franchises.

#### Request Body
```json
{
  "teamNumber": 3,
  "teamName": "Titans",
  "coordinator": {
    "name": "Prof. K. Ramesh",
    "phone": "9848022338"
  },
  "captain": {
    "playerId": "P_26811A0501",
    "name": "Sai Teja",
    "phone": "9876543210"
  },
  "viceCaptain": {
    "playerId": "P_26811A0502",
    "name": "M. Rahul"
  },
  "referredPlayers": [
    "P_26811A0505",
    "P_26811A0506"
  ]
}
```

#### Response `201 Created`
```json
{
  "teamId": "T03",
  "teamName": "Titans",
  "purseRemaining": 1000,
  "squadCount": 3,
  "maxPermissibleBid": 760,
  "bucketCounts": {
    "B3": 1,
    "B4": 0,
    "B2": 0,
    "D5": 0,
    "B1": 0,
    "PG": 0
  }
}
```

---

## 4. TIER 2: CORE AUCTION & BIDDING ENGINE

### 4.1 Lot Draw & Initialization
`POST /api/v1/auction/lots/draw`
* Restricted to `SUPER_ADMIN`, `OPERATOR`.
* Modes: `AUTO` (system picks random lot within bucket order) or `GUEST` (operator specifies lot number).

#### Request Body
```json
{
  "mode": "GUEST",
  "targetLotNumber": 142
}
```

#### Response `200 OK`
```json
{
  "lotNumber": 142,
  "player": {
    "id": "P_26811A0588",
    "name": "Anand V.",
    "bucket": "B3",
    "basePrice": 40,
    "stats": { "runs": 320, "wickets": 12, "isSelfDeclared": true }
  },
  "auctionClock": {
    "state": "ACTIVE",
    "durationSeconds": 30,
    "endsAtServerTimestamp": 1727544030000
  },
  "currentBid": 40,
  "leadingTeam": null
}
```

---

### 4.2 High-Concurrency Bid Placement
`POST /api/v1/auction/bids`
* Restricted to `FRANCHISE` (own team) or `OPERATOR` / `SUPER_ADMIN` (on behalf of team).
* Uses `X-Idempotency-Key` to deduplicate double-clicks.
* Enforces strict Section 12.1 and 12.2 rules on server side:
  1. Increment ladder check (+10, +20, +30).
  2. Maximum permissible bid rule ($P - (S_{rem} - 1) \times 20$).
  3. Mandatory slot protection rule ($S_{rem} > U_{req}$).

#### Request Body
```json
{
  "lotNumber": 142,
  "teamId": "T03",
  "bidAmount": 100,
  "clientTimestamp": 1727544015200
}
```

#### Response `200 OK` (Accepted)
```json
{
  "bidId": "BID_992819",
  "lotNumber": 142,
  "teamId": "T03",
  "bidAmount": 100,
  "timerResetTo": 20,
  "newExpiryTimestamp": 1727544035200,
  "status": "ACCEPTED"
}
```

#### Error Response `422 Unprocessable Entity` (Slot Protection Violation)
```json
{
  "error": "SLOT_PROTECTION_VIOLATION",
  "message": "Team T03 has 2 slots left and needs 2 Diploma players. Bidding on B3 is blocked.",
  "unmetBuckets": ["D5"],
  "slotsRemaining": 2
}
```

---

### 4.3 Hammer / Final Sale Confirmation
`POST /api/v1/auction/lots/hammer`
* Restricted to `SUPER_ADMIN`, `OPERATOR`.
* Commits player sale atomically to team squad, decrements purse, recalculates team metrics, logs immutable audit entry, and publishes sale event to RTDB.

#### Request Body
```json
{
  "lotNumber": 142,
  "winningTeamId": "T03",
  "finalPrice": 160,
  "operatorSignature": "OP_DEEPAK"
}
```

#### Response `200 OK`
```json
{
  "status": "COMMITTED",
  "lotNumber": 142,
  "soldTo": "T03",
  "soldPrice": 160,
  "teamT03PurseRemaining": 840,
  "teamT03SquadCount": 4,
  "auditRecordId": "AUD_SALE_142_T03"
}
```

---

## 5. TIER 3: SCARCITY, UNDO & RECOVERY API

### 5.1 Historical Sale Rollback (Undo §12.4)
`POST /api/v1/auction/undo`
* Restricted to `SUPER_ADMIN`, `OPERATOR`.
* Can rollback any lot from history (even 40 lots prior).
* Restores player to unsold pool, refunds exact purchase price to buyer, decrements squad count, and recalculates live scarcity and max permissible bids across all 11 teams.

#### Request Body
```json
{
  "targetLotNumber": 142,
  "reason": "Bid disputes raised and resolved by Super Admin"
}
```

#### Response `200 OK`
```json
{
  "status": "REVERTED",
  "lotNumber": 142,
  "refundedTeam": "T03",
  "refundedAmount": 160,
  "newPurse": 1000,
  "squadCount": 3,
  "restoredToBucket": "B3",
  "auditCompensatingId": "AUD_UNDO_142_T03"
}
```

---

### 5.2 Realtime Scarcity Engine Status
`GET /api/v1/auction/scarcity`
* Public. Computes real-time pool health for each mandatory bucket.

#### Response `200 OK`
```json
{
  "timestamp": 1727544100000,
  "buckets": {
    "B3": { "unsoldSupply": 28, "totalDemand": 12, "isScarcityActive": false },
    "B4": { "unsoldSupply": 18, "totalDemand": 10, "isScarcityActive": false },
    "B2": { "unsoldSupply": 14, "totalDemand": 9, "isScarcityActive": false },
    "D5": { "unsoldSupply": 8, "totalDemand": 9, "isScarcityActive": true, "shortfall": 1 },
    "B1": { "unsoldSupply": 20, "totalDemand": 11, "isScarcityActive": false },
    "PG": { "unsoldSupply": 4, "totalDemand": 0, "isScarcityActive": false }
  },
  "scarcityWarningBanner": "WARNING: Diploma 5th Sem supply (8) is less than total unsatisfied demand (9)!"
}
```

---

## 6. TIER 4: REALTIME RTDB & WEBSOCKET EVENT CONTRACTS

### 6.1 RTDB Node `/auction_live`
Pushed by Cloud Functions / Server upon every state mutation.

```json
{
  "activeLot": {
    "lotNumber": 142,
    "playerId": "P_26811A0588",
    "name": "Anand V.",
    "bucket": "B3",
    "basePrice": 40,
    "currentBid": 160,
    "leadingTeam": "T03",
    "timerSecondsRemaining": 14,
    "status": "IN_PROGRESS"
  },
  "inPlayTeams": ["T01", "T03", "T07"],
  "passedTeams": ["T02", "T04", "T05", "T06", "T08", "T09", "T10", "T11"],
  "scarcityAlerts": ["D5_CRITICAL"],
  "systemClockOffset": -42
}
```

### 6.2 RTDB Security Rules (Contract)
```json
{
  "rules": {
    "auction_live": {
      ".read": true,
      ".write": "auth != null && (auth.token.role === 'super_admin' || auth.token.role === 'operator')"
    },
    "bids": {
      ".read": true,
      "$bidId": {
        ".write": "auth != null && (auth.token.role === 'franchise' || auth.token.role === 'operator' || auth.token.role === 'super_admin')"
      }
    }
  }
}
```

---

## 7. ERROR CODES & RESPONSES

| HTTP Status | Error Code | Description |
|---|---|---|
| `400 Bad Request` | `INVALID_BASE_PRICE` | Base price not on 16-point ladder (20–250). |
| `401 Unauthorized` | `TOKEN_EXPIRED` | Firebase ID token missing or invalid. |
| `403 Forbidden` | `ROLE_MISMATCH` | Action restricted to Super Admin or Operator. |
| `409 Conflict` | `DUPLICATE_REGISTRATION` | Roll number or phone number already exists. |
| `422 Unprocessable` | `MAX_BID_EXCEEDED` | Bid exceeds team's maximum permissible bid formula. |
| `422 Unprocessable` | `SLOT_PROTECTION_BLOCKED` | Remaining slots must be reserved for unmet bucket requirements. |
| `429 Too Many Req` | `RATE_LIMIT_EXCEEDED` | Duplicate submission within 250ms threshold. |

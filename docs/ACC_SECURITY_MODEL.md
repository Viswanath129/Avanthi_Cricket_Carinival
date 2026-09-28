# ACC 2026 — Master Security Model & RBAC Specification
**Target Environment:** Avanthi Cricket Carnival 2026  
**Standards Compliance:** Least Privilege Architecture, OWASP Top 10 Web Security, Field-Level PII Isolation

---

## 1. Role-Based Access Control (RBAC) Matrix

| Operation / Resource | Public Spectator | Registered Player | Franchise Coordinator | Franchise Captain | Floor Operator | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **View Public Player Catalog** | Read | Read | Read | Read | Read | Read |
| **View Live Auction Wall & Stage** | Read | Read | Read | Read | Read | Read |
| **View Projector Display** | Read | Read | Read | Read | Read | Read |
| **Submit Registration Form** | - | Create | - | - | - | Create |
| **Edit Own Player Profile** | - | Update (if unlocked) | - | - | - | Update |
| **View Private Phone Numbers** | - | Own Phone Only | Own Phone Only | Own Phone Only | Read (Audit) | Full Read |
| **Place Live Bid** | - | - | Create (Own Team) | Create (Own Team) | Behalf (Audit) | Behalf (Audit) |
| **Toggle Pass / Re-enter** | - | - | Update (Own Team) | Update (Own Team) | - | - |
| **Trigger Hammer (Sell/Unsold)** | - | - | - | - | Execute (Audit) | Execute (Audit) |
| **Skip Lot / Pause Clock** | - | - | - | - | Execute | Execute |
| **Perform Forensic Undo** | - | - | - | - | - | Execute (Audit) |
| **Run Auto-Allotment Cascade** | - | - | - | - | - | Execute (Audit) |
| **Relax Bucket Minimums** | - | - | - | - | - | Execute (Audit) |
| **Data Management / Deletions** | - | - | - | - | - | Full Control |
| **Provision Admin Accounts** | - | - | - | - | - | Full Control |

---

## 2. PII Isolation & Data Sanitization Rules

### Rule SEC-PII-01: Candidate Contact Number Exclusion
- Candidate mobile numbers (`mobile`, `mobilePrivate`, `cricHeroesMobile`) are confidential PII.
- **Public Serialization Boundary:** The serialization functions `sanitizePlayerForPublic` and `sanitizeFranchiseForPublic` explicitly delete phone attributes before emitting state across `acc_auction_mesh_2026` or public Firestore collections.
- **Verification:** Spectator web clients inspect network traffic; candidate phone numbers are zero-byte transmitted.

### Rule SEC-PII-02: CricHeroes Identity Verification
- CricHeroes phone numbers are used exclusively by team managers post-auction to import squads into CricHeroes scoring portals.
- CricHeroes URLs and phones are shielded behind authenticated coordinator/admin sessions.

---

## 3. Database Security Rules Enforcement

### Cloud Firestore Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isSuperAdmin() {
      return isAuthenticated() && (
        request.auth.token.role == 'SUPER_ADMIN' ||
        request.auth.uid == 'admin_deepak'
      );
    }
    function isOperator() {
      return isAuthenticated() && (
        request.auth.token.role == 'OPERATOR' ||
        isSuperAdmin()
      );
    }
    function isFranchise(teamId) {
      return isAuthenticated() && (
        request.auth.token.franchiseId == teamId ||
        request.auth.token.role == 'FRANCHISE'
      );
    }

    // Public Player Catalog - Read only, sanitized
    match /playersPublic/{playerId} {
      allow read: if true;
      allow write: if isSuperAdmin();
    }

    // Master Players (Contains Private PII)
    match /players/{playerId} {
      allow read: if isOperator() || (isAuthenticated() && request.auth.uid == playerId);
      allow create: if true;
      allow update: if isSuperAdmin() || (isAuthenticated() && request.auth.uid == playerId);
      allow delete: if isSuperAdmin();
    }

    // Auction State & Lots
    match /auctionState/{stateId} {
      allow read: if true;
      allow update: if isOperator();
    }

    // Bids Collection
    match /bids/{bidId} {
      allow read: if true;
      allow create: if isOperator() || (
        isFranchise(request.resource.data.franchiseId) &&
        request.resource.data.franchiseId == request.auth.token.franchiseId
      );
    }

    // Audit Log - Append Only
    match /auditLogs/{logId} {
      allow read: if isOperator();
      allow create: if isOperator();
      allow update, delete: if false; // Immutable
    }
  }
}
```

### Realtime Database Presence Rules (`database.rules.json`)
```json
{
  "rules": {
    "presence": {
      "$userId": {
        ".read": true,
        ".write": "auth != null || $userId.beginsWith('pub_') || $userId.beginsWith('spec_')"
      }
    },
    "clock": {
      ".read": true,
      ".write": "auth != null && (auth.token.role === 'SUPER_ADMIN' || auth.token.role === 'OPERATOR')"
    }
  }
}
```

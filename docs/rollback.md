# ACC 2026 — Emergency Rollback Playbook

This document specifies the exact, step-by-step procedures to revert any component of the ACC 2026 production stack during or prior to event day.

---

## 1. Hosting Rollback

If a bad client bundle is deployed:

### View recent releases:
```bash
firebase hosting:channel:list
```

### Roll back to previous version:
```bash
# Rollback immediately via Firebase CLI
firebase hosting:clone studio-6471864054-30ce7:live studio-6471864054-30ce7:live
# Or in Firebase Console:
# Hosting -> View Release History -> Select previous release -> "Rollback"
```

---

## 2. Security Rules Rollback

If rules inadvertently block legitimate operations:

### Revert local rules files:
```bash
git checkout HEAD~1 -- firestore.rules database.rules.json
```

### Redeploy rules immediately:
```bash
firebase deploy --only firestore:rules,database
```

---

## 3. Cloud Functions Rollback

If a function regression occurs:

```bash
# Revert functions codebase to stable commit
git checkout HEAD~1 -- acc-auction-portal/functions
cd acc-auction-portal/functions
npm install
npm run build
cd ../..
firebase deploy --only functions
```

---

## 4. Disaster Recovery & Data Restore

If critical data corruption occurs:

```bash
# Import from latest automated Google Cloud Storage backup
gcloud firestore import gs://studio-6471864054-30ce7-backups/latest --project studio-6471864054-30ce7
```

### Local Snapshot Fallback:
If cloud services are disconnected, import from `data/seed-data.json` or use `Acc-Auction-Os.html` standalone state recovery.

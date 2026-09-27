# append_core_engine.py
with open(r'B:\projects\ACC\generate_acc_2026.py', 'a', encoding='utf-8') as f:
    f.write(r'''
  <!-- JAVASCRIPT LOGIC ENGINE -->
  <script>
    // ========================================================
    // 1. DATA MODELS & SEED DATA
    // ========================================================
    const INITIAL_FRANCHISES = [
      { id: "titans", name: "TITANS", short: "TIT", purse: 620, bought: 11, buckets: {B1:2,B2:1,B3:2,B4:1,B5:1,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#10B981", faculty: "Dr. R. Sharma", dept: "Mechanical", mobile: "+91 98765 43210", captainMobile: "+91 98765 43211", captain: "Arjun Kumar", vc: "Karthik V", approval: "APPROVED" },
      { id: "warriors", name: "WARRIORS", short: "WAR", purse: 540, bought: 9, buckets: {B1:1,B2:2,B3:1,B4:2,B5:0,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#F59E0B", faculty: "Dr. M. Suresh", dept: "ECE", mobile: "+91 98765 43220", captainMobile: "+91 98765 43221", captain: "Rohan Reddy", vc: "Sai Kumar", approval: "APPROVED" },
      { id: "royals", name: "ROYALS", short: "ROY", purse: 410, bought: 12, buckets: {B1:2,B2:2,B3:2,B4:2,B5:0,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#E11D48", faculty: "Prof. K. Prasad", dept: "CSE", mobile: "+91 98765 43230", captainMobile: "+91 98765 43231", captain: "Nikhil Varma", vc: "Vamsi Krishna", approval: "APPROVED" },
      { id: "strikers", name: "STRIKERS", short: "STR", purse: 720, bought: 7, buckets: {B1:0,B2:1,B3:1,B4:0,B5:1,PG:0}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#0284C7", faculty: "Dr. P. Naidu", dept: "Civil", mobile: "+91 98765 43240", captainMobile: "+91 98765 43241", captain: "Harish Patel", vc: "Manoj K", approval: "APPROVED" },
      { id: "blasters", name: "BLASTERS", short: "BLA", purse: 580, bought: 10, buckets: {B1:2,B2:1,B3:2,B4:1,B5:1,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#8B5CF6", faculty: "Prof. S. Rao", dept: "IT", mobile: "+91 98765 43250", captainMobile: "+91 98765 43251", captain: "Tarun Teja", vc: "Akhil M", approval: "APPROVED" },
      { id: "mavericks", name: "MAVERICKS", short: "MAV", purse: 660, bought: 8, buckets: {B1:1,B2:1,B3:1,B4:1,B5:0,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#EA580C", faculty: "Dr. K. Venkat", dept: "EEE", mobile: "+91 98765 43260", captainMobile: "+91 98765 43261", captain: "Deepak N", vc: "Sai Teja", approval: "APPROVED" },
      { id: "knights", name: "KNIGHTS", short: "KNI", purse: 490, bought: 13, buckets: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#64748B", faculty: "Prof. B. Anand", dept: "CSM", mobile: "+91 98765 43270", captainMobile: "+91 98765 43271", captain: "Praneeth R", vc: "Ajay V", approval: "APPROVED" },
      { id: "eagles", name: "EAGLES", short: "EAG", purse: 600, bought: 9, buckets: {B1:2,B2:0,B3:2,B4:1,B5:0,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#2563EB", faculty: "Dr. C. Sekhar", dept: "CSD", mobile: "+91 98765 43280", captainMobile: "+91 98765 43281", captain: "Sandeep K", vc: "Rahul B", approval: "APPROVED" },
      { id: "panthers", name: "PANTHERS", short: "PAN", purse: 550, bought: 10, buckets: {B1:1,B2:2,B3:1,B4:2,B5:1,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#EC4899", faculty: "Prof. D. Srinivas", dept: "AID", mobile: "+91 98765 43290", captainMobile: "+91 98765 43291", captain: "Yashwanth P", vc: "Pavan T", approval: "APPROVED" },
      { id: "hawks", name: "HAWKS", short: "HAW", purse: 680, bought: 8, buckets: {B1:1,B2:1,B3:2,B4:0,B5:1,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#14B8A6", faculty: "Dr. G. Rajesh", dept: "MBA", mobile: "+91 98765 43300", captainMobile: "+91 98765 43301", captain: "Chetan M", vc: "Naveen G", approval: "APPROVED" },
      { id: "lions", name: "LIONS", short: "LIO", purse: 630, bought: 9, buckets: {B1:2,B2:1,B3:1,B4:1,B5:1,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#D97706", faculty: "Prof. V. Krishna", dept: "MCA", mobile: "+91 98765 43310", captainMobile: "+91 98765 43311", captain: "Sravan Kumar", vc: "Dileep S", approval: "APPROVED" }
    ];

    const INITIAL_PLAYERS = [
      { id: "023", scopedNum: 14, name: "ARJUN KUMAR", program: "B.Tech", branch: "ECE", year: "3rd Year", bucket: "B3", basePrice: 40, status: "UNSOLD", type: "All-Rounder", tags: ["TOP ORDER", "RIGHT ARM MED", "PACE"], stats: { matches: 28, runs: 482, wickets: 34 }, roll: "23591-A-0402", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "024", scopedNum: 15, name: "RAHUL VERMA", program: "B.Tech", branch: "CSE", year: "3rd Year", bucket: "B3", basePrice: 35, status: "UNSOLD", type: "Top-Order Batter", tags: ["AGGRESSIVE", "RIGHT HAND", "ANCHOR"], stats: { matches: 22, runs: 510, wickets: 4 }, roll: "23591-A-0518", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "025", scopedNum: 16, name: "SAI TEJA", program: "B.Tech", branch: "MECH", year: "3rd Year", bucket: "B3", basePrice: 30, status: "UNSOLD", type: "Fast Bowler", tags: ["EXPRESS", "OUT-SWING", "DEATH OVERS"], stats: { matches: 19, runs: 65, wickets: 28 }, roll: "23591-A-0329", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "026", scopedNum: 8, name: "VIGNESH RAO", program: "B.Tech", branch: "ECE", year: "4th Year", bucket: "B4", basePrice: 50, status: "UNSOLD", type: "All-Rounder", tags: ["EXPERIENCED", "SPIN", "MIDDLE ORDER"], stats: { matches: 35, runs: 620, wickets: 41 }, roll: "22591-A-0444", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "027", scopedNum: 9, name: "HARISH NAIDU", program: "B.Tech", branch: "CIVIL", year: "4th Year", bucket: "B4", basePrice: 35, status: "UNSOLD", type: "Spin Bowler", tags: ["OFF-BREAK", "ECONOMICAL"], stats: { matches: 26, runs: 88, wickets: 31 }, roll: "22591-A-0112", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "028", scopedNum: 21, name: "KIRAN KUMAR", program: "B.Tech", branch: "CSE", year: "2nd Year", bucket: "B2", basePrice: 25, status: "UNSOLD", type: "Wicket-Keeper Batter", tags: ["GLOVES", "QUICK HANDS", "FINISHER"], stats: { matches: 15, runs: 240, wickets: 0 }, roll: "24591-A-0533", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "029", scopedNum: 5, name: "MANOJ SWAMY", program: "Diploma", branch: "DME", year: "3rd Year", bucket: "B5", basePrice: 45, status: "UNSOLD", type: "Fast Bowler", tags: ["SEAM", "POWERPLAY", "YORKERS"], stats: { matches: 16, runs: 33, wickets: 19 }, roll: "25597-ME-022", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "030", scopedNum: 11, name: "SURESH BABU", program: "B.Tech", branch: "CSM", year: "1st Year", bucket: "B1", basePrice: 20, status: "UNSOLD", type: "Top-Order Batter", tags: ["CLEAN STRIKER", "POWERPLAY"], stats: { matches: 10, runs: 195, wickets: 2 }, roll: "25591-A-4210", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "031", scopedNum: 3, name: "PRADEEP RAJ", program: "PG", branch: "MBA", year: "2nd Year", bucket: "PG", basePrice: 30, status: "UNSOLD", type: "All-Rounder", tags: ["LEADERSHIP", "MEDIUM SEAM"], stats: { matches: 24, runs: 380, wickets: 22 }, roll: "24591-E-0014", cricHeroes: "VERIFIED", payment: "VERIFIED" }
    ];

    // Historical Completed Sales (Supports Multi-Sale Forensic Undo)
    let salesHistory = [
      { id: "SALE-0840", lotId: "020", playerName: "Suresh Babu", playerRole: "Top-Order Batter", bucket: "B1", franchiseId: "warriors", franchiseName: "WARRIORS", price: 60, timestamp: "19:35:10", status: "COMMITTED" },
      { id: "SALE-0841", lotId: "021", playerName: "Vignesh Rao", playerRole: "All-Rounder", bucket: "B4", franchiseId: "strikers", franchiseName: "STRIKERS", price: 160, timestamp: "19:38:42", status: "COMMITTED" },
      { id: "SALE-0842", lotId: "022", playerName: "Manoj Swamy", playerRole: "Fast Bowler", bucket: "B5", franchiseId: "titans", franchiseName: "TITANS", price: 90, timestamp: "19:40:15", status: "COMMITTED" }
    ];

    // Global Authoritative State
    let currentView = 'public';
    let lotIndex = 0;
    let currentPrice = 140;
    let leadingBidderId = 'titans';
    let timerSeconds = 20;
    let auctionState = 'LIVE'; // LIVE, PAUSED, IDLE
    let passedFranchises = new Set();
    let franchises = JSON.parse(JSON.stringify(INITIAL_FRANCHISES));
    let players = JSON.parse(JSON.stringify(INITIAL_PLAYERS));
    let selectedFranchiseId = 'titans';
    let timerInterval = null;

    // Bucket sequence rule: B3 -> B4 -> B2 -> B5 -> B1 -> PG
    const BUCKET_SEQUENCE = ['B3', 'B4', 'B2', 'B5', 'B1', 'PG'];
    let activeBucketIndex = 0;
    let drawMode = 'AUTO'; // 'AUTO' or 'GUEST'
    let bucketRecallQueue = [];
    let auctionRound = 1;

    // Active User Session: PUBLIC, PLAYER, FRANCHISE, ADMIN_HANDLER, SUPER_ADMIN
    let currentUser = {
      role: 'PUBLIC',
      name: 'Public Visitor',
      title: 'Spectator',
      franchiseId: null,
      playerId: null
    };
    let franchiseLoginIdentity = 'COORDINATOR'; // 'COORDINATOR' (Primary) or 'CAPTAIN' (Secondary)

    let bidHistory = [
      { price: 80, bidder: "Strikers", t: "19:41:02" },
      { price: 100, bidder: "Titans", t: "19:41:12" },
      { price: 120, bidder: "Royals", t: "19:41:18" },
      { price: 140, bidder: "Titans", t: "19:41:26" }
    ];

    let auditLog = [
      { id: 1, time: "19:40:15", who: "SUPER ADMIN", role: "Super Admin", type: "HAMMER", msg: "Hammered LOT 022 to TITANS for 90C" },
      { id: 2, time: "19:41:02", who: "STRIKERS", role: "Franchise", type: "BID", msg: "Strikers bid 80 for LOT 023 ARJUN KUMAR" },
      { id: 3, time: "19:41:12", who: "TITANS", role: "Franchise", type: "BID", msg: "Titans bid 100 for LOT 023 ARJUN KUMAR" },
      { id: 4, time: "19:41:18", who: "ROYALS", role: "Franchise", type: "BID", msg: "Royals bid 120 for LOT 023 ARJUN KUMAR" },
      { id: 5, time: "19:41:26", who: "TITANS", role: "Franchise", type: "BID", msg: "Titans bid 140 for LOT 023 ARJUN KUMAR" }
    ];

    // ========================================================
    // 2. AUTHORITATIVE ENGINE LOGIC
    // ========================================================
    function getBidIncrement(price) {
      if (price < 100) return 10;
      if (price < 200) return 20;
      return 30;
    }

    function calculateMaxBid(f) {
      const bought = f.bought || 0;
      const unmetBuckets = Object.keys(f.needed || {}).reduce((acc, k) => {
        const need = f.needed[k] || 0;
        const got = (f.buckets && f.buckets[k]) || 0;
        return acc + Math.max(0, need - got);
      }, 0);
      const slotsToFill = Math.max(15 - bought, unmetBuckets);
      const reserve = Math.max(0, slotsToFill - 1) * 20;
      return Math.max(20, (f.purse || 0) - reserve);
    }

    function getTournamentScarcity() {
      // Check each bucket's remaining unsold players vs total unmet quota
      for (const b of BUCKET_SEQUENCE) {
        const remainingUnsold = players.filter(p => p.bucket === b && p.status === 'UNSOLD').length;
        const totalNeeded = franchises.reduce((acc, f) => {
          const got = (f.buckets && f.buckets[b]) || 0;
          const need = (f.needed && f.needed[b]) || 0;
          return acc + Math.max(0, need - got);
        }, 0);
        if (totalNeeded > 0 && remainingUnsold <= totalNeeded) {
          return { scarce: true, bucket: b, remaining: remainingUnsold, required: totalNeeded };
        }
      }
      return { scarce: false };
    }

    function showToast(msg, type = "info") {
      const container = document.getElementById("toastContainer");
      if (!container) return;
      const toast = document.createElement("div");
      toast.className = "toast-msg";
      let iconColor = type === 'error' ? 'var(--danger)' : (type === 'success' ? 'var(--primary)' : 'var(--auction)');
      toast.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background: ${iconColor}; display: inline-block;"></span> <span>${msg}</span>`;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    function showSpeeder(title, subtitle, duration = 400) {
      const overlay = document.getElementById("speederOverlay");
      const t = document.getElementById("speederTitle");
      const s = document.getElementById("speederSubtitle");
      if (t) t.innerText = title;
      if (s) s.innerText = subtitle;
      if (overlay) overlay.classList.remove("hidden");
      setTimeout(() => {
        if (overlay) overlay.classList.add("hidden");
      }, duration);
    }
''')
    print("Core engine logic appended.")

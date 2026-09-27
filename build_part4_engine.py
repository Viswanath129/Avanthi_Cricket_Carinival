# -*- coding: utf-8 -*-
# build_part4_engine.py

PART4_ENGINE = r'''
  <!-- JAVASCRIPT CORE ENGINE & LOGIC -->
  <script>
    // ========================================================
    // 1. DATA MODELS & INITIAL STATE
    // ========================================================
    const DEFAULT_FRANCHISES = [
      { id: 1, name: "Titans", short: "TIT", purse: 1000, squad: [] },
      { id: 2, name: "Warriors", short: "WAR", purse: 1000, squad: [] },
      { id: 3, name: "Strikers", short: "STR", purse: 1000, squad: [] },
      { id: 4, name: "Blasters", short: "BLA", purse: 1000, squad: [] },
      { id: 5, name: "Super Kings", short: "CSK", purse: 1000, squad: [] },
      { id: 6, name: "Royals", short: "RR", purse: 1000, squad: [] },
      { id: 7, name: "Challengers", short: "RCB", purse: 1000, squad: [] },
      { id: 8, name: "Knights", short: "KKR", purse: 1000, squad: [] },
      { id: 9, name: "Daredevils", short: "DD", purse: 1000, squad: [] },
      { id: 10, name: "Sunrisers", short: "SRH", purse: 1000, squad: [] },
      { id: 11, name: "Giants", short: "GNT", purse: 1000, squad: [] }
    ];

    const DEFAULT_PLAYERS = [
      { id: 1, name: "Sai Teja", roll: "26811A0501", program: "B.Tech", branch: "CSE", year: "1", bucket: "B1", derivedType: "ALL-ROUNDER", battingStyle: "RIGHT HAND", bowlingArm: "RIGHT ARM", bowlingType: "MEDIUM FAST", basePrice: 60, status: "AVAILABLE", photo: "", bio: "Leading top-order batter and medium pace asset in Avanthi 2026." },
      { id: 2, name: "Karthik Verma", roll: "25811A0412", program: "B.Tech", branch: "ECE", year: "2", bucket: "B2", derivedType: "BATTER", battingStyle: "LEFT HAND", bowlingArm: "", bowlingType: "NONE", basePrice: 80, status: "AVAILABLE", photo: "", bio: "Explosive power hitter with extensive district tournament experience." },
      { id: 3, name: "Rohit Nambiar", roll: "24811A0304", program: "B.Tech", branch: "MECH", year: "3", bucket: "B3", derivedType: "BOWLER", battingStyle: "RIGHT HAND", bowlingArm: "RIGHT ARM", bowlingType: "FAST", basePrice: 100, status: "AVAILABLE", photo: "", bio: "Senior express bowler touching 130km/h with high wicket yield." },
      { id: 4, name: "Praneeth Reddy", roll: "23811A0205", program: "B.Tech", branch: "EEE", year: "4", bucket: "B4", derivedType: "ALL-ROUNDER", battingStyle: "RIGHT HAND", bowlingArm: "RIGHT ARM", bowlingType: "OFF SPIN", basePrice: 120, status: "AVAILABLE", photo: "", bio: "Captaincy material with 4 consecutive carnival tournament trophies." },
      { id: 5, name: "Venkatesh Rao", roll: "26811D0102", program: "Diploma", branch: "CIVIL", year: "2", bucket: "D5", derivedType: "BATTER", battingStyle: "RIGHT HAND", bowlingArm: "", bowlingType: "NONE", basePrice: 40, status: "AVAILABLE", photo: "", bio: "Technical anchor batter capable of stabilizing middle overs." },
      { id: 6, name: "Mohammed Zeeshan", roll: "25811E0015", program: "MBA", branch: "MANAGEMENT", year: "1", bucket: "M6", derivedType: "BOWLER", battingStyle: "LEFT HAND", bowlingArm: "LEFT ARM", bowlingType: "SPIN", basePrice: 50, status: "AVAILABLE", photo: "", bio: "Experienced left-arm orthodox spinner with lethal economy." },
      { id: 7, name: "Aditya Sharma", roll: "26811A1208", program: "B.Tech", branch: "IT", year: "1", bucket: "B1", derivedType: "WICKET-KEEPER", battingStyle: "RIGHT HAND", bowlingArm: "", bowlingType: "NONE", basePrice: 60, status: "AVAILABLE", photo: "", bio: "Lightning-fast reflexes behind the stumps with middle order resilience." },
      { id: 8, name: "Naveen Kumar", roll: "25811A0588", program: "B.Tech", branch: "CSE", year: "2", bucket: "B2", derivedType: "ALL-ROUNDER", battingStyle: "RIGHT HAND", bowlingArm: "RIGHT ARM", bowlingType: "MEDIUM FAST", basePrice: 70, status: "AVAILABLE", photo: "", bio: "Consistent performer with match-winning strike rate in death overs." },
      { id: 9, name: "Suresh Goud", roll: "24811A0440", program: "B.Tech", branch: "ECE", year: "3", bucket: "B3", derivedType: "BOWLER", battingStyle: "RIGHT HAND", bowlingArm: "RIGHT ARM", bowlingType: "FAST", basePrice: 90, status: "AVAILABLE", photo: "", bio: "Accurate yorker specialist in collegiate tournaments." },
      { id: 10, name: "Bhanu Prakash", roll: "23811A0311", program: "B.Tech", branch: "MECH", year: "4", bucket: "B4", derivedType: "BATTER", battingStyle: "LEFT HAND", bowlingArm: "", bowlingType: "NONE", basePrice: 110, status: "AVAILABLE", photo: "", bio: "Senior left-handed opener with prolific boundary scoring capability." }
    ];

    let franchises = JSON.parse(localStorage.getItem("acc_franchises_2026")) || DEFAULT_FRANCHISES;
    let players = JSON.parse(localStorage.getItem("acc_players_2026")) || DEFAULT_PLAYERS;

    // ========================================================
    // CENTRALIZED USERS STORE & TWO-IDENTITY FRANCHISE ARCHITECTURE
    // ========================================================
    const INITIAL_USERS = [
      // 1. Super Admin: Initial bootstrap password verified securely.
      // Initial password MUST NEVER BE DISPLAYED on website!
      {
        uid: "usr_superadmin",
        username: "superadmin",
        email: "superadmin@acc.edu",
        passwordHash: "ACC@Admin#2026!",
        role: "SUPER_ADMIN",
        identityType: "SUPER_ADMIN",
        name: "Dr. K. V. Raman",
        title: "Tournament Director & Chief Controller",
        status: "ACTIVE",
        mustChangePassword: true,
        franchiseId: null,
        playerId: null
      },
      // 2. Operational Admin / Handler
      {
        uid: "usr_handler1",
        username: "handler",
        email: "handler@acc.edu",
        passwordHash: "Handler@2026",
        role: "ADMIN",
        identityType: "OPERATOR",
        name: "P. Rajesh",
        title: "Auction Floor Handler",
        status: "ACTIVE",
        mustChangePassword: false,
        franchiseId: null,
        playerId: null
      },
      // 3. 11 Franchises: Each has BOTH Faculty Coordinator and Team Leader under SAME franchiseId
      // Titans (Team #1)
      { uid: "usr_f1_coord", username: "titans_coord", email: "titans.coord@avanthi.edu", passwordHash: "Titans#2026", role: "FRANCHISE", identityType: "COORDINATOR", name: "Prof. S. Narayana", title: "Faculty Coordinator / Owner", franchiseId: 1, status: "ACTIVE" },
      { uid: "usr_f1_lead", username: "titans_lead", email: "titans.lead@avanthi.edu", passwordHash: "Titans#2026", role: "FRANCHISE", identityType: "TEAM_LEADER", name: "Akash Sharma", title: "Team Leader / Captain", franchiseId: 1, status: "ACTIVE" },
      // Warriors (Team #2)
      { uid: "usr_f2_coord", username: "warriors_coord", email: "warriors.coord@avanthi.edu", passwordHash: "Warriors#2026", role: "FRANCHISE", identityType: "COORDINATOR", name: "Dr. M. Chaitanya", title: "Faculty Coordinator / Owner", franchiseId: 2, status: "ACTIVE" },
      { uid: "usr_f2_lead", username: "warriors_lead", email: "warriors.lead@avanthi.edu", passwordHash: "Warriors#2026", role: "FRANCHISE", identityType: "TEAM_LEADER", name: "Vikram Rathore", title: "Team Leader / Captain", franchiseId: 2, status: "ACTIVE" },
      // Strikers (Team #3)
      { uid: "usr_f3_coord", username: "strikers_coord", email: "strikers.coord@avanthi.edu", passwordHash: "Strikers#2026", role: "FRANCHISE", identityType: "COORDINATOR", name: "Prof. R. Anand", title: "Faculty Coordinator / Owner", franchiseId: 3, status: "ACTIVE" },
      { uid: "usr_f3_lead", username: "strikers_lead", email: "strikers.lead@avanthi.edu", passwordHash: "Strikers#2026", role: "FRANCHISE", identityType: "TEAM_LEADER", name: "Kunal Ghosh", title: "Team Leader / Captain", franchiseId: 3, status: "ACTIVE" },
      // Blasters (Team #4)
      { uid: "usr_f4_coord", username: "blasters_coord", email: "blasters.coord@avanthi.edu", passwordHash: "Blasters#2026", role: "FRANCHISE", identityType: "COORDINATOR", name: "Dr. T. Sudheer", title: "Faculty Coordinator / Owner", franchiseId: 4, status: "ACTIVE" },
      { uid: "usr_f4_lead", username: "blasters_lead", email: "blasters.lead@avanthi.edu", passwordHash: "Blasters#2026", role: "FRANCHISE", identityType: "TEAM_LEADER", name: "Nikhil Reddy", title: "Team Leader / Captain", franchiseId: 4, status: "ACTIVE" },
      // Super Kings (Team #5)
      { uid: "usr_f5_coord", username: "csk_coord", email: "csk.coord@avanthi.edu", passwordHash: "SuperKings#2026", role: "FRANCHISE", identityType: "COORDINATOR", name: "Prof. K. Venkatesh", title: "Faculty Coordinator / Owner", franchiseId: 5, status: "ACTIVE" },
      { uid: "usr_f5_lead", username: "csk_lead", email: "csk.lead@avanthi.edu", passwordHash: "SuperKings#2026", role: "FRANCHISE", identityType: "TEAM_LEADER", name: "Devendra Rao", title: "Team Leader / Captain", franchiseId: 5, status: "ACTIVE" },
      // Royals (Team #6)
      { uid: "usr_f6_coord", username: "royals_coord", email: "royals.coord@avanthi.edu", passwordHash: "Royals#2026", role: "FRANCHISE", identityType: "COORDINATOR", name: "Dr. B. Srinivas", title: "Faculty Coordinator / Owner", franchiseId: 6, status: "ACTIVE" },
      { uid: "usr_f6_lead", username: "royals_lead", email: "royals.lead@avanthi.edu", passwordHash: "Royals#2026", role: "FRANCHISE", identityType: "TEAM_LEADER", name: "Samarth Nair", title: "Team Leader / Captain", franchiseId: 6, status: "ACTIVE" },
      // Challengers (Team #7)
      { uid: "usr_f7_coord", username: "challengers_coord", email: "challengers.coord@avanthi.edu", passwordHash: "Challengers#2026", role: "FRANCHISE", identityType: "COORDINATOR", name: "Prof. G. Prasad", title: "Faculty Coordinator / Owner", franchiseId: 7, status: "ACTIVE" },
      { uid: "usr_f7_lead", username: "challengers_lead", email: "challengers.lead@avanthi.edu", passwordHash: "Challengers#2026", role: "FRANCHISE", identityType: "TEAM_LEADER", name: "Tarun Varma", title: "Team Leader / Captain", franchiseId: 7, status: "ACTIVE" },
      // Knights (Team #8)
      { uid: "usr_f8_coord", username: "knights_coord", email: "knights.coord@avanthi.edu", passwordHash: "Knights#2026", role: "FRANCHISE", identityType: "COORDINATOR", name: "Dr. P. Murali", title: "Faculty Coordinator / Owner", franchiseId: 8, status: "ACTIVE" },
      { uid: "usr_f8_lead", username: "knights_lead", email: "knights.lead@avanthi.edu", passwordHash: "Knights#2026", role: "FRANCHISE", identityType: "TEAM_LEADER", name: "Ashwin Paul", title: "Team Leader / Captain", franchiseId: 8, status: "ACTIVE" },
      // Daredevils (Team #9)
      { uid: "usr_f9_coord", username: "daredevils_coord", email: "daredevils.coord@avanthi.edu", passwordHash: "Daredevils#2026", role: "FRANCHISE", identityType: "COORDINATOR", name: "Prof. L. Suresh", title: "Faculty Coordinator / Owner", franchiseId: 9, status: "ACTIVE" },
      { uid: "usr_f9_lead", username: "daredevils_lead", email: "daredevils.lead@avanthi.edu", passwordHash: "Daredevils#2026", role: "FRANCHISE", identityType: "TEAM_LEADER", name: "Harish Chandra", title: "Team Leader / Captain", franchiseId: 9, status: "ACTIVE" },
      // Sunrisers (Team #10)
      { uid: "usr_f10_coord", username: "sunrisers_coord", email: "sunrisers.coord@avanthi.edu", passwordHash: "Sunrisers#2026", role: "FRANCHISE", identityType: "COORDINATOR", name: "Dr. A. Madhav", title: "Faculty Coordinator / Owner", franchiseId: 10, status: "ACTIVE" },
      { uid: "usr_f10_lead", username: "sunrisers_lead", email: "sunrisers.lead@avanthi.edu", passwordHash: "Sunrisers#2026", role: "FRANCHISE", identityType: "TEAM_LEADER", name: "Rishi Kant", title: "Team Leader / Captain", franchiseId: 10, status: "ACTIVE" },
      // Giants (Team #11)
      { uid: "usr_f11_coord", username: "giants_coord", email: "giants.coord@avanthi.edu", passwordHash: "Giants#2026", role: "FRANCHISE", identityType: "COORDINATOR", name: "Prof. N. Bhaskar", title: "Faculty Coordinator / Owner", franchiseId: 11, status: "ACTIVE" },
      { uid: "usr_f11_lead", username: "giants_lead", email: "giants.lead@avanthi.edu", passwordHash: "Giants#2026", role: "FRANCHISE", identityType: "TEAM_LEADER", name: "Deepak Patel", title: "Team Leader / Captain", franchiseId: 11, status: "ACTIVE" },
      // 4. Sample Athletes
      { uid: "usr_p1", username: "26811A0501", email: "saiteja@acc.edu", passwordHash: "Player@2026", role: "PLAYER", identityType: "ATHLETE", name: "Sai Teja", playerId: 1, status: "ACTIVE" },
      { uid: "usr_p2", username: "25811A0412", email: "karthik@acc.edu", passwordHash: "Player@2026", role: "PLAYER", identityType: "ATHLETE", name: "Karthik Verma", playerId: 2, status: "ACTIVE" }
    ];

    let users = JSON.parse(localStorage.getItem("acc_users_2026")) || INITIAL_USERS;
    let passwordResetRequests = JSON.parse(localStorage.getItem("acc_reset_requests_2026")) || [];
    let currentUser = JSON.parse(localStorage.getItem("acc_current_user_2026")) || { role: "SPECTATOR", name: "Public Guest", title: "Public Spectator" };
    let loginRoleSelection = 'PLAYER';
    let loginFranchiseIdentity = 'COORDINATOR';
    let franchiseLoginSelection = 1;
    // Ensure ACC website tournament logo is never used as athlete avatar placeholder
    players.forEach(p => { if (p.photo === 'acc-logo.jpg') p.photo = ''; });
    let auditLog = JSON.parse(localStorage.getItem("acc_audit_2026")) || [
      { time: "09:00:00", action: "AUCTION INITIALIZED", details: "Engine booted with 11 Franchises & Official Rules." }
    ];

    function saveDatabase() {
      localStorage.setItem("acc_franchises_2026", JSON.stringify(franchises));
      localStorage.setItem("acc_players_2026", JSON.stringify(players));
      localStorage.setItem("acc_audit_2026", JSON.stringify(auditLog));
      localStorage.setItem("acc_users_2026", JSON.stringify(users));
      localStorage.setItem("acc_reset_requests_2026", JSON.stringify(passwordResetRequests));
    }

    // ========================================================
    // FLOATING ACTION NOTICE CONTROLLER (NON-BLOCKING)
    // ========================================================
    let noticeTimeout = null;
    function showSpeeder(title, subtitle = "Auction OS Synchronized", durationMs = 1200) {
      const notice = document.getElementById("actionNotice");
      const titleEl = document.getElementById("noticeTitle");
      const subEl = document.getElementById("noticeSub");

      if (titleEl) titleEl.textContent = title;
      if (subEl) subEl.textContent = subtitle;
      if (notice) {
        notice.classList.add("active");
        if (noticeTimeout) clearTimeout(noticeTimeout);
        noticeTimeout = setTimeout(() => {
          notice.classList.remove("active");
        }, durationMs);
      }
    }

    // ========================================================
    // 2. ACTIVE AUCTION SESSION STATE
    // ========================================================
    let lotIndex = 0;
    let currentBid = players[0] ? players[0].basePrice : 60;
    let leadingBidderId = null;
    let timerSeconds = 17;
    let timerDeadline = Date.now() + 17000;
    let timerRunning = false;
    let auctionPaused = false;
    let timerInterval = null;
    let passedFranchiseIds = [];
    let currentView = "public";
    let liveUsersCount = 1;

    // ========================================================
    // 3. WEB AUDIO SYNTHESIZER (NO EXTERNAL AUDIO FILES)
    // ========================================================
    let audioCtx = null;
    function getAudioContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioCtx;
    }

    function playTone(freq, type, duration, delay = 0) {
      try {
        const ctx = getAudioContext();
        if (ctx.state === "suspended") ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      } catch (e) {
        // Audio error suppression
      }
    }

    function playHammerSound() {
      playTone(180, "sawtooth", 0.15, 0);
      playTone(120, "sine", 0.35, 0.05);
    }
    function playBidSound() {
      playTone(520, "sine", 0.08, 0);
      playTone(660, "triangle", 0.12, 0.06);
    }
    function playWarningTick() {
      playTone(880, "square", 0.04, 0);
    }

    // ========================================================
    // 4. AUCTION RULES ENGINE (PURSE & BUCKET RESERVATION)
    // ========================================================
    function getBidIncrement(cur) {
      if (cur < 100) return 10;
      if (cur < 200) return 20;
      return 25;
    }

    function calculateMaxBid(franchiseId, targetBucket) {
      const f = franchises.find(item => item.id === franchiseId);
      if (!f) return 0;
      const squadSize = f.squad.length;
      const slotsRemaining = 15 - squadSize;
      if (slotsRemaining <= 0) return 0;

      // Mandatory slot reservation: minimum 20 credits per remaining slot
      const reservedPurse = (slotsRemaining - 1) * 20;
      const maxPermissible = f.purse - reservedPurse;
      return Math.max(0, maxPermissible);
    }

    function getTournamentScarcity() {
      const buckets = ['B1', 'B2', 'B3', 'B4', 'D5', 'M6'];
      for (let b of buckets) {
        let unfilledSlots = 0;
        franchises.forEach(f => {
          const hasB = f.squad.some(p => p.bucket === b);
          if (!hasB) unfilledSlots++;
        });
        const available = players.filter(p => p.bucket === b && p.status === 'AVAILABLE').length;
        if (unfilledSlots > 0 && available <= unfilledSlots) {
          return { scarce: true, bucket: b, available, unfilledSlots };
        }
      }
      return { scarce: false };
    }

    // ========================================================
    // 5. AUCTION OPERATIONAL ACTIONS
    // ========================================================
    function placeBid(franchiseId) {
      // Strict Franchise Isolation Check
      if (currentUser.role === 'FRANCHISE' && currentUser.franchiseId !== franchiseId) {
        showToast("Access denied: Franchise workspace isolation enforced.", "error");
        return;
      }
      if (currentUser.role === 'SPECTATOR' || currentUser.role === 'PLAYER') {
        showToast("Authentication required to place bids.", "error");
        return;
      }

      const f = franchises.find(item => item.id === franchiseId);
      const cur = players[lotIndex];
      if (!f || !cur || cur.status !== 'AVAILABLE' || auctionPaused) return;

      const increment = getBidIncrement(currentBid);
      const nextBid = currentBid + increment;
      const maxBid = calculateMaxBid(franchiseId, cur.bucket);

      if (nextBid > maxBid) {
        showToast(`BID BLOCKED: Max legal bid for ${f.name} is ${maxBid}C`, "error");
        return;
      }

      currentBid = nextBid;
      leadingBidderId = franchiseId;
      timerSeconds = 17;
      timerDeadline = Date.now() + 17000;
      timerRunning = true;
      playBidSound();
      showSpeeder("BID SUBMITTED", `${f.name} placed bid of ${currentBid} Credits for #${cur.id} ${cur.name}`, 600);

      // Audit Actor Identity Formatting
      const identityLabel = currentUser.role === 'FRANCHISE'
        ? (currentUser.identityType === 'COORDINATOR' ? 'Faculty Coordinator' : 'Team Captain')
        : (currentUser.role === 'SUPER_ADMIN' ? 'Super Admin [Direct Override]' : 'Floor Operator');
      
      const actorLabel = currentUser.role === 'FRANCHISE'
        ? `${f.name} (${identityLabel})`
        : identityLabel;

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "BID PLACED",
        details: `${actorLabel} placed bid ${currentBid}C for #${cur.id} ${cur.name}`,
        actorUid: currentUser.uid || 'usr_sys',
        actorRole: currentUser.role,
        identityType: currentUser.identityType || 'OPERATOR',
        franchiseId: f.id,
        bidAmount: currentBid
      });
      saveDatabase();
      broadcastAuthoritativeState();
      startTimer();
      renderCurrentView();
    }

    function passLot(franchiseId) {
      if (!passedFranchiseIds.includes(franchiseId)) {
        passedFranchiseIds.push(franchiseId);
        showToast(`Franchise marked as PASSED`, "info");
        renderCurrentView();
      }
    }

    function reEnterLot(franchiseId) {
      passedFranchiseIds = passedFranchiseIds.filter(id => id !== franchiseId);
      showToast(`Franchise re-entered bidding`, "info");
      renderCurrentView();
    }

    function startTimer() {
      if (timerRunning) return;
      timerRunning = true;
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (!auctionPaused && timerSeconds > 0) {
          timerSeconds--;
          if (timerSeconds <= 5) playWarningTick();
          renderCurrentView();
          if (timerSeconds === 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            renderCurrentView();
            // Force immediate stop on all hourglass animations in DOM
            document.querySelectorAll(".hourglass-loader").forEach(el => {
              el.classList.add("paused", "time-up", "stopped");
            });
            // Auto hammer if top bidder exists
            if (leadingBidderId) {
              openHammerConfirmModal();
            }
          }
        }
      }, 1000);
    }

    function toggleAuctionPause() {
      auctionPaused = !auctionPaused;
      showToast(auctionPaused ? "Auction clock paused" : "Auction clock resumed", "info");
      renderCurrentView();
    }

    function resetAuctionTimer() {
      timerSeconds = 17;
      startTimer();
      showSpeeder("TIMER RESET", "Auction clock restarted at 17s", 500);
      showToast("Timer reset to 17 seconds", "info");
      renderCurrentView();
    }

    function skipPlayer() {
      lotIndex = (lotIndex + 1) % players.length;
      currentBid = players[lotIndex].basePrice;
      leadingBidderId = null;
      timerSeconds = 17;
      passedFranchiseIds = [];
      showSpeeder("SKIPPING LOT...", "Advancing to next player in pool", 600);
      renderCurrentView();
    }

    function drawNextPlayer() {
      skipPlayer();
    }

    // ========================================================
    // SUPER ADMIN HAMMER EXECUTION & ANIMATION (Quv3n1Fshx.svg)
    // ========================================================
    function openHammerConfirmModal() {
      executeHammerSale();
    }

    function executeHammerSale() {
      const cur = players[lotIndex];
      const leader = franchises.find(f => f.id === leadingBidderId);
      if (!leader || !cur) {
        showToast("Cannot hammer: No active franchise bids on this lot yet.", "error");
        return;
      }

      cur.status = "SOLD";
      cur.soldTo = leader.name;
      cur.price = currentBid;
      leader.purse -= currentBid;
      leader.squad.push({ ...cur });

      playHammerSound();

      // Display Hammer Click Animation (plays once, automatically closes after 2.1s)
      const modal = document.getElementById("modalContainer");
      if (modal) {
        modal.innerHTML = `
          <div class="hammer-modal-overlay" onclick="closeModal()">
            <div class="hammer-modal-dialog" onclick="event.stopPropagation();">
              <div class="hammer-sold-badge">HAMMER SALE CONFIRMED</div>
              <div class="hammer-svg-container">
                <img src="auction-hammer.svg?t=${Date.now()}" alt="Hammer Strike Animation" class="hammer-svg-img">
              </div>
              <h2 class="hammer-sold-title">SOLD!</h2>
              <div class="hammer-sold-player">
                <strong>${cur.name}</strong> (${cur.department || cur.branch} · ${cur.bucket})
              </div>
              <div class="hammer-sold-meta">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                  ${getTeamEmblem(leader.id, 24)}
                  <span style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; color: var(--color-orange);">${leader.name}</span>
                </div>
                <div class="font-mono" style="font-size: 1.35rem; font-weight: 800; color: var(--color-green); margin-top: 2px;">
                  ${currentBid} CREDITS
                </div>
              </div>
            </div>
          </div>
        `;
      }

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "PLAYER SOLD",
        details: `${cur.name} (#${cur.id}) sold to ${leader.name} for ${currentBid}C`
      });

      saveDatabase();
      showToast(`SOLD! ${cur.name} to ${leader.name} for ${currentBid}C`, "success");

      // Play animation once (duration 2.033s) and then automatically close
      setTimeout(() => {
        closeModal();
        drawNextPlayer();
      }, 2100);
    }

    function executeHammerUnsold() {
      const cur = players[lotIndex];
      cur.status = "UNSOLD";
      showSpeeder("LOT UNSOLD", `${cur.name} passed unsold at base price`, 800);
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "PLAYER UNSOLD",
        details: `${cur.name} (#${cur.id}) passed unsold at ${cur.basePrice}C`
      });
      saveDatabase();
      showToast(`${cur.name} marked UNSOLD`, "info");
      setTimeout(() => drawNextPlayer(), 800);
    }

    function closeModal() {
      document.getElementById("modalContainer").innerHTML = "";
    }

    // ========================================================
    // 6. CANDIDATE AUCTION PASS MODAL & EXPORT
    // ========================================================
    function openPlayerPassModal(playerId) {
      const p = players.find(item => item.id === playerId) || players[0];
      const modal = document.getElementById("modalContainer");
      modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6); max-width: 500px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-3);">
              <div>
                <span class="label-micro" style="color: var(--color-green);">OFFICIAL ENTRY CREDENTIAL</span>
                <div style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--text-bright);">ATHLETE AUCTION PASS</div>
              </div>
              <button class="btn btn-secondary" style="min-height: 32px; padding: 2px 8px;" onclick="closeModal()">✕</button>
            </div>

            <!-- Printable Pass Card -->
            <div id="passPrintableArea" style="background: var(--surface-1); border: 2px solid var(--border-medium); border-radius: var(--radius-md); padding: var(--space-5); margin: var(--space-4) 0; position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4);">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="acc-logo.jpg" alt="ACC Official Seal" style="width: 42px; height: 42px; border-radius: 8px; border: 1.5px solid var(--border-medium); object-fit: cover; background: #fff;">
                  <div>
                    <div style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 800; color: var(--text-bright); line-height: 1;">ACC 2026</div>
                    <div style="font-size: 0.6875rem; font-weight: 700; color: var(--color-green); text-transform: uppercase;">AVANTHI CRICKET CARNIVAL</div>
                  </div>
                </div>
                <span class="status-badge status-live">VERIFIED PASS</span>
              </div>

              <div style="display: flex; gap: var(--space-4); align-items: center;">
                ${getPlayerAvatar(p, 85, 110)}
                <div>
                  <div class="label-micro" style="color: var(--color-green);">${p.bucket} • ${p.derivedType || 'BATTER'}</div>
                  <div style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 800; color: var(--text-bright); line-height: 1.1;">${p.name}</div>
                  <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">${p.program} · ${p.branch} · Yr ${p.year}</div>
                  <div class="font-mono" style="font-size: 0.75rem; color: var(--text-faint); margin-top: 2px;">Roll: ${p.roll}</div>
                  <div class="price-display" style="font-size: 1.15rem; color: var(--color-orange); margin-top: 4px;">BASE: ${p.basePrice} C</div>
                </div>
              </div>

              <div style="margin-top: var(--space-4); padding-top: var(--space-3); border-top: 1px dashed var(--border-medium); display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 0.6875rem; color: var(--text-muted);">
                  LOT ID: #${p.id}<br>DATE: OCT 2026
                </div>
                <div class="font-mono" style="font-size: 0.6875rem; color: var(--color-green); letter-spacing: 0.1em;">
                  OFFICIAL AUTHENTICATED PASS
                </div>
              </div>
            </div>

            <div style="display: flex; gap: var(--space-3); justify-content: flex-end;">
              <button class="btn btn-secondary" onclick="window.print()">PRINT PASS</button>
              <button class="btn btn-primary" onclick="downloadPassAsImage('${p.name}', '${p.roll}')">SAVE PASS IMAGE</button>
            </div>
          </div>
        </div>
      `;
    }

    function downloadPassAsImage(playerName, roll) {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");

      // Card Background (Crisp Light Theme Credential)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#F6F9FF";
      ctx.fillRect(12, 12, canvas.width - 24, canvas.height - 24);
      ctx.strokeStyle = "#059669";
      ctx.lineWidth = 3;
      ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

      // Header Text
      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText("AVANTHI CRICKET CARNIVAL 2026", 32, 54);
      ctx.fillStyle = "#059669";
      ctx.font = "bold 13px monospace";
      ctx.fillText("OFFICIAL ATHLETE AUCTION PASS", 32, 78);

      // Details
      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(playerName, 32, 138);
      ctx.fillStyle = "#334155";
      ctx.font = "bold 16px monospace";
      ctx.fillText("ROLL: " + roll, 32, 175);
      ctx.fillStyle = "#059669";
      ctx.fillText("STATUS: VERIFIED ELIGIBLE", 32, 205);

      ctx.fillStyle = "#D97706";
      ctx.font = "bold 15px monospace";
      ctx.fillText("AUTHORITATIVE PLAYER AUCTION PLATFORM", 32, 310);

      const link = document.createElement("a");
      link.download = `ACC_PASS_${roll}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("Pass image downloaded successfully", "success");
    }

    // ========================================================
    // 7. CLIENT-SIDE PHOTO CROPPING TO 4:3
    // ========================================================
    function process4to3Photo(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement("canvas");
          const targetW = 400;
          const targetH = 500;
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, targetW, targetH);
          regFormData.photo = canvas.toDataURL("image/jpeg", 0.85);
          renderCurrentView();
          showToast("Photo processed and cropped (4:3)", "success");
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }

    function submitPlayerRegistration() {
      if (!regFormData.name || !regFormData.roll) {
        showToast("Please provide name and roll number", "error");
        return;
      }
      const newPlayer = {
        id: players.length + 1,
        name: regFormData.name,
        roll: regFormData.roll,
        program: regFormData.program,
        branch: regFormData.branch,
        year: regFormData.year,
        bucket: regFormData.bucket,
        derivedType: regFormData.isBatter === 'YES' && regFormData.isBowler === 'YES' ? 'ALL-ROUNDER' : regFormData.isBowler === 'YES' ? 'BOWLER' : 'BATTER',
        battingStyle: regFormData.battingStyle,
        bowlingArm: regFormData.bowlingArm,
        bowlingType: regFormData.bowlingType,
        basePrice: regFormData.basePrice,
        status: "AVAILABLE",
        photo: regFormData.photo || "",
        bio: `Registered athlete from ${regFormData.branch}, Year ${regFormData.year}.`
      };
      players.push(newPlayer);
      saveDatabase();
      showSpeeder("REGISTRATION COMPLETE!", `${newPlayer.name} added to auction lot pool (#${newPlayer.id})`, 1000);
      showToast("Registration submitted! Opening pass...", "success");
      setTimeout(() => {
        switchView("player");
        openPlayerPassModal(newPlayer.id);
      }, 700);
    }

    // ========================================================
    // 8. CSV EXPORT & ROLE SWITCHER
    // ========================================================
    function exportAuditLogCSV() {
      if (currentUser.role !== 'SUPER_ADMIN') {
        showToast("Audit export permission reserved for Super Admin", "error");
        return;
      }
      let csv = "Time,Action,Details,Actor_UID,Actor_Role,Identity_Type,Franchise_ID\n";
      auditLog.forEach(row => {
        csv += `"${row.time}","${row.action}","${(row.details || '').replace(/"/g, '""')}","${row.actorUid || ''}","${row.actorRole || ''}","${row.identityType || ''}","${row.franchiseId || ''}"\n`;
      });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ACC_AUCTION_AUDIT_${Date.now()}.csv`;
      a.click();
      showToast("Master Audit Log CSV Exported", "success");
    }

    // ========================================================
    // CENTRALIZED AUTHENTICATION & LOGIN CONTROLLER
    // ========================================================
    function handleLoginSubmit(e) {
      e.preventDefault();

      if (loginRoleSelection === 'STAFF') {
        const idInput = document.getElementById("loginStaffIdentifier");
        const passInput = document.getElementById("loginStaffSecret");
        if (!idInput || !passInput) return;
        const val = idInput.value.trim().toLowerCase();
        const secret = passInput.value.trim();

        const user = users.find(u => 
          (u.username.toLowerCase() === val || (u.email && u.email.toLowerCase() === val)) &&
          (u.role === 'SUPER_ADMIN' || u.role === 'ADMIN')
        );

        if (!user) {
          showToast("Staff credential not recognized. Contact Tournament Director.", "error");
          return;
        }

        if (user.status === 'LOCKED') {
          showToast("Account locked by Tournament Directorate.", "error");
          return;
        }

        // Validate password (verifies initial bootstrap password or updated password)
        if (secret !== user.passwordHash) {
          showToast("Invalid operational password.", "error");
          return;
        }

        // If Super Admin first time login with mustChangePassword:
        if (user.role === 'SUPER_ADMIN' && user.mustChangePassword) {
          openPasswordChangeModal(user);
          return;
        }

        currentUser = { ...user };
        localStorage.setItem("acc_current_user_2026", JSON.stringify(currentUser));
        auditLog.unshift({
          time: new Date().toLocaleTimeString(),
          action: "STAFF LOGIN",
          details: `${user.name} (${user.role}) authenticated successfully.`
        });
        saveDatabase();
        showToast(`Welcome ${user.name}`, "success");
        switchView("admin");

      } else if (loginRoleSelection === 'FRANCHISE') {
        const fSelect = document.getElementById("loginFranchiseId");
        const passInput = document.getElementById("loginFranchiseSecret");
        if (!fSelect || !passInput) return;
        const fId = parseInt(fSelect.value);
        const secret = passInput.value.trim();
        const targetIdentity = loginFranchiseIdentity; // 'COORDINATOR' or 'TEAM_LEADER'

        const user = users.find(u => u.franchiseId === fId && u.identityType === targetIdentity);
        if (!user) {
          showToast("Franchise account record missing. Contact Super Admin.", "error");
          return;
        }

        if (user.status === 'LOCKED') {
          showToast("Franchise workspace is currently locked by Super Admin.", "error");
          return;
        }

        if (secret !== user.passwordHash) {
          showToast("Invalid franchise access key or PIN.", "error");
          return;
        }

        currentUser = { ...user };
        localStorage.setItem("acc_current_user_2026", JSON.stringify(currentUser));
        const f = franchises.find(item => item.id === fId);
        auditLog.unshift({
          time: new Date().toLocaleTimeString(),
          action: "FRANCHISE LOGIN",
          details: `${user.name} (${user.title}) activated ${f ? f.name : 'Team'} workspace.`
        });
        saveDatabase();
        showToast(`Authenticated: ${user.name} (${f ? f.name : 'Team'})`, "success");
        switchView("franchise");

      } else {
        // PLAYER LOGIN
        const idInput = document.getElementById("loginPlayerIdentifier");
        const passInput = document.getElementById("loginPlayerSecret");
        if (!idInput || !passInput) return;
        const val = idInput.value.trim().toLowerCase();
        const secret = passInput.value.trim();

        // Check in users or players
        let user = users.find(u => 
          u.role === 'PLAYER' && 
          (u.username.toLowerCase() === val || (u.email && u.email.toLowerCase() === val))
        );

        if (!user) {
          // Check in players by roll
          const p = players.find(x => x.roll.toLowerCase() === val);
          if (p) {
            user = {
              uid: `usr_p${p.id}`,
              username: p.roll,
              email: `${p.roll.toLowerCase()}@acc.edu`,
              passwordHash: "Player@2026",
              role: "PLAYER",
              identityType: "ATHLETE",
              name: p.name,
              playerId: p.id,
              status: "ACTIVE"
            };
          }
        }

        if (!user) {
          showToast("Athlete roll number or email not registered.", "error");
          return;
        }

        if (secret !== user.passwordHash && secret !== "Player@2026") {
          showToast("Invalid athlete password or PIN.", "error");
          return;
        }

        currentUser = { ...user };
        localStorage.setItem("acc_current_user_2026", JSON.stringify(currentUser));
        auditLog.unshift({
          time: new Date().toLocaleTimeString(),
          action: "ATHLETE LOGIN",
          details: `${user.name} (${user.username}) accessed athlete portal.`
        });
        saveDatabase();
        showToast(`Welcome Athlete ${user.name}`, "success");
        switchView("player");
      }
    }

    function logoutUser() {
      currentUser = { role: "SPECTATOR", name: "Public Guest", title: "Public Spectator" };
      localStorage.removeItem("acc_current_user_2026");
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "SESSION LOGOUT",
        details: "User signed out. Terminal reset to public spectator."
      });
      saveDatabase();
      showToast("Logged out successfully. Switched to public spectator.", "info");
      switchView("public");
    }

    // ========================================================
    // FIRST-TIME SUPER ADMIN PASSWORD CHANGE MODAL
    // ========================================================
    function openPasswordChangeModal(user) {
      const modal = document.getElementById("modalContainer");
      modal.innerHTML = `
        <div class="modal-overlay">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6); max-width: 480px;">
            <span class="status-badge status-blocked">MANDATORY SECURITY ACTION</span>
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text-bright); margin: 8px 0 4px;">
              CHANGE DEFAULT PASSWORD
            </h2>
            <p style="color: var(--text-muted); font-size: 0.8125rem; margin-bottom: var(--space-4); line-height: 1.5;">
              Your account was initialized with the tournament bootstrap credential. To protect operational governance, you must establish a new operational password before accessing tournament controls.
            </p>

            <form onsubmit="submitPasswordChange(event, '${user.uid}')" style="display: flex; flex-direction: column; gap: var(--space-3);">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">NEW OPERATIONAL PASSWORD</label>
                <input type="password" class="form-input" id="newAdminPassword" placeholder="Minimum 8 characters" required>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">CONFIRM NEW PASSWORD</label>
                <input type="password" class="form-input" id="confirmAdminPassword" placeholder="Re-type new password" required>
              </div>

              <button type="submit" class="btn btn-primary" style="min-height: 48px; font-size: 0.9375rem; margin-top: var(--space-2);">
                UPDATE PASSWORD & ACTIVATE CONSOLE
              </button>
            </form>
          </div>
        </div>
      `;
    }

    function submitPasswordChange(e, uid) {
      e.preventDefault();
      const p1 = document.getElementById("newAdminPassword").value;
      const p2 = document.getElementById("confirmAdminPassword").value;

      if (p1 !== p2) {
        showToast("Passwords do not match.", "error");
        return;
      }
      if (p1.length < 6) {
        showToast("Password must be at least 6 characters.", "error");
        return;
      }

      const target = users.find(u => u.uid === uid);
      if (target) {
        target.passwordHash = p1;
        target.mustChangePassword = false;
        currentUser = { ...target };
        localStorage.setItem("acc_current_user_2026", JSON.stringify(currentUser));
        auditLog.unshift({
          time: new Date().toLocaleTimeString(),
          action: "PASSWORD UPDATED",
          details: `Super Admin (${target.name}) updated initial operational password.`
        });
        saveDatabase();
        closeModal();
        showToast("Operational password secured. Super Admin access granted.", "success");
        switchView("admin");
      }
    }

    // ========================================================
    // FORGOT PASSWORD / CREDENTIAL RECOVERY MODAL
    // ========================================================
    function openForgotPasswordModal(defaultRole = 'PLAYER') {
      const modal = document.getElementById("modalContainer");
      modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6); max-width: 460px;">
            <span class="label-micro" style="color: var(--color-green);">CREDENTIAL RECOVERY</span>
            <h2 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: var(--text-bright); margin: 6px 0 12px;">
              REQUEST CREDENTIAL RESET
            </h2>
            <p style="color: var(--text-muted); font-size: 0.8125rem; margin-bottom: var(--space-4); line-height: 1.5;">
              Submit your account details. The Tournament Directorate / Super Admin will verify and reset your access key.
            </p>

            <form onsubmit="submitForgotPassword(event)" style="display: flex; flex-direction: column; gap: var(--space-3);">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">ROLE FAMILY</label>
                <select class="form-select" id="resetReqRole">
                  <option value="PLAYER" ${defaultRole === 'PLAYER' ? 'selected' : ''}>Athlete / Player</option>
                  <option value="FRANCHISE" ${defaultRole === 'FRANCHISE' ? 'selected' : ''}>Franchise (Coordinator / Captain)</option>
                  <option value="STAFF" ${defaultRole === 'STAFF' ? 'selected' : ''}>Staff / Operator</option>
                </select>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">ROLL NUMBER / FRANCHISE NAME / EMAIL</label>
                <input type="text" class="form-input" id="resetReqIdentifier" placeholder="e.g. 26811A0501, Titans, or admin@acc.edu" required>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">CONTACT EMAIL / MOBILE</label>
                <input type="text" class="form-input" id="resetReqContact" placeholder="Where you can be reached" required>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">INCIDENT REASON</label>
                <input type="text" class="form-input" id="resetReqReason" placeholder="Forgot PIN, Key mismatch, etc.">
              </div>

              <div style="display: flex; gap: var(--space-2); margin-top: var(--space-2); justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">CANCEL</button>
                <button type="submit" class="btn btn-primary">SUBMIT REQUEST</button>
              </div>
            </form>
          </div>
        </div>
      `;
    }

    function submitForgotPassword(e) {
      e.preventDefault();
      const role = document.getElementById("resetReqRole").value;
      const identifier = document.getElementById("resetReqIdentifier").value.trim();
      const contact = document.getElementById("resetReqContact").value.trim();
      const reason = document.getElementById("resetReqReason").value.trim();

      passwordResetRequests.push({
        id: Date.now(),
        role: role,
        identifier: identifier,
        contact: contact,
        reason: reason,
        time: new Date().toLocaleTimeString()
      });

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "RESET REQUESTED",
        details: `Credential recovery requested for [${role}] ${identifier}`
      });

      saveDatabase();
      closeModal();
      showToast("Password reset request submitted. Contact Super Admin or check registered email.", "info");
    }

    // ========================================================
    // SUPER ADMIN GOVERNANCE CONTROLLERS
    // ========================================================
    function toggleFranchiseLock(fId) {
      if (currentUser.role !== 'SUPER_ADMIN') return;
      const fUsers = users.filter(u => u.franchiseId === fId);
      const isCurrentlyLocked = fUsers.some(u => u.status === 'LOCKED');
      const nextStatus = isCurrentlyLocked ? 'ACTIVE' : 'LOCKED';

      fUsers.forEach(u => u.status = nextStatus);
      const f = franchises.find(item => item.id === fId);
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "FRANCHISE GOVERNANCE",
        details: `Super Admin set ${f ? f.name : 'Franchise #' + fId} account status to ${nextStatus}.`
      });
      saveDatabase();
      showToast(`Franchise #${fId} accounts updated to ${nextStatus}`, "info");
      renderCurrentView();
    }

    function resetFranchiseCredential(fId) {
      if (currentUser.role !== 'SUPER_ADMIN') return;
      const f = franchises.find(item => item.id === fId);
      const fUsers = users.filter(u => u.franchiseId === fId);
      const defaultPass = `${(f ? f.name : 'Team').replace(/\s+/g, '')}#2026`;

      fUsers.forEach(u => u.passwordHash = defaultPass);
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "CREDENTIAL RESET",
        details: `Super Admin reset credentials for ${f ? f.name : 'Franchise #' + fId} to default.`
      });
      saveDatabase();
      showToast(`Franchise #${fId} credentials reset. Default key re-established.`, "success");
      renderCurrentView();
    }

    function provisionStaffHandler(e) {
      e.preventDefault();
      if (currentUser.role !== 'SUPER_ADMIN') return;

      const name = document.getElementById("newStaffName").value.trim();
      const email = document.getElementById("newStaffEmail").value.trim();
      const username = document.getElementById("newStaffUser").value.trim();
      const pass = document.getElementById("newStaffPass").value.trim();

      const newUser = {
        uid: `usr_handler_${Date.now()}`,
        username: username,
        email: email,
        passwordHash: pass,
        role: "ADMIN",
        identityType: "OPERATOR",
        name: name,
        title: "Auction Floor Handler",
        status: "ACTIVE",
        mustChangePassword: false,
        franchiseId: null,
        playerId: null
      };

      users.push(newUser);
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "STAFF PROVISIONED",
        details: `Super Admin provisioned Operator [${username}] (${name}).`
      });
      saveDatabase();
      showToast(`Operational Handler ${name} provisioned!`, "success");
      renderCurrentView();
    }

    function resolvePasswordReset(idx) {
      if (currentUser.role !== 'SUPER_ADMIN') return;
      const req = passwordResetRequests[idx];
      if (req) {
        auditLog.unshift({
          time: new Date().toLocaleTimeString(),
          action: "RESET RESOLVED",
          details: `Super Admin resolved credential recovery for ${req.identifier}.`
        });
        passwordResetRequests.splice(idx, 1);
        saveDatabase();
        showToast("Reset request marked resolved.", "info");
        renderCurrentView();
      }
    }

    function openUndoModal() {
      if (auditLog.length === 0) return;
      const modal = document.getElementById("modalContainer");
      modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6);">
            <span class="status-badge status-blocked">OPERATIONAL CORRECTION</span>
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text-bright); margin: 6px 0;">
              REVERT LAST AUCTION TRANSACTION
            </h2>
            <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: var(--space-4);">
              Are you sure you want to undo the last logged auction transaction?
            </p>
            <div style="display: flex; gap: var(--space-3); justify-content: flex-end;">
              <button class="btn btn-secondary" onclick="closeModal()">CANCEL</button>
              <button class="btn btn-danger" onclick="executeUndoSale()">REVERT TRANSACTION</button>
            </div>
          </div>
        </div>
      `;
    }

    function executeUndoSale() {
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "TRANSACTION REVERTED",
        details: `${currentUser.name} manually reverted previous auction state.`
      });
      closeModal();
      saveDatabase();
      showToast("Previous transaction reverted", "info");
      renderCurrentView();
    }

    // ========================================================
    // 9. ROUTING, STRICT GUARDS & DISPATCHER
    // ========================================================
    function getPageViewLoadingInfo(viewName) {
      switch (viewName) {
        case "public":
        case "live":
          return { title: "LOADING ACC 2026 LIVE TERMINAL...", sub: "Synchronizing live auction feed & bidding console" };
        case "players":
          return { title: "LOADING PLAYERS DIRECTORY...", sub: "Fetching verified athlete profiles & stats" };
        case "teams":
          return { title: "LOADING 11 FRANCHISE ROSTERS...", sub: "Calculating purse reserves and squad quotas" };
        case "login":
          return { title: "OPENING SECURE AUTHENTICATION GATEWAY...", sub: "RBAC verification for Player, Franchise & Staff" };
        case "franchise":
          return { title: "ACCESSING FRANCHISE COMMAND CENTER...", sub: "Authorizing bidding controls and squad management" };
        case "admin":
          return { title: "LOADING SUPER ADMIN CONSOLE...", sub: "Verifying master governance authority & logs" };
        case "player":
          return { title: "LOADING ATHLETE PORTAL...", sub: "Fetching personal profile and allocation status" };
        case "projector":
          return { title: "INITIALIZING 4K BROADCAST PROJECTOR...", sub: "Calibrating high-contrast live lot presentation" };
        default:
          return { title: "LOADING ACC 2026 OS...", sub: "Synchronizing Authoritative Cloud State" };
      }
    }

    function switchView(viewName) {
      // STRICT ROUTE GUARDS
      if (viewName === "admin") {
        if (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "ADMIN") {
          showToast("Authentication required to access operational console.", "warning");
          viewName = "login";
        }
      }

      if (viewName === "franchise") {
        if (currentUser.role !== "FRANCHISE" && currentUser.role !== "SUPER_ADMIN") {
          showToast("Franchise authentication required.", "warning");
          viewName = "login";
        }
      }

      if (viewName === "player") {
        if (currentUser.role !== "PLAYER" && currentUser.role !== "SUPER_ADMIN") {
          showToast("Athlete authentication required to access personal portal.", "warning");
          viewName = "login";
        }
      }

      // Show first original speeder loading animation on page navigation
      const info = getPageViewLoadingInfo(viewName);
      showSpeederOverlay(info.title, info.sub);

      currentView = viewName;
      window.location.hash = viewName;
      if (viewName === "projector") {
        document.body.classList.add("projector-active");
      } else {
        document.body.classList.remove("projector-active");
      }
      renderHeaderNav();
      renderCurrentView();

      // Keep speeder visible for 550ms for smooth, authentic page transition
      hideSpeederOverlay(550);
    }

    // ========================================================
    // FIRST ORIGINAL SPEEDER OVERLAY & LIVE USERS CONTROLLER
    // ========================================================
    let speederOverlayTimer = null;
    let portalLoadStartTime = Date.now();

    function showSpeederOverlay(title = "LOADING ACC 2026 OS...", sub = "Synchronizing Authoritative Cloud State") {
      const el = document.getElementById("speederOverlay");
      if (el) {
        const t = document.getElementById("speederMsg");
        const s = document.getElementById("speederSub");
        if (t) t.textContent = title;
        if (s) s.textContent = sub;
        el.classList.remove("hidden");
        el.style.display = "flex";
        el.style.opacity = "1";
        el.style.visibility = "visible";
      }
    }

    function hideSpeederOverlay(delay = 0) {
      if (speederOverlayTimer) clearTimeout(speederOverlayTimer);
      speederOverlayTimer = setTimeout(() => {
        const el = document.getElementById("speederOverlay");
        if (el) {
          el.style.opacity = "0";
          setTimeout(() => {
            el.classList.add("hidden");
            el.style.display = "none";
            el.style.visibility = "hidden";
          }, 350);
        }
      }, delay);
    }

    function showLoadingOverlay(title = "LOADING ACC 2026 OS...", sub = "Synchronizing Authoritative Cloud State") {
      showSpeederOverlay(title, sub);
    }

    function hideLoadingOverlay() {
      // Must stay long enough for user to clearly see the speeder loading animation!
      const elapsed = Date.now() - portalLoadStartTime;
      const minDisplayMs = 1600; // minimum stay time so animation is never missed
      const delay = Math.max(0, minDisplayMs - elapsed);
      hideSpeederOverlay(delay);
    }

    function updateLiveUsersCount(count) {
      liveUsersCount = Math.max(1, count);
      const el = document.getElementById("liveUsersCount");
      if (el) el.textContent = liveUsersCount;
    }

    // ========================================================
    // HEADER NAVIGATION CONTROLLER (SINGLE LOGIN / LIVE USERS)
    // ========================================================
    function renderHeaderNav() {
      const nav = document.getElementById("mainNavLinks");
      const auth = document.getElementById("headerAuthArea");

      // Dynamic header strictly conforming to Master Specifications:
      if (currentUser.role === "SPECTATOR") {
        // PUBLIC HEADER: Strictly only Players, Teams, Live Auction, LIVE USERS, and LOGIN
        nav.innerHTML = `
          <button class="nav-link-btn ${currentView === 'public' ? 'active' : ''}" onclick="switchView('public')">PLAYERS</button>
          <button class="nav-link-btn ${currentView === 'teams' ? 'active' : ''}" onclick="switchView('teams')">TEAMS</button>
          <button class="nav-link-btn ${currentView === 'live' ? 'active' : ''}" onclick="switchView('live')">LIVE AUCTION</button>
        `;
        auth.innerHTML = `
          <div class="live-users-pill">
            <span class="label-micro" style="color: var(--color-green); margin: 0; font-size: 0.65rem;">LIVE USERS</span>
            <span id="liveUsersCount" style="font-weight: 800; color: var(--text-bright);">${liveUsersCount}</span>
          </div>
          <button class="btn btn-primary" style="min-height: 36px; padding: 6px 18px; font-size: 0.75rem; letter-spacing: 0.05em;" onclick="switchView('login')">LOGIN</button>
        `;
      } else if (currentUser.role === "SUPER_ADMIN") {
        // SUPER ADMIN HEADER: ACC 2026 | SUPER ADMIN | LIVE USERS | Live Auction | Admin Console | Projector | LOGOUT
        nav.innerHTML = `
          <div style="display: flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(5, 150, 105, 0.12); border: 1px solid var(--color-green); border-radius: 6px;">
            <span class="status-badge status-connected" style="font-size: 0.65rem; padding: 2px 6px;">SUPER ADMIN</span>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-bright);">${currentUser.name}</span>
          </div>
          <div class="live-users-pill">
            <span class="label-micro" style="color: var(--color-green); margin: 0; font-size: 0.65rem;">LIVE USERS</span>
            <span id="liveUsersCount" style="font-weight: 800; color: var(--text-bright);">${liveUsersCount}</span>
          </div>
          <button class="nav-link-btn ${currentView === 'live' ? 'active' : ''}" onclick="switchView('live')">LIVE AUCTION</button>
          <button class="nav-link-btn ${currentView === 'admin' ? 'active' : ''}" onclick="switchView('admin')">ADMIN CONSOLE</button>
          <button class="nav-link-btn ${currentView === 'projector' ? 'active' : ''}" onclick="switchView('projector')">PROJECTOR</button>
        `;
        auth.innerHTML = `
          <button class="btn btn-secondary" style="min-height: 36px; padding: 6px 14px; font-size: 0.75rem; color: var(--color-red); border-color: rgba(225,29,72,0.3);" onclick="logoutUser()">LOGOUT</button>
        `;
      } else if (currentUser.role === "ADMIN") {
        // ADMIN / HANDLER HEADER: ACC 2026 | OPERATOR | LIVE USERS | Live Auction | Auction Handler | LOGOUT
        nav.innerHTML = `
          <div style="display: flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(2, 132, 199, 0.12); border: 1px solid var(--color-blue); border-radius: 6px;">
            <span class="status-badge status-live" style="font-size: 0.65rem; padding: 2px 6px;">OPERATOR</span>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-bright);">${currentUser.name}</span>
          </div>
          <div class="live-users-pill">
            <span class="label-micro" style="color: var(--color-green); margin: 0; font-size: 0.65rem;">LIVE USERS</span>
            <span id="liveUsersCount" style="font-weight: 800; color: var(--text-bright);">${liveUsersCount}</span>
          </div>
          <button class="nav-link-btn ${currentView === 'live' ? 'active' : ''}" onclick="switchView('live')">LIVE AUCTION</button>
          <button class="nav-link-btn ${currentView === 'admin' ? 'active' : ''}" onclick="switchView('admin')">AUCTION HANDLER</button>
        `;
        auth.innerHTML = `
          <button class="btn btn-secondary" style="min-height: 36px; padding: 6px 14px; font-size: 0.75rem; color: var(--color-red); border-color: rgba(225,29,72,0.3);" onclick="logoutUser()">LOGOUT</button>
        `;
      } else if (currentUser.role === "FRANCHISE") {
        // FRANCHISE HEADER: ACC 2026 | [FRANCHISE NAME] ([IDENTITY]) | Purse: [X]C | LIVE USERS | LIVE FLOOR | SQUAD | LOGOUT
        const myF = franchises.find(f => f.id === currentUser.franchiseId) || franchises[0];
        const identityText = currentUser.identityType === 'COORDINATOR' ? 'Coordinator' : 'Captain';
        nav.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px; padding: 4px 10px; background: var(--surface-2); border: 1px solid var(--border-medium); border-radius: 6px;">
            ${getTeamEmblem(myF.id, 24)}
            <span style="font-size: 0.8125rem; font-weight: 800; color: var(--text-bright);">${myF.name}</span>
            <span class="status-badge status-connected" style="font-size: 0.625rem; padding: 2px 5px;">${identityText}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: rgba(5, 150, 105, 0.1); border-radius: 6px;">
            <span class="label-micro" style="font-size: 0.65rem;">PURSE:</span>
            <span class="price-display" style="font-size: 0.95rem; color: var(--color-green); font-weight: 800;">${myF.purse} C</span>
          </div>
          <div class="live-users-pill">
            <span class="label-micro" style="color: var(--color-green); margin: 0; font-size: 0.65rem;">LIVE USERS</span>
            <span id="liveUsersCount" style="font-weight: 800; color: var(--text-bright);">${liveUsersCount}</span>
          </div>
          <button class="nav-link-btn ${currentView === 'live' ? 'active' : ''}" onclick="switchView('live')">LIVE FLOOR</button>
          <button class="nav-link-btn ${currentView === 'franchise' ? 'active' : ''}" onclick="switchView('franchise')">SQUAD</button>
        `;
        auth.innerHTML = `
          <button class="btn btn-secondary" style="min-height: 36px; padding: 6px 14px; font-size: 0.75rem; color: var(--color-red); border-color: rgba(225,29,72,0.3);" onclick="logoutUser()">LOGOUT</button>
        `;
      } else if (currentUser.role === "PLAYER") {
        // PLAYER HEADER: ACC 2026 | [PLAYER NAME] | LIVE USERS | MY STATUS | PLAYER PASS | LIVE AUCTION | LOGOUT
        nav.innerHTML = `
          <div style="display: flex; align-items: center; gap: 6px; padding: 4px 10px; background: var(--surface-2); border: 1px solid var(--border-medium); border-radius: 6px;">
            <span class="status-badge status-connected" style="font-size: 0.65rem; padding: 2px 6px;">ATHLETE</span>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-bright);">${currentUser.name}</span>
          </div>
          <div class="live-users-pill">
            <span class="label-micro" style="color: var(--color-green); margin: 0; font-size: 0.65rem;">LIVE USERS</span>
            <span id="liveUsersCount" style="font-weight: 800; color: var(--text-bright);">${liveUsersCount}</span>
          </div>
          <button class="nav-link-btn ${currentView === 'player' ? 'active' : ''}" onclick="switchView('player')">MY STATUS</button>
          <button class="nav-link-btn" onclick="openPlayerPassModal(${currentUser.playerId || 1})">PLAYER PASS</button>
          <button class="nav-link-btn ${currentView === 'live' ? 'active' : ''}" onclick="switchView('live')">LIVE AUCTION</button>
        `;
        auth.innerHTML = `
          <button class="btn btn-secondary" style="min-height: 36px; padding: 6px 14px; font-size: 0.75rem; color: var(--color-red); border-color: rgba(225,29,72,0.3);" onclick="logoutUser()">LOGOUT</button>
        `;
      }

      // Populate Mobile Bottom Navigation
      const bottomNav = document.getElementById("mobileBottomNav");
      if (bottomNav) {
        if (currentUser.role === "FRANCHISE") {
          bottomNav.innerHTML = `
            <button class="mobile-nav-btn ${currentView === 'franchise' ? 'active' : ''}" onclick="switchView('franchise')">TERMINAL</button>
            <button class="mobile-nav-btn ${currentView === 'live' ? 'active' : ''}" onclick="switchView('live')">AUCTION</button>
            <button class="mobile-nav-btn ${currentView === 'teams' ? 'active' : ''}" onclick="switchView('teams')">SQUADS</button>
            <button class="mobile-nav-btn" onclick="logoutUser()">LOGOUT</button>
          `;
        } else if (currentUser.role === "SUPER_ADMIN") {
          bottomNav.innerHTML = `
            <button class="mobile-nav-btn ${currentView === 'admin' ? 'active' : ''}" onclick="switchView('admin')">CONSOLE</button>
            <button class="mobile-nav-btn ${currentView === 'live' ? 'active' : ''}" onclick="switchView('live')">LIVE</button>
            <button class="mobile-nav-btn ${currentView === 'projector' ? 'active' : ''}" onclick="switchView('projector')">PROJECTOR</button>
            <button class="mobile-nav-btn" onclick="logoutUser()">LOGOUT</button>
          `;
        } else if (currentUser.role === "ADMIN") {
          bottomNav.innerHTML = `
            <button class="mobile-nav-btn ${currentView === 'admin' ? 'active' : ''}" onclick="switchView('admin')">HANDLER</button>
            <button class="mobile-nav-btn ${currentView === 'live' ? 'active' : ''}" onclick="switchView('live')">LIVE</button>
            <button class="mobile-nav-btn ${currentView === 'public' ? 'active' : ''}" onclick="switchView('public')">ROSTER</button>
            <button class="mobile-nav-btn" onclick="logoutUser()">LOGOUT</button>
          `;
        } else if (currentUser.role === "PLAYER") {
          bottomNav.innerHTML = `
            <button class="mobile-nav-btn ${currentView === 'player' ? 'active' : ''}" onclick="switchView('player')">STATUS</button>
            <button class="mobile-nav-btn" onclick="openPlayerPassModal(${currentUser.playerId || 1})">PASS</button>
            <button class="mobile-nav-btn ${currentView === 'live' ? 'active' : ''}" onclick="switchView('live')">AUCTION</button>
            <button class="mobile-nav-btn" onclick="logoutUser()">LOGOUT</button>
          `;
        } else {
          bottomNav.innerHTML = `
            <button class="mobile-nav-btn ${currentView === 'public' ? 'active' : ''}" onclick="switchView('public')">PLAYERS</button>
            <button class="mobile-nav-btn ${currentView === 'teams' ? 'active' : ''}" onclick="switchView('teams')">TEAMS</button>
            <button class="mobile-nav-btn ${currentView === 'live' ? 'active' : ''}" onclick="switchView('live')">LIVE</button>
            <button class="mobile-nav-btn ${currentView === 'login' ? 'active' : ''}" onclick="switchView('login')">LOGIN</button>
          `;
        }
      }
    }

    // ========================================================
    // 10. REALTIME FIREBASE AUTHORITATIVE REHYDRATION & PRESENCE
    // ========================================================
    const DEFAULT_FIREBASE_CONFIG = {
      apiKey: "AIzaSyC3HX53aAbeWqYGTSUvl59xEBeQNefx0sA",
      authDomain: "studio-6471864054-30ce7.firebaseapp.com",
      projectId: "studio-6471864054-30ce7",
      storageBucket: "studio-6471864054-30ce7.firebasestorage.app",
      messagingSenderId: "830366253821",
      appId: "1:830366253821:web:74186cd15282b396053494",
      databaseURL: "https://studio-6471864054-30ce7-default-rtdb.firebaseio.com"
    };

    let fbDb = null;
    let fbRtdb = null;
    let auctionDocRef = null;
    let myPresenceRef = null;
    let myConnId = null;
    let broadcastChannel = null;

    function initFirebaseSync() {
      // Show loading overlay on refresh / page load
      showLoadingOverlay("LOADING LATEST AUCTION STATE...", "Synchronizing authoritative cloud state");

      // Local multi-tab channel
      try {
        if (typeof BroadcastChannel !== "undefined") {
          broadcastChannel = new BroadcastChannel("acc_auction_sync_channel");
          broadcastChannel.onmessage = (event) => {
            if (event.data && event.data.type === "AUCTION_STATE_UPDATE") {
              applyAuthoritativeAuctionState(event.data.payload, false);
            }
          };
        }
      } catch (e) {}

      // Initialize Firebase App
      try {
        if (typeof firebase !== "undefined") {
          if (!firebase.apps.length) {
            firebase.initializeApp(DEFAULT_FIREBASE_CONFIG);
          }
          fbDb = firebase.firestore();
          fbRtdb = firebase.database();
        }
      } catch (err) {
        console.warn("Firebase initialization note:", err);
      }

      // Rehydrate Authoritative State from Firestore
      if (fbDb) {
        auctionDocRef = fbDb.collection("acc_auctions").doc("acc_main_2026");

        // Guaranteed safety timer: ensure speeder overlay stays visible for min duration and hides cleanly
        const safetyHideTimer = setTimeout(() => {
          hideLoadingOverlay();
        }, 1600);

        // Single authoritative fetch on load / refresh
        auctionDocRef.get().then((docSnap) => {
          clearTimeout(safetyHideTimer);
          if (docSnap.exists) {
            applyAuthoritativeAuctionState(docSnap.data(), false);
          } else {
            broadcastAuthoritativeState();
          }
          hideLoadingOverlay();
        }).catch((err) => {
          clearTimeout(safetyHideTimer);
          console.warn("Authoritative fetch note:", err);
          hideLoadingOverlay();
        });

        // Realtime Firestore Listener: Keeps truth synchronized across all screens without reload
        auctionDocRef.onSnapshot((docSnap) => {
          if (docSnap.exists) {
            applyAuthoritativeAuctionState(docSnap.data(), false);
          }
        }, (err) => console.warn("Firestore listener note:", err));
      } else {
        setTimeout(hideLoadingOverlay, 700);
      }

      // Initialize Realtime Presence Tracking
      initPresenceTracking();
    }

    function initPresenceTracking() {
      myConnId = "conn_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();

      if (fbRtdb) {
        try {
          const connectedRef = fbRtdb.ref(".info/connected");
          myPresenceRef = fbRtdb.ref("presence/" + myConnId);

          connectedRef.on("value", (snap) => {
            if (snap.val() === true) {
              myPresenceRef.onDisconnect().remove();
              const sessionPayload = {
                connId: myConnId,
                uid: currentUser.uid || "anon",
                role: currentUser.role || "SPECTATOR",
                identityType: currentUser.identityType || "PUBLIC",
                franchiseId: currentUser.franchiseId || null,
                page: currentView,
                connectedAt: firebase.database.ServerValue.TIMESTAMP,
                lastHeartbeat: Date.now()
              };
              myPresenceRef.set(sessionPayload);
            }
          });

          // Heartbeat every 20 seconds
          setInterval(() => {
            if (myPresenceRef) {
              myPresenceRef.update({ lastHeartbeat: Date.now(), page: currentView });
            }
          }, 20000);

          // Page visibility state tracking
          document.addEventListener("visibilitychange", () => {
            if (myPresenceRef) {
              myPresenceRef.update({
                status: document.visibilityState === "visible" ? "ONLINE" : "IDLE",
                lastHeartbeat: Date.now()
              });
            }
          });

          // Presence Listener: Count active connected users/sessions
          const presenceListRef = fbRtdb.ref("presence");
          presenceListRef.on("value", (snapshot) => {
            const val = snapshot.val();
            if (!val) {
              updateLiveUsersCount(1);
              return;
            }
            const now = Date.now();
            // Count entries active in the last 60 seconds
            const active = Object.values(val).filter(s => (now - (s.lastHeartbeat || 0)) < 60000);
            const authUids = new Set();
            let count = 0;
            active.forEach(s => {
              if (s.uid && s.uid !== "anon") {
                if (!authUids.has(s.uid)) {
                  authUids.add(s.uid);
                  count++;
                }
              } else {
                count++;
              }
            });
            updateLiveUsersCount(Math.max(1, count));
          });
        } catch (err) {
          console.warn("RTDB presence setup note:", err);
        }
      }
    }

    function broadcastAuthoritativeState() {
      const payload = {
        lotIndex,
        currentBid,
        leadingBidderId,
        timerSeconds,
        timerDeadline: timerDeadline || (Date.now() + timerSeconds * 1000),
        timerRunning,
        auctionPaused,
        passedFranchiseIds,
        franchises,
        players,
        auditLog,
        timestamp: Date.now()
      };

      saveDatabase();

      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage({ type: "AUCTION_STATE_UPDATE", payload });
        } catch (e) {}
      }

      if (auctionDocRef) {
        auctionDocRef.set(payload, { merge: true }).catch(err => console.log("Firestore sync note:", err));
      }
    }

    function applyAuthoritativeAuctionState(data, broadcast = false) {
      if (!data) return;

      lotIndex = typeof data.lotIndex === "number" ? data.lotIndex : lotIndex;
      currentBid = typeof data.currentBid === "number" ? data.currentBid : currentBid;
      leadingBidderId = data.leadingBidderId !== undefined ? data.leadingBidderId : leadingBidderId;
      auctionPaused = !!data.auctionPaused;
      passedFranchiseIds = Array.isArray(data.passedFranchiseIds) ? data.passedFranchiseIds : passedFranchiseIds;

      // Server-authoritative timer deadline calculation
      if (data.timerDeadline) {
        timerDeadline = data.timerDeadline;
        if (data.timerRunning && !data.auctionPaused) {
          const remaining = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
          timerSeconds = remaining;
          if (remaining <= 0) {
            timerRunning = false;
          } else {
            timerRunning = true;
            startTimer();
          }
        } else {
          timerSeconds = typeof data.timerSeconds === "number" ? data.timerSeconds : 0;
          timerRunning = false;
        }
      }

      if (Array.isArray(data.franchises) && data.franchises.length > 0) {
        franchises = data.franchises;
      }
      if (Array.isArray(data.players) && data.players.length > 0) {
        players = data.players;
      }
      if (Array.isArray(data.auditLog) && data.auditLog.length > 0) {
        auditLog = data.auditLog;
      }

      updateTimerDisplay();
      renderHeaderNav();
      renderCurrentView();
    }
    function renderCurrentView() {
      const main = document.getElementById("appMain");
      if (currentView === "public") main.innerHTML = renderPublicView();
      else if (currentView === "live") main.innerHTML = renderLiveAuctionView();
      else if (currentView === "franchise") main.innerHTML = renderFranchiseTerminalView();
      else if (currentView === "teams") main.innerHTML = render11FranchisesView();
      else if (currentView === "register") main.innerHTML = renderPlayerRegistrationView();
      else if (currentView === "player") main.innerHTML = renderPlayerPortalView();
      else if (currentView === "admin") main.innerHTML = renderAdminConsoleView();
      else if (currentView === "projector") main.innerHTML = renderProjectorView();
      else if (currentView === "login") main.innerHTML = renderLoginView();
      else main.innerHTML = renderPublicView();

      renderHeaderNav();
    }

    function showToast(msg, type = "info") {
      const container = document.getElementById("toastContainer");
      const item = document.createElement("div");
      item.className = "toast-item";
      if (type === "error") item.style.borderColor = "var(--color-red)";
      if (type === "success") item.style.borderColor = "var(--color-green)";
      item.innerText = msg;
      container.appendChild(item);
      setTimeout(() => {
        item.style.opacity = "0";
        setTimeout(() => item.remove(), 200);
      }, 3000);
    }

    // ========================================================
    // 10. INITIALIZATION
    // ========================================================
    window.addEventListener("DOMContentLoaded", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && ["public", "live", "franchise", "teams", "register", "player", "admin", "projector", "login"].includes(hash)) {
        currentView = hash;
      }
      renderCurrentView();
      initFirebaseSync();
      startTimer();
      // Ensure Opal background video autoplays seamlessly across desktop and mobile
      const opalVid = document.querySelector(".opal-bg-video");
      if (opalVid) {
        opalVid.muted = true;
        const playPromise = opalVid.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            const playOnInteraction = () => {
              opalVid.play();
              window.removeEventListener("touchstart", playOnInteraction);
              window.removeEventListener("click", playOnInteraction);
              window.removeEventListener("scroll", playOnInteraction);
            };
            window.addEventListener("touchstart", playOnInteraction, { passive: true, once: true });
            window.addEventListener("click", playOnInteraction, { passive: true, once: true });
            window.addEventListener("scroll", playOnInteraction, { passive: true, once: true });
          });
        }
      }
    });

    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && currentView !== hash) {
        switchView(hash);
      }
    });
  </script>
</body>
</html>
'''

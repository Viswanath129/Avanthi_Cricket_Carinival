
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
      // 4. Sample Players
      { uid: "usr_p1", username: "26811A0501", email: "saiteja@acc.edu", passwordHash: "Player@2026", role: "PLAYER", identityType: "PLAYER", name: "Sai Teja", playerId: 1, status: "ACTIVE" },
      { uid: "usr_p2", username: "25811A0412", email: "karthik@acc.edu", passwordHash: "Player@2026", role: "PLAYER", identityType: "PLAYER", name: "Karthik Verma", playerId: 2, status: "ACTIVE" }
    ];

    let users = JSON.parse(localStorage.getItem("acc_users_2026")) || INITIAL_USERS;
    let passwordResetRequests = JSON.parse(localStorage.getItem("acc_reset_requests_2026")) || [];
    let currentUser = JSON.parse(localStorage.getItem("acc_current_user_2026")) || { role: "SPECTATOR", name: "Public Guest", title: "Public Spectator" };
    let loginRoleSelection = 'PLAYER';
    let loginFranchiseIdentity = 'COORDINATOR';
    let franchiseLoginSelection = 1;
    // Ensure ACC website tournament logo is never used as player avatar placeholder
    players.forEach(p => { if (p.photo === 'acc-logo.png' || p.photo === 'acc-logo.png') p.photo = ''; });
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
        broadcastAuthoritativeState();
        showToast(`Franchise marked as PASSED`, "info");
        renderCurrentView();
      }
    }

    function reEnterLot(franchiseId) {
      passedFranchiseIds = passedFranchiseIds.filter(id => id !== franchiseId);
      broadcastAuthoritativeState();
      showToast(`Franchise re-entered bidding`, "info");
      renderCurrentView();
    }

    function startTimer() {
      if (timerRunning) return;
      timerRunning = true;
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (!auctionPaused && timerSeconds > 0) {
          const sOffset = (window.RealtimeStore && window.RealtimeStore.state.connection.serverTimeOffset) || 0;
          if (timerDeadline) {
            const serverNow = Date.now() + sOffset;
            const remaining = Math.max(0, Math.ceil((timerDeadline - serverNow) / 1000));
            timerSeconds = remaining;
          } else {
            timerSeconds--;
          }
          if (timerSeconds <= 5 && timerSeconds > 0) playWarningTick();
          updateTimerDisplay();
          if (timerSeconds === 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            updateTimerDisplay();
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
      broadcastAuthoritativeState();
      showToast(auctionPaused ? "Auction clock paused" : "Auction clock resumed", "info");
      renderCurrentView();
    }

    function resetAuctionTimer() {
      const sOffset = (window.RealtimeStore && window.RealtimeStore.state.connection.serverTimeOffset) || 0;
      timerSeconds = 17;
      timerDeadline = (Date.now() + sOffset) + 17000;
      timerRunning = true;
      startTimer();
      broadcastAuthoritativeState();
      showSpeeder("TIMER RESET", "Auction clock restarted at 17s", 500);
      showToast("Timer reset to 17 seconds", "info");
      renderCurrentView();
    }

    function skipPlayer() {
      const sOffset = (window.RealtimeStore && window.RealtimeStore.state.connection.serverTimeOffset) || 0;
      lotIndex = (lotIndex + 1) % players.length;
      currentBid = players[lotIndex].basePrice;
      leadingBidderId = null;
      timerSeconds = 17;
      timerDeadline = (Date.now() + sOffset) + 17000;
      timerRunning = true;
      passedFranchiseIds = [];
      showSpeeder("SKIPPING LOT...", "Advancing to next player in pool", 600);
      broadcastAuthoritativeState();
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
        details: `${cur.name} (#${cur.id}) sold to ${leader.name} for ${currentBid}C`,
        actorUid: currentUser.uid || 'usr_sys',
        actorRole: currentUser.role,
        identityType: currentUser.identityType || 'OPERATOR',
        franchiseId: leader.id,
        price: currentBid,
        playerId: cur.id
      });

      saveDatabase();
      broadcastAuthoritativeState();
      showToast(`SOLD! ${cur.name} to ${leader.name} for ${currentBid}C`, "success");

      // Play animation once (duration 2.033s) and then automatically advance
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
        details: `${cur.name} (#${cur.id}) passed unsold at ${cur.basePrice}C`,
        actorUid: currentUser.uid || 'usr_sys',
        actorRole: currentUser.role,
        identityType: currentUser.identityType || 'OPERATOR',
        playerId: cur.id
      });
      saveDatabase();
      broadcastAuthoritativeState();
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
                <div style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--text-bright);">PLAYER AUCTION PASS</div>
              </div>
              <button class="btn btn-secondary" style="min-height: 32px; padding: 2px 8px;" onclick="closeModal()">✕</button>
            </div>

            <!-- Printable Pass Card -->
            <div id="passPrintableArea" style="background: var(--surface-1); border: 2px solid var(--border-medium); border-radius: var(--radius-md); padding: var(--space-5); margin: var(--space-4) 0; position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4);">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="acc-logo.png" alt="ACC Official Seal" style="width: 42px; height: 42px; border-radius: 8px; border: 1.5px solid var(--border-medium); object-fit: cover; background: #fff;">
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
      ctx.fillText("OFFICIAL PLAYER AUCTION PASS", 32, 78);

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
        bio: `Registered player from ${regFormData.branch}, Year ${regFormData.year}.`
      };
      players.push(newPlayer);
      saveDatabase();
      broadcastAuthoritativeState();
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

      if (loginRoleSelection === 'ADMIN' || loginRoleSelection === 'STAFF') {
        const idInput = document.getElementById("loginStaffIdentifier") || document.getElementById("loginAdminIdentifier");
        const passInput = document.getElementById("loginStaffSecret") || document.getElementById("loginAdminSecret");
        if (!idInput || !passInput) return;
        const val = idInput.value.trim().toLowerCase();
        const secret = passInput.value.trim();

        const user = users.find(u => 
          (u.username.toLowerCase() === val || (u.email && u.email.toLowerCase() === val)) &&
          (u.role === 'SUPER_ADMIN' || u.role === 'ADMIN')
        );

        if (!user) {
          showToast("Administrator credential not recognized. Contact Tournament Director.", "error");
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
        if (window.RealtimeManager) window.RealtimeManager.switchPresenceIdentity(currentUser);
        auditLog.unshift({
          time: new Date().toLocaleTimeString(),
          action: "ADMIN LOGIN",
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
        if (window.RealtimeManager) window.RealtimeManager.switchPresenceIdentity(currentUser);
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
              identityType: "PLAYER",
              name: p.name,
              playerId: p.id,
              status: "ACTIVE"
            };
          }
        }

        if (!user) {
          showToast("Player roll number or email not registered.", "error");
          return;
        }

        if (secret !== user.passwordHash && secret !== "Player@2026") {
          showToast("Invalid player password or PIN.", "error");
          return;
        }

        currentUser = { ...user };
        localStorage.setItem("acc_current_user_2026", JSON.stringify(currentUser));
        if (window.RealtimeManager) window.RealtimeManager.switchPresenceIdentity(currentUser);
        auditLog.unshift({
          time: new Date().toLocaleTimeString(),
          action: "PLAYER LOGIN",
          details: `${user.name} (${user.username}) accessed player portal.`
        });
        saveDatabase();
        showToast(`Welcome Player ${user.name}`, "success");
        switchView("player");
      }
    }

    function logoutUser() {
      currentUser = { role: "SPECTATOR", name: "Public Guest", title: "Public Spectator" };
      localStorage.removeItem("acc_current_user_2026");
      if (window.RealtimeManager) window.RealtimeManager.switchPresenceIdentity(currentUser);
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
                  <option value="PLAYER" ${defaultRole === 'PLAYER' ? 'selected' : ''}>Player</option>
                  <option value="FRANCHISE" ${defaultRole === 'FRANCHISE' ? 'selected' : ''}>Franchise (Coordinator / Captain)</option>
                  <option value="ADMIN" ${(defaultRole === 'ADMIN' || defaultRole === 'STAFF') ? 'selected' : ''}>Administrator / Director</option>
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
      const saleEntry = auditLog.find(e => e.action === "PLAYER SOLD");
      if (!saleEntry) {
        showToast("No sales found to undo in audit trail.", "error");
        return;
      }
      let targetPlayer = players.find(p => p.status === "SOLD" && (saleEntry.details.includes(p.name) || saleEntry.details.includes(`#${p.id}`)));
      if (!targetPlayer) targetPlayer = players.slice().reverse().find(p => p.status === "SOLD");
      const leaderName = targetPlayer ? targetPlayer.soldTo : "Franchise";
      const salePrice = targetPlayer ? (targetPlayer.price || targetPlayer.basePrice) : "Current";

      const modal = document.getElementById("modalContainer");
      modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6); max-width: 500px;">
            <span class="status-badge status-blocked">OPERATIONAL CORRECTION</span>
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text-bright); margin: 6px 0;">
              REVERT AUCTION SALE
            </h2>
            <div style="background: var(--surface-2); border-radius: 8px; padding: 12px; margin: 12px 0; border: 1px solid var(--border-medium);">
              <div style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 2px;">Player to Restore:</div>
              <div style="font-weight: 800; font-size: 1.15rem; color: var(--text-bright);">${targetPlayer ? targetPlayer.name : 'Last Sold Player'} (#${targetPlayer ? targetPlayer.id : ''})</div>
              <div style="font-size: 0.875rem; color: var(--color-orange); margin-top: 4px; font-weight: 600;">Sold to ${leaderName} for ${salePrice} Credits</div>
            </div>
            <p style="color: var(--text-muted); font-size: 0.8125rem; margin-bottom: var(--space-4); line-height: 1.5;">
              Reverting this sale will atomically refund ${salePrice} Credits to ${leaderName}, remove the player from squad roster, return them to AVAILABLE status in the auction pool, and re-open the lot.
            </p>
            <div style="display: flex; gap: var(--space-3); justify-content: flex-end;">
              <button class="btn btn-secondary" onclick="closeModal()">CANCEL</button>
              <button class="btn btn-danger" onclick="executeUndoSale()">EXECUTE FORENSIC UNDO</button>
            </div>
          </div>
        </div>
      `;
    }

    function executeUndoSale() {
      const saleEntry = auditLog.find(e => e.action === "PLAYER SOLD");
      let targetPlayer = null;
      let leader = null;
      let refundedAmount = 0;

      if (saleEntry) {
        targetPlayer = players.find(p => p.status === "SOLD" && (saleEntry.details.includes(p.name) || saleEntry.details.includes(`#${p.id}`)));
      }
      if (!targetPlayer) {
        targetPlayer = players.slice().reverse().find(p => p.status === "SOLD");
      }

      if (!targetPlayer) {
        showToast("No active sales available to undo.", "error");
        closeModal();
        return;
      }

      leader = franchises.find(f => f.name === targetPlayer.soldTo || (saleEntry && saleEntry.details && saleEntry.details.includes(f.name)));
      refundedAmount = targetPlayer.price || targetPlayer.basePrice;

      if (leader) {
        leader.purse += refundedAmount;
        leader.squad = (leader.squad || []).filter(item => item.id !== targetPlayer.id);
      }

      targetPlayer.status = "AVAILABLE";
      targetPlayer.soldTo = null;
      targetPlayer.price = targetPlayer.basePrice;

      // Bring active lot back to this player
      lotIndex = players.findIndex(p => p.id === targetPlayer.id);
      if (lotIndex === -1) lotIndex = 0;
      currentBid = targetPlayer.basePrice;
      leadingBidderId = null;
      const sOffset = (window.RealtimeStore && window.RealtimeStore.state.connection.serverTimeOffset) || 0;
      timerSeconds = 17;
      timerDeadline = (Date.now() + sOffset) + 17000;
      timerRunning = true;
      passedFranchiseIds = [];

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "UNDO SALE",
        details: `Reverted sale of ${targetPlayer.name} (#${targetPlayer.id}) to ${leader ? leader.name : 'Team'}. Refunded ${refundedAmount}C.`,
        actorUid: currentUser.uid || 'usr_sys',
        actorRole: currentUser.role,
        identityType: currentUser.identityType || 'OPERATOR',
        playerId: targetPlayer.id,
        refundedAmount
      });

      closeModal();
      saveDatabase();
      broadcastAuthoritativeState();
      showToast(`Undo successful: ${targetPlayer.name} returned to pool, ${leader ? leader.name : 'Team'} refunded ${refundedAmount}C.`, "success");
      renderCurrentView();
    }

    

    // ========================================================
    // BRAND ASSET SUITE: TEAM EMBLEMS & PLAYER AVATARS
    // (ACC Official Logo is reserved for the website brand, NOT teams)
    // ========================================================
    const FRANCHISE_BRAND = {
      1: { name: "Titans", short: "TIT", color: "#0284C7", bg: "rgba(2, 132, 199, 0.12)", border: "#0284C7" },
      2: { name: "Warriors", short: "WAR", color: "#E11D48", bg: "rgba(225, 29, 72, 0.12)", border: "#E11D48" },
      3: { name: "Strikers", short: "STR", color: "#D97706", bg: "rgba(217, 119, 6, 0.12)", border: "#D97706" },
      4: { name: "Blasters", short: "BLA", color: "#059669", bg: "rgba(5, 150, 105, 0.12)", border: "#059669" },
      5: { name: "Super Kings", short: "CSK", color: "#CA8A04", bg: "rgba(202, 138, 4, 0.12)", border: "#CA8A04" },
      6: { name: "Royals", short: "RR", color: "#7C3AED", bg: "rgba(124, 58, 237, 0.12)", border: "#7C3AED" },
      7: { name: "Challengers", short: "RCB", color: "#DC2626", bg: "rgba(220, 38, 38, 0.12)", border: "#DC2626" },
      8: { name: "Knights", short: "KKR", color: "#4F46E5", bg: "rgba(79, 70, 229, 0.12)", border: "#4F46E5" },
      9: { name: "Daredevils", short: "DD", color: "#EA580C", bg: "rgba(234, 88, 12, 0.12)", border: "#EA580C" },
      10: { name: "Sunrisers", short: "SRH", color: "#F97316", bg: "rgba(249, 115, 22, 0.12)", border: "#F97316" },
      11: { name: "Giants", short: "GNT", color: "#0D9488", bg: "rgba(13, 148, 136, 0.12)", border: "#0D9488" }
    };

    function getTeamEmblem(fId, size = 42) {
      const b = FRANCHISE_BRAND[fId] || { name: "Team", short: "ACC", color: "#059669", bg: "rgba(5, 150, 105, 0.12)", border: "#059669" };
      return `
        <div class="team-emblem-badge" style="width: ${size}px; height: ${size}px; border-radius: 10px; background: ${b.bg}; border: 1.5px solid ${b.border}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);" title="${b.name}">
          <span style="font-family: var(--font-display); font-size: ${Math.round(size * 0.34)}px; font-weight: 800; color: ${b.color}; line-height: 1; letter-spacing: 0.02em;">${b.short}</span>
        </div>
      `;
    }

    function getPlayerAvatar(p, width = 80, height = 100) {
      if (p.photo && p.photo !== 'acc-logo.png' && p.photo !== 'acc-logo.png' && p.photo.trim() !== '') {
        return `<img src="${p.photo}" alt="${p.name}" style="width: ${width}px; height: ${height}px; object-fit: cover; border-radius: var(--radius-sm); border: 1.5px solid var(--border-medium); flex-shrink: 0;">`;
      }
      const initials = p.name ? p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AT';
      const roleColor = p.bucket ? (p.bucket.startsWith('B') ? 'var(--color-green)' : 'var(--color-orange)') : 'var(--color-green)';
      return `
        <div style="width: ${width}px; height: ${height}px; border-radius: var(--radius-sm); background: linear-gradient(145deg, #FFFFFF, #E2E8F0); border: 1.5px solid var(--border-medium); display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 6px 4px; box-sizing: border-box; flex-shrink: 0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);">
          <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 2px;">
            <span class="label-micro font-mono" style="font-size: 0.6rem; color: var(--text-muted); font-weight: 800;">#${p.id}</span>
            <span class="label-micro font-mono" style="font-size: 0.6rem; color: ${roleColor}; font-weight: 800;">${p.bucket || 'B1'}</span>
          </div>
          <div style="font-family: var(--font-display); font-size: ${Math.round(width * 0.34)}px; font-weight: 800; color: #0F172A; letter-spacing: 0.04em;">
            ${initials}
          </div>
          <div style="font-size: 0.58rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); background: rgba(15, 23, 42, 0.06); padding: 2px 4px; border-radius: 3px; width: 100%; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${p.derivedType || 'PLAYER'}
          </div>
        </div>
      `;
    }

    function getHourglassSvg(size = 48) {
      const isTimeUp = timerSeconds <= 0;
      const isPaused = auctionPaused || isTimeUp;
      const statusClass = isTimeUp ? "critical time-up stopped" : timerSeconds <= 5 ? "critical" : timerSeconds <= 10 ? "warning" : "normal";
      return `
        <svg aria-label="Hourglass timer" role="img" height="${size}px" width="${size}px" viewBox="0 0 56 56" class="hourglass-loader ${statusClass} ${isPaused ? 'paused time-up stopped' : ''}">
          <clipPath id="sand-mound-top">
            <path d="M 14.613 13.087 C 15.814 12.059 19.3 8.039 20.3 6.539 C 21.5 4.789 21.5 2.039 21.5 2.039 L 3 2.039 C 3 2.039 3 4.789 4.2 6.539 C 5.2 8.039 8.686 12.059 9.887 13.087 C 11 14.039 12.25 14.039 12.25 14.039 C 12.25 14.039 13.5 14.039 14.613 13.087 Z" class="loader__sand-mound-top" />
          </clipPath>
          <clipPath id="sand-mound-bottom">
            <path d="M 14.613 20.452 C 15.814 21.48 19.3 25.5 20.3 27 C 21.5 28.75 21.5 31.5 21.5 31.5 L 3 31.5 C 3 31.5 3 28.75 4.2 27 C 5.2 25.5 8.686 21.48 9.887 20.452 C 11 19.5 12.25 19.5 12.25 19.5 C 12.25 19.5 13.5 19.5 14.613 20.452 Z" class="loader__sand-mound-bottom" />
          </clipPath>
          <g transform="translate(2,2)">
            <g transform="rotate(-90,26,26)" stroke-linecap="round" stroke-dashoffset="153.94" stroke-dasharray="153.94 153.94" stroke="hsl(0,0%,100%)" fill="none">
              <circle transform="rotate(0,26,26)" r="24.5" cy="26" cx="26" stroke-width="2.5" class="loader__motion-thick" />
              <circle transform="rotate(90,26,26)" r="24.5" cy="26" cx="26" stroke-width="1.75" class="loader__motion-medium" />
              <circle transform="rotate(180,26,26)" r="24.5" cy="26" cx="26" stroke-width="1" class="loader__motion-thin" />
            </g>
            <g transform="translate(13.75,9.25)" class="loader__model">
              <path d="M 1.5 2 L 23 2 C 23 2 22.5 8.5 19 12 C 16 15.5 13.5 13.5 13.5 16.75 C 13.5 20 16 18 19 21.5 C 22.5 25 23 31.5 23 31.5 L 1.5 31.5 C 1.5 31.5 2 25 5.5 21.5 C 8.5 18 11 20 11 16.75 C 11 13.5 8.5 15.5 5.5 12 C 2 8.5 1.5 2 1.5 2 Z" fill="hsl(var(--hue),90%,85%)" />
              <g stroke-linecap="round" stroke="hsl(35,90%,90%)">
                <line y2="20.75" x2="12" y1="15.75" x1="12" stroke-dasharray="0.25 33.75" stroke-width="1" class="loader__sand-grain-left" />
                <line y2="21.75" x2="12.5" y1="16.75" x1="12.5" stroke-dasharray="0.25 33.75" stroke-width="1" class="loader__sand-grain-right" />
                <line y2="31.5" x2="12.25" y1="18" x1="12.25" stroke-dasharray="0.5 107.5" stroke-width="1" class="loader__sand-drop" />
                <line y2="31.5" x2="12.25" y1="14.75" x1="12.25" stroke-dasharray="54 54" stroke-width="1.5" class="loader__sand-fill" />
                <line y2="31.5" x2="12" y1="16" x1="12" stroke-dasharray="1 107" stroke-width="1" stroke="hsl(35,90%,83%)" class="loader__sand-line-left" />
                <line y2="31.5" x2="12.5" y1="16.5" x1="12.5" stroke-dasharray="12 96" stroke-width="1" stroke="hsl(35,90%,83%)" class="loader__sand-line-right" />
                <g stroke-width="0" fill="hsl(35,90%,90%)">
                  <path d="M 12.25 15 L 15.392 13.486 C 21.737 11.168 22.5 2 22.5 2 L 2 2.013 C 2 2.013 2.753 11.046 9.009 13.438 L 12.25 15 Z" clip-path="url(#sand-mound-top)" />
                  <path d="M 12.25 18.5 L 15.392 20.014 C 21.737 22.332 22.5 31.5 22.5 31.5 L 2 31.487 C 2 31.487 2.753 22.454 9.009 20.062 Z" clip-path="url(#sand-mound-bottom)" />
                </g>
              </g>
              <g stroke-width="2" stroke-linecap="round" opacity="0.7" fill="none">
                <path d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5" stroke="hsl(0,0%,100%)" class="loader__glare-top" />
                <path transform="rotate(180,12.25,16.75)" d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5" stroke="hsla(0,0%,100%,0)" class="loader__glare-bottom" />
              </g>
              <rect height="2" width="24.5" fill="hsl(var(--hue),90%,50%)" />
              <rect height="1" width="19.5" y="0.5" x="2.5" ry="0.5" rx="0.5" fill="hsl(var(--hue),90%,57.5%)" />
              <rect height="2" width="24.5" y="31.5" fill="hsl(var(--hue),90%,50%)" />
              <rect height="1" width="19.5" y="32" x="2.5" ry="0.5" rx="0.5" fill="hsl(var(--hue),90%,57.5%)" />
            </g>
          </g>
        </svg>
      `;
    }

    // ========================================================
    // VIEW 1: PUBLIC HOME & ROSTER (SPECTATOR)
    // ========================================================
    let publicSearchQuery = "";
    let publicBucketFilter = "ALL";

    function renderPublicView() {
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const scarcity = getTournamentScarcity();

      const filteredPlayers = players.filter(p => {
        if (publicSearchQuery && !p.name.toLowerCase().includes(publicSearchQuery.toLowerCase()) && !p.roll.toLowerCase().includes(publicSearchQuery.toLowerCase())) return false;
        if (publicBucketFilter !== "ALL" && p.bucket !== publicBucketFilter) return false;
        return true;
      });

      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-8);">
          
          <!-- Scarcity Banner (If active) -->
          ${scarcity.scarce ? `
            <div class="surface-card" style="background: rgba(255, 209, 102, 0.08); border: 1.5px solid var(--color-yellow); padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3); border-radius: var(--radius-md);">
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <span class="status-badge status-scarcity">SCARCITY ALERT</span>
                <span style="font-size: 0.8125rem; font-weight: 700; color: var(--color-yellow);">
                  ${scarcity.bucket}: ${scarcity.available} available vs ${scarcity.unfilledSlots} mandatory slots remaining.
                </span>
              </div>
              <button class="btn btn-secondary" style="padding: 6px 12px; min-height: 32px; font-size: 0.75rem;" onclick="switchView('live')">WATCH BIDDING</button>
            </div>
          ` : ''}

          <!-- HERO SECTION -->
          <div class="surface-card" style="padding: clamp(20px, 3.5vw, 44px); background: linear-gradient(135deg, rgba(255, 255, 255, 0.70), rgba(255, 255, 255, 0.55)); border: 1px solid rgba(255, 255, 255, 0.85); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border-radius: var(--radius-xl);">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-6); align-items: center;">
              
              <!-- Left Hero Typography -->
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: var(--space-3); flex-wrap: wrap;">
                  <span class="status-badge status-live">OFFICIAL OS</span>
                  <span class="label-micro" style="color: var(--color-green);">AVANTHI CRICKET CARNIVAL · PLAYER AUCTION 2026</span>
                </div>
                <h1 class="display-hero" style="margin-bottom: var(--space-4);">
                  THE AUCTION<br><span style="color: var(--color-green);">IS LIVE.</span>
                </h1>
                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.5; max-width: 480px; margin-bottom: var(--space-5);">
                  11 franchises. Hundreds of elite student players. One authoritative, real-time cricket auction operating system.
                </p>
                <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
                  <button class="btn btn-auction" style="font-size: 0.875rem; padding: 10px 20px; flex: 1; min-width: 160px;" onclick="switchView('live')">
                    WATCH LIVE AUCTION
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.875rem; padding: 10px 20px; flex: 1; min-width: 160px;" onclick="document.getElementById('rosterSection').scrollIntoView({behavior: 'smooth'})">
                    EXPLORE PLAYERS
                  </button>
                </div>
              </div>

              <!-- Right Hero Active Lot Preview Card -->
              <div class="surface-elevated" style="padding: var(--space-6); border: 1px solid var(--border-strong); position: relative; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
                  <span class="status-badge status-inplay">ACTIVE LOT #${cur.id}</span>
                  <div class="auction-timer-widget ${timerSeconds <= 5 ? 'critical' : timerSeconds <= 10 ? 'warning' : 'normal'}" style="padding: 4px 10px; gap: 8px;">
                    ${getHourglassSvg(24)}
                    <span class="font-mono label-micro" style="font-weight: 800; font-size: 0.75rem;">${timerSeconds}s CLOCK</span>
                  </div>
                </div>

                <div style="display: flex; gap: var(--space-4); align-items: center; margin-bottom: var(--space-4);">
                  ${getPlayerAvatar(cur, 80, 100)}
                  <div>
                    <div class="label-micro" style="color: var(--color-green);">${cur.bucket} • ${cur.derivedType || 'BATTER'}</div>
                    <div style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: var(--text-bright); line-height: 1.1;">${cur.name}</div>
                    <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 4px;">${cur.program} · ${cur.branch} · Year ${cur.year}</div>
                  </div>
                </div>

                <div style="background: var(--surface-1); padding: var(--space-3) var(--space-4); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div class="label-micro">CURRENT BID</div>
                    <div class="price-display" style="font-size: 1.75rem; color: var(--color-orange);">${currentBid} <span style="font-size: 0.875rem; color: var(--text-muted); font-weight: 600;">CREDITS</span></div>
                  </div>
                  <div style="text-align: right;">
                    <div class="label-micro">LEADING FRANCHISE</div>
                    ${leader ? `
                      <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 2px;">
                        ${getTeamEmblem(leader.id, 24)}
                        <span style="font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--text-bright);">${leader.name}</span>
                      </div>
                    ` : `
                      <div style="font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--text-bright); margin-top: 2px;">OPENING BASE</div>
                    `}
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- REGISTERED PLAYERS ROSTER SECTION -->
          <div id="rosterSection" style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--space-4);">
              <div>
                <span class="label-micro" style="color: var(--color-green);">OFFICIAL PLAYER DIRECTORY</span>
                <h2 class="section-title">REGISTERED PLAYER ROSTER</h2>
              </div>
              <div style="display: flex; gap: var(--space-2); flex-wrap: wrap; align-items: center;">
                <input type="text" class="form-input" style="width: 240px; min-height: 38px; padding: 6px 12px; font-size: 0.8125rem;" placeholder="Search name or roll..." value="${publicSearchQuery}" oninput="publicSearchQuery = this.value; renderCurrentView();">
              </div>
            </div>

            <!-- Bucket Filters -->
            <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px;">
              ${['ALL', 'B1', 'B2', 'B3', 'B4', 'D5', 'M6'].map(b => `
                <button class="btn btn-secondary" style="min-height: 34px; padding: 4px 12px; font-size: 0.75rem; ${publicBucketFilter === b ? 'background: var(--surface-3); border-color: var(--color-green); color: var(--color-green);' : ''}" onclick="publicBucketFilter = '${b}'; renderCurrentView();">
                  ${b === 'ALL' ? 'ALL PLAYERS' : b + ' BUCKET'}
                </button>
              `).join('')}
            </div>

            <!-- 4-Column Player Cards Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-4);">
              ${filteredPlayers.map(p => `
                <div class="surface-card" style="padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); border-radius: var(--radius-md);">
                  <div style="display: flex; gap: var(--space-3);">
                    ${getPlayerAvatar(p, 70, 88)}
                    <div style="flex: 1; min-width: 0;">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <span class="status-badge ${p.status === 'SOLD' ? 'status-sold' : p.status === 'UNSOLD' ? 'status-unsold' : 'status-live'}">${p.status}</span>
                        <span class="label-micro font-mono" style="color: var(--text-faint);">#${p.id}</span>
                      </div>
                      <div class="card-title" style="margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
                      <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-green); text-transform: uppercase;">${p.derivedType || 'BATTER'}</div>
                      <div style="font-size: 0.6875rem; color: var(--text-muted);">${p.program} · ${p.branch} · Yr ${p.year} (${p.bucket})</div>
                    </div>
                  </div>

                  <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                    <span class="status-badge" style="background: rgba(255,255,255,0.04); color: var(--text-muted); font-size: 0.625rem;">${p.battingStyle || 'RIGHT HAND'}</span>
                    <span class="status-badge" style="background: rgba(255,255,255,0.04); color: var(--text-muted); font-size: 0.625rem;">${p.bowlingArm ? p.bowlingArm + ' ' + (p.bowlingType || '') : 'TOP ORDER'}</span>
                  </div>

                  <div style="margin-top: auto; padding-top: var(--space-2); border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <span class="label-micro">BASE PRICE</span>
                      <div class="price-display" style="font-size: 1.1rem; color: var(--text-bright);">${p.basePrice} <span style="font-size: 0.6875rem; color: var(--text-muted);">C</span></div>
                    </div>
                    ${p.status === 'SOLD' ? `
                      <div style="text-align: right;">
                        <span class="label-micro" style="color: var(--color-green);">SOLD TO</span>
                        <div style="font-size: 0.8125rem; font-weight: 700; color: var(--color-green);">${p.soldTo || 'TITANS'}</div>
                      </div>
                    ` : `
                      <button class="btn btn-secondary" style="min-height: 30px; padding: 4px 10px; font-size: 0.6875rem;" onclick="openPlayerPassModal(${p.id})">VIEW PASS</button>
                    `}
                  </div>
                </div>
              `).join('')}
            </div>

          </div>

        </div>
      `;
    }

    // ========================================================
    // VIEW 2: PUBLIC LIVE AUCTION FLOOR
    // ========================================================
    function renderLiveAuctionView() {
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const scarcity = getTournamentScarcity();
      const isTimeUp = timerSeconds <= 0;
      const timerState = isTimeUp ? 'status-blocked' : (timerSeconds <= 5 ? 'status-blocked' : timerSeconds <= 10 ? 'status-warning' : 'status-live');
      const timerLabel = isTimeUp ? 'TIME UP' : (timerSeconds <= 5 ? 'CRITICAL' : timerSeconds <= 10 ? 'WARNING' : 'NORMAL');

      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-6);">
          
          <!-- Top Bar: Connection & Active State -->
          <div class="live-top-bar">
            <div class="live-top-badges">
              <span class="status-badge status-live">LIVE BROADCAST</span>
              <span class="label-micro font-mono">LOT ${lotIndex + 1} OF ${players.length}</span>
              <span class="status-badge status-connected">ENGINE CONNECTED</span>
            </div>
            <div class="live-top-action">
              <button class="btn btn-secondary live-terminal-btn" onclick="switchView('franchise')">OPEN FRANCHISE TERMINAL</button>
            </div>
          </div>

          <!-- Main Live Auction Arena Split Grid -->
          <div class="responsive-split-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-6);">
            
            <!-- Left Column: Featured Player Lot -->
            <div class="surface-card" style="padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="status-badge status-inplay">ON AUCTION FLOOR</span>
                <span class="label-micro font-mono">ID #${cur.id}</span>
              </div>

              <div style="display: flex; gap: var(--space-4); align-items: center;">
                ${getPlayerAvatar(cur, 110, 140)}
                <div>
                  <div class="label-micro" style="color: var(--color-green);">${cur.bucket} • ${cur.derivedType || 'BATTER'}</div>
                  <h2 style="font-family: var(--font-display); font-size: 1.85rem; font-weight: 800; color: var(--text-bright); line-height: 1.1;">${cur.name}</h2>
                  <div style="font-size: 0.875rem; color: var(--text-muted); margin-top: 4px;">${cur.program} · ${cur.branch} · Year ${cur.year}</div>
                  <div class="font-mono" style="font-size: 0.8125rem; color: var(--text-faint); margin-top: 2px;">Roll: ${cur.roll}</div>
                </div>
              </div>

              <div class="responsive-stats-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2); margin-top: var(--space-2);">
                <div class="surface-subtle" style="padding: 8px 6px; text-align: center;">
                  <span class="label-micro" style="font-size: 0.65rem;">BASE PRICE</span>
                  <div class="price-display" style="font-size: 1.25rem; color: var(--text-bright);">${cur.basePrice} <span style="font-size: 0.75rem; color: var(--text-muted);">C</span></div>
                </div>
                <div class="surface-subtle" style="padding: 8px 6px; text-align: center;">
                  <span class="label-micro" style="font-size: 0.65rem;">STYLE</span>
                  <div style="font-size: 0.875rem; font-weight: 700; color: var(--text-bright); margin-top: 2px;">${cur.battingStyle || 'RIGHT HAND'}</div>
                </div>
                <div class="surface-subtle" style="padding: 8px 6px; text-align: center;">
                  <span class="label-micro" style="font-size: 0.65rem;">BOWLING</span>
                  <div style="font-size: 0.875rem; font-weight: 700; color: var(--text-bright); margin-top: 2px;">${cur.bowlingType || 'NONE'}</div>
                </div>
              </div>

              <div style="background: var(--surface-2); padding: var(--space-3) var(--space-4); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div class="label-micro" style="margin-bottom: 4px;">PLAYER BIOGRAPHY & CREDENTIALS</div>
                <p style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.5;">${cur.bio || 'Registered player for Avanthi Cricket Carnival 2026. Verified academic and cricket profile.'}</p>
              </div>
            </div>

            <!-- Right Column: Current Bid, Highest Bidder & Timer -->
            <div class="surface-elevated" style="padding: var(--space-6); display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-5);">
              
              <!-- Timer & Scarcity Indicator -->
              <div class="live-timer-row">
                <div class="auction-timer-widget ${timerSeconds <= 5 ? 'critical' : timerSeconds <= 10 ? 'warning' : 'normal'}">
                  ${getHourglassSvg(50)}
                  <div class="timer-countdown-info">
                    <div class="font-mono timer-countdown-number">${timerSeconds}</div>
                    <div class="timer-countdown-unit">SECONDS • ${timerLabel}</div>
                  </div>
                </div>
                <div class="live-timer-status-col">
                  <span class="label-micro">STATUS</span>
                  <div style="margin-top: 4px;">
                    <span id="clockStatusBadge" class="status-badge ${isTimeUp ? 'status-blocked' : (auctionPaused ? 'status-warning' : 'status-live')}">${isTimeUp ? 'TIME UP (STOPPED)' : (auctionPaused ? 'PAUSED' : 'CLOCK ACTIVE')}</span>
                  </div>
                </div>
              </div>

              <!-- Dominant Current Bid -->
              <div style="background: var(--surface-1); padding: var(--space-5); border-radius: var(--radius-md); border: 1px solid var(--border-medium); text-align: center;">
                <span class="label-micro" style="color: var(--color-orange); letter-spacing: 0.16em;">CURRENT HIGHEST BID</span>
                <div class="price-display" style="font-size: clamp(3.2rem, 8vw, 5.25rem); color: var(--color-orange); margin: 6px 0;">
                  ${currentBid} <span style="font-size: 1.5rem; color: var(--text-muted); font-weight: 700;">CREDITS</span>
                </div>
                <div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(217, 119, 6, 0.1); padding: 8px 20px; border-radius: var(--radius-full); border: 1.5px solid rgba(217, 119, 6, 0.3);">
                  <span class="label-micro" style="color: var(--text-main);">HELD BY:</span>
                  ${leader ? `
                    <div style="display: flex; align-items: center; gap: 8px;">
                      ${getTeamEmblem(leader.id, 26)}
                      <span style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; color: var(--color-orange);">${leader.name}</span>
                    </div>
                  ` : `
                    <span style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; color: var(--text-muted);">NO BIDS YET</span>
                  `}
                </div>
              </div>

              <!-- Next Bid & Increment Calculation -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
                <div class="surface-subtle" style="padding: 12px;">
                  <span class="label-micro">NEXT LEGAL BID</span>
                  <div class="price-display" style="font-size: 1.4rem; color: var(--color-green); margin-top: 2px;">
                    ${currentBid + getBidIncrement(currentBid)} <span style="font-size: 0.75rem; color: var(--text-muted);">C</span>
                  </div>
                </div>
                <div class="surface-subtle" style="padding: 12px;">
                  <span class="label-micro">BID INCREMENT</span>
                  <div class="font-mono" style="font-size: 1.4rem; font-weight: 800; color: var(--text-bright); margin-top: 2px;">
                    +${getBidIncrement(currentBid)} <span style="font-size: 0.75rem; color: var(--text-muted);">C</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <!-- 11 Franchises Live Purse & Status Strip -->
          <div class="surface-card" style="padding: var(--space-5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
              <span class="label-micro" style="color: var(--color-green);">11 FRANCHISES REAL-TIME PURSE & ROSTER TRACKER</span>
              <span class="label-micro font-mono">1,000 TOTAL CREDITS CAP</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: var(--space-3);">
              ${franchises.map(f => {
                const maxBid = calculateMaxBid(f.id, cur.bucket);
                const isLeader = f.id === leadingBidderId;
                const isBlocked = maxBid < (currentBid + getBidIncrement(currentBid));
                return `
                  <div class="surface-subtle" style="padding: 10px 14px; border-left: 3px solid ${isLeader ? 'var(--color-orange)' : 'var(--border-medium)'}; ${isLeader ? 'background: rgba(255, 138, 31, 0.08);' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-family: var(--font-display); font-size: 0.875rem; font-weight: 800; color: var(--text-bright);">${f.name}</span>
                      <span class="status-badge ${isLeader ? 'status-inplay' : isBlocked ? 'status-blocked' : 'status-connected'}">${isLeader ? 'HOLDING' : isBlocked ? 'BLOCKED' : 'LEGAL'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 0.75rem;">
                      <span style="color: var(--text-muted);">Purse: <strong class="font-mono" style="color: var(--text-bright);">${f.purse}C</strong></span>
                      <span style="color: var(--text-muted);">Max: <strong class="font-mono" style="color: ${isBlocked ? 'var(--color-red)' : 'var(--color-green)'};">${maxBid}C</strong></span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>
      `;
    }

    // ========================================================
    // VIEW 3: FRANCHISE MOBILE-FIRST BIDDING TERMINAL
    // ========================================================
    function renderFranchiseTerminalView() {
      // Strict Franchise Isolation Guard
      if (currentUser.role !== 'FRANCHISE' && currentUser.role !== 'SUPER_ADMIN') {
        return `
          <div style="max-width: 600px; margin: 40px auto; text-align: center; padding: var(--space-6);" class="surface-card">
            <span class="status-badge status-blocked">AUTHENTICATION REQUIRED</span>
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: var(--color-red); margin: 12px 0;">
              FRANCHISE TERMINAL ACCESS RESTRICTED
            </h2>
            <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 20px;">
              Please authenticate with your Franchise credentials (Faculty Coordinator or Team Leader) to access this live bidding terminal.
            </p>
            <button class="btn btn-primary" onclick="switchView('login')">PROCEED TO LOGIN</button>
          </div>
        `;
      }

      const targetFId = currentUser.role === 'FRANCHISE' ? currentUser.franchiseId : (activeTerminalFranchiseId || 1);
      const myFranchise = franchises.find(f => f.id === targetFId);
      if (!myFranchise) {
        return `
          <div style="max-width: 600px; margin: 40px auto; text-align: center; padding: var(--space-6);" class="surface-card">
            <span class="status-badge status-blocked">ACCESS DENIED</span>
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: var(--color-red); margin: 12px 0;">
              FRANCHISE WORKSPACE ISOLATION ENFORCED
            </h2>
            <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 20px;">
              You do not have authorization to view or bid on behalf of other franchises.
            </p>
            <button class="btn btn-secondary" onclick="switchView('public')">RETURN TO PUBLIC ROSTER</button>
          </div>
        `;
      }

      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const nextBid = currentBid + getBidIncrement(currentBid);
      const maxLegal = calculateMaxBid(myFranchise.id, cur.bucket);
      const isLeader = myFranchise.id === leadingBidderId;
      const isBlocked = maxLegal < nextBid;
      const scarcity = getTournamentScarcity();
      const identityLabel = currentUser.identityType === 'COORDINATOR' ? 'Faculty Coordinator / Owner' : 'Team Leader / Captain';

      return `
        <div style="max-width: 680px; width: 100%; box-sizing: border-box; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4);">
          
          <!-- Franchise Session Header -->
          <div class="surface-card" style="padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                ${getTeamEmblem(myFranchise.id, 46)}
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span class="status-badge status-connected">CONNECTED</span>
                    <span class="label-micro" style="color: var(--color-green);">FRANCHISE TERMINAL</span>
                  </div>
                  <div style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: var(--text-bright); margin-top: 2px;">
                    ${myFranchise.name}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">
                    Identity: <strong style="color: var(--color-green);">${identityLabel}</strong> (${currentUser.name})
                  </div>
                </div>
              </div>
              <div style="text-align: right;">
                <span class="label-micro">OPERATIONAL ISOLATION</span>
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-blue);">TEAM #${myFranchise.id} LOCKED</div>
              </div>
            </div>

            <!-- Shared Workspace Notice -->
            <div class="surface-subtle" style="padding: 8px 12px; border-left: 3px solid var(--color-green); font-size: 0.75rem; color: var(--text-muted);">
              <strong>Shared Franchise Workspace:</strong> Both Faculty Coordinator and Team Leader share the exact same purse (1000C initial) & squad roster in real-time.
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); background: var(--surface-2); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div>
                <span class="label-micro">REMAINING PURSE</span>
                <div class="price-display" style="font-size: 1.35rem; color: var(--color-green);">${myFranchise.purse} <span style="font-size: 0.75rem; color: var(--text-muted);">C</span></div>
              </div>
              <div style="text-align: right;">
                <span class="label-micro">SQUAD COUNT</span>
                <div class="font-mono" style="font-size: 1.35rem; font-weight: 800; color: var(--text-bright);">${myFranchise.squad.length} / 18</div>
              </div>
            </div>
          </div>

          <!-- Current Lot Floor Card -->
          <div class="surface-card" style="padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="status-badge status-inplay">ACTIVE LOT #${cur.id}</span>
              <div class="auction-timer-widget ${timerSeconds <= 5 ? 'critical' : timerSeconds <= 10 ? 'warning' : 'normal'}" style="padding: 4px 10px; gap: 8px;">
                ${getHourglassSvg(24)}
                <span class="label-micro font-mono" style="font-weight: 800;">${timerSeconds}s</span>
              </div>
            </div>

            <div style="display: flex; gap: var(--space-3); align-items: center;">
              ${getPlayerAvatar(cur, 80, 95)}
              <div style="flex: 1; min-width: 0;">
                <div class="label-micro" style="color: var(--color-green);">${cur.bucket} • ${cur.derivedType || 'BATTER'}</div>
                <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--text-bright); margin: 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${cur.name}
                </h3>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${cur.program} · ${cur.branch} · Year ${cur.year}</div>
                <div class="label-mono font-mono" style="font-size: 0.6875rem; color: var(--text-faint);">Roll: ${cur.roll}</div>
              </div>
            </div>

            <!-- Current Bid Status Banner -->
            <div class="surface-subtle" style="padding: 10px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-subtle);">
              <div>
                <span class="label-micro">CURRENT FLOOR BID</span>
                <div class="price-display" style="font-size: 1.5rem; color: var(--color-orange);">${currentBid} <span style="font-size: 0.8125rem; color: var(--text-muted);">C</span></div>
              </div>
              <div style="text-align: right;">
                <span class="label-micro">LEAD BIDDER</span>
                <div style="font-size: 0.8125rem; font-weight: 700; color: ${isLeader ? 'var(--color-green)' : 'var(--text-bright)'};">
                  ${isLeader ? 'YOUR FRANCHISE' : (leader ? leader.name : 'NO BIDS')}
                </div>
              </div>
            </div>

            <!-- Single Tap Bidding Execution -->
            <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-2);">
              <button class="btn btn-auction" style="min-height: 52px; font-size: 1.05rem;" onclick="placeBid(${myFranchise.id})" ${isBlocked ? 'disabled' : ''}>
                ${isBlocked ? 'BID BLOCKED (BUDGET EXCEEDED)' : `SUBMIT BID: ${nextBid} CREDITS`}
              </button>
              
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-faint); padding: 0 4px;">
                <span>Max Legal Bid: <strong class="font-mono" style="color: var(--text-bright);">${maxLegal}C</strong></span>
                <span>Next Minimum: <strong class="font-mono" style="color: var(--color-green);">${nextBid}C</strong></span>
              </div>
            </div>
          </div>

          <!-- Acquired Squad Roster -->
          <div class="surface-card" style="padding: var(--space-4);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
              <span class="label-micro" style="color: var(--color-green);">${myFranchise.name.toUpperCase()} SQUAD ROSTER</span>
              <span class="label-mono font-mono" style="font-size: 0.75rem;">${myFranchise.squad.length} Players</span>
            </div>
            
            ${myFranchise.squad.length === 0 ? `
              <div style="text-align: center; padding: var(--space-4); color: var(--text-faint); font-size: 0.8125rem;">
                No players acquired yet. Active bids will appear here once hammered.
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow-y: auto;">
                ${myFranchise.squad.map(p => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--surface-2); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                    <div>
                      <div style="font-size: 0.8125rem; font-weight: 700; color: var(--text-bright);">${p.name}</div>
                      <div style="font-size: 0.6875rem; color: var(--text-muted);">${p.bucket} • ${p.derivedType || 'PLAYER'}</div>
                    </div>
                    <div class="price-display" style="font-size: 0.9375rem; color: var(--color-orange);">${p.soldPrice} C</div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

        </div>
      `;
    }
    
    function render11FranchisesView() {
      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-6);">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--space-3);">
            <div>
              <span class="label-micro" style="color: var(--color-green);">OFFICIAL FRANCHISE DIRECTORY</span>
              <h2 class="section-title">11 PARTICIPATING FRANCHISES</h2>
            </div>
            <div class="label-mono font-mono" style="font-size: 0.875rem; color: var(--text-muted);">Total Cap: 11,000 Credits</div>
          </div>

          <div class="teams-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-4);">
            ${franchises.map(f => `
              <div class="surface-card" style="padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    ${getTeamEmblem(f.id, 38)}
                    <span class="card-title">${f.name}</span>
                  </div>
                  <span class="status-badge status-connected">ACTIVE</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); background: var(--surface-2); padding: 10px; border-radius: var(--radius-sm);">
                  <div>
                    <span class="label-micro">REMAINING PURSE</span>
                    <div class="price-display" style="font-size: 1.35rem; color: var(--color-green);">${f.purse} <span style="font-size: 0.75rem; color: var(--text-muted);">C</span></div>
                  </div>
                  <div>
                    <span class="label-micro">SQUAD SIZE</span>
                    <div class="font-mono" style="font-size: 1.35rem; font-weight: 800; color: var(--text-bright);">${f.squad.length} <span style="font-size: 0.75rem; color: var(--text-muted);">/ 15</span></div>
                  </div>
                </div>

                <div>
                  <span class="label-micro">ROSTER ACQUISITIONS (${f.squad.length})</span>
                  <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px; max-height: 120px; overflow-y: auto;">
                    ${f.squad.length === 0 ? `
                      <span style="font-size: 0.75rem; color: var(--text-faint); font-style: italic;">No players acquired yet</span>
                    ` : f.squad.map(sp => `
                      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; padding: 3px 0; border-bottom: 1px solid var(--border-subtle);">
                        <span style="color: var(--text-bright); font-weight: 600;">${sp.name} (${sp.bucket})</span>
                        <span class="font-mono" style="color: var(--color-orange);">${sp.price || sp.basePrice} C</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // ========================================================
    // VIEW 5: LOGIN & ROLE GATEWAY (PREMIUM SPLIT LAYOUT)
    // ========================================================
    // loginRoleSelection declared in engine

    function renderLoginView() {
      return `
        <div style="min-height: calc(100vh - 160px); display: flex; align-items: center; justify-content: center; padding: var(--space-4) 0;">
          <div class="surface-card auth-gateway-card">
            
            <!-- Left Panel: Brand Statement -->
            <div class="auth-brand-panel">
              <div class="auth-brand-header">
                <img src="acc-logo.png" alt="ACC Official Logo" class="auth-brand-logo" style="width: 64px; height: 64px; object-fit: contain; background: transparent; margin-bottom: 16px; filter: drop-shadow(0 4px 12px rgba(15, 23, 42, 0.08));">
                <div>
                  <div style="margin-bottom: 4px;">
                    <span class="status-badge status-live auth-brand-subtitle" style="font-size: 0.65rem;">ACC 2026 OFFICIAL</span>
                  </div>
                  <h1 class="auth-brand-title" style="font-family: var(--font-display); font-size: clamp(1.75rem, 3.2vw, 2.75rem); font-weight: 800; color: var(--text-bright); line-height: 1.05; margin-bottom: var(--space-2);">
                    AVANTHI<br>CRICKET<br>CARNIVAL
                  </h1>
                  <div class="auth-brand-subtitle" style="font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 700; color: var(--color-green); letter-spacing: 0.1em; text-transform: uppercase;">
                    PLAYER AUCTION 2026
                  </div>
                </div>
              </div>

              <div class="auth-brand-desktop-desc" style="margin-top: var(--space-8);">
                <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
                  The authoritative digital platform for live player bidding, franchise squad management, and real-time operational governance.
                </p>
                <div style="margin-top: var(--space-4); font-size: 0.75rem; color: var(--text-faint); font-weight: 700; letter-spacing: 0.04em;">
                  REGISTRATION • SQUAD MANAGEMENT • LIVE AUCTION
                </div>
                <div style="margin-top: var(--space-3); font-size: 0.6875rem; color: var(--color-green); font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;">
                  TRUST • PRECISION • ENERGY • COMPETITION • TRANSPARENCY
                </div>
              </div>
            </div>

            <!-- Right Panel: Sign In Panel -->
            <div class="auth-form-panel">
              <div style="margin-bottom: var(--space-5);">
                <span class="label-micro">AUTHENTICATION GATEWAY</span>
                <h2 class="auth-header-title" style="font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--text-bright); margin-top: 2px;">
                  SIGN IN
                </h2>
                <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 4px;">
                  Select your role family to proceed to your verified workspace.
                </div>
              </div>

              <!-- Role Selector -->
              <div class="form-group" style="margin-bottom: var(--space-4);">
                <label class="form-label">CONTINUE AS</label>
                <div class="auth-role-grid">
                  ${['PLAYER', 'FRANCHISE', 'ADMIN'].map(r => `
                    <button type="button" class="btn btn-secondary auth-role-btn" style="${(loginRoleSelection === r || (r === 'ADMIN' && loginRoleSelection === 'STAFF')) ? 'background: rgba(5, 150, 105, 0.12); border-color: var(--color-green); color: var(--color-green); font-weight: 800;' : ''}" onclick="loginRoleSelection = '${r}'; renderCurrentView();">
                      ${r}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- DYNAMIC FORM ACCORDING TO ROLE -->
              ${loginRoleSelection === 'PLAYER' ? `
                <form onsubmit="handleLoginSubmit(event)" style="display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-2);">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">ROLL NUMBER OR REGISTERED EMAIL</label>
                    <input type="text" class="form-input" id="loginPlayerIdentifier" placeholder="e.g. 26811A0501 or player@acc.edu" required>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">PLAYER PASSWORD / PIN</label>
                    <input type="password" class="form-input" id="loginPlayerSecret" placeholder="••••••••" required>
                  </div>

                  <div style="display: flex; justify-content: flex-end;">
                    <a href="javascript:void(0)" onclick="openForgotPasswordModal('PLAYER')" style="font-size: 0.75rem; color: var(--color-green); text-decoration: none; font-weight: 600;">Forgot Roll or Password?</a>
                  </div>

                  <button type="submit" class="btn btn-primary" style="width: 100%; min-height: 48px; font-size: 0.9375rem; margin-top: var(--space-1);">
                    SIGN IN AS PLAYER
                  </button>
                </form>
              ` : loginRoleSelection === 'FRANCHISE' ? `
                <form onsubmit="handleLoginSubmit(event)" style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-2);">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">SELECT FRANCHISE</label>
                    <select class="form-select" id="loginFranchiseId" required>
                      ${franchises.map(f => `
                        <option value="${f.id}" ${f.id === franchiseLoginSelection ? 'selected' : ''}>${f.name} (Team #${f.id})</option>
                      `).join('')}
                    </select>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">IDENTITY TYPE</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                      <button type="button" class="btn btn-secondary" style="min-height: 38px; padding: 4px 8px; font-size: 0.6875rem; ${loginFranchiseIdentity === 'COORDINATOR' ? 'border-color: var(--color-green); color: var(--color-green); background: rgba(5,150,105,0.08); font-weight: 800;' : ''}" onclick="loginFranchiseIdentity = 'COORDINATOR'; renderCurrentView();">
                        FACULTY COORDINATOR
                      </button>
                      <button type="button" class="btn btn-secondary" style="min-height: 38px; padding: 4px 8px; font-size: 0.6875rem; ${loginFranchiseIdentity === 'TEAM_LEADER' ? 'border-color: var(--color-green); color: var(--color-green); background: rgba(5,150,105,0.08); font-weight: 800;' : ''}" onclick="loginFranchiseIdentity = 'TEAM_LEADER'; renderCurrentView();">
                        TEAM CAPTAIN / LEAD
                      </button>
                    </div>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">FRANCHISE ACCESS KEY / PIN</label>
                    <input type="password" class="form-input" id="loginFranchiseSecret" placeholder="••••••••" required>
                  </div>

                  <div class="surface-subtle" style="padding: 8px 10px; border-left: 3px solid var(--color-green); font-size: 0.6875rem; color: var(--text-muted); line-height: 1.4;">
                    Both Coordinator & Captain access the same shared franchise purse (1000C initial) & squad roster.
                  </div>

                  <div style="display: flex; justify-content: flex-end;">
                    <a href="javascript:void(0)" onclick="openForgotPasswordModal('FRANCHISE')" style="font-size: 0.75rem; color: var(--color-green); text-decoration: none; font-weight: 600;">Forgot Access Key?</a>
                  </div>

                  <button type="submit" class="btn btn-primary" style="width: 100%; min-height: 48px; font-size: 0.9375rem; margin-top: var(--space-1);">
                    ENTER FRANCHISE WORKSPACE
                  </button>
                </form>
              ` : `
                <form onsubmit="handleLoginSubmit(event)" style="display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-2);">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">ADMIN USERNAME OR EMAIL</label>
                    <input type="text" class="form-input" id="loginStaffIdentifier" placeholder="e.g. superadmin@acc.edu or admin@acc.edu" required>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">OPERATIONAL PASSWORD</label>
                    <input type="password" class="form-input" id="loginStaffSecret" placeholder="••••••••" required>
                  </div>

                  <div class="surface-subtle" style="padding: 8px 10px; border-left: 3px solid var(--color-blue); font-size: 0.6875rem; color: var(--text-muted); line-height: 1.4;">
                    Super Admin receives full governance suite. Administrators access live auction execution console.
                  </div>

                  <div style="display: flex; justify-content: flex-end;">
                    <a href="javascript:void(0)" onclick="openForgotPasswordModal('ADMIN')" style="font-size: 0.75rem; color: var(--color-green); text-decoration: none; font-weight: 600;">Forgot Admin Credentials?</a>
                  </div>

                  <button type="submit" class="btn btn-primary" style="width: 100%; min-height: 48px; font-size: 0.9375rem; margin-top: var(--space-1);">
                    AUTHENTICATE ADMIN CREDENTIAL
                  </button>
                </form>
              `}

              <div style="margin-top: var(--space-5); text-align: center; border-top: 1px solid var(--border-subtle); padding-top: var(--space-4);">
                <button class="btn btn-secondary" style="width: 100%; font-size: 0.8125rem; min-height: 40px;" onclick="switchView('public')">
                  CONTINUE AS PUBLIC SPECTATOR
                </button>
              </div>

            </div>

          </div>
        </div>
      `;
    }


    // ========================================================
    // VIEW 6: PLAYER REGISTRATION (10 PROGRESSIVE SECTIONS)
    // ========================================================
    let regStep = 1;
    let regFormData = {
      name: "", gender: "MALE", mobile: "", email: "", whatsapp: "",
      roll: "", program: "B.Tech", branch: "CSE", year: "1", bucket: "B1",
      isBatter: "YES", battingStyle: "RIGHT HAND", battingPosition: "TOP ORDER",
      isBowler: "YES", bowlingArm: "RIGHT ARM", bowlingType: "MEDIUM FAST",
      isKeeper: "NO", fieldingZone: "INFIELD",
      experienceYears: "2", clubRep: "COLLEGE TEAM",
      cricHeroesUrl: "", cricHeroesStatus: "PROFILE AVAILABLE",
      referredBy: "", basePrice: 60, photo: ""
    };

    function parseRoll(val) {
      val = val.toUpperCase().trim();
      regFormData.roll = val;
      // Auto-derivation logic for Avanthi roll numbers
      if (val.length >= 10) {
        const yearPrefix = val.substring(0, 2);
        const code = val.substring(2, 6);
        const branchCode = val.substring(6, 8);

        // Derive Year & Bucket from roll prefix
        if (yearPrefix === "26") { regFormData.year = "1"; regFormData.bucket = "B1"; }
        else if (yearPrefix === "25") { regFormData.year = "2"; regFormData.bucket = "B2"; }
        else if (yearPrefix === "24") { regFormData.year = "3"; regFormData.bucket = "B3"; }
        else if (yearPrefix === "23") { regFormData.year = "4"; regFormData.bucket = "B4"; }
        else { regFormData.year = "1"; regFormData.bucket = "B1"; }

        // Program derivation
        if (val.includes("A") || val.includes("R")) regFormData.program = "B.Tech";
        else if (val.includes("D")) { regFormData.program = "Diploma"; regFormData.bucket = "D5"; }
        else if (val.includes("E")) { regFormData.program = "MBA"; regFormData.bucket = "M6"; }

        // Branch derivation
        if (branchCode === "05") regFormData.branch = "CSE";
        else if (branchCode === "04") regFormData.branch = "ECE";
        else if (branchCode === "03") regFormData.branch = "MECH";
        else if (branchCode === "02") regFormData.branch = "EEE";
        else if (branchCode === "01") regFormData.branch = "CIVIL";
        else if (branchCode === "12") regFormData.branch = "IT";
        else regFormData.branch = "CSE";
      }
      renderCurrentView();
    }

    function renderPlayerRegistrationView() {
      return `
        <div style="max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-6);">
          
          <div class="surface-card" style="padding: var(--space-5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
              <div>
                <span class="label-micro" style="color: var(--color-green);">PLAYER REGISTRATION WORKFLOW</span>
                <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text-bright);">
                  SECTION ${regStep} OF 10: ${
                    regStep === 1 ? 'PERSONAL IDENTITY' :
                    regStep === 2 ? 'ACADEMICS & AUTO-BUCKET' :
                    regStep === 3 ? 'BATTING SPECIFICATION' :
                    regStep === 4 ? 'BOWLING SPECIFICATION' :
                    regStep === 5 ? 'FIELDING & WICKET-KEEPING' :
                    regStep === 6 ? 'COMPETITIVE EXPERIENCE' :
                    regStep === 7 ? 'CRICHEROES VERIFICATION' :
                    regStep === 8 ? 'INSTITUTIONAL REFERENCE' :
                    regStep === 9 ? 'OFFICIAL PHOTOGRAPH' : 'REVIEW & BASE PRICE'
                  }
                </h2>
              </div>
              <span class="font-mono label-micro" style="color: var(--color-green);">${regStep * 10}% COMPLETED</span>
            </div>

            <!-- Progress Indicator Bar -->
            <div style="width: 100%; height: 4px; background: var(--surface-2); border-radius: 2px; overflow: hidden;">
              <div style="width: ${regStep * 10}%; height: 100%; background: var(--color-green); transition: width 0.3s ease;"></div>
            </div>
          </div>

          <!-- Active Step Card -->
          <div class="surface-elevated" style="padding: var(--space-6);">
            
            ${regStep === 1 ? `
              <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                <div class="form-group">
                  <label class="form-label">FULL NAME (AS PER COLLEGE ID)</label>
                  <input type="text" class="form-input" value="${regFormData.name}" oninput="regFormData.name = this.value;" placeholder="e.g. Sai Teja" required>
                </div>
                <div class="form-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                  <div class="form-group">
                    <label class="form-label">GENDER</label>
                    <select class="form-select" onchange="regFormData.gender = this.value;">
                      <option value="MALE" ${regFormData.gender === 'MALE' ? 'selected' : ''}>Male</option>
                      <option value="FEMALE" ${regFormData.gender === 'FEMALE' ? 'selected' : ''}>Female</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">MOBILE NUMBER</label>
                    <input type="tel" class="form-input" value="${regFormData.mobile}" oninput="regFormData.mobile = this.value;" placeholder="9876543210" required>
                  </div>
                </div>
                <div class="form-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                  <div class="form-group">
                    <label class="form-label">COLLEGE EMAIL</label>
                    <input type="email" class="form-input" value="${regFormData.email}" oninput="regFormData.email = this.value;" placeholder="roll@avanthi.edu.in">
                  </div>
                  <div class="form-group">
                    <label class="form-label">WHATSAPP NUMBER</label>
                    <input type="tel" class="form-input" value="${regFormData.whatsapp}" oninput="regFormData.whatsapp = this.value;" placeholder="9876543210">
                  </div>
                </div>
              </div>
            ` : ''}

            ${regStep === 2 ? `
              <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                <div class="form-group">
                  <label class="form-label">COLLEGE ROLL NUMBER (AUTO-DERIVES BUCKET)</label>
                  <input type="text" class="form-input font-mono" style="font-size: 1.15rem; letter-spacing: 0.05em;" value="${regFormData.roll}" oninput="parseRoll(this.value)" placeholder="e.g. 26811A0501" required>
                  <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Enter complete 10-digit roll number to auto-derive academic program and bucket.</span>
                </div>

                <div class="surface-subtle" style="padding: var(--space-4); display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2); margin-top: var(--space-2);">
                  <div>
                    <span class="label-micro">PROGRAM</span>
                    <div style="font-weight: 700; color: var(--text-bright);">${regFormData.program}</div>
                  </div>
                  <div>
                    <span class="label-micro">BRANCH</span>
                    <div style="font-weight: 700; color: var(--text-bright);">${regFormData.branch}</div>
                  </div>
                  <div>
                    <span class="label-micro">YEAR</span>
                    <div style="font-weight: 700; color: var(--text-bright);">Year ${regFormData.year}</div>
                  </div>
                  <div>
                    <span class="label-micro" style="color: var(--color-green);">DERIVED BUCKET</span>
                    <div class="font-mono" style="font-size: 1.15rem; font-weight: 800; color: var(--color-green);">${regFormData.bucket}</div>
                  </div>
                </div>
              </div>
            ` : ''}

            ${regStep === 3 ? `
              <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                <div class="form-group">
                  <label class="form-label">SKILLED BATTER?</label>
                  <div style="display: flex; gap: var(--space-3);">
                    <button type="button" class="btn ${regFormData.isBatter === 'YES' ? 'btn-primary' : 'btn-secondary'}" onclick="regFormData.isBatter = 'YES'; renderCurrentView();">YES</button>
                    <button type="button" class="btn ${regFormData.isBatter === 'NO' ? 'btn-primary' : 'btn-secondary'}" onclick="regFormData.isBatter = 'NO'; renderCurrentView();">NO</button>
                  </div>
                </div>

                ${regFormData.isBatter === 'YES' ? `
                  <div class="form-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                    <div class="form-group">
                      <label class="form-label">BATTING STANCE / HAND</label>
                      <select class="form-select" onchange="regFormData.battingStyle = this.value;">
                        <option value="RIGHT HAND" ${regFormData.battingStyle === 'RIGHT HAND' ? 'selected' : ''}>Right Hand Bat</option>
                        <option value="LEFT HAND" ${regFormData.battingStyle === 'LEFT HAND' ? 'selected' : ''}>Left Hand Bat</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">PREFERRED BATTING POSITION</label>
                      <select class="form-select" onchange="regFormData.battingPosition = this.value;">
                        <option value="TOP ORDER" ${regFormData.battingPosition === 'TOP ORDER' ? 'selected' : ''}>Top Order (1-3)</option>
                        <option value="MIDDLE ORDER" ${regFormData.battingPosition === 'MIDDLE ORDER' ? 'selected' : ''}>Middle Order (4-5)</option>
                        <option value="FINISHER" ${regFormData.battingPosition === 'FINISHER' ? 'selected' : ''}>Finisher (6-7)</option>
                      </select>
                    </div>
                  </div>
                ` : ''}
              </div>
            ` : ''}

            ${regStep === 4 ? `
              <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                <div class="form-group">
                  <label class="form-label">SKILLED BOWLER?</label>
                  <div style="display: flex; gap: var(--space-3);">
                    <button type="button" class="btn ${regFormData.isBowler === 'YES' ? 'btn-primary' : 'btn-secondary'}" onclick="regFormData.isBowler = 'YES'; renderCurrentView();">YES</button>
                    <button type="button" class="btn ${regFormData.isBowler === 'NO' ? 'btn-primary' : 'btn-secondary'}" onclick="regFormData.isBowler = 'NO'; renderCurrentView();">NO</button>
                  </div>
                </div>

                ${regFormData.isBowler === 'YES' ? `
                  <div class="form-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                    <div class="form-group">
                      <label class="form-label">BOWLING ARM</label>
                      <select class="form-select" onchange="regFormData.bowlingArm = this.value;">
                        <option value="RIGHT ARM" ${regFormData.bowlingArm === 'RIGHT ARM' ? 'selected' : ''}>Right Arm</option>
                        <option value="LEFT ARM" ${regFormData.bowlingArm === 'LEFT ARM' ? 'selected' : ''}>Left Arm</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">VARIETY</label>
                      <select class="form-select" onchange="regFormData.bowlingType = this.value;">
                        <option value="FAST">Fast</option>
                        <option value="MEDIUM FAST">Medium Fast</option>
                        <option value="OFF SPIN">Off Spin</option>
                        <option value="LEG SPIN">Leg Spin</option>
                      </select>
                    </div>
                  </div>
                ` : ''}
              </div>
            ` : ''}

            ${regStep === 5 ? `
              <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                <div class="form-group">
                  <label class="form-label">WICKET KEEPER?</label>
                  <div style="display: flex; gap: var(--space-3);">
                    <button type="button" class="btn ${regFormData.isKeeper === 'YES' ? 'btn-primary' : 'btn-secondary'}" onclick="regFormData.isKeeper = 'YES'; renderCurrentView();">YES</button>
                    <button type="button" class="btn ${regFormData.isKeeper === 'NO' ? 'btn-primary' : 'btn-secondary'}" onclick="regFormData.isKeeper = 'NO'; renderCurrentView();">NO</button>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">FIELDING ZONE SPECIALTY</label>
                  <select class="form-select" onchange="regFormData.fieldingZone = this.value;">
                    <option value="INFIELD">Infield (Point / Cover)</option>
                    <option value="OUTFIELD">Boundary / Deep</option>
                    <option value="SLIP">Slip Cordon</option>
                  </select>
                </div>
              </div>
            ` : ''}

            ${regStep === 6 ? `
              <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                <div class="form-group">
                  <label class="form-label">YEARS OF CRICKET EXPERIENCE</label>
                  <input type="number" class="form-input" value="${regFormData.experienceYears}" oninput="regFormData.experienceYears = this.value;">
                </div>
                <div class="form-group">
                  <label class="form-label">HIGHEST REPRESENTATION</label>
                  <select class="form-select" onchange="regFormData.clubRep = this.value;">
                    <option value="COLLEGE TEAM">College Varsity Team</option>
                    <option value="DISTRICT">District Level</option>
                    <option value="CLUB">Registered Club</option>
                    <option value="LOCAL">Local / Departmental</option>
                  </select>
                </div>
              </div>
            ` : ''}

            ${regStep === 7 ? `
              <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                <div class="form-group">
                  <label class="form-label">CRICHEROES PROFILE LINK</label>
                  <input type="url" class="form-input" value="${regFormData.cricHeroesUrl}" oninput="regFormData.cricHeroesUrl = this.value;" placeholder="https://cricheroes.in/player-profile/...">
                </div>
                <div class="form-group">
                  <label class="form-label">STATUS</label>
                  <select class="form-select" onchange="regFormData.cricHeroesStatus = this.value;">
                    <option value="PROFILE AVAILABLE">Profile Available</option>
                    <option value="PROFILE CREATION PENDING">Profile Creation Pending</option>
                  </select>
                  <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Pending profiles can register now, but must submit ID prior to auction commencement.</span>
                </div>
              </div>
            ` : ''}

            ${regStep === 8 ? `
              <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                <div class="form-group">
                  <label class="form-label">REFERRED BY (FACULTY / FRANCHISE LEAD)</label>
                  <input type="text" class="form-input" value="${regFormData.referredBy}" oninput="regFormData.referredBy = this.value;" placeholder="e.g. Dr. Ramesh / Titans Coordinator">
                </div>
              </div>
            ` : ''}

            ${regStep === 9 ? `
              <div style="display: flex; flex-direction: column; gap: var(--space-4); align-items: center;">
                <div style="width: 140px; height: 180px; border-radius: var(--radius-md); border: 2px dashed var(--border-medium); display: grid; place-items: center; overflow: hidden; background: var(--surface-1);">
                  ${regFormData.photo ? `
                    <img src="${regFormData.photo}" alt="Uploaded Photo" style="width: 100%; height: 100%; object-fit: cover;">
                  ` : `
                    <span style="font-size: 0.75rem; color: var(--text-faint); text-align: center; padding: 12px;">PHOTO PREVIEW (4:3 CROP)</span>
                  `}
                </div>
                <input type="file" id="regPhotoInput" accept="image/*" style="display: none;" onchange="process4to3Photo(event)">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('regPhotoInput').click()">
                  SELECT HEADSHOT PHOTO
                </button>
              </div>
            ` : ''}

            ${regStep === 10 ? `
              <div style="display: flex; flex-direction: column; gap: var(--space-5);">
                <div class="surface-subtle" style="padding: var(--space-4);">
                  <div class="label-micro" style="color: var(--color-green);">PROFILE SUMMARY</div>
                  <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-bright); margin-top: 4px;">${regFormData.name} (${regFormData.roll})</div>
                  <div style="font-size: 0.8125rem; color: var(--text-muted);">${regFormData.program} · ${regFormData.branch} · Year ${regFormData.year} (${regFormData.bucket})</div>
                </div>

                <div class="form-group">
                  <label class="form-label">SELECT OPENING AUCTION BASE PRICE</label>
                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(68px, 1fr)); gap: 6px;">
                    ${[20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 230, 250].map(val => `
                      <button type="button" class="btn btn-secondary font-mono" style="min-height: 38px; padding: 4px; font-size: 0.8125rem; ${regFormData.basePrice === val ? 'background: var(--color-green); color: #FFFFFF; font-weight: 800;' : ''}" onclick="regFormData.basePrice = ${val}; renderCurrentView();">
                        ${val} C
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- Navigation Buttons -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-6); border-top: 1px solid var(--border-subtle); padding-top: var(--space-4);">
              <button type="button" class="btn btn-secondary" ${regStep === 1 ? 'disabled' : ''} onclick="regStep--; renderCurrentView();">
                PREVIOUS
              </button>

              ${regStep < 10 ? `
                <button type="button" class="btn btn-primary" onclick="regStep++; renderCurrentView();">
                  NEXT SECTION
                </button>
              ` : `
                <button type="button" class="btn btn-primary" onclick="submitPlayerRegistration()">
                  SUBMIT & GENERATE AUCTION PASS
                </button>
              `}
            </div>

          </div>

        </div>
      `;
    }

    // ========================================================
    // VIEW 7: PLAYER PORTAL & OFFICIAL CANDIDATE PASS
    // ========================================================
    function renderPlayerPortalView() {
      const p = (currentUser.role === 'PLAYER' && currentUser.playerId)
        ? (players.find(x => x.id === currentUser.playerId) || players[0])
        : players[0];

      const cur = players[lotIndex] || players[0];
      const isCur = cur.id === p.id;

      return `
        <div style="max-width: 680px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-5);">
          
          <!-- Player Profile Header -->
          <div class="surface-card" style="padding: var(--space-5);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
              <div style="display: flex; gap: 14px; align-items: center;">
                ${getPlayerAvatar(p, 80, 100)}
                <div>
                  <span class="label-micro" style="color: var(--color-green);">PLAYER PORTAL</span>
                  <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text-bright); margin: 2px 0;">${p.name}</h2>
                  <div class="font-mono" style="font-size: 0.8125rem; color: var(--text-muted);">
                    Roll: ${p.roll} • Player ID #${p.id}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-faint); margin-top: 2px;">
                    ${p.program} · ${p.branch} · Year ${p.year}
                  </div>
                </div>
              </div>
              <span class="status-badge status-connected">VERIFIED PLAYER</span>
            </div>

            <div style="margin-top: var(--space-4); display: flex; gap: var(--space-3);">
              <button class="btn btn-primary" style="flex: 1;" onclick="openPlayerPassModal(${p.id})">
                DOWNLOAD OFFICIAL AUCTION PASS
              </button>
            </div>
          </div>

          <!-- Registration Fee Verification Card -->
          <div class="surface-card" style="padding: var(--space-4); border-left: 4px solid var(--color-green);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span class="label-micro" style="color: var(--color-green);">REGISTRATION FEE PAYMENT STATUS</span>
                <div style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; color: var(--text-bright); margin-top: 2px;">
                  ₹200 REGISTRATION CLEARED
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                  Ref: UPI/TXN-884219 • State Bank of India • Verified by Finance Cell
                </div>
              </div>
              <span class="status-badge status-connected">CLEARED</span>
            </div>
          </div>

          <!-- Tournament Auction Status Card -->
          <div class="surface-elevated" style="padding: var(--space-5);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="label-micro">LIVE AUCTION STATUS</span>
              ${p.status === 'SOLD' ? `
                <span class="status-badge status-connected">ACQUIRED</span>
              ` : p.status === 'UNSOLD' ? `
                <span class="status-badge status-blocked">UNSOLD</span>
              ` : isCur ? `
                <span class="status-badge status-inplay">ON AUCTION FLOOR</span>
              ` : `
                <span class="status-badge status-live">UPCOMING LOT</span>
              `}
            </div>

            <div style="margin-top: 12px; padding: 14px; background: var(--surface-2); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              ${p.status === 'SOLD' ? `
                <div style="font-size: 0.8125rem; color: var(--text-muted);">Acquiring Franchise:</div>
                <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--color-green); margin: 4px 0;">
                  ${p.soldTo || 'Franchise'}
                </div>
                <div class="price-display" style="font-size: 1.25rem; color: var(--color-orange);">
                  Sold Price: ${p.soldPrice || p.basePrice} Credits
                </div>
              ` : p.status === 'UNSOLD' ? `
                <div style="font-size: 0.875rem; color: var(--color-red); font-weight: 700;">
                  ROUND 1 UNSOLD
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                  Player is eligible for accelerated recall during Round 2 bidding upon franchise nomination.
                </div>
              ` : isCur ? `
                <div style="font-size: 0.875rem; color: var(--color-orange); font-weight: 700;">
                  CURRENTLY ON THE AUCTION FLOOR!
                </div>
                <div class="price-display" style="font-size: 1.5rem; color: var(--color-orange); margin-top: 4px;">
                  Active Bid: ${currentBid} Credits
                </div>
              ` : `
                <div style="font-size: 0.875rem; color: var(--text-bright); font-weight: 700;">
                  QUEUED FOR AUCTION
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                  Lot #${p.id} • Base Auction Price: <strong class="font-mono" style="color: var(--color-orange);">${p.basePrice} Credits</strong>
                </div>
              `}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-top: var(--space-4);">
              <div class="surface-subtle" style="padding: 10px;">
                <span class="label-micro">ALLOCATED BUCKET</span>
                <div class="font-mono" style="font-size: 1.25rem; font-weight: 800; color: var(--color-green);">${p.bucket}</div>
              </div>
              <div class="surface-subtle" style="padding: 10px;">
                <span class="label-micro">BASE AUCTION PRICE</span>
                <div class="price-display" style="font-size: 1.25rem; color: var(--color-orange);">${p.basePrice} C</div>
              </div>
            </div>

            <div style="margin-top: var(--space-4); border-top: 1px solid var(--border-subtle); padding-top: var(--space-3); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div style="font-size: 0.75rem; color: var(--text-muted);">
                Playing Style: <strong>${p.battingStyle || 'RIGHT HAND'}</strong> • ${p.bowlingArm || 'RIGHT ARM'} ${p.bowlingType || 'FAST'}
              </div>
              <span class="status-badge status-connected" style="font-size: 0.65rem;">CRICHEROES VERIFIED</span>
            </div>
          </div>

        </div>
      `;
    }

    // ========================================================
    // VIEW 8: ADMIN & SUPER ADMIN OPERATIONS CONSOLE
    // ========================================================
    function renderAdminConsoleView() {
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-6);">
          
          <!-- Admin Header Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="status-badge ${isSuperAdmin ? 'status-connected' : 'status-live'}">${isSuperAdmin ? 'SUPER ADMIN OPERATIONAL SUITE' : 'AUCTION FLOOR OPERATOR'}</span>
                <span class="label-micro" style="color: var(--color-green);">LIVE GOVERNANCE DESK</span>
              </div>
              <h2 class="section-title" style="margin-top: 2px;">AUCTIONEER DESK & CONTROLS</h2>
            </div>
            <div class="admin-actions-group" style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
              <button class="btn btn-secondary" onclick="openUndoModal()">UNDO LAST BID</button>
              <button class="btn btn-secondary" onclick="resetAuctionTimer()">RESET TIMER</button>
              <button class="btn btn-secondary" onclick="toggleAuctionPause()">${auctionPaused ? 'RESUME CLOCK' : 'PAUSE CLOCK'}</button>
            </div>
          </div>

          <!-- Operational Notice for Admin Handler -->
          ${!isSuperAdmin ? `
            <div class="surface-subtle" style="padding: 10px 14px; border-left: 3px solid var(--color-blue); font-size: 0.8125rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
              <span><strong>OPERATIONAL DESK:</strong> You have live floor hammer & execution authority. System provisioning and franchise account management are reserved for the Super Admin.</span>
              <span class="status-badge status-live" style="font-size: 0.625rem;">OPERATOR</span>
            </div>
          ` : ''}

          <!-- REALTIME ADMIN LIVE PARTICIPATION MONITOR (Section 50) -->
          <div class="surface-card" style="padding: var(--space-4); border-left: 3px solid var(--color-green);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <span class="label-micro" style="color: var(--color-green); margin: 0;">REALTIME TELEMETRY MONITOR (DEDUPLICATED)</span>
              <span class="status-badge status-connected" style="font-size: 0.65rem;">FIREBASE RTDB ACTIVE</span>
            </div>
            <div class="admin-telemetry-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
              <div style="background: var(--surface-2); padding: 8px 12px; border-radius: 6px;">
                <div class="label-micro" style="font-size: 0.65rem; color: var(--text-muted);">LIVE USERS</div>
                <div class="font-mono" style="font-size: 1.4rem; font-weight: 800; color: var(--text-bright);">${(window.RealtimeStore && window.RealtimeStore.state.presence.liveUsers) || liveUsersCount}</div>
              </div>
              <div style="background: var(--surface-2); padding: 8px 12px; border-radius: 6px;">
                <div class="label-micro" style="font-size: 0.65rem; color: var(--color-orange);">ACTIVE FRANCHISES</div>
                <div class="font-mono" style="font-size: 1.4rem; font-weight: 800; color: var(--color-orange);">${(window.RealtimeStore && window.RealtimeStore.state.presence.activeFranchises) || 0} / 11</div>
              </div>
              <div style="background: var(--surface-2); padding: 8px 12px; border-radius: 6px;">
                <div class="label-micro" style="font-size: 0.65rem; color: var(--color-blue);">ACTIVE TEAM LEADS</div>
                <div class="font-mono" style="font-size: 1.4rem; font-weight: 800; color: var(--color-blue);">${(window.RealtimeStore && window.RealtimeStore.state.presence.activeTeamLeads) || 0}</div>
              </div>
              <div style="background: var(--surface-2); padding: 8px 12px; border-radius: 6px;">
                <div class="label-micro" style="font-size: 0.65rem; color: var(--color-purple);">ACTIVE PLAYERS</div>
                <div class="font-mono" style="font-size: 1.4rem; font-weight: 800; color: var(--color-purple);">${(window.RealtimeStore && window.RealtimeStore.state.presence.activePlayers) || 0}</div>
              </div>
              <div style="background: var(--surface-2); padding: 8px 12px; border-radius: 6px;">
                <div class="label-micro" style="font-size: 0.65rem; color: var(--text-subtle);">PUBLIC VIEWERS</div>
                <div class="font-mono" style="font-size: 1.4rem; font-weight: 800; color: var(--text-muted);">${(window.RealtimeStore && window.RealtimeStore.state.presence.publicViewers) || 1}</div>
              </div>
            </div>
          </div>

          <!-- Current Lot Operational Arena -->
          <div class="responsive-split-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-6);">
            
            <div class="surface-card" style="padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="status-badge status-inplay">ACTIVE LOT #${cur.id}</span>
                <div class="auction-timer-widget ${timerSeconds <= 5 ? 'critical' : timerSeconds <= 10 ? 'warning' : 'normal'}" style="padding: 4px 10px; gap: 8px;">
                  ${getHourglassSvg(24)}
                  <span class="label-micro font-mono" style="font-weight: 800;">${timerSeconds}s</span>
                </div>
              </div>

              <div style="display: flex; gap: var(--space-3); align-items: center;">
                ${getPlayerAvatar(cur, 90, 110)}
                <div>
                  <div class="label-micro" style="color: var(--color-green);">${cur.bucket} • ${cur.derivedType || 'BATTER'}</div>
                  <h3 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text-bright);">${cur.name}</h3>
                  <div style="font-size: 0.8125rem; color: var(--text-muted);">${cur.program} · ${cur.branch} · Year ${cur.year}</div>
                  <div class="font-mono" style="font-size: 0.75rem; color: var(--text-faint);">Roll: ${cur.roll} • Base: ${cur.basePrice}C</div>
                </div>
              </div>

              <!-- Primary Execution Controls -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-top: var(--space-2);">
                <button class="btn btn-primary" style="min-height: 52px; font-size: 1rem;" onclick="openHammerConfirmModal()">
                  HAMMER (SOLD)
                </button>
                <button class="btn btn-danger" style="min-height: 52px; font-size: 1rem;" onclick="executeHammerUnsold()">
                  MARK UNSOLD
                </button>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
                <button class="btn btn-secondary" onclick="skipPlayer()">SKIP LOT</button>
                <button class="btn btn-secondary" onclick="drawNextPlayer()">NEXT LOT</button>
              </div>
            </div>

            <!-- Current Bid & Bid Injector -->
            <div class="surface-elevated" style="padding: var(--space-5); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <span class="label-micro">CURRENT AUCTION STATE</span>
                <div class="price-display" style="font-size: 3.5rem; color: var(--color-orange); margin: 6px 0;">
                  ${currentBid} <span style="font-size: 1.15rem; color: var(--text-muted);">C</span>
                </div>
                <div style="font-size: 0.875rem; color: var(--text-bright);">Held by: <strong>${leader ? leader.name : 'NO BIDS'}</strong></div>
              </div>

              <!-- Manual Bid Override Injector -->
              <div style="margin-top: var(--space-4); border-top: 1px solid var(--border-subtle); padding-top: var(--space-4);">
                <span class="label-micro">DIRECT BID INJECTION (ADMIN OVERRIDE)</span>
                <div style="display: flex; gap: var(--space-2); margin-top: 6px;">
                  <select class="form-select" id="adminInjectFranchise">
                    ${franchises.map(f => `<option value="${f.id}">${f.name} (Purse: ${f.purse}C)</option>`).join('')}
                  </select>
                  <button class="btn btn-auction" onclick="placeBid(parseInt(document.getElementById('adminInjectFranchise').value))">
                    SUBMIT BID
                  </button>
                </div>
              </div>
            </div>

          </div>

          <!-- Immutable Audit Trail -->
          <div class="surface-card" style="padding: var(--space-5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); flex-wrap: wrap; gap: 8px;">
              <span class="label-micro" style="color: var(--color-green);">IMMUTABLE AUCTION AUDIT LOG</span>
              ${isSuperAdmin ? `
                <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 2px 8px; min-height: 28px;" onclick="exportAuditLogCSV()">EXPORT MASTER CSV</button>
              ` : `
                <span class="label-mono font-mono" style="font-size: 0.6875rem; color: var(--text-faint);">LOG EXPORT RESERVED FOR SUPER ADMIN</span>
              `}
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto;">
              ${auditLog.map(item => `
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; padding: 6px 10px; background: var(--surface-2); border-radius: 4px; flex-wrap: wrap; gap: 4px;">
                  <span class="font-mono" style="color: var(--text-faint);">${item.time}</span>
                  <span style="color: var(--text-bright); font-weight: 600;">${item.action}</span>
                  <span class="font-mono" style="color: var(--color-green);">${item.details}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- SUPER ADMIN EXCLUSIVE GOVERNANCE PANELS -->
          ${isSuperAdmin ? `
            <div style="display: flex; flex-direction: column; gap: var(--space-5); margin-top: var(--space-2); border-top: 1px solid var(--border-medium); padding-top: var(--space-5);">
              <div>
                <span class="label-micro" style="color: var(--color-green);">SUPER ADMIN GOVERNANCE SUITE</span>
                <h3 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text-bright); margin-top: 2px;">
                  11 FRANCHISE IDENTITY & ACCOUNTS DIRECTORY
                </h3>
                <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 4px;">
                  Manage Faculty Coordinator and Team Leader authentication accounts, enforce isolation, and reset access credentials.
                </p>
              </div>

              <!-- Franchise Governance Table -->
              <div class="surface-card" style="padding: 0; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem;">
                  <thead>
                    <tr style="background: var(--surface-2); border-bottom: 1px solid var(--border-medium); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">
                      <th style="padding: 12px 16px;">Franchise</th>
                      <th style="padding: 12px 16px;">Purse</th>
                      <th style="padding: 12px 16px;">Faculty Coordinator (Owner)</th>
                      <th style="padding: 12px 16px;">Team Captain (Leader)</th>
                      <th style="padding: 12px 16px;">Status</th>
                      <th style="padding: 12px 16px; text-align: right;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${franchises.map(f => {
                      const coordUser = users.find(u => u.franchiseId === f.id && u.identityType === 'COORDINATOR');
                      const leadUser = users.find(u => u.franchiseId === f.id && u.identityType === 'TEAM_LEADER');
                      const isLocked = coordUser && coordUser.status === 'LOCKED';
                      return `
                        <tr style="border-bottom: 1px solid var(--border-subtle);">
                          <td style="padding: 12px 16px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                              ${getTeamEmblem(f.id, 28)}
                              <strong>${f.name}</strong>
                            </div>
                          </td>
                          <td style="padding: 12px 16px; font-family: var(--font-mono); font-weight: 700; color: var(--color-green);">
                            ${f.purse} C
                          </td>
                          <td style="padding: 12px 16px;">
                            <div>${coordUser ? coordUser.name : 'Prof. Coordinator'}</div>
                            <div class="font-mono" style="font-size: 0.6875rem; color: var(--text-faint);">${coordUser ? coordUser.username : `f${f.id}_coord`}</div>
                          </td>
                          <td style="padding: 12px 16px;">
                            <div>${leadUser ? leadUser.name : 'Team Captain'}</div>
                            <div class="font-mono" style="font-size: 0.6875rem; color: var(--text-faint);">${leadUser ? leadUser.username : `f${f.id}_lead`}</div>
                          </td>
                          <td style="padding: 12px 16px;">
                            <span class="status-badge ${isLocked ? 'status-blocked' : 'status-connected'}" style="font-size: 0.625rem;">
                              ${isLocked ? 'LOCKED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td style="padding: 12px 16px; text-align: right;">
                            <div style="display: flex; gap: 6px; justify-content: flex-end;">
                              <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="toggleFranchiseLock(${f.id})">
                                ${isLocked ? 'UNLOCK' : 'LOCK'}
                              </button>
                              <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="resetFranchiseCredential(${f.id})">
                                RESET KEY
                              </button>
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Staff Operator Provisioning -->
              <div class="surface-card" style="padding: var(--space-5);">
                <div style="margin-bottom: var(--space-4);">
                  <span class="label-micro" style="color: var(--color-green);">STAFF PROVISIONING</span>
                  <h4 style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; color: var(--text-bright); margin-top: 2px;">
                    ADD OPERATIONAL AUCTION HANDLER
                  </h4>
                </div>
                <form onsubmit="provisionStaffHandler(event)" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) auto; gap: var(--space-3); align-items: flex-end;">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">OPERATOR FULL NAME</label>
                    <input type="text" class="form-input" id="newStaffName" placeholder="e.g. S. Kalyan" required>
                  </div>
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">OFFICIAL EMAIL</label>
                    <input type="email" class="form-input" id="newStaffEmail" placeholder="e.g. kalyan@acc.edu" required>
                  </div>
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">USERNAME</label>
                    <input type="text" class="form-input" id="newStaffUser" placeholder="e.g. handler2" required>
                  </div>
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">TEMPORARY PASSWORD</label>
                    <input type="password" class="form-input" id="newStaffPass" placeholder="••••••••" required>
                  </div>
                  <button type="submit" class="btn btn-primary" style="min-height: 42px; font-size: 0.8125rem;">
                    PROVISION OPERATOR
                  </button>
                </form>
              </div>

              <!-- Credential Recovery Requests Queue -->
              <div class="surface-card" style="padding: var(--space-5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
                  <div>
                    <span class="label-micro" style="color: var(--color-green);">CREDENTIAL RECOVERY QUEUE</span>
                    <h4 style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; color: var(--text-bright); margin-top: 2px;">
                      PENDING PASSWORD RESET REQUESTS
                    </h4>
                  </div>
                  <span class="label-mono font-mono" style="font-size: 0.75rem;">${passwordResetRequests.length} Pending</span>
                </div>

                ${passwordResetRequests.length === 0 ? `
                  <div style="text-align: center; padding: var(--space-4); color: var(--text-faint); font-size: 0.8125rem;">
                    No pending credential reset requests from users.
                  </div>
                ` : `
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${passwordResetRequests.map((req, idx) => `
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--surface-2); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 8px;">
                        <div>
                          <div style="font-weight: 700; color: var(--text-bright);">${req.role}: ${req.identifier}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">${req.contact || 'No contact'} • ${req.time}</div>
                          ${req.reason ? `<div style="font-size: 0.6875rem; color: var(--text-faint);">Note: ${req.reason}</div>` : ''}
                        </div>
                        <button class="btn btn-primary" style="font-size: 0.6875rem; padding: 4px 10px; min-height: 30px;" onclick="resolvePasswordReset(${idx})">
                          RESOLVE & RESET
                        </button>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>

            </div>
          ` : ''}

        </div>
      `;
    }

    // ========================================================
    // VIEW 9: PROJECTOR BROADCAST (FULL-SCREEN BROADCAST)
    // ========================================================
    function renderProjectorView() {
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const timerClass = timerSeconds <= 5 ? 'var(--color-red)' : timerSeconds <= 10 ? 'var(--color-yellow)' : 'var(--color-green)';

      return `
        <div style="position: fixed; inset: 0; background: var(--bg-dark-0); z-index: 9999; display: flex; flex-direction: column; padding: clamp(20px, 3vw, 40px); overflow: hidden;">
          
          <!-- Projector Minimal Top Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-medium); padding-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <img src="acc-logo.png" alt="ACC Logo" style="width: 48px; height: 48px; border-radius: 12px; object-fit: cover; background: #fff; border: 1.5px solid var(--border-medium); box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
              <div>
                <span style="font-family: var(--font-display); font-size: 2rem; font-weight: 800; color: var(--text-bright); line-height: 1;">ACC 2026</span>
                <div style="font-family: var(--font-sans); font-size: 0.8125rem; font-weight: 700; color: var(--color-green); letter-spacing: 0.1em; text-transform: uppercase;">
                  AVANTHI CRICKET CARNIVAL · PLAYER AUCTION
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="status-badge status-live" style="font-size: 0.875rem; padding: 6px 14px;">LIVE BROADCAST</span>
              <button class="btn btn-secondary" style="min-height: 36px; padding: 4px 12px;" onclick="switchView('public')">EXIT PROJECTOR</button>
            </div>
          </div>

          <!-- Main Broadcast Content -->
          <div style="flex: 1; display: grid; grid-template-columns: 1.1fr 1fr; gap: 48px; align-items: center; padding: 24px 0;">
            
            <!-- Left: Giant Player Photo & Identity -->
            <div style="display: flex; gap: 32px; align-items: center;">
              ${getPlayerAvatar(cur, 260, 340)}
              <div>
                <span class="status-badge status-inplay" style="font-size: 1rem; padding: 6px 14px;">LOT #${cur.id} • ${cur.bucket}</span>
                <h1 style="font-family: var(--font-display); font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 800; color: var(--text-bright); line-height: 1.05; margin: 12px 0 8px;">
                  ${cur.name}
                </h1>
                <div style="font-size: 1.25rem; font-weight: 700; color: var(--color-green); text-transform: uppercase;">
                  ${cur.derivedType || 'BATTER'}
                </div>
                <div style="font-size: 1rem; color: var(--text-muted); margin-top: 6px;">
                  ${cur.program} · ${cur.branch} · Year ${cur.year}
                </div>
                <div class="font-mono" style="font-size: 0.875rem; color: var(--text-faint); margin-top: 4px;">
                  Base Price: ${cur.basePrice} Credits
                </div>
              </div>
            </div>

            <!-- Right: Dominant Current Bid & Timer -->
            <div class="surface-elevated" style="padding: 40px; border-radius: var(--radius-xl); text-align: center; border: 2px solid var(--border-strong);">
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <span class="label-micro" style="font-size: 0.875rem;">OFFICIAL TIMER</span>
                <div class="auction-timer-widget ${timerSeconds <= 5 ? 'critical' : timerSeconds <= 10 ? 'warning' : 'normal'}" style="padding: 8px 24px; gap: 14px;">
                  ${getHourglassSvg(52)}
                  <span class="font-mono" style="font-size: 3rem; font-weight: 800; line-height: 1;">
                    ${timerSeconds} SEC
                  </span>
                </div>
              </div>

              <div style="background: var(--surface-1); padding: 32px; border-radius: var(--radius-lg); border: 1px solid var(--border-medium);">
                <div class="label-micro" style="color: var(--color-orange); font-size: 1rem; letter-spacing: 0.18em;">CURRENT BID</div>
                <div class="price-display" style="font-size: clamp(4.5rem, 9vw, 7.5rem); color: var(--color-orange); margin: 8px 0;">
                  ${currentBid} <span style="font-size: 2rem; color: var(--text-muted); font-weight: 700;">CREDITS</span>
                </div>
                <div style="margin-top: 12px; display: inline-flex; align-items: center; gap: 12px; background: rgba(217, 119, 6, 0.12); padding: 8px 24px; border-radius: var(--radius-full); border: 1.5px solid rgba(217, 119, 6, 0.35);">
                  ${leader ? `
                    ${getTeamEmblem(leader.id, 36)}
                    <span style="font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--color-orange);">${leader.name}</span>
                  ` : `
                    <span style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text-muted);">OPENING BASE</span>
                  `}
                </div>
              </div>

            </div>

          </div>

          <!-- Bottom: 11 Teams Status Strip -->
          <div style="display: grid; grid-template-columns: repeat(11, 1fr); gap: 8px; border-top: 2px solid var(--border-medium); padding-top: 16px;">
            ${franchises.map(f => `
              <div class="surface-subtle" style="padding: 8px 4px; text-align: center; border-radius: var(--radius-sm); display: flex; flex-direction: column; align-items: center; gap: 4px; ${f.id === leadingBidderId ? 'background: rgba(217, 119, 6, 0.15); border-color: var(--color-orange);' : ''}">
                ${getTeamEmblem(f.id, 24)}
                <div style="font-family: var(--font-display); font-size: 0.75rem; font-weight: 800; color: var(--text-bright); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">${f.name}</div>
                <div class="font-mono" style="font-size: 0.8125rem; font-weight: 700; color: var(--color-green);">${f.purse}C</div>
              </div>
            `).join('')}
          </div>

        </div>
      `;
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
          return { title: "LOADING PLAYERS DIRECTORY...", sub: "Fetching verified player profiles & stats" };
        case "teams":
          return { title: "LOADING 11 FRANCHISE ROSTERS...", sub: "Calculating purse reserves and squad quotas" };
        case "login":
          return { title: "OPENING SECURE AUTHENTICATION GATEWAY...", sub: "RBAC verification for Player, Franchise & Staff" };
        case "franchise":
          return { title: "ACCESSING FRANCHISE COMMAND CENTER...", sub: "Authorizing bidding controls and squad management" };
        case "admin":
          return { title: "LOADING SUPER ADMIN CONSOLE...", sub: "Verifying master governance authority & logs" };
        case "player":
          return { title: "LOADING PLAYER PORTAL...", sub: "Fetching personal profile and allocation status" };
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
          showToast("Player authentication required to access personal portal.", "warning");
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
      if (window.RealtimeStore) {
        window.RealtimeStore.state.public.liveUsers = liveUsersCount;
        window.RealtimeStore.state.presence.liveUsers = liveUsersCount;
      }
      document.querySelectorAll("#liveUsersCount").forEach(el => {
        el.textContent = liveUsersCount;
      });
      const activeFranchiseEl = document.getElementById("activeFranchisesCount");
      if (activeFranchiseEl && window.RealtimeStore) {
        activeFranchiseEl.textContent = `${window.RealtimeStore.state.presence.activeFranchises || 0} / 11`;
      }
    }

    function getTeamOnlineCount(franchiseId) {
      if (!franchiseId) return 1;
      const presenceDetails = (window.RealtimeStore && window.RealtimeStore.state.presence.details) || {};
      let count = 0;
      for (const [uKey, conns] of Object.entries(presenceDetails)) {
        if (!conns || typeof conns !== 'object') continue;
        const entries = Object.values(conns);
        if (entries.some(c => c && c.franchiseId == franchiseId)) {
          count++;
        }
      }
      return Math.max(1, count);
    }

    // ========================================================
    // HEADER NAVIGATION CONTROLLER (SINGLE LOGIN / LIVE USERS)
    // ========================================================
    function renderHeaderNav() {
      const nav = document.getElementById("mainNavLinks");
      const auth = document.getElementById("headerAuthArea");
      const activeFranchisesDisplay = (window.RealtimeStore && window.RealtimeStore.state.presence.activeFranchises) !== undefined
        ? window.RealtimeStore.state.presence.activeFranchises
        : 0;

      // Dynamic header strictly conforming to Master Specifications (Section 29):
      if (currentUser.role === "SPECTATOR") {
        // PUBLIC HEADER: Strictly only Players, Teams, Live Auction, LIVE USERS, and LOGIN (minimal typography, no icon)
        nav.innerHTML = `
          <button class="nav-link-btn ${currentView === 'public' ? 'active' : ''}" onclick="switchView('public')">PLAYERS</button>
          <button class="nav-link-btn ${currentView === 'teams' ? 'active' : ''}" onclick="switchView('teams')">TEAMS</button>
          <button class="nav-link-btn ${currentView === 'live' ? 'active' : ''}" onclick="switchView('live')">LIVE AUCTION</button>
        `;
        auth.innerHTML = `
          <div class="live-users-pill" style="border: none; background: transparent; padding: 0 4px;">
            <span class="label-micro" style="color: var(--color-green); margin: 0; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.05em;">LIVE USERS</span>
            <span id="liveUsersCount" class="font-mono" style="font-weight: 800; font-size: 1.05rem; color: var(--text-bright); margin-left: 4px;">${liveUsersCount}</span>
          </div>
          <button class="btn btn-primary" style="min-height: 36px; padding: 6px 18px; font-size: 0.75rem; letter-spacing: 0.05em;" onclick="switchView('login')">LOGIN</button>
        `;
      } else if (currentUser.role === "SUPER_ADMIN") {
        // SUPER ADMIN HEADER: ACC 2026 | SUPER ADMIN | LIVE USERS & ACTIVE FRANCHISES | Live Auction | Admin Console | Projector | LOGOUT
        nav.innerHTML = `
          <div style="display: flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(5, 150, 105, 0.12); border: 1px solid var(--color-green); border-radius: 6px;">
            <span class="status-badge status-connected" style="font-size: 0.65rem; padding: 2px 6px;">SUPER ADMIN</span>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-bright);">${currentUser.name}</span>
          </div>
          <div class="live-users-pill">
            <span class="label-micro" style="color: var(--color-green); margin: 0; font-size: 0.65rem;">LIVE USERS</span>
            <span id="liveUsersCount" style="font-weight: 800; color: var(--text-bright);">${liveUsersCount}</span>
          </div>
          <div class="live-users-pill">
            <span class="label-micro" style="color: var(--color-orange); margin: 0; font-size: 0.65rem;">ACTIVE FRANCHISES</span>
            <span id="activeFranchisesCount" style="font-weight: 800; color: var(--text-bright);">${activeFranchisesDisplay} / 11</span>
          </div>
          <button class="nav-link-btn ${currentView === 'live' ? 'active' : ''}" onclick="switchView('live')">LIVE AUCTION</button>
          <button class="nav-link-btn ${currentView === 'admin' ? 'active' : ''}" onclick="switchView('admin')">ADMIN CONSOLE</button>
          <button class="nav-link-btn ${currentView === 'projector' ? 'active' : ''}" onclick="switchView('projector')">PROJECTOR</button>
        `;
        auth.innerHTML = `
          <button class="btn btn-secondary" style="min-height: 36px; padding: 6px 14px; font-size: 0.75rem; color: var(--color-red); border-color: rgba(225,29,72,0.3);" onclick="logoutUser()">LOGOUT</button>
        `;
      } else if (currentUser.role === "ADMIN") {
        // ADMIN / HANDLER HEADER: ACC 2026 | OPERATOR | LIVE USERS & ACTIVE FRANCHISES | Live Auction | Auction Handler | LOGOUT
        nav.innerHTML = `
          <div style="display: flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(2, 132, 199, 0.12); border: 1px solid var(--color-blue); border-radius: 6px;">
            <span class="status-badge status-live" style="font-size: 0.65rem; padding: 2px 6px;">OPERATOR</span>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-bright);">${currentUser.name}</span>
          </div>
          <div class="live-users-pill">
            <span class="label-micro" style="color: var(--color-green); margin: 0; font-size: 0.65rem;">LIVE USERS</span>
            <span id="liveUsersCount" style="font-weight: 800; color: var(--text-bright);">${liveUsersCount}</span>
          </div>
          <div class="live-users-pill">
            <span class="label-micro" style="color: var(--color-orange); margin: 0; font-size: 0.65rem;">ACTIVE FRANCHISES</span>
            <span id="activeFranchisesCount" style="font-weight: 800; color: var(--text-bright);">${activeFranchisesDisplay} / 11</span>
          </div>
          <button class="nav-link-btn ${currentView === 'live' ? 'active' : ''}" onclick="switchView('live')">LIVE AUCTION</button>
          <button class="nav-link-btn ${currentView === 'admin' ? 'active' : ''}" onclick="switchView('admin')">AUCTION HANDLER</button>
        `;
        auth.innerHTML = `
          <button class="btn btn-secondary" style="min-height: 36px; padding: 6px 14px; font-size: 0.75rem; color: var(--color-red); border-color: rgba(225,29,72,0.3);" onclick="logoutUser()">LOGOUT</button>
        `;
      } else if (currentUser.role === "FRANCHISE") {
        // FRANCHISE HEADER: ACC 2026 | [FRANCHISE NAME] ([IDENTITY]) | Purse: [X]C | TEAM ONLINE [N] USERS | LIVE FLOOR | SQUAD | LOGOUT
        const myF = franchises.find(f => f.id === currentUser.franchiseId) || franchises[0];
        const identityText = currentUser.identityType === 'COORDINATOR' ? 'Coordinator' : 'Captain';
        const teamOnlineCount = getTeamOnlineCount(myF.id);
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
            <span class="label-micro" style="color: var(--color-green); margin: 0; font-size: 0.65rem;">TEAM ONLINE</span>
            <span style="font-weight: 800; color: var(--text-bright); margin-left: 4px;">${teamOnlineCount} USERS</span>
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
            <span class="status-badge status-connected" style="font-size: 0.65rem; padding: 2px 6px;">PLAYER</span>
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
    // 10. REALTIME ARCHITECTURE: STORE, PRESENCE & AUTHORITATIVE SYNC
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

    // SECTION 4: CENTRAL REALTIME STORE
    window.RealtimeStore = {
      state: {
        auth: {
          user: null,
          role: 'SPECTATOR',
          identityType: 'PUBLIC',
          franchiseId: null,
          playerId: null
        },
        auction: {
          lotIndex: 0,
          currentBid: 20,
          leadingBidderId: null,
          timerSeconds: 17,
          timerDeadline: 0,
          timerRunning: false,
          auctionPaused: false,
          passedFranchiseIds: [],
          lotVersion: 1
        },
        currentLot: null,
        franchise: [],
        players: [],
        public: {
          liveUsers: 1,
          connectionsCount: 1,
          updatedAt: 0
        },
        presence: {
          userKey: null,
          connectionId: null,
          status: 'OFFLINE',
          liveUsers: 1,
          liveConnections: 1,
          activeFranchises: 0,
          activeTeamLeads: 0,
          activePlayers: 0,
          publicViewers: 1,
          details: {}
        },
        connection: {
          status: 'SYNCING', // 'CONNECTED' | 'OFFLINE' | 'RECONNECTING' | 'SYNCING'
          serverTimeOffset: 0
        }
      }
    };

    function renderConnectionBadge(overrideText) {
      const badge = document.getElementById("liveHeaderBadge");
      if (!badge) return;
      const status = overrideText || (window.RealtimeStore ? window.RealtimeStore.state.connection.status : "SYNCING");
      if (status === "LIVE" || status === "CONNECTED") {
        badge.className = "status-badge status-live";
        badge.textContent = "LIVE";
      } else if (status === "SYNCING") {
        badge.className = "status-badge status-reconnecting";
        badge.textContent = "SYNCING...";
      } else if (status === "RECONNECTING") {
        badge.className = "status-badge status-reconnecting";
        badge.textContent = "RECONNECTING";
      } else if (status === "OFFLINE") {
        badge.className = "status-badge status-offline";
        badge.textContent = "OFFLINE";
      }
    }

    // SECTION 40: REALTIME MANAGER
    window.RealtimeManager = {
      unsubAuction: null,
      unsubPresence: null,
      unsubPublicStats: null,
      unsubConnected: null,
      unsubOffset: null,

      init() {
        console.log("[RealtimeManager] Initializing subscriptions...");
        this.subscribeMultiTab();
        this.subscribeConnection();
        this.subscribeServerOffset();
        this.subscribeAuctionState();
        this.subscribePresenceSystem();
      },

      subscribeMultiTab() {
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
      },

      subscribeConnection() {
        if (!fbRtdb) return;
        const connectedRef = fbRtdb.ref(".info/connected");
        console.log("[RTDB] connection listener attached");
        connectedRef.on("value", (snap) => {
          if (snap.val() === true) {
            console.log("[RTDB] State changed: CONNECTED");
            RealtimeStore.state.connection.status = "CONNECTED";
            renderConnectionBadge("LIVE");
            this.registerPresenceRecord();
          } else {
            console.log("[RTDB] State changed: OFFLINE / RECONNECTING");
            RealtimeStore.state.connection.status = RealtimeStore.state.presence.connectionId ? "RECONNECTING" : "OFFLINE";
            RealtimeStore.state.presence.status = "OFFLINE";
            renderConnectionBadge();
          }
        });
      },

      subscribeServerOffset() {
        if (!fbRtdb) return;
        const offsetRef = fbRtdb.ref(".info/serverTimeOffset");
        offsetRef.on("value", (snap) => {
          RealtimeStore.state.connection.serverTimeOffset = snap.val() || 0;
        });
      },

      subscribeAuctionState() {
        if (!fbDb) return;
        if (this.unsubAuction) {
          console.log("[Firestore] auction listener removed");
          this.unsubAuction();
          this.unsubAuction = null;
        }
        console.log("[Firestore] auction listener attached");
        auctionDocRef = fbDb.collection("acc_auctions").doc("acc_main_2026");

        // Single authoritative fetch on load / refresh (Section 5 & 6)
        auctionDocRef.get().then((docSnap) => {
          if (docSnap.exists) {
            applyAuthoritativeAuctionState(docSnap.data(), false);
          } else {
            broadcastAuthoritativeState();
          }
          hideLoadingOverlay();
        }).catch((err) => {
          console.warn("[Firestore] Authoritative fetch note:", err);
          hideLoadingOverlay();
        });

        // Realtime listener
        this.unsubAuction = auctionDocRef.onSnapshot((docSnap) => {
          if (docSnap.exists) {
            applyAuthoritativeAuctionState(docSnap.data(), false);
          }
        }, (err) => {
          console.warn("[Firestore] auction listener error:", err);
          RealtimeStore.state.connection.status = "RECONNECTING";
          renderConnectionBadge();
        });
      },

      registerPresenceRecord() {
        if (!fbRtdb) return;
        // Public session visitor ID in sessionStorage (Section 17)
        let accVisitorId = sessionStorage.getItem("accVisitorId");
        if (!accVisitorId) {
          accVisitorId = "pub_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
          sessionStorage.setItem("accVisitorId", accVisitorId);
        }

        if (!myConnId) {
          myConnId = "conn_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
        }

        const isAuth = currentUser && currentUser.role && currentUser.role !== "SPECTATOR";
        const userKey = isAuth ? (currentUser.uid || ("usr_" + (currentUser.username || "auth"))) : accVisitorId;

        RealtimeStore.state.presence.userKey = userKey;
        RealtimeStore.state.presence.connectionId = myConnId;

        myPresenceRef = fbRtdb.ref("presence/" + userKey + "/" + myConnId);

        // Section 15: STRICT ON-DISCONNECT ORDER
        // 1. Reference created (myPresenceRef)
        // 2. Register onDisconnect().remove()
        // 3. Confirm onDisconnect registration
        // 4. Write online connection record
        myPresenceRef.onDisconnect().remove().then(() => {
          const sessionPayload = {
            connId: myConnId,
            type: isAuth ? 'AUTHENTICATED' : 'PUBLIC',
            uid: isAuth ? userKey : null,
            role: currentUser.role || 'SPECTATOR',
            identityType: currentUser.identityType || 'PUBLIC',
            franchiseId: currentUser.franchiseId || null,
            page: currentView,
            connectedAt: firebase.database.ServerValue.TIMESTAMP,
            lastHeartbeat: firebase.database.ServerValue.TIMESTAMP
          };
          return myPresenceRef.set(sessionPayload);
        }).then(() => {
          RealtimeStore.state.presence.status = "ONLINE";
        }).catch(err => {
          console.warn("[RTDB] Presence registration note:", err);
        });
      },

      subscribePresenceSystem() {
        if (!fbRtdb) return;

        // Cleanup existing listeners
        if (this.unsubPresence) {
          console.log("[RTDB] presence listener removed");
          this.unsubPresence.off();
          this.unsubPresence = null;
        }
        if (this.unsubPublicStats) {
          this.unsubPublicStats.off();
          this.unsubPublicStats = null;
        }

        const isAdmin = currentUser.role === "SUPER_ADMIN" || currentUser.role === "ADMIN";

        if (isAdmin) {
          // ADMIN MONITOR: Listens to /presence for deep telemetry (Section 50)
          console.log("[RTDB] presence listener attached");
          const presenceRef = fbRtdb.ref("presence");
          this.unsubPresence = presenceRef;
          presenceRef.on("value", (snapshot) => {
            const val = snapshot.val() || {};
            RealtimeStore.state.presence.details = val;
            let totalConns = 0;
            const uniqueKeys = new Set();
            const franchiseSet = new Set();
            let teamLeads = 0;
            let playersCount = 0;
            let pubViewers = 0;

            for (const [uKey, conns] of Object.entries(val)) {
              if (!conns || typeof conns !== 'object') continue;
              const entries = Object.values(conns);
              if (entries.length > 0) {
                uniqueKeys.add(uKey);
                totalConns += entries.length;
                const sample = entries[0];
                if (uKey.startsWith("pub_") || sample.type === "PUBLIC") {
                  pubViewers++;
                } else {
                  if (sample.franchiseId) {
                    franchiseSet.add(String(sample.franchiseId));
                  }
                  if (sample.identityType === "TEAM_LEADER" || sample.identityType === "CAPTAIN") {
                    teamLeads++;
                  }
                  if (sample.role === "PLAYER") {
                    playersCount++;
                  }
                }
              }
            }

            const calculatedUsers = Math.max(1, uniqueKeys.size);
            RealtimeStore.state.presence.liveUsers = calculatedUsers;
            RealtimeStore.state.presence.liveConnections = Math.max(1, totalConns);
            RealtimeStore.state.presence.activeFranchises = franchiseSet.size;
            RealtimeStore.state.presence.activeTeamLeads = teamLeads;
            RealtimeStore.state.presence.activePlayers = playersCount;
            RealtimeStore.state.presence.publicViewers = pubViewers;

            updateLiveUsersCount(calculatedUsers);

            // Synchronize authoritative safe aggregate for public viewers (Section 22 & 23)
            fbRtdb.ref("publicStats/liveUsers").set({
              count: calculatedUsers,
              connectionsCount: Math.max(1, totalConns),
              activeFranchisesCount: franchiseSet.size,
              activeTeamLeadsCount: teamLeads,
              activePlayersCount: playersCount,
              publicViewersCount: pubViewers,
              updatedAt: firebase.database.ServerValue.TIMESTAMP
            }).catch(() => {});
          });
        } else {
          // PUBLIC / FRANCHISE / PLAYER: Reads ONLY safe aggregate /publicStats/liveUsers (Section 22 & 51)
          console.log("[RTDB] presence listener attached");
          const publicStatsRef = fbRtdb.ref("publicStats/liveUsers");
          this.unsubPublicStats = publicStatsRef;
          publicStatsRef.on("value", (snap) => {
            const data = snap.val();
            if (data && typeof data.count === "number") {
              if (data.activeFranchisesCount !== undefined) {
                RealtimeStore.state.presence.activeFranchises = data.activeFranchisesCount;
              }
              updateLiveUsersCount(data.count);
            } else {
              updateLiveUsersCount(1);
            }
          });
        }
      },

      switchPresenceIdentity(newUser) {
        if (myPresenceRef) {
          myPresenceRef.remove().catch(() => {});
        }
        this.registerPresenceRecord();
        this.subscribePresenceSystem();
      }
    };

    function initFirebaseSync() {
      showLoadingOverlay("LOADING LATEST AUCTION STATE...", "Synchronizing authoritative cloud state");

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

      // Heartbeat interval every 25 seconds (Section 28)
      setInterval(() => {
        if (myPresenceRef && RealtimeStore.state.connection.status === "CONNECTED") {
          myPresenceRef.update({
            lastHeartbeat: firebase.database.ServerValue.TIMESTAMP,
            page: currentView
          }).catch(() => {});
        }
      }, 25000);

      // Start Realtime Manager
      window.RealtimeManager.init();
    }

    function broadcastAuthoritativeState() {
      const sOffset = (window.RealtimeStore && window.RealtimeStore.state.connection.serverTimeOffset) || 0;
      const currentLotObj = players[lotIndex] || null;

      const payload = {
        lotIndex,
        currentBid,
        leadingBidderId,
        timerSeconds,
        timerDeadline: timerDeadline || ((Date.now() + sOffset) + (timerSeconds * 1000)),
        timerRunning,
        auctionPaused,
        passedFranchiseIds,
        franchises,
        players,
        auditLog,
        currentLot: currentLotObj,
        lotVersion: ((window.RealtimeStore && window.RealtimeStore.state.auction.lotVersion) || 1) + 1,
        timestamp: Date.now() + sOffset
      };

      saveDatabase();

      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage({ type: "AUCTION_STATE_UPDATE", payload });
        } catch (e) {}
      }

      if (auctionDocRef) {
        auctionDocRef.set(payload, { merge: true }).catch(err => console.error("Firestore sync error:", err));
      }
    }

    function applyAuthoritativeAuctionState(data, broadcast = false) {
      if (!data) return;

      lotIndex = typeof data.lotIndex === "number" ? data.lotIndex : lotIndex;
      currentBid = typeof data.currentBid === "number" ? data.currentBid : currentBid;
      leadingBidderId = data.leadingBidderId !== undefined ? data.leadingBidderId : leadingBidderId;
      auctionPaused = !!data.auctionPaused;
      passedFranchiseIds = Array.isArray(data.passedFranchiseIds) ? data.passedFranchiseIds : passedFranchiseIds;

      const sOffset = (window.RealtimeStore && window.RealtimeStore.state.connection.serverTimeOffset) || 0;
      const serverNow = Date.now() + sOffset;

      // Server-authoritative timer deadline calculation (Section 35)
      if (data.timerDeadline) {
        timerDeadline = data.timerDeadline;
        if (data.timerRunning && !data.auctionPaused) {
          const remaining = Math.max(0, Math.ceil((timerDeadline - serverNow) / 1000));
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

      if (window.RealtimeStore) {
        window.RealtimeStore.state.auction = {
          lotIndex,
          currentBid,
          leadingBidderId,
          timerSeconds,
          timerDeadline,
          timerRunning,
          auctionPaused,
          passedFranchiseIds,
          lotVersion: data.lotVersion || 1
        };
        window.RealtimeStore.state.currentLot = players[lotIndex] || null;
        window.RealtimeStore.state.players = players;
        window.RealtimeStore.state.franchise = franchises;
      }

      renderConnectionBadge("LIVE");
      updateTimerDisplay();
      renderHeaderNav();
      renderCurrentView();
    }

    // SECTION 52: DEBUG PANEL (/debug/realtime)
    function renderDebugRealtimeView() {
      const isAuthConnected = currentUser && currentUser.role !== 'SPECTATOR';
      const isFirestoreConnected = !!fbDb && !!auctionDocRef;
      const isRtdbConnected = window.RealtimeStore && window.RealtimeStore.state.connection.status === 'CONNECTED';
      const isPresenceOnline = !!myPresenceRef && isRtdbConnected;
      const liveU = (window.RealtimeStore && window.RealtimeStore.state.presence.liveUsers) || liveUsersCount;
      const liveC = (window.RealtimeStore && window.RealtimeStore.state.presence.liveConnections) || 1;

      return `
        <div class="surface-card" style="padding: var(--space-6); max-width: 640px; margin: 40px auto; font-family: var(--font-mono);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: var(--text-bright); margin: 0;">REALTIME SYSTEM DIAGNOSTIC PANEL</h2>
            <span class="status-badge status-connected" style="font-size: 0.65rem;">INTERNAL DEBUG</span>
          </div>
          <div style="display: grid; gap: 14px; font-size: 0.875rem;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
              <span>Firebase Auth:</span>
              <span style="font-weight: 700; color: ${isAuthConnected ? 'var(--color-green)' : 'var(--color-blue)'};">${isAuthConnected ? 'CONNECTED' : 'ANONYMOUS / GUEST'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
              <span>Firestore:</span>
              <span style="font-weight: 700; color: ${isFirestoreConnected ? 'var(--color-green)' : 'var(--color-red)'};">${isFirestoreConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
              <span>RTDB:</span>
              <span style="font-weight: 700; color: ${isRtdbConnected ? 'var(--color-green)' : 'var(--color-red)'};">${isRtdbConnected ? 'CONNECTED' : 'OFFLINE'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
              <span>Presence:</span>
              <span style="font-weight: 700; color: ${isPresenceOnline ? 'var(--color-green)' : 'var(--color-red)'};">${isPresenceOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
              <span>Connection ID:</span>
              <span style="color: var(--text-muted); font-size: 0.75rem;">${myConnId || 'internal only'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
              <span>Live Users:</span>
              <span style="font-weight: 800; color: var(--color-green);">${liveU}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
              <span>Live Connections:</span>
              <span style="font-weight: 800; color: var(--color-blue);">${liveC}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
              <span>Auction Listener:</span>
              <span style="font-weight: 700; color: var(--color-green);">${auctionDocRef ? 'ACTIVE' : 'INACTIVE'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
              <span>Public Listener:</span>
              <span style="font-weight: 700; color: var(--color-green);">ACTIVE</span>
            </div>
          </div>
          <div style="margin-top: 24px; text-align: center;">
            <button class="btn btn-secondary" onclick="switchView('public')">RETURN TO PORTAL</button>
          </div>
        </div>
      `;
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
      else if (currentView === "debug/realtime" || currentView === "debug-realtime") main.innerHTML = renderDebugRealtimeView();
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
      // SECTION 5 & 41: PAGE LOAD FLOW & REFRESH AUTH RESTORATION
      const savedUserStr = localStorage.getItem("acc_current_user_2026");
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          if (parsed && parsed.role) {
            currentUser = parsed;
            if (window.RealtimeStore) {
              window.RealtimeStore.state.auth.user = parsed;
              window.RealtimeStore.state.auth.role = parsed.role;
              window.RealtimeStore.state.auth.franchiseId = parsed.franchiseId || null;
              window.RealtimeStore.state.auth.playerId = parsed.playerId || null;
              window.RealtimeStore.state.auth.identityType = parsed.identityType || 'PUBLIC';
            }
          }
        } catch(e) {}
      }

      const hash = window.location.hash.replace("#", "");
      if (hash && ["public", "live", "franchise", "teams", "register", "player", "admin", "projector", "login", "debug/realtime", "debug-realtime"].includes(hash)) {
        currentView = hash;
      } else if (currentUser && currentUser.role) {
        if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') currentView = 'admin';
        else if (currentUser.role === 'FRANCHISE') currentView = 'franchise';
        else if (currentUser.role === 'PLAYER') currentView = 'player';
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
  
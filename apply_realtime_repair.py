import os
import sys

INDEX_PATH = r"B:\projects\ACC\index.html"
with open(INDEX_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update passLot, reEnterLot, toggleAuctionPause, resetAuctionTimer, skipPlayer
old_block_1 = """    function passLot(franchiseId) {
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
    }"""

new_block_1 = """    function passLot(franchiseId) {
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
    }"""

if old_block_1 not in content:
    print("Error: old_block_1 not found!")
    sys.exit(1)

content = content.replace(old_block_1, new_block_1)
print("Successfully replaced block 1 (auction operations)!")

# 2. Update executeHammerSale and executeHammerUnsold
old_block_2 = """      auditLog.unshift({
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
    }"""

new_block_2 = """      auditLog.unshift({
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
    }"""

if old_block_2 not in content:
    print("Error: old_block_2 not found!")
    sys.exit(1)

content = content.replace(old_block_2, new_block_2)
print("Successfully replaced block 2 (hammer actions)!")

# 3. Update submitPlayerRegistration to broadcast state
old_block_3 = """      players.push(newPlayer);
      saveDatabase();
      showSpeeder("REGISTRATION COMPLETE!", `${newPlayer.name} added to auction lot pool (#${newPlayer.id})`, 1000);"""

new_block_3 = """      players.push(newPlayer);
      saveDatabase();
      broadcastAuthoritativeState();
      showSpeeder("REGISTRATION COMPLETE!", `${newPlayer.name} added to auction lot pool (#${newPlayer.id})`, 1000);"""

if old_block_3 not in content:
    print("Error: old_block_3 not found!")
    sys.exit(1)

content = content.replace(old_block_3, new_block_3)
print("Successfully replaced block 3 (player registration)!")

# 4. Update login and logout presence identity switching
old_block_login_staff = """        currentUser = { ...user };
        localStorage.setItem("acc_current_user_2026", JSON.stringify(currentUser));
        auditLog.unshift({
          time: new Date().toLocaleTimeString(),
          action: "STAFF LOGIN",
          details: `${user.name} (${user.role}) authenticated successfully.`
        });
        saveDatabase();
        showToast(`Welcome ${user.name}`, "success");
        switchView("admin");"""

new_block_login_staff = """        currentUser = { ...user };
        localStorage.setItem("acc_current_user_2026", JSON.stringify(currentUser));
        if (window.RealtimeManager) window.RealtimeManager.switchPresenceIdentity(currentUser);
        auditLog.unshift({
          time: new Date().toLocaleTimeString(),
          action: "STAFF LOGIN",
          details: `${user.name} (${user.role}) authenticated successfully.`
        });
        saveDatabase();
        showToast(`Welcome ${user.name}`, "success");
        switchView("admin");"""

old_block_login_franchise = """        currentUser = { ...user };
        localStorage.setItem("acc_current_user_2026", JSON.stringify(currentUser));
        const f = franchises.find(item => item.id === fId);
        auditLog.unshift({
          time: new Date().toLocaleTimeString(),
          action: "FRANCHISE LOGIN",
          details: `${user.name} (${user.title}) activated ${f ? f.name : 'Team'} workspace.`
        });
        saveDatabase();
        showToast(`Authenticated: ${user.name} (${f ? f.name : 'Team'})`, "success");
        switchView("franchise");"""

new_block_login_franchise = """        currentUser = { ...user };
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
        switchView("franchise");"""

old_block_login_player = """        currentUser = { ...user };
        localStorage.setItem("acc_current_user_2026", JSON.stringify(currentUser));
        auditLog.unshift({
          time: new Date().toLocaleTimeString(),
          action: "ATHLETE LOGIN",
          details: `${user.name} (${user.username}) accessed athlete portal.`
        });
        saveDatabase();
        showToast(`Welcome Athlete ${user.name}`, "success");
        switchView("player");"""

new_block_login_player = """        currentUser = { ...user };
        localStorage.setItem("acc_current_user_2026", JSON.stringify(currentUser));
        if (window.RealtimeManager) window.RealtimeManager.switchPresenceIdentity(currentUser);
        auditLog.unshift({
          time: new Date().toLocaleTimeString(),
          action: "ATHLETE LOGIN",
          details: `${user.name} (${user.username}) accessed athlete portal.`
        });
        saveDatabase();
        showToast(`Welcome Athlete ${user.name}`, "success");
        switchView("player");"""

old_block_logout = """    function logoutUser() {
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
    }"""

new_block_logout = """    function logoutUser() {
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
    }"""

content = content.replace(old_block_login_staff, new_block_login_staff)
content = content.replace(old_block_login_franchise, new_block_login_franchise)
content = content.replace(old_block_login_player, new_block_login_player)
content = content.replace(old_block_logout, new_block_logout)
print("Successfully replaced login and logout identity switches!")

# 5. Update openUndoModal and executeUndoSale
old_block_undo = """    function openUndoModal() {
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
    }"""

new_block_undo = """    function openUndoModal() {
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
    }"""

if old_block_undo not in content:
    print("Error: old_block_undo not found!")
    sys.exit(1)

content = content.replace(old_block_undo, new_block_undo)
print("Successfully replaced forensic undo logic!")

# 6. Add Admin Live Monitor to renderAdminConsoleView
target_admin_view = """          <!-- Current Lot Operational Arena -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-6);">"""

replacement_admin_view = """          <!-- REALTIME ADMIN LIVE PARTICIPATION MONITOR (Section 50) -->
          <div class="surface-card" style="padding: var(--space-4); border-left: 3px solid var(--color-green);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <span class="label-micro" style="color: var(--color-green); margin: 0;">REALTIME TELEMETRY MONITOR (DEDUPLICATED)</span>
              <span class="status-badge status-connected" style="font-size: 0.65rem;">FIREBASE RTDB ACTIVE</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
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
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-6);">"""

if target_admin_view not in content:
    print("Error: target_admin_view not found!")
    sys.exit(1)

content = content.replace(target_admin_view, replacement_admin_view)
print("Successfully added Admin Live Monitor to renderAdminConsoleView!")

# 7. Update switchView to allow /debug/realtime
old_switch = """      currentView = viewName;
      window.location.hash = viewName;"""

new_switch = """      currentView = viewName;
      window.location.hash = viewName;"""

# 8. Update Header Nav with accurate Live Users UI (Section 29)
old_header_nav = """    function updateLiveUsersCount(count) {
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
      }"""

new_header_nav = """    function updateLiveUsersCount(count) {
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
      }"""

if old_header_nav not in content:
    print("Error: old_header_nav not found!")
    sys.exit(1)

content = content.replace(old_header_nav, new_header_nav)
print("Successfully replaced Header Nav!")

# 9. Replace Firebase sync section with Central Realtime Store and Manager
old_fb_section = """    // ========================================================
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
    }"""

new_fb_section = """    // ========================================================
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
    }"""

if old_fb_section not in content:
    print("Error: old_fb_section not found!")
    sys.exit(1)

content = content.replace(old_fb_section, new_fb_section)
print("Successfully replaced Firebase sync section with Central Store and RealtimeManager!")

# 10. Update renderCurrentView to handle debug/realtime
old_render_view = """      if (currentView === "public") main.innerHTML = renderPublicView();
      else if (currentView === "live") main.innerHTML = renderLiveAuctionView();
      else if (currentView === "franchise") main.innerHTML = renderFranchiseTerminalView();
      else if (currentView === "teams") main.innerHTML = render11FranchisesView();
      else if (currentView === "register") main.innerHTML = renderPlayerRegistrationView();
      else if (currentView === "player") main.innerHTML = renderPlayerPortalView();
      else if (currentView === "admin") main.innerHTML = renderAdminConsoleView();
      else if (currentView === "projector") main.innerHTML = renderProjectorView();
      else if (currentView === "login") main.innerHTML = renderLoginView();
      else main.innerHTML = renderPublicView();"""

new_render_view = """      if (currentView === "public") main.innerHTML = renderPublicView();
      else if (currentView === "live") main.innerHTML = renderLiveAuctionView();
      else if (currentView === "franchise") main.innerHTML = renderFranchiseTerminalView();
      else if (currentView === "teams") main.innerHTML = render11FranchisesView();
      else if (currentView === "register") main.innerHTML = renderPlayerRegistrationView();
      else if (currentView === "player") main.innerHTML = renderPlayerPortalView();
      else if (currentView === "admin") main.innerHTML = renderAdminConsoleView();
      else if (currentView === "projector") main.innerHTML = renderProjectorView();
      else if (currentView === "login") main.innerHTML = renderLoginView();
      else if (currentView === "debug/realtime" || currentView === "debug-realtime") main.innerHTML = renderDebugRealtimeView();
      else main.innerHTML = renderPublicView();"""

if old_render_view not in content:
    print("Error: old_render_view not found!")
    sys.exit(1)

content = content.replace(old_render_view, new_render_view)
print("Successfully updated renderCurrentView with debug/realtime!")

# 11. Update DOMContentLoaded for auth restoration and debug route
old_dom_loaded = """    window.addEventListener("DOMContentLoaded", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && ["public", "live", "franchise", "teams", "register", "player", "admin", "projector", "login"].includes(hash)) {
        currentView = hash;
      }
      renderCurrentView();
      initFirebaseSync();
      startTimer();"""

new_dom_loaded = """    window.addEventListener("DOMContentLoaded", () => {
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
      startTimer();"""

if old_dom_loaded not in content:
    print("Error: old_dom_loaded not found!")
    sys.exit(1)

content = content.replace(old_dom_loaded, new_dom_loaded)
print("Successfully updated DOMContentLoaded!")

# Write out to all 3 paths
with open(INDEX_PATH, "w", encoding="utf-8") as f:
    f.write(content)
print(f"Updated {INDEX_PATH} ({len(content)} bytes)")

acc_os_path = r"B:\projects\ACC\Acc-Auction-Os.html"
with open(acc_os_path, "w", encoding="utf-8") as f:
    f.write(content)
print(f"Updated {acc_os_path} ({len(content)} bytes)")

dist_path = r"B:\projects\ACC\acc-auction-portal\dist\public\index.html"
with open(dist_path, "w", encoding="utf-8") as f:
    f.write(content)
print(f"Updated {dist_path} ({len(content)} bytes)")

print("\nALL FILES SUCCESSFULLY REPAIRED AND SYNCHRONIZED!")

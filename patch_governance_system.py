import re

with open("B:/projects/ACC/index.html", "r", encoding="utf-8") as f:
    content = f.read()

print("Initial content length:", len(content))

# -------------------------------------------------------------
# 1. ADD DEFAULT FRANCHISE MEMBERS AND HELPER DATA
# -------------------------------------------------------------
governance_data_structures = """
    // ========================================================
    // ACC 2026 — FRANCHISE MEMBERS & CREDENTIAL GOVERNANCE STORE
    // ========================================================
    const DEFAULT_FRANCHISE_MEMBERS = [
      { id: "mem_1_coord", franchiseId: 1, role: "COORDINATOR", name: "Dr. S. K. Rao", department: "ECE", mobile: "9876500001", email: "titans.coord@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_1_capt", franchiseId: 1, role: "CAPTAIN", name: "K. Rahul", department: "CSE", mobile: "9876500002", email: "titans.capt@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_2_coord", franchiseId: 2, role: "COORDINATOR", name: "Prof. P. V. Sharma", department: "CSE", mobile: "9876500003", email: "warriors.coord@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_2_capt", franchiseId: 2, role: "CAPTAIN", name: "M. Rohit", department: "ECE", mobile: "9876500004", email: "warriors.capt@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_3_coord", franchiseId: 3, role: "COORDINATOR", name: "Dr. G. Srinivas", department: "MECH", mobile: "9876500005", email: "strikers.coord@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_3_capt", franchiseId: 3, role: "CAPTAIN", name: "V. Surya", department: "EEE", mobile: "9876500006", email: "strikers.capt@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_4_coord", franchiseId: 4, role: "COORDINATOR", name: "Prof. K. Ramesh", department: "EEE", mobile: "9876500007", email: "blasters.coord@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_4_capt", franchiseId: 4, role: "CAPTAIN", name: "T. Varun", department: "MECH", mobile: "9876500008", email: "blasters.capt@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_5_coord", franchiseId: 5, role: "COORDINATOR", name: "Dr. N. Anand", department: "CSD", mobile: "9876500009", email: "superkings.coord@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_5_capt", franchiseId: 5, role: "CAPTAIN", name: "R. Deepak", department: "CSD", mobile: "9876500010", email: "superkings.capt@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_6_coord", franchiseId: 6, role: "COORDINATOR", name: "Prof. M. Prasad", department: "CSM", mobile: "9876500011", email: "royals.coord@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_6_capt", franchiseId: 6, role: "CAPTAIN", name: "J. Yash", department: "CSM", mobile: "9876500012", email: "royals.capt@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_7_coord", franchiseId: 7, role: "COORDINATOR", name: "Dr. B. Suresh", department: "Civil", mobile: "9876500013", email: "challengers.coord@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_7_capt", franchiseId: 7, role: "CAPTAIN", name: "A. Karthik", department: "Civil", mobile: "9876500014", email: "challengers.capt@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_8_coord", franchiseId: 8, role: "COORDINATOR", name: "Prof. V. Krishna", department: "IT", mobile: "9876500015", email: "knights.coord@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_8_capt", franchiseId: 8, role: "CAPTAIN", name: "P. Manish", department: "IT", mobile: "9876500016", email: "knights.capt@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_9_coord", franchiseId: 9, role: "COORDINATOR", name: "Dr. T. Naidu", department: "MBA", mobile: "9876500017", email: "indians.coord@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_9_capt", franchiseId: 9, role: "CAPTAIN", name: "D. Harish", department: "MBA", mobile: "9876500018", email: "indians.capt@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_10_coord", franchiseId: 10, role: "COORDINATOR", name: "Prof. H. Venkat", department: "MCA", mobile: "9876500019", email: "capitals.coord@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_10_capt", franchiseId: 10, role: "CAPTAIN", name: "B. Sai", department: "MCA", mobile: "9876500020", email: "capitals.capt@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_11_coord", franchiseId: 11, role: "COORDINATOR", name: "Dr. R. Verma", department: "ECE", mobile: "9876500021", email: "sunrisers.coord@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true },
      { id: "mem_11_capt", franchiseId: 11, role: "CAPTAIN", name: "N. Tarun", department: "ECE", mobile: "9876500022", email: "sunrisers.capt@acc.edu", approvalStatus: "APPROVED", accountStatus: "ACTIVE", mustChangePassword: true }
    ];

    let franchiseMembers = JSON.parse(localStorage.getItem("acc_franchise_members_2026")) || DEFAULT_FRANCHISE_MEMBERS;
    window.franchiseMembers = franchiseMembers;

    // Helper functions for initial credential generation
    function generatePlayerInitialPassword(playerName) {
      const cleanName = (playerName || 'Player').replace(/[^a-zA-Z0-9]/g, '');
      return `${cleanName}@ACC2026`;
    }

    function generateFranchiseInitialPassword(franchiseName, teamNum) {
      const cleanName = (franchiseName || 'Franchise').replace(/[^a-zA-Z0-9]/g, '');
      const numStr = String(teamNum).padStart(2, '0');
      return `${cleanName}@ACC${numStr}`;
    }
"""

if "DEFAULT_FRANCHISE_MEMBERS" not in content:
    content = content.replace("let franchises = JSON.parse(localStorage.getItem(\"acc_franchises_2026\"))", governance_data_structures + "\n    let franchises = JSON.parse(localStorage.getItem(\"acc_franchises_2026\"))")
    print("Injected DEFAULT_FRANCHISE_MEMBERS and credential generators")

# Ensure existing franchise objects have franchiseId, approvalStatus, and status
content = content.replace(
    'let franchises = JSON.parse(localStorage.getItem("acc_franchises_2026")) || DEFAULT_FRANCHISES;',
    '''let franchises = JSON.parse(localStorage.getItem("acc_franchises_2026")) || DEFAULT_FRANCHISES;
    // Normalize franchise metadata
    franchises.forEach((f, idx) => {
      if (!f.franchiseId) f.franchiseId = 'FR' + String(f.id || (idx + 1)).padStart(3, '0');
      if (!f.approvalStatus) f.approvalStatus = 'APPROVED';
      if (!f.status) f.status = 'ACTIVE';
    });'''
)

# -------------------------------------------------------------
# 2. UPDATE NAV TABS IN RENDER ADMIN CONSOLE VIEW
# -------------------------------------------------------------
old_tabs = "const navTabs = ['OVERVIEW', 'TEAMS', 'PLAYERS', 'PLAYER VERIFICATION', 'REGISTRATIONS', 'AUCTION', 'ROUND 2', 'UNDO', 'AUDIT', 'EXPORT', 'SETTINGS', 'ADMIN ACCOUNTS'];"
new_tabs = "const navTabs = ['OVERVIEW', 'TEAMS', 'PLAYERS', 'PLAYER VERIFICATION', 'REGISTRATIONS', 'FRANCHISES', 'FRANCHISE MEMBERS', 'ADMIN ACCOUNTS', 'AUCTION', 'ROUND 2', 'UNDO', 'AUDIT', 'EXPORT', 'SETTINGS', 'DATA INTEGRITY'];"

if old_tabs in content:
    content = content.replace(old_tabs, new_tabs)
    print("Updated navTabs to include FRANCHISES, FRANCHISE MEMBERS, and DATA INTEGRITY")
else:
    print("Warning: old navTabs pattern not found directly, checking regex")
    content = re.sub(r"const navTabs = \['OVERVIEW'.*?\];", new_tabs, content)

# -------------------------------------------------------------
# 3. ADD GOVERNANCE ACTIONS AND MODALS
# -------------------------------------------------------------
governance_functions = """
    // ========================================================
    // ADMIN GOVERNANCE: CREDENTIAL DISPLAY & DELIVERY (ADMIN-ONLY)
    // ========================================================
    function openPlayerCredentialModal(playerId) {
      const p = players.find(x => x.id == playerId || x.playerId == playerId || x.roll == playerId);
      if (!p) { showToast("Player record not found", "error"); return; }
      
      const initPass = generatePlayerInitialPassword(p.name);
      const loginIdentifier = p.email || p.roll || (p.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@acc.edu');
      const m = document.getElementById("modalContainer");
      m.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6); max-width: 520px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="status-badge status-connected">ADMIN ONLY</span>
                <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; margin: 0; color: var(--text-bright);">ACCOUNT CREATED</h3>
              </div>
              <button class="btn btn-secondary" style="padding: 4px 8px; min-height: 28px;" onclick="closeModal()">✕</button>
            </div>

            <div style="background: var(--surface-2); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 16px;">
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">PLAYER</div>
              <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-bright); margin-bottom: 8px;">${p.name} (${p.roll})</div>
              
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">LOGIN IDENTIFIER / USERNAME</div>
              <div class="font-mono" style="font-size: 0.9375rem; color: var(--color-green); font-weight: 700; margin-bottom: 8px;">${loginIdentifier}</div>

              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">INITIAL ONE-TIME PASSWORD</div>
              <div class="font-mono" style="font-size: 1.15rem; color: var(--color-orange); font-weight: 800; background: rgba(255, 153, 0, 0.1); padding: 6px 10px; border-radius: 4px; display: inline-block; margin-top: 4px;">
                ${initPass}
              </div>
            </div>

            <div style="background: rgba(239, 68, 68, 0.08); border-left: 3px solid var(--color-red); padding: 8px 12px; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 18px;">
              <strong>SECURITY POLICY:</strong> This initial password is temporary. Player must change password upon first login. Plaintext passwords are NEVER stored in Firestore or logs.
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button class="btn btn-secondary" onclick="navigator.clipboard.writeText('Player: ${p.name}\\nLogin: ${loginIdentifier}\\nPassword: ${initPass}'); showToast('Credentials copied to clipboard!', 'success');">
                COPY CREDENTIALS
              </button>
              <button class="btn btn-primary" onclick="markCredentialsDelivered('player', '${p.id}'); closeModal();">
                MARK CREDENTIALS DELIVERED
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function openFranchiseCredentialModal(franchiseId) {
      const f = franchises.find(x => x.id == franchiseId || x.franchiseId == franchiseId);
      if (!f) { showToast("Franchise record not found", "error"); return; }
      
      const num = f.id || 1;
      const initPass = generateFranchiseInitialPassword(f.name, num);
      const loginIdentifier = f.coordinatorEmail || f.coordinatorMobile || (f.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@franchise.acc.edu');
      const m = document.getElementById("modalContainer");
      m.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6); max-width: 520px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="status-badge status-connected">ADMIN ONLY</span>
                <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; margin: 0; color: var(--text-bright);">FRANCHISE ACCOUNT CREATED</h3>
              </div>
              <button class="btn btn-secondary" style="padding: 4px 8px; min-height: 28px;" onclick="closeModal()">✕</button>
            </div>

            <div style="background: var(--surface-2); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 16px;">
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">TEAM</div>
              <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-bright); margin-bottom: 8px;">${f.name}</div>
              
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">FRANCHISE IDENTIFIER</div>
              <div class="font-mono" style="font-size: 0.9375rem; color: var(--color-green); font-weight: 700; margin-bottom: 8px;">${f.franchiseId || 'FR' + String(num).padStart(3, '0')} (Slot #${String(num).padStart(2, '0')})</div>

              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">PRIMARY COORDINATOR LOGIN</div>
              <div class="font-mono" style="font-size: 0.9375rem; color: var(--color-green); font-weight: 700; margin-bottom: 8px;">${loginIdentifier}</div>

              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">INITIAL PASSWORD</div>
              <div class="font-mono" style="font-size: 1.15rem; color: var(--color-orange); font-weight: 800; background: rgba(255, 153, 0, 0.1); padding: 6px 10px; border-radius: 4px; display: inline-block; margin-top: 4px;">
                ${initPass}
              </div>
            </div>

            <div style="background: rgba(239, 68, 68, 0.08); border-left: 3px solid var(--color-red); padding: 8px 12px; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 18px;">
              <strong>SECURITY POLICY:</strong> This initial password is temporary. Franchise coordinator must change password upon first login.
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button class="btn btn-secondary" onclick="navigator.clipboard.writeText('Franchise: ${f.name}\\nLogin: ${loginIdentifier}\\nPassword: ${initPass}'); showToast('Franchise credentials copied!', 'success');">
                COPY CREDENTIALS
              </button>
              <button class="btn btn-primary" onclick="markCredentialsDelivered('franchise', '${f.id}'); closeModal();">
                MARK CREDENTIALS DELIVERED
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function markCredentialsDelivered(type, id) {
      if (type === 'player') {
        const p = players.find(x => x.id == id || x.playerId == id);
        if (p) {
          p.credentialsDelivered = true;
          p.accountStatus = 'ACTIVE';
          auditLog.unshift({
            time: new Date().toLocaleTimeString(),
            action: "CREDENTIAL_DELIVERED",
            actorUid: currentUser.uid || 'usr_superadmin',
            role: currentUser.role,
            targetId: p.roll || String(p.id),
            timestamp: new Date().toISOString(),
            details: `Credentials delivered to player ${p.name} (${p.roll})`
          });
          saveDatabase();
          broadcastAuthoritativeState();
          showToast(`Credentials marked delivered for ${p.name}`, "success");
          renderCurrentView();
        }
      } else if (type === 'franchise') {
        const f = franchises.find(x => x.id == id || x.franchiseId == id);
        if (f) {
          f.credentialsDelivered = true;
          f.status = 'ACTIVE';
          f.approvalStatus = 'APPROVED';
          auditLog.unshift({
            time: new Date().toLocaleTimeString(),
            action: "CREDENTIAL_DELIVERED",
            actorUid: currentUser.uid || 'usr_superadmin',
            role: currentUser.role,
            targetId: f.franchiseId || f.name,
            timestamp: new Date().toISOString(),
            details: `Credentials delivered to franchise ${f.name}`
          });
          saveDatabase();
          broadcastAuthoritativeState();
          showToast(`Credentials marked delivered for ${f.name}`, "success");
          renderCurrentView();
        }
      }
    }

    // ========================================================
    // PLAYER GOVERNANCE: APPROVE, BLOCK, UNBLOCK, ARCHIVE
    // ========================================================
    function adminApprovePlayerGovernance(playerId) {
      const p = players.find(x => x.id == playerId || x.playerId == playerId);
      if (!p) return;
      p.approvalStatus = 'APPROVED';
      p.verificationStatus = 'VERIFIED';
      p.accountStatus = 'ACTIVE';
      p.status = 'AVAILABLE';
      p.auctionEligible = true;
      delete p.correctionNote;

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "PLAYER_APPROVED",
        actorUid: currentUser.uid || 'usr_superadmin',
        role: currentUser.role,
        targetId: p.roll || String(p.id),
        timestamp: new Date().toISOString(),
        beforeStatus: "PENDING_APPROVAL",
        afterStatus: "APPROVED",
        details: `${p.name} (${p.roll}) officially approved by Super Admin. Status: ACTIVE.`
      });

      saveDatabase();
      broadcastAuthoritativeState();
      showToast(`Player ${p.name} APPROVED and ACTIVE!`, "success");
      renderCurrentView();
    }

    function adminBlockPlayerGovernance(playerId) {
      const p = players.find(x => x.id == playerId || x.playerId == playerId);
      if (!p) return;
      if (!confirm(`Are you sure you want to BLOCK player ${p.name} (${p.roll}) from the tournament?`)) return;
      const prevStatus = p.approvalStatus || 'APPROVED';
      p.approvalStatus = 'BLOCKED';
      p.verificationStatus = 'BLOCKED';
      p.accountStatus = 'DISABLED';
      p.status = 'BLOCKED';
      p.auctionEligible = false;

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "PLAYER_BLOCKED",
        actorUid: currentUser.uid || 'usr_superadmin',
        role: currentUser.role,
        targetId: p.roll || String(p.id),
        timestamp: new Date().toISOString(),
        beforeStatus: prevStatus,
        afterStatus: "BLOCKED",
        details: `${p.name} (${p.roll}) blocked by ${currentUser.name}`
      });

      saveDatabase();
      broadcastAuthoritativeState();
      showToast(`Player ${p.name} BLOCKED`, "error");
      renderCurrentView();
    }

    function adminUnblockPlayerGovernance(playerId) {
      const p = players.find(x => x.id == playerId || x.playerId == playerId);
      if (!p) return;
      p.approvalStatus = 'APPROVED';
      p.verificationStatus = 'VERIFIED';
      p.accountStatus = 'ACTIVE';
      p.status = 'AVAILABLE';
      p.auctionEligible = true;

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "PLAYER_APPROVED",
        actorUid: currentUser.uid || 'usr_superadmin',
        role: currentUser.role,
        targetId: p.roll || String(p.id),
        timestamp: new Date().toISOString(),
        beforeStatus: "BLOCKED",
        afterStatus: "APPROVED",
        details: `${p.name} (${p.roll}) unblocked and restored to active pool`
      });

      saveDatabase();
      broadcastAuthoritativeState();
      showToast(`Player ${p.name} UNBLOCKED and restored to active pool`, "success");
      renderCurrentView();
    }

    function adminArchivePlayerGovernance(playerId) {
      const p = players.find(x => x.id == playerId || x.playerId == playerId);
      if (!p) return;
      if (!confirm(`Are you sure you want to ARCHIVE player ${p.name} (${p.roll})? Historical auction records will be preserved.`)) return;
      p.approvalStatus = 'ARCHIVED';
      p.accountStatus = 'ARCHIVED';
      p.status = 'ARCHIVED';
      p.auctionEligible = false;

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "PLAYER_ARCHIVED",
        actorUid: currentUser.uid || 'usr_superadmin',
        role: currentUser.role,
        targetId: p.roll || String(p.id),
        timestamp: new Date().toISOString(),
        details: `${p.name} (${p.roll}) archived. Historical records retained.`
      });

      saveDatabase();
      broadcastAuthoritativeState();
      showToast(`Player ${p.name} archived safely`, "info");
      renderCurrentView();
    }

    // ========================================================
    // FRANCHISE GOVERNANCE: CREATE, APPROVE, DISABLE, ARCHIVE
    // ========================================================
    function openCreateFranchiseModal() {
      const nextId = franchises.length + 1;
      const nextFrId = 'FR' + String(nextId).padStart(3, '0');
      const m = document.getElementById("modalContainer");
      m.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6); max-width: 540px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="status-badge status-connected">SUPER ADMIN</span>
                <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; margin: 0; color: var(--text-bright);">CREATE NEW FRANCHISE</h3>
              </div>
              <button class="btn btn-secondary" style="padding: 4px 8px; min-height: 28px;" onclick="closeModal()">✕</button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">FRANCHISE ID (AUTO-ASSIGNED)</label>
                <input type="text" class="form-input" id="newFranchiseId" value="${nextFrId}" readonly style="background: var(--surface-2); font-family: var(--font-mono); color: var(--color-green);">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">FRANCHISE NAME *</label>
                <input type="text" class="form-input" id="newFranchiseName" placeholder="e.g. Challengers, Gladiators" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">SHORT CODE (3 LETTERS) *</label>
                <input type="text" class="form-input" id="newFranchiseShort" placeholder="e.g. CHL" maxlength="4" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">FACULTY COORDINATOR NAME *</label>
                <input type="text" class="form-input" id="newFranchiseCoord" placeholder="Prof. / Dr. Name" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">COORDINATOR DEPARTMENT *</label>
                <input type="text" class="form-input" id="newFranchiseDept" placeholder="e.g. CSE, ECE, MECH" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">COORDINATOR MOBILE NUMBER (10 DIGITS) *</label>
                <input type="text" class="form-input" id="newFranchiseMobile" placeholder="10-digit mobile" maxlength="10" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">COORDINATOR OFFICIAL EMAIL *</label>
                <input type="email" class="form-input" id="newFranchiseEmail" placeholder="coordinator@acc.edu" required>
              </div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
              <button class="btn btn-secondary" onclick="closeModal()">CANCEL</button>
              <button class="btn btn-primary" onclick="saveNewFranchise()">SUBMIT FOR APPROVAL</button>
            </div>
          </div>
        </div>
      `;
    }

    function saveNewFranchise() {
      const name = (document.getElementById("newFranchiseName")?.value || "").trim();
      const short = (document.getElementById("newFranchiseShort")?.value || "").trim().toUpperCase();
      const coord = (document.getElementById("newFranchiseCoord")?.value || "").trim();
      const dept = (document.getElementById("newFranchiseDept")?.value || "").trim();
      const mobile = (document.getElementById("newFranchiseMobile")?.value || "").trim().replace(/\D/g, '');
      const email = (document.getElementById("newFranchiseEmail")?.value || "").trim();

      if (!name || !short || !coord || !dept || mobile.length < 10) {
        showToast("All fields are mandatory. Please provide a valid 10-digit mobile number.", "error");
        return;
      }

      // Check unique franchise name
      if (franchises.some(f => f.name.toLowerCase() === name.toLowerCase())) {
        showToast(`Franchise name "${name}" already exists!`, "error");
        return;
      }

      const nextId = franchises.length > 0 ? Math.max(...franchises.map(f => f.id || 0)) + 1 : 1;
      const frId = 'FR' + String(nextId).padStart(3, '0');

      const newF = {
        id: nextId,
        franchiseId: frId,
        name: name,
        short: short,
        purse: 1000,
        squad: [],
        coordinatorName: coord,
        coordinatorDept: dept,
        coordinatorMobile: mobile,
        coordinatorEmail: email,
        approvalStatus: "PENDING_APPROVAL",
        status: "PENDING_APPROVAL",
        createdAt: new Date().toISOString()
      };

      franchises.push(newF);
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "FRANCHISE_CREATED",
        actorUid: currentUser.uid || 'usr_superadmin',
        role: currentUser.role,
        targetId: frId,
        timestamp: new Date().toISOString(),
        beforeStatus: "NONE",
        afterStatus: "PENDING_APPROVAL",
        details: `Franchise ${name} (${frId}) registered by ${currentUser.name}. Pending Admin Approval.`
      });

      saveDatabase();
      broadcastAuthoritativeState();
      closeModal();
      showToast(`Franchise "${name}" created in PENDING_APPROVAL state.`, "info");
      renderCurrentView();
    }

    function adminApproveFranchise(fId) {
      const f = franchises.find(x => x.id == fId || x.franchiseId == fId);
      if (!f) return;
      f.approvalStatus = 'APPROVED';
      f.status = 'ACTIVE';

      // Seed coordinator account into users if not already present
      const loginId = f.coordinatorEmail || (f.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@franchise.acc.edu');
      let u = users.find(x => x.franchiseId == f.id || x.username === loginId || x.email === loginId);
      if (!u) {
        users.push({
          uid: 'usr_f_' + f.id + '_' + Date.now(),
          username: f.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
          email: loginId,
          role: 'FRANCHISE',
          identityType: 'COORDINATOR',
          franchiseId: f.id,
          name: f.coordinatorName || f.name + ' Coordinator',
          status: 'ACTIVE',
          mustChangePassword: true
        });
      }

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "FRANCHISE_APPROVED",
        actorUid: currentUser.uid || 'usr_superadmin',
        role: currentUser.role,
        targetId: f.franchiseId || f.name,
        timestamp: new Date().toISOString(),
        beforeStatus: "PENDING_APPROVAL",
        afterStatus: "ACTIVE",
        details: `Franchise ${f.name} approved. Activated for auction participation.`
      });

      saveDatabase();
      broadcastAuthoritativeState();
      showToast(`Franchise ${f.name} APPROVED and ACTIVE!`, "success");
      openFranchiseCredentialModal(f.id);
    }

    function adminDisableFranchise(fId) {
      const f = franchises.find(x => x.id == fId || x.franchiseId == fId);
      if (!f) return;
      if (!confirm(`Are you sure you want to DISABLE franchise ${f.name}? They will be blocked from bidding.`)) return;
      f.status = 'DISABLED';
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "FRANCHISE_DISABLED",
        actorUid: currentUser.uid || 'usr_superadmin',
        role: currentUser.role,
        targetId: f.franchiseId || f.name,
        timestamp: new Date().toISOString(),
        details: `Franchise ${f.name} disabled by ${currentUser.name}`
      });
      saveDatabase();
      broadcastAuthoritativeState();
      showToast(`Franchise ${f.name} DISABLED`, "warning");
      renderCurrentView();
    }

    function adminArchiveFranchise(fId) {
      const f = franchises.find(x => x.id == fId || x.franchiseId == fId);
      if (!f) return;
      if (!confirm(`Are you sure you want to ARCHIVE franchise ${f.name}? Complete bidding and squad history will be preserved.`)) return;
      f.status = 'ARCHIVED';
      f.approvalStatus = 'ARCHIVED';
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "FRANCHISE_ARCHIVED",
        actorUid: currentUser.uid || 'usr_superadmin',
        role: currentUser.role,
        targetId: f.franchiseId || f.name,
        timestamp: new Date().toISOString(),
        details: `Franchise ${f.name} archived. Historical auction data preserved.`
      });
      saveDatabase();
      broadcastAuthoritativeState();
      showToast(`Franchise ${f.name} ARCHIVED`, "info");
      renderCurrentView();
    }

    // ========================================================
    // FRANCHISE MEMBERS GOVERNANCE
    // ========================================================
    function openAddMemberModal() {
      const m = document.getElementById("modalContainer");
      m.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6); max-width: 520px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="status-badge status-connected">SUPER ADMIN</span>
                <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; margin: 0; color: var(--text-bright);">ADD FRANCHISE MEMBER</h3>
              </div>
              <button class="btn btn-secondary" style="padding: 4px 8px; min-height: 28px;" onclick="closeModal()">✕</button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">ASSIGN TO FRANCHISE *</label>
                <select class="form-input" id="newMemberFranchiseId">
                  ${franchises.map(f => `<option value="${f.id}">${f.name} (${f.short})</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">ROLE *</label>
                <select class="form-input" id="newMemberRole">
                  <option value="COORDINATOR">Faculty Coordinator</option>
                  <option value="TEAM_LEAD">Team Lead / Manager</option>
                  <option value="CAPTAIN">Team Captain</option>
                  <option value="VICE_CAPTAIN">Vice-Captain</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">MEMBER FULL NAME *</label>
                <input type="text" class="form-input" id="newMemberName" placeholder="Full Name" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">DEPARTMENT *</label>
                <input type="text" class="form-input" id="newMemberDept" placeholder="e.g. CSE, ECE" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">MOBILE NUMBER (10 DIGITS) *</label>
                <input type="text" class="form-input" id="newMemberMobile" placeholder="10-digit mobile" maxlength="10" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">OFFICIAL EMAIL *</label>
                <input type="email" class="form-input" id="newMemberEmail" placeholder="member@acc.edu" required>
              </div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
              <button class="btn btn-secondary" onclick="closeModal()">CANCEL</button>
              <button class="btn btn-primary" onclick="saveNewMember()">SUBMIT FOR APPROVAL</button>
            </div>
          </div>
        </div>
      `;
    }

    function saveNewMember() {
      const fId = parseInt(document.getElementById("newMemberFranchiseId")?.value, 10) || 1;
      const role = document.getElementById("newMemberRole")?.value || "COORDINATOR";
      const name = (document.getElementById("newMemberName")?.value || "").trim();
      const dept = (document.getElementById("newMemberDept")?.value || "").trim();
      const mobile = (document.getElementById("newMemberMobile")?.value || "").trim().replace(/\D/g, '');
      const email = (document.getElementById("newMemberEmail")?.value || "").trim();

      if (!name || !dept || mobile.length < 10) {
        showToast("All fields are mandatory. Please provide a valid 10-digit mobile number.", "error");
        return;
      }

      const f = franchises.find(x => x.id === fId);
      const newMem = {
        id: "mem_" + fId + "_" + Date.now(),
        franchiseId: fId,
        role: role,
        name: name,
        department: dept,
        mobile: mobile,
        email: email,
        approvalStatus: "PENDING_APPROVAL",
        accountStatus: "NOT_CREATED",
        mustChangePassword: true,
        createdAt: new Date().toISOString()
      };

      franchiseMembers.push(newMem);
      localStorage.setItem("acc_franchise_members_2026", JSON.stringify(franchiseMembers));

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "MEMBER_CREATED",
        actorUid: currentUser.uid || 'usr_superadmin',
        role: currentUser.role,
        targetId: newMem.id,
        timestamp: new Date().toISOString(),
        details: `Added ${role} ${name} for ${f ? f.name : 'Franchise #' + fId}. Pending Admin Approval.`
      });

      saveDatabase();
      broadcastAuthoritativeState();
      closeModal();
      showToast(`Member ${name} added in PENDING_APPROVAL status`, "info");
      renderCurrentView();
    }

    function adminApproveMember(mId) {
      const m = franchiseMembers.find(x => x.id === mId);
      if (!m) return;
      m.approvalStatus = 'APPROVED';
      m.accountStatus = 'ACTIVE';

      // Seed into users so member can authenticate
      const u = users.find(x => x.email === m.email || x.mobile === m.mobile);
      if (!u) {
        users.push({
          uid: 'usr_m_' + m.id,
          username: m.email || m.mobile,
          email: m.email,
          role: 'FRANCHISE',
          identityType: m.role,
          franchiseId: m.franchiseId,
          name: m.name,
          status: 'ACTIVE',
          mustChangePassword: true
        });
      }

      localStorage.setItem("acc_franchise_members_2026", JSON.stringify(franchiseMembers));
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "MEMBER_APPROVED",
        actorUid: currentUser.uid || 'usr_superadmin',
        role: currentUser.role,
        targetId: m.id,
        timestamp: new Date().toISOString(),
        details: `${m.role} ${m.name} approved by ${currentUser.name}`
      });

      saveDatabase();
      broadcastAuthoritativeState();
      showToast(`Member ${m.name} APPROVED and ACTIVE!`, "success");
      renderCurrentView();
    }

    function adminRemoveMember(mId) {
      const m = franchiseMembers.find(x => x.id === mId);
      if (!m) return;
      if (!confirm(`Are you sure you want to remove ${m.name} from franchise members?`)) return;
      franchiseMembers = franchiseMembers.filter(x => x.id !== mId);
      window.franchiseMembers = franchiseMembers;
      localStorage.setItem("acc_franchise_members_2026", JSON.stringify(franchiseMembers));

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "MEMBER_REMOVED",
        actorUid: currentUser.uid || 'usr_superadmin',
        role: currentUser.role,
        targetId: m.id,
        timestamp: new Date().toISOString(),
        details: `Member ${m.name} removed from franchise records`
      });

      saveDatabase();
      broadcastAuthoritativeState();
      showToast(`Member ${m.name} removed`, "warning");
      renderCurrentView();
    }

    // ========================================================
    // DATA INTEGRITY & MIGRATION ENGINE (SECTIONS 11 & 41)
    // ========================================================
    let dataIntegrityResults = null;

    function runDataIntegrityScan() {
      const duplicateRolls = [];
      const caseVariantRolls = [];
      const duplicateMobiles = [];
      const orphanedUsers = [];

      const rollMap = {};
      const mobileMap = {};

      players.forEach(p => {
        const rawRoll = (p.roll || '').trim();
        const normRoll = rawRoll.toUpperCase().replace(/\\s+/g, '');
        if (normRoll) {
          if (!rollMap[normRoll]) rollMap[normRoll] = [];
          rollMap[normRoll].push(p);
        }

        const rawMobile = (p.mobile || '').replace(/\\D/g, '');
        if (rawMobile && rawMobile.length >= 10) {
          if (!mobileMap[rawMobile]) mobileMap[rawMobile] = [];
          mobileMap[rawMobile].push(p);
        }
      });

      Object.entries(rollMap).forEach(([norm, list]) => {
        if (list.length > 1) {
          duplicateRolls.push({ roll: norm, count: list.length, players: list });
          const cases = new Set(list.map(p => (p.roll || '').trim()));
          if (cases.size > 1) {
            caseVariantRolls.push({ norm: norm, variants: Array.from(cases) });
          }
        }
      });

      Object.entries(mobileMap).forEach(([mob, list]) => {
        if (list.length > 1) {
          duplicateMobiles.push({ mobile: mob, count: list.length, players: list });
        }
      });

      users.forEach(u => {
        if (u.role === 'PLAYER' && u.playerId) {
          const found = players.some(p => p.roll === u.playerId || p.playerId === u.playerId);
          if (!found) orphanedUsers.push(u);
        }
      });

      dataIntegrityResults = {
        scannedAt: new Date().toLocaleTimeString(),
        duplicateRolls,
        caseVariantRolls,
        duplicateMobiles,
        orphanedUsers,
        totalPlayers: players.length,
        totalFranchises: franchises.length,
        totalUsers: users.length
      };

      showToast("Data Integrity scan complete!", "success");
      renderCurrentView();
    }

    function runMigrateExistingPlayerAccounts() {
      let migratedCount = 0;
      let duplicateMerged = 0;

      players.forEach(p => {
        const norm = (p.roll || '').trim().toUpperCase().replace(/\\s+/g, '');
        p.roll = norm;
        p.rollNumberNormalized = norm;
        p.playerId = norm;
        p.editionId = p.editionId || 'ACC_2026';
        if (!p.approvalStatus) {
          p.approvalStatus = (p.status === 'AVAILABLE' || p.status === 'SOLD' || p.status === 'UNSOLD') ? 'APPROVED' : 'PENDING_APPROVAL';
        }
        if (!p.accountStatus) {
          p.accountStatus = p.approvalStatus === 'APPROVED' ? 'ACTIVE' : 'NOT_CREATED';
        }
        if (p.approvalStatus === 'APPROVED' && p.accountStatus === 'ACTIVE') {
          p.auctionEligible = true;
        }

        // Link with user account
        let u = users.find(x => x.playerId === norm || x.username === norm);
        if (!u && p.approvalStatus === 'APPROVED') {
          users.push({
            uid: 'usr_p_' + norm,
            username: norm,
            email: p.email || norm.toLowerCase() + '@acc.edu',
            role: 'PLAYER',
            identityType: 'PLAYER',
            playerId: norm,
            name: p.name,
            status: 'ACTIVE',
            mustChangePassword: true
          });
          migratedCount++;
        }
      });

      saveDatabase();
      broadcastAuthoritativeState();

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "DATA_MIGRATION_COMPLETED",
        actorUid: currentUser.uid || 'usr_superadmin',
        role: currentUser.role,
        targetId: 'ACC_2026_CANONICAL',
        timestamp: new Date().toISOString(),
        details: `Migrated ${migratedCount} player auth mappings. Canonized all player roll numbers.`
      });

      showToast(`Data migration finished. ${migratedCount} player accounts initialized.`, "success");
      runDataIntegrityScan();
    }
"""

if "function openPlayerCredentialModal" not in content:
    content = content.replace("function detectAndMergeDuplicateRolls() {", governance_functions + "\n    function detectAndMergeDuplicateRolls() {")
    print("Injected governance functions")

with open("B:/projects/ACC/index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Saved phase 1 changes to index.html")

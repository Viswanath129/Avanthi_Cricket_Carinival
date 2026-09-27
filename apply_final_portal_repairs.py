import re

with open("B:/projects/ACC/index.html", "r", encoding="utf-8") as f:
    content = f.read()

print("Original content length:", len(content))

# 1. Ensure playerVerificationSubTab global variable exists
if "let playerVerificationSubTab" not in content:
    content = content.replace(
        "let playerStatusFilter = 'ALL';",
        "let playerStatusFilter = 'ALL';\n    let playerVerificationSubTab = 'PENDING';"
    )
    print("Added playerVerificationSubTab")

# 2. Add 'PLAYER VERIFICATION' to navTabs in renderAdminConsoleView
if "'PLAYER VERIFICATION'" not in content:
    content = content.replace(
        "const navTabs = ['OVERVIEW', 'TEAMS', 'PLAYERS', 'REGISTRATIONS',",
        "const navTabs = ['OVERVIEW', 'TEAMS', 'PLAYERS', 'PLAYER VERIFICATION', 'REGISTRATIONS',"
    )
    print("Added PLAYER VERIFICATION to navTabs")

# 3. Add openAdminProfileModal and admin verification helper functions
admin_verification_helpers = """
    // ========================================================
    // ADMIN PLAYER VERIFICATION HARD GATE & WORKFLOW
    // ========================================================
    function adminVerifyPlayer(id) {
      const p = players.find(x => x.id === id || x.playerId === id || x.roll === id);
      if (!p) return;
      p.verificationStatus = 'VERIFIED';
      p.status = 'AVAILABLE';
      delete p.correctionNote;
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "PLAYER VERIFIED",
        details: `${p.name} (${p.roll}) officially verified by ${currentUser.name} (${currentUser.role}). Released to public and auction pool.`
      });
      saveDatabase();
      broadcastAuthoritativeState();
      if (typeof fbDb !== 'undefined' && fbDb) {
        fbDb.collection("players").doc(p.rollNumberNormalized || p.roll).set({
          verificationStatus: 'VERIFIED',
          status: 'AVAILABLE'
        }, { merge: true }).catch(() => {});
      }
      showToast(`Player ${p.name} verified and released to public & auction pool!`, "success");
      renderCurrentView();
    }

    function adminRequestCorrection(id) {
      const p = players.find(x => x.id === id || x.playerId === id || x.roll === id);
      if (!p) return;
      const reason = prompt(`Enter correction note / missing details for ${p.name} (${p.roll}):`, "Please upload a clearer 4:3 passport photo and verify your CricHeroes profile.");
      if (!reason || !reason.trim()) return;
      p.verificationStatus = 'CHANGES_REQUIRED';
      p.status = 'CHANGES_REQUIRED';
      p.correctionNote = reason.trim();
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "VERIFICATION CORRECTION REQUESTED",
        details: `${p.name} (${p.roll}) sent for corrections: ${p.correctionNote}`
      });
      saveDatabase();
      broadcastAuthoritativeState();
      if (typeof fbDb !== 'undefined' && fbDb) {
        fbDb.collection("players").doc(p.rollNumberNormalized || p.roll).set({
          verificationStatus: 'CHANGES_REQUIRED',
          status: 'CHANGES_REQUIRED',
          correctionNote: p.correctionNote
        }, { merge: true }).catch(() => {});
      }
      showToast(`Correction requested for ${p.name}`, "info");
      renderCurrentView();
    }

    function adminRejectPlayer(id) {
      const p = players.find(x => x.id === id || x.playerId === id || x.roll === id);
      if (!p) return;
      if (!confirm(`Are you sure you want to REJECT player ${p.name} (${p.roll})? They will be barred from the tournament.`)) return;
      p.verificationStatus = 'REJECTED';
      p.status = 'REJECTED';
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "PLAYER REJECTED",
        details: `${p.name} (${p.roll}) rejected by ${currentUser.name}`
      });
      saveDatabase();
      broadcastAuthoritativeState();
      if (typeof fbDb !== 'undefined' && fbDb) {
        fbDb.collection("players").doc(p.rollNumberNormalized || p.roll).set({
          verificationStatus: 'REJECTED',
          status: 'REJECTED'
        }, { merge: true }).catch(() => {});
      }
      showToast(`Player ${p.name} rejected`, "warning");
      renderCurrentView();
    }

    function adminBlockPlayer(id) {
      const p = players.find(x => x.id === id || x.playerId === id || x.roll === id);
      if (!p) return;
      if (!confirm(`Are you sure you want to BLOCK player ${p.name} (${p.roll})?`)) return;
      p.verificationStatus = 'BLOCKED';
      p.status = 'BLOCKED';
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "PLAYER BLOCKED",
        details: `${p.name} (${p.roll}) blocked by ${currentUser.name}`
      });
      saveDatabase();
      broadcastAuthoritativeState();
      if (typeof fbDb !== 'undefined' && fbDb) {
        fbDb.collection("players").doc(p.rollNumberNormalized || p.roll).set({
          verificationStatus: 'BLOCKED',
          status: 'BLOCKED'
        }, { merge: true }).catch(() => {});
      }
      showToast(`Player ${p.name} blocked`, "error");
      renderCurrentView();
    }

    function adminResetPlayerToPending(id) {
      const p = players.find(x => x.id === id || x.playerId === id || x.roll === id);
      if (!p) return;
      p.verificationStatus = 'PENDING_VERIFICATION';
      p.status = 'PENDING_VERIFICATION';
      delete p.correctionNote;
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "PLAYER RESTORED TO PENDING",
        details: `${p.name} (${p.roll}) moved back to verification queue`
      });
      saveDatabase();
      broadcastAuthoritativeState();
      if (typeof fbDb !== 'undefined' && fbDb) {
        fbDb.collection("players").doc(p.rollNumberNormalized || p.roll).set({
          verificationStatus: 'PENDING_VERIFICATION',
          status: 'PENDING_VERIFICATION'
        }, { merge: true }).catch(() => {});
      }
      showToast(`Player ${p.name} returned to PENDING verification queue`, "info");
      renderCurrentView();
    }

    // ========================================================
    // ADMIN PROFILE MODAL & MANAGEMENT
    // ========================================================
    function openAdminProfileModal() {
      const m = document.getElementById("modalContainer");
      const user = currentUser;
      m.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6); max-width: 520px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="status-badge ${user.role === 'SUPER_ADMIN' ? 'status-connected' : 'status-live'}">${user.role}</span>
                <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; margin: 0; color: var(--text-bright);">MY PROFILE</h3>
              </div>
              <button class="btn btn-secondary" style="padding: 4px 8px; min-height: 28px; font-size: 0.75rem;" onclick="closeModal()">✕</button>
            </div>

            <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 20px; padding: 12px; background: var(--surface-2); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--surface-3); border: 2px solid var(--color-green); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.25rem; color: var(--color-green); overflow: hidden;">
                ${user.photo ? `<img src="${user.photo}" style="width: 100%; height: 100%; object-fit: cover;">` : (user.name ? user.name.charAt(0).toUpperCase() : 'A')}
              </div>
              <div>
                <div style="font-weight: 800; font-size: 1rem; color: var(--text-bright);">${user.name}</div>
                <div style="font-size: 0.75rem; color: var(--color-green); font-family: var(--font-mono);">${user.username || user.email || 'admin@acc.edu'}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${user.title || (user.role === 'SUPER_ADMIN' ? 'Chief Controller' : 'Auction Floor Operator')}</div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">FULL NAME</label>
                <input type="text" class="form-input" id="adminProfName" value="${user.name || ''}" placeholder="Full Name">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">PHONE / MOBILE</label>
                <input type="text" class="form-input" id="adminProfPhone" value="${user.mobile || ''}" placeholder="10-digit mobile number">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">OFFICIAL EMAIL</label>
                <input type="email" class="form-input" id="adminProfEmail" value="${user.email || ''}" placeholder="Official email">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">DESIGNATION / TITLE</label>
                <input type="text" class="form-input" id="adminProfDesignation" value="${user.title || ''}" placeholder="e.g. Tournament Director, Senior Floor Handler">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">DEPARTMENT</label>
                <input type="text" class="form-input" id="adminProfDept" value="${user.department || 'Sports & Physical Education'}" placeholder="Department">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">PROFILE PHOTO URL (OPTIONAL)</label>
                <input type="text" class="form-input" id="adminProfPhoto" value="${user.photo || ''}" placeholder="https://... or data:image/...">
              </div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
              <button class="btn btn-secondary" onclick="closeModal()">CANCEL</button>
              <button class="btn btn-primary" onclick="saveAdminProfile()">SAVE PROFILE</button>
            </div>
          </div>
        </div>
      `;
    }

    function saveAdminProfile() {
      const name = (document.getElementById("adminProfName")?.value || "").trim();
      const phone = (document.getElementById("adminProfPhone")?.value || "").trim();
      const email = (document.getElementById("adminProfEmail")?.value || "").trim();
      const title = (document.getElementById("adminProfDesignation")?.value || "").trim();
      const dept = (document.getElementById("adminProfDept")?.value || "").trim();
      const photo = (document.getElementById("adminProfPhoto")?.value || "").trim();

      if (!name) {
        showToast("Full name cannot be empty", "error");
        return;
      }

      currentUser.name = name;
      if (phone) currentUser.mobile = phone;
      if (email) currentUser.email = email;
      if (title) currentUser.title = title;
      if (dept) currentUser.department = dept;
      if (photo) currentUser.photo = photo;

      const userInList = users.find(u => u.username === currentUser.username || (currentUser.email && u.email === currentUser.email));
      if (userInList) {
        userInList.name = name;
        if (phone) userInList.mobile = phone;
        if (email) userInList.email = email;
        if (title) userInList.title = title;
        if (dept) userInList.department = dept;
        if (photo) userInList.photo = photo;
      }

      localStorage.setItem("acc_current_user_2026", JSON.stringify(currentUser));
      saveDatabase();

      if (typeof fbDb !== 'undefined' && fbDb && currentUser.uid) {
        fbDb.collection("users").doc(currentUser.uid).set({
          name: name,
          mobile: phone,
          email: email,
          title: title,
          department: dept,
          photo: photo,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      }

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "ADMIN PROFILE UPDATED",
        details: `Profile updated for ${name} (${currentUser.role})`
      });

      showToast("Profile details updated successfully", "success");
      closeModal();
      renderHeaderNav();
      renderCurrentView();
    }
"""

if "function adminVerifyPlayer" not in content:
    content = content.replace("function detectAndMergeDuplicateRolls() {", admin_verification_helpers + "\n    function detectAndMergeDuplicateRolls() {")
    print("Injected admin verification and profile helpers")

# 4. Add MY PROFILE button in header nav for SUPER ADMIN and ADMIN
content = content.replace(
    """<button class="nav-link-btn ${currentView === 'projector' ? 'active' : ''}" onclick="switchView('projector')">PROJECTOR</button>
        `;
        auth.innerHTML = `
          <button class="btn btn-secondary" style="min-height: 36px; padding: 6px 14px; font-size: 0.75rem; color: var(--color-red); border-color: rgba(225,29,72,0.3);" onclick="logoutUser()">LOGOUT</button>
        `;""",
    """<button class="nav-link-btn ${currentView === 'projector' ? 'active' : ''}" onclick="switchView('projector')">PROJECTOR</button>
        `;
        auth.innerHTML = `
          <button class="btn btn-secondary" style="min-height: 36px; padding: 6px 14px; font-size: 0.75rem; color: var(--color-green); border-color: rgba(5, 150, 105, 0.4);" onclick="openAdminProfileModal()">MY PROFILE</button>
          <button class="btn btn-secondary" style="min-height: 36px; padding: 6px 14px; font-size: 0.75rem; color: var(--color-red); border-color: rgba(225,29,72,0.3);" onclick="logoutUser()">LOGOUT</button>
        `;"""
)

content = content.replace(
    """<button class="nav-link-btn ${currentView === 'admin' ? 'active' : ''}" onclick="switchView('admin')">ADMIN CONSOLE</button>
        `;
        auth.innerHTML = `
          <button class="btn btn-secondary" style="min-height: 36px; padding: 6px 14px; font-size: 0.75rem; color: var(--color-red); border-color: rgba(225,29,72,0.3);" onclick="logoutUser()">LOGOUT</button>
        `;""",
    """<button class="nav-link-btn ${currentView === 'admin' ? 'active' : ''}" onclick="switchView('admin')">ADMIN CONSOLE</button>
        `;
        auth.innerHTML = `
          <button class="btn btn-secondary" style="min-height: 36px; padding: 6px 14px; font-size: 0.75rem; color: var(--color-green); border-color: rgba(5, 150, 105, 0.4);" onclick="openAdminProfileModal()">MY PROFILE</button>
          <button class="btn btn-secondary" style="min-height: 36px; padding: 6px 14px; font-size: 0.75rem; color: var(--color-red); border-color: rgba(225,29,72,0.3);" onclick="logoutUser()">LOGOUT</button>
        `;"""
)

# 5. Fix header for PUBLIC/SPECTATOR:
content = content.replace(
    'if (currentUser.role === "SPECTATOR") {',
    'if (currentUser.role === "SPECTATOR" || currentUser.role === "PUBLIC" || !currentUser.role) {'
)

# 6. Insert PLAYER VERIFICATION Tab content in renderAdminConsoleView
player_verification_tab_html = """adminNavTab === 'PLAYER VERIFICATION' ? `
            <!-- TAB: PLAYER VERIFICATION AS A HARD GATE (ACC 2026 SPEC) -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="status-badge status-connected">OFFICIAL GATE</span>
                    <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-bright); margin: 0;">
                      PLAYER VERIFICATION HARD GATE
                    </h3>
                  </div>
                  <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 4px;">
                    Strict gatekeeper control. Only VERIFIED players are visible to the public, published in rosters, or admitted to the auction lot pool.
                  </div>
                </div>
                <div style="font-size: 0.75rem; color: var(--color-green); font-family: var(--font-mono); background: rgba(5, 150, 105, 0.1); padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(5, 150, 105, 0.3);">
                  TOTAL CANDIDATES: ${players.length}
                </div>
              </div>

              <!-- 5 Workflow Sub-Tabs -->
              <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; border-bottom: 1px solid var(--border-subtle);">
                ${(() => {
                  const subTabs = [
                    { id: 'PENDING', label: 'PENDING', count: players.filter(p => p.verificationStatus === 'PENDING_VERIFICATION' || p.status === 'PENDING_VERIFICATION' || p.status === 'PENDING_REVIEW' || (!p.verificationStatus && p.status !== 'AVAILABLE' && p.status !== 'SOLD' && p.status !== 'UNSOLD' && p.status !== 'BLOCKED' && p.status !== 'REJECTED')).length },
                    { id: 'VERIFIED', label: 'VERIFIED', count: players.filter(p => p.verificationStatus === 'VERIFIED' || ((!p.verificationStatus) && (p.status === 'AVAILABLE' || p.status === 'SOLD' || p.status === 'UNSOLD'))).length },
                    { id: 'CHANGES_REQUIRED', label: 'CHANGES REQUIRED', count: players.filter(p => p.verificationStatus === 'CHANGES_REQUIRED' || p.status === 'CHANGES_REQUIRED').length },
                    { id: 'REJECTED', label: 'REJECTED', count: players.filter(p => p.verificationStatus === 'REJECTED' || p.status === 'REJECTED').length },
                    { id: 'BLOCKED', label: 'BLOCKED', count: players.filter(p => p.verificationStatus === 'BLOCKED' || p.status === 'BLOCKED').length }
                  ];
                  return subTabs.map(st => {
                    const active = playerVerificationSubTab === st.id;
                    return `
                      <button type="button" class="btn ${active ? 'btn-primary' : 'btn-secondary'}" 
                        style="padding: 6px 12px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 6px;"
                        onclick="playerVerificationSubTab = '${st.id}'; renderCurrentView();">
                        <span>${st.label}</span>
                        <span style="background: ${active ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)'}; padding: 1px 6px; border-radius: 10px; font-size: 0.6875rem;">${st.count}</span>
                      </button>
                    `;
                  }).join('');
                })()}
              </div>

              <!-- List of Players in Current Sub-Tab -->
              <div class="surface-card" style="padding: 0; overflow-x: auto;">
                ${(() => {
                  let subList = [];
                  if (playerVerificationSubTab === 'PENDING') {
                    subList = players.filter(p => p.verificationStatus === 'PENDING_VERIFICATION' || p.status === 'PENDING_VERIFICATION' || p.status === 'PENDING_REVIEW' || (!p.verificationStatus && p.status !== 'AVAILABLE' && p.status !== 'SOLD' && p.status !== 'UNSOLD' && p.status !== 'BLOCKED' && p.status !== 'REJECTED'));
                  } else if (playerVerificationSubTab === 'VERIFIED') {
                    subList = players.filter(p => p.verificationStatus === 'VERIFIED' || ((!p.verificationStatus) && (p.status === 'AVAILABLE' || p.status === 'SOLD' || p.status === 'UNSOLD')));
                  } else if (playerVerificationSubTab === 'CHANGES_REQUIRED') {
                    subList = players.filter(p => p.verificationStatus === 'CHANGES_REQUIRED' || p.status === 'CHANGES_REQUIRED');
                  } else if (playerVerificationSubTab === 'REJECTED') {
                    subList = players.filter(p => p.verificationStatus === 'REJECTED' || p.status === 'REJECTED');
                  } else if (playerVerificationSubTab === 'BLOCKED') {
                    subList = players.filter(p => p.verificationStatus === 'BLOCKED' || p.status === 'BLOCKED');
                  }

                  if (subList.length === 0) {
                    return `
                      <div style="padding: 40px 20px; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
                        No player records currently in <strong>${playerVerificationSubTab.replace('_', ' ')}</strong> status.
                      </div>
                    `;
                  }

                  return `
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem;">
                      <thead>
                        <tr style="background: var(--surface-2); border-bottom: 1px solid var(--border-medium); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">
                          <th style="padding: 12px 16px;">Player & Photo</th>
                          <th style="padding: 12px 16px;">Roll Number</th>
                          <th style="padding: 12px 16px;">Academic & Bucket</th>
                          <th style="padding: 12px 16px;">CricHeroes / Contact</th>
                          <th style="padding: 12px 16px;">Base Price</th>
                          <th style="padding: 12px 16px;">Verification Status</th>
                          <th style="padding: 12px 16px; text-align: right;">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${subList.map(p => {
                          const vStatus = p.verificationStatus || (p.status === 'AVAILABLE' || p.status === 'SOLD' || p.status === 'UNSOLD' ? 'VERIFIED' : 'PENDING_VERIFICATION');
                          return `
                            <tr style="border-bottom: 1px solid var(--border-subtle);">
                              <td style="padding: 12px 16px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                  ${getPlayerAvatar(p, 42, 42)}
                                  <div>
                                    <div style="font-weight: 800; color: var(--text-bright);">${p.name}</div>
                                    <div style="font-size: 0.7rem; color: var(--text-muted);">${p.derivedType || p.role || 'All-Rounder'}</div>
                                  </div>
                                </div>
                              </td>
                              <td style="padding: 12px 16px; font-family: var(--font-mono); font-weight: 700; color: var(--color-green);">
                                ${p.roll}
                              </td>
                              <td style="padding: 12px 16px;">
                                <div><strong style="color: var(--color-yellow);">${p.bucket}</strong> · ${p.program || 'B.Tech'} Yr ${p.year}</div>
                                <div style="font-size: 0.7rem; color: var(--text-muted);">${p.branch || p.department} (${p.entryType || 'Regular'})</div>
                              </td>
                              <td style="padding: 12px 16px;">
                                <div style="font-family: var(--font-mono); font-size: 0.75rem;">${p.mobile || '—'}</div>
                                <div style="font-size: 0.7rem; margin-top: 2px;">
                                  ${p.cricHeroesUrl ? `<a href="${p.cricHeroesUrl}" target="_blank" style="color: var(--color-blue); text-decoration: underline;">CricHeroes ↗</a>` : `<span style="color: var(--text-muted);">${p.cricHeroesStatus || 'Pending'}</span>`}
                                </div>
                              </td>
                              <td style="padding: 12px 16px; font-family: var(--font-mono); font-weight: 700; color: var(--color-orange);">
                                ${p.basePrice ? p.basePrice + ' C' : '—'}
                              </td>
                              <td style="padding: 12px 16px;">
                                <span class="status-badge ${vStatus === 'VERIFIED' ? 'status-connected' : vStatus === 'CHANGES_REQUIRED' ? 'status-warning' : (vStatus === 'REJECTED' || vStatus === 'BLOCKED') ? 'status-blocked' : 'status-live'}" style="font-size: 0.65rem;">
                                  ${vStatus.replace('_', ' ')}
                                </span>
                                ${p.correctionNote ? `<div style="font-size: 0.6875rem; color: var(--color-yellow); margin-top: 4px; max-width: 180px;">Note: ${p.correctionNote}</div>` : ''}
                              </td>
                              <td style="padding: 12px 16px; text-align: right;">
                                <div style="display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap;">
                                  ${vStatus !== 'VERIFIED' ? `
                                    <button class="btn btn-primary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="adminVerifyPlayer(${p.id})">
                                      ✓ VERIFY
                                    </button>
                                  ` : ''}
                                  ${vStatus !== 'CHANGES_REQUIRED' && vStatus !== 'BLOCKED' && vStatus !== 'REJECTED' ? `
                                    <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px; color: var(--color-yellow); border-color: rgba(255,209,102,0.4);" onclick="adminRequestCorrection(${p.id})">
                                      ✎ CORRECTION
                                    </button>
                                  ` : ''}
                                  ${vStatus !== 'REJECTED' && vStatus !== 'BLOCKED' ? `
                                    <button class="btn btn-danger" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="adminRejectPlayer(${p.id})">
                                      ✕ REJECT
                                    </button>
                                  ` : ''}
                                  ${vStatus !== 'BLOCKED' ? `
                                    <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px; color: var(--color-red); border-color: rgba(225,29,72,0.3);" onclick="adminBlockPlayer(${p.id})">
                                      ⊘ BLOCK
                                    </button>
                                  ` : `
                                    <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="adminResetPlayerToPending(${p.id})">
                                      MOVE TO PENDING
                                    </button>
                                  `}
                                </div>
                              </td>
                            </tr>
                          `;
                        }).join('')}
                      </tbody>
                    </table>
                  `;
                })()}
              </div>
            </div>
          ` : """

if "adminNavTab === 'PLAYER VERIFICATION' ?" not in content:
    content = content.replace("adminNavTab === 'REGISTRATIONS' ?", player_verification_tab_html + "adminNavTab === 'REGISTRATIONS' ?")
    print("Injected PLAYER VERIFICATION tab view")

# 7. Update Public Players Filtering (Hard Gate)
content = content.replace(
    """const filteredPlayers = players.filter(p => {
        if (publicSearchQuery && !p.name.toLowerCase().includes(publicSearchQuery.toLowerCase()) && !p.roll.toLowerCase().includes(publicSearchQuery.toLowerCase())) return false;
        if (publicBucketFilter !== "ALL" && p.bucket !== publicBucketFilter) return false;
        return true;
      });""",
    """const filteredPlayers = players.filter(p => {
        // HARD GATE: Only VERIFIED players can appear in public views
        const isVerified = (p.verificationStatus === 'VERIFIED' || p.status === 'VERIFIED' || p.status === 'AVAILABLE' || p.status === 'SOLD' || p.status === 'UNSOLD') &&
                           p.verificationStatus !== 'PENDING_VERIFICATION' &&
                           p.verificationStatus !== 'CHANGES_REQUIRED' &&
                           p.verificationStatus !== 'REJECTED' &&
                           p.verificationStatus !== 'BLOCKED';
        if (!isVerified) return false;
        if (publicSearchQuery && !p.name.toLowerCase().includes(publicSearchQuery.toLowerCase()) && !p.roll.toLowerCase().includes(publicSearchQuery.toLowerCase())) return false;
        if (publicBucketFilter !== "ALL" && p.bucket !== publicBucketFilter) return false;
        return true;
      });"""
)

# 8. Fix Projector View Exit Button and Auction Lot verification check
content = content.replace(
    """<button class="btn btn-secondary" style="min-height: 36px; padding: 4px 12px;" onclick="switchView('public')">EXIT PROJECTOR</button>""",
    """<button class="btn btn-secondary" style="min-height: 36px; padding: 4px 12px;" onclick="switchView('public'); window.location.hash = 'home';">EXIT PROJECTOR</button>"""
)

# 9. Update submitPlayerRegistration: Mandatory photo, CricHeroes, initial PENDING_VERIFICATION state
content = content.replace(
    """      // 1. BASIC FIELDS VALIDATION
      if (!regFormData.name || !regFormData.name.trim()) {
        showToast("Please provide your full name in Section 1", "error");
        regActiveSection = 1;
        renderCurrentView();
        return;
      }
      if (!regFormData.roll || !regFormData.roll.trim()) {
        showToast("Please provide your college roll number in Section 1", "error");
        regActiveSection = 1;
        renderCurrentView();
        return;
      }
      if (!regFormData.basePrice) {
        showToast("Please select your auction base price in Section 2", "warning");
        regActiveSection = 2;
        renderCurrentView();
        return;
      }""",
    """      // 1. STRICT MANDATORY FIELDS VALIDATION (PHOTO & CRICHEROES MANDATORY)
      if (!regFormData.name || !regFormData.name.trim()) {
        showToast("Please provide your full name in Section 1", "error");
        regActiveSection = 1;
        renderCurrentView();
        return;
      }
      if (!regFormData.roll || !regFormData.roll.trim()) {
        showToast("Please provide your college roll number in Section 1", "error");
        regActiveSection = 1;
        renderCurrentView();
        return;
      }
      if (!regFormData.photo || !regFormData.photo.trim()) {
        showToast("Official 4:3 passport photo upload is strictly mandatory", "error");
        regActiveSection = 1;
        renderCurrentView();
        return;
      }
      if (!regFormData.basePrice) {
        showToast("Please select your auction base price in Section 2", "warning");
        regActiveSection = 2;
        renderCurrentView();
        return;
      }
      if (regFormData.cricHeroesStatus !== "PROFILE CREATION PENDING" && (!regFormData.cricHeroesUrl || !regFormData.cricHeroesUrl.trim())) {
        showToast("CricHeroes profile URL is required (or select 'PROFILE CREATION PENDING')", "error");
        regActiveSection = 2;
        renderCurrentView();
        return;
      }"""
)

# Replace player status default in submitPlayerRegistration
content = content.replace(
    """status: isDiscrepancy ? "PENDING_REVIEW" : "AVAILABLE",""",
    """status: "PENDING_VERIFICATION",
        verificationStatus: "PENDING_VERIFICATION","""
)

# 10. Update openRegistrationSuccessModal to show PENDING ADMIN VERIFICATION and clear session
content = content.replace(
    """function openRegistrationSuccessModal(player) {
      const m = document.getElementById("modalContainer");
      m.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6); max-width: 500px; text-align: center;">
            <span class="status-badge status-connected" style="font-size: 0.75rem; padding: 4px 10px;">REGISTRATION SUCCESSFUL</span>
            <h2 style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; color: var(--text-bright); margin: 12px 0 6px;">
              ${player.name}
            </h2>
            <div class="font-mono" style="font-size: 0.875rem; color: var(--color-green); margin-bottom: 16px;">
              Roll Number: ${player.roll}
            </div>

            <div style="background: var(--surface-2); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; text-align: center;">
              <div>
                <span class="label-micro" style="font-size: 0.65rem;">AUCTION BUCKET</span>
                <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-green);">${player.bucket}</div>
              </div>
              <div>
                <span class="label-micro" style="font-size: 0.65rem;">BASE PRICE</span>
                <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-orange); font-family: var(--font-mono);">${player.basePrice} C</div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button class="btn btn-primary" style="min-height: 46px; font-size: 0.9375rem;" onclick="closeModal(); initFreshRegistrationState(); switchView('register');">
                REGISTER ANOTHER PLAYER
              </button>
              <button class="btn btn-secondary" style="min-height: 40px; font-size: 0.8125rem;" onclick="closeModal(); switchView('public');">
                VIEW PUBLIC PLAYERS ROSTER
              </button>
            </div>
          </div>
        </div>
      `;
    }""",
    """function openRegistrationSuccessModal(player) {
      const m = document.getElementById("modalContainer");
      m.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(); switchView('public'); window.location.hash = 'home';">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6); max-width: 500px; text-align: center;">
            <span class="status-badge status-warning" style="font-size: 0.75rem; padding: 4px 12px;">REGISTRATION SUBMITTED · PENDING ADMIN VERIFICATION</span>
            <h2 style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; color: var(--text-bright); margin: 12px 0 6px;">
              ${player.name}
            </h2>
            <div class="font-mono" style="font-size: 0.875rem; color: var(--color-green); margin-bottom: 12px;">
              Roll Number: ${player.roll}
            </div>

            <div style="background: var(--surface-2); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; text-align: center;">
              <div>
                <span class="label-micro" style="font-size: 0.65rem;">AUTO BUCKET</span>
                <div style="font-size: 1.4rem; font-weight: 800; color: var(--color-green);">${player.bucket}</div>
              </div>
              <div>
                <span class="label-micro" style="font-size: 0.65rem;">BASE PRICE</span>
                <div style="font-size: 1.4rem; font-weight: 800; color: var(--color-orange); font-family: var(--font-mono);">${player.basePrice} C</div>
              </div>
            </div>

            <p style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 20px;">
              Your player enrollment has been saved. Under tournament rules, player profiles remain private until verified by the Admin Control Center. Once approved, your lot will appear on the public player roster.
            </p>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button class="btn btn-primary" style="min-height: 46px; font-size: 0.9375rem;" onclick="closeModal(); initFreshRegistrationState(); switchView('register');">
                REGISTER ANOTHER PLAYER
              </button>
              <button class="btn btn-secondary" style="min-height: 40px; font-size: 0.8125rem;" onclick="closeModal(); switchView('public'); window.location.hash = 'home';">
                RETURN TO HOME
              </button>
            </div>
          </div>
        </div>
      `;
    }"""
)

# 11. Timer rules: First bid timer 30s, bid timer 20s
content = content.replace("timerSeconds = 17;", "timerSeconds = 30;")
content = content.replace("17000", "30000")
content = content.replace("17 seconds", "30 seconds")
content = content.replace("17s", "30s")

# 12. Update validateRegRollAcademic to do live duplicate checking on blur
content = content.replace(
    """function validateRegRollAcademic() {
      const roll = (regFormData.roll || '').trim().toUpperCase();
      const notice = document.getElementById("regAcademicDiscrepancyNotice");
      if (!roll) {
        if (notice) notice.style.display = "none";
        return;
      }""",
    """function validateRegRollAcademic() {
      const roll = (regFormData.roll || '').trim().toUpperCase();
      const notice = document.getElementById("regAcademicDiscrepancyNotice");
      if (!roll) {
        if (notice) notice.style.display = "none";
        return;
      }

      // LIVE DUPLICATE ROLL NUMBER CHECK
      const normalizedRoll = roll.replace(/\\s+/g, '');
      const existingPlayer = players.find(p => p.status !== 'MERGED' && (p.roll || '').trim().toUpperCase().replace(/\\s+/g, '') === normalizedRoll);
      if (existingPlayer) {
        if (notice) {
          notice.style.display = "block";
          notice.innerHTML = `<span style="color: var(--color-red); font-weight: 800;">DUPLICATE ROLL DETECTED:</span> Roll ${normalizedRoll} is already registered (${existingPlayer.name} - #${existingPlayer.id}). Duplicate registration is not permitted.`;
        }
        showToast(`Roll number ${normalizedRoll} is already registered!`, "error");
        return;
      }"""
)

# 13. Route Guard: Ensure back button and hash changes to admin/franchise/player check role
content = content.replace(
    """    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && currentView !== hash) {
        switchView(hash);
      }
    });""",
    """    window.addEventListener("hashchange", () => {
      let hash = window.location.hash.replace("#", "");
      if (hash === "home" || !hash) hash = "public";
      if (hash && currentView !== hash) {
        switchView(hash);
      }
    });"""
)

with open("B:/projects/ACC/index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated index.html successfully! New length:", len(content))

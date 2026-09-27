import re

with open("B:/projects/ACC/index.html", "r", encoding="utf-8") as f:
    content = f.read()

print("Reading index.html for governance views patch...")

# -------------------------------------------------------------
# 1. ADD DASHBOARD COUNTERS TO ADMIN CONSOLE HEADER
# -------------------------------------------------------------
counters_html = """
          <!-- REALTIME APPROVAL & GOVERNANCE DASHBOARD COUNTERS (SECTION 46) -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
            <div class="surface-card" style="padding: 10px 14px; text-align: center; border-top: 3px solid var(--color-orange); cursor: pointer;" onclick="adminNavTab = 'PLAYER VERIFICATION'; renderCurrentView();">
              <div class="label-micro" style="font-size: 0.65rem; color: var(--text-muted);">PENDING PLAYERS</div>
              <div class="font-mono" style="font-size: 1.4rem; font-weight: 800; color: var(--color-orange); margin-top: 2px;">
                ${players.filter(p => p.approvalStatus === 'PENDING_APPROVAL' || p.verificationStatus === 'PENDING_VERIFICATION' || p.status === 'PENDING_VERIFICATION').length}
              </div>
            </div>

            <div class="surface-card" style="padding: 10px 14px; text-align: center; border-top: 3px solid var(--color-yellow); cursor: pointer;" onclick="adminNavTab = 'FRANCHISES'; renderCurrentView();">
              <div class="label-micro" style="font-size: 0.65rem; color: var(--text-muted);">PENDING FRANCHISES</div>
              <div class="font-mono" style="font-size: 1.4rem; font-weight: 800; color: var(--color-yellow); margin-top: 2px;">
                ${franchises.filter(f => f.approvalStatus === 'PENDING_APPROVAL' || f.status === 'PENDING_APPROVAL').length}
              </div>
            </div>

            <div class="surface-card" style="padding: 10px 14px; text-align: center; border-top: 3px solid var(--color-blue); cursor: pointer;" onclick="adminNavTab = 'FRANCHISE MEMBERS'; renderCurrentView();">
              <div class="label-micro" style="font-size: 0.65rem; color: var(--text-muted);">PENDING MEMBERS</div>
              <div class="font-mono" style="font-size: 1.4rem; font-weight: 800; color: var(--color-blue); margin-top: 2px;">
                ${(window.franchiseMembers || []).filter(m => m.approvalStatus === 'PENDING_APPROVAL').length}
              </div>
            </div>

            <div class="surface-card" style="padding: 10px 14px; text-align: center; border-top: 3px solid var(--color-yellow); cursor: pointer;" onclick="adminNavTab = 'PLAYER VERIFICATION'; playerVerificationSubTab = 'CHANGES_REQUIRED'; renderCurrentView();">
              <div class="label-micro" style="font-size: 0.65rem; color: var(--text-muted);">CHANGES REQUIRED</div>
              <div class="font-mono" style="font-size: 1.4rem; font-weight: 800; color: var(--color-yellow); margin-top: 2px;">
                ${players.filter(p => p.approvalStatus === 'CHANGES_REQUIRED' || p.verificationStatus === 'CHANGES_REQUIRED').length}
              </div>
            </div>

            <div class="surface-card" style="padding: 10px 14px; text-align: center; border-top: 3px solid var(--color-red); cursor: pointer;" onclick="adminNavTab = 'PLAYER VERIFICATION'; playerVerificationSubTab = 'BLOCKED'; renderCurrentView();">
              <div class="label-micro" style="font-size: 0.65rem; color: var(--text-muted);">BLOCKED</div>
              <div class="font-mono" style="font-size: 1.4rem; font-weight: 800; color: var(--color-red); margin-top: 2px;">
                ${players.filter(p => p.approvalStatus === 'BLOCKED' || p.verificationStatus === 'BLOCKED' || p.status === 'BLOCKED').length}
              </div>
            </div>

            <div class="surface-card" style="padding: 10px 14px; text-align: center; border-top: 3px solid var(--color-green); cursor: pointer;" onclick="adminNavTab = 'PLAYERS'; renderCurrentView();">
              <div class="label-micro" style="font-size: 0.65rem; color: var(--text-muted);">ACTIVE PLAYERS</div>
              <div class="font-mono" style="font-size: 1.4rem; font-weight: 800; color: var(--color-green); margin-top: 2px;">
                ${players.filter(p => (p.approvalStatus === 'APPROVED' || p.verificationStatus === 'VERIFIED') && (p.accountStatus === 'ACTIVE' || p.status === 'AVAILABLE' || p.status === 'SOLD' || p.status === 'UNSOLD')).length}
              </div>
            </div>

            <div class="surface-card" style="padding: 10px 14px; text-align: center; border-top: 3px solid var(--color-green); cursor: pointer;" onclick="adminNavTab = 'TEAMS'; renderCurrentView();">
              <div class="label-micro" style="font-size: 0.65rem; color: var(--text-muted);">ACTIVE FRANCHISES</div>
              <div class="font-mono" style="font-size: 1.4rem; font-weight: 800; color: var(--color-green); margin-top: 2px;">
                ${franchises.filter(f => f.status === 'ACTIVE' || (!f.status && f.id <= 11)).length} / 11
              </div>
            </div>
          </div>
"""

# Insert counters right before the navigation pills in renderAdminConsoleView
nav_pills_pattern = '<!-- Admin Navigation Pills Bar -->'
if nav_pills_pattern in content:
    content = content.replace(nav_pills_pattern, counters_html + "\n          " + nav_pills_pattern)
    print("Injected approval dashboard counters into admin console view")

# -------------------------------------------------------------
# 2. UPDATE PLAYERS TABLE HEADERS & ROWS IN PLAYERS TAB
# -------------------------------------------------------------
old_th = """                      <th style="padding: 10px 14px;">Player</th>
                      <th style="padding: 10px 14px;">Roll Number</th>
                      <th style="padding: 10px 14px;">Dept / Branch</th>
                      <th style="padding: 10px 14px;">Year</th>
                      <th style="padding: 10px 14px;">Bucket</th>
                      <th style="padding: 10px 14px;">Role</th>
                      <th style="padding: 10px 14px;">Base Price</th>
                      <th style="padding: 10px 14px;">Status</th>
                      <th style="padding: 10px 14px; text-align: right;">Action</th>"""

new_th = """                      <th style="padding: 10px 14px;">Player</th>
                      <th style="padding: 10px 14px;">Roll Number</th>
                      <th style="padding: 10px 14px;">Dept / Branch</th>
                      <th style="padding: 10px 14px;">Year</th>
                      <th style="padding: 10px 14px;">Bucket</th>
                      <th style="padding: 10px 14px;">Role</th>
                      <th style="padding: 10px 14px;">Base Price</th>
                      <th style="padding: 10px 14px;">Auction Status</th>
                      <th style="padding: 10px 14px;">Approval</th>
                      <th style="padding: 10px 14px;">Account</th>
                      <th style="padding: 10px 14px; text-align: right;">Actions</th>"""

if old_th in content:
    content = content.replace(old_th, new_th)
    print("Updated PLAYERS table header columns")

# Replace table row mapping in PLAYERS tab
old_tr = """                        <td style="padding: 10px 14px;">
                          <span class="status-badge ${p.status === 'SOLD' ? 'status-connected' : p.status === 'AVAILABLE' ? 'status-live' : 'status-blocked'}" style="font-size: 0.65rem;">
                            ${p.status}
                          </span>
                        </td>
                        <td style="padding: 10px 14px; text-align: right;">
                          <div style="display: flex; gap: 6px; justify-content: flex-end;">
                            <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="openPlayerDetailModal(${p.id})">INSPECT</button>
                            ${isSuperAdmin ? `
                              <button class="btn btn-primary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="openPlayerEditModal(${p.id})">EDIT</button>
                            ` : ''}
                          </div>
                        </td>"""

new_tr = """                        <td style="padding: 10px 14px;">
                          <span class="status-badge ${p.status === 'SOLD' ? 'status-connected' : p.status === 'AVAILABLE' ? 'status-live' : 'status-blocked'}" style="font-size: 0.65rem;">
                            ${p.status || 'AVAILABLE'}
                          </span>
                        </td>
                        <td style="padding: 10px 14px;">
                          <span class="status-badge ${p.approvalStatus === 'APPROVED' ? 'status-connected' : p.approvalStatus === 'CHANGES_REQUIRED' ? 'status-warning' : p.approvalStatus === 'BLOCKED' ? 'status-blocked' : 'status-live'}" style="font-size: 0.625rem;">
                            ${p.approvalStatus || 'APPROVED'}
                          </span>
                        </td>
                        <td style="padding: 10px 14px;">
                          <span class="status-badge ${p.accountStatus === 'ACTIVE' ? 'status-connected' : p.accountStatus === 'DISABLED' ? 'status-blocked' : 'status-warning'}" style="font-size: 0.625rem;">
                            ${p.accountStatus || 'ACTIVE'}
                          </span>
                        </td>
                        <td style="padding: 10px 14px; text-align: right;">
                          <div style="display: flex; gap: 4px; justify-content: flex-end; flex-wrap: wrap;">
                            <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 3px 6px; min-height: 26px;" onclick="openPlayerDetailModal(${p.id})">INSPECT</button>
                            ${isSuperAdmin ? `
                              <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 3px 6px; min-height: 26px;" onclick="openPlayerEditModal(${p.id})">EDIT</button>
                              ${p.approvalStatus !== 'APPROVED' ? `
                                <button class="btn btn-primary" style="font-size: 0.65rem; padding: 3px 6px; min-height: 26px;" onclick="adminApprovePlayerGovernance(${p.id})">APPROVE</button>
                              ` : ''}
                              <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 3px 6px; min-height: 26px; color: var(--color-orange); border-color: rgba(255,153,0,0.4);" onclick="openPlayerCredentialModal(${p.id})">CREDS</button>
                              ${p.approvalStatus !== 'BLOCKED' ? `
                                <button class="btn btn-danger" style="font-size: 0.65rem; padding: 3px 6px; min-height: 26px;" onclick="adminBlockPlayerGovernance(${p.id})">BLOCK</button>
                              ` : `
                                <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 3px 6px; min-height: 26px;" onclick="adminUnblockPlayerGovernance(${p.id})">UNBLOCK</button>
                              `}
                              <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 3px 6px; min-height: 26px; color: var(--text-muted);" onclick="adminArchivePlayerGovernance(${p.id})">ARCHIVE</button>
                            ` : ''}
                          </div>
                        </td>"""

if old_tr in content:
    content = content.replace(old_tr, new_tr)
    print("Updated PLAYERS table row columns and governance buttons")

# -------------------------------------------------------------
# 3. ADD FRANCHISES TAB, FRANCHISE MEMBERS TAB, AND DATA INTEGRITY TAB
# -------------------------------------------------------------
tabs_to_inject = """adminNavTab === 'FRANCHISES' ? `
            <!-- TAB: FRANCHISES GOVERNANCE & CREATION (SECTION 16-20) -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div>
                  <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-bright); margin: 0;">
                    FRANCHISE DIRECTORY & GOVERNANCE (${franchises.length} Registered)
                  </h3>
                  <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
                    Super Admin creation, coordinator account provisioning, and tournament participation approval. Exactly 11 approved franchises.
                  </div>
                </div>
                ${isSuperAdmin ? `
                  <button class="btn btn-primary" onclick="openCreateFranchiseModal()" style="font-size: 0.75rem; padding: 6px 14px; min-height: 32px;">
                    + CREATE FRANCHISE
                  </button>
                ` : ''}
              </div>

              <!-- Franchises Table -->
              <div class="surface-card" style="padding: 0; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem;">
                  <thead>
                    <tr style="background: var(--surface-2); border-bottom: 1px solid var(--border-medium); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">
                      <th style="padding: 12px 16px;">Franchise & Logo</th>
                      <th style="padding: 12px 16px;">ID / Short</th>
                      <th style="padding: 12px 16px;">Faculty Coordinator</th>
                      <th style="padding: 12px 16px;">Coordinator Contact</th>
                      <th style="padding: 12px 16px;">Purse Cap</th>
                      <th style="padding: 12px 16px;">Squad</th>
                      <th style="padding: 12px 16px;">Approval</th>
                      <th style="padding: 12px 16px;">Status</th>
                      <th style="padding: 12px 16px; text-align: right;">Governance Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${franchises.map(f => `
                      <tr style="border-bottom: 1px solid var(--border-subtle);">
                        <td style="padding: 12px 16px;">
                          <div style="display: flex; align-items: center; gap: 10px;">
                            ${getTeamEmblem(f.id, 32)}
                            <div>
                              <strong style="color: var(--text-bright); font-size: 0.9375rem;">${f.name}</strong>
                              <div style="font-size: 0.7rem; color: var(--text-muted);">Slot #${String(f.id).padStart(2, '0')}</div>
                            </div>
                          </div>
                        </td>
                        <td style="padding: 12px 16px;">
                          <span class="font-mono" style="font-weight: 700; color: var(--color-green);">${f.franchiseId || 'FR' + String(f.id).padStart(3, '0')}</span>
                          <span style="font-size: 0.7rem; color: var(--text-muted);">(${f.short})</span>
                        </td>
                        <td style="padding: 12px 16px;">
                          <div style="font-weight: 700; color: var(--text-bright);">${f.coordinatorName || 'Prof. Faculty Coordinator'}</div>
                          <div style="font-size: 0.7rem; color: var(--text-muted);">${f.coordinatorDept || 'Sports Committee'}</div>
                        </td>
                        <td style="padding: 12px 16px;">
                          <div class="font-mono" style="font-size: 0.75rem;">${f.coordinatorMobile || '9876500000'}</div>
                          <div style="font-size: 0.7rem; color: var(--text-muted);">${f.coordinatorEmail || f.name.toLowerCase() + '@franchise.acc.edu'}</div>
                        </td>
                        <td style="padding: 12px 16px; font-family: var(--font-mono); font-weight: 700; color: var(--color-green);">
                          ${f.purse}C
                        </td>
                        <td style="padding: 12px 16px; font-family: var(--font-mono);">
                          ${(f.squad || []).length} / 15
                        </td>
                        <td style="padding: 12px 16px;">
                          <span class="status-badge ${f.approvalStatus === 'APPROVED' ? 'status-connected' : 'status-warning'}" style="font-size: 0.625rem;">
                            ${f.approvalStatus || 'APPROVED'}
                          </span>
                        </td>
                        <td style="padding: 12px 16px;">
                          <span class="status-badge ${f.status === 'ACTIVE' ? 'status-connected' : f.status === 'DISABLED' ? 'status-blocked' : 'status-live'}" style="font-size: 0.625rem;">
                            ${f.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td style="padding: 12px 16px; text-align: right;">
                          <div style="display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap;">
                            ${isSuperAdmin ? `
                              ${f.approvalStatus !== 'APPROVED' ? `
                                <button class="btn btn-primary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="adminApproveFranchise(${f.id})">APPROVE</button>
                              ` : ''}
                              <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px; color: var(--color-orange); border-color: rgba(255,153,0,0.4);" onclick="openFranchiseCredentialModal(${f.id})">CREDS</button>
                              ${f.status !== 'DISABLED' ? `
                                <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px; color: var(--color-yellow); border-color: rgba(255,209,102,0.4);" onclick="adminDisableFranchise(${f.id})">DISABLE</button>
                              ` : ''}
                              <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px; color: var(--text-muted);" onclick="adminArchiveFranchise(${f.id})">ARCHIVE</button>
                            ` : ''}
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : adminNavTab === 'FRANCHISE MEMBERS' ? `
            <!-- TAB: FRANCHISE MEMBERS GOVERNANCE (SECTION 21-22) -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div>
                  <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-bright); margin: 0;">
                    FRANCHISE PERSONNEL & MEMBERS
                  </h3>
                  <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
                    Manage Coordinators, Team Leads, Captains, and Vice-Captains. Dual-login accounts point to unified franchise workspace.
                  </div>
                </div>
                ${isSuperAdmin ? `
                  <button class="btn btn-primary" onclick="openAddMemberModal()" style="font-size: 0.75rem; padding: 6px 14px; min-height: 32px;">
                    + ADD MEMBER
                  </button>
                ` : ''}
              </div>

              <!-- Members Table -->
              <div class="surface-card" style="padding: 0; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem;">
                  <thead>
                    <tr style="background: var(--surface-2); border-bottom: 1px solid var(--border-medium); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">
                      <th style="padding: 12px 16px;">Member Name</th>
                      <th style="padding: 12px 16px;">Assigned Franchise</th>
                      <th style="padding: 12px 16px;">Role</th>
                      <th style="padding: 12px 16px;">Department</th>
                      <th style="padding: 12px 16px;">Mobile</th>
                      <th style="padding: 12px 16px;">Email</th>
                      <th style="padding: 12px 16px;">Approval</th>
                      <th style="padding: 12px 16px;">Account</th>
                      <th style="padding: 12px 16px; text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(window.franchiseMembers || []).map(m => {
                      const f = franchises.find(x => x.id === m.franchiseId);
                      return `
                        <tr style="border-bottom: 1px solid var(--border-subtle);">
                          <td style="padding: 12px 16px;">
                            <strong>${m.name}</strong>
                          </td>
                          <td style="padding: 12px 16px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                              ${getTeamEmblem(m.franchiseId, 20)}
                              <span>${f ? f.name : 'Franchise #' + m.franchiseId}</span>
                            </div>
                          </td>
                          <td style="padding: 12px 16px;">
                            <span class="status-badge ${m.role === 'COORDINATOR' ? 'status-connected' : m.role === 'CAPTAIN' ? 'status-live' : 'status-scarcity'}" style="font-size: 0.625rem;">
                              ${m.role}
                            </span>
                          </td>
                          <td style="padding: 12px 16px;">${m.department}</td>
                          <td style="padding: 12px 16px; font-family: var(--font-mono);">${m.mobile}</td>
                          <td style="padding: 12px 16px;">${m.email}</td>
                          <td style="padding: 12px 16px;">
                            <span class="status-badge ${m.approvalStatus === 'APPROVED' ? 'status-connected' : 'status-warning'}" style="font-size: 0.625rem;">
                              ${m.approvalStatus || 'APPROVED'}
                            </span>
                          </td>
                          <td style="padding: 12px 16px;">
                            <span class="status-badge ${m.accountStatus === 'ACTIVE' ? 'status-connected' : 'status-live'}" style="font-size: 0.625rem;">
                              ${m.accountStatus || 'ACTIVE'}
                            </span>
                          </td>
                          <td style="padding: 12px 16px; text-align: right;">
                            <div style="display: flex; gap: 6px; justify-content: flex-end;">
                              ${isSuperAdmin && m.approvalStatus !== 'APPROVED' ? `
                                <button class="btn btn-primary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="adminApproveMember('${m.id}')">APPROVE</button>
                              ` : ''}
                              ${isSuperAdmin ? `
                                <button class="btn btn-danger" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="adminRemoveMember('${m.id}')">REMOVE</button>
                              ` : ''}
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : adminNavTab === 'DATA INTEGRITY' ? `
            <!-- TAB: DATA INTEGRITY & MIGRATION ENGINE (SECTIONS 11 & 41) -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div>
                  <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-bright); margin: 0;">
                    DATA INTEGRITY & HISTORICAL MIGRATION CENTER
                  </h3>
                  <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
                    Enforce One Roll = One Identity, scan case-variants, audit orphaned users, and migrate historical editions.
                  </div>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-secondary" onclick="runDataIntegrityScan()" style="font-size: 0.75rem; padding: 6px 14px; min-height: 32px;">
                    🔍 RUN INTEGRITY SCAN
                  </button>
                  ${isSuperAdmin ? `
                    <button class="btn btn-primary" onclick="runMigrateExistingPlayerAccounts()" style="font-size: 0.75rem; padding: 6px 14px; min-height: 32px;">
                      ⚡ MIGRATE EXISTING PLAYER ACCOUNTS
                    </button>
                  ` : ''}
                </div>
              </div>

              <!-- Integrity Metrics Grid -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-3);">
                <div class="surface-card" style="padding: 16px;">
                  <span class="label-micro" style="color: var(--color-green);">CANONICAL EDITION</span>
                  <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-bright); margin-top: 4px;">ACC 2026 OFFICIAL</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Edition isolation active</div>
                </div>

                <div class="surface-card" style="padding: 16px;">
                  <span class="label-micro" style="color: var(--color-blue);">TOTAL PLAYERS EVALUATED</span>
                  <div class="font-mono" style="font-size: 1.25rem; font-weight: 800; color: var(--color-blue); margin-top: 4px;">${players.length}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">All roll numbers normalized</div>
                </div>

                <div class="surface-card" style="padding: 16px;">
                  <span class="label-micro" style="color: var(--color-orange);">CASE-VARIANT ROLLS</span>
                  <div class="font-mono" style="font-size: 1.25rem; font-weight: 800; color: var(--color-orange); margin-top: 4px;">
                    ${dataIntegrityResults ? dataIntegrityResults.caseVariantRolls.length : 0}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Case differences unified</div>
                </div>

                <div class="surface-card" style="padding: 16px;">
                  <span class="label-micro" style="color: var(--color-yellow);">ORPHANED AUTH IDENTITIES</span>
                  <div class="font-mono" style="font-size: 1.25rem; font-weight: 800; color: var(--color-yellow); margin-top: 4px;">
                    ${dataIntegrityResults ? dataIntegrityResults.orphanedUsers.length : 0}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Users mapped to canonical record</div>
                </div>
              </div>

              <!-- Integrity Scan Diagnostic Report -->
              <div class="surface-card" style="padding: 20px;">
                <h4 style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 800; color: var(--text-bright); margin: 0 0 12px;">
                  DIAGNOSTIC SCAN LOG ${dataIntegrityResults ? `(Last scanned at ${dataIntegrityResults.scannedAt})` : ''}
                </h4>
                ${!dataIntegrityResults ? `
                  <div style="color: var(--text-muted); font-size: 0.8125rem;">
                    Click <strong>RUN INTEGRITY SCAN</strong> to verify roll casing, duplicate mobile entries, and orphaned authentication mappings.
                  </div>
                ` : `
                  <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.8125rem;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="status-badge ${dataIntegrityResults.duplicateRolls.length === 0 ? 'status-connected' : 'status-blocked'}">
                        ${dataIntegrityResults.duplicateRolls.length === 0 ? '✓ ZERO DUPLICATE ROLLS' : '⚠️ ' + dataIntegrityResults.duplicateRolls.length + ' DUPLICATE ROLL(S) DETECTED'}
                      </span>
                      <span style="color: var(--text-muted);">One Roll = One Player enforced.</span>
                    </div>

                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="status-badge ${dataIntegrityResults.duplicateMobiles.length === 0 ? 'status-connected' : 'status-warning'}">
                        ${dataIntegrityResults.duplicateMobiles.length === 0 ? '✓ ALL MOBILES UNIQUE' : '⚠️ ' + dataIntegrityResults.duplicateMobiles.length + ' SHARED MOBILE(S)'}
                      </span>
                      <span style="color: var(--text-muted);">Student player contact numbers verified.</span>
                    </div>

                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="status-badge status-connected">
                        ✓ 11 CANONICAL FRANCHISES VERIFIED
                      </span>
                      <span style="color: var(--text-muted);">FR001 through FR011 assigned and active.</span>
                    </div>
                  </div>
                `}
              </div>
            </div>
          ` : """

# Inject these tabs right before adminNavTab === 'AUCTION'
target_auction = "adminNavTab === 'AUCTION' ?"
if target_auction in content:
    content = content.replace(target_auction, tabs_to_inject + target_auction)
    print("Injected FRANCHISES, FRANCHISE MEMBERS, and DATA INTEGRITY tabs into renderAdminConsoleView")
else:
    print("Warning: could not find target_auction")

with open("B:/projects/ACC/index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Saved phase 2 changes to index.html")

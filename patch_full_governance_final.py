with open("B:/projects/ACC/index.html", "r", encoding="utf-8") as f:
    content = f.read()

print("Applying full governance additions...")

# 1. Inject openPlayerEditModal and savePlayerEditModal
player_edit_code = """
    // ========================================================
    // SUPER ADMIN FULL PLAYER EDIT & REVALIDATION (SECTION 27)
    // ========================================================
    function openPlayerEditModal(playerId) {
      const p = players.find(x => x.id == playerId || x.playerId == playerId);
      if (!p) { showToast("Player not found", "error"); return; }
      const m = document.getElementById("modalContainer");
      m.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6); max-width: 600px; max-height: 90vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="status-badge status-connected">SUPER ADMIN</span>
                <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; margin: 0; color: var(--text-bright);">
                  EDIT PLAYER: ${p.name} (#${p.id})
                </h3>
              </div>
              <button class="btn btn-secondary" style="padding: 4px 8px; min-height: 28px;" onclick="closeModal()">✕</button>
            </div>

            <div style="background: rgba(255, 209, 102, 0.08); border-left: 3px solid var(--color-yellow); padding: 8px 12px; font-size: 0.75rem; color: var(--color-yellow); margin-bottom: 14px;">
              <strong>GOVERNANCE NOTICE:</strong> Modifying critical identity or academic fields (Roll, Program, Dept, Year, CricHeroes) will automatically reset approval to <strong>PENDING_APPROVAL</strong> for re-review.
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">FULL NAME</label>
                <input type="text" class="form-input" id="editPlayerName" value="${p.name || ''}">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">COLLEGE ROLL NUMBER</label>
                <input type="text" class="form-input" id="editPlayerRoll" value="${p.roll || ''}">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">PROGRAM</label>
                <select class="form-input" id="editPlayerProgram">
                  <option value="B.Tech" ${p.program === 'B.Tech' ? 'selected' : ''}>B.Tech</option>
                  <option value="Diploma" ${p.program === 'Diploma' ? 'selected' : ''}>Diploma</option>
                  <option value="PG" ${p.program === 'PG' ? 'selected' : ''}>PG (MBA/MCA/M.Tech)</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">DEPARTMENT / BRANCH</label>
                <input type="text" class="form-input" id="editPlayerDept" value="${p.department || p.branch || 'CSE'}">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">ENTRY TYPE</label>
                <select class="form-input" id="editPlayerEntryType">
                  <option value="Regular" ${p.entryType === 'Regular' ? 'selected' : ''}>Regular</option>
                  <option value="Lateral" ${p.entryType === 'Lateral' ? 'selected' : ''}>Lateral</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">STUDY YEAR</label>
                <select class="form-input" id="editPlayerYear">
                  <option value="1" ${p.year == 1 ? 'selected' : ''}>Year 1</option>
                  <option value="2" ${p.year == 2 ? 'selected' : ''}>Year 2</option>
                  <option value="3" ${p.year == 3 ? 'selected' : ''}>Year 3</option>
                  <option value="4" ${p.year == 4 ? 'selected' : ''}>Year 4</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">AUCTION BUCKET (OVERRIDE)</label>
                <select class="form-input" id="editPlayerBucket">
                  <option value="B1" ${p.bucket === 'B1' ? 'selected' : ''}>B1 (B.Tech Yr 1)</option>
                  <option value="B2" ${p.bucket === 'B2' ? 'selected' : ''}>B2 (B.Tech Yr 2)</option>
                  <option value="B3" ${p.bucket === 'B3' ? 'selected' : ''}>B3 (B.Tech Yr 3)</option>
                  <option value="B4" ${p.bucket === 'B4' ? 'selected' : ''}>B4 (B.Tech Yr 4)</option>
                  <option value="D5" ${p.bucket === 'D5' ? 'selected' : ''}>D5 (Diploma)</option>
                  <option value="M6" ${p.bucket === 'M6' ? 'selected' : ''}>M6 (PG)</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">CRICKET ROLE / TYPE</label>
                <input type="text" class="form-input" id="editPlayerRole" value="${p.derivedType || p.role || 'All-Rounder'}">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">MOBILE NUMBER</label>
                <input type="text" class="form-input" id="editPlayerMobile" value="${p.mobile || ''}">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">BASE PRICE (CREDITS)</label>
                <input type="number" class="form-input" id="editPlayerBasePrice" value="${p.basePrice || 60}">
              </div>
              <div class="form-group" style="margin-bottom: 0; grid-column: span 2;">
                <label class="form-label">CRICHEROES PROFILE URL</label>
                <input type="text" class="form-input" id="editPlayerCricHeroes" value="${p.cricHeroesUrl || ''}" placeholder="https://cricheroes.com/...">
              </div>
              <div class="form-group" style="margin-bottom: 0; grid-column: span 2;">
                <label class="form-label">PHOTO URL / BASE64</label>
                <input type="text" class="form-input" id="editPlayerPhoto" value="${p.photo || ''}" placeholder="Photo data URL">
              </div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
              <button class="btn btn-secondary" onclick="closeModal()">CANCEL</button>
              <button class="btn btn-primary" onclick="savePlayerEditModal(${p.id})">SAVE CHANGES</button>
            </div>
          </div>
        </div>
      `;
    }

    function savePlayerEditModal(playerId) {
      const p = players.find(x => x.id == playerId || x.playerId == playerId);
      if (!p) return;

      const newName = (document.getElementById("editPlayerName")?.value || "").trim();
      const newRoll = (document.getElementById("editPlayerRoll")?.value || "").trim().toUpperCase().replace(/\\s+/g, '');
      const newProg = document.getElementById("editPlayerProgram")?.value || p.program;
      const newDept = (document.getElementById("editPlayerDept")?.value || "").trim();
      const newEntry = document.getElementById("editPlayerEntryType")?.value || p.entryType;
      const newYear = document.getElementById("editPlayerYear")?.value || p.year;
      const newBucket = document.getElementById("editPlayerBucket")?.value || p.bucket;
      const newRole = (document.getElementById("editPlayerRole")?.value || "").trim();
      const newMobile = (document.getElementById("editPlayerMobile")?.value || "").trim().replace(/\\D/g, '');
      const newBase = Number(document.getElementById("editPlayerBasePrice")?.value) || p.basePrice;
      const newCH = (document.getElementById("editPlayerCricHeroes")?.value || "").trim();
      const newPhoto = (document.getElementById("editPlayerPhoto")?.value || "").trim() || p.photo;

      if (!newName || !newRoll) {
        showToast("Name and Roll Number cannot be empty", "error");
        return;
      }

      // Check critical fields change
      const criticalChanged = (newRoll !== p.roll) || (newYear !== String(p.year)) || (newProg !== p.program) || (newDept !== p.department) || (newCH !== p.cricHeroesUrl);

      p.name = newName;
      p.roll = newRoll;
      p.rollNumberNormalized = newRoll;
      p.playerId = newRoll;
      p.program = newProg;
      p.department = newDept;
      p.branch = newDept;
      p.entryType = newEntry;
      p.year = newYear;
      p.bucket = newBucket;
      p.derivedType = newRole;
      p.mobile = newMobile;
      p.basePrice = newBase;
      p.cricHeroesUrl = newCH;
      p.photo = newPhoto;
      p.updatedAt = new Date().toISOString();

      if (criticalChanged) {
        p.approvalStatus = 'PENDING_APPROVAL';
        p.verificationStatus = 'PENDING_VERIFICATION';
        p.status = 'PENDING_VERIFICATION';
        p.auctionEligible = false;
        showToast(`Critical verified fields updated. Status reset to PENDING_APPROVAL.`, "warning");
      } else {
        showToast(`Player ${newName} updated successfully.`, "success");
      }

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "PLAYER_EDITED",
        actorUid: currentUser.uid || 'usr_superadmin',
        role: currentUser.role,
        targetId: newRoll,
        timestamp: new Date().toISOString(),
        details: `Player edited by ${currentUser.name}. Critical fields changed: ${criticalChanged}.`
      });

      saveDatabase();
      broadcastAuthoritativeState();
      closeModal();
      renderCurrentView();
    }
"""

if "function openPlayerEditModal" not in content:
    content = content.replace("function adminApprovePlayerGovernance", player_edit_code + "\n    function adminApprovePlayerGovernance")
    print("Injected openPlayerEditModal and savePlayerEditModal")

# 2. Inject live roll and live mobile check functions
live_input_checks = """
    // ========================================================
    // REALTIME CONTINUOUS DEBOUNCED INPUT CHECKS (SECTIONS 14 & 15)
    // ========================================================
    let rollCheckTimer = null;
    function checkLiveRollInput(val) {
      if (rollCheckTimer) clearTimeout(rollCheckTimer);
      const statusEl = document.getElementById("regRollLiveStatus");
      if (!statusEl) return;
      const raw = (val || '').trim();
      const norm = raw.toUpperCase().replace(/\\s+/g, '');
      if (norm.length < 8) {
        statusEl.style.display = "none";
        return;
      }
      statusEl.style.display = "block";
      statusEl.style.color = "var(--color-blue)";
      statusEl.innerHTML = "⏳ CHECKING ROLL NUMBER...";

      rollCheckTimer = setTimeout(() => {
        const existing = players.find(p => p.status !== 'MERGED' && p.status !== 'ARCHIVED' && (p.roll || '').trim().toUpperCase().replace(/\\s+/g, '') === norm);
        if (existing) {
          statusEl.style.color = "var(--color-red)";
          statusEl.innerHTML = `⚠️ ROLL NUMBER ALREADY REGISTERED (${existing.name} - #${existing.id} · ${existing.status || 'ACTIVE'}). Duplicate registration blocked.`;
          const submitBtn = document.getElementById("submitRegBtn");
          if (submitBtn) submitBtn.disabled = true;
        } else {
          statusEl.style.color = "var(--color-green)";
          statusEl.innerHTML = `✓ ROLL NUMBER AVAILABLE (${norm})`;
          const submitBtn = document.getElementById("submitRegBtn");
          if (submitBtn) submitBtn.disabled = false;
        }
      }, 250);
    }

    let mobileCheckTimer = null;
    function checkLiveMobileInput(val) {
      if (mobileCheckTimer) clearTimeout(mobileCheckTimer);
      const statusEl = document.getElementById("regMobileLiveStatus");
      if (!statusEl) return;
      const cleanMob = (val || '').replace(/\\D/g, '');
      if (cleanMob.length < 10) {
        statusEl.style.display = "none";
        return;
      }
      statusEl.style.display = "block";
      statusEl.style.color = "var(--color-blue)";
      statusEl.innerHTML = "⏳ CHECKING MOBILE...";

      mobileCheckTimer = setTimeout(() => {
        const existing = players.find(p => p.status !== 'MERGED' && p.status !== 'ARCHIVED' && p.mobile && p.mobile.replace(/\\D/g, '') === cleanMob);
        if (existing) {
          statusEl.style.color = "var(--color-red)";
          statusEl.innerHTML = `⚠️ MOBILE NUMBER ALREADY REGISTERED (${existing.name} - #${existing.id}). Unique mobile required.`;
          const submitBtn = document.getElementById("submitRegBtn");
          if (submitBtn) submitBtn.disabled = true;
        } else {
          statusEl.style.color = "var(--color-green)";
          statusEl.innerHTML = `✓ MOBILE NUMBER AVAILABLE`;
          const submitBtn = document.getElementById("submitRegBtn");
          if (submitBtn) submitBtn.disabled = false;
        }
      }, 250);
    }
"""

if "function checkLiveRollInput" not in content:
    content = content.replace("function validateRegRollAcademic() {", live_input_checks + "\n    function validateRegRollAcademic() {")
    print("Injected checkLiveRollInput and checkLiveMobileInput")

# 3. Update regRollInput and regMobileInput tags in renderPlayerRegistrationView
content = content.replace(
    'id="regRollInput" value="${regFormData.roll || \'\'}" oninput="regFormData.roll = this.value;" onblur="validateRegRollAcademic()" placeholder="e.g. 24815A0443, 26811A0501" required>',
    'id="regRollInput" value="${regFormData.roll || \'\'}" oninput="regFormData.roll = this.value; checkLiveRollInput(this.value);" onblur="validateRegRollAcademic(); checkLiveRollInput(this.value);" placeholder="e.g. 24815A0443, 26811A0501" required>\n                    <div id="regRollLiveStatus" style="font-size: 0.75rem; font-weight: 700; margin-top: 4px; display: none;"></div>'
)

content = content.replace(
    'id="regMobileInput" value="${regFormData.mobile || \'\'}" oninput="regFormData.mobile = this.value;" placeholder="e.g. 9876543210" required>',
    'id="regMobileInput" value="${regFormData.mobile || \'\'}" oninput="regFormData.mobile = this.value; checkLiveMobileInput(this.value);" onblur="checkLiveMobileInput(this.value);" placeholder="e.g. 9876543210" required>\n                    <div id="regMobileLiveStatus" style="font-size: 0.75rem; font-weight: 700; margin-top: 4px; display: none;"></div>'
)

# 4. In submitPlayerRegistration, ensure approvalStatus = 'PENDING_APPROVAL' and editionId = 'ACC_2026'
content = content.replace(
    '''status: "PENDING_VERIFICATION",
        verificationStatus: "PENDING_VERIFICATION",''',
    '''status: "PENDING_VERIFICATION",
        verificationStatus: "PENDING_VERIFICATION",
        approvalStatus: "PENDING_APPROVAL",
        accountStatus: "NOT_CREATED",
        auctionEligible: false,
        editionId: "ACC_2026",'''
)

# 5. Mask confidential mobile number in public views (Section 43)
content = content.replace(
    '<div style="font-family: var(--font-mono); font-size: 0.75rem;">${p.mobile || \'—\'}</div>',
    '<div style="font-family: var(--font-mono); font-size: 0.75rem;">${(currentUser.role === \'PUBLIC\' || currentUser.role === \'SPECTATOR\') ? (p.mobile ? p.mobile.substring(0, 3) + \'••••\' + p.mobile.substring(7) : \'—\') : (p.mobile || \'—\')}</div>'
)

# 6. Add Dashboard Counters above 11-Tab Sub-Navigation Bar
counters_box = """<!-- REALTIME APPROVAL & GOVERNANCE DASHBOARD COUNTERS (SECTION 46) -->
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
          </div>"""

target_nav_header = '<!-- 11-Tab Sub-Navigation Bar -->'
if target_nav_header in content and "REALTIME APPROVAL & GOVERNANCE DASHBOARD COUNTERS" not in content:
    content = content.replace(target_nav_header, counters_box + "\n\n          " + target_nav_header)
    print("Injected approval counters above sub-nav bar")

with open("B:/projects/ACC/index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Finished applying all governance features to index.html!")

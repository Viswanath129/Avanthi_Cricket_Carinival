import re
import os

with open("B:/projects/ACC/index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add initFreshRegistrationState right after parseRollNumber
fresh_state_func = """
    function initFreshRegistrationState() {
      regFormData = {
        name: "",
        roll: "",
        mobile: "",
        photo: "",
        department: "",
        program: "B.Tech",
        branch: "CSE",
        entryType: "Regular",
        admissionYear: null,
        year: null,
        bucket: "",
        yearDiscrepancy: false,
        discrepancyNote: "",
        isBatter: false,
        battingStyle: "Right Hand",
        battingPosition: "Top Order (1-3)",
        battingArm: "Right Hand",
        isBowler: false,
        bowlingArm: "Right Arm",
        bowlingCategory: "Medium",
        bowlingType: "None",
        bowlingRole: "None",
        isWicketKeeper: false,
        fieldingZone: "Inner Ring",
        preferredFieldingPos: "Cover / Point",
        experienceLevel: "Recreational",
        previousAcc: "First Time ACC",
        cricHeroesUrl: "",
        cricHeroesMobile: "",
        cricHeroesStatus: "PROFILE AVAILABLE",
        basePrice: 80
      };
      regActiveSection = 1;
      window.isSubmittingRegistration = false;
      return regFormData;
    }
"""

if "function initFreshRegistrationState" not in content:
    target = "    let regFormData = {"
    content = content.replace(target, fresh_state_func + "\n    let regFormData = {", 1)

# 2. Update switchView to call initFreshRegistrationState when entering 'register'
switch_view_target = """    function switchView(viewName) {
      // STRICT ROUTE GUARDS"""
switch_view_replacement = """    function switchView(viewName) {
      if (viewName === "register" && !window.isEditingRegistration) {
        initFreshRegistrationState();
      }
      // STRICT ROUTE GUARDS"""
content = content.replace(switch_view_target, switch_view_replacement, 1)

# 3. Update submit button in registration form to have id="submitRegBtn"
content = re.sub(
    r'<button type="button" class="btn btn-primary" style="min-height: 48px; padding: 10px 32px; font-size: 0\.9375rem;" onclick="submitPlayerRegistration\(\)">',
    r'<button type="button" id="submitRegBtn" class="btn btn-primary" style="min-height: 48px; padding: 10px 32px; font-size: 0.9375rem;" onclick="submitPlayerRegistration()">',
    content
)

# 4. In registration view: ensure bucket items have pointer-events: none and display AUTO-DERIVED (LOCKED)
content = content.replace(
    'AUTO CLASSIFIED (LOCKED)',
    'AUTO-DERIVED (LOCKED)'
)

# 5. Fix franchise select ID in handleLoginSubmit
content = content.replace(
    'const fSelect = document.getElementById("loginFranchiseId");',
    'const fSelect = document.getElementById("loginFranchiseSelect") || document.getElementById("loginFranchiseId");'
)

# 6. Replace submitPlayerRegistration and add exportPlayersCSV, exportSquadsCSV, and Admin modals
reg_and_admin_helpers = """    function submitPlayerRegistration() {
      if (window.isSubmittingRegistration) return;
      if (!regFormData.name || !regFormData.roll) {
        showToast("Please provide name and roll number in Section 1", "error");
        return;
      }

      // 1. CANONICAL ROLL NUMBER NORMALIZATION
      const normalizedRoll = regFormData.roll.trim().toUpperCase().replace(/\\s+/g, '');
      if (!normalizedRoll) {
        showToast("Valid college roll number is required", "error");
        return;
      }

      // 2. MOBILE NUMBER NORMALIZATION
      const rawMobile = (regFormData.mobile || "").trim();
      const normalizedMobile = rawMobile.replace(/\\D/g, '');
      if (!normalizedMobile || normalizedMobile.length < 10) {
        showToast("A valid 10-digit mobile number is required", "error");
        return;
      }

      // 3. CHECK DUPLICATE ROLL NUMBER (ONE PLAYER = ONE CANONICAL RECORD)
      const existingPlayerByRoll = players.find(p => (p.roll || "").trim().toUpperCase().replace(/\\s+/g, '') === normalizedRoll);
      if (existingPlayerByRoll) {
        showToast(`PLAYER ALREADY REGISTERED: Roll ${normalizedRoll} is already registered (#${existingPlayerByRoll.id})`, "error");
        return;
      }

      // 4. CHECK DUPLICATE MOBILE NUMBER
      const existingPlayerByMobile = players.find(p => p.mobile && p.mobile.replace(/\\D/g, '') === normalizedMobile);
      if (existingPlayerByMobile) {
        showToast(`MOBILE ALREADY REGISTERED: ${normalizedMobile} is already attached to ${existingPlayerByMobile.name}`, "error");
        return;
      }

      // 5. PARSE & AUTO-DERIVE ACADEMIC ATTRIBUTES (SERVER-AUTHORITATIVE)
      const parsed = parseRollNumber(normalizedRoll);
      const derivedYear = parsed.valid ? parsed.year : (Number(regFormData.year) || 1);
      const derivedBucket = parsed.valid ? parsed.bucket : (regFormData.bucket || 'B1');
      const derivedProgram = parsed.valid ? parsed.program : (regFormData.program || 'B.Tech');
      const derivedBranch = parsed.valid ? parsed.branch : (regFormData.branch || 'CSE');
      const derivedEntry = parsed.valid ? parsed.entryType : (regFormData.entryType || 'Regular');
      const derived = derivePlayerType(regFormData);
      const isDiscrepancy = !!regFormData.yearDiscrepancy;

      // 6. IMMEDIATE BUTTON LOCKOUT (PREVENT RAPID DOUBLE-CLICKS)
      window.isSubmittingRegistration = true;
      const submitBtn = document.getElementById("submitRegBtn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "SUBMITTING...";
      }

      const clientActionId = 'reg_' + normalizedRoll + '_' + Date.now();
      const newPlayerId = players.length > 0 ? Math.max(...players.map(p => p.id || 0)) + 1 : 1;

      const newPlayer = {
        id: newPlayerId,
        playerId: normalizedRoll,
        name: regFormData.name.trim(),
        roll: normalizedRoll,
        rollNumberNormalized: normalizedRoll,
        mobile: normalizedMobile,
        program: derivedProgram,
        branch: derivedBranch,
        department: regFormData.department || derivedBranch,
        entryType: derivedEntry,
        admissionYear: parsed.admissionYear || (2026 - derivedYear + 1),
        year: String(derivedYear),
        bucket: derivedBucket,
        derivedType: derived,
        battingStyle: regFormData.battingStyle || "Right Hand",
        battingPosition: regFormData.battingPosition || "Top Order (1-3)",
        battingArm: regFormData.battingArm || "Right Hand",
        bowlingArm: regFormData.bowlingArm || "Right Arm",
        bowlingCategory: regFormData.bowlingCategory || "Medium",
        bowlingType: regFormData.bowlingType || "None",
        bowlingRole: regFormData.bowlingRole || "None",
        isWicketKeeper: !!regFormData.isWicketKeeper,
        basePrice: Number(regFormData.basePrice) || 80,
        status: isDiscrepancy ? "PENDING_REVIEW" : "AVAILABLE",
        discrepancy: isDiscrepancy,
        discrepancyNote: isDiscrepancy ? (regFormData.discrepancyNote || "Student flagged year discrepancy during registration") : "",
        cricHeroesUrl: regFormData.cricHeroesUrl || "",
        cricHeroesMobile: regFormData.cricHeroesMobile || "",
        cricHeroesStatus: regFormData.cricHeroesStatus || "PROFILE AVAILABLE",
        paymentStatus: "PAID",
        photo: regFormData.photo || "",
        clientActionId: clientActionId,
        createdAt: new Date().toISOString(),
        bio: `Registered player from ${derivedBranch}, Year ${derivedYear}.`
      };

      players.push(newPlayer);

      // Firestore persistence if connected
      if (fbDb) {
        try {
          fbDb.collection("players").doc(normalizedRoll).set(newPlayer, { merge: true }).catch(err => {
            console.warn("Firestore player save notice:", err);
          });
          fbDb.collection("playerUniqueKeys").doc("roll_" + normalizedRoll).set({ playerId: normalizedRoll, createdAt: new Date().toISOString() }).catch(() => {});
          fbDb.collection("playerUniqueKeys").doc("mobile_" + normalizedMobile).set({ playerId: normalizedRoll, createdAt: new Date().toISOString() }).catch(() => {});
        } catch(e) {}
      }

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "PLAYER REGISTERED",
        details: `${newPlayer.name} (${newPlayer.roll}, ${newPlayer.bucket}, Base: ${newPlayer.basePrice}C) registered. Status: ${newPlayer.status}`,
        actorRole: "PLAYER",
        actorUid: "reg_" + normalizedRoll
      });

      saveDatabase();
      broadcastAuthoritativeState();

      // Reset form state cleanly so subsequent player registrations start blank
      initFreshRegistrationState();

      if (isDiscrepancy) {
        showToast("Registration submitted with Year Discrepancy flag. Forwarded to Super Admin Review Queue.", "warning");
      } else {
        showToast("Registration completed! Official Player Auction Pass generated.", "success");
      }

      showSpeeder("REGISTRATION COMPLETE", `${newPlayer.name} enrolled into ACC 2026 (#${newPlayer.id})`, 1000);
      setTimeout(() => {
        switchView("player");
        openPlayerPassModal(newPlayer.id);
      }, 700);
    }

    function exportPlayersCSV() {
      let csv = "ID,Name,Roll,Program,Branch,Department,Year,Bucket,Role,BasePrice,Status,Discrepancy,Mobile,CricHeroes\\n";
      players.forEach(p => {
        csv += `"${p.id}","${(p.name || '').replace(/"/g, '""')}","${p.roll || ''}","${p.program || ''}","${p.branch || ''}","${p.department || ''}","${p.year || ''}","${p.bucket || ''}","${p.derivedType || ''}","${p.basePrice || 0}","${p.status || ''}","${p.discrepancy ? 'YES' : 'NO'}","${currentUser.role === 'SUPER_ADMIN' ? (p.mobile || '') : 'REDACTED'}","${(p.cricHeroesUrl || '').replace(/"/g, '""')}"\\n`;
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ACC_PLAYERS_MASTER_${Date.now()}.csv`;
      a.click();
      showToast("Master Player Register CSV Exported", "success");
    }

    function exportSquadsCSV() {
      let csv = "FranchiseID,FranchiseName,PurseRemaining,SquadCount,PlayerID,PlayerName,Bucket,PurchasePrice\\n";
      franchises.forEach(f => {
        if (f.squad.length === 0) {
          csv += `"${f.id}","${f.name}","${f.purse}","0","","","",""\\n`;
        } else {
          f.squad.forEach(p => {
            csv += `"${f.id}","${f.name}","${f.purse}","${f.squad.length}","${p.id}","${(p.name || '').replace(/"/g, '""')}","${p.bucket || ''}","${p.soldPrice || p.basePrice || 0}"\\n`;
          });
        }
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ACC_SQUADS_BREAKDOWN_${Date.now()}.csv`;
      a.click();
      showToast("Franchise Squads CSV Exported", "success");
    }

    function openPlayerDetailModal(playerId) {
      const p = players.find(item => item.id === playerId);
      if (!p) return;
      const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
      const m = document.getElementById("modalContainer");
      m.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6); max-width: 640px; max-height: 90vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
              <div>
                <span class="status-badge ${p.status === 'SOLD' ? 'status-connected' : p.status === 'AVAILABLE' ? 'status-live' : 'status-blocked'}">${p.status}</span>
                <h3 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: var(--text-bright); margin-top: 4px;">
                  PLAYER DOSSIER #${p.id}: ${p.name}
                </h3>
              </div>
              <button class="btn btn-secondary" onclick="closeModal()" style="padding: 4px 10px;">&times;</button>
            </div>

            <div style="display: grid; grid-template-columns: 120px 1fr; gap: 16px; align-items: start; margin-bottom: 16px;">
              ${getPlayerAvatar(p, 120, 150)}
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-bright);">${p.name}</div>
                <div class="font-mono" style="font-size: 0.8125rem; color: var(--color-green);">Roll: ${p.roll}</div>
                <div style="font-size: 0.8125rem; color: var(--text-muted);">Dept: ${p.department || p.branch} · Program: ${p.program}</div>
                <div style="font-size: 0.8125rem; color: var(--text-muted);">Entry: ${p.entryType || 'Regular'} · Admission: ${p.admissionYear || '—'}</div>
                <div style="font-size: 0.8125rem; color: var(--text-muted);">Role: <strong>${p.derivedType || 'BATTER'}</strong> · Base Price: <strong>${p.basePrice}C</strong></div>
                ${p.cricHeroesUrl ? `<div style="font-size: 0.75rem;"><a href="${p.cricHeroesUrl}" target="_blank" style="color: var(--color-blue); text-decoration: underline;">View CricHeroes Profile &rarr;</a></div>` : ''}
                ${isSuperAdmin && p.mobile ? `<div class="font-mono" style="font-size: 0.75rem; color: var(--text-faint);">Confidential Mobile: ${p.mobile}</div>` : ''}
              </div>
            </div>

            <!-- Academic Readout & Status -->
            <div style="background: var(--surface-2); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span class="label-micro" style="color: var(--color-green); margin: 0;">ACADEMIC CLASSIFICATION (AUTO-DERIVED)</span>
                <span class="status-badge status-connected" style="font-size: 0.65rem;">LOCKED</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center;">
                <div class="surface-subtle" style="padding: 6px;">
                  <span class="label-micro" style="font-size: 0.6rem;">STUDY YEAR</span>
                  <div style="font-weight: 800; color: var(--text-bright);">Year ${p.year}</div>
                </div>
                <div class="surface-subtle" style="padding: 6px;">
                  <span class="label-micro" style="font-size: 0.6rem;">BUCKET</span>
                  <div style="font-weight: 800; color: var(--color-green); font-size: 1.1rem;">${p.bucket}</div>
                </div>
                <div class="surface-subtle" style="padding: 6px;">
                  <span class="label-micro" style="font-size: 0.6rem;">DISCREPANCY</span>
                  <div style="font-weight: 700; color: ${p.discrepancy ? 'var(--color-orange)' : 'var(--text-muted)'};">${p.discrepancy ? 'FLAGGED' : 'NONE'}</div>
                </div>
              </div>
              ${p.discrepancyNote ? `<div style="font-size: 0.75rem; color: var(--color-orange); margin-top: 8px;">Note: ${p.discrepancyNote}</div>` : ''}
              ${p.overrideHistory ? `
                <div style="font-size: 0.7rem; color: var(--color-blue); margin-top: 8px; border-top: 1px dashed var(--border-subtle); padding-top: 6px;">
                  Previous Override: ${p.overrideHistory}
                </div>
              ` : ''}
            </div>

            <!-- Super Admin Override Form -->
            ${isSuperAdmin ? `
              <div style="background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 16px;">
                <div class="label-micro" style="color: var(--color-orange); margin-bottom: 6px;">SUPER ADMIN CLASSIFICATION OVERRIDE</div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px;">
                  Use this override exclusively for detained students or approved academic reconciliations. An immutable audit record will be logged.
                </p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                  <div class="form-group" style="margin: 0;">
                    <label class="form-label" style="font-size: 0.7rem;">OVERRIDE STUDY YEAR</label>
                    <select class="form-select" id="overrideYearSelect" style="font-size: 0.8125rem;">
                      <option value="1" ${p.year == '1' ? 'selected' : ''}>Year 1</option>
                      <option value="2" ${p.year == '2' ? 'selected' : ''}>Year 2</option>
                      <option value="3" ${p.year == '3' ? 'selected' : ''}>Year 3</option>
                      <option value="4" ${p.year == '4' ? 'selected' : ''}>Year 4</option>
                    </select>
                  </div>
                  <div class="form-group" style="margin: 0;">
                    <label class="form-label" style="font-size: 0.7rem;">OVERRIDE BUCKET</label>
                    <select class="form-select" id="overrideBucketSelect" style="font-size: 0.8125rem;">
                      <option value="B1" ${p.bucket === 'B1' ? 'selected' : ''}>B1 (Year 1)</option>
                      <option value="B2" ${p.bucket === 'B2' ? 'selected' : ''}>B2 (Year 2)</option>
                      <option value="B3" ${p.bucket === 'B3' ? 'selected' : ''}>B3 (Year 3)</option>
                      <option value="B4" ${p.bucket === 'B4' ? 'selected' : ''}>B4 (Year 4)</option>
                      <option value="D5" ${p.bucket === 'D5' ? 'selected' : ''}>D5 (Diploma)</option>
                      <option value="M6" ${p.bucket === 'M6' ? 'selected' : ''}>M6 (PG)</option>
                    </select>
                  </div>
                </div>
                <div class="form-group" style="margin-bottom: 10px;">
                  <label class="form-label" style="font-size: 0.7rem;">REASON FOR OVERRIDE (MANDATORY AUDIT NOTE)</label>
                  <input type="text" class="form-input" id="overrideReasonInput" placeholder="e.g. Detained in 2nd year per Academic Directorate letter #428" style="font-size: 0.8125rem;" required>
                </div>
                <div style="display: flex; justify-content: flex-end;">
                  <button class="btn btn-primary" onclick="savePlayerOverride(${p.id})" style="font-size: 0.8125rem; padding: 8px 16px;">
                    CONFIRM & AUDIT OVERRIDE
                  </button>
                </div>
              </div>
            ` : ''}

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
              <button class="btn btn-secondary" onclick="closeModal()">CLOSE</button>
              ${p.status === 'PENDING_REVIEW' && isSuperAdmin ? `
                <button class="btn btn-primary" onclick="verifyAndApprovePlayer(${p.id})">APPROVE & VERIFY PLAYER</button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }

    function savePlayerOverride(playerId) {
      if (currentUser.role !== 'SUPER_ADMIN') {
        showToast("Classification override is strictly reserved for Super Admin", "error");
        return;
      }
      const p = players.find(item => item.id === playerId);
      if (!p) return;
      const yearSelect = document.getElementById("overrideYearSelect");
      const bucketSelect = document.getElementById("overrideBucketSelect");
      const reasonInput = document.getElementById("overrideReasonInput");
      if (!yearSelect || !bucketSelect || !reasonInput) return;

      const newYear = yearSelect.value;
      const newBucket = bucketSelect.value;
      const reason = reasonInput.value.trim();

      if (!reason) {
        showToast("Mandatory audit reason is required for Super Admin override", "warning");
        return;
      }

      const oldYear = p.year;
      const oldBucket = p.bucket;

      p.year = newYear;
      p.bucket = newBucket;
      p.discrepancy = false;
      p.status = p.status === 'PENDING_REVIEW' ? 'AVAILABLE' : p.status;
      p.overrideHistory = `Overridden by Super Admin (${currentUser.username}) on ${new Date().toLocaleDateString()}: Year ${oldYear}->${newYear}, Bucket ${oldBucket}->${newBucket}. Reason: ${reason}`;

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "SUPER ADMIN OVERRIDE",
        details: `Player #${p.id} (${p.name}, Roll: ${p.roll}) overridden: Year ${oldYear}->${newYear}, Bucket ${oldBucket}->${newBucket}. Reason: ${reason}`,
        actorRole: "SUPER_ADMIN",
        actorUid: currentUser.username || currentUser.email
      });

      saveDatabase();
      broadcastAuthoritativeState();
      closeModal();
      showToast(`Player #${p.id} classification overridden & audited`, "success");
      renderCurrentView();
    }

    function verifyAndApprovePlayer(playerId) {
      const p = players.find(item => item.id === playerId);
      if (!p) return;
      p.status = 'AVAILABLE';
      p.discrepancy = false;
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "PLAYER VERIFIED",
        details: `Player #${p.id} (${p.name}, ${p.roll}) verified and approved into auction lot pool`,
        actorRole: currentUser.role,
        actorUid: currentUser.username
      });
      saveDatabase();
      broadcastAuthoritativeState();
      closeModal();
      showToast(`Player #${p.id} verified and available for auction`, "success");
      renderCurrentView();
    }

    function openEditFranchiseOfficialsModal(franchiseId) {
      const f = franchises.find(item => item.id === franchiseId);
      if (!f) return;
      const coordUser = users.find(u => u.franchiseId === f.id && u.identityType === 'COORDINATOR');
      const leadUser = users.find(u => u.franchiseId === f.id && u.identityType === 'TEAM_LEADER');
      const m = document.getElementById("modalContainer");
      m.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6); max-width: 540px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                ${getTeamEmblem(f.id, 32)}
                <div>
                  <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-bright); margin: 0;">
                    MANAGE ${f.name.toUpperCase()} OFFICIALS
                  </h3>
                  <div class="label-micro" style="color: var(--color-green);">FRANCHISE ID: ${f.id} · PURSE: ${f.purse}C</div>
                </div>
              </div>
              <button class="btn btn-secondary" onclick="closeModal()" style="padding: 4px 10px;">&times;</button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 14px;">
              <!-- Coordinator -->
              <div style="background: var(--surface-2); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div class="label-micro" style="color: var(--color-green); margin-bottom: 6px;">FACULTY COORDINATOR (OWNER ACCOUNT)</div>
                <div class="form-group" style="margin-bottom: 8px;">
                  <label class="form-label" style="font-size: 0.7rem;">COORDINATOR FULL NAME</label>
                  <input type="text" class="form-input" id="editCoordName" value="${coordUser ? coordUser.name : 'Faculty Coordinator'}" style="font-size: 0.8125rem;">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label" style="font-size: 0.7rem;">OFFICIAL EMAIL</label>
                  <input type="email" class="form-input" id="editCoordEmail" value="${coordUser ? (coordUser.email || '') : ''}" placeholder="coordinator@acc.edu" style="font-size: 0.8125rem;">
                </div>
              </div>

              <!-- Team Leader -->
              <div style="background: var(--surface-2); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div class="label-micro" style="color: var(--color-blue); margin-bottom: 6px;">TEAM CAPTAIN / LEADER</div>
                <div class="form-group" style="margin-bottom: 8px;">
                  <label class="form-label" style="font-size: 0.7rem;">CAPTAIN FULL NAME</label>
                  <input type="text" class="form-input" id="editLeadName" value="${leadUser ? leadUser.name : 'Team Captain'}" style="font-size: 0.8125rem;">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label" style="font-size: 0.7rem;">CAPTAIN EMAIL / MOBILE</label>
                  <input type="text" class="form-input" id="editLeadEmail" value="${leadUser ? (leadUser.email || '') : ''}" placeholder="captain@acc.edu" style="font-size: 0.8125rem;">
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
              <button class="btn btn-secondary" onclick="closeModal()">CANCEL</button>
              <button class="btn btn-primary" onclick="saveFranchiseOfficials(${f.id})">SAVE CHANGES</button>
            </div>
          </div>
        </div>
      `;
    }

    function saveFranchiseOfficials(franchiseId) {
      const f = franchises.find(item => item.id === franchiseId);
      if (!f) return;
      const coordName = document.getElementById("editCoordName")?.value.trim();
      const coordEmail = document.getElementById("editCoordEmail")?.value.trim();
      const leadName = document.getElementById("editLeadName")?.value.trim();
      const leadEmail = document.getElementById("editLeadEmail")?.value.trim();

      let coordUser = users.find(u => u.franchiseId === f.id && u.identityType === 'COORDINATOR');
      if (coordUser) {
        if (coordName) coordUser.name = coordName;
        if (coordEmail) coordUser.email = coordEmail;
      }
      let leadUser = users.find(u => u.franchiseId === f.id && u.identityType === 'TEAM_LEADER');
      if (leadUser) {
        if (leadName) leadUser.name = leadName;
        if (leadEmail) leadUser.email = leadEmail;
      }

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "FRANCHISE OFFICIALS UPDATED",
        details: `${f.name} officials updated by ${currentUser.name}. Coord: ${coordName}, Lead: ${leadName}`,
        actorRole: currentUser.role,
        actorUid: currentUser.username
      });

      saveDatabase();
      broadcastAuthoritativeState();
      closeModal();
      showToast(`${f.name} leadership accounts updated`, "success");
      renderCurrentView();
    }

    function openCreateAdminModal() {
      const m = document.getElementById("modalContainer");
      m.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation();" style="padding: var(--space-6); max-width: 480px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
              <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-bright); margin: 0;">
                PROVISION ADMIN / HANDLER
              </h3>
              <button class="btn btn-secondary" onclick="closeModal()" style="padding: 4px 10px;">&times;</button>
            </div>
            <form onsubmit="handleCreateAdminSubmit(event)" style="display: flex; flex-direction: column; gap: 12px;">
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 0.75rem;">ADMIN FULL NAME</label>
                <input type="text" class="form-input" id="newAdminName" placeholder="e.g. Rahul Sharma" required>
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 0.75rem;">OFFICIAL EMAIL</label>
                <input type="email" class="form-input" id="newAdminEmail" placeholder="e.g. rahul@acc.edu" required>
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 0.75rem;">MOBILE NUMBER</label>
                <input type="tel" class="form-input" id="newAdminMobile" placeholder="e.g. 9876543210" required>
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 0.75rem;">LOGIN USERNAME</label>
                <input type="text" class="form-input" id="newAdminUsername" placeholder="e.g. admin_rahul" required>
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 0.75rem;">PASSWORD</label>
                <input type="password" class="form-input" id="newAdminPass" placeholder="••••••••" required>
              </div>
              <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">CANCEL</button>
                <button type="submit" class="btn btn-primary">CREATE ACCOUNT</button>
              </div>
            </form>
          </div>
        </div>
      `;
    }

    function handleCreateAdminSubmit(e) {
      e.preventDefault();
      const name = document.getElementById("newAdminName")?.value.trim();
      const email = document.getElementById("newAdminEmail")?.value.trim();
      const mobile = document.getElementById("newAdminMobile")?.value.trim();
      const username = document.getElementById("newAdminUsername")?.value.trim();
      const pass = document.getElementById("newAdminPass")?.value.trim();

      if (!name || !email || !username || !pass) return;

      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        showToast("Username already exists", "error");
        return;
      }

      const newAdmin = {
        username: username,
        passwordHash: pass,
        role: "ADMIN",
        name: name,
        email: email,
        mobile: mobile,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        lastActive: "Never"
      };

      users.push(newAdmin);
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "ADMIN CREATED",
        details: `Admin ${name} (${username}, ${email}) provisioned by Super Admin`,
        actorRole: "SUPER_ADMIN",
        actorUid: currentUser.username
      });

      saveDatabase();
      closeModal();
      showToast(`Admin account ${username} created successfully`, "success");
      renderCurrentView();
    }

    function toggleAdminStatus(username) {
      const target = users.find(u => u.username === username);
      if (!target) return;
      if (target.role === 'SUPER_ADMIN') {
        showToast("Super Admin status cannot be toggled", "error");
        return;
      }
      target.status = target.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: target.status === 'LOCKED' ? "ADMIN DISABLED" : "ADMIN ENABLED",
        details: `Admin ${target.name} (${target.username}) status set to ${target.status}`,
        actorRole: "SUPER_ADMIN",
        actorUid: currentUser.username
      });
      saveDatabase();
      showToast(`Admin ${target.username} ${target.status === 'LOCKED' ? 'disabled' : 'enabled'}`, "info");
      renderCurrentView();
    }

    function deleteAdminAccount(username) {
      const target = users.find(u => u.username === username);
      if (!target) return;
      if (target.role === 'SUPER_ADMIN') {
        showToast("Super Admin account cannot be deleted", "error");
        return;
      }
      if (!confirm(`Are you sure you want to permanently delete Admin account ${target.name} (${username})?`)) return;

      const idx = users.findIndex(u => u.username === username);
      if (idx !== -1) {
        users.splice(idx, 1);
        auditLog.unshift({
          time: new Date().toLocaleTimeString(),
          action: "ADMIN DELETED",
          details: `Admin account ${target.name} (${username}) deleted by Super Admin`,
          actorRole: "SUPER_ADMIN",
          actorUid: currentUser.username
        });
        saveDatabase();
        showToast(`Admin ${username} deleted`, "info");
        renderCurrentView();
      }
    }

    function loadPlayerToLot(playerId) {
      const pIndex = players.findIndex(p => p.id === playerId);
      if (pIndex === -1) return;
      lotIndex = pIndex;
      currentBid = players[lotIndex].basePrice || 80;
      leadingBidderId = null;
      timerMode = 'FIRST_BID';
      timerSeconds = 30;
      const sOffset = (window.RealtimeStore && window.RealtimeStore.state.connection.serverTimeOffset) || 0;
      timerDeadline = Date.now() + sOffset + 30000;
      timerRunning = false;
      passedFranchiseIds = [];
      adminNavTab = 'AUCTION';
      saveDatabase();
      broadcastAuthoritativeState();
      showToast(`Loaded #${players[lotIndex].id} ${players[lotIndex].name} to live lot`, "success");
      renderCurrentView();
    }
"""

# Replace submitPlayerRegistration through exportAuditLogCSV with updated functions
old_submit_start = "    function submitPlayerRegistration() {"
old_export_end = "showToast(\"Master Audit Log CSV Exported\", \"success\");\n    }"

old_slice_start = content.find(old_submit_start)
old_slice_end = content.find(old_export_end) + len(old_export_end)

if old_slice_start != -1 and old_slice_end != -1:
    content = content[:old_slice_start] + reg_and_admin_helpers + "\n\n    " + content[content.find("function exportAuditLogCSV()"):old_slice_end] + content[old_slice_end:]

# 7. Replace renderAdminConsoleView with the complete 11-Tab Super Admin Control Center
new_admin_console_view = """    function renderAdminConsoleView() {
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

      // Filtering for PLAYERS tab
      let filteredPlayers = players.filter(p => {
        if (playerBucketFilter !== 'ALL' && p.bucket !== playerBucketFilter) return false;
        if (playerStatusFilter !== 'ALL' && p.status !== playerStatusFilter) return false;
        if (playerDeptFilter !== 'ALL' && (p.department || p.branch) !== playerDeptFilter) return false;
        if (playerSearchQuery) {
          const q = playerSearchQuery.toLowerCase();
          return (p.name || '').toLowerCase().includes(q) || (p.roll || '').toLowerCase().includes(q);
        }
        return true;
      });

      const navTabs = ['OVERVIEW', 'TEAMS', 'PLAYERS', 'REGISTRATIONS', 'AUCTION', 'ROUND 2', 'UNDO', 'AUDIT', 'EXPORT', 'SETTINGS', 'ADMIN ACCOUNTS'];

      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-5);">
          
          <!-- Master Control Center Header Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="status-badge ${isSuperAdmin ? 'status-connected' : 'status-live'}">${isSuperAdmin ? 'SUPER ADMIN CONTROL CENTER' : 'AUCTION FLOOR OPERATOR'}</span>
                <span class="label-micro" style="color: var(--color-green);">ACC 2026 SOVEREIGN DESK</span>
              </div>
              <h2 class="section-title" style="margin-top: 2px;">GOVERNANCE & OPERATIONAL SUITE</h2>
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
              <span><strong>OPERATOR DESK:</strong> You have live floor hammer & execution authority. Tournament configuration, franchise account administration, and classification overrides are reserved for the Super Admin.</span>
              <span class="status-badge status-live" style="font-size: 0.625rem;">OPERATOR</span>
            </div>
          ` : ''}

          <!-- 11-Tab Sub-Navigation Bar -->
          <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; border-bottom: 1px solid var(--border-medium);">
            ${navTabs.map(tab => {
              if (!isSuperAdmin && (tab === 'SETTINGS' || tab === 'ADMIN ACCOUNTS')) return '';
              const isActive = adminNavTab === tab;
              return `
                <button type="button" class="btn ${isActive ? 'btn-primary' : 'btn-secondary'}" 
                  style="padding: 8px 14px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; border-radius: var(--radius-sm);"
                  onclick="adminNavTab = '${tab}'; renderCurrentView();">
                  ${tab}
                </button>
              `;
            }).join('')}
          </div>

          <!-- ================= TAB CONTENT ================= -->

          ${adminNavTab === 'AUCTION' ? `
            <!-- TAB: AUCTION CONTROLS & DESK -->
            <div style="display: flex; flex-direction: column; gap: var(--space-5);">
              
              <!-- Telemetry Bar -->
              <div class="surface-card" style="padding: var(--space-4); border-left: 3px solid var(--color-green);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                  <span class="label-micro" style="color: var(--color-green); margin: 0;">REALTIME TELEMETRY MONITOR (DEDUPLICATED)</span>
                  <span class="status-badge status-connected" style="font-size: 0.65rem;">FIREBASE RTDB ACTIVE</span>
                </div>
                <div class="admin-telemetry-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
                  <div style="background: var(--surface-2); padding: 8px 12px; border-radius: 6px;">
                    <div class="label-micro" style="font-size: 0.65rem; color: var(--text-muted);">LIVE USERS</div>
                    <div class="font-mono" style="font-size: 1.3rem; font-weight: 800; color: var(--text-bright);">${(window.RealtimeStore && window.RealtimeStore.state.presence.liveUsers) || liveUsersCount}</div>
                  </div>
                  <div style="background: var(--surface-2); padding: 8px 12px; border-radius: 6px;">
                    <div class="label-micro" style="font-size: 0.65rem; color: var(--color-orange);">ACTIVE FRANCHISES</div>
                    <div class="font-mono" style="font-size: 1.3rem; font-weight: 800; color: var(--color-orange);">${(window.RealtimeStore && window.RealtimeStore.state.presence.activeFranchises) || 0} / 11</div>
                  </div>
                  <div style="background: var(--surface-2); padding: 8px 12px; border-radius: 6px;">
                    <div class="label-micro" style="font-size: 0.65rem; color: var(--color-blue);">ACTIVE TEAM LEADS</div>
                    <div class="font-mono" style="font-size: 1.3rem; font-weight: 800; color: var(--color-blue);">${(window.RealtimeStore && window.RealtimeStore.state.presence.activeTeamLeads) || 0}</div>
                  </div>
                  <div style="background: var(--surface-2); padding: 8px 12px; border-radius: 6px;">
                    <div class="label-micro" style="font-size: 0.65rem; color: var(--color-purple);">ACTIVE PLAYERS</div>
                    <div class="font-mono" style="font-size: 1.3rem; font-weight: 800; color: var(--color-purple);">${(window.RealtimeStore && window.RealtimeStore.state.presence.activePlayers) || 0}</div>
                  </div>
                  <div style="background: var(--surface-2); padding: 8px 12px; border-radius: 6px;">
                    <div class="label-micro" style="font-size: 0.65rem; color: var(--text-subtle);">PUBLIC VIEWERS</div>
                    <div class="font-mono" style="font-size: 1.3rem; font-weight: 800; color: var(--text-muted);">${(window.RealtimeStore && window.RealtimeStore.state.presence.publicViewers) || 1}</div>
                  </div>
                </div>
              </div>

              <!-- Current Lot Operational Arena -->
              <div class="responsive-split-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-5);">
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
                      <h3 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: var(--text-bright);">${cur.name}</h3>
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

                <!-- Current Bid & Direct Injection -->
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

            </div>
          ` : adminNavTab === 'OVERVIEW' ? `
            <!-- TAB: OVERVIEW & TOURNAMENT KPI -->
            <div style="display: flex; flex-direction: column; gap: var(--space-5);">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                <div class="surface-card" style="padding: 16px;">
                  <span class="label-micro" style="color: var(--color-green);">TOTAL REGISTERED</span>
                  <div class="font-mono" style="font-size: 2rem; font-weight: 800; color: var(--text-bright);">${players.length}</div>
                </div>
                <div class="surface-card" style="padding: 16px;">
                  <span class="label-micro" style="color: var(--color-blue);">AVAILABLE LOTS</span>
                  <div class="font-mono" style="font-size: 2rem; font-weight: 800; color: var(--color-blue);">${players.filter(p => p.status === 'AVAILABLE').length}</div>
                </div>
                <div class="surface-card" style="padding: 16px;">
                  <span class="label-micro" style="color: var(--color-green);">PLAYERS SOLD</span>
                  <div class="font-mono" style="font-size: 2rem; font-weight: 800; color: var(--color-green);">${players.filter(p => p.status === 'SOLD').length}</div>
                </div>
                <div class="surface-card" style="padding: 16px;">
                  <span class="label-micro" style="color: var(--color-red);">UNSOLD (ROUND 2)</span>
                  <div class="font-mono" style="font-size: 2rem; font-weight: 800; color: var(--color-red);">${players.filter(p => p.status === 'UNSOLD').length}</div>
                </div>
                <div class="surface-card" style="padding: 16px;">
                  <span class="label-micro" style="color: var(--color-orange);">REMAINING PURSE</span>
                  <div class="font-mono" style="font-size: 2rem; font-weight: 800; color: var(--color-orange);">${franchises.reduce((sum, f) => sum + f.purse, 0)} C</div>
                </div>
              </div>

              <!-- Bucket Scarcity Status -->
              <div class="surface-card" style="padding: var(--space-5);">
                <span class="label-micro" style="color: var(--color-green);">BUCKET SCARCITY & MANDATORY QUOTAS</span>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-top: 10px;">
                  ${['B1', 'B2', 'B3', 'B4', 'D5', 'M6'].map(b => {
                    const avail = players.filter(p => p.bucket === b && p.status === 'AVAILABLE').length;
                    const sold = players.filter(p => p.bucket === b && p.status === 'SOLD').length;
                    return `
                      <div style="background: var(--surface-2); padding: 12px; border-radius: 6px; text-align: center;">
                        <div style="font-weight: 800; font-size: 1.2rem; color: var(--color-green);">${b}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Available: <strong>${avail}</strong></div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Sold: <strong>${sold}</strong></div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          ` : adminNavTab === 'TEAMS' ? `
            <!-- TAB: TEAMS MANAGEMENT (ALL 11 FRANCHISES) -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-bright); margin: 0;">
                    11 FRANCHISES DIRECTORY & OFFICIALS
                  </h3>
                  <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
                    Manage team leadership, view squad rosters, reset credentials, and govern franchise workspaces.
                  </div>
                </div>
              </div>

              <div class="surface-card" style="padding: 0; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem;">
                  <thead>
                    <tr style="background: var(--surface-2); border-bottom: 1px solid var(--border-medium); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">
                      <th style="padding: 12px 16px;">Franchise</th>
                      <th style="padding: 12px 16px;">Purse Remaining</th>
                      <th style="padding: 12px 16px;">Squad Slots</th>
                      <th style="padding: 12px 16px;">Faculty Coordinator</th>
                      <th style="padding: 12px 16px;">Team Captain</th>
                      <th style="padding: 12px 16px;">Workspace</th>
                      <th style="padding: 12px 16px; text-align: right;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${franchises.map(f => {
                      const coord = users.find(u => u.franchiseId === f.id && u.identityType === 'COORDINATOR');
                      const lead = users.find(u => u.franchiseId === f.id && u.identityType === 'TEAM_LEADER');
                      const isLocked = coord && coord.status === 'LOCKED';
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
                          <td style="padding: 12px 16px; font-family: var(--font-mono);">
                            ${f.squad.length} / 15
                          </td>
                          <td style="padding: 12px 16px;">
                            <div>${coord ? coord.name : 'Faculty Coordinator'}</div>
                            <div class="font-mono" style="font-size: 0.6875rem; color: var(--text-faint);">${coord ? (coord.email || coord.username) : '—'}</div>
                          </td>
                          <td style="padding: 12px 16px;">
                            <div>${lead ? lead.name : 'Team Captain'}</div>
                            <div class="font-mono" style="font-size: 0.6875rem; color: var(--text-faint);">${lead ? (lead.email || lead.username) : '—'}</div>
                          </td>
                          <td style="padding: 12px 16px;">
                            <span class="status-badge ${isLocked ? 'status-blocked' : 'status-connected'}" style="font-size: 0.625rem;">
                              ${isLocked ? 'LOCKED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td style="padding: 12px 16px; text-align: right;">
                            <div style="display: flex; gap: 6px; justify-content: flex-end;">
                              ${isSuperAdmin ? `
                                <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="openEditFranchiseOfficialsModal(${f.id})">
                                  EDIT
                                </button>
                                <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="toggleFranchiseLock(${f.id})">
                                  ${isLocked ? 'UNLOCK' : 'LOCK'}
                                </button>
                                <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="resetFranchiseCredential(${f.id})">
                                  RESET KEY
                                </button>
                              ` : `
                                <span class="label-micro" style="font-size: 0.6875rem;">READ ONLY</span>
                              `}
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : adminNavTab === 'PLAYERS' ? `
            <!-- TAB: MASTER PLAYERS DIRECTORY & OVERRIDE -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div>
                  <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-bright); margin: 0;">
                    PLAYERS DIRECTORY (${filteredPlayers.length} / ${players.length})
                  </h3>
                  <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
                    Search, inspect dossiers, and perform authoritative Super Admin study year/bucket overrides.
                  </div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="text" class="form-input" placeholder="Search name or roll..." value="${playerSearchQuery}" oninput="playerSearchQuery = this.value; renderCurrentView();" style="width: 200px; font-size: 0.8125rem; padding: 6px 12px;">
                  <button class="btn btn-secondary" onclick="exportPlayersCSV()" style="font-size: 0.75rem; padding: 6px 12px; min-height: 32px;">EXPORT CSV</button>
                </div>
              </div>

              <!-- Filters: Buckets, Dept, Status -->
              <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                <span class="label-micro" style="margin-right: 4px;">BUCKET:</span>
                ${['ALL', 'B1', 'B2', 'B3', 'B4', 'D5', 'M6'].map(b => `
                  <button type="button" class="btn ${playerBucketFilter === b ? 'btn-primary' : 'btn-secondary'}" style="padding: 3px 8px; font-size: 0.6875rem; min-height: 26px;" onclick="playerBucketFilter = '${b}'; renderCurrentView();">
                    ${b}
                  </button>
                `).join('')}

                <span class="label-micro" style="margin-left: 8px; margin-right: 4px;">STATUS:</span>
                ${['ALL', 'AVAILABLE', 'SOLD', 'UNSOLD', 'PENDING_REVIEW'].map(s => `
                  <button type="button" class="btn ${playerStatusFilter === s ? 'btn-primary' : 'btn-secondary'}" style="padding: 3px 8px; font-size: 0.6875rem; min-height: 26px;" onclick="playerStatusFilter = '${s}'; renderCurrentView();">
                    ${s}
                  </button>
                `).join('')}
              </div>

              <!-- Players Table -->
              <div class="surface-card" style="padding: 0; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem;">
                  <thead>
                    <tr style="background: var(--surface-2); border-bottom: 1px solid var(--border-medium); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">
                      <th style="padding: 10px 14px;">Player</th>
                      <th style="padding: 10px 14px;">Roll Number</th>
                      <th style="padding: 10px 14px;">Dept / Branch</th>
                      <th style="padding: 10px 14px;">Year</th>
                      <th style="padding: 10px 14px;">Bucket</th>
                      <th style="padding: 10px 14px;">Role</th>
                      <th style="padding: 10px 14px;">Base Price</th>
                      <th style="padding: 10px 14px;">Status</th>
                      <th style="padding: 10px 14px; text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredPlayers.map(p => `
                      <tr style="border-bottom: 1px solid var(--border-subtle);">
                        <td style="padding: 10px 14px;">
                          <div style="display: flex; align-items: center; gap: 8px;">
                            ${getPlayerAvatar(p, 30, 36)}
                            <strong>${p.name}</strong>
                          </div>
                        </td>
                        <td style="padding: 10px 14px; font-family: var(--font-mono); color: var(--color-green);">${p.roll}</td>
                        <td style="padding: 10px 14px;">${p.department || p.branch}</td>
                        <td style="padding: 10px 14px;">Year ${p.year}</td>
                        <td style="padding: 10px 14px; font-weight: 800; color: var(--color-green);">${p.bucket}</td>
                        <td style="padding: 10px 14px;">${p.derivedType || 'BATTER'}</td>
                        <td style="padding: 10px 14px; font-family: var(--font-mono);">${p.basePrice}C</td>
                        <td style="padding: 10px 14px;">
                          <span class="status-badge ${p.status === 'SOLD' ? 'status-connected' : p.status === 'AVAILABLE' ? 'status-live' : p.status === 'PENDING_REVIEW' ? 'status-warning' : 'status-blocked'}" style="font-size: 0.625rem;">
                            ${p.status}
                          </span>
                        </td>
                        <td style="padding: 10px 14px; text-align: right;">
                          <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 4px 10px; min-height: 28px;" onclick="openPlayerDetailModal(${p.id})">
                            INSPECT / EDIT
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : adminNavTab === 'REGISTRATIONS' ? `
            <!-- TAB: REGISTRATION REVIEW & DETENTION QUEUE -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div>
                <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-bright); margin: 0;">
                  STUDENT REGISTRATIONS & DISCREPANCY AUDIT QUEUE
                </h3>
                <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
                  Review detained student exception flags, reconcile academic progress, and approve auction candidate passes.
                </div>
              </div>

              <div class="surface-card" style="padding: 0; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem;">
                  <thead>
                    <tr style="background: var(--surface-2); border-bottom: 1px solid var(--border-medium); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">
                      <th style="padding: 12px 16px;">Player</th>
                      <th style="padding: 12px 16px;">Roll</th>
                      <th style="padding: 12px 16px;">Branch & Year</th>
                      <th style="padding: 12px 16px;">Bucket</th>
                      <th style="padding: 12px 16px;">Discrepancy Flag</th>
                      <th style="padding: 12px 16px;">Status</th>
                      <th style="padding: 12px 16px; text-align: right;">Review Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${players.map(p => `
                      <tr style="border-bottom: 1px solid var(--border-subtle); ${p.discrepancy ? 'background: rgba(245, 158, 11, 0.05);' : ''}">
                        <td style="padding: 12px 16px;">
                          <div style="display: flex; align-items: center; gap: 8px;">
                            ${getPlayerAvatar(p, 28, 34)}
                            <div>
                              <strong>${p.name}</strong>
                              <div style="font-size: 0.7rem; color: var(--text-muted);">${p.program}</div>
                            </div>
                          </div>
                        </td>
                        <td style="padding: 12px 16px; font-family: var(--font-mono); color: var(--color-green);">${p.roll}</td>
                        <td style="padding: 12px 16px;">${p.department || p.branch} · Year ${p.year}</td>
                        <td style="padding: 12px 16px; font-weight: 800; color: var(--color-green);">${p.bucket}</td>
                        <td style="padding: 12px 16px;">
                          ${p.discrepancy ? `
                            <span class="status-badge status-warning" style="font-size: 0.625rem;">DETAINED / REVIEW</span>
                            <div style="font-size: 0.6875rem; color: var(--color-orange); margin-top: 2px;">${p.discrepancyNote || 'Discrepancy flagged'}</div>
                          ` : `
                            <span class="status-badge status-connected" style="font-size: 0.625rem;">VERIFIED</span>
                          `}
                        </td>
                        <td style="padding: 12px 16px;">
                          <span class="status-badge ${p.status === 'PENDING_REVIEW' ? 'status-warning' : 'status-live'}" style="font-size: 0.625rem;">
                            ${p.status}
                          </span>
                        </td>
                        <td style="padding: 12px 16px; text-align: right;">
                          <div style="display: flex; gap: 6px; justify-content: flex-end;">
                            <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="openPlayerDetailModal(${p.id})">
                              INSPECT
                            </button>
                            ${p.status === 'PENDING_REVIEW' && isSuperAdmin ? `
                              <button class="btn btn-primary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="verifyAndApprovePlayer(${p.id})">
                                APPROVE
                              </button>
                            ` : ''}
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : adminNavTab === 'ROUND 2' ? `
            <!-- TAB: ROUND 2 ACCELERATED AUCTION -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div>
                <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-bright); margin: 0;">
                  ROUND 2: UNSOLD PLAYERS ACCELERATED RE-AUCTION
                </h3>
                <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
                  Re-introduce unsold candidate lots back into the active bidding pool.
                </div>
              </div>

              <div class="surface-card" style="padding: 0; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem;">
                  <thead>
                    <tr style="background: var(--surface-2); border-bottom: 1px solid var(--border-medium); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">
                      <th style="padding: 12px 16px;">Player</th>
                      <th style="padding: 12px 16px;">Roll</th>
                      <th style="padding: 12px 16px;">Bucket</th>
                      <th style="padding: 12px 16px;">Base Price</th>
                      <th style="padding: 12px 16px;">Current Status</th>
                      <th style="padding: 12px 16px; text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${players.filter(p => p.status === 'UNSOLD').length === 0 ? `
                      <tr>
                        <td colspan="6" style="padding: 24px; text-align: center; color: var(--text-muted);">
                          No unsold players currently in Round 2 queue. All lots either available or sold!
                        </td>
                      </tr>
                    ` : players.filter(p => p.status === 'UNSOLD').map(p => `
                      <tr style="border-bottom: 1px solid var(--border-subtle);">
                        <td style="padding: 12px 16px;">
                          <div style="display: flex; align-items: center; gap: 8px;">
                            ${getPlayerAvatar(p, 28, 34)}
                            <strong>${p.name}</strong>
                          </div>
                        </td>
                        <td style="padding: 12px 16px; font-family: var(--font-mono); color: var(--color-green);">${p.roll}</td>
                        <td style="padding: 12px 16px; font-weight: 800; color: var(--color-green);">${p.bucket}</td>
                        <td style="padding: 12px 16px; font-family: var(--font-mono);">${p.basePrice}C</td>
                        <td style="padding: 12px 16px;">
                          <span class="status-badge status-blocked" style="font-size: 0.625rem;">UNSOLD</span>
                        </td>
                        <td style="padding: 12px 16px; text-align: right;">
                          <button class="btn btn-primary" style="font-size: 0.6875rem; padding: 4px 10px; min-height: 28px;" onclick="loadPlayerToLot(${p.id})">
                            LOAD TO LIVE LOT
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : adminNavTab === 'UNDO' ? `
            <!-- TAB: TRANSACTION UNDO & ROLLBACK -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4); max-width: 640px;">
              <div class="surface-card" style="padding: var(--space-5); border-left: 3px solid var(--color-orange);">
                <span class="status-badge status-blocked">OPERATIONAL ROLLBACK DESK</span>
                <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-bright); margin: 8px 0 4px;">
                  ROLLBACK LAST BID OR HAMMER TRANSACTION
                </h3>
                <p style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.6;">
                  Use this operational action to immediately reverse an accidental bid injection or erroneous hammer declaration. The auction clock will halt, the leading bidder will revert, and the audit ledger will append a reversal checkpoint.
                </p>
                <div style="display: flex; gap: 10px; margin-top: 14px;">
                  <button class="btn btn-danger" onclick="openUndoModal()" style="font-size: 0.875rem; padding: 10px 20px;">
                    OPEN TRANSACTION UNDO MODAL &rarr;
                  </button>
                </div>
              </div>
            </div>
          ` : adminNavTab === 'AUDIT' ? `
            <!-- TAB: IMMUTABLE AUDIT LOG -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div>
                  <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-bright); margin: 0;">
                    IMMUTABLE AUDIT LEDGER (${auditLog.length} EVENTS)
                  </h3>
                  <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
                    Comprehensive timestamped log of all bids, overrides, hammers, and administrative actions.
                  </div>
                </div>
                ${isSuperAdmin ? `
                  <button class="btn btn-secondary" onclick="exportAuditLogCSV()" style="font-size: 0.75rem; padding: 6px 12px; min-height: 32px;">
                    EXPORT AUDIT CSV
                  </button>
                ` : ''}
              </div>

              <div class="surface-card" style="padding: 0; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem;">
                  <thead>
                    <tr style="background: var(--surface-2); border-bottom: 1px solid var(--border-medium); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">
                      <th style="padding: 10px 14px;">Time</th>
                      <th style="padding: 10px 14px;">Action</th>
                      <th style="padding: 10px 14px;">Details</th>
                      <th style="padding: 10px 14px;">Actor Role</th>
                      <th style="padding: 10px 14px;">Actor UID</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${auditLog.map(item => `
                      <tr style="border-bottom: 1px solid var(--border-subtle);">
                        <td style="padding: 10px 14px; font-family: var(--font-mono); color: var(--text-faint); white-space: nowrap;">${item.time}</td>
                        <td style="padding: 10px 14px; font-weight: 700; color: var(--text-bright);">${item.action}</td>
                        <td style="padding: 10px 14px; font-family: var(--font-mono); color: var(--color-green);">${item.details}</td>
                        <td style="padding: 10px 14px;">${item.actorRole || 'SYSTEM'}</td>
                        <td style="padding: 10px 14px; font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted);">${item.actorUid || '—'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : adminNavTab === 'EXPORT' ? `
            <!-- TAB: EXPORT DATA CENTER -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div>
                <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-bright); margin: 0;">
                  TOURNAMENT DATA EXPORT CENTER
                </h3>
                <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
                  Generate authoritative CSV data exports for official records, certificates, and directorate audits.
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
                <div class="surface-card" style="padding: var(--space-5);">
                  <div class="label-micro" style="color: var(--color-green);">PLAYERS ROSTER</div>
                  <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-bright); margin: 6px 0;">Master Players Register</h4>
                  <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px;">Full candidate dataset including roll, bucket, academic derivation, and base prices.</p>
                  <button class="btn btn-primary" onclick="exportPlayersCSV()" style="width: 100%; font-size: 0.75rem;">DOWNLOAD PLAYERS CSV</button>
                </div>

                <div class="surface-card" style="padding: var(--space-5);">
                  <div class="label-micro" style="color: var(--color-blue);">SQUAD ROSTERS</div>
                  <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-bright); margin: 6px 0;">11 Franchise Squads</h4>
                  <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px;">Complete breakdown of all 11 teams, players acquired, prices, and remaining purses.</p>
                  <button class="btn btn-primary" onclick="exportSquadsCSV()" style="width: 100%; font-size: 0.75rem;">DOWNLOAD SQUADS CSV</button>
                </div>

                <div class="surface-card" style="padding: var(--space-5);">
                  <div class="label-micro" style="color: var(--color-orange);">AUDIT LOG</div>
                  <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-bright); margin: 6px 0;">Immutable Audit Ledger</h4>
                  <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px;">Timestamped security log of every operational and administrative action.</p>
                  <button class="btn btn-primary" onclick="exportAuditLogCSV()" style="width: 100%; font-size: 0.75rem;">DOWNLOAD AUDIT CSV</button>
                </div>
              </div>
            </div>
          ` : adminNavTab === 'SETTINGS' ? `
            <!-- TAB: TOURNAMENT SETTINGS (SUPER ADMIN ONLY) -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4); max-width: 680px;">
              <div>
                <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-bright); margin: 0;">
                  TOURNAMENT RULES & ENGINE CONFIGURATION
                </h3>
                <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
                  Authoritative tournament parameters for Avanthi Cricket Carnival 2026.
                </div>
              </div>

              <div class="surface-card" style="padding: var(--space-5); display: flex; flex-direction: column; gap: 14px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div class="surface-subtle" style="padding: 12px;">
                    <div class="label-micro" style="font-size: 0.65rem;">ACADEMIC CALENDAR</div>
                    <div style="font-weight: 800; color: var(--text-bright); margin-top: 2px;">2026–27 (Active)</div>
                  </div>
                  <div class="surface-subtle" style="padding: 12px;">
                    <div class="label-micro" style="font-size: 0.65rem;">STARTING PURSE PER TEAM</div>
                    <div style="font-weight: 800; color: var(--color-green); margin-top: 2px;">1,000 Credits</div>
                  </div>
                  <div class="surface-subtle" style="padding: 12px;">
                    <div class="label-micro" style="font-size: 0.65rem;">INITIAL LOT TIMER (FIRST_BID)</div>
                    <div style="font-weight: 800; color: var(--text-bright); margin-top: 2px;">30 Seconds</div>
                  </div>
                  <div class="surface-subtle" style="padding: 12px;">
                    <div class="label-micro" style="font-size: 0.65rem;">BID COUNTDOWN TIMER</div>
                    <div style="font-weight: 800; color: var(--text-bright); margin-top: 2px;">20 Seconds</div>
                  </div>
                  <div class="surface-subtle" style="padding: 12px;">
                    <div class="label-micro" style="font-size: 0.65rem;">SQUAD CAPACITY</div>
                    <div style="font-weight: 800; color: var(--text-bright); margin-top: 2px;">Min 12 · Max 15</div>
                  </div>
                  <div class="surface-subtle" style="padding: 12px;">
                    <div class="label-micro" style="font-size: 0.65rem;">BID INCREMENTS</div>
                    <div style="font-weight: 800; color: var(--text-bright); margin-top: 2px;">&lt;100: +10 | 100-199: +20 | &ge;200: +30</div>
                  </div>
                </div>
              </div>
            </div>
          ` : adminNavTab === 'ADMIN ACCOUNTS' ? `
            <!-- TAB: ADMIN ACCOUNTS (SUPER ADMIN ONLY) -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div>
                  <h3 style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--text-bright); margin: 0;">
                    ADMINISTRATOR & HANDLER ACCOUNTS
                  </h3>
                  <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
                    Manage Super Admin and operational floor handler credentials.
                  </div>
                </div>
                <button class="btn btn-primary" onclick="openCreateAdminModal()" style="font-size: 0.75rem; padding: 6px 14px; min-height: 32px;">
                  + PROVISION NEW ADMIN
                </button>
              </div>

              <div class="surface-card" style="padding: 0; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8125rem;">
                  <thead>
                    <tr style="background: var(--surface-2); border-bottom: 1px solid var(--border-medium); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">
                      <th style="padding: 12px 16px;">Admin Name</th>
                      <th style="padding: 12px 16px;">Role</th>
                      <th style="padding: 12px 16px;">Username</th>
                      <th style="padding: 12px 16px;">Email</th>
                      <th style="padding: 12px 16px;">Mobile</th>
                      <th style="padding: 12px 16px;">Status</th>
                      <th style="padding: 12px 16px; text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${users.filter(u => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN').map(u => `
                      <tr style="border-bottom: 1px solid var(--border-subtle);">
                        <td style="padding: 12px 16px;">
                          <strong>${u.name}</strong>
                          <div style="font-size: 0.7rem; color: var(--text-muted);">${u.title || (u.role === 'SUPER_ADMIN' ? 'Chief Controller' : 'Auction Floor Operator')}</div>
                        </td>
                        <td style="padding: 12px 16px;">
                          <span class="status-badge ${u.role === 'SUPER_ADMIN' ? 'status-connected' : 'status-live'}" style="font-size: 0.625rem;">
                            ${u.role}
                          </span>
                        </td>
                        <td style="padding: 12px 16px; font-family: var(--font-mono); color: var(--color-green);">${u.username}</td>
                        <td style="padding: 12px 16px;">${u.email || '—'}</td>
                        <td style="padding: 12px 16px; font-family: var(--font-mono);">${u.mobile || '—'}</td>
                        <td style="padding: 12px 16px;">
                          <span class="status-badge ${u.status === 'LOCKED' ? 'status-blocked' : 'status-connected'}" style="font-size: 0.625rem;">
                            ${u.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td style="padding: 12px 16px; text-align: right;">
                          ${u.role !== 'SUPER_ADMIN' ? `
                            <div style="display: flex; gap: 6px; justify-content: flex-end;">
                              <button class="btn btn-secondary" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="toggleAdminStatus('${u.username}')">
                                ${u.status === 'LOCKED' ? 'ENABLE' : 'DISABLE'}
                              </button>
                              <button class="btn btn-danger" style="font-size: 0.6875rem; padding: 4px 8px; min-height: 28px;" onclick="deleteAdminAccount('${u.username}')">
                                DELETE
                              </button>
                            </div>
                          ` : `
                            <span class="label-micro font-mono" style="font-size: 0.65rem; color: var(--text-faint);">PERMANENT</span>
                          `}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

        </div>
      `;
    }"""

old_admin_view_start = "    function renderAdminConsoleView() {"
old_admin_view_end = "    function renderProjectorView() {"

old_admin_pos = content.find(old_admin_view_start)
old_proj_pos = content.find(old_admin_view_end)

if old_admin_pos != -1 and old_proj_pos != -1:
    content = content[:old_admin_pos] + new_admin_console_view + "\n\n" + content[old_proj_pos:]

with open("B:/projects/ACC/index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Patch applied to index.html successfully!")

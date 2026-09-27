import re
import os
import shutil

with open("B:/projects/ACC/index.html", "r", encoding="utf-8") as f:
    content = f.read()

# ============================================================
# 1. PURGE "STAFF" TERMINOLOGY ACROSS LOGIN & SYSTEM
# ============================================================

# Replace role selector in login view
content = re.sub(
    r"\$\{.*?\[\s*'PLAYER'\s*,\s*'FRANCHISE'\s*,\s*'STAFF'\s*\].*?\}",
    """${['PLAYER', 'FRANCHISE', 'ADMIN'].map(r => `
                    <button type="button" class="btn btn-secondary auth-role-btn" style="${loginRoleSelection === r ? 'background: rgba(5, 150, 105, 0.12); border-color: var(--color-green); color: var(--color-green); font-weight: 800;' : ''}" onclick="loginRoleSelection = '${r}'; renderCurrentView();">
                      ${r}
                    </button>
                  `).join('')}""",
    content,
    flags=re.DOTALL
)

# Replace staff login form in renderLoginView
old_staff_form = """<!-- STAFF LOGIN: RESOLVES TO SUPER ADMIN OR ADMIN / HANDLER -->
                <form onsubmit="handleLoginSubmit(event)" style="display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-2);">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">STAFF USERNAME OR EMAIL</label>
                    <input type="text" class="form-input" id="loginStaffIdentifier" placeholder="e.g. superadmin@acc.edu or handler@acc.edu" required>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">OPERATIONAL PASSWORD</label>
                    <input type="password" class="form-input" id="loginStaffSecret" placeholder="••••••••" required>
                  </div>

                  <div style="display: flex; justify-content: flex-end;">
                    <a href="javascript:void(0)" onclick="openForgotPasswordModal('STAFF')" style="font-size: 0.75rem; color: var(--color-green); text-decoration: none; font-weight: 600;">Forgot Staff Credentials?</a>
                  </div>

                  <button type="submit" class="btn btn-primary" style="width: 100%; min-height: 48px; font-size: 0.9375rem; margin-top: var(--space-1);">
                    AUTHENTICATE STAFF CREDENTIAL
                  </button>
                </form>"""

new_admin_form = """<!-- ADMIN LOGIN: RESOLVES TO SUPER ADMIN OR ADMIN / HANDLER -->
                <form onsubmit="handleLoginSubmit(event)" style="display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-2);">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">ADMIN USERNAME OR EMAIL</label>
                    <input type="text" class="form-input" id="loginAdminIdentifier" placeholder="e.g. superadmin@acc.edu or handler@acc.edu" required>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">ADMIN PASSWORD</label>
                    <input type="password" class="form-input" id="loginAdminSecret" placeholder="••••••••" required>
                  </div>

                  <div style="display: flex; justify-content: flex-end;">
                    <a href="javascript:void(0)" onclick="openForgotPasswordModal('ADMIN')" style="font-size: 0.75rem; color: var(--color-green); text-decoration: none; font-weight: 600;">FORGOT PASSWORD?</a>
                  </div>

                  <button type="submit" class="btn btn-primary" style="width: 100%; min-height: 48px; font-size: 0.9375rem; margin-top: var(--space-1);">
                    AUTHENTICATE ADMIN
                  </button>
                </form>"""

content = content.replace(old_staff_form, new_admin_form)

# In handleLoginSubmit, remove 'STAFF' checks and references
content = content.replace("if (loginRoleSelection === 'ADMIN' || loginRoleSelection === 'STAFF')", "if (loginRoleSelection === 'ADMIN')")
content = content.replace("const idInput = document.getElementById(\"loginStaffIdentifier\") || document.getElementById(\"loginAdminIdentifier\");", "const idInput = document.getElementById(\"loginAdminIdentifier\") || document.getElementById(\"loginStaffIdentifier\");")
content = content.replace("const passInput = document.getElementById(\"loginStaffSecret\") || document.getElementById(\"loginAdminSecret\");", "const passInput = document.getElementById(\"loginAdminSecret\") || document.getElementById(\"loginStaffSecret\");")
content = content.replace("openForgotPasswordModal('STAFF')", "openForgotPasswordModal('ADMIN')")
content = content.replace("Forgot Staff Credentials?", "FORGOT PASSWORD?")
content = content.replace("AUTHENTICATE STAFF CREDENTIAL", "AUTHENTICATE ADMIN")
content = content.replace("STAFF PROVISIONED", "ADMIN PROVISIONED")
content = content.replace("STAFF PROVISIONING", "ADMIN PROVISIONING")
content = content.replace("Player, Franchise & Staff", "Player, Franchise & Admin")

# ============================================================
# 2. BUCKET DERIVATION & ACADEMIC HELPERS
# ============================================================
academic_helpers = """
    function deriveBucketFromAcademic(program, studyYear) {
      const yr = parseInt(studyYear, 10) || 1;
      if (program === 'Diploma') return 'D5';
      if (program === 'PG') return 'M6';
      // B.Tech
      if (yr === 1) return 'B1';
      if (yr === 2) return 'B2';
      if (yr === 3) return 'B3';
      return 'B4';
    }

    function initFreshRegistrationState() {
      regFormData = {
        name: "",
        roll: "",
        mobile: "",
        photo: "",
        program: "B.Tech",
        entryType: "Regular",
        branch: "CSE",
        department: "CSE",
        year: 1,
        bucket: "B1",
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
        basePrice: null // Section 35: basePrice = null, never inherit
      };
      regActiveSection = 1;
      window.isSubmittingRegistration = false;
      return regFormData;
    }

    function setRegProgram(prog) {
      regFormData.program = prog;
      if (prog === 'B.Tech') {
        if (!['ECE', 'CSE', 'EEE', 'MECH', 'CSD', 'CSM', 'OTHERS'].includes(regFormData.branch)) {
          regFormData.branch = 'CSE';
          regFormData.department = 'CSE';
        }
        if (!regFormData.entryType) regFormData.entryType = 'Regular';
        if (regFormData.year > 4) regFormData.year = 4;
      } else if (prog === 'Diploma') {
        if (!['CM', 'EC', 'EE', 'M', 'OTHERS'].includes(regFormData.branch)) {
          regFormData.branch = 'CM';
          regFormData.department = 'CM';
        }
        regFormData.entryType = 'Regular';
        if (regFormData.year > 3) regFormData.year = 3;
      } else if (prog === 'PG') {
        if (!['MBA', 'MCA', 'M.Tech'].includes(regFormData.branch)) {
          regFormData.branch = 'MBA';
          regFormData.department = 'MBA';
        }
        regFormData.entryType = 'Regular';
        if (regFormData.year > 2) regFormData.year = 2;
      }
      regFormData.bucket = deriveBucketFromAcademic(regFormData.program, regFormData.year);
      updateAcademicSelectorsDOM();
      validateRegRollAcademic();
    }

    function setRegEntryType(entry) {
      regFormData.entryType = entry;
      updateAcademicSelectorsDOM();
      validateRegRollAcademic();
    }

    function setRegBranch(branch) {
      regFormData.branch = branch;
      regFormData.department = branch;
      updateAcademicSelectorsDOM();
      validateRegRollAcademic();
    }

    function setRegStudyYear(yr) {
      regFormData.year = parseInt(yr, 10);
      regFormData.bucket = deriveBucketFromAcademic(regFormData.program, regFormData.year);
      updateAcademicSelectorsDOM();
      validateRegRollAcademic();
    }

    function getAcademicSelectorsHTML() {
      const prog = regFormData.program || 'B.Tech';
      const btechBranches = ['ECE', 'CSE', 'EEE', 'MECH', 'CSD', 'CSM', 'OTHERS'];
      const diplomaBranches = ['CM', 'EC', 'EE', 'M', 'OTHERS'];
      const pgBranches = ['MBA', 'MCA', 'M.TECH'];
      const buckets = ['B1', 'B2', 'B3', 'B4', 'D5', 'M6'];

      return `
        <!-- PROGRAM / COURSE SELECTOR -->
        <div class="form-group" style="margin-bottom: var(--space-3);">
          <label class="form-label">PROGRAM / COURSE (MANUAL SELECTION)</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            ${['B.Tech', 'Diploma', 'PG'].map(p => `
              <button type="button" class="btn" style="${prog === p ? 'background: rgba(5, 150, 105, 0.15); border: 2px solid var(--color-green); color: var(--color-green); font-weight: 800;' : 'background: var(--surface-2); border: 1px solid var(--border-subtle); color: var(--text-muted);'} padding: 10px; font-size: 0.875rem;" onclick="setRegProgram('${p}')">
                ${p.toUpperCase()}
              </button>
            `).join('')}
          </div>
        </div>

        ${prog === 'B.Tech' ? `
          <!-- B.TECH: ENTRY TYPE -->
          <div class="form-group" style="margin-bottom: var(--space-3);">
            <label class="form-label">ENTRY TYPE</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              ${['Regular', 'Lateral'].map(e => `
                <button type="button" class="btn" style="${regFormData.entryType === e ? 'background: rgba(5, 150, 105, 0.15); border: 2px solid var(--color-green); color: var(--color-green); font-weight: 800;' : 'background: var(--surface-2); border: 1px solid var(--border-subtle); color: var(--text-muted);'} padding: 10px; font-size: 0.8125rem;" onclick="setRegEntryType('${e}')">
                  ${e.toUpperCase()}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- B.TECH: DEPARTMENT / BRANCH -->
          <div class="form-group" style="margin-bottom: var(--space-3);">
            <label class="form-label">DEPARTMENT / BRANCH</label>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 8px;">
              ${btechBranches.map(b => `
                <button type="button" class="btn" style="${regFormData.branch === b ? 'background: rgba(5, 150, 105, 0.15); border: 2px solid var(--color-green); color: var(--color-green); font-weight: 800;' : 'background: var(--surface-2); border: 1px solid var(--border-subtle); color: var(--text-muted);'} padding: 8px 4px; font-size: 0.75rem;" onclick="setRegBranch('${b}')">
                  ${b}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- B.TECH: STUDY YEAR (YEAR 1 - 4) -->
          <div class="form-group" style="margin-bottom: var(--space-3);">
            <label class="form-label">CURRENT STUDY YEAR (MANUAL SELECTION)</label>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
              ${[1, 2, 3, 4].map(y => `
                <button type="button" class="btn" style="${regFormData.year === y ? 'background: rgba(5, 150, 105, 0.15); border: 2px solid var(--color-green); color: var(--color-green); font-weight: 800;' : 'background: var(--surface-2); border: 1px solid var(--border-subtle); color: var(--text-muted);'} padding: 10px; font-size: 0.8125rem;" onclick="setRegStudyYear(${y})">
                  YEAR ${y}
                </button>
              `).join('')}
            </div>
          </div>
        ` : prog === 'Diploma' ? `
          <!-- DIPLOMA: DEPARTMENT / BRANCH -->
          <div class="form-group" style="margin-bottom: var(--space-3);">
            <label class="form-label">DEPARTMENT / BRANCH</label>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 8px;">
              ${diplomaBranches.map(b => `
                <button type="button" class="btn" style="${regFormData.branch === b ? 'background: rgba(5, 150, 105, 0.15); border: 2px solid var(--color-green); color: var(--color-green); font-weight: 800;' : 'background: var(--surface-2); border: 1px solid var(--border-subtle); color: var(--text-muted);'} padding: 8px 4px; font-size: 0.75rem;" onclick="setRegBranch('${b}')">
                  ${b}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- DIPLOMA: STUDY YEAR (YEAR 1 - 3) -->
          <div class="form-group" style="margin-bottom: var(--space-3);">
            <label class="form-label">CURRENT STUDY YEAR (MANUAL SELECTION)</label>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
              ${[1, 2, 3].map(y => `
                <button type="button" class="btn" style="${regFormData.year === y ? 'background: rgba(5, 150, 105, 0.15); border: 2px solid var(--color-green); color: var(--color-green); font-weight: 800;' : 'background: var(--surface-2); border: 1px solid var(--border-subtle); color: var(--text-muted);'} padding: 10px; font-size: 0.8125rem;" onclick="setRegStudyYear(${y})">
                  YEAR ${y}
                </button>
              `).join('')}
            </div>
          </div>
        ` : `
          <!-- PG: PROGRAM -->
          <div class="form-group" style="margin-bottom: var(--space-3);">
            <label class="form-label">PG PROGRAM</label>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
              ${pgBranches.map(b => `
                <button type="button" class="btn" style="${regFormData.branch === b ? 'background: rgba(5, 150, 105, 0.15); border: 2px solid var(--color-green); color: var(--color-green); font-weight: 800;' : 'background: var(--surface-2); border: 1px solid var(--border-subtle); color: var(--text-muted);'} padding: 10px; font-size: 0.8125rem;" onclick="setRegBranch('${b}')">
                  ${b}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- PG: STUDY YEAR (YEAR 1 - 2) -->
          <div class="form-group" style="margin-bottom: var(--space-3);">
            <label class="form-label">CURRENT STUDY YEAR (MANUAL SELECTION)</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              ${[1, 2].map(y => `
                <button type="button" class="btn" style="${regFormData.year === y ? 'background: rgba(5, 150, 105, 0.15); border: 2px solid var(--color-green); color: var(--color-green); font-weight: 800;' : 'background: var(--surface-2); border: 1px solid var(--border-subtle); color: var(--text-muted);'} padding: 10px; font-size: 0.8125rem;" onclick="setRegStudyYear(${y})">
                  YEAR ${y}
                </button>
              `).join('')}
            </div>
          </div>
        `}

        <!-- BUCKET CLASSIFICATION: AUTO-DERIVED · LOCKED -->
        <div class="form-group" style="margin-bottom: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label class="form-label" style="margin: 0;">AUCTION BUCKET CLASSIFICATION</label>
            <span class="status-badge status-connected" style="font-size: 0.65rem; padding: 2px 6px;">AUTO-DERIVED · LOCKED</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; pointer-events: none; user-select: none;">
            ${buckets.map(b => {
              const isActive = regFormData.bucket === b;
              return `
                <div style="${isActive ? 'background: rgba(5, 150, 105, 0.18); border: 2px solid var(--color-green); color: var(--color-green); transform: scale(1.02);' : 'background: var(--surface-2); border: 1px solid var(--border-subtle); color: var(--text-muted); opacity: 0.55;'} padding: 12px 4px; text-align: center; border-radius: var(--radius-sm); font-weight: 800; transition: all 0.2s ease;">
                  <div style="font-size: 1.15rem;">${b}</div>
                  <div style="font-size: 0.6rem; letter-spacing: 0.02em; margin-top: 2px;">
                    ${b === 'D5' ? 'Diploma' : b === 'M6' ? 'PG' : 'Year ' + b.slice(1)}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-faint); margin-top: 6px;">
            Bucket is derived solely from Program + Study Year. Cannot be manually clicked or modified.
          </div>
        </div>
      `;
    }

    function updateAcademicSelectorsDOM() {
      const container = document.getElementById("academicSelectorsContainer");
      if (container) {
        container.innerHTML = getAcademicSelectorsHTML();
      }
    }

    function validateRegRollAcademic() {
      const roll = (regFormData.roll || '').trim().toUpperCase();
      const notice = document.getElementById("regAcademicDiscrepancyNotice");
      if (!roll) {
        if (notice) notice.style.display = "none";
        return;
      }
      const parsed = parseRollNumber(roll);
      if (!parsed.valid) {
        if (notice) {
          notice.style.display = "block";
          notice.innerHTML = "<strong>ACADEMIC DETAILS NEED VERIFICATION:</strong> Roll format not fully recognized. Your manual selections are preserved and will be verified by Super Admin.";
        }
        return;
      }

      let hasMismatch = false;
      let note = "";
      if (parsed.program !== regFormData.program) {
        hasMismatch = true;
        note = `Roll indicates ${parsed.program}, while ${regFormData.program} is selected.`;
      } else if (parsed.program === 'B.Tech' && parsed.year !== regFormData.year) {
        hasMismatch = true;
        note = `Roll progression indicates Year ${parsed.year}, while Year ${regFormData.year} is selected (e.g. detained/reconciled).`;
      }

      if (notice) {
        if (hasMismatch) {
          notice.style.display = "block";
          notice.innerHTML = `<strong>ACADEMIC DETAILS NEED VERIFICATION:</strong> ${note} Your chosen values remain active and will be reviewed by Super Admin.`;
          regFormData.yearDiscrepancy = true;
          regFormData.discrepancyNote = note;
        } else {
          notice.style.display = "none";
          regFormData.yearDiscrepancy = false;
          regFormData.discrepancyNote = "";
        }
      }
    }

    function detectAndMergeDuplicateRolls() {
      if (currentUser.role !== 'SUPER_ADMIN') {
        showToast("Duplicate roll reconciliation reserved for Super Admin", "error");
        return;
      }
      const rollGroups = {};
      players.forEach(p => {
        const norm = (p.roll || '').trim().toUpperCase().replace(/\\s+/g, '');
        if (!norm) return;
        if (!rollGroups[norm]) rollGroups[norm] = [];
        rollGroups[norm].push(p);
      });

      let duplicateCount = 0;
      let mergedCount = 0;

      Object.entries(rollGroups).forEach(([roll, group]) => {
        if (group.length > 1) {
          duplicateCount++;
          let canonical = group.find(p => p.status === 'SOLD') || group.find(p => p.paymentStatus === 'PAID') || group[0];
          group.forEach(dup => {
            if (dup !== canonical) {
              dup.status = 'MERGED';
              dup.duplicateOf = canonical.playerId || canonical.roll;
              mergedCount++;
            }
          });
        }
      });

      if (duplicateCount === 0) {
        showToast("No duplicate rolls detected in registry", "info");
      } else {
        saveDatabase();
        broadcastAuthoritativeState();
        showToast(`Detected ${duplicateCount} duplicate roll sets. Successfully reconciled ${mergedCount} redundant records.`, "success");
        renderCurrentView();
      }
    }

    function openRegistrationSuccessModal(player) {
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
    }
"""

# Place academic_helpers right before `let regFormData =`
reg_pos = content.find("    let regFormData = {")
if reg_pos != -1:
    # Check if academic_helpers was already inserted
    if "function deriveBucketFromAcademic" not in content:
        content = content[:reg_pos] + academic_helpers + "\n" + content[reg_pos:]

# ============================================================
# 3. REWRITE submitPlayerRegistration WITH CANONICAL ROLL LOCK
# ============================================================
updated_submit_func = """    function submitPlayerRegistration() {
      if (window.isSubmittingRegistration) return;

      // 1. BASIC FIELDS VALIDATION
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
      }

      // 2. CANONICAL ROLL NUMBER NORMALIZATION
      const normalizedRoll = regFormData.roll.trim().toUpperCase().replace(/\\s+/g, '');
      if (!normalizedRoll) {
        showToast("Valid college roll number is required", "error");
        return;
      }

      // 3. MOBILE NUMBER NORMALIZATION
      const rawMobile = (regFormData.mobile || "").trim();
      const normalizedMobile = rawMobile.replace(/\\D/g, '');
      if (!normalizedMobile || normalizedMobile.length < 10) {
        showToast("A valid 10-digit mobile number is required", "error");
        return;
      }

      // 4. DUPLICATE ROLL NUMBER HARD CHECK
      const existingPlayerByRoll = players.find(p => p.status !== 'MERGED' && (p.roll || "").trim().toUpperCase().replace(/\\s+/g, '') === normalizedRoll);
      if (existingPlayerByRoll) {
        showToast(`PLAYER ALREADY REGISTERED: Roll number ${normalizedRoll} is already registered (#${existingPlayerByRoll.id} - ${existingPlayerByRoll.name})`, "error");
        return;
      }

      // 5. DUPLICATE MOBILE NUMBER CHECK
      const existingPlayerByMobile = players.find(p => p.status !== 'MERGED' && p.mobile && p.mobile.replace(/\\D/g, '') === normalizedMobile);
      if (existingPlayerByMobile) {
        showToast(`MOBILE NUMBER ALREADY REGISTERED: ${normalizedMobile} is already attached to another player`, "error");
        return;
      }

      // 6. IMMEDIATE BUTTON LOCKOUT (PREVENT RAPID DOUBLE CLICKS & RETRIES)
      window.isSubmittingRegistration = true;
      const submitBtn = document.getElementById("submitRegBtn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "SUBMITTING...";
      }

      // 7. FINAL ACADEMIC DERIVATION
      const finalProgram = regFormData.program || 'B.Tech';
      const finalYear = parseInt(regFormData.year, 10) || 1;
      const finalBucket = deriveBucketFromAcademic(finalProgram, finalYear);
      const derived = derivePlayerType(regFormData);
      const isDiscrepancy = !!regFormData.yearDiscrepancy;
      const clientActionId = 'reg_' + normalizedRoll + '_' + Date.now();
      const newPlayerId = players.length > 0 ? Math.max(...players.map(p => p.id || 0)) + 1 : 1;

      const newPlayer = {
        id: newPlayerId,
        playerId: normalizedRoll,
        name: regFormData.name.trim(),
        roll: normalizedRoll,
        rollNumberNormalized: normalizedRoll,
        mobile: normalizedMobile,
        program: finalProgram,
        branch: regFormData.branch || 'CSE',
        department: regFormData.department || regFormData.branch || 'CSE',
        entryType: regFormData.entryType || 'Regular',
        year: String(finalYear),
        bucket: finalBucket,
        derivedType: derived,
        battingStyle: regFormData.battingStyle || "Right Hand",
        battingPosition: regFormData.battingPosition || "Top Order (1-3)",
        battingArm: regFormData.battingArm || "Right Hand",
        bowlingArm: regFormData.bowlingArm || "Right Arm",
        bowlingCategory: regFormData.bowlingCategory || "Medium",
        bowlingType: regFormData.bowlingType || "None",
        bowlingRole: regFormData.bowlingRole || "None",
        isWicketKeeper: !!regFormData.isWicketKeeper,
        basePrice: Number(regFormData.basePrice),
        status: isDiscrepancy ? "PENDING_REVIEW" : "AVAILABLE",
        discrepancy: isDiscrepancy,
        discrepancyNote: isDiscrepancy ? (regFormData.discrepancyNote || "Academic verification required") : "",
        cricHeroesUrl: regFormData.cricHeroesUrl || "",
        cricHeroesMobile: regFormData.cricHeroesMobile || "",
        cricHeroesStatus: regFormData.cricHeroesStatus || "PROFILE AVAILABLE",
        paymentStatus: "PAID",
        photo: regFormData.photo || "",
        clientActionId: clientActionId,
        createdAt: new Date().toISOString(),
        bio: `Registered player from ${regFormData.branch}, Year ${finalYear}.`
      };

      players.push(newPlayer);

      // Firestore atomic persistence if connected
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

      // Reset form data so subsequent registrations start clean
      initFreshRegistrationState();

      showSpeeder("REGISTRATION COMPLETE", `${newPlayer.name} enrolled into ACC 2026 (#${newPlayer.id})`, 1000);
      setTimeout(() => {
        openRegistrationSuccessModal(newPlayer);
      }, 600);
    }"""

old_sub_match = re.search(r"function submitPlayerRegistration\(\)\s*\{.*?\}\s*(?=function exportPlayersCSV)", content, re.DOTALL)
if old_sub_match:
    content = content[:old_sub_match.start()] + updated_submit_func + "\n\n    " + content[old_sub_match.end():]

# ============================================================
# 4. REWRITE renderPlayerRegistrationView TO FIX CARET & ACADEMICS
# ============================================================
new_reg_view = """    function renderPlayerRegistrationView() {
      const derivedType = derivePlayerType(regFormData);
      const basePrices = [20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 230, 250];

      return `
        <div style="max-width: 820px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-6);">
          
          <!-- Registration Header with Two Distinct Steps -->
          <div class="surface-card" style="padding: var(--space-5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; gap: 10px;">
              <div>
                <span class="label-micro" style="color: var(--color-green);">OFFICIAL PLAYER ONBOARDING</span>
                <h2 style="font-family: var(--font-display); font-size: 1.65rem; font-weight: 800; color: var(--text-bright);">
                  PLAYER REGISTRATION WORKFLOW
                </h2>
              </div>
              <span class="font-mono label-micro" style="color: var(--color-green); font-size: 0.8125rem;">
                ${regActiveSection === 1 ? 'STEP 1 OF 2 (50%)' : 'STEP 2 OF 2 (100%)'}
              </span>
            </div>

            <!-- Two Main Sections Tab Header -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: var(--space-2);">
              <button type="button" class="btn" style="${regActiveSection === 1 ? 'background: rgba(5, 150, 105, 0.15); border: 2px solid var(--color-green); color: var(--color-green); font-weight: 800;' : 'background: var(--surface-2); border: 1px solid var(--border-subtle); color: var(--text-muted);'} padding: 12px; font-size: 0.875rem;" onclick="regActiveSection = 1; renderCurrentView();">
                01 IDENTITY & ACADEMIC
              </button>
              <button type="button" class="btn" style="${regActiveSection === 2 ? 'background: rgba(5, 150, 105, 0.15); border: 2px solid var(--color-green); color: var(--color-green); font-weight: 800;' : 'background: var(--surface-2); border: 1px solid var(--border-subtle); color: var(--text-muted);'} padding: 12px; font-size: 0.875rem;" onclick="if(!regFormData.name || !regFormData.roll){ showToast('Please enter your name and roll number in Section 1 first', 'warning'); } else { regActiveSection = 2; renderCurrentView(); }">
                02 CRICKET PROFILE
              </button>
            </div>
          </div>

          <!-- Section Card Content -->
          <div class="surface-elevated" style="padding: var(--space-6);">
            
            ${regActiveSection === 1 ? `
              <!-- SECTION 1: IDENTITY & ACADEMIC -->
              <div style="display: flex; flex-direction: column; gap: var(--space-5);">
                
                <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-3);">
                  <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--text-bright);">
                    01. PERSONAL IDENTITY & ACADEMIC CLASSIFICATION
                  </h3>
                  <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
                    Provide your institutional credentials. Study year is selected manually; auction bucket is derived automatically.
                  </p>
                </div>

                <!-- Text Inputs: Continuous uninterrupted typing, zero focus jumps -->
                <div class="form-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">COLLEGE ROLL NUMBER</label>
                    <input type="text" class="form-input" id="regRollInput" value="${regFormData.roll || ''}" oninput="regFormData.roll = this.value;" onblur="validateRegRollAcademic()" placeholder="e.g. 24815A0443, 26811A0501" required>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                      Format: B.Tech (YY811A... / YY815A...), Diploma (YY597...), or PG
                    </div>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">FULL NAME (AS PER COLLEGE ID)</label>
                    <input type="text" class="form-input" id="regNameInput" value="${regFormData.name || ''}" oninput="regFormData.name = this.value;" placeholder="e.g. Sai Teja" required>
                  </div>
                </div>

                <div class="form-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">MOBILE NUMBER (CONFIDENTIAL)</label>
                    <input type="tel" class="form-input" id="regMobileInput" value="${regFormData.mobile || ''}" oninput="regFormData.mobile = this.value;" placeholder="e.g. 9876543210" required>
                    <div style="font-size: 0.75rem; color: var(--text-faint); margin-top: 4px;">
                      Protected: Never displayed publicly or on projector screens.
                    </div>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">OFFICIAL PHOTO (4:3 RATIO)</label>
                    <input type="file" accept="image/*" class="form-input" onchange="handlePhotoUpload(this)" style="padding: 7px 12px;">
                  </div>
                </div>

                <!-- Academic Verification Notice (Dynamic) -->
                <div id="regAcademicDiscrepancyNotice" style="display: ${regFormData.yearDiscrepancy ? 'block' : 'none'}; padding: 10px 14px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-sm); font-size: 0.8125rem; color: var(--color-orange);">
                  <strong>ACADEMIC DETAILS NEED VERIFICATION:</strong> ${regFormData.discrepancyNote || 'Discrepancy noted; player selection preserved.'}
                </div>

                <!-- Dedicated Academic Selectors Container (Updates live without re-rendering inputs) -->
                <div id="academicSelectorsContainer" style="display: flex; flex-direction: column; gap: var(--space-4);">
                  ${getAcademicSelectorsHTML()}
                </div>

                <!-- Detained Student Discrepancy Flag -->
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-sm);">
                  <input type="checkbox" id="yearDiscrepancyCheck" ${regFormData.yearDiscrepancy ? 'checked' : ''} onchange="regFormData.yearDiscrepancy = this.checked;" style="width: 18px; height: 18px; accent-color: var(--color-orange);">
                  <label for="yearDiscrepancyCheck" style="font-size: 0.8125rem; color: var(--text-bright); cursor: pointer; margin: 0;">
                    <strong>YEAR DISCREPANCY:</strong> Check this if you are a detained student or your academic study year does not match standard admission progression (submits to Super Admin Review Queue).
                  </label>
                </div>

                <!-- Step 1 Navigation Button -->
                <div style="display: flex; justify-content: flex-end; margin-top: var(--space-4);">
                  <button type="button" class="btn btn-primary" style="min-height: 48px; padding: 10px 28px; font-size: 0.9375rem;" onclick="if(!regFormData.name || !regFormData.roll){ showToast('Please enter your full name and roll number', 'warning'); } else { regActiveSection = 2; renderCurrentView(); }">
                    CONTINUE TO CRICKET PROFILE (02) &rarr;
                  </button>
                </div>

              </div>
            ` : `
              <!-- SECTION 2: CRICKET PROFILE + AUCTION DATA -->
              <div style="display: flex; flex-direction: column; gap: var(--space-5);">
                
                <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-3);">
                  <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--text-bright);">
                    02. CRICKET PROFILE & AUCTION ATTRIBUTES
                  </h3>
                  <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
                    Define your on-field capabilities, CricHeroes profile, and starting auction valuation.
                  </p>
                </div>

                <!-- Primary Playing Skills -->
                <div style="background: var(--surface-2); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <label class="form-label" style="margin-bottom: 10px;">PRIMARY PLAYING ATTRIBUTES</label>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.875rem;">
                      <input type="checkbox" ${regFormData.isBatter ? 'checked' : ''} onchange="regFormData.isBatter = this.checked; renderCurrentView();" style="accent-color: var(--color-green);">
                      <strong>BATTER</strong>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.875rem;">
                      <input type="checkbox" ${regFormData.isBowler ? 'checked' : ''} onchange="regFormData.isBowler = this.checked; renderCurrentView();" style="accent-color: var(--color-green);">
                      <strong>BOWLER</strong>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.875rem;">
                      <input type="checkbox" ${regFormData.isWicketKeeper ? 'checked' : ''} onchange="regFormData.isWicketKeeper = this.checked; renderCurrentView();" style="accent-color: var(--color-green);">
                      <strong>WICKET-KEEPER</strong>
                    </label>
                  </div>
                  <div style="margin-top: 10px; font-size: 0.8125rem; color: var(--color-green); font-weight: 700;">
                    DERIVED PLAYER ROLE: ${derivedType}
                  </div>
                </div>

                <!-- Batting Branch -->
                ${regFormData.isBatter ? `
                  <div style="display: flex; flex-direction: column; gap: var(--space-3); padding: var(--space-4); background: rgba(5, 150, 105, 0.04); border-radius: var(--radius-sm); border: 1px solid rgba(5, 150, 105, 0.15);">
                    <span class="label-micro" style="color: var(--color-green);">BATTING ATTRIBUTES</span>
                    <div class="form-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                      <div class="form-group" style="margin: 0;">
                        <label class="form-label">BATTING STANCE / ARM</label>
                        <select class="form-select" onchange="regFormData.battingStyle = this.value; regFormData.battingArm = this.value;">
                          <option value="Right Hand" ${regFormData.battingStyle === 'Right Hand' ? 'selected' : ''}>Right Hand</option>
                          <option value="Left Hand" ${regFormData.battingStyle === 'Left Hand' ? 'selected' : ''}>Left Hand</option>
                        </select>
                      </div>
                      <div class="form-group" style="margin: 0;">
                        <label class="form-label">PREFERRED POSITION</label>
                        <select class="form-select" onchange="regFormData.battingPosition = this.value;">
                          <option value="Top Order (1-3)" ${regFormData.battingPosition === 'Top Order (1-3)' ? 'selected' : ''}>Top Order (1-3)</option>
                          <option value="Middle Order (4-5)" ${regFormData.battingPosition === 'Middle Order (4-5)' ? 'selected' : ''}>Middle Order (4-5)</option>
                          <option value="Finisher (6-7)" ${regFormData.battingPosition === 'Finisher (6-7)' ? 'selected' : ''}>Finisher (6-7)</option>
                          <option value="Lower Order (8-11)" ${regFormData.battingPosition === 'Lower Order (8-11)' ? 'selected' : ''}>Lower Order (8-11)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ` : ''}

                <!-- Bowling Branch -->
                ${regFormData.isBowler ? `
                  <div style="display: flex; flex-direction: column; gap: var(--space-3); padding: var(--space-4); background: rgba(5, 150, 105, 0.04); border-radius: var(--radius-sm); border: 1px solid rgba(5, 150, 105, 0.15);">
                    <span class="label-micro" style="color: var(--color-green);">BOWLING ATTRIBUTES</span>
                    <div class="form-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                      <div class="form-group" style="margin: 0;">
                        <label class="form-label">BOWLING ARM</label>
                        <select class="form-select" onchange="regFormData.bowlingArm = this.value;">
                          <option value="Right Arm" ${regFormData.bowlingArm === 'Right Arm' ? 'selected' : ''}>Right Arm</option>
                          <option value="Left Arm" ${regFormData.bowlingArm === 'Left Arm' ? 'selected' : ''}>Left Arm</option>
                        </select>
                      </div>
                      <div class="form-group" style="margin: 0;">
                        <label class="form-label">PACE / SPIN CATEGORY</label>
                        <select class="form-select" onchange="regFormData.bowlingCategory = this.value;">
                          <option value="Fast" ${regFormData.bowlingCategory === 'Fast' ? 'selected' : ''}>Fast / Pace</option>
                          <option value="Medium" ${regFormData.bowlingCategory === 'Medium' ? 'selected' : ''}>Medium Pace</option>
                          <option value="Off Spin" ${regFormData.bowlingCategory === 'Off Spin' ? 'selected' : ''}>Off Spin</option>
                          <option value="Leg Spin" ${regFormData.bowlingCategory === 'Leg Spin' ? 'selected' : ''}>Leg Spin</option>
                          <option value="Left Arm Orthodox" ${regFormData.bowlingCategory === 'Left Arm Orthodox' ? 'selected' : ''}>Left Arm Orthodox</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ` : ''}

                <!-- CricHeroes Details -->
                <div class="form-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">CRICHEROES PROFILE LINK</label>
                    <input type="url" class="form-input" value="${regFormData.cricHeroesUrl}" oninput="regFormData.cricHeroesUrl = this.value;" placeholder="https://cricheroes.com/player-profile/...">
                  </div>
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">CRICHEROES REGISTERED MOBILE</label>
                    <input type="tel" class="form-input" value="${regFormData.cricHeroesMobile}" oninput="regFormData.cricHeroesMobile = this.value;" placeholder="Mobile linked on CricHeroes">
                  </div>
                </div>

                <!-- Starting Base Price Selector (Section 35: Starts null, must be chosen manually) -->
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">AUCTION BASE PRICE (IN CREDITS)</label>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(65px, 1fr)); gap: 8px; margin-top: 4px;">
                    ${basePrices.map(bp => `
                      <button type="button" class="btn" style="${regFormData.basePrice === bp ? 'background: rgba(5, 150, 105, 0.18); border: 2px solid var(--color-green); color: var(--color-green); font-weight: 800;' : 'background: var(--surface-2); border: 1px solid var(--border-subtle); color: var(--text-bright);'} padding: 10px 4px; font-size: 0.875rem;" onclick="regFormData.basePrice = ${bp}; renderCurrentView();">
                        ${bp}C
                      </button>
                    `).join('')}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-faint); margin-top: 6px;">
                    Selected: <strong>${regFormData.basePrice ? regFormData.basePrice + ' Credits' : 'None (Please select)'}</strong>
                  </div>
                </div>

                <!-- Navigation & Submission Buttons -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-4); flex-wrap: wrap; gap: 10px;">
                  <button type="button" class="btn btn-secondary" style="min-height: 48px; padding: 10px 20px;" onclick="regActiveSection = 1; renderCurrentView();">
                    &larr; BACK TO SECTION 1
                  </button>
                  <button type="button" id="submitRegBtn" class="btn btn-primary" style="min-height: 48px; padding: 10px 32px; font-size: 0.9375rem;" onclick="submitPlayerRegistration()">
                    SUBMIT & GENERATE AUCTION PASS &rarr;
                  </button>
                </div>

              </div>
            `}

          </div>

        </div>
      `;
    }"""

old_reg_match = re.search(r"function renderPlayerRegistrationView\(\)\s*\{.*?\}\s*(?=function renderAdminConsoleView)", content, re.DOTALL)
if old_reg_match:
    content = content[:old_reg_match.start()] + new_reg_view + "\n\n    " + content[old_reg_match.end():]

# In admin view under PLAYERS / REGISTRATIONS, add duplicate reconciliation button
content = content.replace(
    '<button class="btn btn-secondary" onclick="exportPlayersCSV()" style="font-size: 0.75rem; padding: 6px 12px; min-height: 32px;">EXPORT CSV</button>',
    '<button class="btn btn-secondary" onclick="detectAndMergeDuplicateRolls()" style="font-size: 0.75rem; padding: 6px 12px; min-height: 32px; margin-right: 6px;">DETECT DUPLICATE ROLLS</button><button class="btn btn-secondary" onclick="exportPlayersCSV()" style="font-size: 0.75rem; padding: 6px 12px; min-height: 32px;">EXPORT CSV</button>'
)

with open("B:/projects/ACC/index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Main index.html patched successfully!")

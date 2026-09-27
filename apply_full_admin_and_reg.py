# apply_full_admin_and_reg.py
import re

with open(r'B:\projects\ACC\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Ensure regFormData has all fields initialized
reg_data_init = '''
    let regActiveSection = 1; // 1: 01 IDENTITY & ACADEMIC, 2: 02 CRICKET PROFILE
    let adminNavTab = 'AUCTION'; // OVERVIEW, TEAMS, PLAYERS, REGISTRATIONS, AUCTION, ROUND 2, UNDO, AUDIT, EXPORT, SETTINGS, ADMIN ACCOUNTS
    let playerSearchQuery = '';
    let playerBucketFilter = 'ALL';
    let playerStatusFilter = 'ALL';
    let playerDeptFilter = 'ALL';

    let regFormData = {
      name: "",
      roll: "",
      mobile: "",
      photo: "",
      department: "CSE",
      program: "B.Tech",
      branch: "CSE",
      entryType: "Regular",
      admissionYear: 2026,
      year: 1,
      bucket: "B1",
      yearDiscrepancy: false,
      isBatter: true,
      battingStyle: "Right Hand",
      battingPosition: "Top Order (1-3)",
      battingArm: "Right Hand",
      isBowler: false,
      bowlingArm: "Right Arm",
      bowlingCategory: "Fast",
      bowlingType: "Swing",
      bowlingRole: "Powerplay specialist",
      isWicketKeeper: false,
      fieldingZone: "Inner Ring",
      preferredFieldingPos: "Cover / Point",
      experienceLevel: "College Team",
      previousAcc: "First Time ACC",
      cricHeroesUrl: "",
      cricHeroesMobile: "",
      cricHeroesStatus: "PROFILE AVAILABLE",
      basePrice: 80
    };

    function derivePlayerType(data) {
      const isWK = !!data.isWicketKeeper;
      const isBat = !!data.isBatter;
      const isBowl = !!data.isBowler;
      if (isWK && isBat) return "WICKET-KEEPER BATTER";
      if (isWK && !isBat) return "WICKET-KEEPER";
      if (isBat && isBowl) return "ALL-ROUNDER";
      if (isBat) return "BATTER";
      if (isBowl) return "BOWLER";
      return "FIELDER";
    }

    function handleRegRollInput(val) {
      regFormData.roll = val.trim();
      const parsed = parseRollNumber(val);
      if (parsed.valid) {
        regFormData.program = parsed.program;
        regFormData.branch = parsed.branch;
        regFormData.entryType = parsed.entryType;
        regFormData.admissionYear = parsed.admissionYear;
        regFormData.year = parsed.year;
        regFormData.bucket = parsed.bucket;
        if (['ECE', 'CSE', 'EEE', 'MECH', 'CSD', 'CSM'].includes(parsed.branch)) {
          regFormData.department = parsed.branch;
        }
      }
      renderCurrentView();
    }
'''

if 'let regFormData =' not in html:
    html = html.replace('let currentView = "public";', reg_data_init + '\n    let currentView = "public";')
    print("Injected regFormData and helpers!")

# 2. Complete Replacement for renderPlayerRegistrationView
new_reg_view = '''function renderPlayerRegistrationView() {
      const parsed = parseRollNumber(regFormData.roll);
      const derivedType = derivePlayerType(regFormData);
      const buckets = ['B1', 'B2', 'B3', 'B4', 'D5', 'M6'];
      const departments = ['ECE', 'CSE', 'EEE', 'MECH', 'CSD', 'CSM', 'OTHERS'];
      const basePrices = [20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 230, 250];

      return `
        <div style="max-width: 820px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-6);">
          
          <!-- Registration Header with Two Distinct Steps -->
          <div class="surface-card" style="padding: var(--space-5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; gap: 10px;">
              <div>
                <span class="label-micro" style="color: var(--color-green);">OFFICIAL ATHLETE ONBOARDING</span>
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
                    Provide your institutional credentials. Your study year and auction bucket are derived automatically from your roll number.
                  </p>
                </div>

                <div class="form-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">COLLEGE ROLL NUMBER</label>
                    <input type="text" class="form-input" id="regRollInput" value="${regFormData.roll}" oninput="handleRegRollInput(this.value)" placeholder="e.g. 26811A0501, 25811A0403, 24597-CM-015" required>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                      Format: B.Tech (YY811A... / YY815A...), Diploma (YY597...), or PG
                    </div>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">FULL NAME (AS PER COLLEGE ID)</label>
                    <input type="text" class="form-input" id="regNameInput" value="${regFormData.name}" oninput="regFormData.name = this.value;" placeholder="e.g. Sai Teja" required>
                  </div>
                </div>

                <div class="form-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">MOBILE NUMBER (CONFIDENTIAL)</label>
                    <input type="tel" class="form-input" id="regMobileInput" value="${regFormData.mobile}" oninput="regFormData.mobile = this.value;" placeholder="e.g. 9876543210" required>
                    <div style="font-size: 0.75rem; color: var(--text-faint); margin-top: 4px;">
                      Never exposed to public or non-admin viewports.
                    </div>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">OFFICIAL PHOTO (4:3 RATIO)</label>
                    <input type="file" accept="image/*" class="form-input" onchange="handlePhotoUpload(this)" style="padding: 7px 12px;">
                  </div>
                </div>

                <!-- Department Selector (NO ICONS, Clean Segmented Controls) -->
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">DEPARTMENT SELECTION</label>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 8px; margin-top: 4px;">
                    ${departments.map(dept => `
                      <button type="button" class="btn" style="${regFormData.department === dept ? 'background: rgba(5, 150, 105, 0.15); border: 2px solid var(--color-green); color: var(--color-green); font-weight: 800;' : 'background: var(--surface-2); border: 1px solid var(--border-subtle); color: var(--text-bright);'} padding: 10px 4px; font-size: 0.8125rem;" onclick="regFormData.department = '${dept}'; if('${dept}' !== 'OTHERS') regFormData.branch = '${dept}'; renderCurrentView();">
                        ${dept}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- Auto-Derived Academic Readout -->
                <div style="background: var(--surface-2); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <div class="label-micro" style="color: var(--color-green); margin-bottom: 8px;">
                    AUTOMATICALLY DERIVED ACADEMIC CLASSIFICATION
                  </div>
                  <div class="responsive-stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    <div class="surface-subtle" style="padding: 8px; text-align: center;">
                      <span class="label-micro" style="font-size: 0.65rem;">PROGRAM</span>
                      <div style="font-weight: 700; color: var(--text-bright); margin-top: 2px;">${regFormData.program}</div>
                    </div>
                    <div class="surface-subtle" style="padding: 8px; text-align: center;">
                      <span class="label-micro" style="font-size: 0.65rem;">BRANCH</span>
                      <div style="font-weight: 700; color: var(--text-bright); margin-top: 2px;">${regFormData.branch}</div>
                    </div>
                    <div class="surface-subtle" style="padding: 8px; text-align: center;">
                      <span class="label-micro" style="font-size: 0.65rem;">ENTRY TYPE</span>
                      <div style="font-weight: 700; color: var(--text-bright); margin-top: 2px;">${regFormData.entryType}</div>
                    </div>
                    <div class="surface-subtle" style="padding: 8px; text-align: center;">
                      <span class="label-micro" style="font-size: 0.65rem;">STUDY YEAR</span>
                      <div style="font-weight: 700; color: var(--text-bright); margin-top: 2px;">Year ${regFormData.year}</div>
                    </div>
                  </div>
                </div>

                <!-- Horizontal Locked Bucket Indicator -->
                <div class="form-group" style="margin-bottom: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <label class="form-label" style="margin: 0;">AUCTION BUCKET CLASSIFICATION</label>
                    <span class="status-badge status-connected" style="font-size: 0.65rem; padding: 2px 6px;">AUTO CLASSIFIED (LOCKED)</span>
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">
                    ${buckets.map(b => {
                      const isActive = regFormData.bucket === b;
                      return `
                        <div style="${isActive ? 'background: rgba(5, 150, 105, 0.18); border: 2px solid var(--color-green); color: var(--color-green);' : 'background: var(--surface-2); border: 1px solid var(--border-subtle); color: var(--text-muted); opacity: 0.65;'} padding: 12px 4px; text-align: center; border-radius: var(--radius-sm); font-weight: 800;">
                          <div style="font-size: 1.15rem;">${b}</div>
                          <div style="font-size: 0.6rem; letter-spacing: 0.02em; margin-top: 2px;">
                            ${b === 'D5' ? 'Diploma' : b === 'M6' ? 'PG' : 'Year ' + b.slice(1)}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-faint); margin-top: 6px;">
                    Bucket is deterministic and locked from manual modification. Only Super Admin can override.
                  </div>
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
                    Provide your detailed cricket skills, experience, CricHeroes profile, and select your entering base price.
                  </p>
                </div>

                <!-- Derived Player Type Banner -->
                <div style="background: rgba(5, 150, 105, 0.12); border: 1.5px solid var(--color-green); padding: 12px 18px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                  <div>
                    <span class="label-micro" style="color: var(--color-green); margin: 0;">AUTHORITATIVE DERIVED PLAYER TYPE</span>
                    <div style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 800; color: var(--color-green); margin-top: 2px;">
                      ${derivedType}
                    </div>
                  </div>
                  <span class="status-badge status-connected">DERIVED FROM SKILLS</span>
                </div>

                <!-- Branching Questionnaire: BATTER -->
                <div class="surface-subtle" style="padding: var(--space-4);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <label class="form-label" style="margin: 0; font-size: 0.875rem;">ARE YOU A BATTER?</label>
                    <div style="display: flex; gap: 8px;">
                      <button type="button" class="btn ${regFormData.isBatter ? 'btn-primary' : 'btn-secondary'}" style="min-height: 32px; padding: 4px 14px; font-size: 0.75rem;" onclick="regFormData.isBatter = true; renderCurrentView();">YES</button>
                      <button type="button" class="btn ${!regFormData.isBatter ? 'btn-primary' : 'btn-secondary'}" style="min-height: 32px; padding: 4px 14px; font-size: 0.75rem;" onclick="regFormData.isBatter = false; renderCurrentView();">NO</button>
                    </div>
                  </div>

                  ${regFormData.isBatter ? `
                    <div class="form-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                      <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">BATTING STYLE</label>
                        <select class="form-select" onchange="regFormData.battingStyle = this.value;">
                          <option value="Right Hand" ${regFormData.battingStyle === 'Right Hand' ? 'selected' : ''}>Right Hand</option>
                          <option value="Left Hand" ${regFormData.battingStyle === 'Left Hand' ? 'selected' : ''}>Left Hand</option>
                        </select>
                      </div>
                      <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">PREFERRED BATTING POSITION</label>
                        <select class="form-select" onchange="regFormData.battingPosition = this.value;">
                          <option value="Top Order (1-3)" ${regFormData.battingPosition === 'Top Order (1-3)' ? 'selected' : ''}>Top Order (1–3)</option>
                          <option value="Middle Order (4-6)" ${regFormData.battingPosition === 'Middle Order (4-6)' ? 'selected' : ''}>Middle Order (4–6)</option>
                          <option value="Finisher / Lower Order (7+)" ${regFormData.battingPosition === 'Finisher / Lower Order (7+)' ? 'selected' : ''}>Finisher / Lower Order (7+)</option>
                        </select>
                      </div>
                    </div>
                  ` : ''}
                </div>

                <!-- Branching Questionnaire: BOWLER -->
                <div class="surface-subtle" style="padding: var(--space-4);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <label class="form-label" style="margin: 0; font-size: 0.875rem;">ARE YOU A BOWLER?</label>
                    <div style="display: flex; gap: 8px;">
                      <button type="button" class="btn ${regFormData.isBowler ? 'btn-primary' : 'btn-secondary'}" style="min-height: 32px; padding: 4px 14px; font-size: 0.75rem;" onclick="regFormData.isBowler = true; renderCurrentView();">YES</button>
                      <button type="button" class="btn ${!regFormData.isBowler ? 'btn-primary' : 'btn-secondary'}" style="min-height: 32px; padding: 4px 14px; font-size: 0.75rem;" onclick="regFormData.isBowler = false; renderCurrentView();">NO</button>
                    </div>
                  </div>

                  ${regFormData.isBowler ? `
                    <div class="form-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                      <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">BOWLING ARM</label>
                        <select class="form-select" onchange="regFormData.bowlingArm = this.value;">
                          <option value="Right Arm" ${regFormData.bowlingArm === 'Right Arm' ? 'selected' : ''}>Right Arm</option>
                          <option value="Left Arm" ${regFormData.bowlingArm === 'Left Arm' ? 'selected' : ''}>Left Arm</option>
                        </select>
                      </div>
                      <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">BOWLING DISCIPLINE & TYPE</label>
                        <select class="form-select" onchange="regFormData.bowlingType = this.value;">
                          <optgroup label="Fast / Pace">
                            <option value="Swing" ${regFormData.bowlingType === 'Swing' ? 'selected' : ''}>Pace — Swing</option>
                            <option value="Seam" ${regFormData.bowlingType === 'Seam' ? 'selected' : ''}>Pace — Seam</option>
                            <option value="Express Pace" ${regFormData.bowlingType === 'Express Pace' ? 'selected' : ''}>Express Pace</option>
                          </optgroup>
                          <optgroup label="Spin">
                            <option value="Off-spin" ${regFormData.bowlingType === 'Off-spin' ? 'selected' : ''}>Spin — Off-spin</option>
                            <option value="Leg-spin" ${regFormData.bowlingType === 'Leg-spin' ? 'selected' : ''}>Spin — Leg-spin</option>
                            <option value="Left-arm orthodox" ${regFormData.bowlingType === 'Left-arm orthodox' ? 'selected' : ''}>Left-arm Orthodox</option>
                            <option value="Left-arm wrist spin" ${regFormData.bowlingType === 'Left-arm wrist spin' ? 'selected' : ''}>Left-arm Wrist Spin</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                    <div class="form-group" style="margin-top: 10px; margin-bottom: 0;">
                      <label class="form-label">TACTICAL BOWLING ROLE</label>
                      <select class="form-select" onchange="regFormData.bowlingRole = this.value;">
                        <option value="Powerplay specialist" ${regFormData.bowlingRole === 'Powerplay specialist' ? 'selected' : ''}>Powerplay Specialist</option>
                        <option value="Economical bowler" ${regFormData.bowlingRole === 'Economical bowler' ? 'selected' : ''}>Economical Middle-Overs Bowler</option>
                        <option value="Death-over specialist" ${regFormData.bowlingRole === 'Death-over specialist' ? 'selected' : ''}>Death-Over Specialist</option>
                        <option value="Wicket-taking bowler" ${regFormData.bowlingRole === 'Wicket-taking bowler' ? 'selected' : ''}>Strike / Wicket-Taking Bowler</option>
                      </select>
                    </div>
                  ` : ''}
                </div>

                <!-- Branching Questionnaire: WICKET KEEPER -->
                <div class="surface-subtle" style="padding: var(--space-4);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <label class="form-label" style="margin: 0; font-size: 0.875rem;">ARE YOU A WICKET-KEEPER?</label>
                    <div style="display: flex; gap: 8px;">
                      <button type="button" class="btn ${regFormData.isWicketKeeper ? 'btn-primary' : 'btn-secondary'}" style="min-height: 32px; padding: 4px 14px; font-size: 0.75rem;" onclick="regFormData.isWicketKeeper = true; renderCurrentView();">YES</button>
                      <button type="button" class="btn ${!regFormData.isWicketKeeper ? 'btn-primary' : 'btn-secondary'}" style="min-height: 32px; padding: 4px 14px; font-size: 0.75rem;" onclick="regFormData.isWicketKeeper = false; renderCurrentView();">NO</button>
                    </div>
                  </div>

                  ${!regFormData.isWicketKeeper ? `
                    <div class="form-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                      <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">FIELDING ZONE AFFINITY</label>
                        <select class="form-select" onchange="regFormData.fieldingZone = this.value;">
                          <option value="Inner Ring">Inner Ring (30-yard circle)</option>
                          <option value="Outfield / Boundary">Deep Outfield / Boundary</option>
                          <option value="Close-in catcher">Close-in Catcher (Slips/Short Leg)</option>
                        </select>
                      </div>
                      <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">PREFERRED FIELDING POSITION</label>
                        <select class="form-select" onchange="regFormData.preferredFieldingPos = this.value;">
                          <option value="Cover / Point">Cover / Point</option>
                          <option value="Slips / Gully">Slips / Gully</option>
                          <option value="Long on / Long off">Long on / Long off</option>
                          <option value="Mid-wicket">Mid-wicket</option>
                          <option value="Any Position">Any Position</option>
                        </select>
                      </div>
                    </div>
                  ` : ''}
                </div>

                <!-- BASE PRICE SELECTION (Section 22) -->
                <div class="form-group" style="margin-bottom: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <label class="form-label" style="margin: 0;">AUCTION BASE PRICE</label>
                    <span class="price-display" style="font-size: 1.15rem; color: var(--color-green);">
                      BASE PRICE [ ${regFormData.basePrice} CREDITS ]
                    </span>
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(50px, 1fr)); gap: 6px;">
                    ${basePrices.map(bp => `
                      <button type="button" class="btn" style="${regFormData.basePrice === bp ? 'background: var(--color-green); color: white; font-weight: 800;' : 'background: var(--surface-2); border: 1px solid var(--border-subtle); color: var(--text-bright);'} padding: 8px 4px; font-size: 0.8125rem;" onclick="regFormData.basePrice = ${bp}; renderCurrentView();">
                        ${bp}C
                      </button>
                    `).join('')}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                    Base price ceiling is 250 Credits. Live bidding escalation during auction may exceed 250.
                  </div>
                </div>

                <!-- CRICHEROES VERIFICATION (Section 23) -->
                <div style="background: var(--surface-2); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: var(--space-3);">
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <span class="label-micro" style="color: var(--color-green); margin: 0;">CRICHEROES INTEGRATION</span>
                    <div style="display: flex; gap: 6px;">
                      <button type="button" class="btn ${regFormData.cricHeroesStatus === 'PROFILE AVAILABLE' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 0.6875rem; padding: 3px 8px; min-height: 28px;" onclick="regFormData.cricHeroesStatus = 'PROFILE AVAILABLE'; renderCurrentView();">
                        PROFILE AVAILABLE
                      </button>
                      <button type="button" class="btn ${regFormData.cricHeroesStatus === 'PROFILE CREATION PENDING' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 0.6875rem; padding: 3px 8px; min-height: 28px;" onclick="regFormData.cricHeroesStatus = 'PROFILE CREATION PENDING'; renderCurrentView();">
                        CREATION PENDING
                      </button>
                    </div>
                  </div>

                  <div class="form-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">CRICHEROES PROFILE LINK</label>
                      <input type="url" class="form-input" value="${regFormData.cricHeroesUrl}" oninput="regFormData.cricHeroesUrl = this.value;" placeholder="https://cricheroes.com/player-profile/...">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">REGISTERED MOBILE ON CRICHEROES</label>
                      <input type="tel" class="form-input" value="${regFormData.cricHeroesMobile}" oninput="regFormData.cricHeroesMobile = this.value;" placeholder="e.g. 9876543210">
                    </div>
                  </div>
                </div>

                <!-- Navigation & Submission Buttons -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-4); flex-wrap: wrap; gap: 10px;">
                  <button type="button" class="btn btn-secondary" style="min-height: 48px; padding: 10px 20px;" onclick="regActiveSection = 1; renderCurrentView();">
                    &larr; BACK TO SECTION 1
                  </button>
                  <button type="button" class="btn btn-primary" style="min-height: 48px; padding: 10px 32px; font-size: 0.9375rem;" onclick="submitPlayerRegistration()">
                    SUBMIT & GENERATE AUCTION PASS &rarr;
                  </button>
                </div>

              </div>
            `}

          </div>

        </div>
      `;
    }'''

# Replace renderPlayerRegistrationView
start_reg = html.find('function renderPlayerRegistrationView() {')
start_admin = html.find('function renderAdminConsoleView() {')
if start_reg != -1 and start_admin != -1:
    html = html[:start_reg] + new_reg_view + '\n\n    ' + html[start_admin:]
    print("Replaced renderPlayerRegistrationView with two-section layout!")

# Write updated HTML
with open(r'B:\projects\ACC\index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print(f"Updated index.html after registration view, length: {len(html)}")

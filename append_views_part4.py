# append_views_part4.py
with open(r'B:\projects\ACC\generate_acc_2026.py', 'a', encoding='utf-8') as f:
    f.write(r'''
    // ========================================================
    // 9. VIEW 5: 11 FRANCHISES DOSSIERS & SQUADS
    // ========================================================
    function render11FranchisesView() {
      return `
        <div style="margin-bottom: 32px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
            <div>
              <span class="eyebrow" style="color: var(--primary);">OFFICIAL EVENT REGISTRY</span>
              <h1 class="display-title" style="font-size: 32px;">11 PARTICIPATING FRANCHISES</h1>
              <div style="font-size: 13px; color: var(--text-dim);">Dossiers, Faculty Coordinators, Captains, and Authorized Squads.</div>
            </div>
            <button class="btn btn-primary" onclick="switchView('franchise')">
              ENTER FRANCHISE TERMINAL →
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px;">
            ${franchises.map(f => {
              const maxLegal = calculateMaxBid(f);
              const isUserTeam = currentUser.franchiseId === f.id;

              return `
                <div class="surface-card" style="padding: 24px; border-color: ${isUserTeam ? 'var(--primary)' : 'var(--border-subtle)'};">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(255,255,255,0.06); color: ${f.color}; display: grid; place-items: center; font-size: 18px; font-weight: 800; font-family: var(--font-sports); border: 1px solid var(--border-medium);">
                        ${f.short}
                      </div>
                      <div>
                        <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright);">${f.name}</div>
                        <span class="status-pill pill-green" style="font-size: 9px; padding: 2px 6px;">${f.approval}</span>
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <span class="eyebrow">PURSE</span>
                      <div class="sports-price" style="font-size: 20px; color: var(--primary);">${f.purse}C</div>
                    </div>
                  </div>

                  <!-- FACULTY COORDINATOR INFO (PHONE PRIVACY PROTECTED) -->
                  <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px; margin-bottom: 14px; font-size: 12px;">
                    <div style="color: var(--text-dim); margin-bottom: 2px;">Faculty Coordinator (Primary Login):</div>
                    <div style="font-weight: 700; color: var(--text-bright);">${f.faculty} • Dept. of ${f.dept}</div>
                    <div style="margin-top: 4px; color: var(--text-faint);">
                      Mobile: ${isUserTeam || currentUser.role === 'SUPER_ADMIN' ? `<strong style="color: var(--primary);">${f.mobile}</strong>` : '🔒 Private (Authorized only)'}
                    </div>
                  </div>

                  <!-- CAPTAIN & VC INFO -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; font-size: 12px;">
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px;">
                      <span class="eyebrow" style="font-size: 9px;">CAPTAIN (LOGIN 2)</span>
                      <div style="font-weight: 800; color: var(--text-bright); margin-top: 2px;">${f.captain}</div>
                      <div style="font-size: 10px; color: var(--text-faint); margin-top: 2px;">
                        ${isUserTeam || currentUser.role === 'SUPER_ADMIN' ? f.captainMobile : '🔒 Private'}
                      </div>
                    </div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px;">
                      <span class="eyebrow" style="font-size: 9px;">VICE-CAPTAIN</span>
                      <div style="font-weight: 800; color: var(--text-bright); margin-top: 2px;">${f.vc}</div>
                      <div style="font-size: 10px; color: var(--primary); margin-top: 2px;">0C (Pre-retained)</div>
                    </div>
                  </div>

                  <!-- METRICS SUMMARY -->
                  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 12px; font-size: 12px;">
                    <span style="color: var(--text-dim);">Squad Fill: <strong>${f.bought}/17</strong></span>
                    <span style="color: var(--text-dim);">Max Legal Bid: <strong style="color: var(--auction);">${maxLegal}C</strong></span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // ========================================================
    // 10. VIEW 6: PLAYER PORTAL (/player)
    // ========================================================
    let playerJerseyName = "ARJUN";
    let playerJerseySize = "L";
    let playerPreferredSlot = "Top Order (1-3)";

    function renderPlayerPortalView() {
      const p = players.find(x => x.id === "023") || players[0];

      return `
        <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
          <!-- PORTAL HEADER -->
          <div class="surface-elevated" style="padding: 28px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
              <div>
                <span class="eyebrow" style="color: var(--primary);">STUDENT ATHLETE ACCESS</span>
                <h1 class="display-title" style="font-size: 28px;">PLAYER OPERATING PORTAL</h1>
                <div style="font-size: 13px; color: var(--text-dim);">Manage your profile, CricHeroes records, and auction verification status.</div>
              </div>
              <span class="status-pill pill-green"><div class="pulse-dot"></div>PROFILE 92% COMPLETE</span>
            </div>

            <!-- KEY VERIFICATION BADGES STRIP -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; border-top: 1px solid var(--border-subtle); padding-top: 18px;">
              <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 10px; text-align: center;">
                <span class="eyebrow">CRICHEROES</span>
                <div style="font-weight: 800; color: var(--primary); margin-top: 2px;">✓ VERIFIED</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 10px; text-align: center;">
                <span class="eyebrow">REGISTRATION FEE</span>
                <div style="font-weight: 800; color: var(--primary); margin-top: 2px;">✓ PAID (₹500)</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 10px; text-align: center;">
                <span class="eyebrow">AUCTION ELIGIBILITY</span>
                <div style="font-weight: 800; color: var(--primary); margin-top: 2px;">ELIGIBLE</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 10px; text-align: center;">
                <span class="eyebrow">BASE PRICE</span>
                <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 800; color: var(--auction); margin-top: 2px;">40 CREDITS</div>
              </div>
            </div>
          </div>

          <!-- ACADEMIC & CRICKET DOSSIER -->
          <div class="surface-card" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h2 style="font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text-bright);">ACADEMIC & CRICKET PROFILE</h2>
              <span class="status-pill pill-grey">BUCKET ${p.bucket}</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 13px;">
              <div>
                <span class="eyebrow">FULL NAME</span>
                <div style="font-weight: 700; color: var(--text-bright); margin-top: 2px;">${p.name}</div>
              </div>
              <div>
                <span class="eyebrow">STUDENT ROLL NUMBER</span>
                <div style="font-family: var(--font-mono); font-weight: 700; color: var(--text-bright); margin-top: 2px;">${p.roll}</div>
              </div>
              <div>
                <span class="eyebrow">PROGRAM & BRANCH</span>
                <div style="color: var(--text-bright); margin-top: 2px;">${p.program} ${p.branch} (${p.year})</div>
              </div>
              <div>
                <span class="eyebrow">DERIVED CRICKET DISCIPLINE</span>
                <div style="color: var(--primary); font-weight: 700; margin-top: 2px;">${p.type}</div>
              </div>
            </div>

            <!-- CRICHEROES CAREER STATISTICS -->
            <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px; margin-top: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span class="eyebrow" style="color: var(--auction);">CRICHEROES CAREER STATS (VERIFIED)</span>
                <span style="font-size: 11px; color: var(--text-dim);">Profile ID: #CH-882194</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center;">
                <div>
                  <div class="sports-price" style="font-size: 22px; color: var(--text-bright);">${p.stats.matches}</div>
                  <div class="eyebrow" style="font-size: 9px;">MATCHES</div>
                </div>
                <div>
                  <div class="sports-price" style="font-size: 22px; color: var(--auction);">${p.stats.runs}</div>
                  <div class="eyebrow" style="font-size: 9px;">RUNS</div>
                </div>
                <div>
                  <div class="sports-price" style="font-size: 22px; color: var(--primary);">${p.stats.wickets}</div>
                  <div class="eyebrow" style="font-size: 9px;">WICKETS</div>
                </div>
                <div>
                  <div class="sports-price" style="font-size: 22px; color: var(--text-bright);">142.6</div>
                  <div class="eyebrow" style="font-size: 9px;">STRIKE RATE</div>
                </div>
              </div>
            </div>
          </div>

          <!-- PERMITTED DETAILS EDITOR -->
          <div class="surface-card" style="padding: 24px;">
            <h2 style="font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text-bright); margin-bottom: 14px;">PERMITTED TOURNAMENT PREFERENCES</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div class="form-group">
                <label class="form-label">JERSEY NAME (BACK OF SHIRT)</label>
                <input type="text" class="form-input" id="jerseyNameInput" value="${playerJerseyName}">
              </div>
              <div class="form-group">
                <label class="form-label">JERSEY SIZE</label>
                <select class="form-select" id="jerseySizeInput">
                  <option value="S" ${playerJerseySize === 'S' ? 'selected' : ''}>Small (38)</option>
                  <option value="M" ${playerJerseySize === 'M' ? 'selected' : ''}>Medium (40)</option>
                  <option value="L" ${playerJerseySize === 'L' ? 'selected' : ''}>Large (42)</option>
                  <option value="XL" ${playerJerseySize === 'XL' ? 'selected' : ''}>X-Large (44)</option>
                </select>
              </div>
            </div>
            <button class="btn btn-primary" onclick="savePlayerPreferences()">
              SAVE TOURNAMENT PREFERENCES
            </button>
          </div>
        </div>
      `;
    }

    function savePlayerPreferences() {
      const jName = document.getElementById("jerseyNameInput");
      const jSize = document.getElementById("jerseySizeInput");
      if (jName) playerJerseyName = jName.value;
      if (jSize) playerJerseySize = jSize.value;
      showToast("Player preferences updated successfully!", "success");
    }

    // ========================================================
    // 11. VIEW 7: PLAYER REGISTRATION & ROLL PARSER
    // ========================================================
    let regRoll = "23591-A-0402";
    let regName = "Arjun Kumar";
    let regBatting = "yes";
    let regBowling = "yes";
    let regFielding = "no";
    let regBowlingType = "Fast";

    function parseRoll(roll) {
      roll = roll.trim().toUpperCase();
      let match = roll.match(/^(\d{2})591-A-(01|02|03|04|05|12|42|43|44|54)[0-9A-Z]{2}$/);
      if (match) {
        const yearMap = { "22": { b: "B4", y: "4th Year" }, "23": { b: "B3", y: "3rd Year" }, "24": { b: "B2", y: "2nd Year" }, "25": { b: "B1", y: "1st Year" } };
        const branchMap = { "01": "CIVIL", "02": "EEE", "03": "MECH", "04": "ECE", "05": "CSE", "12": "IT", "42": "CSM", "43": "CAI", "44": "CSD", "54": "AID" };
        const yr = yearMap[match[1]] || { b: "B3", y: "3rd Year" };
        return { valid: true, program: "B.Tech", branch: branchMap[match[2]], year: yr.y, bucket: yr.b };
      }
      return { valid: true, program: "B.Tech", branch: "ECE", year: "3rd Year", bucket: "B3" };
    }

    function renderPlayerRegistrationView() {
      const parsed = parseRoll(regRoll);
      let derived = "All-Rounder";
      if (regBatting === "yes" && regBowling === "no") derived = "Specialist Batter";
      if (regBatting === "no" && regBowling === "yes") derived = "Specialist Bowler";
      if (regFielding === "yes") derived = "Wicket-Keeper Batter";

      return `
        <div style="max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
          <div class="surface-elevated" style="padding: 28px;">
            <span class="eyebrow" style="color: var(--primary);">OFFICIAL CANDIDATE ENTRY</span>
            <h1 class="display-title" style="font-size: 28px; margin-top: 2px;">PLAYER REGISTRATION PORTAL</h1>
            <div style="font-size: 13px; color: var(--text-dim); margin-top: 4px;">Submit verified academic credentials and cricket performance profile.</div>
          </div>

          <div class="surface-card" style="padding: 24px;">
            <div class="form-group">
              <label class="form-label">STUDENT ROLL NUMBER (AUTOMATIC BRANCH & YEAR PARSING)</label>
              <input type="text" class="form-input" value="${regRoll}" oninput="regRoll = this.value; renderCurrentView();">
            </div>

            <!-- PARSED ACADEMIC BADGES -->
            <div style="background: rgba(25, 195, 125, 0.08); border: 1px solid rgba(25, 195, 125, 0.25); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
              <span class="eyebrow" style="color: var(--primary);">AUTOMATICALLY PARSED ACADEMIC ATTRIBUTES</span>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 8px;">
                <div><span class="eyebrow">PROGRAM</span><div style="font-weight: 800; color: var(--text-bright);">${parsed.program}</div></div>
                <div><span class="eyebrow">BRANCH</span><div style="font-weight: 800; color: var(--text-bright);">${parsed.branch}</div></div>
                <div><span class="eyebrow">YEAR</span><div style="font-weight: 800; color: var(--text-bright);">${parsed.year}</div></div>
                <div><span class="eyebrow">BUCKET</span><div style="font-weight: 800; color: var(--auction);">${parsed.bucket}</div></div>
              </div>
            </div>

            <!-- BRANCHING SKILL QUESTIONNAIRE -->
            <div style="margin-bottom: 20px;">
              <label class="form-label">BATTING COMPETENCY</label>
              <div style="display: flex; gap: 10px; margin-top: 6px;">
                <button class="btn ${regBatting === 'yes' ? 'btn-primary' : 'btn-secondary'}" onclick="regBatting = 'yes'; renderCurrentView();">YES • Skilled Batter</button>
                <button class="btn ${regBatting === 'no' ? 'btn-primary' : 'btn-secondary'}" onclick="regBatting = 'no'; renderCurrentView();">NO</button>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <label class="form-label">BOWLING COMPETENCY</label>
              <div style="display: flex; gap: 10px; margin-top: 6px;">
                <button class="btn ${regBowling === 'yes' ? 'btn-primary' : 'btn-secondary'}" onclick="regBowling = 'yes'; renderCurrentView();">YES • Skilled Bowler</button>
                <button class="btn ${regBowling === 'no' ? 'btn-primary' : 'btn-secondary'}" onclick="regBowling = 'no'; renderCurrentView();">NO</button>
              </div>
            </div>

            <!-- DERIVED DISCIPLINE -->
            <div style="background: rgba(255, 138, 31, 0.08); border: 1px solid rgba(255, 138, 31, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
              <span class="eyebrow" style="color: var(--auction);">DERIVED DISCIPLINE</span>
              <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright); margin-top: 2px;">
                ${derived}
              </div>
            </div>

            <button class="btn btn-primary" style="width: 100%; height: 44px; font-size: 15px;" onclick="showToast('Registration submitted for Super Admin review!', 'success')">
              SUBMIT TOURNAMENT REGISTRATION
            </button>
          </div>
        </div>
      `;
    }
''')
    print("Dossiers, player portal and registration views appended.")

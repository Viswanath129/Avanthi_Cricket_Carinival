# -*- coding: utf-8 -*-
# build_part3_views.py

PART3_VIEWS = r'''
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
                <span class="label-micro" style="color: var(--color-green);">ATHLETE REGISTRATION WORKFLOW</span>
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
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
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
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
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
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
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
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
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
          
          <!-- Athlete Profile Header -->
          <div class="surface-card" style="padding: var(--space-5);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
              <div style="display: flex; gap: 14px; align-items: center;">
                ${getPlayerAvatar(p, 80, 100)}
                <div>
                  <span class="label-micro" style="color: var(--color-green);">ATHLETE PORTAL</span>
                  <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text-bright); margin: 2px 0;">${p.name}</h2>
                  <div class="font-mono" style="font-size: 0.8125rem; color: var(--text-muted);">
                    Roll: ${p.roll} • Athlete ID #${p.id}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-faint); margin-top: 2px;">
                    ${p.program} · ${p.branch} · Year ${p.year}
                  </div>
                </div>
              </div>
              <span class="status-badge status-connected">VERIFIED ATHLETE</span>
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
                  Athlete is eligible for accelerated recall during Round 2 bidding upon franchise nomination.
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
            <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
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

          <!-- Current Lot Operational Arena -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-6);">
            
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
              <img src="acc-logo.jpg" alt="ACC Logo" style="width: 48px; height: 48px; border-radius: 12px; object-fit: cover; background: #fff; border: 1.5px solid var(--border-medium); box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
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
'''

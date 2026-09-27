# append_views_part2.py
with open(r'B:\projects\ACC\generate_acc_2026.py', 'a', encoding='utf-8') as f:
    f.write(r'''
    // ========================================================
    // 5. VIEW 1: PUBLIC PORTAL (UNAUTHENTICATED)
    // ========================================================
    let publicSearchQuery = "";
    let publicBucketFilter = "ALL";
    let publicRoleFilter = "ALL";

    function renderPublicView() {
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const scarcity = getTournamentScarcity();

      const filteredPlayers = players.filter(p => {
        if (publicSearchQuery && !p.name.toLowerCase().includes(publicSearchQuery.toLowerCase()) && !p.roll.toLowerCase().includes(publicSearchQuery.toLowerCase())) return false;
        if (publicBucketFilter !== "ALL" && p.bucket !== publicBucketFilter) return false;
        if (publicRoleFilter !== "ALL" && !p.type.includes(publicRoleFilter)) return false;
        return true;
      });

      return `
        ${scarcity.scarce ? `
          <div class="scarcity-banner">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="status-pill pill-yellow">⚠ SCARCITY ALERT</span>
              <div style="font-weight: 700; color: var(--text-bright);">
                Bucket ${scarcity.bucket}: Only ${scarcity.remaining} players remain with ${scarcity.required} required across franchises.
              </div>
            </div>
            <div style="font-size: 12px; color: var(--warning); font-weight: 600;">BIDDING REMAINS OPEN</div>
          </div>
        ` : ''}

        <!-- HERO SECTION -->
        <section class="surface-elevated" style="padding: 40px; margin-bottom: 32px; background: linear-gradient(135deg, rgba(29, 45, 36, 0.7), rgba(14, 24, 19, 0.9));">
          <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 32px; align-items: center;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                <span class="status-pill pill-green"><div class="pulse-dot"></div>ROUND 01 • B.TECH 3RD YEAR</span>
                <span class="eyebrow">AVANTHI AUDITORIUM MAIN STAGE</span>
              </div>
              <h1 class="display-title" style="font-size: clamp(2.4rem, 4.5vw, 4.2rem); margin-bottom: 12px;">
                THE AUCTION<br><span style="color: var(--primary);">IS LIVE.</span>
              </h1>
              <p style="font-size: 1.05rem; color: var(--text-dim); max-width: 540px; margin-bottom: 24px;">
                11 franchises. Hundreds of collegiate cricketers. One authoritative real-time operating system.
              </p>
              <div style="display: flex; gap: 14px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="switchView('live')">
                  WATCH LIVE AUCTION →
                </button>
                <button class="btn btn-secondary" onclick="document.getElementById('playerDirectorySec').scrollIntoView({ behavior: 'smooth' })">
                  EXPLORE PLAYERS
                </button>
              </div>
            </div>

            <!-- LIVE LOT MINI-TERMINAL PREVIEW -->
            <div class="surface-card" style="padding: 24px; border-color: var(--border-medium); background: var(--bg-card);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <span class="eyebrow" style="color: var(--auction);">ACTIVE ON FLOOR • LOT #${cur.id}</span>
                <span class="status-pill pill-orange">BUCKET ${cur.bucket}</span>
              </div>
              <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px;">
                <div style="width: 64px; height: 64px; border-radius: 12px; background: rgba(255,255,255,0.06); display: grid; place-items: center; font-size: 24px; border: 1px solid var(--border-subtle);">
                  🏏
                </div>
                <div>
                  <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright);">${cur.name}</div>
                  <div style="font-size: 12px; color: var(--text-dim);">${cur.type} • ${cur.program} ${cur.branch}</div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
                <div>
                  <span class="eyebrow">CURRENT BID</span>
                  <div class="sports-price" style="font-size: 28px; color: var(--auction);">${currentPrice} C</div>
                </div>
                <div>
                  <span class="eyebrow">LEADING TEAM</span>
                  <div style="font-weight: 800; font-size: 18px; color: var(--text-bright);">${leader ? leader.name : "None"}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- PUBLIC PLAYERS DIRECTORY -->
        <section id="playerDirectorySec" style="margin-bottom: 48px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 14px;">
            <div>
              <span class="eyebrow" style="color: var(--primary);">PHASE 1 PUBLIC ACCESS</span>
              <h2 class="display-title" style="font-size: 28px;">REGISTERED PLAYER ROSTER</h2>
              <div style="font-size: 13px; color: var(--text-dim);">Confidential phone numbers are omitted per privacy policy.</div>
            </div>

            <!-- SEARCH & FILTERS -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <input type="text" class="form-input" style="width: 220px;" placeholder="Search name or roll..." value="${publicSearchQuery}" oninput="publicSearchQuery = this.value; renderCurrentView();">
              <select class="form-select" style="width: 140px;" onchange="publicBucketFilter = this.value; renderCurrentView();">
                <option value="ALL">All Buckets</option>
                <option value="B3" ${publicBucketFilter === 'B3' ? 'selected' : ''}>B3 (3rd Yr)</option>
                <option value="B4" ${publicBucketFilter === 'B4' ? 'selected' : ''}>B4 (4th Yr)</option>
                <option value="B2" ${publicBucketFilter === 'B2' ? 'selected' : ''}>B2 (2nd Yr)</option>
                <option value="B5" ${publicBucketFilter === 'B5' ? 'selected' : ''}>B5 (Diploma)</option>
                <option value="B1" ${publicBucketFilter === 'B1' ? 'selected' : ''}>B1 (1st Yr)</option>
                <option value="PG" ${publicBucketFilter === 'PG' ? 'selected' : ''}>PG (Masters)</option>
              </select>
              <select class="form-select" style="width: 140px;" onchange="publicRoleFilter = this.value; renderCurrentView();">
                <option value="ALL">All Roles</option>
                <option value="Batter" ${publicRoleFilter === 'Batter' ? 'selected' : ''}>Batter</option>
                <option value="Bowler" ${publicRoleFilter === 'Bowler' ? 'selected' : ''}>Bowler</option>
                <option value="All-Rounder" ${publicRoleFilter === 'All-Rounder' ? 'selected' : ''}>All-Rounder</option>
                <option value="Keeper" ${publicRoleFilter === 'Keeper' ? 'selected' : ''}>Wicket-Keeper</option>
              </select>
            </div>
          </div>

          <!-- PLAYERS GRID -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
            ${filteredPlayers.map(p => `
              <div class="surface-card" style="padding: 18px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                  <span class="status-pill ${p.status === 'SOLD' ? 'pill-green' : (p.status === 'SKIPPED' ? 'pill-yellow' : 'pill-grey')}">${p.status}</span>
                  <span class="eyebrow" style="color: var(--primary);">BUCKET ${p.bucket}</span>
                </div>
                <div style="font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text-bright);">${p.name}</div>
                <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 12px;">${p.type} • ${p.program} ${p.branch} • ${p.year}</div>
                
                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 8px 12px; font-size: 11px; margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-dim);">Roll No:</span>
                    <strong style="font-family: var(--font-mono); color: var(--text-bright);">${p.roll}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                    <span style="color: var(--text-dim);">CricHeroes:</span>
                    <strong style="color: var(--primary);">${p.cricHeroes} (${p.stats.runs} R, ${p.stats.wickets} W)</strong>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
                  <span class="eyebrow">BASE PRICE</span>
                  <span class="sports-price" style="font-size: 18px; color: var(--auction);">${p.basePrice} CREDITS</span>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }

    // ========================================================
    // 6. VIEW 2: UNIFIED FINTECH AUTHENTICATION (/login)
    // ========================================================
    let loginSelectedRole = 'FRANCHISE'; // 'FRANCHISE', 'PLAYER', 'STAFF'
    let loginFranchiseId = 'titans';
    let loginFranchiseIdentity = 'COORDINATOR'; // 'COORDINATOR' or 'CAPTAIN'
    let loginStaffType = 'SUPER_ADMIN'; // 'SUPER_ADMIN' or 'ADMIN_HANDLER'
    let loginOtpSent = false;
    let loginVerifying = false;

    function renderLoginView() {
      const f = franchises.find(x => x.id === loginFranchiseId) || franchises[0];
      const cur = players[lotIndex] || players[0];

      return `
        <div style="min-height: 80vh; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; padding: 20px 0;">
          <!-- LEFT BRAND IDENTITY -->
          <div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
              <img src="acc-logo.jpg" alt="Logo" style="width: 44px; height: 44px; border-radius: 10px; border: 1px solid var(--border-medium);">
              <div>
                <span class="eyebrow" style="color: var(--primary);">OFFICIAL OPERATING PLATFORM</span>
                <div style="font-family: var(--font-display); font-size: 15px; font-weight: 800; color: var(--text-bright);">AVANTHI CRICKET CARNIVAL 2026</div>
              </div>
            </div>

            <h1 class="display-title" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 16px;">
              ACC PLAYER<br><span style="color: var(--primary);">AUCTION 2026</span>
            </h1>

            <p style="font-size: 1.1rem; color: var(--text-dim); line-height: 1.6; margin-bottom: 32px; max-width: 480px;">
              The official mission-critical terminal for student registration, 11-team squad composition, and real-time live player bidding.
            </p>

            <!-- LIVE STATUS TICKER -->
            <div class="surface-card" style="padding: 16px 20px; max-width: 440px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span class="status-pill pill-green"><div class="pulse-dot"></div>SYSTEM ONLINE</span>
                <span class="eyebrow">LOT #${cur.id} ON FLOOR</span>
              </div>
              <div style="font-size: 13px; color: var(--text-bright); font-weight: 600;">
                ${cur.name} • Current Bid: <span style="color: var(--auction);">${currentPrice}C</span>
              </div>
            </div>
          </div>

          <!-- RIGHT AUTHENTICATION CARD -->
          <div class="surface-elevated" style="padding: 36px; max-width: 480px; width: 100%;">
            <div style="margin-bottom: 24px;">
              <span class="eyebrow" style="color: var(--primary);">AUTHORITATIVE ACCESS</span>
              <h2 class="display-title" style="font-size: 24px; margin-top: 2px;">SIGN IN TO ACC</h2>
              <div style="font-size: 13px; color: var(--text-dim); margin-top: 4px;">Choose your authorized role to enter the portal.</div>
            </div>

            <!-- ROLE SELECTOR TABS -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 24px;">
              <button class="btn ${loginSelectedRole === 'FRANCHISE' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 12px; padding: 10px 4px;" onclick="loginSelectedRole = 'FRANCHISE'; loginOtpSent = false; renderCurrentView();">
                FRANCHISE
              </button>
              <button class="btn ${loginSelectedRole === 'PLAYER' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 12px; padding: 10px 4px;" onclick="loginSelectedRole = 'PLAYER'; loginOtpSent = false; renderCurrentView();">
                PLAYER
              </button>
              <button class="btn ${loginSelectedRole === 'STAFF' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 12px; padding: 10px 4px;" onclick="loginSelectedRole = 'STAFF'; loginOtpSent = false; renderCurrentView();">
                STAFF
              </button>
            </div>

            <!-- FRANCHISE FORM -->
            ${loginSelectedRole === 'FRANCHISE' ? `
              <div class="form-group">
                <label class="form-label">SELECT FRANCHISE</label>
                <select class="form-select" onchange="loginFranchiseId = this.value; renderCurrentView();">
                  ${franchises.map(x => `<option value="${x.id}" ${x.id === loginFranchiseId ? 'selected' : ''}>${x.name} (${x.faculty})</option>`).join('')}
                </select>
              </div>

              <!-- DUAL LOGIN IDENTITIES: COORDINATOR VS CAPTAIN -->
              <div class="form-group" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px;">
                <label class="form-label">AUTHORIZED FRANCHISE LOGIN IDENTITY</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
                  <button class="btn ${loginFranchiseIdentity === 'COORDINATOR' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 11px; padding: 8px;" onclick="loginFranchiseIdentity = 'COORDINATOR'; renderCurrentView();">
                    Coordinator (Primary)
                  </button>
                  <button class="btn ${loginFranchiseIdentity === 'CAPTAIN' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 11px; padding: 8px;" onclick="loginFranchiseIdentity = 'CAPTAIN'; renderCurrentView();">
                    Captain (Secondary)
                  </button>
                </div>
                <div style="font-size: 11px; color: var(--text-dim); margin-top: 8px;">
                  ${loginFranchiseIdentity === 'COORDINATOR' ? `Registered Mobile: <strong>${f.mobile}</strong> (Dr. R. Sharma)` : `Authorized Captain Mobile: <strong>${f.captainMobile}</strong> (Arjun Kumar)`}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">MOBILE NUMBER</label>
                <input type="tel" class="form-input" value="${loginFranchiseIdentity === 'COORDINATOR' ? f.mobile : f.captainMobile}">
              </div>
            ` : ''}

            <!-- PLAYER FORM -->
            ${loginSelectedRole === 'PLAYER' ? `
              <div class="form-group">
                <label class="form-label">STUDENT ROLL NUMBER</label>
                <input type="text" class="form-input" placeholder="e.g. 23591-A-0402" value="23591-A-0402">
              </div>
              <div class="form-group">
                <label class="form-label">CONFIDENTIAL REGISTERED MOBILE</label>
                <input type="tel" class="form-input" placeholder="+91 98480 12345" value="+91 98480 12345">
              </div>
            ` : ''}

            <!-- STAFF FORM -->
            ${loginSelectedRole === 'STAFF' ? `
              <div class="form-group">
                <label class="form-label">STAFF ACCESS LEVEL</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
                  <button class="btn ${loginStaffType === 'SUPER_ADMIN' ? 'btn-auction' : 'btn-secondary'}" style="font-size: 11px; padding: 8px;" onclick="loginStaffType = 'SUPER_ADMIN'; renderCurrentView();">
                    Super Admin (Director)
                  </button>
                  <button class="btn ${loginStaffType === 'ADMIN_HANDLER' ? 'btn-auction' : 'btn-secondary'}" style="font-size: 11px; padding: 8px;" onclick="loginStaffType = 'ADMIN_HANDLER'; renderCurrentView();">
                    Auction Handler
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">SECURE ACCESS PASSKEY</label>
                <input type="password" class="form-input" value="••••••••••••">
              </div>
            ` : ''}

            <!-- OTP FLOW OR AUTHENTICATE -->
            ${!loginOtpSent ? `
              <button class="btn btn-primary" style="width: 100%; height: 46px; font-size: 15px; margin-top: 8px;" onclick="loginOtpSent = true; renderCurrentView();">
                SEND ONE-TIME PASSCODE (OTP)
              </button>
            ` : `
              <div style="background: rgba(25, 195, 125, 0.08); border: 1px solid rgba(25, 195, 125, 0.3); border-radius: 10px; padding: 14px; margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span class="eyebrow" style="color: var(--primary);">OTP DISPATCHED</span>
                  <span style="font-family: var(--font-mono); font-size: 12px; color: var(--text-dim);">01:59</span>
                </div>
                <div class="form-group" style="margin-bottom: 8px;">
                  <input type="text" class="form-input" id="otpBoxInput" placeholder="Enter 4-digit code" value="2026" style="letter-spacing: 0.3em; text-align: center; font-size: 20px; font-family: var(--font-mono);">
                </div>
                <div style="font-size: 11px; color: var(--text-dim); text-align: center;">Demo OTP prefilled: <strong>2026</strong></div>
              </div>

              <button class="btn btn-primary" style="width: 100%; height: 46px; font-size: 15px;" onclick="executeFintechLogin()">
                VERIFY & ENTER TERMINAL →
              </button>
            `}

            <!-- PUBLIC LINK -->
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; color: var(--text-dim);">Public Spectator?</span>
              <a href="javascript:void(0)" onclick="signOutUser()" style="font-size: 12px; color: var(--primary); font-weight: 600; text-decoration: none;">
                Continue as Public Viewer →
              </a>
            </div>
          </div>
        </div>
      `;
    }

    function executeFintechLogin() {
      showSpeeder("VERIFYING YOUR CREDENTIALS...", "Checking authoritative event registry", 600);
      setTimeout(() => {
        if (loginSelectedRole === 'FRANCHISE') {
          const f = franchises.find(x => x.id === loginFranchiseId);
          currentUser = {
            role: 'FRANCHISE',
            name: `${f.name} (${loginFranchiseIdentity === 'COORDINATOR' ? 'Coordinator' : 'Captain'})`,
            title: loginFranchiseIdentity === 'COORDINATOR' ? 'Faculty Coordinator' : 'Team Captain',
            franchiseId: f.id
          };
          franchiseLoginIdentity = loginFranchiseIdentity;
          showToast(`AUTHENTICATED AS: ${f.name} (${franchiseLoginIdentity})`, "success");
          switchView('franchise');
        } else if (loginSelectedRole === 'PLAYER') {
          currentUser = {
            role: 'PLAYER',
            name: 'Arjun Kumar',
            title: 'Registered Student Player',
            playerId: '023'
          };
          showToast("AUTHENTICATED AS: Arjun Kumar (Player)", "success");
          switchView('player');
        } else if (loginSelectedRole === 'STAFF') {
          if (loginStaffType === 'SUPER_ADMIN') {
            currentUser = { role: 'SUPER_ADMIN', name: 'Tournament Director', title: 'Super Admin' };
            showToast("AUTHENTICATED: SUPER ADMIN CONSOLE", "success");
          } else {
            currentUser = { role: 'ADMIN_HANDLER', name: 'Floor Auctioneer', title: 'Auction Handler' };
            showToast("AUTHENTICATED: AUCTION HANDLER", "success");
          }
          switchView('admin');
        }
      }, 650);
    }
''')
    print("Public view and fintech login appended.")

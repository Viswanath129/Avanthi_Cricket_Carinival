# -*- coding: utf-8 -*-
# build_part2_views.py

PART2_VIEWS = r'''
    // ========================================================
    // BRAND ASSET SUITE: TEAM EMBLEMS & ATHLETE AVATARS
    // (ACC Official Logo is reserved for the website brand, NOT teams)
    // ========================================================
    const FRANCHISE_BRAND = {
      1: { name: "Titans", short: "TIT", color: "#0284C7", bg: "rgba(2, 132, 199, 0.12)", border: "#0284C7" },
      2: { name: "Warriors", short: "WAR", color: "#E11D48", bg: "rgba(225, 29, 72, 0.12)", border: "#E11D48" },
      3: { name: "Strikers", short: "STR", color: "#D97706", bg: "rgba(217, 119, 6, 0.12)", border: "#D97706" },
      4: { name: "Blasters", short: "BLA", color: "#059669", bg: "rgba(5, 150, 105, 0.12)", border: "#059669" },
      5: { name: "Super Kings", short: "CSK", color: "#CA8A04", bg: "rgba(202, 138, 4, 0.12)", border: "#CA8A04" },
      6: { name: "Royals", short: "RR", color: "#7C3AED", bg: "rgba(124, 58, 237, 0.12)", border: "#7C3AED" },
      7: { name: "Challengers", short: "RCB", color: "#DC2626", bg: "rgba(220, 38, 38, 0.12)", border: "#DC2626" },
      8: { name: "Knights", short: "KKR", color: "#4F46E5", bg: "rgba(79, 70, 229, 0.12)", border: "#4F46E5" },
      9: { name: "Daredevils", short: "DD", color: "#EA580C", bg: "rgba(234, 88, 12, 0.12)", border: "#EA580C" },
      10: { name: "Sunrisers", short: "SRH", color: "#F97316", bg: "rgba(249, 115, 22, 0.12)", border: "#F97316" },
      11: { name: "Giants", short: "GNT", color: "#0D9488", bg: "rgba(13, 148, 136, 0.12)", border: "#0D9488" }
    };

    function getTeamEmblem(fId, size = 42) {
      const b = FRANCHISE_BRAND[fId] || { name: "Team", short: "ACC", color: "#059669", bg: "rgba(5, 150, 105, 0.12)", border: "#059669" };
      return `
        <div class="team-emblem-badge" style="width: ${size}px; height: ${size}px; border-radius: 10px; background: ${b.bg}; border: 1.5px solid ${b.border}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);" title="${b.name}">
          <span style="font-family: var(--font-display); font-size: ${Math.round(size * 0.34)}px; font-weight: 800; color: ${b.color}; line-height: 1; letter-spacing: 0.02em;">${b.short}</span>
        </div>
      `;
    }

    function getPlayerAvatar(p, width = 80, height = 100) {
      if (p.photo && p.photo !== 'acc-logo.jpg' && p.photo.trim() !== '') {
        return `<img src="${p.photo}" alt="${p.name}" style="width: ${width}px; height: ${height}px; object-fit: cover; border-radius: var(--radius-sm); border: 1.5px solid var(--border-medium); flex-shrink: 0;">`;
      }
      const initials = p.name ? p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AT';
      const roleColor = p.bucket ? (p.bucket.startsWith('B') ? 'var(--color-green)' : 'var(--color-orange)') : 'var(--color-green)';
      return `
        <div style="width: ${width}px; height: ${height}px; border-radius: var(--radius-sm); background: linear-gradient(145deg, #FFFFFF, #E2E8F0); border: 1.5px solid var(--border-medium); display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 6px 4px; box-sizing: border-box; flex-shrink: 0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);">
          <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 2px;">
            <span class="label-micro font-mono" style="font-size: 0.6rem; color: var(--text-muted); font-weight: 800;">#${p.id}</span>
            <span class="label-micro font-mono" style="font-size: 0.6rem; color: ${roleColor}; font-weight: 800;">${p.bucket || 'B1'}</span>
          </div>
          <div style="font-family: var(--font-display); font-size: ${Math.round(width * 0.34)}px; font-weight: 800; color: #0F172A; letter-spacing: 0.04em;">
            ${initials}
          </div>
          <div style="font-size: 0.58rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); background: rgba(15, 23, 42, 0.06); padding: 2px 4px; border-radius: 3px; width: 100%; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${p.derivedType || 'ATHLETE'}
          </div>
        </div>
      `;
    }

    function getHourglassSvg(size = 48) {
      const isTimeUp = timerSeconds <= 0;
      const isPaused = auctionPaused || isTimeUp;
      const statusClass = isTimeUp ? "critical time-up stopped" : timerSeconds <= 5 ? "critical" : timerSeconds <= 10 ? "warning" : "normal";
      return `
        <svg aria-label="Hourglass timer" role="img" height="${size}px" width="${size}px" viewBox="0 0 56 56" class="hourglass-loader ${statusClass} ${isPaused ? 'paused time-up stopped' : ''}">
          <clipPath id="sand-mound-top">
            <path d="M 14.613 13.087 C 15.814 12.059 19.3 8.039 20.3 6.539 C 21.5 4.789 21.5 2.039 21.5 2.039 L 3 2.039 C 3 2.039 3 4.789 4.2 6.539 C 5.2 8.039 8.686 12.059 9.887 13.087 C 11 14.039 12.25 14.039 12.25 14.039 C 12.25 14.039 13.5 14.039 14.613 13.087 Z" class="loader__sand-mound-top" />
          </clipPath>
          <clipPath id="sand-mound-bottom">
            <path d="M 14.613 20.452 C 15.814 21.48 19.3 25.5 20.3 27 C 21.5 28.75 21.5 31.5 21.5 31.5 L 3 31.5 C 3 31.5 3 28.75 4.2 27 C 5.2 25.5 8.686 21.48 9.887 20.452 C 11 19.5 12.25 19.5 12.25 19.5 C 12.25 19.5 13.5 19.5 14.613 20.452 Z" class="loader__sand-mound-bottom" />
          </clipPath>
          <g transform="translate(2,2)">
            <g transform="rotate(-90,26,26)" stroke-linecap="round" stroke-dashoffset="153.94" stroke-dasharray="153.94 153.94" stroke="hsl(0,0%,100%)" fill="none">
              <circle transform="rotate(0,26,26)" r="24.5" cy="26" cx="26" stroke-width="2.5" class="loader__motion-thick" />
              <circle transform="rotate(90,26,26)" r="24.5" cy="26" cx="26" stroke-width="1.75" class="loader__motion-medium" />
              <circle transform="rotate(180,26,26)" r="24.5" cy="26" cx="26" stroke-width="1" class="loader__motion-thin" />
            </g>
            <g transform="translate(13.75,9.25)" class="loader__model">
              <path d="M 1.5 2 L 23 2 C 23 2 22.5 8.5 19 12 C 16 15.5 13.5 13.5 13.5 16.75 C 13.5 20 16 18 19 21.5 C 22.5 25 23 31.5 23 31.5 L 1.5 31.5 C 1.5 31.5 2 25 5.5 21.5 C 8.5 18 11 20 11 16.75 C 11 13.5 8.5 15.5 5.5 12 C 2 8.5 1.5 2 1.5 2 Z" fill="hsl(var(--hue),90%,85%)" />
              <g stroke-linecap="round" stroke="hsl(35,90%,90%)">
                <line y2="20.75" x2="12" y1="15.75" x1="12" stroke-dasharray="0.25 33.75" stroke-width="1" class="loader__sand-grain-left" />
                <line y2="21.75" x2="12.5" y1="16.75" x1="12.5" stroke-dasharray="0.25 33.75" stroke-width="1" class="loader__sand-grain-right" />
                <line y2="31.5" x2="12.25" y1="18" x1="12.25" stroke-dasharray="0.5 107.5" stroke-width="1" class="loader__sand-drop" />
                <line y2="31.5" x2="12.25" y1="14.75" x1="12.25" stroke-dasharray="54 54" stroke-width="1.5" class="loader__sand-fill" />
                <line y2="31.5" x2="12" y1="16" x1="12" stroke-dasharray="1 107" stroke-width="1" stroke="hsl(35,90%,83%)" class="loader__sand-line-left" />
                <line y2="31.5" x2="12.5" y1="16.5" x1="12.5" stroke-dasharray="12 96" stroke-width="1" stroke="hsl(35,90%,83%)" class="loader__sand-line-right" />
                <g stroke-width="0" fill="hsl(35,90%,90%)">
                  <path d="M 12.25 15 L 15.392 13.486 C 21.737 11.168 22.5 2 22.5 2 L 2 2.013 C 2 2.013 2.753 11.046 9.009 13.438 L 12.25 15 Z" clip-path="url(#sand-mound-top)" />
                  <path d="M 12.25 18.5 L 15.392 20.014 C 21.737 22.332 22.5 31.5 22.5 31.5 L 2 31.487 C 2 31.487 2.753 22.454 9.009 20.062 Z" clip-path="url(#sand-mound-bottom)" />
                </g>
              </g>
              <g stroke-width="2" stroke-linecap="round" opacity="0.7" fill="none">
                <path d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5" stroke="hsl(0,0%,100%)" class="loader__glare-top" />
                <path transform="rotate(180,12.25,16.75)" d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5" stroke="hsla(0,0%,100%,0)" class="loader__glare-bottom" />
              </g>
              <rect height="2" width="24.5" fill="hsl(var(--hue),90%,50%)" />
              <rect height="1" width="19.5" y="0.5" x="2.5" ry="0.5" rx="0.5" fill="hsl(var(--hue),90%,57.5%)" />
              <rect height="2" width="24.5" y="31.5" fill="hsl(var(--hue),90%,50%)" />
              <rect height="1" width="19.5" y="32" x="2.5" ry="0.5" rx="0.5" fill="hsl(var(--hue),90%,57.5%)" />
            </g>
          </g>
        </svg>
      `;
    }

    // ========================================================
    // VIEW 1: PUBLIC HOME & ROSTER (SPECTATOR)
    // ========================================================
    let publicSearchQuery = "";
    let publicBucketFilter = "ALL";

    function renderPublicView() {
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const scarcity = getTournamentScarcity();

      const filteredPlayers = players.filter(p => {
        if (publicSearchQuery && !p.name.toLowerCase().includes(publicSearchQuery.toLowerCase()) && !p.roll.toLowerCase().includes(publicSearchQuery.toLowerCase())) return false;
        if (publicBucketFilter !== "ALL" && p.bucket !== publicBucketFilter) return false;
        return true;
      });

      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-8);">
          
          <!-- Scarcity Banner (If active) -->
          ${scarcity.scarce ? `
            <div class="surface-card" style="background: rgba(255, 209, 102, 0.08); border: 1.5px solid var(--color-yellow); padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3); border-radius: var(--radius-md);">
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <span class="status-badge status-scarcity">SCARCITY ALERT</span>
                <span style="font-size: 0.8125rem; font-weight: 700; color: var(--color-yellow);">
                  ${scarcity.bucket}: ${scarcity.available} available vs ${scarcity.unfilledSlots} mandatory slots remaining.
                </span>
              </div>
              <button class="btn btn-secondary" style="padding: 6px 12px; min-height: 32px; font-size: 0.75rem;" onclick="switchView('live')">WATCH BIDDING</button>
            </div>
          ` : ''}

          <!-- HERO SECTION -->
          <div class="surface-card" style="padding: clamp(20px, 3.5vw, 44px); background: linear-gradient(135deg, rgba(255, 255, 255, 0.70), rgba(255, 255, 255, 0.55)); border: 1px solid rgba(255, 255, 255, 0.85); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border-radius: var(--radius-xl);">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-6); align-items: center;">
              
              <!-- Left Hero Typography -->
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: var(--space-3); flex-wrap: wrap;">
                  <span class="status-badge status-live">OFFICIAL OS</span>
                  <span class="label-micro" style="color: var(--color-green);">AVANTHI CRICKET CARNIVAL · PLAYER AUCTION 2026</span>
                </div>
                <h1 class="display-hero" style="margin-bottom: var(--space-4);">
                  THE AUCTION<br><span style="color: var(--color-green);">IS LIVE.</span>
                </h1>
                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.5; max-width: 480px; margin-bottom: var(--space-5);">
                  11 franchises. Hundreds of elite student athletes. One authoritative, real-time cricket auction operating system.
                </p>
                <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
                  <button class="btn btn-auction" style="font-size: 0.875rem; padding: 10px 20px; flex: 1; min-width: 160px;" onclick="switchView('live')">
                    WATCH LIVE AUCTION
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.875rem; padding: 10px 20px; flex: 1; min-width: 160px;" onclick="document.getElementById('rosterSection').scrollIntoView({behavior: 'smooth'})">
                    EXPLORE PLAYERS
                  </button>
                </div>
              </div>

              <!-- Right Hero Active Lot Preview Card -->
              <div class="surface-elevated" style="padding: var(--space-6); border: 1px solid var(--border-strong); position: relative; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
                  <span class="status-badge status-inplay">ACTIVE LOT #${cur.id}</span>
                  <div class="auction-timer-widget ${timerSeconds <= 5 ? 'critical' : timerSeconds <= 10 ? 'warning' : 'normal'}" style="padding: 4px 10px; gap: 8px;">
                    ${getHourglassSvg(24)}
                    <span class="font-mono label-micro" style="font-weight: 800; font-size: 0.75rem;">${timerSeconds}s CLOCK</span>
                  </div>
                </div>

                <div style="display: flex; gap: var(--space-4); align-items: center; margin-bottom: var(--space-4);">
                  ${getPlayerAvatar(cur, 80, 100)}
                  <div>
                    <div class="label-micro" style="color: var(--color-green);">${cur.bucket} • ${cur.derivedType || 'BATTER'}</div>
                    <div style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: var(--text-bright); line-height: 1.1;">${cur.name}</div>
                    <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 4px;">${cur.program} · ${cur.branch} · Year ${cur.year}</div>
                  </div>
                </div>

                <div style="background: var(--surface-1); padding: var(--space-3) var(--space-4); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div class="label-micro">CURRENT BID</div>
                    <div class="price-display" style="font-size: 1.75rem; color: var(--color-orange);">${currentBid} <span style="font-size: 0.875rem; color: var(--text-muted); font-weight: 600;">CREDITS</span></div>
                  </div>
                  <div style="text-align: right;">
                    <div class="label-micro">LEADING FRANCHISE</div>
                    ${leader ? `
                      <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 2px;">
                        ${getTeamEmblem(leader.id, 24)}
                        <span style="font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--text-bright);">${leader.name}</span>
                      </div>
                    ` : `
                      <div style="font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--text-bright); margin-top: 2px;">OPENING BASE</div>
                    `}
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- REGISTERED PLAYERS ROSTER SECTION -->
          <div id="rosterSection" style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--space-4);">
              <div>
                <span class="label-micro" style="color: var(--color-green);">OFFICIAL PLAYER DIRECTORY</span>
                <h2 class="section-title">REGISTERED PLAYER ROSTER</h2>
              </div>
              <div style="display: flex; gap: var(--space-2); flex-wrap: wrap; align-items: center;">
                <input type="text" class="form-input" style="width: 240px; min-height: 38px; padding: 6px 12px; font-size: 0.8125rem;" placeholder="Search name or roll..." value="${publicSearchQuery}" oninput="publicSearchQuery = this.value; renderCurrentView();">
              </div>
            </div>

            <!-- Bucket Filters -->
            <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px;">
              ${['ALL', 'B1', 'B2', 'B3', 'B4', 'D5', 'M6'].map(b => `
                <button class="btn btn-secondary" style="min-height: 34px; padding: 4px 12px; font-size: 0.75rem; ${publicBucketFilter === b ? 'background: var(--surface-3); border-color: var(--color-green); color: var(--color-green);' : ''}" onclick="publicBucketFilter = '${b}'; renderCurrentView();">
                  ${b === 'ALL' ? 'ALL PLAYERS' : b + ' BUCKET'}
                </button>
              `).join('')}
            </div>

            <!-- 4-Column Player Cards Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-4);">
              ${filteredPlayers.map(p => `
                <div class="surface-card" style="padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); border-radius: var(--radius-md);">
                  <div style="display: flex; gap: var(--space-3);">
                    ${getPlayerAvatar(p, 70, 88)}
                    <div style="flex: 1; min-width: 0;">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <span class="status-badge ${p.status === 'SOLD' ? 'status-sold' : p.status === 'UNSOLD' ? 'status-unsold' : 'status-live'}">${p.status}</span>
                        <span class="label-micro font-mono" style="color: var(--text-faint);">#${p.id}</span>
                      </div>
                      <div class="card-title" style="margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
                      <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-green); text-transform: uppercase;">${p.derivedType || 'BATTER'}</div>
                      <div style="font-size: 0.6875rem; color: var(--text-muted);">${p.program} · ${p.branch} · Yr ${p.year} (${p.bucket})</div>
                    </div>
                  </div>

                  <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                    <span class="status-badge" style="background: rgba(255,255,255,0.04); color: var(--text-muted); font-size: 0.625rem;">${p.battingStyle || 'RIGHT HAND'}</span>
                    <span class="status-badge" style="background: rgba(255,255,255,0.04); color: var(--text-muted); font-size: 0.625rem;">${p.bowlingArm ? p.bowlingArm + ' ' + (p.bowlingType || '') : 'TOP ORDER'}</span>
                  </div>

                  <div style="margin-top: auto; padding-top: var(--space-2); border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <span class="label-micro">BASE PRICE</span>
                      <div class="price-display" style="font-size: 1.1rem; color: var(--text-bright);">${p.basePrice} <span style="font-size: 0.6875rem; color: var(--text-muted);">C</span></div>
                    </div>
                    ${p.status === 'SOLD' ? `
                      <div style="text-align: right;">
                        <span class="label-micro" style="color: var(--color-green);">SOLD TO</span>
                        <div style="font-size: 0.8125rem; font-weight: 700; color: var(--color-green);">${p.soldTo || 'TITANS'}</div>
                      </div>
                    ` : `
                      <button class="btn btn-secondary" style="min-height: 30px; padding: 4px 10px; font-size: 0.6875rem;" onclick="openPlayerPassModal(${p.id})">VIEW PASS</button>
                    `}
                  </div>
                </div>
              `).join('')}
            </div>

          </div>

        </div>
      `;
    }

    // ========================================================
    // VIEW 2: PUBLIC LIVE AUCTION FLOOR
    // ========================================================
    function renderLiveAuctionView() {
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const scarcity = getTournamentScarcity();
      const isTimeUp = timerSeconds <= 0;
      const timerState = isTimeUp ? 'status-blocked' : (timerSeconds <= 5 ? 'status-blocked' : timerSeconds <= 10 ? 'status-warning' : 'status-live');
      const timerLabel = isTimeUp ? 'TIME UP' : (timerSeconds <= 5 ? 'CRITICAL' : timerSeconds <= 10 ? 'WARNING' : 'NORMAL');

      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-6);">
          
          <!-- Top Bar: Connection & Active State -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="status-badge status-live">LIVE BROADCAST</span>
              <span class="label-micro font-mono">LOT ${lotIndex + 1} OF ${players.length}</span>
              <span class="status-badge status-connected">ENGINE CONNECTED</span>
            </div>
            <div style="display: flex; gap: var(--space-2);">
              <button class="btn btn-secondary" style="min-height: 34px; padding: 4px 12px; font-size: 0.75rem;" onclick="switchView('franchise')">OPEN FRANCHISE TERMINAL</button>
            </div>
          </div>

          <!-- Main Live Auction Arena Split Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: var(--space-6);">
            
            <!-- Left Column: Featured Player Lot -->
            <div class="surface-card" style="padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="status-badge status-inplay">ON AUCTION FLOOR</span>
                <span class="label-micro font-mono">ID #${cur.id}</span>
              </div>

              <div style="display: flex; gap: var(--space-4); align-items: center;">
                ${getPlayerAvatar(cur, 110, 140)}
                <div>
                  <div class="label-micro" style="color: var(--color-green);">${cur.bucket} • ${cur.derivedType || 'BATTER'}</div>
                  <h2 style="font-family: var(--font-display); font-size: 1.85rem; font-weight: 800; color: var(--text-bright); line-height: 1.1;">${cur.name}</h2>
                  <div style="font-size: 0.875rem; color: var(--text-muted); margin-top: 4px;">${cur.program} · ${cur.branch} · Year ${cur.year}</div>
                  <div class="font-mono" style="font-size: 0.8125rem; color: var(--text-faint); margin-top: 2px;">Roll: ${cur.roll}</div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2); margin-top: var(--space-2);">
                <div class="surface-subtle" style="padding: 10px;">
                  <span class="label-micro">BASE PRICE</span>
                  <div class="price-display" style="font-size: 1.25rem; color: var(--text-bright);">${cur.basePrice} <span style="font-size: 0.75rem; color: var(--text-muted);">C</span></div>
                </div>
                <div class="surface-subtle" style="padding: 10px;">
                  <span class="label-micro">STYLE</span>
                  <div style="font-size: 0.875rem; font-weight: 700; color: var(--text-bright); margin-top: 2px;">${cur.battingStyle || 'RIGHT HAND'}</div>
                </div>
                <div class="surface-subtle" style="padding: 10px;">
                  <span class="label-micro">BOWLING</span>
                  <div style="font-size: 0.875rem; font-weight: 700; color: var(--text-bright); margin-top: 2px;">${cur.bowlingType || 'NONE'}</div>
                </div>
              </div>

              <div style="background: var(--surface-2); padding: var(--space-3) var(--space-4); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div class="label-micro" style="margin-bottom: 4px;">PLAYER BIOGRAPHY & CREDENTIALS</div>
                <p style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.5;">${cur.bio || 'Registered athlete for Avanthi Cricket Carnival 2026. Verified academic and cricket profile.'}</p>
              </div>
            </div>

            <!-- Right Column: Current Bid, Highest Bidder & Timer -->
            <div class="surface-elevated" style="padding: var(--space-6); display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-5);">
              
              <!-- Timer & Scarcity Indicator -->
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-4);">
                <div class="auction-timer-widget ${timerSeconds <= 5 ? 'critical' : timerSeconds <= 10 ? 'warning' : 'normal'}">
                  ${getHourglassSvg(50)}
                  <div class="timer-countdown-info">
                    <div class="font-mono timer-countdown-number">${timerSeconds}</div>
                    <div class="timer-countdown-unit">SECONDS • ${timerLabel}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span class="label-micro">STATUS</span>
                  <div style="margin-top: 4px;">
                    <span id="clockStatusBadge" class="status-badge ${isTimeUp ? 'status-blocked' : (auctionPaused ? 'status-warning' : 'status-live')}">${isTimeUp ? 'TIME UP (STOPPED)' : (auctionPaused ? 'PAUSED' : 'CLOCK ACTIVE')}</span>
                  </div>
                </div>
              </div>

              <!-- Dominant Current Bid -->
              <div style="background: var(--surface-1); padding: var(--space-5); border-radius: var(--radius-md); border: 1px solid var(--border-medium); text-align: center;">
                <span class="label-micro" style="color: var(--color-orange); letter-spacing: 0.16em;">CURRENT HIGHEST BID</span>
                <div class="price-display" style="font-size: clamp(3.2rem, 8vw, 5.25rem); color: var(--color-orange); margin: 6px 0;">
                  ${currentBid} <span style="font-size: 1.5rem; color: var(--text-muted); font-weight: 700;">CREDITS</span>
                </div>
                <div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(217, 119, 6, 0.1); padding: 8px 20px; border-radius: var(--radius-full); border: 1.5px solid rgba(217, 119, 6, 0.3);">
                  <span class="label-micro" style="color: var(--text-main);">HELD BY:</span>
                  ${leader ? `
                    <div style="display: flex; align-items: center; gap: 8px;">
                      ${getTeamEmblem(leader.id, 26)}
                      <span style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; color: var(--color-orange);">${leader.name}</span>
                    </div>
                  ` : `
                    <span style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; color: var(--text-muted);">NO BIDS YET</span>
                  `}
                </div>
              </div>

              <!-- Next Bid & Increment Calculation -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
                <div class="surface-subtle" style="padding: 12px;">
                  <span class="label-micro">NEXT LEGAL BID</span>
                  <div class="price-display" style="font-size: 1.4rem; color: var(--color-green); margin-top: 2px;">
                    ${currentBid + getBidIncrement(currentBid)} <span style="font-size: 0.75rem; color: var(--text-muted);">C</span>
                  </div>
                </div>
                <div class="surface-subtle" style="padding: 12px;">
                  <span class="label-micro">BID INCREMENT</span>
                  <div class="font-mono" style="font-size: 1.4rem; font-weight: 800; color: var(--text-bright); margin-top: 2px;">
                    +${getBidIncrement(currentBid)} <span style="font-size: 0.75rem; color: var(--text-muted);">C</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <!-- 11 Franchises Live Purse & Status Strip -->
          <div class="surface-card" style="padding: var(--space-5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
              <span class="label-micro" style="color: var(--color-green);">11 FRANCHISES REAL-TIME PURSE & ROSTER TRACKER</span>
              <span class="label-micro font-mono">1,000 TOTAL CREDITS CAP</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: var(--space-3);">
              ${franchises.map(f => {
                const maxBid = calculateMaxBid(f.id, cur.bucket);
                const isLeader = f.id === leadingBidderId;
                const isBlocked = maxBid < (currentBid + getBidIncrement(currentBid));
                return `
                  <div class="surface-subtle" style="padding: 10px 14px; border-left: 3px solid ${isLeader ? 'var(--color-orange)' : 'var(--border-medium)'}; ${isLeader ? 'background: rgba(255, 138, 31, 0.08);' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-family: var(--font-display); font-size: 0.875rem; font-weight: 800; color: var(--text-bright);">${f.name}</span>
                      <span class="status-badge ${isLeader ? 'status-inplay' : isBlocked ? 'status-blocked' : 'status-connected'}">${isLeader ? 'HOLDING' : isBlocked ? 'BLOCKED' : 'LEGAL'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 0.75rem;">
                      <span style="color: var(--text-muted);">Purse: <strong class="font-mono" style="color: var(--text-bright);">${f.purse}C</strong></span>
                      <span style="color: var(--text-muted);">Max: <strong class="font-mono" style="color: ${isBlocked ? 'var(--color-red)' : 'var(--color-green)'};">${maxBid}C</strong></span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>
      `;
    }

    // ========================================================
    // VIEW 3: FRANCHISE MOBILE-FIRST BIDDING TERMINAL
    // ========================================================
    function renderFranchiseTerminalView() {
      // Strict Franchise Isolation Guard
      if (currentUser.role !== 'FRANCHISE' && currentUser.role !== 'SUPER_ADMIN') {
        return `
          <div style="max-width: 600px; margin: 40px auto; text-align: center; padding: var(--space-6);" class="surface-card">
            <span class="status-badge status-blocked">AUTHENTICATION REQUIRED</span>
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: var(--color-red); margin: 12px 0;">
              FRANCHISE TERMINAL ACCESS RESTRICTED
            </h2>
            <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 20px;">
              Please authenticate with your Franchise credentials (Faculty Coordinator or Team Leader) to access this live bidding terminal.
            </p>
            <button class="btn btn-primary" onclick="switchView('login')">PROCEED TO LOGIN</button>
          </div>
        `;
      }

      const targetFId = currentUser.role === 'FRANCHISE' ? currentUser.franchiseId : (activeTerminalFranchiseId || 1);
      const myFranchise = franchises.find(f => f.id === targetFId);
      if (!myFranchise) {
        return `
          <div style="max-width: 600px; margin: 40px auto; text-align: center; padding: var(--space-6);" class="surface-card">
            <span class="status-badge status-blocked">ACCESS DENIED</span>
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: var(--color-red); margin: 12px 0;">
              FRANCHISE WORKSPACE ISOLATION ENFORCED
            </h2>
            <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 20px;">
              You do not have authorization to view or bid on behalf of other franchises.
            </p>
            <button class="btn btn-secondary" onclick="switchView('public')">RETURN TO PUBLIC ROSTER</button>
          </div>
        `;
      }

      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const nextBid = currentBid + getBidIncrement(currentBid);
      const maxLegal = calculateMaxBid(myFranchise.id, cur.bucket);
      const isLeader = myFranchise.id === leadingBidderId;
      const isBlocked = maxLegal < nextBid;
      const scarcity = getTournamentScarcity();
      const identityLabel = currentUser.identityType === 'COORDINATOR' ? 'Faculty Coordinator / Owner' : 'Team Leader / Captain';

      return `
        <div style="max-width: 680px; width: 100%; box-sizing: border-box; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4);">
          
          <!-- Franchise Session Header -->
          <div class="surface-card" style="padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                ${getTeamEmblem(myFranchise.id, 46)}
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span class="status-badge status-connected">CONNECTED</span>
                    <span class="label-micro" style="color: var(--color-green);">FRANCHISE TERMINAL</span>
                  </div>
                  <div style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: var(--text-bright); margin-top: 2px;">
                    ${myFranchise.name}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">
                    Identity: <strong style="color: var(--color-green);">${identityLabel}</strong> (${currentUser.name})
                  </div>
                </div>
              </div>
              <div style="text-align: right;">
                <span class="label-micro">OPERATIONAL ISOLATION</span>
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-blue);">TEAM #${myFranchise.id} LOCKED</div>
              </div>
            </div>

            <!-- Shared Workspace Notice -->
            <div class="surface-subtle" style="padding: 8px 12px; border-left: 3px solid var(--color-green); font-size: 0.75rem; color: var(--text-muted);">
              <strong>Shared Franchise Workspace:</strong> Both Faculty Coordinator and Team Leader share the exact same purse (1000C initial) & squad roster in real-time.
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); background: var(--surface-2); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div>
                <span class="label-micro">REMAINING PURSE</span>
                <div class="price-display" style="font-size: 1.35rem; color: var(--color-green);">${myFranchise.purse} <span style="font-size: 0.75rem; color: var(--text-muted);">C</span></div>
              </div>
              <div style="text-align: right;">
                <span class="label-micro">SQUAD COUNT</span>
                <div class="font-mono" style="font-size: 1.35rem; font-weight: 800; color: var(--text-bright);">${myFranchise.squad.length} / 18</div>
              </div>
            </div>
          </div>

          <!-- Current Lot Floor Card -->
          <div class="surface-card" style="padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="status-badge status-inplay">ACTIVE LOT #${cur.id}</span>
              <div class="auction-timer-widget ${timerSeconds <= 5 ? 'critical' : timerSeconds <= 10 ? 'warning' : 'normal'}" style="padding: 4px 10px; gap: 8px;">
                ${getHourglassSvg(24)}
                <span class="label-micro font-mono" style="font-weight: 800;">${timerSeconds}s</span>
              </div>
            </div>

            <div style="display: flex; gap: var(--space-3); align-items: center;">
              ${getPlayerAvatar(cur, 80, 95)}
              <div style="flex: 1; min-width: 0;">
                <div class="label-micro" style="color: var(--color-green);">${cur.bucket} • ${cur.derivedType || 'BATTER'}</div>
                <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--text-bright); margin: 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${cur.name}
                </h3>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${cur.program} · ${cur.branch} · Year ${cur.year}</div>
                <div class="label-mono font-mono" style="font-size: 0.6875rem; color: var(--text-faint);">Roll: ${cur.roll}</div>
              </div>
            </div>

            <!-- Current Bid Status Banner -->
            <div class="surface-subtle" style="padding: 10px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-subtle);">
              <div>
                <span class="label-micro">CURRENT FLOOR BID</span>
                <div class="price-display" style="font-size: 1.5rem; color: var(--color-orange);">${currentBid} <span style="font-size: 0.8125rem; color: var(--text-muted);">C</span></div>
              </div>
              <div style="text-align: right;">
                <span class="label-micro">LEAD BIDDER</span>
                <div style="font-size: 0.8125rem; font-weight: 700; color: ${isLeader ? 'var(--color-green)' : 'var(--text-bright)'};">
                  ${isLeader ? 'YOUR FRANCHISE' : (leader ? leader.name : 'NO BIDS')}
                </div>
              </div>
            </div>

            <!-- Single Tap Bidding Execution -->
            <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-2);">
              <button class="btn btn-auction" style="min-height: 52px; font-size: 1.05rem;" onclick="placeBid(${myFranchise.id})" ${isBlocked ? 'disabled' : ''}>
                ${isBlocked ? 'BID BLOCKED (BUDGET EXCEEDED)' : `SUBMIT BID: ${nextBid} CREDITS`}
              </button>
              
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-faint); padding: 0 4px;">
                <span>Max Legal Bid: <strong class="font-mono" style="color: var(--text-bright);">${maxLegal}C</strong></span>
                <span>Next Minimum: <strong class="font-mono" style="color: var(--color-green);">${nextBid}C</strong></span>
              </div>
            </div>
          </div>

          <!-- Acquired Squad Roster -->
          <div class="surface-card" style="padding: var(--space-4);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
              <span class="label-micro" style="color: var(--color-green);">${myFranchise.name.toUpperCase()} SQUAD ROSTER</span>
              <span class="label-mono font-mono" style="font-size: 0.75rem;">${myFranchise.squad.length} Athletes</span>
            </div>
            
            ${myFranchise.squad.length === 0 ? `
              <div style="text-align: center; padding: var(--space-4); color: var(--text-faint); font-size: 0.8125rem;">
                No athletes acquired yet. Active bids will appear here once hammered.
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow-y: auto;">
                ${myFranchise.squad.map(p => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--surface-2); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                    <div>
                      <div style="font-size: 0.8125rem; font-weight: 700; color: var(--text-bright);">${p.name}</div>
                      <div style="font-size: 0.6875rem; color: var(--text-muted);">${p.bucket} • ${p.derivedType || 'ATHLETE'}</div>
                    </div>
                    <div class="price-display" style="font-size: 0.9375rem; color: var(--color-orange);">${p.soldPrice} C</div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

        </div>
      `;
    }
    
    function render11FranchisesView() {
      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-6);">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--space-3);">
            <div>
              <span class="label-micro" style="color: var(--color-green);">OFFICIAL FRANCHISE DIRECTORY</span>
              <h2 class="section-title">11 PARTICIPATING FRANCHISES</h2>
            </div>
            <div class="label-mono font-mono" style="font-size: 0.875rem; color: var(--text-muted);">Total Cap: 11,000 Credits</div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-4);">
            ${franchises.map(f => `
              <div class="surface-card" style="padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    ${getTeamEmblem(f.id, 38)}
                    <span class="card-title">${f.name}</span>
                  </div>
                  <span class="status-badge status-connected">ACTIVE</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); background: var(--surface-2); padding: 10px; border-radius: var(--radius-sm);">
                  <div>
                    <span class="label-micro">REMAINING PURSE</span>
                    <div class="price-display" style="font-size: 1.35rem; color: var(--color-green);">${f.purse} <span style="font-size: 0.75rem; color: var(--text-muted);">C</span></div>
                  </div>
                  <div>
                    <span class="label-micro">SQUAD SIZE</span>
                    <div class="font-mono" style="font-size: 1.35rem; font-weight: 800; color: var(--text-bright);">${f.squad.length} <span style="font-size: 0.75rem; color: var(--text-muted);">/ 15</span></div>
                  </div>
                </div>

                <div>
                  <span class="label-micro">ROSTER ACQUISITIONS (${f.squad.length})</span>
                  <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px; max-height: 120px; overflow-y: auto;">
                    ${f.squad.length === 0 ? `
                      <span style="font-size: 0.75rem; color: var(--text-faint); font-style: italic;">No players acquired yet</span>
                    ` : f.squad.map(sp => `
                      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; padding: 3px 0; border-bottom: 1px solid var(--border-subtle);">
                        <span style="color: var(--text-bright); font-weight: 600;">${sp.name} (${sp.bucket})</span>
                        <span class="font-mono" style="color: var(--color-orange);">${sp.price || sp.basePrice} C</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // ========================================================
    // VIEW 5: LOGIN & ROLE GATEWAY (PREMIUM SPLIT LAYOUT)
    // ========================================================
    // loginRoleSelection declared in engine

    function renderLoginView() {
      return `
        <div style="min-height: 75vh; display: flex; align-items: center; justify-content: center; padding: var(--space-6) 0;">
          <div class="surface-card" style="width: 100%; max-width: 960px; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); border-radius: var(--radius-xl); overflow: hidden; border: 1px solid var(--border-medium);">
            
            <!-- Left Panel: Brand Statement -->
            <div style="padding: clamp(32px, 5vw, 64px); background: linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(246, 249, 255, 0.95)); display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid var(--border-subtle);">
              <div>
                <img src="acc-logo.jpg" alt="ACC Official Logo" style="width: 64px; height: 64px; border-radius: 14px; border: 1.5px solid var(--border-medium); box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08); margin-bottom: 20px; object-fit: cover; background: #fff;">
                <div style="margin-bottom: var(--space-4);">
                  <span class="status-badge status-live">ACC 2026 OFFICIAL</span>
                </div>
                <h1 style="font-family: var(--font-display); font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 800; color: var(--text-bright); line-height: 1.05; margin-bottom: var(--space-3);">
                  AVANTHI<br>CRICKET<br>CARNIVAL
                </h1>
                <div style="font-family: var(--font-mono); font-size: 0.875rem; font-weight: 700; color: var(--color-green); letter-spacing: 0.1em; text-transform: uppercase;">
                  PLAYER AUCTION 2026
                </div>
              </div>

              <div style="margin-top: var(--space-8);">
                <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
                  The authoritative digital platform for live athlete bidding, franchise squad management, and real-time operational governance.
                </p>
                <div style="margin-top: var(--space-4); font-size: 0.75rem; color: var(--text-faint); font-weight: 700; letter-spacing: 0.04em;">
                  REGISTRATION • SQUAD MANAGEMENT • LIVE AUCTION
                </div>
                <div style="margin-top: var(--space-3); font-size: 0.6875rem; color: var(--color-green); font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;">
                  TRUST • PRECISION • ENERGY • COMPETITION • TRANSPARENCY
                </div>
              </div>
            </div>

            <!-- Right Panel: Sign In Panel -->
            <div style="padding: clamp(32px, 5vw, 64px); display: flex; flex-direction: column; justify-content: center; background: var(--surface-1);">
              <div style="margin-bottom: var(--space-5);">
                <span class="label-micro">AUTHENTICATION GATEWAY</span>
                <h2 style="font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--text-bright); margin-top: 2px;">
                  SIGN IN
                </h2>
                <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 4px;">
                  Select your role family to proceed to your verified workspace.
                </div>
              </div>

              <!-- Role Selector -->
              <div class="form-group">
                <label class="form-label">CONTINUE AS</label>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
                  ${['PLAYER', 'FRANCHISE', 'STAFF'].map(r => `
                    <button type="button" class="btn btn-secondary" style="min-height: 40px; padding: 6px 10px; font-size: 0.75rem; ${loginRoleSelection === r ? 'background: rgba(5, 150, 105, 0.1); border-color: var(--color-green); color: var(--color-green); font-weight: 800;' : ''}" onclick="loginRoleSelection = '${r}'; renderCurrentView();">
                      ${r}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- DYNAMIC FORM ACCORDING TO ROLE -->
              ${loginRoleSelection === 'PLAYER' ? `
                <form onsubmit="handleLoginSubmit(event)" style="display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-2);">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">ROLL NUMBER OR REGISTERED EMAIL</label>
                    <input type="text" class="form-input" id="loginPlayerIdentifier" placeholder="e.g. 26811A0501 or athlete@acc.edu" required>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">ATHLETE PASSWORD / PIN</label>
                    <input type="password" class="form-input" id="loginPlayerSecret" placeholder="••••••••" required>
                  </div>

                  <div style="display: flex; justify-content: flex-end;">
                    <a href="javascript:void(0)" onclick="openForgotPasswordModal('PLAYER')" style="font-size: 0.75rem; color: var(--color-green); text-decoration: none; font-weight: 600;">Forgot Roll or Password?</a>
                  </div>

                  <button type="submit" class="btn btn-primary" style="width: 100%; min-height: 48px; font-size: 0.9375rem; margin-top: var(--space-1);">
                    SIGN IN AS ATHLETE
                  </button>
                </form>
              ` : loginRoleSelection === 'FRANCHISE' ? `
                <form onsubmit="handleLoginSubmit(event)" style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-2);">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">SELECT FRANCHISE</label>
                    <select class="form-select" id="loginFranchiseId" required>
                      ${franchises.map(f => `
                        <option value="${f.id}" ${f.id === franchiseLoginSelection ? 'selected' : ''}>${f.name} (Team #${f.id})</option>
                      `).join('')}
                    </select>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">IDENTITY TYPE</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                      <button type="button" class="btn btn-secondary" style="min-height: 38px; padding: 4px 8px; font-size: 0.6875rem; ${loginFranchiseIdentity === 'COORDINATOR' ? 'border-color: var(--color-green); color: var(--color-green); background: rgba(5,150,105,0.08); font-weight: 800;' : ''}" onclick="loginFranchiseIdentity = 'COORDINATOR'; renderCurrentView();">
                        FACULTY COORDINATOR
                      </button>
                      <button type="button" class="btn btn-secondary" style="min-height: 38px; padding: 4px 8px; font-size: 0.6875rem; ${loginFranchiseIdentity === 'TEAM_LEADER' ? 'border-color: var(--color-green); color: var(--color-green); background: rgba(5,150,105,0.08); font-weight: 800;' : ''}" onclick="loginFranchiseIdentity = 'TEAM_LEADER'; renderCurrentView();">
                        TEAM CAPTAIN / LEAD
                      </button>
                    </div>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">FRANCHISE ACCESS KEY / PIN</label>
                    <input type="password" class="form-input" id="loginFranchiseSecret" placeholder="••••••••" required>
                  </div>

                  <div class="surface-subtle" style="padding: 8px 10px; border-left: 3px solid var(--color-green); font-size: 0.6875rem; color: var(--text-muted); line-height: 1.4;">
                    Both Coordinator & Captain access the same shared franchise purse (1000C initial) & squad roster.
                  </div>

                  <div style="display: flex; justify-content: flex-end;">
                    <a href="javascript:void(0)" onclick="openForgotPasswordModal('FRANCHISE')" style="font-size: 0.75rem; color: var(--color-green); text-decoration: none; font-weight: 600;">Forgot Access Key?</a>
                  </div>

                  <button type="submit" class="btn btn-primary" style="width: 100%; min-height: 48px; font-size: 0.9375rem; margin-top: var(--space-1);">
                    ENTER FRANCHISE WORKSPACE
                  </button>
                </form>
              ` : `
                <form onsubmit="handleLoginSubmit(event)" style="display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-2);">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">STAFF USERNAME OR EMAIL</label>
                    <input type="text" class="form-input" id="loginStaffIdentifier" placeholder="e.g. superadmin@acc.edu or handler@acc.edu" required>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">OPERATIONAL PASSWORD</label>
                    <input type="password" class="form-input" id="loginStaffSecret" placeholder="••••••••" required>
                  </div>

                  <div class="surface-subtle" style="padding: 8px 10px; border-left: 3px solid var(--color-blue); font-size: 0.6875rem; color: var(--text-muted); line-height: 1.4;">
                    Super Admin receives full governance suite. Handlers access live auction execution console only.
                  </div>

                  <div style="display: flex; justify-content: flex-end;">
                    <a href="javascript:void(0)" onclick="openForgotPasswordModal('STAFF')" style="font-size: 0.75rem; color: var(--color-green); text-decoration: none; font-weight: 600;">Forgot Staff Credentials?</a>
                  </div>

                  <button type="submit" class="btn btn-primary" style="width: 100%; min-height: 48px; font-size: 0.9375rem; margin-top: var(--space-1);">
                    AUTHENTICATE STAFF CREDENTIAL
                  </button>
                </form>
              `}

              <div style="margin-top: var(--space-5); text-align: center; border-top: 1px solid var(--border-subtle); padding-top: var(--space-4);">
                <button class="btn btn-secondary" style="width: 100%; font-size: 0.8125rem; min-height: 38px;" onclick="switchView('public')">
                  CONTINUE AS PUBLIC SPECTATOR
                </button>
              </div>

            </div>

          </div>
        </div>
      `;
    }
'''

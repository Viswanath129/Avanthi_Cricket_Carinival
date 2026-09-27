# append_views_part3.py
with open(r'B:\projects\ACC\generate_acc_2026.py', 'a', encoding='utf-8') as f:
    f.write(r'''
    // ========================================================
    // 7. VIEW 3: LIVE AUCTION FLOOR (SPECTATOR / BROADCAST)
    // ========================================================
    function renderLiveAuctionView() {
      const cur = players[lotIndex] || players[0];
      const inc = getBidIncrement(currentPrice);
      const nextBid = currentPrice + inc;
      const leader = franchises.find(f => f.id === leadingBidderId);
      const scarcity = getTournamentScarcity();

      return `
        ${scarcity.scarce ? `
          <div class="scarcity-banner">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="status-pill pill-yellow">⚠ TOURNAMENT SCARCITY</span>
              <div style="font-weight: 700; color: var(--text-bright);">
                Bucket ${scarcity.bucket}: Only ${scarcity.remaining} players remain with ${scarcity.required} required across franchises.
              </div>
            </div>
            <div style="font-size: 12px; color: var(--warning); font-weight: 600;">BIDDING REMAINS OPEN</div>
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 24px; margin-bottom: 24px;">
          <!-- MAIN PLAYER AUCTION STAGE -->
          <div class="surface-elevated" style="padding: 32px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="status-pill pill-green"><div class="pulse-dot"></div>${auctionState}</span>
                <span class="eyebrow" style="color: var(--text-dim);">LOT #${cur.id} • SCOPED DRAW #${cur.scopedNum}</span>
              </div>
              <span class="status-pill pill-orange">BUCKET ${cur.bucket}</span>
            </div>

            <!-- PLAYER DETAILS HERO -->
            <div style="display: grid; grid-template-columns: 140px 1fr; gap: 24px; align-items: center; margin-bottom: 28px;">
              <div style="width: 140px; height: 160px; border-radius: 14px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-medium); display: grid; place-items: center; font-size: 48px;">
                🏏
              </div>
              <div>
                <h1 class="display-title" style="font-size: clamp(2rem, 3.5vw, 3rem);">${cur.name}</h1>
                <div style="font-size: 14px; color: var(--text-dim); margin-top: 4px;">
                  <strong style="color: var(--primary);">${cur.type}</strong> • ${cur.program} ${cur.branch} • ${cur.year}
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;">
                  ${cur.tags.map(t => `<span class="status-pill pill-grey" style="font-size: 10px;">${t}</span>`).join('')}
                </div>
              </div>
            </div>

            <!-- LIVE BIDDING METRICS STRIP -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 0.8fr; gap: 16px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
              <div>
                <span class="eyebrow">CURRENT BID</span>
                <div class="sports-price" style="font-size: clamp(2.4rem, 4vw, 3.8rem); color: var(--auction);">${currentPrice} <span style="font-size: 18px; color: var(--text-dim);">C</span></div>
                <div style="font-size: 11px; color: var(--text-faint); margin-top: 2px;">BASE: ${cur.basePrice}C • INC: +${inc}C</div>
              </div>
              <div>
                <span class="eyebrow">LEADING BIDDER</span>
                <div style="font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--text-bright); margin-top: 4px;">
                  ${leader ? leader.name : "No Bids Placed"}
                </div>
                <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">
                  ${leader ? `Remaining Purse: ${leader.purse - currentPrice}C` : "Awaiting opening paddle"}
                </div>
              </div>
              <div style="text-align: right;">
                <span class="eyebrow">BID TIMER</span>
                <div class="sports-price timer-digit" id="displayTimer" style="font-size: clamp(2.4rem, 4vw, 3.8rem); color: var(--text-bright);">${timerSeconds}</div>
                <div style="font-size: 11px; color: var(--text-faint);">AUTHORITATIVE CLOCK</div>
              </div>
            </div>

            <!-- CONTROLS FOR OPERATOR / FAST TEST -->
            <div style="display: flex; gap: 12px; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 20px;">
              <div style="display: flex; gap: 10px;">
                <button class="btn btn-secondary" onclick="toggleAuctionPause()">
                  ${auctionState === 'LIVE' ? '⏸ PAUSE' : '▶ RESUME'}
                </button>
                <button class="btn btn-secondary" onclick="skipPlayer()">
                  ⏭ SKIP (RECALL)
                </button>
              </div>

              ${currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN_HANDLER' ? `
                <button class="btn btn-auction" style="font-size: 14px; padding: 10px 20px;" onclick="openHammerConfirmModal()">
                  🔨 CONFIRM HAMMER (SALE)
                </button>
              ` : `
                <button class="btn btn-primary" onclick="switchView('franchise')">
                  OPEN FRANCHISE BID TERMINAL →
                </button>
              `}
            </div>
          </div>

          <!-- RIGHT BID STREAM & TEAMS -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- REALTIME BIDS LEDGER -->
            <div class="surface-card" style="padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <span class="eyebrow" style="color: var(--primary);">LIVE BID STREAM</span>
                <span class="status-pill pill-grey">${bidHistory.length} BIDS</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${bidHistory.map((b, i) => `
                  <div style="display: flex; justify-content: space-between; align-items: center; background: ${i === 0 ? 'rgba(255, 138, 31, 0.12)' : 'rgba(255,255,255,0.02)'}; border: 1px solid ${i === 0 ? 'rgba(255, 138, 31, 0.3)' : 'var(--border-subtle)'}; border-radius: 8px; padding: 10px 14px;">
                    <div>
                      <strong style="color: var(--text-bright);">${b.bidder}</strong>
                      <span style="font-size: 11px; color: var(--text-faint); margin-left: 6px;">${b.t}</span>
                    </div>
                    <div class="sports-price" style="font-size: 18px; color: ${i === 0 ? 'var(--auction)' : 'var(--text-dim)'};">${b.price} C</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- FAST SIMULATE OTHER BIDDERS -->
            <div class="surface-card" style="padding: 16px;">
              <span class="eyebrow" style="color: var(--text-dim); display: block; margin-bottom: 8px;">SIMULATE FLOOR BID</span>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
                ${franchises.slice(0, 8).map(x => `
                  <button class="btn btn-secondary" style="font-size: 11px; padding: 6px;" onclick="placeBid('${x.id}')">
                    ${x.short}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- 11 TEAMS FLOOR STATUS GRID -->
        <section class="surface-card" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <span class="eyebrow" style="color: var(--primary);">11 FRANCHISES FLOOR STATUS</span>
            <span style="font-size: 12px; color: var(--text-dim);">Live Bid Eligibility & Passed Status</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
            ${franchises.map(f => {
              const maxLegal = calculateMaxBid(f);
              const isLead = f.id === leadingBidderId;
              const hasPassed = passedFranchises.has(f.id);
              const isBlocked = nextBid > maxLegal;

              let statusLabel = isLead ? "LEAD" : (hasPassed ? "PASSED" : (isBlocked ? "BLOCKED" : "IN PLAY"));
              let statusClass = isLead ? "pill-orange" : (hasPassed ? "pill-grey" : (isBlocked ? "pill-red" : "pill-green"));

              return `
                <div style="background: rgba(255,255,255,0.02); border: 1px solid ${isLead ? 'var(--auction)' : 'var(--border-subtle)'}; border-radius: 10px; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong style="color: var(--text-bright);">${f.name}</strong>
                    <span class="status-pill ${statusClass}" style="font-size: 9px; padding: 2px 6px;">${statusLabel}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim);">
                    <span>Purse: <strong style="color: var(--text-bright);">${f.purse}C</strong></span>
                    <span>Max: <strong style="color: var(--primary);">${maxLegal}C</strong></span>
                  </div>
                  <div style="font-size: 10px; color: var(--text-faint); margin-top: 4px;">
                    Squad: ${f.bought}/17 • Bucket ${cur.bucket}: ${f.buckets[cur.bucket] || 0}/${f.needed[cur.bucket] || 2}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      `;
    }

    // ========================================================
    // 8. VIEW 4: FRANCHISE TRADING TERMINAL (MOBILE-FIRST)
    // ========================================================
    function renderFranchiseTerminalView() {
      const f = franchises.find(x => x.id === selectedFranchiseId) || franchises[0];
      const cur = players[lotIndex] || players[0];
      const inc = getBidIncrement(currentPrice);
      const nextPrice = currentPrice + inc;
      const maxLegal = calculateMaxBid(f);
      const isLead = f.id === leadingBidderId;
      const hasPassed = passedFranchises.has(f.id);
      const isBlocked = nextPrice > maxLegal;
      const scarcity = getTournamentScarcity();

      return `
        <div style="max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
          <!-- FRANCHISE IDENTITY & CONNECTION BAR -->
          <div class="surface-card" style="padding: 16px 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(25, 195, 125, 0.15); color: var(--primary); display: grid; place-items: center; font-weight: 800; font-family: var(--font-sports);">
                  ${f.short}
                </div>
                <div>
                  <div style="font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text-bright);">${f.name}</div>
                  <div style="font-size: 11px; color: var(--text-dim);">
                    Signed in as <strong>${franchiseLoginIdentity === 'COORDINATOR' ? 'FACULTY COORDINATOR' : 'CAPTAIN'}</strong>
                  </div>
                </div>
              </div>

              <!-- DUAL LOGIN IDENTITY QUICK TOGGLE -->
              <div style="display: flex; gap: 6px;">
                <button class="btn ${franchiseLoginIdentity === 'COORDINATOR' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 10px; padding: 4px 8px;" onclick="franchiseLoginIdentity = 'COORDINATOR'; showToast('Switched to Faculty Coordinator view', 'info'); renderCurrentView();">
                  Coordinator
                </button>
                <button class="btn ${franchiseLoginIdentity === 'CAPTAIN' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 10px; padding: 4px 8px;" onclick="franchiseLoginIdentity = 'CAPTAIN'; showToast('Switched to Captain bidding view', 'info'); renderCurrentView();">
                  Captain
                </button>
              </div>
            </div>

            <!-- TEAM SWITCHER FOR DEMO EVALUATION -->
            <div style="display: flex; align-items: center; gap: 8px; border-top: 1px solid var(--border-subtle); padding-top: 10px; font-size: 11px;">
              <span style="color: var(--text-faint);">Switch Team:</span>
              <select class="form-select" style="padding: 4px 8px; font-size: 11px; height: 28px;" onchange="selectedFranchiseId = this.value; renderCurrentView();">
                ${franchises.map(x => `<option value="${x.id}" ${x.id === selectedFranchiseId ? 'selected' : ''}>${x.name}</option>`).join('')}
              </select>
              <span class="status-pill pill-green" style="margin-left: auto; font-size: 9px;"><div class="pulse-dot"></div>CONNECTED</span>
            </div>
          </div>

          <!-- FINANCIAL CAPABILITIES METRICS -->
          <div class="surface-elevated" style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 12px 6px;">
              <span class="eyebrow">REMAINING PURSE</span>
              <div class="sports-price" style="font-size: 26px; color: var(--primary); margin-top: 2px;">${f.purse} <span style="font-size: 12px;">C</span></div>
            </div>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 12px 6px;">
              <span class="eyebrow" style="color: var(--auction);">MAX LEGAL BID</span>
              <div class="sports-price" style="font-size: 26px; color: var(--auction); margin-top: 2px;">${maxLegal} <span style="font-size: 12px;">C</span></div>
            </div>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 12px 6px;">
              <span class="eyebrow">SQUAD SIZE</span>
              <div class="sports-price" style="font-size: 26px; color: var(--text-bright); margin-top: 2px;">${f.bought} <span style="font-size: 12px; color: var(--text-dim);">/ 17</span></div>
            </div>
          </div>

          <!-- BUCKET REQUIREMENTS MINI-GRID -->
          <div class="surface-card" style="padding: 16px;">
            <span class="eyebrow" style="color: var(--text-dim); display: block; margin-bottom: 8px;">MANDATORY BUCKET QUOTAS</span>
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; text-align: center;">
              ${['B1', 'B2', 'B3', 'B4', 'B5', 'PG'].map(b => {
                const got = (f.buckets && f.buckets[b]) || 0;
                const need = (f.needed && f.needed[b]) || 2;
                const done = got >= need;
                return `
                  <div style="background: ${done ? 'rgba(25, 195, 125, 0.1)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${done ? 'rgba(25, 195, 125, 0.3)' : 'var(--border-subtle)'}; border-radius: 8px; padding: 6px 2px;">
                    <div style="font-size: 10px; font-weight: 700; color: ${done ? 'var(--primary)' : 'var(--text-dim)'};">${b}</div>
                    <div style="font-size: 12px; font-weight: 800; font-family: var(--font-mono);">${got}/${need}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- ACTIVE LOT CARD -->
          <div class="surface-elevated" style="padding: 24px; border-color: ${isLead ? 'var(--auction)' : 'var(--border-medium)'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <span class="status-pill pill-orange">LOT #${cur.id} • BUCKET ${cur.bucket}</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="eyebrow">TIMER</span>
                <span class="sports-price timer-digit" style="font-size: 26px; color: var(--text-bright);">${timerSeconds}s</span>
              </div>
            </div>

            <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; border-radius: 12px; background: rgba(255,255,255,0.05); display: grid; place-items: center; font-size: 28px;">🏏</div>
              <div>
                <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--text-bright);">${cur.name}</h2>
                <div style="font-size: 12px; color: var(--text-dim);">${cur.type} • ${cur.program} ${cur.branch}</div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: rgba(0,0,0,0.3); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
              <div>
                <span class="eyebrow">CURRENT PRICE</span>
                <div class="sports-price" style="font-size: 32px; color: var(--auction);">${currentPrice} C</div>
              </div>
              <div>
                <span class="eyebrow">HIGH BIDDER</span>
                <div style="font-weight: 800; font-size: 18px; color: ${isLead ? 'var(--primary)' : 'var(--text-bright)'}; margin-top: 4px;">
                  ${isLead ? "★ YOU LEAD" : (franchises.find(x => x.id === leadingBidderId)?.name || "None")}
                </div>
              </div>
            </div>

            <!-- PRIMARY ONE-HANDED MOBILE BID ACTION -->
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <button id="franchiseBidBtn" class="btn-giant-bid" ${isBlocked || isLead ? 'disabled' : ''} onclick="placeBid('${f.id}')">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                ${isLead ? 'YOU ARE HIGHEST BIDDER' : (isBlocked ? `BLOCKED (MAX ${maxLegal}C)` : `BID ${nextPrice} CREDITS`)}
              </button>

              <!-- REVERSIBLE PASS / RE-ENTER TOGGLE -->
              ${!hasPassed ? `
                <button class="btn btn-secondary" style="height: 48px; font-size: 14px; font-weight: 700;" onclick="passLot('${f.id}')">
                  — PASS ON LOT #${cur.id}
                </button>
              ` : `
                <button class="btn btn-primary" style="height: 48px; font-size: 14px; font-weight: 700;" onclick="reEnterLot('${f.id}')">
                  ✓ RE-ENTER AUCTION (IN PLAY)
                </button>
              `}
            </div>

            ${hasPassed ? `
              <div style="text-align: center; margin-top: 10px; font-size: 11px; color: var(--warning);">
                Franchise status: <strong>PASSED</strong>. You can re-enter at any point prior to hammer.
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }
''')
    print("Live auction and franchise terminal views appended.")

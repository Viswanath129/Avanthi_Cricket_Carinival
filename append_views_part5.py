# append_views_part5.py
with open(r'B:\projects\ACC\generate_acc_2026.py', 'a', encoding='utf-8') as f:
    f.write(r'''
    // ========================================================
    // 12. VIEW 8: ADMIN / SUPER ADMIN OPERATIONAL CONSOLE
    // ========================================================
    let adminActiveTab = "overview"; // "overview", "undo", "audit", "round2"

    function renderAdminConsoleView() {
      const isSuper = currentUser.role === "SUPER_ADMIN";
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const inc = getBidIncrement(currentPrice);

      return `
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <!-- ADMIN CONSOLE HEADER -->
          <div class="surface-elevated" style="padding: 24px 32px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 14px;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span class="status-pill ${isSuper ? 'pill-orange' : 'pill-yellow'}">
                    ${isSuper ? '★ SUPER ADMIN LEVEL' : 'AUCTION HANDLER'}
                  </span>
                  <span class="status-pill pill-green"><div class="pulse-dot"></div>SYSTEM ONLINE</span>
                </div>
                <h1 class="display-title" style="font-size: 28px; margin-top: 4px;">
                  ${isSuper ? 'SUPER ADMIN OPERATIONS CENTER' : 'AUCTION FLOOR OPERATOR CONSOLE'}
                </h1>
                <div style="font-size: 13px; color: var(--text-dim);">
                  ${isSuper ? 'Authoritative Tournament Master • Multi-Sale Forensic Undo • Full Governance' : 'Live Floor Lot Dispatcher • Bidding Execution • Hammer Controls'}
                </div>
              </div>

              <!-- DRAW MODE TOGGLE -->
              <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-medium); border-radius: 12px; padding: 10px 16px;">
                <span class="eyebrow" style="display: block; margin-bottom: 6px;">DRAW SELECTION MODE</span>
                <div style="display: flex; gap: 6px;">
                  <button class="btn ${drawMode === 'AUTO' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 11px; padding: 6px 12px;" onclick="drawMode = 'AUTO'; showToast('Switched to AUTO DRAW Mode', 'info'); renderCurrentView();">
                    AUTO DRAW
                  </button>
                  <button class="btn ${drawMode === 'GUEST' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 11px; padding: 6px 12px;" onclick="drawMode = 'GUEST'; showToast('Switched to GUEST CALL Mode', 'info'); renderCurrentView();">
                    GUEST CALL
                  </button>
                </div>
              </div>
            </div>

            <!-- KEY OPERATIONAL METRICS -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; border-top: 1px solid var(--border-subtle); padding-top: 16px; text-align: center;">
              <div>
                <span class="eyebrow">REGISTERED</span>
                <div class="sports-price" style="font-size: 24px; color: var(--text-bright);">186</div>
              </div>
              <div>
                <span class="eyebrow">PAID / VERIFIED</span>
                <div class="sports-price" style="font-size: 24px; color: var(--primary);">174</div>
              </div>
              <div>
                <span class="eyebrow">AUCTIONABLE</span>
                <div class="sports-price" style="font-size: 24px; color: var(--text-bright);">168</div>
              </div>
              <div>
                <span class="eyebrow">FRANCHISES</span>
                <div class="sports-price" style="font-size: 24px; color: var(--text-bright);">11</div>
              </div>
              <div>
                <span class="eyebrow">CURRENT LOT</span>
                <div class="sports-price" style="font-size: 24px; color: var(--auction);">#${cur.id}</div>
              </div>
              <div>
                <span class="eyebrow">ROUND</span>
                <div class="sports-price" style="font-size: 24px; color: var(--text-bright);">R${auctionRound}</div>
              </div>
            </div>
          </div>

          <!-- ADMIN SUB-NAV FOR SUPER ADMIN -->
          ${isSuper ? `
            <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
              <button class="btn ${adminActiveTab === 'overview' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 12px;" onclick="adminActiveTab = 'overview'; renderCurrentView();">
                Auction Floor Operations
              </button>
              <button class="btn ${adminActiveTab === 'undo' ? 'btn-auction' : 'btn-secondary'}" style="font-size: 12px;" onclick="adminActiveTab = 'undo'; renderCurrentView();">
                Forensic Multi-Sale Undo (${salesHistory.length})
              </button>
              <button class="btn ${adminActiveTab === 'audit' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 12px;" onclick="adminActiveTab = 'audit'; renderCurrentView();">
                Audit Trail Stream
              </button>
              <button class="btn ${adminActiveTab === 'round2' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 12px;" onclick="adminActiveTab = 'round2'; renderCurrentView();">
                Round 2 & Auto-Allotment
              </button>
            </div>
          ` : ''}

          <!-- TAB 1: FLOOR OPERATIONS -->
          ${adminActiveTab === 'overview' ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
              <!-- ACTIVE LOT DISPATCH CARD -->
              <div class="surface-card" style="padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                  <span class="status-pill pill-orange">LOT #${cur.id} • SCOPED #${cur.scopedNum}</span>
                  <span class="eyebrow">BUCKET ${cur.bucket} (${cur.year})</span>
                </div>

                <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 20px;">
                  <div style="width: 72px; height: 72px; border-radius: 12px; background: rgba(255,255,255,0.05); display: grid; place-items: center; font-size: 32px;">🏏</div>
                  <div>
                    <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--text-bright);">${cur.name}</h2>
                    <div style="font-size: 13px; color: var(--text-dim);">${cur.type} • ${cur.program} ${cur.branch}</div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                  <div>
                    <span class="eyebrow">ACTIVE PRICE</span>
                    <div class="sports-price" style="font-size: 32px; color: var(--auction);">${currentPrice} C</div>
                    <div style="font-size: 10px; color: var(--text-faint);">BASE: ${cur.basePrice}C • INC: +${inc}C</div>
                  </div>
                  <div>
                    <span class="eyebrow">CURRENT LEADER</span>
                    <div style="font-weight: 800; font-size: 20px; color: var(--text-bright); margin-top: 4px;">
                      ${leader ? leader.name : "No Bid"}
                    </div>
                    <div style="font-size: 11px; color: var(--text-dim);">
                      Timer: <strong class="timer-digit" style="color: var(--primary);">${timerSeconds}s</strong>
                    </div>
                  </div>
                </div>

                <!-- FAST ACTION CONTROLS -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                  <button class="btn btn-auction" style="height: 48px; font-weight: 800;" onclick="openHammerConfirmModal()">
                    🔨 HAMMER SALE
                  </button>
                  <button class="btn btn-primary" style="height: 48px; font-weight: 800;" onclick="drawNextPlayer()">
                    ⏭ DRAW NEXT
                  </button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <button class="btn btn-secondary" onclick="toggleAuctionPause()">
                    ${auctionState === 'LIVE' ? '⏸ Pause Timer' : '▶ Resume Timer'}
                  </button>
                  <button class="btn btn-secondary" onclick="skipPlayer()">
                    ⏭ Skip Lot (Recall Queue)
                  </button>
                </div>
              </div>

              <!-- BUCKET SEQUENCE & DATA EXPORTS -->
              <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="surface-card" style="padding: 20px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span class="eyebrow" style="color: var(--primary);">BUCKET DRAW SEQUENCE</span>
                    <span class="status-pill pill-green">ACTIVE: ${BUCKET_SEQUENCE[activeBucketIndex]}</span>
                  </div>
                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${BUCKET_SEQUENCE.map((b, i) => `
                      <span class="status-pill ${i === activeBucketIndex ? 'pill-orange' : (i < activeBucketIndex ? 'pill-green' : 'pill-grey')}">
                        ${b} ${i === activeBucketIndex ? '★' : (i < activeBucketIndex ? '✓' : '')}
                      </span>
                    `).join('')}
                  </div>
                  <div style="font-size: 11px; color: var(--text-dim); margin-top: 10px;">
                    Order: B.Tech 3rd Yr (B3) → 4th Yr (B4) → 2nd Yr (B2) → Diploma (B5) → 1st Yr (B1) → PG (Last).
                  </div>
                </div>

                <!-- CSV EXPORTS -->
                <div class="surface-card" style="padding: 20px;">
                  <span class="eyebrow" style="color: var(--text-bright); display: block; margin-bottom: 12px;">FORENSIC DATA EXPORTS</span>
                  <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn btn-secondary" style="font-size: 12px;" onclick="exportSquadsCSV()">
                      📥 Export Squads CSV
                    </button>
                    <button class="btn btn-secondary" style="font-size: 12px;" onclick="exportAuditStream()">
                      📥 Export Audit Trail CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- TAB 2: FORENSIC MULTI-SALE UNDO -->
          ${adminActiveTab === 'undo' ? `
            <div class="surface-elevated" style="padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <div>
                  <h2 style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright);">FORENSIC MULTI-SALE REVERSAL ENGINE</h2>
                  <div style="font-size: 12px; color: var(--text-dim);">Super Admin can undo ANY historical sale at any point in the auction with mandatory reason logging.</div>
                </div>
                <span class="status-pill pill-orange">${salesHistory.length} RECORDED SALES</span>
              </div>

              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--border-medium); text-align: left;">
                      <th style="padding: 10px; color: var(--text-dim);">SALE ID</th>
                      <th style="padding: 10px; color: var(--text-dim);">PLAYER</th>
                      <th style="padding: 10px; color: var(--text-dim);">BUCKET</th>
                      <th style="padding: 10px; color: var(--text-dim);">PURCHASING FRANCHISE</th>
                      <th style="padding: 10px; color: var(--text-dim);">PRICE</th>
                      <th style="padding: 10px; color: var(--text-dim);">TIMESTAMP</th>
                      <th style="padding: 10px; color: var(--text-dim);">STATUS</th>
                      <th style="padding: 10px; text-align: right; color: var(--text-dim);">FORENSIC ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${salesHistory.map(s => `
                      <tr style="border-bottom: 1px solid var(--border-subtle); background: ${s.status === 'UNDONE' ? 'rgba(255, 77, 79, 0.05)' : 'transparent'};">
                        <td style="padding: 12px 10px; font-family: var(--font-mono); font-weight: 700;">${s.id}</td>
                        <td style="padding: 12px 10px; font-weight: 700; color: var(--text-bright);">${s.playerName}</td>
                        <td style="padding: 12px 10px;"><span class="status-pill pill-grey">${s.bucket}</span></td>
                        <td style="padding: 12px 10px; font-weight: 700; color: var(--primary);">${s.franchiseName}</td>
                        <td style="padding: 12px 10px; font-family: var(--font-mono); font-weight: 800; color: var(--auction);">${s.price} C</td>
                        <td style="padding: 12px 10px; font-family: var(--font-mono); color: var(--text-dim);">${s.timestamp}</td>
                        <td style="padding: 12px 10px;">
                          <span class="status-pill ${s.status === 'COMMITTED' ? 'pill-green' : 'pill-red'}">
                            ${s.status}
                          </span>
                        </td>
                        <td style="padding: 12px 10px; text-align: right;">
                          ${s.status === 'COMMITTED' ? `
                            <button class="btn btn-danger" style="padding: 6px 12px; font-size: 11px;" onclick="openUndoModal('${s.id}')">
                              ↩ UNDO SALE
                            </button>
                          ` : `
                            <span style="font-size: 11px; color: var(--danger); font-weight: 600;">Reversed (${s.undoReason || 'Corrected'})</span>
                          `}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- TAB 3: AUDIT TRAIL STREAM -->
          ${adminActiveTab === 'audit' ? `
            <div class="surface-elevated" style="padding: 24px;">
              <h2 style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright); margin-bottom: 16px;">IMMUTABLE AUDIT TRAIL</h2>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${auditLog.map(a => `
                  <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <span style="font-family: var(--font-mono); color: var(--text-faint);">${a.time}</span>
                      <span class="status-pill ${a.type === 'UNDO' ? 'pill-red' : (a.type === 'HAMMER' ? 'pill-orange' : 'pill-green')}" style="font-size: 10px;">
                        ${a.type}
                      </span>
                      <strong style="color: var(--text-bright);">${a.who}</strong>
                      <span style="color: var(--text-dim);">${a.msg}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- TAB 4: ROUND 2 & AUTO-ALLOTMENT -->
          ${adminActiveTab === 'round2' ? `
            <div class="surface-elevated" style="padding: 24px;">
              <h2 style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright); margin-bottom: 8px;">ROUND 2 & AUTO-ALLOTMENT ENGINE</h2>
              <p style="font-size: 13px; color: var(--text-dim); margin-bottom: 20px;">
                Reopen all unsold players and uncalled skipped players at base price 20 credits. Auto-allot unsold players to franchises needing unmet mandatory quotas.
              </p>
              <div style="display: flex; gap: 12px;">
                <button class="btn btn-primary" onclick="triggerRound2()">
                  🚀 INITIATE ROUND 2 (RESET BASE 20C)
                </button>
                <button class="btn btn-secondary" onclick="autoAllotUnsold()">
                  ⚖ EXECUTE AUTO-ALLOTMENT (20C)
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    function triggerRound2() {
      auctionRound = 2;
      players.forEach(p => {
        if (p.status === "UNSOLD" || p.status === "SKIPPED") {
          p.status = "UNSOLD";
          p.basePrice = 20; // Round 2 reset base price to 20 credits
        }
      });
      showToast("ROUND 2 INITIALIZED: All unsold players reset to 20 credits base price!", "success");
      broadcastAuctionState();
      renderCurrentView();
    }

    function autoAllotUnsold() {
      let allottedCount = 0;
      players.filter(p => p.status === "UNSOLD").forEach(p => {
        const needyTeam = franchises.find(f => {
          const got = (f.buckets && f.buckets[p.bucket]) || 0;
          const need = (f.needed && f.needed[p.bucket]) || 2;
          return got < need && f.purse >= 20;
        });
        if (needyTeam) {
          needyTeam.purse -= 20;
          needyTeam.bought = (needyTeam.bought || 0) + 1;
          if (!needyTeam.buckets) needyTeam.buckets = {};
          needyTeam.buckets[p.bucket] = (needyTeam.buckets[p.bucket] || 0) + 1;
          p.status = "ALLOTTED"; // Spec explicitly states: never call it SOLD
          p.allottedTo = needyTeam.id;
          allottedCount++;
        }
      });
      showToast(`Auto-allotment complete! ${allottedCount} players allotted at 20C.`, "success");
      broadcastAuctionState();
      renderCurrentView();
    }

    function exportSquadsCSV() {
      let csv = "Franchise,Purse,Bought,B1,B2,B3,B4,B5,PG\n";
      franchises.forEach(f => {
        csv += `"${f.name}",${f.purse},${f.bought},${f.buckets.B1||0},${f.buckets.B2||0},${f.buckets.B3||0},${f.buckets.B4||0},${f.buckets.B5||0},${f.buckets.PG||0}\n`;
      });
      downloadBlob(csv, "acc_squads_2026.csv", "text/csv");
      showToast("Squads CSV exported successfully!", "success");
    }

    function exportAuditStream() {
      let csv = "ID,Timestamp,Who,Role,Type,Message\n";
      auditLog.forEach(a => {
        csv += `${a.id},"${a.time}","${a.who}","${a.role}","${a.type}","${a.msg}"\n`;
      });
      downloadBlob(csv, "acc_audit_trail_2026.csv", "text/csv");
      showToast("Audit Trail CSV exported successfully!", "success");
    }

    function downloadBlob(content, filename, contentType) {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }

    // ========================================================
    // 13. VIEW 9: PROJECTOR VIEW (/projector) - FULLSCREEN AUDITORIUM
    // ========================================================
    function renderProjectorView() {
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const scarcity = getTournamentScarcity();

      return `
        <div style="position: fixed; inset: 0; z-index: 500; background: #030504; color: var(--text-bright); padding: 40px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden;">
          <!-- TOP PROJECTOR HEADER -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <img src="acc-logo.jpg" alt="Logo" style="width: 52px; height: 52px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);">
              <div>
                <span class="eyebrow" style="color: var(--primary); font-size: 14px; letter-spacing: 0.2em;">AVANTHI CRICKET CARNIVAL 2026</span>
                <div style="font-family: var(--font-display); font-size: 24px; font-weight: 800;">AUDITORIUM LIVE BROADCAST</div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 20px;">
              <span class="status-pill pill-green" style="font-size: 14px; padding: 8px 16px;">
                <div class="pulse-dot"></div>${auctionState} • ROUND 0${auctionRound}
              </span>
              <button class="btn btn-secondary" style="font-size: 12px; padding: 8px 14px;" onclick="switchView('live')">
                EXIT PROJECTOR ✕
              </button>
            </div>
          </div>

          ${scarcity.scarce ? `
            <div style="background: rgba(255, 209, 102, 0.15); border: 2px solid var(--warning); border-radius: 14px; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-sports); font-size: 24px; color: var(--warning); font-weight: 800;">
                ⚠ AUDITORIUM ALERT: BUCKET ${scarcity.bucket} SCARCITY (${scarcity.remaining} REMAINING)
              </span>
              <span style="font-size: 16px; color: var(--text-bright); font-weight: 700;">BIDDING OPEN</span>
            </div>
          ` : ''}

          <!-- CENTER MASSIVE AUCTION DISPLAY -->
          <div style="display: grid; grid-template-columns: 1fr 1.1fr; gap: 48px; align-items: center;">
            <!-- PLAYER INFORMATION -->
            <div style="display: flex; gap: 32px; align-items: center;">
              <div style="width: 220px; height: 260px; border-radius: 20px; background: rgba(255,255,255,0.04); border: 2px solid var(--border-medium); display: grid; place-items: center; font-size: 80px; box-shadow: var(--shadow-lg);">
                🏏
              </div>
              <div>
                <span class="status-pill pill-orange" style="font-size: 16px; padding: 6px 14px; margin-bottom: 12px;">
                  LOT #${cur.id} • BUCKET ${cur.bucket}
                </span>
                <h1 class="display-title" style="font-size: clamp(3.2rem, 5.5vw, 5.5rem); margin-top: 6px; line-height: 1;">
                  ${cur.name}
                </h1>
                <div style="font-size: 22px; color: var(--primary); font-weight: 700; margin-top: 8px;">
                  ${cur.type}
                </div>
                <div style="font-size: 18px; color: var(--text-dim); margin-top: 4px;">
                  ${cur.program} ${cur.branch} • ${cur.year} • Roll: ${cur.roll}
                </div>
                <div style="font-size: 18px; color: var(--auction); font-weight: 700; margin-top: 8px;">
                  BASE PRICE: ${cur.basePrice} CREDITS
                </div>
              </div>
            </div>

            <!-- GIANT PRICE & CLOCK -->
            <div style="background: rgba(17, 28, 22, 0.85); border: 2px solid var(--border-medium); border-radius: 24px; padding: 40px; box-shadow: var(--shadow-lg); text-align: center;">
              <span class="eyebrow" style="font-size: 16px; letter-spacing: 0.2em; color: var(--text-dim);">CURRENT AUTHORITATIVE BID</span>
              <div class="sports-price" style="font-size: clamp(5rem, 11vw, 10.5rem); color: var(--auction); line-height: 1; margin: 10px 0;">
                ${currentPrice} <span style="font-size: 40px; color: var(--text-dim);">C</span>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 2px solid var(--border-subtle); padding-top: 20px; align-items: center;">
                <div style="text-align: left;">
                  <span class="eyebrow" style="font-size: 13px;">LEADING FRANCHISE</span>
                  <div style="font-family: var(--font-display); font-size: 32px; font-weight: 800; color: var(--primary);">
                    ${leader ? leader.name : "None"}
                  </div>
                </div>
                <div style="text-align: right;">
                  <span class="eyebrow" style="font-size: 13px;">OFFICIAL TIMER</span>
                  <div class="sports-price timer-digit" style="font-size: 52px; color: var(--text-bright); line-height: 1;">
                    ${timerSeconds}s
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- BOTTOM 11 TEAMS STATUS TICKER -->
          <div style="display: grid; grid-template-columns: repeat(11, 1fr); gap: 10px;">
            ${franchises.map(f => {
              const isLead = f.id === leadingBidderId;
              const hasPassed = passedFranchises.has(f.id);
              const maxLegal = calculateMaxBid(f);
              const isBlocked = (currentPrice + getBidIncrement(currentPrice)) > maxLegal;

              let statusLabel = isLead ? "LEAD" : (hasPassed ? "PASSED" : (isBlocked ? "BLOCKED" : "ACTIVE"));
              let statusClass = isLead ? "pill-orange" : (hasPassed ? "pill-grey" : (isBlocked ? "pill-red" : "pill-green"));

              return `
                <div style="background: rgba(255,255,255,0.03); border: 1.5px solid ${isLead ? 'var(--auction)' : 'var(--border-subtle)'}; border-radius: 10px; padding: 10px 8px; text-align: center;">
                  <div style="font-weight: 800; font-size: 13px; color: var(--text-bright);">${f.short}</div>
                  <div style="margin: 4px 0;"><span class="status-pill ${statusClass}" style="font-size: 9px; padding: 2px 4px;">${statusLabel}</span></div>
                  <div style="font-size: 11px; font-family: var(--font-mono); color: var(--primary); font-weight: 700;">${f.purse}C</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
''')
    print("Admin console and projector views appended.")

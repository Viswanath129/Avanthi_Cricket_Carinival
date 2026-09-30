import re

def process_acc_html():
    with open('Acc-Auction-Os.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. FIX ADMIN LIVE AUCTION REGIONS (Theme -> Light Theme)
    # Check the live auction block from line 11070
    old_live_block_pattern = re.compile(
        r'(<!-- REGION 1: STATUS BAR \(Cyber Command Status Header\) -->[\s\S]*?<!-- REGION 5: AUDIT STREAM \(Last 20 Events, Live Append\) -->[\s\S]*?</div>\s*</div>\s*</div>)',
        re.MULTILINE
    )

    # Let's verify we find the live block
    match = old_live_block_pattern.search(html)
    if not match:
        print("ERROR: Could not find live auction block")
        return False

    print("Found live auction block, replacing with light theme...")

    # SVG close icon definition
    close_svg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'

    # SVG icons for login
    user_svg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
    shield_svg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>'
    crown_svg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>'
    zap_svg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>'
    eye_svg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
    eye_off_svg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>'

    new_live_block = """<!-- REGION 1: STATUS BAR (Light Theme Status Header) -->
              <div class="surface-card" style="padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; background: #ffffff; border: 1px solid var(--border-soft); border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; gap: 10px; font-size: 0.75rem; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 6px; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 4px;">
                    <span class="label-micro" style="color: #047857; font-weight: 800;">EDITION</span>
                    <strong style="color: #0f172a; font-family: var(--font-mono);">${window.editionMarker || 'ACC 2026'}</strong>
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px; background: #f0f9ff; border: 1px solid #bae6fd; padding: 2px 8px; border-radius: 4px;">
                    <span class="label-micro" style="color: #0284c7; font-weight: 800;">SESSION</span>
                    <strong style="color: #0f172a;">${window.sessionMarker || 'Session 2 — Day 1'}</strong>
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px; background: #fffbeb; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 4px;">
                    <span class="label-micro" style="color: #b45309; font-weight: 800;">DRAW MODE</span>
                    <strong style="color: #0f172a; font-family: var(--font-mono);">${drawMode}</strong>
                    <button class="btn btn-secondary" style="padding: 2px 8px; font-size: 0.65rem; border-radius: 4px; font-weight: 700; background: #fef3c7; color: #b45309; border: 1px solid #fcd34d;" onclick="toggleDrawMode()">[D] TOGGLE</button>
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 4px;">
                    <span class="status-indicator status-live" style="width: 6px; height: 6px;"></span>
                    <span style="color: #047857; font-weight: 800; font-size: 0.7rem; font-family: var(--font-mono);">MESH HEALTHY</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 4px;">
                    <span class="label-micro" style="color: #64748b;">CLOCK SYNC</span>
                    <span class="font-mono" style="color: #0284c7; font-weight: 700;">Synced ±0ms</span>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span class="label-micro" style="color: #64748b;">AUCTION STATE</span>
                    <span class="status-badge ${auctionPaused ? 'status-warning' : timerSeconds === 0 ? 'status-blocked' : 'status-inplay'}" style="font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 4px;">
                      ${auctionPaused ? 'PAUSED' : timerSeconds === 0 ? 'TIMER EXPIRED' : 'LOT OPEN'}
                    </span>
                  </div>
                  <div style="font-size: 0.75rem; color: #334155; background: #f8fafc; border: 1px solid #e2e8f0; padding: 3px 8px; border-radius: 4px;">
                    <span class="label-micro" style="color: #64748b;">OPERATOR:</span>
                    <strong style="color: #0f172a;">${currentUser.role === 'SUPER_ADMIN' ? 'Super Admin — ' + (window.superAdminName || 'Mr. Deepak') : 'Operator — ' + (currentUser.name || 'Official')}</strong>
                  </div>
                </div>
              </div>

              <!-- REGION 2: LOT STRIP (Player Spotlight Card) -->
              <div class="surface-card" style="padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; background: #ffffff; border: 1px solid var(--border-soft); border-left: 4px solid var(--color-green); border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); gap: 14px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                  <div style="width: 72px; height: 72px; border-radius: 8px; overflow: hidden; background: #f1f5f9; display: flex; align-items: center; justify-content: center; border: 1px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.04); flex-shrink: 0;">
                    ${cur.photo ? `<img src="${cur.photo}" style="width: 100%; height: 100%; object-fit: cover;">` : `<span style="font-size: 1.8rem; font-weight: 800; color: #64748b;">${(cur.name || 'P').charAt(0)}</span>`}
                  </div>
                  <div>
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                      <span class="status-badge" style="background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; font-size: 0.68rem; font-weight: 800; font-family: var(--font-mono); padding: 1px 8px; border-radius: 4px;">LOT #${cur.id}</span>
                      <span class="status-badge" style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 0.68rem; font-weight: 800; padding: 1px 8px; border-radius: 4px;">
                        ${cur.bucket === 'NO_BUCKET' ? 'PG (No Bucket)' : cur.bucket}
                      </span>
                      <span class="status-badge" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; font-size: 0.65rem; font-weight: 700; padding: 1px 8px; border-radius: 4px;">${cur.derivedType || 'ALL-ROUNDER'}</span>
                      ${cur.isCurrentYearAdmission ? '<span class="status-badge" style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 0.62rem; font-weight: 700; padding: 1px 6px; border-radius: 4px;">CURRENT-YEAR ADMIT</span>' : ''}
                      ${cur.cricHeroesStatus === 'PROFILE CREATION PENDING' ? '<span class="status-badge" style="background: #fffbeb; color: #b45309; border: 1px solid #fde68a; font-size: 0.62rem; font-weight: 700; padding: 1px 6px; border-radius: 4px;">CRICHEROES PENDING</span>' : '<span class="status-badge" style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 0.62rem; font-weight: 700; padding: 1px 6px; border-radius: 4px;">CRICHEROES VERIFIED</span>'}
                    </div>
                    <div style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; margin-top: 2px;">
                      ${cur.name}
                    </div>
                    <div style="font-size: 0.75rem; color: #475569; margin-top: 2px;">
                      Roll: <strong class="font-mono" style="color: #2563eb; font-weight: 800;">${cur.roll}</strong> • <span style="color: #334155;">${cur.program || 'B.Tech'}</span> · <span style="color: #334155;">${cur.department || cur.branch || 'CSE'}</span> · Year <strong style="color: #0f172a;">${cur.year}</strong> • Bat: <span style="color: #334155;">${cur.battingArm || 'Right Hand'}</span> • Bowl: <span style="color: #334155;">${cur.bowlingArm || 'Right Arm'}</span>
                    </div>
                  </div>
                </div>

                <div style="text-align: right; display: flex; align-items: center; gap: 20px;">
                  <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 6px 14px; border-radius: 6px; text-align: right;">
                    <span class="label-micro" style="color: #047857; font-weight: 800;">BASE PRICE</span>
                    <div class="font-mono" style="font-size: 1.45rem; font-weight: 900; color: #047857; font-variant-numeric: tabular-nums;">${cur.basePrice}C</div>
                  </div>
                  <div>
                    <span class="label-micro" style="color: #64748b;">AUCTION STATUS</span>
                    <div style="margin-top: 2px;"><span class="status-badge ${cur.status === 'SOLD' ? 'status-connected' : cur.status === 'UNSOLD' ? 'status-blocked' : 'status-inplay'}" style="font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 4px;">${cur.status}</span></div>
                  </div>
                </div>
              </div>

              <!-- REGION 3: LIVE BID, IN-PLAY/PASSED/BLOCKED & SCARCITY -->
              <div style="display: grid; grid-template-columns: 260px 1fr 280px; gap: 8px; min-height: 280px;">
                
                <!-- 3A. LEFT: IN-PLAY, PASSED & BLOCKED FRANCHISES -->
                <div class="surface-card" style="padding: 12px; display: flex; flex-direction: column; gap: 8px; font-size: 0.75rem; overflow-y: auto; max-height: 310px; background: #ffffff; border: 1px solid var(--border-soft); border-radius: 8px;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <span class="label-micro" style="color: #047857; font-weight: 800;">IN-PLAY FRANCHISES</span>
                      <span class="font-mono" style="font-size: 0.7rem; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 4px; font-weight: 800;">${franchises.filter(f => !passedFranchiseIds.includes(f.id) && calculateMaxBid(f.id, cur.bucket) >= (currentBid + getBidIncrement(currentBid))).length}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      ${franchises.map(f => {
                        const nextB = currentBid + getBidIncrement(currentBid);
                        const maxB = calculateMaxBid(f.id, cur.bucket);
                        const isPassed = passedFranchiseIds.includes(f.id);
                        const isLeader = f.id === leadingBidderId;
                        let blockedReason = null;
                        if ((f.squad || []).length >= 22) blockedReason = 'already at 22';
                        else if (f.purse < nextB) blockedReason = 'no purse';
                        else if (!checkSlotProtection(f.id, cur.bucket).eligible) blockedReason = 'mandatory slot locked';
                        else if (nextB > maxB) blockedReason = 'maxBid exceeded';

                        if (blockedReason || isPassed) return '';
                        return `
                          <div style="display: flex; justify-content: space-between; align-items: center; background: ${isLeader ? '#fffbeb' : '#f8fafc'}; padding: 5px 8px; border-radius: 6px; border: 1px solid ${isLeader ? '#fde68a' : '#e2e8f0'}; border-left: 3px solid ${isLeader ? '#f59e0b' : '#10b981'}; transition: all 0.15s ease;">
                            <span style="font-weight: 700; color: ${isLeader ? '#b45309' : '#0f172a'};">${f.name}</span>
                            <span class="font-mono" style="color: ${isLeader ? '#b45309' : '#475569'}; font-weight: 700; font-variant-numeric: tabular-nums;">${maxB}C ${isLeader ? '(LEADER)' : ''}</span>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; margin-top: 6px;">
                      <span class="label-micro" style="color: #64748b; font-weight: 800;">PASSED (REVERSIBLE)</span>
                      <span class="font-mono" style="font-size: 0.7rem; color: #64748b; background: #f1f5f9; padding: 1px 6px; border-radius: 4px;">${passedFranchiseIds.length}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 3px;">
                      ${passedFranchiseIds.length === 0 ? '<div style="color: #64748b; font-size: 0.7rem; padding: 2px 4px;">None passed yet</div>' : ''}
                      ${passedFranchiseIds.map(fId => {
                        const f = franchises.find(item => item.id === fId);
                        if (!f) return '';
                        return `
                          <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 4px 6px; border-radius: 4px; border-left: 2px solid #94a3b8; border: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-weight: 600;">${f.name}</span>
                            <button class="btn btn-secondary" style="font-size: 0.62rem; padding: 2px 6px; border-radius: 4px; color: #0284c7; border-color: #bae6fd; font-weight: 700;" onclick="passedFranchiseIds = passedFranchiseIds.filter(id => id !== ${f.id}); renderCurrentView();">RE-ENTER</button>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; margin-top: 6px;">
                      <span class="label-micro" style="color: #dc2626; font-weight: 800;">BLOCKED FRANCHISES</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 3px;">
                      ${franchises.map(f => {
                        const nextB = currentBid + getBidIncrement(currentBid);
                        const maxB = calculateMaxBid(f.id, cur.bucket);
                        let blockedReason = null;
                        if ((f.squad || []).length >= 22) blockedReason = 'already at 22';
                        else if (f.purse < nextB) blockedReason = 'no purse';
                        else if (!checkSlotProtection(f.id, cur.bucket).eligible) blockedReason = 'mandatory slot locked';
                        else if (nextB > maxB) blockedReason = 'maxBid exceeded';

                        if (!blockedReason) return '';
                        return `
                          <div style="display: flex; justify-content: space-between; align-items: center; background: #fff1f2; padding: 4px 8px; border-radius: 4px; border-left: 3px solid #f43f5e; border: 1px solid #fecdd3; font-size: 0.7rem;">
                            <span style="color: #991b1b; font-weight: 700;">${f.name}</span>
                            <span style="color: #be123c; font-size: 0.65rem; font-weight: 700; text-transform: uppercase;">${blockedReason}</span>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                </div>

                <!-- 3B. CENTER: CURRENT BID, LEADER, TIMER RING, PRIMARY ACTIONS -->
                <div class="surface-elevated" style="padding: 14px; display: flex; flex-direction: column; justify-content: space-between; text-align: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
                  <div>
                    <span class="label-micro" style="color: #b45309; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; font-size: 0.7rem;">CURRENT AUCTION BID</span>
                    <div class="price-display font-mono" style="font-size: 3.5rem; font-weight: 900; color: #0f172a; line-height: 1; margin: 6px 0; font-variant-numeric: tabular-nums; letter-spacing: -1px;">
                      ${currentBid} <span style="font-size: 1.2rem; color: #64748b; font-weight: 800;">CREDITS</span>
                    </div>
                    <div style="font-size: 0.875rem; color: #334155; margin-bottom: 8px; background: #f8fafc; border: 1px solid #e2e8f0; display: inline-block; padding: 4px 14px; border-radius: 20px;">
                      Leading Bidder: <strong style="color: #047857; font-size: 1.05rem; font-weight: 800;">${leader ? leader.name : 'NO ACTIVE BID'}</strong>
                      ${window.currentBidIsBehalf ? ' <span class="status-badge" style="background: #fffbeb; color: #b45309; border: 1px solid #fde68a; font-size: 0.6rem; font-weight: 800; padding: 1px 6px; border-radius: 4px;">BEHALF BID</span>' : ''}
                    </div>

                    <!-- Circular Countdown Timer Ring -->
                    <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin: 8px 0;">
                      <div style="position: relative; width: 58px; height: 58px; display: flex; align-items: center; justify-content: center;">
                        <svg width="58" height="58" viewBox="0 0 58 58">
                          <circle cx="29" cy="29" r="25" stroke="#e2e8f0" stroke-width="4.5" fill="none" />
                          <circle cx="29" cy="29" r="25" stroke="${timerSeconds <= 5 ? '#ef4444' : timerSeconds <= 10 ? '#f59e0b' : '#10b981'}" stroke-width="4.5" fill="none" stroke-dasharray="157" stroke-dashoffset="${157 - (157 * timerSeconds / 30)}" stroke-linecap="round" style="transition: stroke-dashoffset 0.5s ease;" />
                        </svg>
                        <span class="font-mono" style="position: absolute; font-size: 1.15rem; font-weight: 900; color: ${timerSeconds <= 5 ? '#dc2626' : timerSeconds <= 10 ? '#b45309' : '#047857'}; font-variant-numeric: tabular-nums;">
                          ${timerSeconds}s
                        </span>
                      </div>
                      <div style="text-align: left; font-size: 0.75rem; color: #64748b;">
                        <div>${auctionPaused ? '<span style="color: #b45309; font-weight: 800;">CLOCK FROZEN</span>' : timerSeconds === 0 ? '<span style="color: #dc2626; font-weight: 800;">BIDDING CLOSED</span>' : '<span style="color: #047857; font-weight: 800;">TIMER ACTIVE</span>'}</div>
                        <div style="font-size: 0.65rem; color: #94a3b8;">(Resets to 20s on any bid)</div>
                      </div>
                    </div>
                  </div>

                  <!-- ACTION ROW: Keyboard Accessible Primary Controls (44px min-height touch targets) -->
                  <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 6px;">
                      <button class="btn btn-primary" style="min-height: 44px; padding: 10px 14px; font-weight: 900; font-size: 0.95rem; border-radius: 6px; cursor: pointer; background: #059669; color: #ffffff; border: 1px solid #047857; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25); transition: all 0.15s ease;" onclick="openHammerConfirmModal()">
                        [H] HAMMER (SOLD)
                      </button>
                      <button class="btn btn-secondary" style="min-height: 44px; padding: 10px 12px; font-size: 0.8125rem; font-weight: 700; border-radius: 6px; cursor: pointer; background: #f8fafc; color: #1e293b; border: 1px solid #cbd5e1; transition: all 0.15s ease;" onclick="skipPlayer()">
                        [S] SKIP
                      </button>
                      <button class="btn btn-secondary" style="min-height: 44px; padding: 10px 12px; font-size: 0.8125rem; font-weight: 700; border-radius: 6px; cursor: pointer; background: #fffbeb; color: #b45309; border: 1px solid #fde68a; transition: all 0.15s ease;" onclick="toggleAuctionPause()">
                        [P] ${auctionPaused ? 'RESUME' : 'PAUSE'}
                      </button>
                    </div>

                    <div style="display: grid; grid-template-columns: ${isSuperAdmin ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)'}; gap: 6px;">
                      <button class="btn btn-secondary" style="min-height: 36px; font-size: 0.72rem; font-weight: 700; padding: 6px 4px; border-radius: 6px; cursor: pointer; background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; transition: all 0.15s ease;" onclick="openUndoModal()" title="Revert Any Sold Lot">
                        [U] UNDO
                      </button>
                      <button class="btn btn-secondary" style="min-height: 36px; font-size: 0.72rem; font-weight: 700; padding: 6px 4px; border-radius: 6px; cursor: pointer; background: #fffbeb; color: #b45309; border: 1px solid #fde68a; transition: all 0.15s ease;" onclick="openBehalfBidModal()" title="Bid for Failed Device">
                        [B] BEHALF
                      </button>
                      <button class="btn btn-secondary" style="min-height: 36px; font-size: 0.72rem; font-weight: 700; padding: 6px 4px; border-radius: 6px; cursor: pointer; background: #f0f9ff; color: #0284c7; border: 1px solid #bae6fd; transition: all 0.15s ease;" onclick="openDirectAssignModal()" title="Direct Assign Player">
                        [A] ASSIGN
                      </button>
                      ${isSuperAdmin ? `
                      <button class="btn btn-secondary" style="min-height: 36px; font-size: 0.72rem; font-weight: 700; padding: 6px 4px; border-radius: 6px; cursor: pointer; background: #faf5ff; color: #7e22ce; border: 1px solid #e9d5ff; transition: all 0.15s ease;" onclick="openRelaxationModal()" title="Relax Minimum Quota">
                        [R] RELAX
                      </button>
                      ` : ''}
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; color: #64748b; padding-top: 2px;">
                      <span>Space: Draw Next • Enter: Confirm • Esc: Cancel</span>
                      <a href="javascript:void(0)" onclick="openShortcutsHelpModal()" style="color: #047857; text-decoration: underline; font-weight: 700;">[?] Shortcuts</a>
                    </div>
                  </div>
                </div>

                <!-- 3C. RIGHT: BID ORDER CHRONOLOGY & BUCKET SCARCITY -->
                <div class="surface-card" style="padding: 12px; display: flex; flex-direction: column; gap: 8px; font-size: 0.75rem; overflow-y: auto; max-height: 310px; background: #ffffff; border: 1px solid var(--border-soft); border-radius: 8px;">
                  <div>
                    <span class="label-micro" style="color: #0284c7; font-weight: 800;">CHRONOLOGICAL BID ORDER</span>
                    <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px;">
                      ${bidOrder.length === 0 ? '<div style="color: #64748b; font-size: 0.7rem; padding: 4px 6px;">No bids placed for this lot yet</div>' : ''}
                      ${bidOrder.slice(-6).reverse().map((b, idx) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: ${idx === 0 ? '#fffbeb' : '#f8fafc'}; padding: 4px 8px; border-radius: 4px; border: 1px solid ${idx === 0 ? '#fde68a' : '#e2e8f0'}; border-left: 3px solid ${idx === 0 ? '#f59e0b' : '#cbd5e1'};">
                          <span style="font-weight: 700; color: ${idx === 0 ? '#b45309' : '#0f172a'};">${b.franchiseName}</span>
                          <span class="font-mono" style="color: ${idx === 0 ? '#b45309' : '#047857'}; font-weight: 800; font-variant-numeric: tabular-nums;">${b.amount}C</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <span class="label-micro" style="color: #047857; font-weight: 800;">BUCKET SCARCITY (PLAYERS NEEDED)</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      ${['B1', 'B2', 'B3', 'B4', 'D5'].map(b => {
                        const unsold = players.filter(p => p.bucket === b && p.status === 'AVAILABLE').length;
                        const bMin = (window.bucketMinimums && window.bucketMinimums[b] !== undefined) ? window.bucketMinimums[b] : 2;
                        let playersNeededTotal = 0;
                        franchises.forEach(f => {
                          const boughtInB = (f.squad || []).filter(p => !p.isCaptain && !p.isViceCaptain && !p.isReferred && p.bucket === b).length;
                          playersNeededTotal += Math.max(0, bMin - boughtInB);
                        });
                        const isExhausted = unsold === 0 && playersNeededTotal > 0;
                        const isWarning = !isExhausted && playersNeededTotal > 0 && unsold <= playersNeededTotal;

                        return `
                          <div style="display: flex; justify-content: space-between; align-items: center; background: ${isExhausted ? '#fff1f2' : isWarning ? '#fffbeb' : '#f0fdf4'}; padding: 4px 8px; border-radius: 4px; border: 1px solid ${isExhausted ? '#fecdd3' : isWarning ? '#fde68a' : '#bbf7d0'}; border-left: 3px solid ${isExhausted ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981'}; font-size: 0.7rem;">
                            <span><strong style="color: #0f172a;">${b}</strong> (${unsold} unsold, ${playersNeededTotal} needed)</span>
                            <span class="badge ${isExhausted ? 'badge-fail' : isWarning ? 'badge-partial' : 'badge-pass'}" style="font-size: 0.62rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
                              ${isExhausted ? 'EXHAUSTED' : isWarning ? 'WARNING' : 'SAFE'}
                            </span>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                </div>

              </div>

              <!-- REGION 4: 11-FRANCHISE TABLE (Always Visible) -->
              <div class="surface-card" style="padding: 0; overflow-x: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.75rem;">
                  <thead>
                    <tr style="position: sticky; top: 0; background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; z-index: 2;">
                      <th style="padding: 7px 10px;">Franchise</th>
                      <th style="padding: 7px 10px;">Purse Rem.</th>
                      <th style="padding: 7px 10px;">Max Bid (§12.1)</th>
                      <th style="padding: 7px 10px;">Purchases</th>
                      <th style="padding: 7px 10px;">Bucket Quotas</th>
                      <th style="padding: 7px 10px;">Slots Rem.</th>
                      <th style="padding: 7px 10px;">Live State</th>
                      <th style="padding: 7px 10px; text-align: right;">Behalf Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${franchises.map(f => {
                      const nextB = currentBid + getBidIncrement(currentBid);
                      const maxB = calculateMaxBid(f.id, cur.bucket);
                      const isPassed = passedFranchiseIds.includes(f.id);
                      const isLeader = f.id === leadingBidderId;
                      const ap = (f.squad || []).filter(p => !p.isCaptain && !p.isViceCaptain && !p.isReferred);
                      const bMins = window.bucketMinimums || { B1: 2, B2: 2, B3: 2, B4: 2, D5: 2 };
                      
                      let unmetMandatory = 0;
                      const bStatus = ['B1', 'B2', 'B3', 'B4', 'D5'].map(b => {
                        const count = ap.filter(p => p.bucket === b).length;
                        const req = bMins[b] !== undefined ? bMins[b] : 2;
                        const satisfied = count >= req;
                        if (!satisfied) unmetMandatory += (req - count);
                        return `<span style="display: inline-block; padding: 1px 4px; border-radius: 3px; font-weight: 700; margin-right: 3px; background: ${satisfied ? '#ecfdf5' : '#fffbeb'}; color: ${satisfied ? '#047857' : '#b45309'}; border: 1px solid ${satisfied ? '#a7f3d0' : '#fde68a'};">${b}${satisfied ? ' (OK)' : ' (REQ)'}</span>`;
                      }).join('');

                      const slotsRemaining = Math.max(15 - ap.length, unmetMandatory);

                      let blockedReason = null;
                      if ((f.squad || []).length >= 22) blockedReason = 'already at 22';
                      else if (f.purse < nextB) blockedReason = 'no purse';
                      else if (!checkSlotProtection(f.id, cur.bucket).eligible) blockedReason = 'mandatory slot locked';
                      else if (nextB > maxB) blockedReason = 'maxBid exceeded';

                      const statusBadge = isLeader 
                        ? '<span class="status-badge" style="background: #fffbeb; color: #b45309; border: 1px solid #fde68a; font-size: 0.65rem; font-weight: 800; padding: 1px 6px; border-radius: 4px;">HOLDING LEAD</span>'
                        : isPassed 
                        ? '<span class="status-badge" style="background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; font-size: 0.65rem; font-weight: 700; padding: 1px 6px; border-radius: 4px;">PASSED</span>'
                        : blockedReason 
                        ? `<span class="status-badge" style="background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; font-size: 0.65rem; font-weight: 800; padding: 1px 6px; border-radius: 4px;">BLOCKED (${blockedReason})</span>`
                        : '<span class="status-badge" style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 0.65rem; font-weight: 800; padding: 1px 6px; border-radius: 4px;">IN-PLAY</span>';

                      return `
                        <tr style="border-bottom: 1px solid #f1f5f9; background: ${isLeader ? '#fffbeb' : '#ffffff'}; transition: background 0.15s ease;">
                          <td style="padding: 7px 10px; font-weight: 700; color: #0f172a;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                              ${getTeamEmblem(f.id, 22)}
                              <span style="letter-spacing: -0.01em;">${f.name}</span>
                            </div>
                          </td>
                          <td style="padding: 7px 10px; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: 800; color: #047857;">${f.purse}C</td>
                          <td style="padding: 7px 10px; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: 800; color: ${blockedReason ? '#dc2626' : '#047857'};">${maxB}C</td>
                          <td style="padding: 7px 10px; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: 700; color: #334155;">${ap.length} / 15</td>
                          <td style="padding: 7px 10px; font-size: 0.68rem;">${bStatus}</td>
                          <td style="padding: 7px 10px; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: 700; color: #0284c7;">${slotsRemaining}</td>
                          <td style="padding: 7px 10px;">${statusBadge}</td>
                          <td style="padding: 7px 10px; text-align: right;">
                            <button class="btn btn-secondary" style="font-size: 0.68rem; font-weight: 800; padding: 4px 10px; border-radius: 4px; min-height: 28px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; cursor: pointer;" onclick="placeBid(${f.id})" ${blockedReason ? 'disabled style="opacity: 0.35; cursor: not-allowed; padding: 4px 10px; font-size: 0.68rem;"' : ''}>
                              BID
                            </button>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>

              <!-- REGION 5: AUDIT STREAM (Last 20 Events, Live Append) -->
              <div class="surface-card" style="padding: 8px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span class="status-indicator status-live" style="width: 5px; height: 5px;"></span>
                    <span class="label-micro" style="color: #64748b; font-weight: 800; font-family: var(--font-mono); letter-spacing: 0.5px;">IMMUTABLE AUDIT STREAM (§12.4)</span>
                  </div>
                  <span style="font-size: 0.65rem; color: #94a3b8; font-family: var(--font-mono); font-weight: 700;">SURVIVES BULK PURGES</span>
                </div>
                <div class="font-mono" style="font-size: 0.7rem; color: #475569; max-height: 80px; overflow-y: auto; display: flex; flex-direction: column-reverse; gap: 2px;">
                  ${auditLedger.slice(-15).map(e => `
                    <div><span style="color: #94a3b8;">[${new Date(e.timestamp).toLocaleTimeString()}]</span> <strong style="color: ${e.type === 'HAMMER' || e.type === 'SOLD' ? '#047857' : e.type === 'UNDO' ? '#dc2626' : '#b45309'};">${e.type}</strong>: <span style="color: #0f172a; font-weight: 700;">${e.playerName || ''}</span> <span style="color: #0284c7;">${e.franchiseName ? '→ ' + e.franchiseName : ''}</span> <span style="color: #047857; font-weight: 800;">${e.price ? '@ ' + e.price + 'C' : ''}</span> <span style="color: #64748b;">${e.reason ? '(' + e.reason + ')' : ''}</span></div>
                  `).join('')}
                </div>
              </div>

            </div>"""

    html = old_live_block_pattern.sub(new_live_block, html)

    # 2. FIX INACTIVE ADMIN SUB-NAV TAB BUTTONS STYLE (Line 10579)
    old_tab_style = "background: #0f172a; color: #94a3b8; border: 1px solid #1e293b;"
    new_tab_style = "background: #ffffff; color: #475569; border: 1px solid #e2e8f0;"
    html = html.replace(old_tab_style, new_tab_style)

    # 3. FIX ALL EMOJIS ACROSS Acc-Auction-Os.html
    # Status messages
    html = html.replace('"⏳ CHECKING ROLL NUMBER..."', '"CHECKING ROLL NUMBER..."')
    html = html.replace('`⚠️ ROLL NUMBER ALREADY REGISTERED', '`ROLL NUMBER ALREADY REGISTERED')
    html = html.replace('`✓ ROLL NUMBER AVAILABLE', '`ROLL NUMBER AVAILABLE')
    html = html.replace('"⏳ CHECKING MOBILE..."', '"CHECKING MOBILE..."')
    html = html.replace('`⚠️ MOBILE NUMBER ALREADY REGISTERED', '`MOBILE NUMBER ALREADY REGISTERED')
    html = html.replace('`✓ MOBILE NUMBER AVAILABLE`', '`MOBILE NUMBER AVAILABLE`')

    # Modal close buttons
    html = html.replace('>✕</button>', f'>{close_svg}</button>')

    # Image aspect ratio messages
    html = html.replace('⚠ Selected file is not an image.', 'Selected file is not an image.')
    html = html.replace('⚠ <strong>Invalid Aspect Ratio:</strong>', '<strong>Invalid Aspect Ratio:</strong>')
    html = html.replace('<div>✓ <strong>Aspect Ratio Verified (4:3)</strong></div>', '<div><strong>Aspect Ratio Verified (4:3)</strong></div>')
    html = html.replace('⚠ Failed to decode image file.', 'Failed to decode image file.')
    html = html.replace('⚠ Failed to decode image.', 'Failed to decode image.')

    # Blocked reasons
    html = html.replace("'🔴 BLOCKED: Mandatory Slot Protection'", "'BLOCKED: Mandatory Slot Protection'")
    html = html.replace("'🔴 BLOCKED: Max Bid Exceeded'", "'BLOCKED: Max Bid Exceeded'")

    # Buttons & labels
    html = html.replace('📷 UPDATE LOGO (4:3)', 'UPDATE LOGO (4:3)')
    html = html.replace('📷 REPLACE PHOTO', 'REPLACE PHOTO')
    html = html.replace('🟢 Live Synchronized', '<span class="status-indicator status-live" style="width: 8px; height: 8px; display: inline-block; margin-right: 6px;"></span>Live Synchronized')

    # Password show/hide function
    old_pw_func = """    function togglePasswordVisibility(inputId, btn) {
      const input = document.getElementById(inputId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        if (btn) btn.innerHTML = '🔒';
      } else {
        input.type = 'password';
        if (btn) btn.innerHTML = '👁️';
      }
    }"""
    new_pw_func = f"""    function togglePasswordVisibility(inputId, btn) {{
      const input = document.getElementById(inputId);
      if (!input) return;
      if (input.type === 'password') {{
        input.type = 'text';
        if (btn) btn.innerHTML = '{eye_off_svg}';
      }} else {{
        input.type = 'password';
        if (btn) btn.innerHTML = '{eye_svg}';
      }}
    }}"""
    html = html.replace(old_pw_func, new_pw_func)

    # Login UI
    html = html.replace('🛡️ AUTHENTICATION GATEWAY', 'AUTHENTICATION GATEWAY')
    html = html.replace('<span style="font-size: 1.1rem;">🏏</span>', user_svg)
    html = html.replace('<span style="font-size: 1.1rem;">🛡️</span>', shield_svg)
    html = html.replace('<span style="font-size: 1.1rem;">👑</span>', crown_svg)
    html = html.replace('<span style="font-size: 1.1rem;">⚡</span>', zap_svg)

    html = html.replace('<span style="font-size: 1rem;">🏏</span>', user_svg)
    html = html.replace('<span style="font-size: 1rem;">🛡️</span>', shield_svg)
    html = html.replace('<span style="font-size: 1rem;">⚡</span>', zap_svg)
    html = html.replace('<span style="font-size: 1rem;">👑</span>', crown_svg)

    html = html.replace('⚡ 26811A0501 (B1)', '26811A0501 (B1)')
    html = html.replace('⚡ 25815A0403 (B3)', '25815A0403 (B3)')
    html = html.replace('⚡ Titans PIN (Titans@2026)', 'Titans PIN (Titans@2026)')
    html = html.replace('⚡ handler / Handler@2026', 'handler / Handler@2026')
    html = html.replace('⚡ admin / ACC@Admin#2026!', 'admin / ACC@Admin#2026!')
    html = html.replace('⚡ superadmin / Admin@2026', 'superadmin / Admin@2026')

    html = html.replace('title="Show/Hide PIN">👁️</button>', f'title="Show/Hide PIN">{eye_svg}</button>')
    html = html.replace('title="Show/Hide Password">👁️</button>', f'title="Show/Hide Password">{eye_svg}</button>')

    html = html.replace('<span>👁️</span> Public Spectator Live Stream', f'{eye_svg} Public Spectator Live Stream')

    html = html.replace('<span style="font-size: 1.25rem;">🏏</span>', user_svg)
    html = html.replace('<span style="font-size: 1.25rem;">🛡️</span>', shield_svg)

    html = html.replace('<span>✓ 4:3 Photo loaded</span>', '<span>4:3 Photo loaded</span>')

    # Management and Actions
    html = html.replace('🔍 INTEGRITY SCAN', 'INTEGRITY SCAN')
    html = html.replace('⚠️ DELETE ALL PLAYERS', 'DELETE ALL PLAYERS')
    html = html.replace('⚠️ DELETE ALL FRANCHISES', 'DELETE ALL FRANCHISES')
    html = html.replace('🔄 RESET ALL DATA', 'RESET ALL DATA')

    # Approval buttons
    html = html.replace('✓ VERIFY', 'VERIFY')
    html = html.replace('✎ CORRECTION', 'CORRECTION')
    html = html.replace('✕ REJECT', 'REJECT')

    # Advance Academic year & cascading
    html = html.replace('⚡ RESET BASE PRICES TO 20C & INITIALIZE ROUND 2', 'RESET BASE PRICES TO 20C & INITIALIZE ROUND 2')
    html = html.replace('⚡ RUN AUTO-ALLOTMENT CASCADE', 'RUN AUTO-ALLOTMENT CASCADE')
    html = html.replace('📅 ADVANCE ACADEMIC YEAR (JULY 1 ROLLOVER)', 'ADVANCE ACADEMIC YEAR (JULY 1 ROLLOVER)')

    # Check remaining emojis
    emoji_pattern = re.compile(r'[\U00010000-\U0010ffff]|[\u2600-\u27bf]|[\u2300-\u23ff]|[\u2b50-\u2b55]')
    remaining = emoji_pattern.findall(html)
    if remaining:
        print(f"Remaining emojis in html ({len(remaining)}):", set(remaining))
        for m in list(set(remaining)):
            for line in html.splitlines():
                if m in line:
                    print("  Sample line:", repr(line[:100]))
                    break
    else:
        print("SUCCESS: Zero emojis found in processed html!")

    # Write out to Acc-Auction-Os.html and copy to index.html
    with open('Acc-Auction-Os.html', 'w', encoding='utf-8') as f:
        f.write(html)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)

    print("Successfully updated Acc-Auction-Os.html and index.html!")
    return True

if __name__ == '__main__':
    process_acc_html()

# append_auction_actions.py
with open(r'B:\projects\ACC\generate_acc_2026.py', 'a', encoding='utf-8') as f:
    f.write(r'''
    // ========================================================
    // 3. BIDDING, PASSING & AUCTION CONTROLS
    // ========================================================
    function placeBid(fid) {
      if (auctionState === "PAUSED") {
        showToast("Auction is currently paused", "error");
        return false;
      }
      const f = franchises.find(x => x.id === fid);
      if (!f) return false;

      const inc = getBidIncrement(currentPrice);
      const nextPrice = currentPrice + inc;
      const maxLegal = calculateMaxBid(f);

      if (nextPrice > maxLegal) {
        showToast(`BID BLOCKED for ${f.name}: Maximum permissible is ${maxLegal}C. Must preserve credits for squad requirements.`, "error");
        const bidBtn = document.getElementById("franchiseBidBtn");
        if (bidBtn) {
          bidBtn.classList.add("shake-error");
          setTimeout(() => bidBtn.classList.remove("shake-error"), 500);
        }
        return false;
      }

      currentPrice = nextPrice;
      leadingBidderId = fid;
      passedFranchises.delete(fid);
      timerSeconds = 20; // Reset timer to full 20s upon accepted bid

      const timeStr = new Date().toLocaleTimeString('en-GB');
      bidHistory.unshift({ price: currentPrice, bidder: f.name, t: timeStr });
      if (bidHistory.length > 8) bidHistory.pop();

      auditLog.unshift({
        id: auditLog.length + 1,
        time: timeStr,
        who: f.name,
        role: "Franchise",
        type: "BID",
        msg: `${f.name} placed authoritative bid of ${currentPrice}C for LOT #${players[lotIndex].id} (${players[lotIndex].name})`
      });

      showToast(`BID ACCEPTED: ${f.name} at ${currentPrice}C`, "success");
      broadcastAuctionState();
      renderCurrentView();
      return true;
    }

    function passLot(fid) {
      const f = franchises.find(x => x.id === fid);
      if (!f) return;
      passedFranchises.add(fid);
      showToast(`${f.name} has PASSED (Reversible before hammer)`, "info");
      broadcastAuctionState();
      renderCurrentView();
    }

    function reEnterLot(fid) {
      const f = franchises.find(x => x.id === fid);
      if (!f) return;
      passedFranchises.delete(fid);
      showToast(`${f.name} RE-ENTERED the auction!`, "success");
      broadcastAuctionState();
      renderCurrentView();
    }

    function openHammerConfirmModal() {
      const cur = players[lotIndex];
      const leader = franchises.find(f => f.id === leadingBidderId);
      if (!leader) {
        showToast("No active bids on this lot to hammer", "error");
        return;
      }

      const modal = document.getElementById("modalContainer");
      modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation()">
            <div style="padding: 24px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span class="eyebrow" style="color: var(--auction);">FINAL VERIFICATION</span>
                <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright); margin-top: 2px;">CONFIRM HAMMER SALE</div>
              </div>
              <button class="btn btn-secondary" style="padding: 4px 8px;" onclick="closeModal()">✕</button>
            </div>
            <div style="padding: 24px;">
              <div style="background: var(--bg-card); border: 1px solid var(--border-medium); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <div style="font-size: 13px; color: var(--text-dim);">PLAYER</div>
                <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright);">${cur.name} (${cur.bucket} • ${cur.type})</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
                  <div>
                    <span class="eyebrow">FINAL WINNING BID</span>
                    <div style="font-family: var(--font-mono); font-size: 24px; font-weight: 800; color: var(--auction);">${currentPrice} CREDITS</div>
                  </div>
                  <div>
                    <span class="eyebrow">WINNING FRANCHISE</span>
                    <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--primary);">${leader.name}</div>
                  </div>
                </div>
              </div>
              <div style="font-size: 13px; color: var(--text-dim); line-height: 1.5; margin-bottom: 24px;">
                This action is authoritative. Purse deductions, squad limits, bucket requirements, and tournament scarcity will update across all connected interfaces.
              </div>
              <div style="display: flex; justify-content: flex-end; gap: 12px;">
                <button class="btn btn-secondary" onclick="closeModal()">CANCEL</button>
                <button class="btn btn-auction" onclick="executeHammerSale()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"></path><path d="M17.64 15 22 10.64"></path><path d="m20.91 3.26-6.55 6.55"></path><path d="m14.5 9.5 2 2"></path></svg>
                  CONFIRM HAMMER
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function executeHammerSale() {
      closeModal();
      const cur = players[lotIndex];
      const leader = franchises.find(f => f.id === leadingBidderId);
      if (!leader) return;

      // Update team finances & squad
      leader.purse -= currentPrice;
      leader.bought = (leader.bought || 0) + 1;
      if (!leader.buckets) leader.buckets = {};
      leader.buckets[cur.bucket] = (leader.buckets[cur.bucket] || 0) + 1;

      // Mark player sold
      cur.status = "SOLD";
      cur.soldTo = leader.id;
      cur.soldPrice = currentPrice;

      // Record in historical sales
      const saleId = "SALE-" + String(salesHistory.length + 843).padStart(4, "0");
      salesHistory.unshift({
        id: saleId,
        lotId: cur.id,
        playerName: cur.name,
        playerRole: cur.type,
        bucket: cur.bucket,
        franchiseId: leader.id,
        franchiseName: leader.name,
        price: currentPrice,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        status: "COMMITTED"
      });

      // Audit Log
      auditLog.unshift({
        id: auditLog.length + 1,
        time: new Date().toLocaleTimeString('en-GB'),
        who: currentUser.name || "SUPER ADMIN",
        role: currentUser.role,
        type: "HAMMER",
        msg: `Hammered LOT #${cur.id} ${cur.name} to ${leader.name} for ${currentPrice}C`
      });

      showToast(`HAMMER CONFIRMED: ${cur.name} sold to ${leader.name} for ${currentPrice}C`, "success");
      broadcastAuctionState();

      // Advance to next lot
      setTimeout(() => {
        drawNextPlayer();
      }, 1200);
    }

    function openUndoModal(saleId) {
      if (currentUser.role !== 'SUPER_ADMIN') {
        showToast("ACCESS RESTRICTED: Forensic undo requires Super Admin privileges", "error");
        return;
      }
      const sale = salesHistory.find(s => s.id === saleId);
      if (!sale) return;
      if (sale.status === 'UNDONE') {
        showToast("Sale has already been undone", "error");
        return;
      }

      const modal = document.getElementById("modalContainer");
      modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation()">
            <div style="padding: 24px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span class="eyebrow" style="color: var(--danger);">FORENSIC REVERSAL</span>
                <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright); margin-top: 2px;">REVERSE SALE #${sale.id}</div>
              </div>
              <button class="btn btn-secondary" style="padding: 4px 8px;" onclick="closeModal()">✕</button>
            </div>
            <div style="padding: 24px;">
              <div style="background: var(--bg-card); border: 1px solid var(--border-medium); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                  <div>
                    <span class="eyebrow">PLAYER</span>
                    <div style="font-weight: 800; color: var(--text-bright);">${sale.playerName} (${sale.bucket})</div>
                  </div>
                  <div>
                    <span class="eyebrow">PURCHASING TEAM</span>
                    <div style="font-weight: 800; color: var(--primary);">${sale.franchiseName}</div>
                  </div>
                  <div>
                    <span class="eyebrow">REFUND AMOUNT</span>
                    <div style="font-family: var(--font-mono); font-size: 20px; font-weight: 800; color: var(--auction);">${sale.price} CREDITS</div>
                  </div>
                  <div>
                    <span class="eyebrow">ORIGINAL TIME</span>
                    <div style="font-family: var(--font-mono); color: var(--text-dim);">${sale.timestamp}</div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">MANDATORY REASON FOR FORENSIC REVERSAL</label>
                <input type="text" id="undoReasonInput" class="form-input" placeholder="e.g. Incorrect paddle acknowledged by floor operator" value="Operator paddle misinterpretation">
              </div>

              <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 20px;">
                Executing undo will: (1) Refund ${sale.price}C to ${sale.franchiseName}, (2) Decrement squad count, (3) Restore bucket requirement, (4) Return player to pool as UNSOLD, (5) Recalculate max permissible bids for all 11 teams, and (6) Log forensic reason.
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 12px;">
                <button class="btn btn-secondary" onclick="closeModal()">CANCEL</button>
                <button class="btn btn-danger" onclick="executeUndoSale('${sale.id}')">
                  CONFIRM FORENSIC UNDO
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function executeUndoSale(saleId) {
      const reasonInput = document.getElementById("undoReasonInput");
      const reason = (reasonInput && reasonInput.value.trim()) || "Super Admin manual correction";
      closeModal();

      const sale = salesHistory.find(s => s.id === saleId);
      if (!sale || sale.status === 'UNDONE') {
        showToast("Unable to undo: sale invalid or already undone", "error");
        return;
      }

      const f = franchises.find(x => x.id === sale.franchiseId);
      if (f) {
        f.purse += sale.price;
        f.bought = Math.max(0, (f.bought || 1) - 1);
        if (f.buckets && f.buckets[sale.bucket]) {
          f.buckets[sale.bucket] = Math.max(0, f.buckets[sale.bucket] - 1);
        }
      }

      const player = players.find(p => p.id === sale.lotId || p.name === sale.playerName);
      if (player) {
        player.status = "UNSOLD";
        delete player.soldTo;
        delete player.soldPrice;
      }

      sale.status = "UNDONE";
      sale.undoReason = reason;
      sale.undoTime = new Date().toLocaleTimeString('en-GB');

      auditLog.unshift({
        id: auditLog.length + 1,
        time: new Date().toLocaleTimeString('en-GB'),
        who: currentUser.name || "SUPER ADMIN",
        role: "SUPER ADMIN",
        type: "UNDO",
        msg: `REVERSED Sale #${sale.id} (${sale.playerName}): ${sale.price}C refunded to ${sale.franchiseName}. Reason: ${reason}`
      });

      showToast(`Sale #${sale.id} undone! ${sale.price}C refunded to ${sale.franchiseName}`, "success");
      broadcastAuctionState();
      renderCurrentView();
    }

    function closeModal() {
      const modal = document.getElementById("modalContainer");
      if (modal) modal.innerHTML = "";
    }

    function skipPlayer() {
      const cur = players[lotIndex];
      cur.status = "SKIPPED";
      bucketRecallQueue.push(cur);

      auditLog.unshift({
        id: auditLog.length + 1,
        time: new Date().toLocaleTimeString('en-GB'),
        who: currentUser.name || "AUCTION OPERATOR",
        role: currentUser.role,
        type: "SKIP",
        msg: `Skipped LOT #${cur.id} ${cur.name}. Queued for end-of-bucket recall.`
      });

      showToast(`LOT #${cur.id} ${cur.name} SKIPPED (Queued for bucket recall)`, "info");
      broadcastAuctionState();
      drawNextPlayer();
    }

    function drawNextPlayer() {
      // Find next unsold player in current bucket sequence or recall queue
      let nextIdx = -1;
      const curBucket = BUCKET_SEQUENCE[activeBucketIndex];

      // If recall queue has items for this bucket and all regular are done:
      const remainingInBucket = players.findIndex((p, idx) => idx > lotIndex && p.bucket === curBucket && p.status === "UNSOLD");
      if (remainingInBucket !== -1) {
        nextIdx = remainingInBucket;
      } else {
        // Look from beginning or advance bucket
        const anyInBucket = players.findIndex(p => p.bucket === curBucket && p.status === "UNSOLD");
        if (anyInBucket !== -1) {
          nextIdx = anyInBucket;
        } else {
          // Advance to next bucket in sequence
          if (activeBucketIndex < BUCKET_SEQUENCE.length - 1) {
            activeBucketIndex++;
            const nextBucket = BUCKET_SEQUENCE[activeBucketIndex];
            showToast(`Bucket ${curBucket} complete! Advancing to Bucket ${nextBucket}`, "info");
            const inNext = players.findIndex(p => p.bucket === nextBucket && p.status === "UNSOLD");
            if (inNext !== -1) nextIdx = inNext;
          }
        }
      }

      if (nextIdx === -1) {
        // Fallback to any unsold player
        nextIdx = players.findIndex(p => p.status === "UNSOLD");
      }

      if (nextIdx !== -1) {
        lotIndex = nextIdx;
        const nextP = players[lotIndex];
        currentPrice = nextP.basePrice;
        leadingBidderId = null;
        passedFranchises.clear();
        timerSeconds = 30; // Initial timer is 30s as per specification

        showToast(`DRAW LOT #${nextP.id}: ${nextP.name} (${nextP.bucket} • Base ${nextP.basePrice}C)`, "success");
        broadcastAuctionState();
        renderCurrentView();
      } else {
        showToast("All available players in Round 1 processed. Ready for Round 2!", "info");
      }
    }

    function toggleAuctionPause() {
      if (auctionState === "LIVE") {
        auctionState = "PAUSED";
        showToast("Auction PAUSED by operator", "info");
      } else {
        auctionState = "LIVE";
        showToast("Auction RESUMED", "success");
      }
      broadcastAuctionState();
      renderCurrentView();
    }

    function startTimer() {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (auctionState === "LIVE" && timerSeconds > 0) {
          timerSeconds--;
          updateTimerUI();
          if (timerSeconds === 0) {
            // Timer expired does NOT sell player; requires hammer
            const timerEl = document.getElementById("displayTimer");
            if (timerEl) timerEl.style.color = "var(--danger)";
          }
        }
      }, 1000);
    }

    function updateTimerUI() {
      const timerEls = document.querySelectorAll(".timer-digit");
      timerEls.forEach(el => {
        el.innerText = String(timerSeconds).padStart(2, "0");
        if (timerSeconds <= 5) {
          el.style.color = "var(--danger)";
        } else if (timerSeconds <= 10) {
          el.style.color = "var(--warning)";
        } else {
          el.style.color = "var(--text-bright)";
        }
      });
    }
''')
    print("Auction actions and undo logic appended.")

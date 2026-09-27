# apply_timer_rings_and_actions.py

with open(r'B:\projects\ACC\index.html', 'r', encoding='utf-8') as f:
    text = f.read().replace('\r\n', '\n')

# 1. Timer in renderLiveAuctionView
old_timer_1 = """              <div style="text-align: right;">
                <span class="eyebrow">BID TIMER</span>
                <div class="sports-price timer-digit" id="displayTimer" style="font-size: clamp(2.4rem, 4vw, 3.8rem); color: var(--text-bright);">${timerSeconds}</div>
                <div style="font-size: 11px; color: var(--text-faint);">AUTHORITATIVE CLOCK</div>
              </div>"""

new_timer_1 = """              <div style="text-align: right; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span class="eyebrow" style="margin-bottom: 6px;">BID TIMER</span>
                <div class="timer-ring-container">
                  <svg class="timer-ring-svg" width="94" height="94">
                    <circle cx="47" cy="47" r="40" stroke="rgba(15,23,42,0.08)" stroke-width="7" fill="transparent"></circle>
                    <circle class="timer-ring-circle" cx="47" cy="47" r="40" stroke="#059669" stroke-width="7" stroke-dasharray="251" stroke-dashoffset="0" stroke-linecap="round"></circle>
                  </svg>
                  <div style="position: absolute; text-align: center;">
                    <div class="sports-price timer-digit" id="displayTimer" style="font-size: 32px; font-weight: 800; line-height: 1; color: var(--text-main);">${String(timerSeconds).padStart(2, '0')}</div>
                    <div style="font-size: 9px; font-weight: 700; color: var(--text-dim); text-transform: uppercase;">SEC</div>
                  </div>
                </div>
                <div style="font-size: 11px; color: var(--text-faint); margin-top: 4px;">AUTHORITATIVE CLOCK</div>
              </div>"""

if old_timer_1 in text:
    text = text.replace(old_timer_1, new_timer_1)
    print("Timer 1 replaced successfully!")
else:
    print("Timer 1 NOT found!")

# 2. Timer in renderFranchiseTerminalView
old_timer_2 = """              <div class="surface-card" style="padding: 8px 14px; text-align: center; border-radius: 10px; min-width: 88px;">
                <span class="eyebrow">TIMER</span>
                <span class="sports-price timer-digit" style="font-size: 26px; color: var(--text-bright);">${timerSeconds}s</span>
              </div>"""

new_timer_2 = """              <div class="surface-card" style="padding: 6px 12px; text-align: center; border-radius: 10px; display: flex; align-items: center; gap: 8px;">
                <div class="timer-ring-container">
                  <svg class="timer-ring-svg" width="54" height="54">
                    <circle cx="27" cy="27" r="22" stroke="rgba(15,23,42,0.08)" stroke-width="4" fill="transparent"></circle>
                    <circle class="timer-ring-circle" cx="27" cy="27" r="22" stroke="#059669" stroke-width="4" stroke-dasharray="138" stroke-dashoffset="0" stroke-linecap="round"></circle>
                  </svg>
                  <div style="position: absolute; text-align: center;">
                    <span class="sports-price timer-digit" style="font-size: 17px; font-weight: 800; line-height: 1; color: var(--text-main);">${String(timerSeconds).padStart(2, '0')}</span>
                  </div>
                </div>
                <div style="text-align: left;">
                  <span class="eyebrow" style="font-size: 9px; display: block;">TIMER</span>
                  <span style="font-size: 10px; font-weight: 700; color: var(--text-dim);">ACTIVE</span>
                </div>
              </div>"""

if old_timer_2 in text:
    text = text.replace(old_timer_2, new_timer_2)
    print("Timer 2 replaced successfully!")
else:
    print("Timer 2 NOT found!")

# 3. Timer in renderProjectorView
old_timer_3 = """                <div style="text-align: center;">
                  <span class="eyebrow" style="font-size: 13px;">OFFICIAL TIMER</span>
                  <div class="sports-price timer-digit" style="font-size: 52px; color: var(--text-bright); line-height: 1;">
                    ${timerSeconds}s
                  </div>
                </div>"""

new_timer_3 = """                <div style="text-align: center;">
                  <span class="eyebrow" style="font-size: 13px; color: rgba(255,255,255,0.6); display: block; margin-bottom: 8px;">OFFICIAL TIMER</span>
                  <div class="timer-ring-container">
                    <svg class="timer-ring-svg" width="160" height="160">
                      <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.12)" stroke-width="10" fill="transparent"></circle>
                      <circle class="timer-ring-circle" cx="80" cy="80" r="70" stroke="#10B981" stroke-width="10" stroke-dasharray="440" stroke-dashoffset="0" stroke-linecap="round"></circle>
                    </svg>
                    <div style="position: absolute; text-align: center;">
                      <div class="sports-price timer-digit" style="font-size: 64px; font-weight: 900; line-height: 0.9; color: #FFFFFF;">${String(timerSeconds).padStart(2, '0')}</div>
                      <div style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.5); letter-spacing: 0.1em;">SECONDS</div>
                    </div>
                  </div>
                </div>"""

if old_timer_3 in text:
    text = text.replace(old_timer_3, new_timer_3)
    print("Timer 3 replaced successfully!")
else:
    print("Timer 3 NOT found!")

# 4. Speeder calls on actions:
# In confirmHammer:
old_hammer = """      const winner = leadingBidderId ? franchises.find(f => f.id === leadingBidderId) : null;
      if (!winner) {
        showToast("No active bid placed", "warning");
        return;
      }"""

new_hammer = """      const winner = leadingBidderId ? franchises.find(f => f.id === leadingBidderId) : null;
      if (!winner) {
        showToast("No active bid placed", "warning");
        return;
      }
      showSpeeder("HAMMER SALE CONFIRMED!", `${players[lotIndex].name} sold to ${winner.name} for ${currentPrice}C`, 1000);"""

text = text.replace(old_hammer, new_hammer)

# In skipCurrentLot:
old_skip = """    function skipCurrentLot() {
      const p = players[lotIndex];"""

new_skip = """    function skipCurrentLot() {
      const p = players[lotIndex];
      showSpeeder("SKIPPING LOT...", `Advancing Lot #${p.id} ${p.name} to recall pool`, 600);"""

text = text.replace(old_skip, new_skip)

# In placeBid:
old_bid = """      currentPrice = nextBid;
      leadingBidderId = franchiseId;
      bidCount++;
      lastBidTimestamp = Date.now();
      timerSeconds = 20;"""

new_bid = """      currentPrice = nextBid;
      leadingBidderId = franchiseId;
      bidCount++;
      lastBidTimestamp = Date.now();
      timerSeconds = 20;
      showSpeeder("BID REGISTERED", `${f.name} bid ${nextBid}C`, 350);"""

text = text.replace(old_bid, new_bid)

# In undoSale:
old_undo = """      renderCurrentView();
      closeUndoModal();
      showToast("Sale reversed and purse refunded", "info");"""

new_undo = """      renderCurrentView();
      closeUndoModal();
      showSpeeder("TRANSACTION UNDONE", "Purse refunded & bucket allocations recalculated", 900);
      showToast("Sale reversed and purse refunded", "info");"""

text = text.replace(old_undo, new_undo)

with open(r'B:\projects\ACC\index.html', 'w', encoding='utf-8') as f:
    f.write(text)

with open(r'B:\projects\ACC\Acc-Auction-Os.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("All timer rings and speeder action calls applied!")

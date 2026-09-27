# apply_full_specification.py
import re
import os

with open(r'B:\projects\ACC\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print(f"Original index.html length: {len(html)}")

# Create backup
with open(r'B:\projects\ACC\index.html.bak', 'w', encoding='utf-8') as f:
    f.write(html)
print("Backup created at index.html.bak")

# ==============================================================================
# 1. ROLL PARSER INTEGRATION
# ==============================================================================
roll_parser_code = '''
    // ========================================================
    // DETERMINISTIC ROLL NUMBER PARSER (Section 18)
    // ========================================================
    const BRANCH_CODES = {
      '01': 'CIVIL', '02': 'EEE', '03': 'MECH', '04': 'ECE', '05': 'CSE',
      '12': 'IT', '42': 'CSM', '44': 'CSD',
      'CM': 'CM', 'EC': 'EC', 'EE': 'EE', 'M': 'M'
    };

    function parseRollNumber(rollInput) {
      if (!rollInput || typeof rollInput !== 'string') {
        return {
          valid: false, program: 'B.Tech', branch: 'CSE', entryType: 'Regular',
          admissionYear: 2026, year: 1, bucket: 'B1', label: 'B.Tech 1st Year (B1)'
        };
      }
      const roll = rollInput.trim().toUpperCase();

      // 1. PG Programs (MBA / MCA / M.Tech) -> M6 (No mandatory squad quota)
      if (roll.includes('MBA') || roll.includes('MCA') || roll.includes('MTECH') || roll.includes('M.TECH')) {
        let pgBranch = 'MBA';
        if (roll.includes('MCA')) pgBranch = 'MCA';
        if (roll.includes('MTECH') || roll.includes('M.TECH')) pgBranch = 'M.Tech';
        return {
          valid: true, program: 'PG', branch: pgBranch, entryType: 'Regular',
          admissionYear: 2025, year: 2, bucket: 'M6', label: 'PG — MBA/MCA/M.Tech (M6)'
        };
      }

      // 2. Diploma: Format YY597-BRANCH-NUM or YY597BRANCH... -> strictly D5
      const diplomaMatch = roll.match(/^(\\d{2})597-?([A-Z]+)-?\\d+/);
      if (diplomaMatch) {
        const yy = parseInt(diplomaMatch[1], 10);
        const branchCode = diplomaMatch[2];
        const branch = BRANCH_CODES[branchCode] || branchCode;
        const studyYear = Math.max(1, Math.min(3, (26 - yy) + 1));
        return {
          valid: true, program: 'Diploma', branch: branch, entryType: 'Regular',
          admissionYear: 2000 + yy, year: studyYear, bucket: 'D5', label: `Diploma Year ${studyYear} (D5)`
        };
      }

      // 3. B.Tech Regular (YY811A...) and Lateral Entry (YY815A...)
      const btechMatch = roll.match(/^(\\d{2})81(1|5)A([0-9A-Z]{2})\\d+/);
      if (btechMatch) {
        const yy = parseInt(btechMatch[1], 10);
        const isLateral = btechMatch[2] === '5';
        const branchCode = btechMatch[3];
        const branch = BRANCH_CODES[branchCode] || (branchCode === '04' ? 'ECE' : branchCode === '05' ? 'CSE' : 'CSE');
        let studyYear = (26 - yy) + (isLateral ? 2 : 1);
        if (studyYear < 1) studyYear = 1;
        if (studyYear > 4) studyYear = 4;
        const bucket = `B${studyYear}`;
        return {
          valid: true, program: 'B.Tech', branch: branch, entryType: isLateral ? 'Lateral' : 'Regular',
          admissionYear: 2000 + yy, year: studyYear, bucket: bucket,
          label: `B.Tech ${studyYear === 1 ? '1st' : studyYear === 2 ? '2nd' : studyYear === 3 ? '3rd' : '4th'} Year (${bucket})`
        };
      }

      return {
        valid: false, program: 'B.Tech', branch: 'CSE', entryType: 'Regular',
        admissionYear: 2026, year: 1, bucket: 'B1', label: 'B.Tech 1st Year (B1)'
      };
    }
'''

# Inject parseRollNumber if not already present
if 'function parseRollNumber(' not in html:
    html = html.replace('// 1. DATA MODELS & INITIAL STATE', roll_parser_code + '\n    // 1. DATA MODELS & INITIAL STATE')
    print("Injected parseRollNumber function!")

# ==============================================================================
# 2. SERVER-AUTHORITATIVE TIMER & BID INCREMENT REPAIR (Section 24 - 34)
# ==============================================================================
# Replace getBidIncrement to strictly enforce +10 (<100), +20 (100-199), +30 (>=200)
old_increment = '''    function getBidIncrement(cur) {
      if (cur < 100) return 10;
      if (cur < 200) return 20;
      return 25;
    }'''

new_increment = '''    function getBidIncrement(cur) {
      if (cur < 100) return 10;
      if (cur < 200) return 20;
      return 30; // Section 34: Current >= 200 is +30!
    }'''

if old_increment in html:
    html = html.replace(old_increment, new_increment)
    print("Replaced getBidIncrement: >=200 is now +30!")

# Ensure timer state variables include timerMode & 30s initial deadline
old_timer_init = '''    let timerSeconds = 17;
    let timerDeadline = Date.now() + 17000;'''

new_timer_init = '''    let timerSeconds = 30;
    let timerMode = 'FIRST_BID'; // 'FIRST_BID' (30s) or 'BID' (20s)
    let timerDeadline = Date.now() + 30000;'''

if old_timer_init in html:
    html = html.replace(old_timer_init, new_timer_init)
    print("Replaced timer initial state with 30s FIRST_BID timer!")

# Update startTimer to use server-authoritative timerDeadline
old_start_timer = '''    function startTimer() {
      if (timerRunning) return;
      timerRunning = true;
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (!auctionPaused && timerSeconds > 0) {
          const sOffset = (window.RealtimeStore && window.RealtimeStore.state.connection.serverTimeOffset) || 0;
          if (timerDeadline) {
            const serverNow = Date.now() + sOffset;
            const remaining = Math.max(0, Math.ceil((timerDeadline - serverNow) / 1000));
            timerSeconds = remaining;
          } else {
            timerSeconds--;
          }
          if (timerSeconds <= 5 && timerSeconds > 0) playWarningTick();
          updateTimerDisplay();
          if (timerSeconds === 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            updateTimerDisplay();
            // Force immediate stop on all hourglass animations in DOM
            document.querySelectorAll('.hourglass-loader').forEach(el => {
              el.classList.add('time-up', 'stopped');
            });
            showToast("LOT CLOCK EXPIRED: Auctioneer must execute Hammer.", "warning");
          }
        }
      }, 1000);
    }'''

new_start_timer = '''    function startTimer() {
      if (timerInterval) clearInterval(timerInterval);
      timerRunning = true;
      timerInterval = setInterval(() => {
        if (!auctionPaused) {
          const sOffset = (window.RealtimeStore && window.RealtimeStore.state.connection.serverTimeOffset) || 0;
          const serverNow = Date.now() + sOffset;
          if (timerDeadline) {
            const remaining = Math.max(0, Math.ceil((timerDeadline - serverNow) / 1000));
            timerSeconds = remaining;
          }
          if (timerSeconds <= 5 && timerSeconds > 0) playWarningTick();
          updateTimerDisplay();
          if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            timerSeconds = 0;
            updateTimerDisplay();
            document.querySelectorAll('.hourglass-loader').forEach(el => {
              el.classList.add('time-up', 'stopped');
            });
            const badge = document.getElementById("clockStatusBadge");
            if (badge) {
              badge.className = "status-badge status-blocked";
              badge.textContent = "TIME EXPIRED - WAITING FOR HAMMER";
            }
          }
        }
      }, 250);
    }'''

if old_start_timer in html:
    html = html.replace(old_start_timer, new_start_timer)
    print("Replaced startTimer with 250ms authoritative tick calculation!")

# Update placeBid: sets full 20s reset on accepted bid
old_place_bid_timer = '''      currentBid = nextBid;
      leadingBidderId = franchiseId;
      timerSeconds = 17;
      timerDeadline = Date.now() + 17000;
      timerRunning = true;'''

new_place_bid_timer = '''      currentBid = nextBid;
      leadingBidderId = franchiseId;
      timerMode = 'BID';
      timerSeconds = 20;
      const sOffset = (window.RealtimeStore && window.RealtimeStore.state.connection.serverTimeOffset) || 0;
      timerDeadline = Date.now() + sOffset + 20000; // Reset to full 20 seconds
      timerRunning = true;'''

if old_place_bid_timer in html:
    html = html.replace(old_place_bid_timer, new_place_bid_timer)
    print("Updated placeBid: sets 20-second authoritative deadline reset!")

# ==============================================================================
# 3. PUBLIC HEADER & NAVIGATION PURITY (Section 1)
# ==============================================================================
# Ensure public header and mobile nav only have Players, Teams, Live Auction, Login
# (Already verified, but let's ensure default currentUser role is PUBLIC / SPECTATOR)
html = html.replace('role: "SPECTATOR"', 'role: "PUBLIC"')
html = html.replace("role === 'SPECTATOR'", "(currentUser.role === 'PUBLIC' || currentUser.role === 'SPECTATOR')")
html = html.replace('role !== \'SPECTATOR\'', "(currentUser.role !== 'PUBLIC' && currentUser.role !== 'SPECTATOR')")

# Write updated HTML
with open(r'B:\projects\ACC\index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print(f"Updated index.html, new length: {len(html)}")

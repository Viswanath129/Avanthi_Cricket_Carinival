# append_views_part1.py
with open(r'B:\projects\ACC\generate_acc_2026.py', 'a', encoding='utf-8') as f:
    f.write(r'''
    // ========================================================
    // 4. VIEW ROUTING & AUTHENTICATION CONTROLLER
    // ========================================================
    function switchView(view) {
      // Route Guarding
      if (view === 'admin') {
        if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN_HANDLER') {
          showToast("Staff authentication required to access Admin Console", "error");
          switchView('login');
          return;
        }
      } else if (view === 'franchise') {
        if (currentUser.role !== 'FRANCHISE') {
          // If public clicks franchise, set demo franchise or go to login
          currentUser = {
            role: 'FRANCHISE',
            name: 'Titans Coordinator',
            title: 'Faculty Coordinator',
            franchiseId: 'titans'
          };
          franchiseLoginIdentity = 'COORDINATOR';
          showToast("Signed in as TITANS (Faculty Coordinator)", "success");
        }
      } else if (view === 'player') {
        if (currentUser.role !== 'PLAYER') {
          currentUser = {
            role: 'PLAYER',
            name: 'Arjun Kumar',
            title: 'Registered Student Player',
            playerId: '023'
          };
          showToast("Signed in as Player (Arjun Kumar)", "success");
        }
      }

      currentView = view;

      document.querySelectorAll(".nav-tab-btn").forEach(btn => btn.classList.remove("active"));
      const activeBtn = document.getElementById("tab-" + view);
      if (activeBtn) activeBtn.classList.add("active");

      updateSessionIndicator();
      showSpeeder(`LOADING ${view.toUpperCase()} VIEW...`, "Updating live reactive layout", 300);
      renderCurrentView();
    }

    function updateSessionIndicator() {
      const area = document.getElementById("sessionIndicatorArea");
      if (!area) return;

      if (currentUser.role === 'PUBLIC') {
        area.innerHTML = `
          <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem; border-color: var(--primary);" onclick="switchView('login')">
            Staff / Team Sign In →
          </button>
        `;
      } else {
        let badgeColor = currentUser.role === 'SUPER_ADMIN' ? 'var(--auction)' : (currentUser.role === 'FRANCHISE' ? 'var(--primary)' : 'var(--text-bright)');
        let label = currentUser.name;
        if (currentUser.role === 'FRANCHISE') {
          label = `${franchises.find(f => f.id === currentUser.franchiseId)?.name || 'FRANCHISE'} • ${franchiseLoginIdentity}`;
        }
        area.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px; background: var(--bg-card); border: 1px solid var(--border-medium); border-radius: 6px; padding: 4px 10px;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: ${badgeColor};"></span>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-bright); text-transform: uppercase;">${label}</span>
          </div>
          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.7rem;" onclick="signOutUser()">
            Sign Out
          </button>
        `;
      }
    }

    function signOutUser() {
      currentUser = { role: 'PUBLIC', name: 'Public Visitor', title: 'Spectator' };
      showToast("Signed out. Returned to Public View.", "info");
      switchView('public');
    }

    function setSession(role, name, extra = {}) {
      currentUser = { role, name, ...extra };
      updateSessionIndicator();
      if (role === 'SUPER_ADMIN' || role === 'ADMIN_HANDLER') {
        switchView('admin');
      } else if (role === 'FRANCHISE') {
        switchView('franchise');
      } else if (role === 'PLAYER') {
        switchView('player');
      } else {
        switchView('public');
      }
    }

    function openDemoSwitcherModal() {
      const modal = document.getElementById("modalContainer");
      modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation()">
            <div style="padding: 20px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span class="eyebrow" style="color: var(--primary);">EVALUATOR QUICK-SWITCH</span>
                <div style="font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text-bright); margin-top: 2px;">SELECT TEST IDENTITY</div>
              </div>
              <button class="btn btn-secondary" style="padding: 4px 8px;" onclick="closeModal()">✕</button>
            </div>
            <div style="padding: 20px; display: grid; gap: 10px;">
              <button class="btn btn-secondary" style="justify-content: flex-start; text-align: left;" onclick="closeModal(); setSession('SUPER_ADMIN', 'Tournament Director', { title: 'Super Admin' })">
                <span class="status-pill pill-orange">SUPER ADMIN</span>
                <div><strong>Super Admin Console</strong> (Full control, settings, multi-sale undo, CSV export)</div>
              </button>
              <button class="btn btn-secondary" style="justify-content: flex-start; text-align: left;" onclick="closeModal(); setSession('ADMIN_HANDLER', 'Auction Floor Operator', { title: 'Auction Handler' })">
                <span class="status-pill pill-yellow">AUCTION HANDLER</span>
                <div><strong>Auction Operator Console</strong> (Draw, Hammer, Skip, Pause)</div>
              </button>
              <button class="btn btn-secondary" style="justify-content: flex-start; text-align: left;" onclick="closeModal(); franchiseLoginIdentity = 'COORDINATOR'; setSession('FRANCHISE', 'Dr. R. Sharma (Coordinator)', { franchiseId: 'titans', title: 'Faculty Coordinator' })">
                <span class="status-pill pill-green">TITANS</span>
                <div><strong>Faculty Coordinator Login (Primary)</strong> • Bidding & Squad Terminal</div>
              </button>
              <button class="btn btn-secondary" style="justify-content: flex-start; text-align: left;" onclick="closeModal(); franchiseLoginIdentity = 'CAPTAIN'; setSession('FRANCHISE', 'Arjun Kumar (Captain)', { franchiseId: 'titans', title: 'Team Captain' })">
                <span class="status-pill pill-green">TITANS</span>
                <div><strong>Captain Login (Secondary)</strong> • Same franchise account, phone bidding</div>
              </button>
              <button class="btn btn-secondary" style="justify-content: flex-start; text-align: left;" onclick="closeModal(); franchiseLoginIdentity = 'COORDINATOR'; setSession('FRANCHISE', 'Prof. K. Prasad', { franchiseId: 'royals', title: 'Faculty Coordinator' })">
                <span class="status-pill pill-red">ROYALS</span>
                <div><strong>Royals Franchise</strong> • Test multi-franchise bidding contest</div>
              </button>
              <button class="btn btn-secondary" style="justify-content: flex-start; text-align: left;" onclick="closeModal(); setSession('PLAYER', 'Arjun Kumar', { playerId: '023', title: 'Registered Student' })">
                <span class="status-pill pill-grey">PLAYER</span>
                <div><strong>Player Portal</strong> • 92% profile complete, CricHeroes, Eligibility</div>
              </button>
              <button class="btn btn-secondary" style="justify-content: flex-start; text-align: left;" onclick="closeModal(); setSession('PUBLIC', 'Public Visitor', { title: 'Spectator' })">
                <span class="status-pill pill-grey">PUBLIC</span>
                <div><strong>Public Viewer</strong> • Zero login required, unauthenticated live broadcast</div>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function renderCurrentView() {
      const container = document.getElementById("appMain");
      updateSessionIndicator();

      if (currentView === "public") {
        container.innerHTML = renderPublicView();
      } else if (currentView === "live") {
        container.innerHTML = renderLiveAuctionView();
      } else if (currentView === "franchise") {
        container.innerHTML = renderFranchiseTerminalView();
      } else if (currentView === "teams") {
        container.innerHTML = render11FranchisesView();
      } else if (currentView === "register") {
        container.innerHTML = renderPlayerRegistrationView();
      } else if (currentView === "player") {
        container.innerHTML = renderPlayerPortalView();
      } else if (currentView === "admin") {
        container.innerHTML = renderAdminConsoleView();
      } else if (currentView === "projector") {
        container.innerHTML = renderProjectorView();
      } else if (currentView === "login") {
        container.innerHTML = renderLoginView();
      }

      updateTimerUI();
    }
''')
    print("View controller & session system appended.")

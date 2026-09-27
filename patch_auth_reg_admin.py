# patch_auth_reg_admin.py
import re

with open(r'B:\projects\ACC\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ==============================================================================
# 1. STATE INITIALIZATION FOR ADMIN TABS & MANAGEMENT
# ==============================================================================
state_vars = '''
    let adminNavTab = 'AUCTION'; // OVERVIEW, TEAMS, PLAYERS, REGISTRATIONS, AUCTION, ROUND 2, UNDO, AUDIT, EXPORT, SETTINGS, ADMIN ACCOUNTS
    let selectedPlayerDetailId = null;
    let regActiveSection = 1; // 1: 01 IDENTITY & ACADEMIC, 2: 02 CRICKET PROFILE
    let playerSearchQuery = '';
    let playerBucketFilter = 'ALL';
    let playerStatusFilter = 'ALL';
    let playerDeptFilter = 'ALL';
'''

if 'let adminNavTab =' not in html:
    html = html.replace('let currentView = "public";', state_vars + '\n    let currentView = "public";')
    print("Injected adminNavTab and regActiveSection state variables!")

# ==============================================================================
# 2. UPDATE LOGIN VIEW & ROLE SELECTION (Section 2: PLAYER, FRANCHISE, STAFF)
# ==============================================================================
# Ensure role selector in login view has PLAYER, FRANCHISE, STAFF
login_view_regex = r'function renderLoginView\(\)\s*\{.*?return `(.*?)`;\s*\}'
# Let's inspect where renderLoginView is defined and update it
new_render_login_view = '''function renderLoginView() {
      return `
        <div style="min-height: calc(100vh - 160px); display: flex; align-items: center; justify-content: center; padding: var(--space-4) 0;">
          <div class="surface-card auth-gateway-card">
            
            <!-- Left Panel: Brand Statement -->
            <div class="auth-brand-panel">
              <div class="auth-brand-header">
                <img src="acc-logo.png" alt="ACC Official Logo" class="auth-brand-logo" style="width: 64px; height: 64px; object-fit: contain; background: transparent; margin-bottom: 16px; filter: drop-shadow(0 4px 12px rgba(15, 23, 42, 0.08));">
                <div>
                  <div style="margin-bottom: 4px;">
                    <span class="status-badge status-live auth-brand-subtitle" style="font-size: 0.65rem;">ACC 2026 OFFICIAL</span>
                  </div>
                  <h1 class="auth-brand-title" style="font-family: var(--font-display); font-size: clamp(1.75rem, 3.2vw, 2.75rem); font-weight: 800; color: var(--text-bright); line-height: 1.05; margin-bottom: var(--space-2);">
                    AVANTHI<br>CRICKET<br>CARNIVAL
                  </h1>
                  <div class="auth-brand-subtitle" style="font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 700; color: var(--color-green); letter-spacing: 0.1em; text-transform: uppercase;">
                    PLAYER AUCTION 2026
                  </div>
                </div>
              </div>

              <div class="auth-brand-desktop-desc" style="margin-top: var(--space-8);">
                <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
                  The authoritative digital platform for live player bidding, franchise squad management, and real-time operational governance.
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
            <div class="auth-form-panel">
              <div style="margin-bottom: var(--space-5);">
                <span class="label-micro">AUTHENTICATION GATEWAY</span>
                <h2 class="auth-header-title" style="font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--text-bright); margin-top: 2px;">
                  SIGN IN
                </h2>
                <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 4px;">
                  Select your role family to proceed to your verified workspace.
                </div>
              </div>

              <!-- Role Selector: Strictly PLAYER, FRANCHISE, STAFF -->
              <div class="form-group" style="margin-bottom: var(--space-4);">
                <label class="form-label">CONTINUE AS</label>
                <div class="auth-role-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                  ${['PLAYER', 'FRANCHISE', 'STAFF'].map(r => `
                    <button type="button" class="btn btn-secondary auth-role-btn" style="${(loginRoleSelection === r || (r === 'STAFF' && loginRoleSelection === 'ADMIN')) ? 'background: rgba(5, 150, 105, 0.12); border-color: var(--color-green); color: var(--color-green); font-weight: 800;' : ''}" onclick="loginRoleSelection = '${r}'; renderCurrentView();">
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
                    <input type="text" class="form-input" id="loginPlayerIdentifier" placeholder="e.g. 26811A0501 or player@acc.edu" required>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">PLAYER PASSWORD / PIN</label>
                    <input type="password" class="form-input" id="loginPlayerSecret" placeholder="••••••••" required>
                  </div>

                  <div style="display: flex; justify-content: flex-end;">
                    <a href="javascript:void(0)" onclick="openForgotPasswordModal('PLAYER')" style="font-size: 0.75rem; color: var(--color-green); text-decoration: none; font-weight: 600;">Forgot Roll or Password?</a>
                  </div>

                  <button type="submit" class="btn btn-primary" style="width: 100%; min-height: 48px; font-size: 0.9375rem; margin-top: var(--space-1);">
                    SIGN IN AS PLAYER
                  </button>
                </form>
              ` : loginRoleSelection === 'FRANCHISE' ? `
                <form onsubmit="handleLoginSubmit(event)" style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-2);">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">TARGET FRANCHISE</label>
                    <select class="form-select" id="loginFranchiseSelect" onchange="franchiseLoginSelection = parseInt(this.value, 10)">
                      ${franchises.map(f => `
                        <option value="${f.id}" ${franchiseLoginSelection === f.id ? 'selected' : ''}>${f.name} (${f.short})</option>
                      `).join('')}
                    </select>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">AUTHENTICATION IDENTITY</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                      <button type="button" class="btn btn-secondary" style="${loginFranchiseIdentity === 'COORDINATOR' ? 'background: rgba(5, 150, 105, 0.12); border-color: var(--color-green); color: var(--color-green); font-weight: 800;' : ''}" onclick="loginFranchiseIdentity = 'COORDINATOR'; renderCurrentView();">
                        COORDINATOR
                      </button>
                      <button type="button" class="btn btn-secondary" style="${loginFranchiseIdentity === 'TEAM_LEADER' ? 'background: rgba(5, 150, 105, 0.12); border-color: var(--color-green); color: var(--color-green); font-weight: 800;' : ''}" onclick="loginFranchiseIdentity = 'TEAM_LEADER'; renderCurrentView();">
                        TEAM LEAD
                      </button>
                    </div>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">COORDINATOR / CAPTAIN PIN</label>
                    <input type="password" class="form-input" id="loginFranchiseSecret" placeholder="••••••••" required>
                  </div>

                  <div style="display: flex; justify-content: flex-end;">
                    <a href="javascript:void(0)" onclick="openForgotPasswordModal('FRANCHISE')" style="font-size: 0.75rem; color: var(--color-green); text-decoration: none; font-weight: 600;">Forgot Franchise Credentials?</a>
                  </div>

                  <button type="submit" class="btn btn-primary" style="width: 100%; min-height: 48px; font-size: 0.9375rem; margin-top: var(--space-1);">
                    ENTER FRANCHISE TERMINAL
                  </button>
                </form>
              ` : `
                <!-- STAFF LOGIN: RESOLVES TO SUPER ADMIN OR ADMIN / HANDLER -->
                <form onsubmit="handleLoginSubmit(event)" style="display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-2);">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">STAFF USERNAME OR EMAIL</label>
                    <input type="text" class="form-input" id="loginStaffIdentifier" placeholder="e.g. superadmin@acc.edu or handler@acc.edu" required>
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">OPERATIONAL PASSWORD</label>
                    <input type="password" class="form-input" id="loginStaffSecret" placeholder="••••••••" required>
                  </div>

                  <div style="display: flex; justify-content: flex-end;">
                    <a href="javascript:void(0)" onclick="openForgotPasswordModal('STAFF')" style="font-size: 0.75rem; color: var(--color-green); text-decoration: none; font-weight: 600;">Forgot Staff Credentials?</a>
                  </div>

                  <button type="submit" class="btn btn-primary" style="width: 100%; min-height: 48px; font-size: 0.9375rem; margin-top: var(--space-1);">
                    AUTHENTICATE STAFF CREDENTIAL
                  </button>
                </form>
              `}

              <!-- Registration Footnote -->
              <div style="margin-top: var(--space-6); text-align: center; border-top: 1px solid var(--border-subtle); padding-top: var(--space-4);">
                <span style="font-size: 0.8125rem; color: var(--text-muted);">New tournament player?</span>
                <button type="button" class="btn btn-secondary" style="margin-left: 8px; font-size: 0.75rem; padding: 4px 12px; min-height: 32px;" onclick="switchView('register')">
                  PLAYER REGISTRATION
                </button>
              </div>

            </div>

          </div>
        </div>
      `;
    }'''

# Replace renderLoginView
start_idx = html.find('function renderLoginView() {')
end_idx = html.find('function renderPlayerRegistrationView() {')
if start_idx != -1 and end_idx != -1:
    html = html[:start_idx] + new_render_login_view + '\n\n    ' + html[end_idx:]
    print("Replaced renderLoginView with strictly compliant single-login entry!")

# Write updated HTML
with open(r'B:\projects\ACC\index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print(f"Updated index.html after login view, length: {len(html)}")

# apply_full_visual_restoration.py
# Restores the FeralUI Pastel Glass Atmosphere, 5-Layer Radial Gradient Mesh,
# SVG Film Grain Overlay, and UIverse Speeder Loading Animation into index.html and Acc-Auction-Os.html

with open(r'B:\projects\ACC\firebase_live.html', 'r', encoding='utf-8') as f:
    fb_text = f.read().replace('\r\n', '\n')

with open(r'B:\projects\ACC\index.html', 'r', encoding='utf-8') as f:
    cur_text = f.read().replace('\r\n', '\n')

# 1. Extract speeder CSS from firebase_live.html
idx1 = fb_text.find('/* ========================================================\n       UIVERSE SPEEDER LOADING ANIMATION')
idx2 = fb_text.find('/* ========================================================\n       TIMER PROGRESS RING', idx1)
idx3 = fb_text.find('/* 11 Franchise Cards and Badges', idx2)

speeder_css = fb_text[idx1:idx2].strip()
timer_ring_css = fb_text[idx2:idx3].strip()

# 2. Speeder HTML from firebase_live.html
idx_sp_html_start = fb_text.find('<!-- UIVERSE SPEEDER LOADING OVERLAY -->')
idx_sp_html_end = fb_text.find('<!-- MAIN APP CONTAINER -->', idx_sp_html_start)
speeder_html = fb_text[idx_sp_html_start:idx_sp_html_end].strip()

# 3. Grain SVG
grain_svg = """  <!-- SVG Film Grain Texture Overlay -->
  <svg class="grain-overlay" xmlns="http://www.w3.org/2000/svg">
    <filter id="feralui-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.06   0 0 0 0 0.09   0 0 0 0 0.16   0 0 0 0.1 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#feralui-grain)" />
  </svg>"""

# 4. FeralUI Pastel Atmosphere & Glass Tokens
feralui_style_block = f"""
    /* ========================================================
       ACC AUCTION OS - FERALUI PASTEL GLASS & TYPOGRAPHY TOKENS
       ======================================================== */
    :root {{
      --bg-misted-sky: #F6F9FF;
      --bg-rain-indigo: #9BE0E8;
      --bg-lavender: #C4B5F7;
      --bg-lilac-paper: #F8B8D9;

      --text-main: #0F172A;       /* Slate 900 - High Contrast AA */
      --text-muted: #334155;      /* Slate 700 */
      --text-subtle: #475569;     /* Slate 600 */
      --text-faint: #64748B;      /* Slate 500 */
      --text-bright: #0F172A;
      --text-body: #334155;
      --text-dim: #64748B;

      --emerald-600: #059669;
      --emerald-500: #10B981;
      --emerald-100: #D1FAE5;
      --emerald-50: #ECFDF5;

      --amber-600: #D97706;
      --amber-500: #F59E0B;
      --amber-100: #FEF3C7;
      --amber-50: #FFFBEB;

      --rose-600: #E11D48;
      --rose-500: #F43F5E;
      --rose-100: #FFE4E6;
      --rose-50: #FFF1F2;

      --blue-600: #2563EB;
      --blue-500: #3B82F6;
      --blue-100: #DBEAFE;

      --primary: #059669;
      --auction: #D97706;
      --warning: #F59E0B;
      --danger: #E11D48;
      --muted: #64748B;

      --glass-bg: rgba(255, 255, 255, 0.76);
      --glass-bg-elevated: rgba(255, 255, 255, 0.90);
      --glass-bg-subtle: rgba(255, 255, 255, 0.60);
      --glass-border: rgba(255, 255, 255, 0.95);
      --glass-border-subtle: rgba(15, 23, 42, 0.08);
      --glass-shadow: 0 12px 36px -4px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03);
      --glass-shadow-lg: 0 20px 48px -6px rgba(15, 23, 42, 0.09), 0 8px 16px -4px rgba(15, 23, 42, 0.04);

      --font-sans: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-display: 'Space Grotesk', var(--font-sans);
      --font-sports: 'Barlow Condensed', sans-serif;
      --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

      --radius-sm: 8px;
      --radius-md: 16px;
      --radius-lg: 24px;
      --radius-full: 9999px;
    }}

    *, *::before, *::after {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    html, body {{
      min-height: 100%;
      font-family: var(--font-sans);
      color: var(--text-main);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }}

    body {{
      background-color: var(--bg-misted-sky);
      background-image: 
        radial-gradient(at 0% 0%, rgba(155, 224, 232, 0.65) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(196, 181, 247, 0.7) 0px, transparent 52%),
        radial-gradient(at 100% 100%, rgba(248, 184, 217, 0.6) 0px, transparent 50%),
        radial-gradient(at 0% 100%, rgba(155, 224, 232, 0.5) 0px, transparent 48%),
        radial-gradient(at 50% 50%, rgba(246, 249, 255, 0.85) 0px, transparent 70%);
      background-attachment: fixed;
      line-height: 1.5;
      overflow-x: hidden;
    }}

    /* SVG Grain Pattern Filter */
    .grain-overlay {{
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1;
      opacity: 0.22;
      mix-blend-mode: multiply;
    }}

    /* Glass Surfaces */
    .surface-card, .glass {{
      background: var(--glass-bg);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
      border-radius: var(--radius-md);
      color: var(--text-main);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }}

    .surface-card:hover {{
      background: var(--glass-bg-elevated);
      box-shadow: var(--glass-shadow-lg);
    }}

    .surface-elevated, .glass-elevated {{
      background: var(--glass-bg-elevated);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border: 1px solid rgba(255, 255, 255, 0.95);
      box-shadow: var(--glass-shadow-lg);
      border-radius: var(--radius-lg);
      color: var(--text-main);
    }}

    /* Header Nav */
    .app-header {{
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.82);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
      padding: 0 24px;
      height: 68px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}

    .nav-tabs {{
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(15, 23, 42, 0.05);
      padding: 4px;
      border-radius: var(--radius-full);
      border: 1px solid rgba(255, 255, 255, 0.8);
    }}

    .nav-tab-btn {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      background: transparent;
      border: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      white-space: nowrap;
    }}

    .nav-tab-btn:hover {{
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.5);
    }}

    .nav-tab-btn.active {{
      color: var(--text-main);
      background: #FFFFFF;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    }}

    /* Buttons */
    .btn {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      border: 1px solid transparent;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
      white-space: nowrap;
    }}

    .btn-primary {{
      background: linear-gradient(135deg, var(--emerald-600), #047857);
      color: #FFFFFF;
      box-shadow: 0 6px 18px rgba(5, 150, 105, 0.25);
    }}

    .btn-primary:hover {{
      background: linear-gradient(135deg, #059669, #065F46);
      box-shadow: 0 8px 24px rgba(5, 150, 105, 0.35);
    }}

    .btn-auction {{
      background: linear-gradient(135deg, var(--amber-600), #B45309);
      color: #FFFFFF;
      box-shadow: 0 6px 18px rgba(217, 119, 6, 0.25);
    }}

    .btn-auction:hover {{
      box-shadow: 0 8px 24px rgba(217, 119, 6, 0.35);
    }}

    .btn-secondary {{
      background: #FFFFFF;
      border: 1px solid rgba(15, 23, 42, 0.1);
      color: var(--text-main);
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
    }}

    .btn-secondary:hover {{
      background: #F8FAFC;
      border-color: rgba(15, 23, 42, 0.18);
    }}

    .btn-danger {{
      background: var(--rose-50);
      border: 1px solid var(--rose-100);
      color: var(--rose-600);
    }}

    .btn-danger:hover {{
      background: var(--rose-100);
    }}

    /* Giant Tactile Trading Bid Button */
    .btn-giant-bid {{
      width: 100%;
      height: 72px;
      background: linear-gradient(135deg, #10B981, #059669);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: var(--radius-md);
      font-family: var(--font-sports);
      font-size: 1.85rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      box-shadow: 0 12px 30px rgba(5, 150, 105, 0.32);
      transition: all 0.15s ease-out;
    }}

    .btn-giant-bid:hover:not(:disabled) {{
      transform: translateY(-2px);
      box-shadow: 0 16px 36px rgba(5, 150, 105, 0.42);
    }}

    .btn-giant-bid:disabled {{
      background: #94A3B8;
      color: rgba(255, 255, 255, 0.8);
      box-shadow: none;
      cursor: not-allowed;
    }}

    /* Forms */
    .form-input, .form-select, .form-textarea {{
      width: 100%;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(15, 23, 42, 0.12);
      border-radius: 12px;
      padding: 10px 14px;
      color: var(--text-main);
      font-family: var(--font-sans);
      font-size: 0.9375rem;
      transition: all 0.15s ease;
      outline: none;
    }}

    .form-input:focus, .form-select:focus, .form-textarea:focus {{
      border-color: var(--emerald-600);
      background: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
    }}

    /* Typography Classes */
    .display-title {{
      font-family: var(--font-display);
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.03em;
      line-height: 1.05;
    }}

    .sports-title {{
      font-family: var(--font-sports);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }}

    .sports-price {{
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1;
    }}

    .eyebrow {{
      font-family: var(--font-sans);
      font-size: 0.6875rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--text-subtle);
    }}

    .tabular-nums {{
      font-variant-numeric: tabular-nums;
    }}

    /* Status Pills */
    .status-pill {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-family: var(--font-sports);
    }}

    .pill-green {{
      background: var(--emerald-50);
      color: var(--emerald-600);
      border: 1px solid var(--emerald-100);
    }}

    .pill-orange {{
      background: var(--amber-50);
      color: var(--amber-600);
      border: 1px solid var(--amber-100);
    }}

    .pill-yellow {{
      background: #FFFBEB;
      color: #B45309;
      border: 1px solid #FEF3C7;
    }}

    .pill-red {{
      background: var(--rose-50);
      color: var(--rose-600);
      border: 1px solid var(--rose-100);
    }}

    .pill-grey {{
      background: #F1F5F9;
      color: #475569;
      border: 1px solid #E2E8F0;
    }}

    .pulse-dot {{
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 8px currentColor;
      animation: pulseAnim 2s infinite;
    }}

    @keyframes pulseAnim {{
      0%, 100% {{ opacity: 1; transform: scale(1); }}
      50% {{ opacity: 0.4; transform: scale(0.85); }}
    }}

    /* Scarcity Banner */
    .scarcity-banner {{
      background: rgba(254, 243, 199, 0.85);
      border: 1.5px solid #F59E0B;
      border-radius: var(--radius-md);
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
      backdrop-filter: blur(16px);
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.12);
    }}

    /* Toast */
    #toastContainer {{
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }}

    .toast-msg {{
      background: #FFFFFF;
      border: 1px solid rgba(15, 23, 42, 0.1);
      color: var(--text-main);
      padding: 12px 18px;
      border-radius: var(--radius-sm);
      box-shadow: var(--glass-shadow-lg);
      font-size: 0.875rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
      animation: toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }}

    @keyframes toastIn {{
      from {{ opacity: 0; transform: translateY(12px); }}
      to {{ opacity: 1; transform: translateY(0); }}
    }}

    /* Modals */
    .modal-overlay {{
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }}

    .modal-dialog {{
      background: var(--glass-bg-elevated);
      backdrop-filter: blur(32px);
      -webkit-backdrop-filter: blur(32px);
      border: 1px solid rgba(255, 255, 255, 0.95);
      box-shadow: 0 25px 60px -10px rgba(15, 23, 42, 0.25);
      border-radius: 24px;
      max-width: 580px;
      width: 100%;
      overflow: hidden;
      animation: modalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }}

    @keyframes modalIn {{
      from {{ opacity: 0; transform: scale(0.96) translateY(8px); }}
      to {{ opacity: 1; transform: scale(1) translateY(0); }}
    }}

    {speeder_css}

    {timer_ring_css}

    /* Responsive grid helpers */
    .financial-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      padding: 20px;
      text-align: center;
    }}
    .quotas-grid {{
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
      text-align: center;
    }}

    @media (max-width: 640px) {{
      .app-header {{ height: auto; padding: 10px 12px; flex-direction: column; gap: 8px; }}
      .nav-tabs {{ 
        width: 100%; 
        max-width: 100%; 
        overflow-x: auto; 
        justify-content: flex-start; 
        scrollbar-width: none; 
      }}
      .nav-tabs::-webkit-scrollbar {{ display: none; }}
      .nav-tab-btn {{ padding: 6px 10px; font-size: 0.75rem; }}
      
      #appMain {{ padding: 12px 10px 60px !important; }}
      .surface-card, .surface-elevated {{ padding: 14px 12px !important; border-radius: 12px !important; }}
      .financial-grid {{
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 6px !important;
        padding: 10px 4px !important;
      }}
      .financial-grid .sports-price {{ font-size: 17px !important; }}
      .financial-grid .eyebrow {{ font-size: 8px !important; }}
      .quotas-grid {{
        grid-template-columns: repeat(6, 1fr) !important;
        gap: 4px !important;
      }}
      .quotas-grid > div {{ padding: 4px 2px !important; font-size: 10px !important; }}
      .btn-giant-bid {{ height: 64px !important; font-size: 1.45rem !important; }}
    }}
"""

# Replace the <style>...</style> block in cur_text
idx_style_open = cur_text.find('<style>')
idx_style_close = cur_text.find('</style>')
if idx_style_open != -1 and idx_style_close != -1:
    cur_text = cur_text[:idx_style_open] + '<style>' + feralui_style_block + cur_text[idx_style_close:]

# Ensure Firebase SDK scripts are in <head>
firebase_sdks = """  <!-- Google Firebase SDK (v10 compat scripts for real-time cloud database) -->
  <script src="https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.13.2/firebase-database-compat.js"></script>
"""
if "firebase-firestore-compat.js" not in cur_text:
    cur_text = cur_text.replace('</head>', firebase_sdks + '\n</head>')

# Replace the speeder overlay and add grain overlay right after <body>
idx_body = cur_text.find('<body>')
if idx_body != -1:
    idx_header = cur_text.find('<header class="app-header">')
    body_header_replacement = '<body>\n\n' + grain_svg + '\n\n' + speeder_html + '\n\n'
    cur_text = cur_text[:idx_body] + body_header_replacement + cur_text[idx_header:]

# Update showSpeeder in JS to use speederMsg and speederSub
old_show_speeder = """    function showSpeeder(title, subtitle, duration = 400) {
      const overlay = document.getElementById("speederOverlay");
      const t = document.getElementById("speederTitle");
      const s = document.getElementById("speederSubtitle");
      if (t) t.innerText = title;
      if (s) s.innerText = subtitle;
      if (overlay) overlay.classList.remove("hidden");
      setTimeout(() => {
        if (overlay) overlay.classList.add("hidden");
      }, duration);
    }"""

new_show_speeder = """    function showSpeeder(title, subtitle, duration = 400) {
      const overlay = document.getElementById("speederOverlay");
      const t = document.getElementById("speederMsg") || document.getElementById("speederTitle");
      const s = document.getElementById("speederSub") || document.getElementById("speederSubtitle");
      if (t) t.innerText = title;
      if (s) s.innerText = subtitle;
      if (overlay) overlay.classList.remove("hidden");
      setTimeout(() => {
        if (overlay) overlay.classList.add("hidden");
      }, duration);
    }"""

cur_text = cur_text.replace(old_show_speeder, new_show_speeder)

# Update updateTimerUI to also animate the circular SVG timer ring
old_timer_ui = """    function updateTimerUI() {
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
    }"""

new_timer_ui = """    function updateTimerUI() {
      const timerEls = document.querySelectorAll(".timer-digit");
      timerEls.forEach(el => {
        el.innerText = String(timerSeconds).padStart(2, "0");
        if (timerSeconds <= 5) {
          el.style.color = "var(--rose-600)";
        } else if (timerSeconds <= 10) {
          el.style.color = "var(--amber-600)";
        } else {
          el.style.color = "var(--text-main)";
        }
      });

      // Circular SVG timer ring animation
      const ring = document.querySelector(".timer-ring-circle");
      if (ring) {
        const circumference = 471; // 2 * pi * 75
        const maxSec = (players[lotIndex] && players[lotIndex].status === "UNSOLD" && currentPrice === players[lotIndex].basePrice) ? 30 : 20;
        const offset = circumference - (timerSeconds / maxSec) * circumference;
        ring.style.strokeDashoffset = Math.max(0, offset);
        if (timerSeconds <= 5) {
          ring.style.stroke = "var(--rose-600)";
          ring.classList.add("timer-pulse-danger");
        } else if (timerSeconds <= 10) {
          ring.style.stroke = "var(--amber-500)";
          ring.classList.remove("timer-pulse-danger");
        } else {
          ring.style.stroke = "var(--emerald-600)";
          ring.classList.remove("timer-pulse-danger");
        }
      }
    }"""

cur_text = cur_text.replace(old_timer_ui, new_timer_ui)

with open(r'B:\projects\ACC\index.html', 'w', encoding='utf-8') as f:
    f.write(cur_text)

with open(r'B:\projects\ACC\Acc-Auction-Os.html', 'w', encoding='utf-8') as f:
    f.write(cur_text)

print("Applied full visual restoration with FeralUI Pastel Atmosphere, SVG Grain, and UIverse Speeder animation!")

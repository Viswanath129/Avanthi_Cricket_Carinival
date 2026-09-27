# finalize_visual_system.py
# Combines FeralUI Pastel Atmosphere, SVG Grain, UIverse Speeder, and Circular Timer Ring

import re
from extracted_fb_styles import speeder_css, timer_ring_css, team_badges_css

with open(r'B:\projects\ACC\index.html', 'r', encoding='utf-8') as f:
    text = f.read().replace('\r\n', '\n')

# 1. Complete Style Block
full_style_block = f"""
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

      --bg-card: rgba(255, 255, 255, 0.85);
      --bg-elevated: rgba(255, 255, 255, 0.95);
      --bg-base: #F6F9FF;
      --border-subtle: rgba(15, 23, 42, 0.08);
      --border-medium: rgba(15, 23, 42, 0.15);

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

    .glass-pill {{
      background: var(--glass-bg-subtle);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-full);
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }}

    /* Header Nav */
    .app-header {{
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.85);
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

    .nav-brand {{
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      user-select: none;
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

    .btn-giant-bid:active:not(:disabled) {{
      transform: translateY(1px);
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
    }}

    .btn-giant-bid:disabled {{
      background: #E2E8F0;
      color: #94A3B8;
      border-color: transparent;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }}

    /* Scarcity Banner */
    .scarcity-banner {{
      background: linear-gradient(90deg, #FFFBEB 0%, #FEF3C7 100%);
      border: 1px solid rgba(245, 158, 11, 0.35);
      border-radius: 12px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #92400E;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 20px;
    }}

    /* Typography & Numbers */
    .display-title {{
      font-family: var(--font-display);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.08;
      color: var(--text-main);
    }}

    .sports-title {{
      font-family: var(--font-sports);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }}

    .sports-price {{
      font-family: var(--font-sports);
      font-weight: 800;
      letter-spacing: -0.01em;
      line-height: 1;
    }}

    .eyebrow {{
      font-family: var(--font-sans);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-dim);
    }}

    .tabular-nums {{
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum";
    }}

    /* Status Pills */
    .status-pill {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
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

    .pill-red {{
      background: var(--rose-50);
      color: var(--rose-600);
      border: 1px solid var(--rose-100);
    }}

    .pill-yellow {{
      background: #FEFCE8;
      color: #A16207;
      border: 1px solid #FEF08A;
    }}

    .pill-grey {{
      background: #F1F5F9;
      color: #475569;
      border: 1px solid #E2E8F0;
    }}

    /* Live Pulse Dot */
    .pulse-dot {{
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--emerald-500);
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      animation: pulse-ring 2s infinite;
    }}

    @keyframes pulse-ring {{
      0% {{ box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }}
      70% {{ box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }}
      100% {{ box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }}
    }}

    /* Form Controls */
    .form-input, .form-select, .form-textarea {{
      width: 100%;
      padding: 10px 14px;
      background: #FFFFFF;
      border: 1px solid rgba(15, 23, 42, 0.15);
      border-radius: var(--radius-sm);
      color: var(--text-main);
      font-family: var(--font-sans);
      font-size: 0.9rem;
      transition: all 0.2s ease;
      outline: none;
    }}

    .form-input:focus, .form-select:focus, .form-textarea:focus {{
      border-color: var(--emerald-600);
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.12);
    }}

    /* Toast Container */
    #toastContainer {{
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 11000;
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
      z-index: 10000;
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

    /* Speeder & Timer & Badge Injections */
    {speeder_css}

    {timer_ring_css}

    {team_badges_css}

    /* Core Utility Classes */
    .hidden {{
      display: none !important;
    }}

    .speeder-overlay.hidden {{
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }}

    /* Financial & Quota Grids */
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

    /* Fullscreen Projector Override */
    body.projector-active {{
      background-color: #0B0F19 !important;
      background-image: radial-gradient(circle at 50% 0%, #1E293B 0%, #0B0F19 80%) !important;
      color: #FFFFFF !important;
    }}
    body.projector-active .app-header {{
      display: none !important;
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

# Replace <style> block
idx_style_open = text.find('<style>')
idx_style_close = text.find('</style>')
if idx_style_open != -1 and idx_style_close != -1:
    text = text[:idx_style_open] + '<style>' + full_style_block + text[idx_style_close:]

# 2. In renderPublicView, restore luminous pastel glass hero card
old_public_hero_bg = 'background: linear-gradient(135deg, rgba(29, 45, 36, 0.7), rgba(14, 24, 19, 0.9));'
new_public_hero_bg = 'background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(246, 249, 255, 0.80)); border: 1px solid rgba(255, 255, 255, 0.95);'
text = text.replace(old_public_hero_bg, new_public_hero_bg)

old_mini_preview = '<div class="surface-card" style="padding: 24px; border-color: var(--border-medium); background: var(--bg-card);">'
new_mini_preview = '<div class="surface-card" style="padding: 24px; background: #FFFFFF; border: 1px solid rgba(255, 255, 255, 0.95); box-shadow: var(--glass-shadow);">'
text = text.replace(old_mini_preview, new_mini_preview)

# 3. In renderFloorLiveView, inject circular SVG timer ring
old_floor_timer = """              <div class="surface-card" style="padding: 16px 20px; text-align: center; border-radius: 14px; min-width: 140px;">
                <span class="eyebrow">BID TIMER</span>
                <div class="sports-price timer-digit" id="displayTimer" style="font-size: clamp(2.4rem, 4vw, 3.8rem); color: var(--text-bright);">${timerSeconds}</div>
                <div style="font-size: 11px; color: var(--text-faint);">AUTO HAMMER</div>
              </div>"""

new_floor_timer = """              <div class="surface-card" style="padding: 16px 20px; text-align: center; border-radius: 14px; min-width: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
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
                <div style="font-size: 11px; color: var(--text-faint); margin-top: 6px;">AUTO HAMMER</div>
              </div>"""

if old_floor_timer in text:
    text = text.replace(old_floor_timer, new_floor_timer)

# 4. In renderFranchiseView, inject circular SVG timer ring
old_franchise_timer = """              <div class="surface-card" style="padding: 8px 14px; text-align: center; border-radius: 10px; min-width: 88px;">
                <span class="eyebrow">TIMER</span>
                <span class="sports-price timer-digit" style="font-size: 26px; color: var(--text-bright);">${timerSeconds}s</span>
              </div>"""

new_franchise_timer = """              <div class="surface-card" style="padding: 6px 12px; text-align: center; border-radius: 10px; display: flex; align-items: center; gap: 8px;">
                <div class="timer-ring-container">
                  <svg class="timer-ring-svg" width="56" height="56">
                    <circle cx="28" cy="28" r="23" stroke="rgba(15,23,42,0.08)" stroke-width="4.5" fill="transparent"></circle>
                    <circle class="timer-ring-circle" cx="28" cy="28" r="23" stroke="#059669" stroke-width="4.5" stroke-dasharray="145" stroke-dashoffset="0" stroke-linecap="round"></circle>
                  </svg>
                  <div style="position: absolute; text-align: center;">
                    <span class="sports-price timer-digit" style="font-size: 18px; font-weight: 800; line-height: 1; color: var(--text-main);">${String(timerSeconds).padStart(2, '0')}</span>
                  </div>
                </div>
                <div style="text-align: left;">
                  <span class="eyebrow" style="font-size: 9px; display: block;">TIMER</span>
                  <span style="font-size: 10px; font-weight: 700; color: var(--text-dim);">ACTIVE</span>
                </div>
              </div>"""

if old_franchise_timer in text:
    text = text.replace(old_franchise_timer, new_franchise_timer)

# 5. In renderProjectorView, inject large 220px circular SVG timer ring
old_proj_timer = """                <div style="text-align: center;">
                  <span class="eyebrow" style="font-size: 13px;">OFFICIAL TIMER</span>
                  <div class="sports-price timer-digit" style="font-size: 52px; color: var(--text-bright); line-height: 1;">
                    ${timerSeconds}s
                  </div>
                </div>"""

new_proj_timer = """                <div style="text-align: center;">
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

if old_proj_timer in text:
    text = text.replace(old_proj_timer, new_proj_timer)

# 6. Dynamic updateTimerUI calculation
old_timer_ui_func = """    function updateTimerUI() {
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

new_timer_ui_func = """    function updateTimerUI() {
      const isProj = document.body.classList.contains("projector-active");
      const timerEls = document.querySelectorAll(".timer-digit");
      timerEls.forEach(el => {
        el.innerText = String(timerSeconds).padStart(2, "0");
        if (timerSeconds <= 5) {
          el.style.color = "var(--rose-600)";
        } else if (timerSeconds <= 10) {
          el.style.color = "var(--amber-600)";
        } else {
          el.style.color = isProj ? "#FFFFFF" : "var(--text-main)";
        }
      });

      // Animate all active circular SVG timer rings dynamically
      const circles = document.querySelectorAll(".timer-ring-circle");
      circles.forEach(circle => {
        const r = parseFloat(circle.getAttribute("r")) || 40;
        const circumference = 2 * Math.PI * r;
        const maxSec = 20;
        const offset = circumference - (timerSeconds / maxSec) * circumference;
        circle.style.strokeDashoffset = Math.max(0, offset);
        if (timerSeconds <= 5) {
          circle.style.stroke = "var(--rose-600)";
          circle.classList.add("timer-pulse-danger");
        } else if (timerSeconds <= 10) {
          circle.style.stroke = "var(--amber-500)";
          circle.classList.remove("timer-pulse-danger");
        } else {
          circle.style.stroke = isProj ? "#10B981" : "var(--emerald-600)";
          circle.classList.remove("timer-pulse-danger");
        }
      });
    }"""

text = text.replace(old_timer_ui_func, new_timer_ui_func)

# 7. Write to index.html and Acc-Auction-Os.html
with open(r'B:\projects\ACC\index.html', 'w', encoding='utf-8') as f:
    f.write(text)

with open(r'B:\projects\ACC\Acc-Auction-Os.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Applied finalize_visual_system successfully!")

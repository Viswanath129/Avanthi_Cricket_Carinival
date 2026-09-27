# build_complete_system.py - Avanthi Cricket Carnival 2026 Production-Grade Generator
import os
import json

print("Compiling ACC 2026 Portal Generator...")

# Let's create the modular parts
CSS_CONTENT = r'''
  <style>
    /* ========================================================
       ACC 2026 - PREMIUM FINTECH & SPORTS TRADING DESIGN TOKENS
       ======================================================== */
    :root {
      /* Surface & Canvas Tokens */
      --bg-deep: #050807;
      --bg-canvas: #09110D;
      --bg-surface: #0E1813;
      --bg-card: #111C16;
      --bg-card-hover: #17241D;
      --bg-card-elevated: #1D2D24;

      /* Hairline Glass & Border Tokens */
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-medium: rgba(255, 255, 255, 0.15);
      --border-focus: #19C37D;
      --border-auction: #FF8A1F;

      /* Primary Brand & Semantic Accents */
      --primary: #19C37D;          /* Green: active / legal / success / connected */
      --primary-glow: rgba(25, 195, 125, 0.22);
      --auction: #FF8A1F;          /* Orange: auction / action / bid */
      --auction-glow: rgba(255, 138, 31, 0.25);
      --warning: #FFD166;          /* Yellow: scarcity / warning / attention */
      --warning-glow: rgba(255, 209, 102, 0.22);
      --danger: #FF4D4F;           /* Red: blocked / failure / destructive */
      --danger-glow: rgba(255, 77, 79, 0.25);
      --muted: #93A59A;            /* Grey: passed / inactive / unavailable */

      /* High-Contrast Accessible Text Tokens */
      --text-bright: #F5F7F6;      /* Off-white 18:1 AAA */
      --text-body: #DCE5DF;        /* Soft-white 12:1 AAA */
      --text-dim: #93A59A;         /* Slate-mint 7:1 AAA */
      --text-faint: #6E8175;       /* Subtle meta */

      /* Typography Stacks */
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-display: 'Space Grotesk', -apple-system, sans-serif;
      --font-sports: 'Barlow Condensed', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;

      /* Shadows & Radii */
      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 20px;
      --radius-full: 9999px;
      --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.4);
      --shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.6);
      --shadow-glow-green: 0 0 24px rgba(25, 195, 125, 0.35);
      --shadow-glow-orange: 0 0 28px rgba(255, 138, 31, 0.4);
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      min-height: 100%;
      background-color: var(--bg-deep);
      color: var(--text-body);
      font-family: var(--font-sans);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      line-height: 1.5;
      overflow-x: hidden;
    }

    /* Ambient Glow Atmosphere */
    body::before {
      content: '';
      position: fixed;
      top: -20%;
      left: 10%;
      width: 80%;
      height: 60%;
      background: radial-gradient(ellipse at center, rgba(25, 195, 125, 0.08) 0%, rgba(9, 17, 13, 0) 70%);
      pointer-events: none;
      z-index: 0;
    }

    /* Tabular Numerals Utility */
    .tabular-nums {
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }

    /* Modern Scrollbars */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: var(--bg-deep);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--border-medium);
      border-radius: var(--radius-full);
    }

    /* Typography Classes */
    .display-title {
      font-family: var(--font-display);
      font-weight: 700;
      color: var(--text-bright);
      letter-spacing: -0.03em;
      line-height: 1.1;
    }

    .sports-title {
      font-family: var(--font-sports);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .sports-price {
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1;
    }

    .eyebrow {
      font-family: var(--font-sans);
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--text-dim);
    }

    /* Surface & Container Classes */
    .surface-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
    }

    .surface-card:hover {
      border-color: var(--border-medium);
      background: var(--bg-card-hover);
    }

    .surface-elevated {
      background: var(--bg-card-elevated);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 18px;
      font-family: var(--font-sans);
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
      white-space: nowrap;
    }

    .btn:active {
      transform: scale(0.98);
    }

    .btn:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .btn-primary {
      background: var(--primary);
      color: #050807;
      border-color: var(--primary);
    }

    .btn-primary:hover {
      background: #1edb8d;
      box-shadow: var(--shadow-glow-green);
    }

    .btn-auction {
      background: var(--auction);
      color: #050807;
      border-color: var(--auction);
    }

    .btn-auction:hover {
      background: #ff9b3d;
      box-shadow: var(--shadow-glow-orange);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-bright);
      border-color: var(--border-subtle);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--border-medium);
      color: #FFFFFF;
    }

    .btn-danger {
      background: rgba(255, 77, 79, 0.12);
      color: var(--danger);
      border-color: rgba(255, 77, 79, 0.3);
    }

    .btn-danger:hover {
      background: var(--danger);
      color: #FFFFFF;
    }

    /* Big Tactile Trading Bid Button */
    .btn-giant-bid {
      width: 100%;
      height: 72px;
      background: linear-gradient(135deg, #FF8A1F, #E6720A);
      color: #050807;
      border: none;
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
      box-shadow: 0 8px 24px rgba(255, 138, 31, 0.35);
      transition: all 0.15s ease-out;
    }

    .btn-giant-bid:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(255, 138, 31, 0.5);
      background: linear-gradient(135deg, #FFA043, #FF8A1F);
    }

    .btn-giant-bid:active:not(:disabled) {
      transform: scale(0.97);
    }

    .btn-giant-bid:disabled {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-faint);
      box-shadow: none;
      cursor: not-allowed;
      border: 1px solid var(--border-subtle);
    }

    /* Shake Animation for Blocked Bids */
    @keyframes bidShake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-8px); }
      40%, 80% { transform: translateX(8px); }
    }

    .shake-error {
      animation: bidShake 0.4s ease-in-out;
      border-color: var(--danger) !important;
    }

    /* Status Pills */
    .status-pill {
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
    }

    .pill-green {
      background: rgba(25, 195, 125, 0.12);
      color: var(--primary);
      border: 1px solid rgba(25, 195, 125, 0.3);
    }

    .pill-orange {
      background: rgba(255, 138, 31, 0.12);
      color: var(--auction);
      border: 1px solid rgba(255, 138, 31, 0.3);
    }

    .pill-yellow {
      background: rgba(255, 209, 102, 0.12);
      color: var(--warning);
      border: 1px solid rgba(255, 209, 102, 0.3);
    }

    .pill-red {
      background: rgba(255, 77, 79, 0.12);
      color: var(--danger);
      border: 1px solid rgba(255, 77, 79, 0.3);
    }

    .pill-grey {
      background: rgba(255, 255, 255, 0.06);
      color: var(--muted);
      border: 1px solid var(--border-subtle);
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 8px currentColor;
      animation: pulseAnim 2s infinite;
    }

    @keyframes pulseAnim {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    /* Navigation Bar */
    .app-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(5, 8, 7, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0 24px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-decoration: none;
    }

    .brand-logo-img {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-medium);
      object-fit: cover;
    }

    .brand-text-title {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.05rem;
      color: var(--text-bright);
      line-height: 1.1;
    }

    .brand-text-sub {
      font-size: 0.6875rem;
      color: var(--text-dim);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-family: var(--font-sports);
    }

    .nav-tabs {
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--bg-surface);
      padding: 4px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
    }

    .nav-tab-btn {
      background: transparent;
      color: var(--text-dim);
      border: none;
      padding: 6px 14px;
      font-size: 0.8125rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      user-select: none;
    }

    .nav-tab-btn:hover {
      color: var(--text-bright);
      background: rgba(255, 255, 255, 0.04);
    }

    .nav-tab-btn.active {
      color: var(--text-bright);
      background: var(--bg-card-elevated);
      border: 1px solid var(--border-medium);
      box-shadow: var(--shadow-sm);
    }

    .header-user-badge {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Modal Overlay */
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(5, 8, 7, 0.85);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-dialog {
      background: var(--bg-surface);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-lg);
      max-width: 580px;
      width: 100%;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      animation: modalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* Forms & Inputs */
    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      margin-bottom: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-dim);
      font-family: var(--font-sports);
    }

    .form-input, .form-select, .form-textarea {
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: var(--text-bright);
      font-family: var(--font-sans);
      font-size: 0.9375rem;
      transition: all 0.15s ease;
      outline: none;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(25, 195, 125, 0.15);
    }

    /* Scarcity Alert Banner */
    .scarcity-banner {
      background: rgba(255, 209, 102, 0.1);
      border: 1px solid rgba(255, 209, 102, 0.35);
      border-radius: var(--radius-md);
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
      animation: bannerPulse 3s infinite ease-in-out;
    }

    @keyframes bannerPulse {
      0%, 100% { border-color: rgba(255, 209, 102, 0.35); }
      50% { border-color: rgba(255, 209, 102, 0.75); }
    }

    /* Speeder overlay */
    #speederOverlay {
      position: fixed;
      inset: 0;
      background: rgba(5, 8, 7, 0.95);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    #speederOverlay.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    /* Toast Notification */
    #toastContainer {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .toast-msg {
      background: var(--bg-card-elevated);
      border: 1px solid var(--border-medium);
      color: var(--text-bright);
      padding: 12px 18px;
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-lg);
      font-size: 0.875rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
      animation: toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes toastIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Media Queries */
    @media (max-width: 900px) {
      .app-header {
        padding: 0 16px;
      }
      .nav-tabs {
        overflow-x: auto;
        max-width: 60vw;
      }
    }

    @media (max-width: 640px) {
      .app-header {
        height: auto;
        padding: 12px;
        flex-direction: column;
        gap: 10px;
      }
      .nav-tabs {
        width: 100%;
        max-width: 100%;
        overflow-x: auto;
        justify-content: flex-start;
      }
    }
  </style>
'''

print("CSS Token system defined.")

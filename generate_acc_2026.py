# generate_acc_2026.py
# Python script to generate the complete Avanthi Cricket Carnival (ACC) Player Auction Portal 2026

import os

print("Assembling ACC 2026 complete production platform...")

# We will construct the complete HTML document in logical blocks
parts = []

parts.append(r'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Avanthi Cricket Carnival — Player Auction Portal 2026</title>
  
  <!-- Typography Stacks: Inter (UI), Space Grotesk (Display), JetBrains Mono (Numbers), Barlow Condensed (Sports) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,700;1,800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:ital,wght@0,500;0,600;0,700;0,800;1,600&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">

  <style>
    /* ========================================================
       ACC 2026 - PREMIUM FINTECH & TRADING TERMINAL TOKENS
       ======================================================== */
    :root {
      /* Background Canvas Tokens */
      --bg-deep: #050807;
      --bg-canvas: #09110D;
      --bg-surface: #0E1813;
      --bg-card: #111C16;
      --bg-card-hover: #17241D;
      --bg-card-elevated: #1D2D24;

      /* Borders & Hairlines */
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-medium: rgba(255, 255, 255, 0.16);
      --border-active: #19C37D;
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

      /* Accessible Text System */
      --text-bright: #F5F7F6;      /* Off-white 18:1 AAA */
      --text-body: #DCE5DF;        /* Soft-white 12:1 AAA */
      --text-dim: #93A59A;         /* Slate-mint 7:1 AAA */
      --text-faint: #6E8175;       /* Subtle meta */

      /* Fonts */
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-display: 'Space Grotesk', -apple-system, sans-serif;
      --font-sports: 'Barlow Condensed', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;

      /* Shapes & Radii */
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

    /* Ambient Lighting Mesh */
    body::before {
      content: '';
      position: fixed;
      top: -20%;
      left: 15%;
      width: 70%;
      height: 50%;
      background: radial-gradient(ellipse at center, rgba(25, 195, 125, 0.08) 0%, rgba(9, 17, 13, 0) 70%);
      pointer-events: none;
      z-index: 0;
    }

    /* Tabular Numerals Utility */
    .tabular-nums {
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
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

    /* Giant Tactile Trading Bid Button */
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

    /* Responsive */
    @media (max-width: 900px) {
      .app-header { padding: 0 16px; }
      .nav-tabs { overflow-x: auto; max-width: 60vw; }
    }
    @media (max-width: 640px) {
      .app-header { height: auto; padding: 12px; flex-direction: column; gap: 10px; }
      .nav-tabs { width: 100%; max-width: 100%; overflow-x: auto; justify-content: flex-start; }
    }
  </style>
</head>
<body>
  <!-- Speeder Transition Overlay -->
  <div id="speederOverlay">
    <div style="width: 56px; height: 56px; border: 3px solid rgba(25, 195, 125, 0.2); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 20px;"></div>
    <div id="speederTitle" style="font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text-bright); letter-spacing: 0.05em;">INITIALIZING SYSTEM...</div>
    <div id="speederSubtitle" style="font-size: 13px; color: var(--text-dim); margin-top: 6px;">Authoritative State Sync & Firebase Bridge</div>
  </div>

  <style>
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>

  <!-- APP HEADER & NAVIGATION -->
  <header class="app-header">
    <div class="nav-brand" onclick="switchView('public')">
      <img src="acc-logo.jpg" alt="ACC Logo" class="brand-logo-img" onerror="this.src='https://via.placeholder.com/36?text=ACC'">
      <div>
        <div class="brand-text-title">AVANTHI CRICKET CARNIVAL</div>
        <div class="brand-text-sub">PLAYER AUCTION 2026 • OFFICIAL OS</div>
      </div>
    </div>

    <!-- VIEW TABS -->
    <nav class="nav-tabs" role="tablist">
      <button class="nav-tab-btn active" id="tab-public" onclick="switchView('public')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
        Public View
      </button>
      <button class="nav-tab-btn" id="tab-live" onclick="switchView('live')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>
        Live Auction
      </button>
      <button class="nav-tab-btn" id="tab-franchise" onclick="switchView('franchise')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>
        Franchise Terminal
      </button>
      <button class="nav-tab-btn" id="tab-teams" onclick="switchView('teams')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        11 Franchises
      </button>
      <button class="nav-tab-btn" id="tab-register" onclick="switchView('register')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
        Register
      </button>
      <button class="nav-tab-btn" id="tab-player" onclick="switchView('player')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        Player Portal
      </button>
      <button class="nav-tab-btn" id="tab-admin" onclick="switchView('admin')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
        Admin Console
      </button>
      <button class="nav-tab-btn" id="tab-projector" onclick="switchView('projector')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"></rect><line x1="8" x2="16" y1="21" y2="21"></line><line x1="12" x2="12" y1="17" y2="21"></line></svg>
        Projector
      </button>
    </nav>

    <!-- RIGHT SESSION CONTROLS -->
    <div class="header-user-badge">
      <div id="sessionIndicatorArea" style="display: flex; align-items: center; gap: 8px;">
        <!-- Rendered via JS -->
      </div>
      <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="openDemoSwitcherModal()">
        ⚡ Quick Role
      </button>
    </div>
  </header>

  <!-- MAIN APP CONTAINER -->
  <main id="appMain" style="max-width: 1440px; margin: 0 auto; padding: 24px 20px 80px; position: relative; z-index: 1;">
    <!-- Views dynamically rendered here -->
  </main>

  <!-- MODALS CONTAINER -->
  <div id="modalContainer"></div>

  <!-- TOAST CONTAINER -->
  <div id="toastContainer"></div>
''')

print("Base layout appended. Writing core JS logic...")

  <!-- JAVASCRIPT LOGIC ENGINE -->
  <script>
    // ========================================================
    // 1. DATA MODELS & SEED DATA
    // ========================================================
    const INITIAL_FRANCHISES = [
      { id: "titans", name: "TITANS", short: "TIT", purse: 620, bought: 11, buckets: {B1:2,B2:1,B3:2,B4:1,B5:1,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#10B981", faculty: "Dr. R. Sharma", dept: "Mechanical", mobile: "+91 98765 43210", captainMobile: "+91 98765 43211", captain: "Arjun Kumar", vc: "Karthik V", approval: "APPROVED" },
      { id: "warriors", name: "WARRIORS", short: "WAR", purse: 540, bought: 9, buckets: {B1:1,B2:2,B3:1,B4:2,B5:0,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#F59E0B", faculty: "Dr. M. Suresh", dept: "ECE", mobile: "+91 98765 43220", captainMobile: "+91 98765 43221", captain: "Rohan Reddy", vc: "Sai Kumar", approval: "APPROVED" },
      { id: "royals", name: "ROYALS", short: "ROY", purse: 410, bought: 12, buckets: {B1:2,B2:2,B3:2,B4:2,B5:0,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#E11D48", faculty: "Prof. K. Prasad", dept: "CSE", mobile: "+91 98765 43230", captainMobile: "+91 98765 43231", captain: "Nikhil Varma", vc: "Vamsi Krishna", approval: "APPROVED" },
      { id: "strikers", name: "STRIKERS", short: "STR", purse: 720, bought: 7, buckets: {B1:0,B2:1,B3:1,B4:0,B5:1,PG:0}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#0284C7", faculty: "Dr. P. Naidu", dept: "Civil", mobile: "+91 98765 43240", captainMobile: "+91 98765 43241", captain: "Harish Patel", vc: "Manoj K", approval: "APPROVED" },
      { id: "blasters", name: "BLASTERS", short: "BLA", purse: 580, bought: 10, buckets: {B1:2,B2:1,B3:2,B4:1,B5:1,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#8B5CF6", faculty: "Prof. S. Rao", dept: "IT", mobile: "+91 98765 43250", captainMobile: "+91 98765 43251", captain: "Tarun Teja", vc: "Akhil M", approval: "APPROVED" },
      { id: "mavericks", name: "MAVERICKS", short: "MAV", purse: 660, bought: 8, buckets: {B1:1,B2:1,B3:1,B4:1,B5:0,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#EA580C", faculty: "Dr. K. Venkat", dept: "EEE", mobile: "+91 98765 43260", captainMobile: "+91 98765 43261", captain: "Deepak N", vc: "Sai Teja", approval: "APPROVED" },
      { id: "knights", name: "KNIGHTS", short: "KNI", purse: 490, bought: 13, buckets: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#64748B", faculty: "Prof. B. Anand", dept: "CSM", mobile: "+91 98765 43270", captainMobile: "+91 98765 43271", captain: "Praneeth R", vc: "Ajay V", approval: "APPROVED" },
      { id: "eagles", name: "EAGLES", short: "EAG", purse: 600, bought: 9, buckets: {B1:2,B2:0,B3:2,B4:1,B5:0,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#2563EB", faculty: "Dr. C. Sekhar", dept: "CSD", mobile: "+91 98765 43280", captainMobile: "+91 98765 43281", captain: "Sandeep K", vc: "Rahul B", approval: "APPROVED" },
      { id: "panthers", name: "PANTHERS", short: "PAN", purse: 550, bought: 10, buckets: {B1:1,B2:2,B3:1,B4:2,B5:1,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#EC4899", faculty: "Prof. D. Srinivas", dept: "AID", mobile: "+91 98765 43290", captainMobile: "+91 98765 43291", captain: "Yashwanth P", vc: "Pavan T", approval: "APPROVED" },
      { id: "hawks", name: "HAWKS", short: "HAW", purse: 680, bought: 8, buckets: {B1:1,B2:1,B3:2,B4:0,B5:1,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#14B8A6", faculty: "Dr. G. Rajesh", dept: "MBA", mobile: "+91 98765 43300", captainMobile: "+91 98765 43301", captain: "Chetan M", vc: "Naveen G", approval: "APPROVED" },
      { id: "lions", name: "LIONS", short: "LIO", purse: 630, bought: 9, buckets: {B1:2,B2:1,B3:1,B4:1,B5:1,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#D97706", faculty: "Prof. V. Krishna", dept: "MCA", mobile: "+91 98765 43310", captainMobile: "+91 98765 43311", captain: "Sravan Kumar", vc: "Dileep S", approval: "APPROVED" }
    ];

    const INITIAL_PLAYERS = [
      { id: "023", scopedNum: 14, name: "ARJUN KUMAR", program: "B.Tech", branch: "ECE", year: "3rd Year", bucket: "B3", basePrice: 40, status: "UNSOLD", type: "All-Rounder", tags: ["TOP ORDER", "RIGHT ARM MED", "PACE"], stats: { matches: 28, runs: 482, wickets: 34 }, roll: "23591-A-0402", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "024", scopedNum: 15, name: "RAHUL VERMA", program: "B.Tech", branch: "CSE", year: "3rd Year", bucket: "B3", basePrice: 35, status: "UNSOLD", type: "Top-Order Batter", tags: ["AGGRESSIVE", "RIGHT HAND", "ANCHOR"], stats: { matches: 22, runs: 510, wickets: 4 }, roll: "23591-A-0518", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "025", scopedNum: 16, name: "SAI TEJA", program: "B.Tech", branch: "MECH", year: "3rd Year", bucket: "B3", basePrice: 30, status: "UNSOLD", type: "Fast Bowler", tags: ["EXPRESS", "OUT-SWING", "DEATH OVERS"], stats: { matches: 19, runs: 65, wickets: 28 }, roll: "23591-A-0329", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "026", scopedNum: 8, name: "VIGNESH RAO", program: "B.Tech", branch: "ECE", year: "4th Year", bucket: "B4", basePrice: 50, status: "UNSOLD", type: "All-Rounder", tags: ["EXPERIENCED", "SPIN", "MIDDLE ORDER"], stats: { matches: 35, runs: 620, wickets: 41 }, roll: "22591-A-0444", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "027", scopedNum: 9, name: "HARISH NAIDU", program: "B.Tech", branch: "CIVIL", year: "4th Year", bucket: "B4", basePrice: 35, status: "UNSOLD", type: "Spin Bowler", tags: ["OFF-BREAK", "ECONOMICAL"], stats: { matches: 26, runs: 88, wickets: 31 }, roll: "22591-A-0112", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "028", scopedNum: 21, name: "KIRAN KUMAR", program: "B.Tech", branch: "CSE", year: "2nd Year", bucket: "B2", basePrice: 25, status: "UNSOLD", type: "Wicket-Keeper Batter", tags: ["GLOVES", "QUICK HANDS", "FINISHER"], stats: { matches: 15, runs: 240, wickets: 0 }, roll: "24591-A-0533", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "029", scopedNum: 5, name: "MANOJ SWAMY", program: "Diploma", branch: "DME", year: "3rd Year", bucket: "B5", basePrice: 45, status: "UNSOLD", type: "Fast Bowler", tags: ["SEAM", "POWERPLAY", "YORKERS"], stats: { matches: 16, runs: 33, wickets: 19 }, roll: "25597-ME-022", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "030", scopedNum: 11, name: "SURESH BABU", program: "B.Tech", branch: "CSM", year: "1st Year", bucket: "B1", basePrice: 20, status: "UNSOLD", type: "Top-Order Batter", tags: ["CLEAN STRIKER", "POWERPLAY"], stats: { matches: 10, runs: 195, wickets: 2 }, roll: "25591-A-4210", cricHeroes: "VERIFIED", payment: "VERIFIED" },
      { id: "031", scopedNum: 3, name: "PRADEEP RAJ", program: "PG", branch: "MBA", year: "2nd Year", bucket: "PG", basePrice: 30, status: "UNSOLD", type: "All-Rounder", tags: ["LEADERSHIP", "MEDIUM SEAM"], stats: { matches: 24, runs: 380, wickets: 22 }, roll: "24591-E-0014", cricHeroes: "VERIFIED", payment: "VERIFIED" }
    ];

    // Historical Completed Sales (Supports Multi-Sale Forensic Undo)
    let salesHistory = [
      { id: "SALE-0840", lotId: "020", playerName: "Suresh Babu", playerRole: "Top-Order Batter", bucket: "B1", franchiseId: "warriors", franchiseName: "WARRIORS", price: 60, timestamp: "19:35:10", status: "COMMITTED" },
      { id: "SALE-0841", lotId: "021", playerName: "Vignesh Rao", playerRole: "All-Rounder", bucket: "B4", franchiseId: "strikers", franchiseName: "STRIKERS", price: 160, timestamp: "19:38:42", status: "COMMITTED" },
      { id: "SALE-0842", lotId: "022", playerName: "Manoj Swamy", playerRole: "Fast Bowler", bucket: "B5", franchiseId: "titans", franchiseName: "TITANS", price: 90, timestamp: "19:40:15", status: "COMMITTED" }
    ];

    // Global Authoritative State
    let currentView = 'public';
    let lotIndex = 0;
    let currentPrice = 140;
    let leadingBidderId = 'titans';
    let timerSeconds = 20;
    let auctionState = 'LIVE'; // LIVE, PAUSED, IDLE
    let passedFranchises = new Set();
    let franchises = JSON.parse(JSON.stringify(INITIAL_FRANCHISES));
    let players = JSON.parse(JSON.stringify(INITIAL_PLAYERS));
    let selectedFranchiseId = 'titans';
    let timerInterval = null;

    // Bucket sequence rule: B3 -> B4 -> B2 -> B5 -> B1 -> PG
    const BUCKET_SEQUENCE = ['B3', 'B4', 'B2', 'B5', 'B1', 'PG'];
    let activeBucketIndex = 0;
    let drawMode = 'AUTO'; // 'AUTO' or 'GUEST'
    let bucketRecallQueue = [];
    let auctionRound = 1;

    // Active User Session: PUBLIC, PLAYER, FRANCHISE, ADMIN_HANDLER, SUPER_ADMIN
    let currentUser = {
      role: 'PUBLIC',
      name: 'Public Visitor',
      title: 'Spectator',
      franchiseId: null,
      playerId: null
    };
    let franchiseLoginIdentity = 'COORDINATOR'; // 'COORDINATOR' (Primary) or 'CAPTAIN' (Secondary)

    let bidHistory = [
      { price: 80, bidder: "Strikers", t: "19:41:02" },
      { price: 100, bidder: "Titans", t: "19:41:12" },
      { price: 120, bidder: "Royals", t: "19:41:18" },
      { price: 140, bidder: "Titans", t: "19:41:26" }
    ];

    let auditLog = [
      { id: 1, time: "19:40:15", who: "SUPER ADMIN", role: "Super Admin", type: "HAMMER", msg: "Hammered LOT 022 to TITANS for 90C" },
      { id: 2, time: "19:41:02", who: "STRIKERS", role: "Franchise", type: "BID", msg: "Strikers bid 80 for LOT 023 ARJUN KUMAR" },
      { id: 3, time: "19:41:12", who: "TITANS", role: "Franchise", type: "BID", msg: "Titans bid 100 for LOT 023 ARJUN KUMAR" },
      { id: 4, time: "19:41:18", who: "ROYALS", role: "Franchise", type: "BID", msg: "Royals bid 120 for LOT 023 ARJUN KUMAR" },
      { id: 5, time: "19:41:26", who: "TITANS", role: "Franchise", type: "BID", msg: "Titans bid 140 for LOT 023 ARJUN KUMAR" }
    ];

    // ========================================================
    // 2. AUTHORITATIVE ENGINE LOGIC
    // ========================================================
    function getBidIncrement(price) {
      if (price < 100) return 10;
      if (price < 200) return 20;
      return 30;
    }

    function calculateMaxBid(f) {
      const bought = f.bought || 0;
      const unmetBuckets = Object.keys(f.needed || {}).reduce((acc, k) => {
        const need = f.needed[k] || 0;
        const got = (f.buckets && f.buckets[k]) || 0;
        return acc + Math.max(0, need - got);
      }, 0);
      const slotsToFill = Math.max(15 - bought, unmetBuckets);
      const reserve = Math.max(0, slotsToFill - 1) * 20;
      return Math.max(20, (f.purse || 0) - reserve);
    }

    function getTournamentScarcity() {
      // Check each bucket's remaining unsold players vs total unmet quota
      for (const b of BUCKET_SEQUENCE) {
        const remainingUnsold = players.filter(p => p.bucket === b && p.status === 'UNSOLD').length;
        const totalNeeded = franchises.reduce((acc, f) => {
          const got = (f.buckets && f.buckets[b]) || 0;
          const need = (f.needed && f.needed[b]) || 0;
          return acc + Math.max(0, need - got);
        }, 0);
        if (totalNeeded > 0 && remainingUnsold <= totalNeeded) {
          return { scarce: true, bucket: b, remaining: remainingUnsold, required: totalNeeded };
        }
      }
      return { scarce: false };
    }

    function showToast(msg, type = "info") {
      const container = document.getElementById("toastContainer");
      if (!container) return;
      const toast = document.createElement("div");
      toast.className = "toast-msg";
      let iconColor = type === 'error' ? 'var(--danger)' : (type === 'success' ? 'var(--primary)' : 'var(--auction)');
      toast.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background: ${iconColor}; display: inline-block;"></span> <span>${msg}</span>`;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    function showSpeeder(title, subtitle, duration = 400) {
      const overlay = document.getElementById("speederOverlay");
      const t = document.getElementById("speederTitle");
      const s = document.getElementById("speederSubtitle");
      if (t) t.innerText = title;
      if (s) s.innerText = subtitle;
      if (overlay) overlay.classList.remove("hidden");
      setTimeout(() => {
        if (overlay) overlay.classList.add("hidden");
      }, duration);
    }

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

    // ========================================================
    // 5. VIEW 1: PUBLIC PORTAL (UNAUTHENTICATED)
    // ========================================================
    let publicSearchQuery = "";
    let publicBucketFilter = "ALL";
    let publicRoleFilter = "ALL";

    function renderPublicView() {
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const scarcity = getTournamentScarcity();

      const filteredPlayers = players.filter(p => {
        if (publicSearchQuery && !p.name.toLowerCase().includes(publicSearchQuery.toLowerCase()) && !p.roll.toLowerCase().includes(publicSearchQuery.toLowerCase())) return false;
        if (publicBucketFilter !== "ALL" && p.bucket !== publicBucketFilter) return false;
        if (publicRoleFilter !== "ALL" && !p.type.includes(publicRoleFilter)) return false;
        return true;
      });

      return `
        ${scarcity.scarce ? `
          <div class="scarcity-banner">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="status-pill pill-yellow">⚠ SCARCITY ALERT</span>
              <div style="font-weight: 700; color: var(--text-bright);">
                Bucket ${scarcity.bucket}: Only ${scarcity.remaining} players remain with ${scarcity.required} required across franchises.
              </div>
            </div>
            <div style="font-size: 12px; color: var(--warning); font-weight: 600;">BIDDING REMAINS OPEN</div>
          </div>
        ` : ''}

        <!-- HERO SECTION -->
        <section class="surface-elevated" style="padding: 40px; margin-bottom: 32px; background: linear-gradient(135deg, rgba(29, 45, 36, 0.7), rgba(14, 24, 19, 0.9));">
          <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 32px; align-items: center;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                <span class="status-pill pill-green"><div class="pulse-dot"></div>ROUND 01 • B.TECH 3RD YEAR</span>
                <span class="eyebrow">AVANTHI AUDITORIUM MAIN STAGE</span>
              </div>
              <h1 class="display-title" style="font-size: clamp(2.4rem, 4.5vw, 4.2rem); margin-bottom: 12px;">
                THE AUCTION<br><span style="color: var(--primary);">IS LIVE.</span>
              </h1>
              <p style="font-size: 1.05rem; color: var(--text-dim); max-width: 540px; margin-bottom: 24px;">
                11 franchises. Hundreds of collegiate cricketers. One authoritative real-time operating system.
              </p>
              <div style="display: flex; gap: 14px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="switchView('live')">
                  WATCH LIVE AUCTION →
                </button>
                <button class="btn btn-secondary" onclick="document.getElementById('playerDirectorySec').scrollIntoView({ behavior: 'smooth' })">
                  EXPLORE PLAYERS
                </button>
              </div>
            </div>

            <!-- LIVE LOT MINI-TERMINAL PREVIEW -->
            <div class="surface-card" style="padding: 24px; border-color: var(--border-medium); background: var(--bg-card);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <span class="eyebrow" style="color: var(--auction);">ACTIVE ON FLOOR • LOT #${cur.id}</span>
                <span class="status-pill pill-orange">BUCKET ${cur.bucket}</span>
              </div>
              <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px;">
                <div style="width: 64px; height: 64px; border-radius: 12px; background: rgba(255,255,255,0.06); display: grid; place-items: center; font-size: 24px; border: 1px solid var(--border-subtle);">
                  🏏
                </div>
                <div>
                  <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright);">${cur.name}</div>
                  <div style="font-size: 12px; color: var(--text-dim);">${cur.type} • ${cur.program} ${cur.branch}</div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
                <div>
                  <span class="eyebrow">CURRENT BID</span>
                  <div class="sports-price" style="font-size: 28px; color: var(--auction);">${currentPrice} C</div>
                </div>
                <div>
                  <span class="eyebrow">LEADING TEAM</span>
                  <div style="font-weight: 800; font-size: 18px; color: var(--text-bright);">${leader ? leader.name : "None"}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- PUBLIC PLAYERS DIRECTORY -->
        <section id="playerDirectorySec" style="margin-bottom: 48px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 14px;">
            <div>
              <span class="eyebrow" style="color: var(--primary);">PHASE 1 PUBLIC ACCESS</span>
              <h2 class="display-title" style="font-size: 28px;">REGISTERED PLAYER ROSTER</h2>
              <div style="font-size: 13px; color: var(--text-dim);">Confidential phone numbers are omitted per privacy policy.</div>
            </div>

            <!-- SEARCH & FILTERS -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <input type="text" class="form-input" style="width: 220px;" placeholder="Search name or roll..." value="${publicSearchQuery}" oninput="publicSearchQuery = this.value; renderCurrentView();">
              <select class="form-select" style="width: 140px;" onchange="publicBucketFilter = this.value; renderCurrentView();">
                <option value="ALL">All Buckets</option>
                <option value="B3" ${publicBucketFilter === 'B3' ? 'selected' : ''}>B3 (3rd Yr)</option>
                <option value="B4" ${publicBucketFilter === 'B4' ? 'selected' : ''}>B4 (4th Yr)</option>
                <option value="B2" ${publicBucketFilter === 'B2' ? 'selected' : ''}>B2 (2nd Yr)</option>
                <option value="B5" ${publicBucketFilter === 'B5' ? 'selected' : ''}>B5 (Diploma)</option>
                <option value="B1" ${publicBucketFilter === 'B1' ? 'selected' : ''}>B1 (1st Yr)</option>
                <option value="PG" ${publicBucketFilter === 'PG' ? 'selected' : ''}>PG (Masters)</option>
              </select>
              <select class="form-select" style="width: 140px;" onchange="publicRoleFilter = this.value; renderCurrentView();">
                <option value="ALL">All Roles</option>
                <option value="Batter" ${publicRoleFilter === 'Batter' ? 'selected' : ''}>Batter</option>
                <option value="Bowler" ${publicRoleFilter === 'Bowler' ? 'selected' : ''}>Bowler</option>
                <option value="All-Rounder" ${publicRoleFilter === 'All-Rounder' ? 'selected' : ''}>All-Rounder</option>
                <option value="Keeper" ${publicRoleFilter === 'Keeper' ? 'selected' : ''}>Wicket-Keeper</option>
              </select>
            </div>
          </div>

          <!-- PLAYERS GRID -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
            ${filteredPlayers.map(p => `
              <div class="surface-card" style="padding: 18px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                  <span class="status-pill ${p.status === 'SOLD' ? 'pill-green' : (p.status === 'SKIPPED' ? 'pill-yellow' : 'pill-grey')}">${p.status}</span>
                  <span class="eyebrow" style="color: var(--primary);">BUCKET ${p.bucket}</span>
                </div>
                <div style="font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text-bright);">${p.name}</div>
                <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 12px;">${p.type} • ${p.program} ${p.branch} • ${p.year}</div>
                
                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 8px 12px; font-size: 11px; margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-dim);">Roll No:</span>
                    <strong style="font-family: var(--font-mono); color: var(--text-bright);">${p.roll}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                    <span style="color: var(--text-dim);">CricHeroes:</span>
                    <strong style="color: var(--primary);">${p.cricHeroes} (${p.stats.runs} R, ${p.stats.wickets} W)</strong>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
                  <span class="eyebrow">BASE PRICE</span>
                  <span class="sports-price" style="font-size: 18px; color: var(--auction);">${p.basePrice} CREDITS</span>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }

    // ========================================================
    // 6. VIEW 2: UNIFIED FINTECH AUTHENTICATION (/login)
    // ========================================================
    let loginSelectedRole = 'FRANCHISE'; // 'FRANCHISE', 'PLAYER', 'STAFF'
    let loginFranchiseId = 'titans';
    let loginFranchiseIdentity = 'COORDINATOR'; // 'COORDINATOR' or 'CAPTAIN'
    let loginStaffType = 'SUPER_ADMIN'; // 'SUPER_ADMIN' or 'ADMIN_HANDLER'
    let loginOtpSent = false;
    let loginVerifying = false;

    function renderLoginView() {
      const f = franchises.find(x => x.id === loginFranchiseId) || franchises[0];
      const cur = players[lotIndex] || players[0];

      return `
        <div style="min-height: 80vh; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; padding: 20px 0;">
          <!-- LEFT BRAND IDENTITY -->
          <div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
              <img src="acc-logo.jpg" alt="Logo" style="width: 44px; height: 44px; border-radius: 10px; border: 1px solid var(--border-medium);">
              <div>
                <span class="eyebrow" style="color: var(--primary);">OFFICIAL OPERATING PLATFORM</span>
                <div style="font-family: var(--font-display); font-size: 15px; font-weight: 800; color: var(--text-bright);">AVANTHI CRICKET CARNIVAL 2026</div>
              </div>
            </div>

            <h1 class="display-title" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 16px;">
              ACC PLAYER<br><span style="color: var(--primary);">AUCTION 2026</span>
            </h1>

            <p style="font-size: 1.1rem; color: var(--text-dim); line-height: 1.6; margin-bottom: 32px; max-width: 480px;">
              The official mission-critical terminal for student registration, 11-team squad composition, and real-time live player bidding.
            </p>

            <!-- LIVE STATUS TICKER -->
            <div class="surface-card" style="padding: 16px 20px; max-width: 440px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span class="status-pill pill-green"><div class="pulse-dot"></div>SYSTEM ONLINE</span>
                <span class="eyebrow">LOT #${cur.id} ON FLOOR</span>
              </div>
              <div style="font-size: 13px; color: var(--text-bright); font-weight: 600;">
                ${cur.name} • Current Bid: <span style="color: var(--auction);">${currentPrice}C</span>
              </div>
            </div>
          </div>

          <!-- RIGHT AUTHENTICATION CARD -->
          <div class="surface-elevated" style="padding: 36px; max-width: 480px; width: 100%;">
            <div style="margin-bottom: 24px;">
              <span class="eyebrow" style="color: var(--primary);">AUTHORITATIVE ACCESS</span>
              <h2 class="display-title" style="font-size: 24px; margin-top: 2px;">SIGN IN TO ACC</h2>
              <div style="font-size: 13px; color: var(--text-dim); margin-top: 4px;">Choose your authorized role to enter the portal.</div>
            </div>

            <!-- ROLE SELECTOR TABS -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 24px;">
              <button class="btn ${loginSelectedRole === 'FRANCHISE' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 12px; padding: 10px 4px;" onclick="loginSelectedRole = 'FRANCHISE'; loginOtpSent = false; renderCurrentView();">
                FRANCHISE
              </button>
              <button class="btn ${loginSelectedRole === 'PLAYER' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 12px; padding: 10px 4px;" onclick="loginSelectedRole = 'PLAYER'; loginOtpSent = false; renderCurrentView();">
                PLAYER
              </button>
              <button class="btn ${loginSelectedRole === 'STAFF' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 12px; padding: 10px 4px;" onclick="loginSelectedRole = 'STAFF'; loginOtpSent = false; renderCurrentView();">
                STAFF
              </button>
            </div>

            <!-- FRANCHISE FORM -->
            ${loginSelectedRole === 'FRANCHISE' ? `
              <div class="form-group">
                <label class="form-label">SELECT FRANCHISE</label>
                <select class="form-select" onchange="loginFranchiseId = this.value; renderCurrentView();">
                  ${franchises.map(x => `<option value="${x.id}" ${x.id === loginFranchiseId ? 'selected' : ''}>${x.name} (${x.faculty})</option>`).join('')}
                </select>
              </div>

              <!-- DUAL LOGIN IDENTITIES: COORDINATOR VS CAPTAIN -->
              <div class="form-group" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px;">
                <label class="form-label">AUTHORIZED FRANCHISE LOGIN IDENTITY</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
                  <button class="btn ${loginFranchiseIdentity === 'COORDINATOR' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 11px; padding: 8px;" onclick="loginFranchiseIdentity = 'COORDINATOR'; renderCurrentView();">
                    Coordinator (Primary)
                  </button>
                  <button class="btn ${loginFranchiseIdentity === 'CAPTAIN' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 11px; padding: 8px;" onclick="loginFranchiseIdentity = 'CAPTAIN'; renderCurrentView();">
                    Captain (Secondary)
                  </button>
                </div>
                <div style="font-size: 11px; color: var(--text-dim); margin-top: 8px;">
                  ${loginFranchiseIdentity === 'COORDINATOR' ? `Registered Mobile: <strong>${f.mobile}</strong> (Dr. R. Sharma)` : `Authorized Captain Mobile: <strong>${f.captainMobile}</strong> (Arjun Kumar)`}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">MOBILE NUMBER</label>
                <input type="tel" class="form-input" value="${loginFranchiseIdentity === 'COORDINATOR' ? f.mobile : f.captainMobile}">
              </div>
            ` : ''}

            <!-- PLAYER FORM -->
            ${loginSelectedRole === 'PLAYER' ? `
              <div class="form-group">
                <label class="form-label">STUDENT ROLL NUMBER</label>
                <input type="text" class="form-input" placeholder="e.g. 23591-A-0402" value="23591-A-0402">
              </div>
              <div class="form-group">
                <label class="form-label">CONFIDENTIAL REGISTERED MOBILE</label>
                <input type="tel" class="form-input" placeholder="+91 98480 12345" value="+91 98480 12345">
              </div>
            ` : ''}

            <!-- STAFF FORM -->
            ${loginSelectedRole === 'STAFF' ? `
              <div class="form-group">
                <label class="form-label">STAFF ACCESS LEVEL</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
                  <button class="btn ${loginStaffType === 'SUPER_ADMIN' ? 'btn-auction' : 'btn-secondary'}" style="font-size: 11px; padding: 8px;" onclick="loginStaffType = 'SUPER_ADMIN'; renderCurrentView();">
                    Super Admin (Director)
                  </button>
                  <button class="btn ${loginStaffType === 'ADMIN_HANDLER' ? 'btn-auction' : 'btn-secondary'}" style="font-size: 11px; padding: 8px;" onclick="loginStaffType = 'ADMIN_HANDLER'; renderCurrentView();">
                    Auction Handler
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">SECURE ACCESS PASSKEY</label>
                <input type="password" class="form-input" value="••••••••••••">
              </div>
            ` : ''}

            <!-- OTP FLOW OR AUTHENTICATE -->
            ${!loginOtpSent ? `
              <button class="btn btn-primary" style="width: 100%; height: 46px; font-size: 15px; margin-top: 8px;" onclick="loginOtpSent = true; renderCurrentView();">
                SEND ONE-TIME PASSCODE (OTP)
              </button>
            ` : `
              <div style="background: rgba(25, 195, 125, 0.08); border: 1px solid rgba(25, 195, 125, 0.3); border-radius: 10px; padding: 14px; margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span class="eyebrow" style="color: var(--primary);">OTP DISPATCHED</span>
                  <span style="font-family: var(--font-mono); font-size: 12px; color: var(--text-dim);">01:59</span>
                </div>
                <div class="form-group" style="margin-bottom: 8px;">
                  <input type="text" class="form-input" id="otpBoxInput" placeholder="Enter 4-digit code" value="2026" style="letter-spacing: 0.3em; text-align: center; font-size: 20px; font-family: var(--font-mono);">
                </div>
                <div style="font-size: 11px; color: var(--text-dim); text-align: center;">Demo OTP prefilled: <strong>2026</strong></div>
              </div>

              <button class="btn btn-primary" style="width: 100%; height: 46px; font-size: 15px;" onclick="executeFintechLogin()">
                VERIFY & ENTER TERMINAL →
              </button>
            `}

            <!-- PUBLIC LINK -->
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; color: var(--text-dim);">Public Spectator?</span>
              <a href="javascript:void(0)" onclick="signOutUser()" style="font-size: 12px; color: var(--primary); font-weight: 600; text-decoration: none;">
                Continue as Public Viewer →
              </a>
            </div>
          </div>
        </div>
      `;
    }

    function executeFintechLogin() {
      showSpeeder("VERIFYING YOUR CREDENTIALS...", "Checking authoritative event registry", 600);
      setTimeout(() => {
        if (loginSelectedRole === 'FRANCHISE') {
          const f = franchises.find(x => x.id === loginFranchiseId);
          currentUser = {
            role: 'FRANCHISE',
            name: `${f.name} (${loginFranchiseIdentity === 'COORDINATOR' ? 'Coordinator' : 'Captain'})`,
            title: loginFranchiseIdentity === 'COORDINATOR' ? 'Faculty Coordinator' : 'Team Captain',
            franchiseId: f.id
          };
          franchiseLoginIdentity = loginFranchiseIdentity;
          showToast(`AUTHENTICATED AS: ${f.name} (${franchiseLoginIdentity})`, "success");
          switchView('franchise');
        } else if (loginSelectedRole === 'PLAYER') {
          currentUser = {
            role: 'PLAYER',
            name: 'Arjun Kumar',
            title: 'Registered Student Player',
            playerId: '023'
          };
          showToast("AUTHENTICATED AS: Arjun Kumar (Player)", "success");
          switchView('player');
        } else if (loginSelectedRole === 'STAFF') {
          if (loginStaffType === 'SUPER_ADMIN') {
            currentUser = { role: 'SUPER_ADMIN', name: 'Tournament Director', title: 'Super Admin' };
            showToast("AUTHENTICATED: SUPER ADMIN CONSOLE", "success");
          } else {
            currentUser = { role: 'ADMIN_HANDLER', name: 'Floor Auctioneer', title: 'Auction Handler' };
            showToast("AUTHENTICATED: AUCTION HANDLER", "success");
          }
          switchView('admin');
        }
      }, 650);
    }

    // ========================================================
    // 7. VIEW 3: LIVE AUCTION FLOOR (SPECTATOR / BROADCAST)
    // ========================================================
    function renderLiveAuctionView() {
      const cur = players[lotIndex] || players[0];
      const inc = getBidIncrement(currentPrice);
      const nextBid = currentPrice + inc;
      const leader = franchises.find(f => f.id === leadingBidderId);
      const scarcity = getTournamentScarcity();

      return `
        ${scarcity.scarce ? `
          <div class="scarcity-banner">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="status-pill pill-yellow">⚠ TOURNAMENT SCARCITY</span>
              <div style="font-weight: 700; color: var(--text-bright);">
                Bucket ${scarcity.bucket}: Only ${scarcity.remaining} players remain with ${scarcity.required} required across franchises.
              </div>
            </div>
            <div style="font-size: 12px; color: var(--warning); font-weight: 600;">BIDDING REMAINS OPEN</div>
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 24px; margin-bottom: 24px;">
          <!-- MAIN PLAYER AUCTION STAGE -->
          <div class="surface-elevated" style="padding: 32px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="status-pill pill-green"><div class="pulse-dot"></div>${auctionState}</span>
                <span class="eyebrow" style="color: var(--text-dim);">LOT #${cur.id} • SCOPED DRAW #${cur.scopedNum}</span>
              </div>
              <span class="status-pill pill-orange">BUCKET ${cur.bucket}</span>
            </div>

            <!-- PLAYER DETAILS HERO -->
            <div style="display: grid; grid-template-columns: 140px 1fr; gap: 24px; align-items: center; margin-bottom: 28px;">
              <div style="width: 140px; height: 160px; border-radius: 14px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-medium); display: grid; place-items: center; font-size: 48px;">
                🏏
              </div>
              <div>
                <h1 class="display-title" style="font-size: clamp(2rem, 3.5vw, 3rem);">${cur.name}</h1>
                <div style="font-size: 14px; color: var(--text-dim); margin-top: 4px;">
                  <strong style="color: var(--primary);">${cur.type}</strong> • ${cur.program} ${cur.branch} • ${cur.year}
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;">
                  ${cur.tags.map(t => `<span class="status-pill pill-grey" style="font-size: 10px;">${t}</span>`).join('')}
                </div>
              </div>
            </div>

            <!-- LIVE BIDDING METRICS STRIP -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 0.8fr; gap: 16px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
              <div>
                <span class="eyebrow">CURRENT BID</span>
                <div class="sports-price" style="font-size: clamp(2.4rem, 4vw, 3.8rem); color: var(--auction);">${currentPrice} <span style="font-size: 18px; color: var(--text-dim);">C</span></div>
                <div style="font-size: 11px; color: var(--text-faint); margin-top: 2px;">BASE: ${cur.basePrice}C • INC: +${inc}C</div>
              </div>
              <div>
                <span class="eyebrow">LEADING BIDDER</span>
                <div style="font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--text-bright); margin-top: 4px;">
                  ${leader ? leader.name : "No Bids Placed"}
                </div>
                <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">
                  ${leader ? `Remaining Purse: ${leader.purse - currentPrice}C` : "Awaiting opening paddle"}
                </div>
              </div>
              <div style="text-align: right;">
                <span class="eyebrow">BID TIMER</span>
                <div class="sports-price timer-digit" id="displayTimer" style="font-size: clamp(2.4rem, 4vw, 3.8rem); color: var(--text-bright);">${timerSeconds}</div>
                <div style="font-size: 11px; color: var(--text-faint);">AUTHORITATIVE CLOCK</div>
              </div>
            </div>

            <!-- CONTROLS FOR OPERATOR / FAST TEST -->
            <div style="display: flex; gap: 12px; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 20px;">
              <div style="display: flex; gap: 10px;">
                <button class="btn btn-secondary" onclick="toggleAuctionPause()">
                  ${auctionState === 'LIVE' ? '⏸ PAUSE' : '▶ RESUME'}
                </button>
                <button class="btn btn-secondary" onclick="skipPlayer()">
                  ⏭ SKIP (RECALL)
                </button>
              </div>

              ${currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN_HANDLER' ? `
                <button class="btn btn-auction" style="font-size: 14px; padding: 10px 20px;" onclick="openHammerConfirmModal()">
                  🔨 CONFIRM HAMMER (SALE)
                </button>
              ` : `
                <button class="btn btn-primary" onclick="switchView('franchise')">
                  OPEN FRANCHISE BID TERMINAL →
                </button>
              `}
            </div>
          </div>

          <!-- RIGHT BID STREAM & TEAMS -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- REALTIME BIDS LEDGER -->
            <div class="surface-card" style="padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <span class="eyebrow" style="color: var(--primary);">LIVE BID STREAM</span>
                <span class="status-pill pill-grey">${bidHistory.length} BIDS</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${bidHistory.map((b, i) => `
                  <div style="display: flex; justify-content: space-between; align-items: center; background: ${i === 0 ? 'rgba(255, 138, 31, 0.12)' : 'rgba(255,255,255,0.02)'}; border: 1px solid ${i === 0 ? 'rgba(255, 138, 31, 0.3)' : 'var(--border-subtle)'}; border-radius: 8px; padding: 10px 14px;">
                    <div>
                      <strong style="color: var(--text-bright);">${b.bidder}</strong>
                      <span style="font-size: 11px; color: var(--text-faint); margin-left: 6px;">${b.t}</span>
                    </div>
                    <div class="sports-price" style="font-size: 18px; color: ${i === 0 ? 'var(--auction)' : 'var(--text-dim)'};">${b.price} C</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- FAST SIMULATE OTHER BIDDERS -->
            <div class="surface-card" style="padding: 16px;">
              <span class="eyebrow" style="color: var(--text-dim); display: block; margin-bottom: 8px;">SIMULATE FLOOR BID</span>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
                ${franchises.slice(0, 8).map(x => `
                  <button class="btn btn-secondary" style="font-size: 11px; padding: 6px;" onclick="placeBid('${x.id}')">
                    ${x.short}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- 11 TEAMS FLOOR STATUS GRID -->
        <section class="surface-card" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <span class="eyebrow" style="color: var(--primary);">11 FRANCHISES FLOOR STATUS</span>
            <span style="font-size: 12px; color: var(--text-dim);">Live Bid Eligibility & Passed Status</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
            ${franchises.map(f => {
              const maxLegal = calculateMaxBid(f);
              const isLead = f.id === leadingBidderId;
              const hasPassed = passedFranchises.has(f.id);
              const isBlocked = nextBid > maxLegal;

              let statusLabel = isLead ? "LEAD" : (hasPassed ? "PASSED" : (isBlocked ? "BLOCKED" : "IN PLAY"));
              let statusClass = isLead ? "pill-orange" : (hasPassed ? "pill-grey" : (isBlocked ? "pill-red" : "pill-green"));

              return `
                <div style="background: rgba(255,255,255,0.02); border: 1px solid ${isLead ? 'var(--auction)' : 'var(--border-subtle)'}; border-radius: 10px; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong style="color: var(--text-bright);">${f.name}</strong>
                    <span class="status-pill ${statusClass}" style="font-size: 9px; padding: 2px 6px;">${statusLabel}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim);">
                    <span>Purse: <strong style="color: var(--text-bright);">${f.purse}C</strong></span>
                    <span>Max: <strong style="color: var(--primary);">${maxLegal}C</strong></span>
                  </div>
                  <div style="font-size: 10px; color: var(--text-faint); margin-top: 4px;">
                    Squad: ${f.bought}/17 • Bucket ${cur.bucket}: ${f.buckets[cur.bucket] || 0}/${f.needed[cur.bucket] || 2}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      `;
    }

    // ========================================================
    // 8. VIEW 4: FRANCHISE TRADING TERMINAL (MOBILE-FIRST)
    // ========================================================
    function renderFranchiseTerminalView() {
      const f = franchises.find(x => x.id === selectedFranchiseId) || franchises[0];
      const cur = players[lotIndex] || players[0];
      const inc = getBidIncrement(currentPrice);
      const nextPrice = currentPrice + inc;
      const maxLegal = calculateMaxBid(f);
      const isLead = f.id === leadingBidderId;
      const hasPassed = passedFranchises.has(f.id);
      const isBlocked = nextPrice > maxLegal;
      const scarcity = getTournamentScarcity();

      return `
        <div style="max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
          <!-- FRANCHISE IDENTITY & CONNECTION BAR -->
          <div class="surface-card" style="padding: 16px 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(25, 195, 125, 0.15); color: var(--primary); display: grid; place-items: center; font-weight: 800; font-family: var(--font-sports);">
                  ${f.short}
                </div>
                <div>
                  <div style="font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text-bright);">${f.name}</div>
                  <div style="font-size: 11px; color: var(--text-dim);">
                    Signed in as <strong>${franchiseLoginIdentity === 'COORDINATOR' ? 'FACULTY COORDINATOR' : 'CAPTAIN'}</strong>
                  </div>
                </div>
              </div>

              <!-- DUAL LOGIN IDENTITY QUICK TOGGLE -->
              <div style="display: flex; gap: 6px;">
                <button class="btn ${franchiseLoginIdentity === 'COORDINATOR' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 10px; padding: 4px 8px;" onclick="franchiseLoginIdentity = 'COORDINATOR'; showToast('Switched to Faculty Coordinator view', 'info'); renderCurrentView();">
                  Coordinator
                </button>
                <button class="btn ${franchiseLoginIdentity === 'CAPTAIN' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 10px; padding: 4px 8px;" onclick="franchiseLoginIdentity = 'CAPTAIN'; showToast('Switched to Captain bidding view', 'info'); renderCurrentView();">
                  Captain
                </button>
              </div>
            </div>

            <!-- TEAM SWITCHER FOR DEMO EVALUATION -->
            <div style="display: flex; align-items: center; gap: 8px; border-top: 1px solid var(--border-subtle); padding-top: 10px; font-size: 11px;">
              <span style="color: var(--text-faint);">Switch Team:</span>
              <select class="form-select" style="padding: 4px 8px; font-size: 11px; height: 28px;" onchange="selectedFranchiseId = this.value; renderCurrentView();">
                ${franchises.map(x => `<option value="${x.id}" ${x.id === selectedFranchiseId ? 'selected' : ''}>${x.name}</option>`).join('')}
              </select>
              <span class="status-pill pill-green" style="margin-left: auto; font-size: 9px;"><div class="pulse-dot"></div>CONNECTED</span>
            </div>
          </div>

          <!-- FINANCIAL CAPABILITIES METRICS -->
          <div class="surface-elevated" style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 12px 6px;">
              <span class="eyebrow">REMAINING PURSE</span>
              <div class="sports-price" style="font-size: 26px; color: var(--primary); margin-top: 2px;">${f.purse} <span style="font-size: 12px;">C</span></div>
            </div>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 12px 6px;">
              <span class="eyebrow" style="color: var(--auction);">MAX LEGAL BID</span>
              <div class="sports-price" style="font-size: 26px; color: var(--auction); margin-top: 2px;">${maxLegal} <span style="font-size: 12px;">C</span></div>
            </div>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 12px 6px;">
              <span class="eyebrow">SQUAD SIZE</span>
              <div class="sports-price" style="font-size: 26px; color: var(--text-bright); margin-top: 2px;">${f.bought} <span style="font-size: 12px; color: var(--text-dim);">/ 17</span></div>
            </div>
          </div>

          <!-- BUCKET REQUIREMENTS MINI-GRID -->
          <div class="surface-card" style="padding: 16px;">
            <span class="eyebrow" style="color: var(--text-dim); display: block; margin-bottom: 8px;">MANDATORY BUCKET QUOTAS</span>
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; text-align: center;">
              ${['B1', 'B2', 'B3', 'B4', 'B5', 'PG'].map(b => {
                const got = (f.buckets && f.buckets[b]) || 0;
                const need = (f.needed && f.needed[b]) || 2;
                const done = got >= need;
                return `
                  <div style="background: ${done ? 'rgba(25, 195, 125, 0.1)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${done ? 'rgba(25, 195, 125, 0.3)' : 'var(--border-subtle)'}; border-radius: 8px; padding: 6px 2px;">
                    <div style="font-size: 10px; font-weight: 700; color: ${done ? 'var(--primary)' : 'var(--text-dim)'};">${b}</div>
                    <div style="font-size: 12px; font-weight: 800; font-family: var(--font-mono);">${got}/${need}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- ACTIVE LOT CARD -->
          <div class="surface-elevated" style="padding: 24px; border-color: ${isLead ? 'var(--auction)' : 'var(--border-medium)'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <span class="status-pill pill-orange">LOT #${cur.id} • BUCKET ${cur.bucket}</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="eyebrow">TIMER</span>
                <span class="sports-price timer-digit" style="font-size: 26px; color: var(--text-bright);">${timerSeconds}s</span>
              </div>
            </div>

            <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 20px;">
              <div style="width: 60px; height: 60px; border-radius: 12px; background: rgba(255,255,255,0.05); display: grid; place-items: center; font-size: 28px;">🏏</div>
              <div>
                <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--text-bright);">${cur.name}</h2>
                <div style="font-size: 12px; color: var(--text-dim);">${cur.type} • ${cur.program} ${cur.branch}</div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: rgba(0,0,0,0.3); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
              <div>
                <span class="eyebrow">CURRENT PRICE</span>
                <div class="sports-price" style="font-size: 32px; color: var(--auction);">${currentPrice} C</div>
              </div>
              <div>
                <span class="eyebrow">HIGH BIDDER</span>
                <div style="font-weight: 800; font-size: 18px; color: ${isLead ? 'var(--primary)' : 'var(--text-bright)'}; margin-top: 4px;">
                  ${isLead ? "★ YOU LEAD" : (franchises.find(x => x.id === leadingBidderId)?.name || "None")}
                </div>
              </div>
            </div>

            <!-- PRIMARY ONE-HANDED MOBILE BID ACTION -->
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <button id="franchiseBidBtn" class="btn-giant-bid" ${isBlocked || isLead ? 'disabled' : ''} onclick="placeBid('${f.id}')">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                ${isLead ? 'YOU ARE HIGHEST BIDDER' : (isBlocked ? `BLOCKED (MAX ${maxLegal}C)` : `BID ${nextPrice} CREDITS`)}
              </button>

              <!-- REVERSIBLE PASS / RE-ENTER TOGGLE -->
              ${!hasPassed ? `
                <button class="btn btn-secondary" style="height: 48px; font-size: 14px; font-weight: 700;" onclick="passLot('${f.id}')">
                  — PASS ON LOT #${cur.id}
                </button>
              ` : `
                <button class="btn btn-primary" style="height: 48px; font-size: 14px; font-weight: 700;" onclick="reEnterLot('${f.id}')">
                  ✓ RE-ENTER AUCTION (IN PLAY)
                </button>
              `}
            </div>

            ${hasPassed ? `
              <div style="text-align: center; margin-top: 10px; font-size: 11px; color: var(--warning);">
                Franchise status: <strong>PASSED</strong>. You can re-enter at any point prior to hammer.
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // ========================================================
    // 9. VIEW 5: 11 FRANCHISES DOSSIERS & SQUADS
    // ========================================================
    function render11FranchisesView() {
      return `
        <div style="margin-bottom: 32px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
            <div>
              <span class="eyebrow" style="color: var(--primary);">OFFICIAL EVENT REGISTRY</span>
              <h1 class="display-title" style="font-size: 32px;">11 PARTICIPATING FRANCHISES</h1>
              <div style="font-size: 13px; color: var(--text-dim);">Dossiers, Faculty Coordinators, Captains, and Authorized Squads.</div>
            </div>
            <button class="btn btn-primary" onclick="switchView('franchise')">
              ENTER FRANCHISE TERMINAL →
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px;">
            ${franchises.map(f => {
              const maxLegal = calculateMaxBid(f);
              const isUserTeam = currentUser.franchiseId === f.id;

              return `
                <div class="surface-card" style="padding: 24px; border-color: ${isUserTeam ? 'var(--primary)' : 'var(--border-subtle)'};">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(255,255,255,0.06); color: ${f.color}; display: grid; place-items: center; font-size: 18px; font-weight: 800; font-family: var(--font-sports); border: 1px solid var(--border-medium);">
                        ${f.short}
                      </div>
                      <div>
                        <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright);">${f.name}</div>
                        <span class="status-pill pill-green" style="font-size: 9px; padding: 2px 6px;">${f.approval}</span>
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <span class="eyebrow">PURSE</span>
                      <div class="sports-price" style="font-size: 20px; color: var(--primary);">${f.purse}C</div>
                    </div>
                  </div>

                  <!-- FACULTY COORDINATOR INFO (PHONE PRIVACY PROTECTED) -->
                  <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px; margin-bottom: 14px; font-size: 12px;">
                    <div style="color: var(--text-dim); margin-bottom: 2px;">Faculty Coordinator (Primary Login):</div>
                    <div style="font-weight: 700; color: var(--text-bright);">${f.faculty} • Dept. of ${f.dept}</div>
                    <div style="margin-top: 4px; color: var(--text-faint);">
                      Mobile: ${isUserTeam || currentUser.role === 'SUPER_ADMIN' ? `<strong style="color: var(--primary);">${f.mobile}</strong>` : '🔒 Private (Authorized only)'}
                    </div>
                  </div>

                  <!-- CAPTAIN & VC INFO -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; font-size: 12px;">
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px;">
                      <span class="eyebrow" style="font-size: 9px;">CAPTAIN (LOGIN 2)</span>
                      <div style="font-weight: 800; color: var(--text-bright); margin-top: 2px;">${f.captain}</div>
                      <div style="font-size: 10px; color: var(--text-faint); margin-top: 2px;">
                        ${isUserTeam || currentUser.role === 'SUPER_ADMIN' ? f.captainMobile : '🔒 Private'}
                      </div>
                    </div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px;">
                      <span class="eyebrow" style="font-size: 9px;">VICE-CAPTAIN</span>
                      <div style="font-weight: 800; color: var(--text-bright); margin-top: 2px;">${f.vc}</div>
                      <div style="font-size: 10px; color: var(--primary); margin-top: 2px;">0C (Pre-retained)</div>
                    </div>
                  </div>

                  <!-- METRICS SUMMARY -->
                  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 12px; font-size: 12px;">
                    <span style="color: var(--text-dim);">Squad Fill: <strong>${f.bought}/17</strong></span>
                    <span style="color: var(--text-dim);">Max Legal Bid: <strong style="color: var(--auction);">${maxLegal}C</strong></span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // ========================================================
    // 10. VIEW 6: PLAYER PORTAL (/player)
    // ========================================================
    let playerJerseyName = "ARJUN";
    let playerJerseySize = "L";
    let playerPreferredSlot = "Top Order (1-3)";

    function renderPlayerPortalView() {
      const p = players.find(x => x.id === "023") || players[0];

      return `
        <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
          <!-- PORTAL HEADER -->
          <div class="surface-elevated" style="padding: 28px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
              <div>
                <span class="eyebrow" style="color: var(--primary);">STUDENT ATHLETE ACCESS</span>
                <h1 class="display-title" style="font-size: 28px;">PLAYER OPERATING PORTAL</h1>
                <div style="font-size: 13px; color: var(--text-dim);">Manage your profile, CricHeroes records, and auction verification status.</div>
              </div>
              <span class="status-pill pill-green"><div class="pulse-dot"></div>PROFILE 92% COMPLETE</span>
            </div>

            <!-- KEY VERIFICATION BADGES STRIP -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; border-top: 1px solid var(--border-subtle); padding-top: 18px;">
              <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 10px; text-align: center;">
                <span class="eyebrow">CRICHEROES</span>
                <div style="font-weight: 800; color: var(--primary); margin-top: 2px;">✓ VERIFIED</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 10px; text-align: center;">
                <span class="eyebrow">REGISTRATION FEE</span>
                <div style="font-weight: 800; color: var(--primary); margin-top: 2px;">✓ PAID (₹500)</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 10px; text-align: center;">
                <span class="eyebrow">AUCTION ELIGIBILITY</span>
                <div style="font-weight: 800; color: var(--primary); margin-top: 2px;">ELIGIBLE</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 10px; text-align: center;">
                <span class="eyebrow">BASE PRICE</span>
                <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 800; color: var(--auction); margin-top: 2px;">40 CREDITS</div>
              </div>
            </div>
          </div>

          <!-- ACADEMIC & CRICKET DOSSIER -->
          <div class="surface-card" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h2 style="font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text-bright);">ACADEMIC & CRICKET PROFILE</h2>
              <span class="status-pill pill-grey">BUCKET ${p.bucket}</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 13px;">
              <div>
                <span class="eyebrow">FULL NAME</span>
                <div style="font-weight: 700; color: var(--text-bright); margin-top: 2px;">${p.name}</div>
              </div>
              <div>
                <span class="eyebrow">STUDENT ROLL NUMBER</span>
                <div style="font-family: var(--font-mono); font-weight: 700; color: var(--text-bright); margin-top: 2px;">${p.roll}</div>
              </div>
              <div>
                <span class="eyebrow">PROGRAM & BRANCH</span>
                <div style="color: var(--text-bright); margin-top: 2px;">${p.program} ${p.branch} (${p.year})</div>
              </div>
              <div>
                <span class="eyebrow">DERIVED CRICKET DISCIPLINE</span>
                <div style="color: var(--primary); font-weight: 700; margin-top: 2px;">${p.type}</div>
              </div>
            </div>

            <!-- CRICHEROES CAREER STATISTICS -->
            <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px; margin-top: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span class="eyebrow" style="color: var(--auction);">CRICHEROES CAREER STATS (VERIFIED)</span>
                <span style="font-size: 11px; color: var(--text-dim);">Profile ID: #CH-882194</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center;">
                <div>
                  <div class="sports-price" style="font-size: 22px; color: var(--text-bright);">${p.stats.matches}</div>
                  <div class="eyebrow" style="font-size: 9px;">MATCHES</div>
                </div>
                <div>
                  <div class="sports-price" style="font-size: 22px; color: var(--auction);">${p.stats.runs}</div>
                  <div class="eyebrow" style="font-size: 9px;">RUNS</div>
                </div>
                <div>
                  <div class="sports-price" style="font-size: 22px; color: var(--primary);">${p.stats.wickets}</div>
                  <div class="eyebrow" style="font-size: 9px;">WICKETS</div>
                </div>
                <div>
                  <div class="sports-price" style="font-size: 22px; color: var(--text-bright);">142.6</div>
                  <div class="eyebrow" style="font-size: 9px;">STRIKE RATE</div>
                </div>
              </div>
            </div>
          </div>

          <!-- PERMITTED DETAILS EDITOR -->
          <div class="surface-card" style="padding: 24px;">
            <h2 style="font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text-bright); margin-bottom: 14px;">PERMITTED TOURNAMENT PREFERENCES</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div class="form-group">
                <label class="form-label">JERSEY NAME (BACK OF SHIRT)</label>
                <input type="text" class="form-input" id="jerseyNameInput" value="${playerJerseyName}">
              </div>
              <div class="form-group">
                <label class="form-label">JERSEY SIZE</label>
                <select class="form-select" id="jerseySizeInput">
                  <option value="S" ${playerJerseySize === 'S' ? 'selected' : ''}>Small (38)</option>
                  <option value="M" ${playerJerseySize === 'M' ? 'selected' : ''}>Medium (40)</option>
                  <option value="L" ${playerJerseySize === 'L' ? 'selected' : ''}>Large (42)</option>
                  <option value="XL" ${playerJerseySize === 'XL' ? 'selected' : ''}>X-Large (44)</option>
                </select>
              </div>
            </div>
            <button class="btn btn-primary" onclick="savePlayerPreferences()">
              SAVE TOURNAMENT PREFERENCES
            </button>
          </div>
        </div>
      `;
    }

    function savePlayerPreferences() {
      const jName = document.getElementById("jerseyNameInput");
      const jSize = document.getElementById("jerseySizeInput");
      if (jName) playerJerseyName = jName.value;
      if (jSize) playerJerseySize = jSize.value;
      showToast("Player preferences updated successfully!", "success");
    }

    // ========================================================
    // 11. VIEW 7: PLAYER REGISTRATION & ROLL PARSER
    // ========================================================
    let regRoll = "23591-A-0402";
    let regName = "Arjun Kumar";
    let regBatting = "yes";
    let regBowling = "yes";
    let regFielding = "no";
    let regBowlingType = "Fast";

    function parseRoll(roll) {
      roll = roll.trim().toUpperCase();
      let match = roll.match(/^(\d{2})591-A-(01|02|03|04|05|12|42|43|44|54)[0-9A-Z]{2}$/);
      if (match) {
        const yearMap = { "22": { b: "B4", y: "4th Year" }, "23": { b: "B3", y: "3rd Year" }, "24": { b: "B2", y: "2nd Year" }, "25": { b: "B1", y: "1st Year" } };
        const branchMap = { "01": "CIVIL", "02": "EEE", "03": "MECH", "04": "ECE", "05": "CSE", "12": "IT", "42": "CSM", "43": "CAI", "44": "CSD", "54": "AID" };
        const yr = yearMap[match[1]] || { b: "B3", y: "3rd Year" };
        return { valid: true, program: "B.Tech", branch: branchMap[match[2]], year: yr.y, bucket: yr.b };
      }
      return { valid: true, program: "B.Tech", branch: "ECE", year: "3rd Year", bucket: "B3" };
    }

    function renderPlayerRegistrationView() {
      const parsed = parseRoll(regRoll);
      let derived = "All-Rounder";
      if (regBatting === "yes" && regBowling === "no") derived = "Specialist Batter";
      if (regBatting === "no" && regBowling === "yes") derived = "Specialist Bowler";
      if (regFielding === "yes") derived = "Wicket-Keeper Batter";

      return `
        <div style="max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
          <div class="surface-elevated" style="padding: 28px;">
            <span class="eyebrow" style="color: var(--primary);">OFFICIAL CANDIDATE ENTRY</span>
            <h1 class="display-title" style="font-size: 28px; margin-top: 2px;">PLAYER REGISTRATION PORTAL</h1>
            <div style="font-size: 13px; color: var(--text-dim); margin-top: 4px;">Submit verified academic credentials and cricket performance profile.</div>
          </div>

          <div class="surface-card" style="padding: 24px;">
            <div class="form-group">
              <label class="form-label">STUDENT ROLL NUMBER (AUTOMATIC BRANCH & YEAR PARSING)</label>
              <input type="text" class="form-input" value="${regRoll}" oninput="regRoll = this.value; renderCurrentView();">
            </div>

            <!-- PARSED ACADEMIC BADGES -->
            <div style="background: rgba(25, 195, 125, 0.08); border: 1px solid rgba(25, 195, 125, 0.25); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
              <span class="eyebrow" style="color: var(--primary);">AUTOMATICALLY PARSED ACADEMIC ATTRIBUTES</span>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 8px;">
                <div><span class="eyebrow">PROGRAM</span><div style="font-weight: 800; color: var(--text-bright);">${parsed.program}</div></div>
                <div><span class="eyebrow">BRANCH</span><div style="font-weight: 800; color: var(--text-bright);">${parsed.branch}</div></div>
                <div><span class="eyebrow">YEAR</span><div style="font-weight: 800; color: var(--text-bright);">${parsed.year}</div></div>
                <div><span class="eyebrow">BUCKET</span><div style="font-weight: 800; color: var(--auction);">${parsed.bucket}</div></div>
              </div>
            </div>

            <!-- BRANCHING SKILL QUESTIONNAIRE -->
            <div style="margin-bottom: 20px;">
              <label class="form-label">BATTING COMPETENCY</label>
              <div style="display: flex; gap: 10px; margin-top: 6px;">
                <button class="btn ${regBatting === 'yes' ? 'btn-primary' : 'btn-secondary'}" onclick="regBatting = 'yes'; renderCurrentView();">YES • Skilled Batter</button>
                <button class="btn ${regBatting === 'no' ? 'btn-primary' : 'btn-secondary'}" onclick="regBatting = 'no'; renderCurrentView();">NO</button>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <label class="form-label">BOWLING COMPETENCY</label>
              <div style="display: flex; gap: 10px; margin-top: 6px;">
                <button class="btn ${regBowling === 'yes' ? 'btn-primary' : 'btn-secondary'}" onclick="regBowling = 'yes'; renderCurrentView();">YES • Skilled Bowler</button>
                <button class="btn ${regBowling === 'no' ? 'btn-primary' : 'btn-secondary'}" onclick="regBowling = 'no'; renderCurrentView();">NO</button>
              </div>
            </div>

            <!-- DERIVED DISCIPLINE -->
            <div style="background: rgba(255, 138, 31, 0.08); border: 1px solid rgba(255, 138, 31, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
              <span class="eyebrow" style="color: var(--auction);">DERIVED DISCIPLINE</span>
              <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright); margin-top: 2px;">
                ${derived}
              </div>
            </div>

            <button class="btn btn-primary" style="width: 100%; height: 44px; font-size: 15px;" onclick="showToast('Registration submitted for Super Admin review!', 'success')">
              SUBMIT TOURNAMENT REGISTRATION
            </button>
          </div>
        </div>
      `;
    }

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

    // ========================================================
    // 14. REAL-TIME CLOUD SYNCHRONIZATION (FIRESTORE)
    // ========================================================
    const DEFAULT_FIREBASE_CONFIG = {
      projectId: "studio-6471864054-30ce7",
      appId: "1:830366253821:web:74186cd15282b396053494",
      authDomain: "studio-6471864054-30ce7.firebaseapp.com"
    };
    let currentRoomId = "acc-main-2026";
    let isCloudSynced = true;

    function broadcastAuctionState() {
      // Broadcast state to local window & listeners
      const payload = {
        lotIndex,
        currentPrice,
        leadingBidderId,
        timerSeconds,
        auctionState,
        passedFranchises: Array.from(passedFranchises),
        franchises,
        salesHistory,
        bidHistory,
        auditLog,
        activeBucketIndex,
        drawMode,
        auctionRound,
        timestamp: Date.now()
      };

      try {
        localStorage.setItem(`acc_state_${currentRoomId}`, JSON.stringify(payload));
      } catch (e) {}

      // If online, sync to Firestore
      if (window.db && window.doc && window.setDoc) {
        try {
          const roomRef = window.doc(window.db, "acc_auctions", currentRoomId);
          window.setDoc(roomRef, payload, { merge: true }).catch(err => console.log("Cloud sync note:", err));
        } catch (err) {}
      }
    }

    function initFirebaseSync() {
      try {
        window.addEventListener("storage", (e) => {
          if (e.key === `acc_state_${currentRoomId}` && e.newValue) {
            try {
              const incoming = JSON.parse(e.newValue);
              lotIndex = incoming.lotIndex ?? lotIndex;
              currentPrice = incoming.currentPrice ?? currentPrice;
              leadingBidderId = incoming.leadingBidderId ?? leadingBidderId;
              timerSeconds = incoming.timerSeconds ?? timerSeconds;
              auctionState = incoming.auctionState ?? auctionState;
              if (incoming.franchises) franchises = incoming.franchises;
              if (incoming.salesHistory) salesHistory = incoming.salesHistory;
              if (incoming.bidHistory) bidHistory = incoming.bidHistory;
              if (incoming.auditLog) auditLog = incoming.auditLog;
              renderCurrentView();
            } catch (err) {}
          }
        });
      } catch (e) {}
    }

    // ========================================================
    // 15. INITIALIZATION ON PAGE BOOT
    // ========================================================
    window.addEventListener("DOMContentLoaded", () => {
      initFirebaseSync();
      renderCurrentView();
      startTimer();
      setTimeout(() => {
        const overlay = document.getElementById("speederOverlay");
        if (overlay) overlay.classList.add("hidden");
      }, 500);
    });
  </script>
</body>
</html>

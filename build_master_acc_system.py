# -*- coding: utf-8 -*-
# build_master_acc_system.py
import os
import sys

print("Building Master ACC Player Auction System...")

# We will generate index.html and Acc-Auction-Os.html
INDEX_PATH = r"B:\projects\ACC\index.html"
BACKUP_PATH = r"B:\projects\ACC\Acc-Auction-Os.html"

# PART 1: HEAD, DESIGN TOKENS, AND CORE STYLES
part1_head_css = r'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Avanthi Cricket Carnival — Player Auction Portal 2026</title>
  
  <!-- Typography Stacks: Inter (UI), Space Grotesk (Display), JetBrains Mono (Numbers/Technical) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:ital,wght@0,500;0,600;0,700;0,800;1,600&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">

  <style>
    /* ========================================================
       ACC DESIGN SYSTEM TOKENS — FINTECH & LIVE BROADCAST SPEC
       ======================================================== */
    :root {
      /* Dark Foundation */
      --bg-dark-0: #050807;
      --bg-dark-1: #09110D;
      --bg-dark-2: #0E1813;

      /* Surfaces */
      --surface-1: #111C16;
      --surface-2: #17241D;
      --surface-3: #1D2D24;

      /* Typography Colors */
      --text-bright: #F5F7F6;     /* Primary headings & critical labels */
      --text-body: #DCE5DF;       /* Standard UI body text */
      --text-muted: #93A59A;      /* Captions, secondary info, table headers */
      --text-faint: #6E8175;      /* Dividers, micro-labels, disabled */

      /* Semantic Action & State Colors */
      --color-green: #19C37D;      /* Legal / Active / Connected / Success / Available */
      --color-green-light: #32E58F;
      --color-orange: #FF8A1F;     /* Auction / Current Bid / Primary Action */
      --color-yellow: #FFD166;     /* Warning / Scarcity / Attention */
      --color-red: #FF4D4F;        /* Blocked / Error / Failed / Destructive */
      --color-grey: #6E8175;       /* Inactive / Passed / Disabled */

      /* Subtle Borders */
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-medium: rgba(255, 255, 255, 0.14);
      --border-strong: rgba(255, 255, 255, 0.24);

      /* Typography */
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-display: 'Space Grotesk', var(--font-sans);
      --font-mono: 'JetBrains Mono', ui-monospace, monospace;

      /* Spacing Scale */
      --space-1: 4px;
      --space-2: 8px;
      --space-3: 12px;
      --space-4: 16px;
      --space-5: 20px;
      --space-6: 24px;
      --space-8: 32px;
      --space-10: 40px;
      --space-12: 48px;
      --space-16: 64px;
      --space-20: 80px;

      /* Border Radii (Conservative, Architectural) */
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 18px;
      --radius-xl: 24px;
      --radius-full: 9999px;

      /* Elevation Shadows */
      --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.35);
      --shadow-md: 0 10px 28px rgba(0, 0, 0, 0.45);
      --shadow-lg: 0 20px 50px rgba(0, 0, 0, 0.65);
    }

    /* Reset & Base Setup */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      min-height: 100%;
      background-color: var(--bg-dark-0);
      color: var(--text-body);
      font-family: var(--font-sans);
      font-size: 15px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden;
      width: 100%;
    }

    /* ========================================================
       OPAL ANIMATED BACKGROUND — HARDWARE ACCELERATED & RESPONSIVE
       ======================================================== */
    .opal-bg-root {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .opal-bg-video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.28;
      mix-blend-mode: screen;
      filter: saturate(1.2) brightness(0.85);
      transition: opacity 0.8s ease;
    }

    .opal-bg-mesh {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(at 15% 15%, rgba(25, 195, 125, 0.12) 0px, transparent 55%),
                  radial-gradient(at 85% 20%, rgba(255, 138, 31, 0.10) 0px, transparent 50%),
                  radial-gradient(at 50% 80%, rgba(25, 195, 125, 0.08) 0px, transparent 65%);
      opacity: 0.7;
    }

    .opal-bg-veil {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 15%, rgba(9, 17, 13, 0.82) 0%, rgba(5, 8, 7, 0.96) 80%);
    }

    .app-wrapper {
      position: relative;
      z-index: 1;
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
    }

    /* Container constraints */
    .main-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--space-6) var(--space-5) var(--space-16);
      flex: 1;
    }

    /* ========================================================
       TYPOGRAPHY HIERARCHY & UTILITIES
       ======================================================== */
    .font-display {
      font-family: var(--font-display);
    }
    .font-mono {
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
    }

    .display-hero {
      font-family: var(--font-display);
      font-size: clamp(2.5rem, 5.5vw, 4.75rem);
      font-weight: 800;
      line-height: 0.98;
      letter-spacing: -0.04em;
      color: var(--text-bright);
    }

    .section-title {
      font-family: var(--font-display);
      font-size: clamp(1.4rem, 2.8vw, 2.25rem);
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.02em;
      color: var(--text-bright);
    }

    .card-title {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 700;
      line-height: 1.25;
      color: var(--text-bright);
    }

    .label-micro {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted);
      line-height: 1.2;
    }

    .price-display {
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1;
    }

    /* ========================================================
       SURFACES & CONTAINERS
       ======================================================== */
    .surface-card {
      background-color: var(--surface-1);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      transition: border-color 0.2s ease, transform 0.2s ease;
    }
    .surface-card:hover {
      border-color: var(--border-medium);
    }

    .surface-elevated {
      background-color: var(--surface-2);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
    }

    .surface-subtle {
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
    }

    /* ========================================================
       TEXT-BASED STATUS BADGE SYSTEM (NO ICONS)
       ======================================================== */
    .status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 3px 9px;
      font-size: 0.6875rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border-radius: 4px;
      border: 1px solid transparent;
      line-height: 1.2;
      white-space: nowrap;
    }
    .status-live {
      background: rgba(25, 195, 125, 0.12);
      color: var(--color-green);
      border-color: rgba(25, 195, 125, 0.35);
    }
    .status-inplay {
      background: rgba(255, 138, 31, 0.14);
      color: var(--color-orange);
      border-color: rgba(255, 138, 31, 0.4);
    }
    .status-passed {
      background: rgba(110, 129, 117, 0.15);
      color: var(--color-grey);
      border-color: rgba(110, 129, 117, 0.3);
    }
    .status-blocked {
      background: rgba(255, 77, 79, 0.15);
      color: var(--color-red);
      border-color: rgba(255, 77, 79, 0.4);
    }
    .status-warning, .status-scarcity {
      background: rgba(255, 209, 102, 0.15);
      color: var(--color-yellow);
      border-color: rgba(255, 209, 102, 0.4);
    }
    .status-sold {
      background: rgba(25, 195, 125, 0.16);
      color: var(--color-green-light);
      border-color: rgba(25, 195, 125, 0.45);
    }
    .status-unsold {
      background: rgba(255, 77, 79, 0.12);
      color: var(--color-red);
      border-color: rgba(255, 77, 79, 0.3);
    }
    .status-connected {
      background: rgba(25, 195, 125, 0.12);
      color: var(--color-green);
      border-color: rgba(25, 195, 125, 0.3);
    }
    .status-offline {
      background: rgba(255, 77, 79, 0.12);
      color: var(--color-red);
      border-color: rgba(255, 77, 79, 0.3);
    }
    .status-reconnecting {
      background: rgba(255, 209, 102, 0.12);
      color: var(--color-yellow);
      border-color: rgba(255, 209, 102, 0.3);
    }

    /* ========================================================
       BUTTON SYSTEM
       ======================================================== */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 20px;
      font-family: var(--font-sans);
      font-size: 0.875rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.18s ease;
      white-space: nowrap;
      min-height: 44px;
      user-select: none;
    }
    .btn:active {
      transform: translateY(1px);
    }
    .btn-primary {
      background-color: var(--color-green);
      color: #050807;
      border-color: var(--color-green);
    }
    .btn-primary:hover {
      background-color: var(--color-green-light);
      border-color: var(--color-green-light);
    }
    .btn-auction {
      background-color: var(--color-orange);
      color: #050807;
      border-color: var(--color-orange);
    }
    .btn-auction:hover {
      background-color: #FFA043;
      border-color: #FFA043;
    }
    .btn-secondary {
      background-color: var(--surface-2);
      color: var(--text-bright);
      border-color: var(--border-medium);
    }
    .btn-secondary:hover {
      background-color: var(--surface-3);
      border-color: var(--border-strong);
    }
    .btn-danger {
      background-color: rgba(255, 77, 79, 0.15);
      color: var(--color-red);
      border-color: rgba(255, 77, 79, 0.4);
    }
    .btn-danger:hover {
      background-color: var(--color-red);
      color: #FFF;
    }
    .btn-bid {
      background-color: var(--color-orange);
      color: #050807;
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      min-height: 64px;
      border-radius: var(--radius-md);
      width: 100%;
      box-shadow: 0 8px 24px rgba(255, 138, 31, 0.28);
    }
    .btn-bid:hover {
      background-color: #FFA043;
    }
    .btn-bid:disabled {
      background-color: var(--surface-2);
      color: var(--text-faint);
      border-color: var(--border-subtle);
      box-shadow: none;
      cursor: not-allowed;
    }

    /* Form Inputs */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: var(--space-4);
    }
    .form-label {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    .form-input, .form-select {
      background-color: var(--surface-1);
      border: 1px solid var(--border-medium);
      color: var(--text-bright);
      font-family: var(--font-sans);
      font-size: 0.9375rem;
      padding: 12px 14px;
      border-radius: var(--radius-sm);
      min-height: 48px;
      outline: none;
      transition: border-color 0.18s ease;
      width: 100%;
    }
    .form-input:focus, .form-select:focus {
      border-color: var(--color-green);
    }
    .form-input::placeholder {
      color: var(--text-faint);
    }

    /* ========================================================
       HEADER NAVIGATION — COMPLIANT WITH DESIGN SPEC
       Desktop 64-76px, Mobile 56-64px, Sticky, Minimal Public
       ======================================================== */
    .app-header {
      position: sticky;
      top: 0;
      z-index: 50;
      height: 70px;
      background: rgba(5, 8, 7, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0 var(--space-6);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-inner {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
    }
    .brand-mark {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      cursor: pointer;
      text-decoration: none;
      user-select: none;
    }
    .brand-logo-text {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: var(--text-bright);
      line-height: 1;
    }
    .brand-logo-full {
      font-family: var(--font-sans);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
      border-left: 1px solid var(--border-medium);
      padding-left: var(--space-3);
      line-height: 1.2;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .nav-link-btn {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      font-family: var(--font-sans);
      font-size: 0.8125rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.16s ease;
      white-space: nowrap;
    }
    .nav-link-btn:hover {
      color: var(--text-bright);
      background: rgba(255, 255, 255, 0.04);
    }
    .nav-link-btn.active {
      color: var(--text-bright);
      background: var(--surface-2);
      border-color: var(--border-medium);
    }

    .header-status-area {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    /* Projector Mode hides standard navigation */
    body.projector-active .app-header {
      display: none !important;
    }

    /* ========================================================
       FOOTER
       ======================================================== */
    .app-footer {
      border-top: 1px solid var(--border-subtle);
      background-color: var(--bg-dark-1);
      padding: var(--space-10) var(--space-6) var(--space-8);
      margin-top: auto;
    }
    .footer-inner {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: var(--space-8);
    }
    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .footer-nav {
      display: flex;
      gap: var(--space-6);
      flex-wrap: wrap;
    }
    .footer-link {
      color: var(--text-muted);
      font-size: 0.8125rem;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.16s ease;
    }
    .footer-link:hover {
      color: var(--text-bright);
    }

    /* Modal System */
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(5, 8, 7, 0.82);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
    }
    .modal-dialog {
      background: var(--surface-2);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-lg);
      max-width: 620px;
      width: 100%;
      max-height: 90vh;
      max-height: 90dvh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
    }

    /* Toast Notification */
    .toast-container {
      position: fixed;
      bottom: var(--space-6);
      right: var(--space-6);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      pointer-events: none;
    }
    .toast-item {
      background: var(--surface-3);
      border: 1px solid var(--border-medium);
      color: var(--text-bright);
      padding: 12px 18px;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      font-weight: 600;
      box-shadow: var(--shadow-md);
      pointer-events: auto;
      animation: toastIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Mobile Breakpoints & Responsive Adaptations */
    @media (max-width: 900px) {
      .brand-logo-full {
        display: none;
      }
      .app-header {
        height: 60px;
        padding: 0 var(--space-4);
      }
      .main-container {
        padding: var(--space-4) var(--space-4) var(--space-12);
      }
      .footer-inner {
        flex-direction: column;
        gap: var(--space-6);
      }
    }
    @media (max-width: 640px) {
      .nav-links {
        gap: 4px;
      }
      .nav-link-btn {
        padding: 6px 8px;
        font-size: 0.75rem;
      }
      .modal-dialog {
        border-radius: var(--radius-md);
        padding: 0;
      }
    }
  </style>
</head>
<body>

  <!-- Opal Animated Multi-Layer Background -->
  <div class="opal-bg-root">
    <video class="opal-bg-video" autoplay loop muted playsinline poster="opal_background.svg">
      <source src="Opal.mp4" type="video/mp4">
    </video>
    <div class="opal-bg-mesh"></div>
    <div class="opal-bg-veil"></div>
  </div>

  <div class="app-wrapper">
    <!-- MASTER MINIMAL HEADER -->
    <header class="app-header">
      <div class="header-inner">
        <div class="brand-mark" onclick="switchView('public')">
          <span class="brand-logo-text">ACC</span>
          <span class="brand-logo-full">AVANTHI CRICKET CARNIVAL</span>
        </div>

        <nav class="nav-links" id="mainNavLinks">
          <!-- Dynamically populated based on Spectator vs Authenticated session -->
        </nav>

        <div class="header-status-area">
          <span class="status-badge status-live" id="liveHeaderBadge">LIVE</span>
          <div id="headerAuthArea">
            <!-- Dynamically populated: LOGIN button or Active Session chip -->
          </div>
        </div>
      </div>
    </header>

    <!-- MAIN VIEW CONTAINER -->
    <main class="main-container" id="appMain">
      <!-- Injected by renderCurrentView() -->
    </main>

    <!-- MINIMAL TYPOGRAPHIC FOOTER -->
    <footer class="app-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; color: var(--text-bright);">ACC</div>
          <div style="font-size: 0.8125rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em;">Avanthi Cricket Carnival</div>
          <div style="font-size: 0.75rem; color: var(--text-faint); margin-top: 2px;">Player Auction Portal · ACC 2026 Edition</div>
        </div>
        <div class="footer-nav">
          <span class="footer-link" onclick="switchView('public')">Players</span>
          <span class="footer-link" onclick="switchView('teams')">11 Teams</span>
          <span class="footer-link" onclick="switchView('live')">Live Auction</span>
          <span class="footer-link" onclick="switchView('register')">Register</span>
          <span class="footer-link" onclick="openRoleSwitcherModal()">Staff / Role Access</span>
        </div>
      </div>
    </footer>
  </div>

  <!-- MODAL CONTAINER -->
  <div id="modalContainer"></div>

  <!-- TOAST CONTAINER -->
  <div class="toast-container" id="toastContainer"></div>
'''

print("Part 1 defined successfully.")

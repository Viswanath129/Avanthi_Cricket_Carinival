# -*- coding: utf-8 -*-
# build_part1_core.py

PART1_CORE = r'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Avanthi Cricket Carnival — Player Auction Portal 2026</title>
  
  <!-- Typography Stacks: Plus Jakarta Sans / Inter (UI), Space Grotesk (Display), JetBrains Mono (Numbers/Technical) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:ital,wght@0,500;0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">

  <style>
    /* ========================================================
       ACC DESIGN SYSTEM TOKENS — FERALUI PASTEL GLASS & LIGHT THEME
       ======================================================== */
    :root {
      /* Misted Sky & Pastel Foundation */
      --bg-misted-sky: #F6F9FF;
      --bg-rain-indigo: #9BE0E8;
      --bg-lavender: #C4B5F7;
      --bg-lilac-paper: #F8B8D9;

      /* Surfaces - White Pastel Glass */
      --surface-0: #F6F9FF;
      --surface-1: rgba(255, 255, 255, 0.88);
      --surface-2: rgba(255, 255, 255, 0.94);
      --surface-3: #FFFFFF;

      --glass-bg: rgba(255, 255, 255, 0.82);
      --glass-bg-elevated: rgba(255, 255, 255, 0.92);
      --glass-border: rgba(255, 255, 255, 0.95);
      --glass-border-subtle: rgba(15, 23, 42, 0.08);
      --glass-shadow: 0 12px 36px -4px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03);
      --glass-shadow-lg: 0 20px 48px -6px rgba(15, 23, 42, 0.09), 0 8px 16px -4px rgba(15, 23, 42, 0.04);

      /* Typography Colors - High Contrast Slate (AA/AAA Compliant) */
      --text-main: #0F172A;       /* Slate 900 - Primary headings & critical labels */
      --text-bright: #0F172A;     /* Mapped for display headings */
      --text-body: #1E293B;       /* Slate 800 - Standard UI body text */
      --text-muted: #334155;      /* Slate 700 - Captions, secondary info, table headers */
      --text-subtle: #64748B;     /* Slate 500 - Dividers, micro-labels */
      --text-faint: #94A3B8;      /* Slate 400 - Disabled states */

      /* Semantic Action & State Colors */
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

      --color-green: #059669;      /* Emerald 600: Active / Connected / Success / Available */
      --color-green-light: #10B981;
      --color-orange: #D97706;     /* Amber 600: Auction / Current Bid / Primary Action */
      --color-yellow: #B45309;     /* Amber 700: Warning / Scarcity / Attention */
      --color-red: #E11D48;        /* Rose 600: Blocked / Error / Failed / Destructive */
      --color-grey: #64748B;       /* Slate 500: Inactive / Passed / Disabled */

      /* Borders */
      --border-subtle: rgba(15, 23, 42, 0.08);
      --border-medium: rgba(15, 23, 42, 0.14);
      --border-strong: rgba(15, 23, 42, 0.24);

      /* Typography */
      --font-sans: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

      /* Border Radii */
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 18px;
      --radius-xl: 24px;
      --radius-full: 9999px;

      /* Elevation Shadows */
      --shadow-sm: 0 4px 14px rgba(15, 23, 42, 0.05);
      --shadow-md: 0 10px 30px rgba(15, 23, 42, 0.08);
      --shadow-lg: 0 20px 50px rgba(15, 23, 42, 0.12);
    }

    /* Reset & Base Setup */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      min-height: 100%;
      background-color: var(--bg-misted-sky);
      color: var(--text-body);
      font-family: var(--font-sans);
      font-size: 15px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden;
      width: 100%;
    }

    body {
      background-color: var(--bg-misted-sky);
      color: var(--text-primary);
      overflow-x: hidden;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      min-height: 100dvh;
      font-family: var(--font-ui);
    }

    /* ========================================================
       OPAL ANIMATED BACKGROUND — NATIVE VIDEO LIQUID GLASS UI
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
      opacity: 0.95;
      mix-blend-mode: normal;
      filter: saturate(1.10) brightness(1.02);
      transform: translate3d(0, 0, 0);
      backface-visibility: hidden;
    }

    .opal-bg-scrim {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 30%, rgba(246, 249, 255, 0.12) 0%, rgba(246, 249, 255, 0.32) 100%);
      pointer-events: none;
    }

    /* ========================================================
       FLOATING ACTION NOTICE (NON-BLOCKING SLIM GLASS PILL)
       ======================================================== */
    .action-notice {
      position: fixed;
      top: 18px;
      right: 20px;
      z-index: 9999;
      background: rgba(255, 255, 255, 0.90);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.95);
      border-radius: var(--radius-full);
      padding: 8px 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      opacity: 0;
      transform: translateY(-8px);
      pointer-events: none;
      transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .action-notice.active {
      opacity: 1;
      transform: translateY(0);
    }
    .action-notice-title {
      font-family: var(--font-display);
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-green);
    }
    .action-notice-sub {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-main);
    }

    /* App Wrapper */
    .app-wrapper {
      position: relative;
      z-index: 1;
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
    }

    .main-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--space-6) var(--space-5) var(--space-16);
      flex: 1;
      box-sizing: border-box;
      overflow-x: hidden;
    }

    /* Typography Hierarchy */
    .font-display { font-family: var(--font-display); }
    .font-mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

    .display-hero {
      font-family: var(--font-display);
      font-size: clamp(2.4rem, 5.5vw, 4.5rem);
      font-weight: 800;
      line-height: 0.98;
      letter-spacing: -0.04em;
      color: var(--text-bright);
    }

    .section-title {
      font-family: var(--font-display);
      font-size: clamp(1.35rem, 2.5vw, 2.1rem);
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.02em;
      color: var(--text-bright);
    }

    .card-title {
      font-family: var(--font-display);
      font-size: 1.1rem;
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

    /* Surfaces - Liquid Pastel Glass System */
    .surface-card {
      background: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.80);
      border-radius: var(--radius-md);
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
      transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }
    .surface-card:hover {
      background: rgba(255, 255, 255, 0.75);
      border-color: rgba(255, 255, 255, 1);
      box-shadow: 0 14px 38px rgba(15, 23, 42, 0.07);
    }

    .surface-elevated {
      background: rgba(255, 255, 255, 0.76);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.90);
      border-radius: var(--radius-lg);
      box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
    }

    .surface-subtle {
      background: rgba(255, 255, 255, 0.42);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.60);
      border-radius: var(--radius-sm);
    }

    /* Text-Based Status Badges (No Icons, Clear Typography) */
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
      background: rgba(5, 150, 105, 0.12);
      color: var(--color-green);
      border-color: rgba(5, 150, 105, 0.35);
    }
    .status-inplay {
      background: rgba(217, 119, 6, 0.14);
      color: var(--color-orange);
      border-color: rgba(217, 119, 6, 0.4);
    }
    .status-passed {
      background: rgba(100, 116, 139, 0.12);
      color: var(--color-grey);
      border-color: rgba(100, 116, 139, 0.3);
    }
    .status-blocked {
      background: rgba(225, 29, 72, 0.12);
      color: var(--color-red);
      border-color: rgba(225, 29, 72, 0.35);
    }
    .status-warning, .status-scarcity {
      background: rgba(217, 119, 6, 0.12);
      color: var(--color-yellow);
      border-color: rgba(217, 119, 6, 0.35);
    }
    .status-sold {
      background: rgba(5, 150, 105, 0.15);
      color: var(--color-green);
      border-color: rgba(5, 150, 105, 0.45);
    }
    .status-unsold {
      background: rgba(225, 29, 72, 0.10);
      color: var(--color-red);
      border-color: rgba(225, 29, 72, 0.3);
    }
    .status-connected {
      background: rgba(5, 150, 105, 0.12);
      color: var(--color-green);
      border-color: rgba(5, 150, 105, 0.3);
    }
    .status-offline {
      background: rgba(225, 29, 72, 0.10);
      color: var(--color-red);
      border-color: rgba(225, 29, 72, 0.3);
    }
    .status-reconnecting {
      background: rgba(217, 119, 6, 0.12);
      color: var(--color-yellow);
      border-color: rgba(217, 119, 6, 0.3);
    }

    /* Button System */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 18px;
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
    .btn:active { transform: translateY(1px); }
    .btn-primary {
      background: linear-gradient(135deg, #059669, #10B981);
      color: #FFFFFF;
      border: none;
      box-shadow: 0 4px 14px rgba(5, 150, 105, 0.28);
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #047857, #059669);
      box-shadow: 0 6px 18px rgba(5, 150, 105, 0.36);
    }
    .btn-auction {
      background: linear-gradient(135deg, #D97706, #F59E0B);
      color: #FFFFFF;
      border: none;
      box-shadow: 0 4px 14px rgba(217, 119, 6, 0.32);
    }
    .btn-auction:hover {
      background: linear-gradient(135deg, #B45309, #D97706);
    }
    .btn-secondary {
      background-color: rgba(255, 255, 255, 0.90);
      color: var(--text-main);
      border: 1px solid var(--border-medium);
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
    }
    .btn-secondary:hover {
      background-color: #FFFFFF;
      border-color: var(--border-strong);
    }
    .btn-danger {
      background-color: rgba(225, 29, 72, 0.1);
      color: var(--color-red);
      border-color: rgba(225, 29, 72, 0.3);
    }
    .btn-danger:hover {
      background-color: var(--color-red);
      color: #FFFFFF;
    }
    .btn-bid {
      background: linear-gradient(135deg, #D97706, #F59E0B);
      color: #FFFFFF;
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      min-height: 64px;
      border-radius: var(--radius-md);
      width: 100%;
      box-shadow: 0 8px 24px rgba(217, 119, 6, 0.35);
      border: none;
    }
    .btn-bid:hover { background: linear-gradient(135deg, #B45309, #D97706); }
    .btn-bid:disabled {
      background: rgba(148, 163, 184, 0.2);
      color: var(--text-faint);
      border: 1px solid var(--border-subtle);
      box-shadow: none;
      cursor: not-allowed;
    }

    /* Forms */
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
      background-color: rgba(255, 255, 255, 0.95);
      border: 1.5px solid rgba(15, 23, 42, 0.12);
      color: var(--text-main);
      font-family: var(--font-sans);
      font-size: 0.9375rem;
      padding: 12px 14px;
      border-radius: var(--radius-sm);
      min-height: 48px;
      outline: none;
      transition: border-color 0.18s ease, box-shadow 0.18s ease;
      width: 100%;
    }
    .form-input:focus, .form-select:focus {
      border-color: var(--color-green);
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
    }
    .form-input::placeholder { color: var(--text-faint); }

    /* Header Nav */
    .app-header {
      position: sticky;
      top: 0;
      z-index: 50;
      height: 70px;
      background: rgba(255, 255, 255, 0.68);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.75);
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03);
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
    .brand-logo-img {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      object-fit: cover;
      flex-shrink: 0;
      border: 1.5px solid var(--border-medium);
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
      background: #FFFFFF;
    }
    .brand-logo-text {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: var(--text-main);
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
      color: var(--text-main);
      background: rgba(15, 23, 42, 0.04);
    }
    .nav-link-btn.active {
      color: var(--color-green);
      background: rgba(5, 150, 105, 0.08);
      border-color: rgba(5, 150, 105, 0.25);
    }

    .header-status-area {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    body.projector-active .app-header { display: none !important; }

    /* Footer */
    .app-footer {
      border-top: 1px solid var(--border-subtle);
      background-color: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
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
    .footer-link:hover { color: var(--text-main); }

    /* Modals */
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
    }
    .modal-dialog {
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: var(--radius-lg);
      max-width: 620px;
      width: 100%;
      max-height: 90vh;
      max-height: 90dvh;
      overflow-y: auto;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
    }

    /* ========================================================
       HOURGLASS AUCTION TIMER ANIMATION (SVG + CSS KEYFRAMES)
       ======================================================== */
    .hourglass-loader {
      --dur: 2s;
      --hue: 155;
      display: block;
      width: 52px;
      height: 52px;
      flex-shrink: 0;
    }
    .hourglass-loader.warning {
      --hue: 35;
    }
    .hourglass-loader.critical {
      --hue: 0;
    }
    .hourglass-loader.paused *,
    .hourglass-loader.time-up *,
    .hourglass-loader.time-up,
    .hourglass-loader.stopped *,
    .hourglass-loader.stopped {
      animation: none !important;
      animation-play-state: paused !important;
    }

    /* ========================================================
       FIRST ORIGINAL UIVERSE SPEEDER LOADING ANIMATION
       ======================================================== */
    .speeder-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(246, 249, 255, 0.94);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: opacity 0.35s ease, visibility 0.35s ease;
      pointer-events: all;
    }
    .speeder-overlay.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .speeder-wrapper {
      position: relative;
      width: 320px;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .speeder-loader {
      animation: speeder-anim 0.4s linear infinite;
      position: relative;
    }
    .speeder-loader > span {
      height: 5px;
      width: 35px;
      background: #0F172A;
      position: absolute;
      top: -19px;
      left: 60px;
      border-radius: 2px 10px 1px 0;
    }
    .speeder-base span {
      position: absolute;
      width: 0;
      height: 0;
      border-top: 6px solid transparent;
      border-right: 100px solid #059669;
      border-bottom: 6px solid transparent;
    }
    .speeder-base span:before {
      content: "";
      height: 22px;
      width: 22px;
      border-radius: 50%;
      background: #059669;
      position: absolute;
      right: -110px;
      top: -16px;
    }
    .speeder-base span:after {
      content: "";
      position: absolute;
      width: 0;
      height: 0;
      border-top: 0 solid transparent;
      border-right: 55px solid #059669;
      border-bottom: 16px solid transparent;
      top: -16px;
      right: -98px;
    }
    .speeder-face {
      position: absolute;
      height: 12px;
      width: 20px;
      background: #059669;
      border-radius: 20px 20px 0 0;
      transform: rotate(-40deg);
      right: -125px;
      top: -15px;
    }
    .speeder-face:after {
      content: "";
      height: 12px;
      width: 12px;
      background: #0F172A;
      right: 4px;
      top: 7px;
      position: absolute;
      transform: rotate(40deg);
      transform-origin: 50% 50%;
      border-radius: 0 0 0 2px;
    }
    .speeder-loader > span > span {
      position: absolute;
      width: 30px;
      height: 1.5px;
      background: #0F172A;
    }
    .speeder-loader > span > span:nth-child(1) { animation: speeder-fazer1 0.2s linear infinite; }
    .speeder-loader > span > span:nth-child(2) { top: 3px; animation: speeder-fazer2 0.4s linear infinite; }
    .speeder-loader > span > span:nth-child(3) { top: 1px; animation: speeder-fazer3 0.4s linear infinite; animation-delay: -1s; }
    .speeder-loader > span > span:nth-child(4) { top: 4px; animation: speeder-fazer4 1s linear infinite; animation-delay: -1s; }

    @keyframes speeder-anim {
      0% { transform: translate(2px, 1px) rotate(0deg); }
      10% { transform: translate(-1px, -3px) rotate(-1deg); }
      20% { transform: translate(-2px, 0px) rotate(1deg); }
      30% { transform: translate(1px, 2px) rotate(0deg); }
      40% { transform: translate(1px, -1px) rotate(1deg); }
      50% { transform: translate(-1px, 3px) rotate(-1deg); }
      60% { transform: translate(-1px, 1px) rotate(0deg); }
      70% { transform: translate(3px, 1px) rotate(-1deg); }
      80% { transform: translate(-2px, -1px) rotate(1deg); }
      90% { transform: translate(2px, 1px) rotate(0deg); }
      100% { transform: translate(1px, -2px) rotate(-1deg); }
    }
    @keyframes speeder-fazer1 {
      0% { left: 0; }
      100% { left: -80px; opacity: 0; }
    }
    @keyframes speeder-fazer2 {
      0% { left: 0; }
      100% { left: -100px; opacity: 0; }
    }
    @keyframes speeder-fazer3 {
      0% { left: 0; }
      100% { left: -50px; opacity: 0; }
    }
    @keyframes speeder-fazer4 {
      0% { left: 0; }
      100% { left: -150px; opacity: 0; }
    }

    .longfazers {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
    }
    .longfazers span {
      position: absolute;
      height: 2px;
      width: 25%;
      background: #059669;
    }
    .longfazers span:nth-child(1) { top: 20%; animation: lf1 0.6s linear infinite; animation-delay: -5s; }
    .longfazers span:nth-child(2) { top: 40%; animation: lf2 0.8s linear infinite; animation-delay: -1s; }
    .longfazers span:nth-child(3) { top: 60%; animation: lf3 0.6s linear infinite; }
    .longfazers span:nth-child(4) { top: 80%; animation: lf4 0.5s linear infinite; animation-delay: -3s; }

    @keyframes lf1 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
    @keyframes lf2 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
    @keyframes lf3 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
    @keyframes lf4 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }

    .speeder-msg {
      margin-top: 24px;
      font-family: var(--font-display, "Space Grotesk", sans-serif);
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-bright, #0F172A);
      text-align: center;
    }
    .speeder-sub {
      margin-top: 6px;
      font-size: 0.82rem;
      color: var(--text-muted, #475569);
      text-align: center;
      font-family: var(--font-sans, "Inter", sans-serif);
    }
    .live-users-pill {
      display: none !important; /* Temporarily hidden per user instruction - do not remove */
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(5, 150, 105, 0.1);
      border: 1px solid rgba(5, 150, 105, 0.2);
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 0.75rem;
    }

    .loader__glare-top,
    .loader__glare-bottom,
    .loader__model,
    .loader__motion-thick,
    .loader__motion-medium,
    .loader__motion-thin,
    .loader__sand-drop,
    .loader__sand-fill,
    .loader__sand-grain-left,
    .loader__sand-grain-right,
    .loader__sand-line-left,
    .loader__sand-line-right,
    .loader__sand-mound-top,
    .loader__sand-mound-bottom {
      animation-duration: var(--dur);
      animation-timing-function: cubic-bezier(0.83, 0, 0.17, 1);
      animation-iteration-count: infinite;
    }
    .loader__glare-top { animation-name: glare-top; }
    .loader__glare-bottom { animation-name: glare-bottom; }
    .loader__model {
      animation-name: loader-flip;
      transform-origin: 12.25px 16.75px;
    }
    .loader__motion-thick,
    .loader__motion-medium,
    .loader__motion-thin {
      transform-origin: 26px 26px;
    }
    .loader__motion-thick { animation-name: motion-thick; }
    .loader__motion-medium { animation-name: motion-medium; }
    .loader__motion-thin { animation-name: motion-thin; }
    .loader__sand-drop { animation-name: sand-drop; }
    .loader__sand-fill { animation-name: sand-fill; }
    .loader__sand-grain-left { animation-name: sand-grain-left; }
    .loader__sand-grain-right { animation-name: sand-grain-right; }
    .loader__sand-line-left { animation-name: sand-line-left; }
    .loader__sand-line-right { animation-name: sand-line-right; }
    .loader__sand-mound-top { animation-name: sand-mound-top; }
    .loader__sand-mound-bottom {
      animation-name: sand-mound-bottom;
      transform-origin: 12.25px 31.5px;
    }

    @keyframes loader-flip {
      from { transform: translate(13.75px, 9.25px) rotate(-180deg); }
      24%, to { transform: translate(13.75px, 9.25px) rotate(0); }
    }
    @keyframes glare-top {
      from { stroke: rgba(255, 255, 255, 0); }
      24%, to { stroke: rgba(255, 255, 255, 0.9); }
    }
    @keyframes glare-bottom {
      from { stroke: rgba(255, 255, 255, 0.9); }
      24%, to { stroke: rgba(255, 255, 255, 0); }
    }
    @keyframes motion-thick {
      from {
        animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
        stroke: rgba(5, 150, 105, 0);
        stroke-dashoffset: 153.94;
        transform: rotate(0.67turn);
      }
      20% {
        animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
        stroke: rgba(5, 150, 105, 0.75);
        stroke-dashoffset: 141.11;
        transform: rotate(1turn);
      }
      40%, to {
        stroke: rgba(5, 150, 105, 0);
        stroke-dashoffset: 153.94;
        transform: rotate(1.33turn);
      }
    }
    @keyframes motion-medium {
      from, 8% {
        animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
        stroke: rgba(245, 158, 11, 0);
        stroke-dashoffset: 153.94;
        transform: rotate(0.5turn);
      }
      20% {
        animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
        stroke: rgba(245, 158, 11, 0.85);
        stroke-dashoffset: 147.53;
        transform: rotate(0.83turn);
      }
      32%, to {
        stroke: rgba(245, 158, 11, 0);
        stroke-dashoffset: 153.94;
        transform: rotate(1.17turn);
      }
    }
    @keyframes motion-thin {
      from, 4% {
        animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
        stroke: rgba(15, 23, 42, 0);
        stroke-dashoffset: 153.94;
        transform: rotate(0.33turn);
      }
      24% {
        animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
        stroke: rgba(15, 23, 42, 0.45);
        stroke-dashoffset: 134.7;
        transform: rotate(0.67turn);
      }
      44%, to {
        stroke: rgba(15, 23, 42, 0);
        stroke-dashoffset: 153.94;
        transform: rotate(1turn);
      }
    }
    @keyframes sand-drop {
      from, 10% { animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0); stroke-dashoffset: 1; }
      70%, to { stroke-dashoffset: -107; }
    }
    @keyframes sand-fill {
      from, 10% { animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0); stroke-dashoffset: 55; }
      70%, to { stroke-dashoffset: -54; }
    }
    @keyframes sand-grain-left {
      from, 10% { animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0); stroke-dashoffset: 29; }
      70%, to { stroke-dashoffset: -22; }
    }
    @keyframes sand-grain-right {
      from, 10% { animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0); stroke-dashoffset: 27; }
      70%, to { stroke-dashoffset: -24; }
    }
    @keyframes sand-line-left {
      from, 10% { animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0); stroke-dashoffset: 53; }
      70%, to { stroke-dashoffset: -55; }
    }
    @keyframes sand-line-right {
      from, 10% { animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0); stroke-dashoffset: 14; }
      70%, to { stroke-dashoffset: -24.5; }
    }
    @keyframes sand-mound-top {
      from, 10% { animation-timing-function: linear; transform: translate(0, 0); }
      15% { animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0); transform: translate(0, 1.5px); }
      51%, to { transform: translate(0, 13px); }
    }
    @keyframes sand-mound-bottom {
      from, 31% { animation-timing-function: cubic-bezier(0.61, 1, 0.88, 1); transform: scale(1, 0); }
      56%, to { transform: scale(1, 1); }
    }

    /* Timer Widget Container with numbers and animated hourglass */
    .auction-timer-widget {
      display: inline-flex;
      align-items: center;
      gap: 14px;
      padding: 10px 18px;
      background: rgba(255, 255, 255, 0.72);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.85);
      border-radius: var(--radius-md);
      box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
      transition: background 0.3s ease, border-color 0.3s ease;
    }
    .auction-timer-widget.warning {
      border-color: rgba(245, 158, 11, 0.6);
      background: rgba(254, 243, 199, 0.75);
    }
    .auction-timer-widget.critical {
      border-color: rgba(239, 68, 68, 0.6);
      background: rgba(254, 226, 226, 0.75);
      animation: timerPulse 0.8s ease infinite alternate;
    }
    @keyframes timerPulse {
      from { box-shadow: 0 4px 18px rgba(239, 68, 68, 0.1); }
      to { box-shadow: 0 4px 24px rgba(239, 68, 68, 0.3); }
    }
    .timer-countdown-info {
      display: flex;
      flex-direction: column;
    }
    .timer-countdown-number {
      font-size: 2.5rem;
      font-weight: 800;
      line-height: 1;
      color: var(--text-bright);
    }
    .auction-timer-widget.warning .timer-countdown-number {
      color: var(--color-orange);
    }
    .auction-timer-widget.critical .timer-countdown-number {
      color: var(--color-red);
    }
    .timer-countdown-unit {
      font-size: 0.6875rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* ========================================================
       SUPER ADMIN HAMMER CLICK ANIMATION MODAL (Quv3n1Fshx)
       ======================================================== */
    .hammer-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
      animation: hammerFadeIn 0.22s ease forwards;
    }
    .hammer-modal-dialog {
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1.5px solid rgba(255, 255, 255, 0.95);
      border-radius: var(--radius-xl);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
      padding: clamp(24px, 4vw, 36px);
      max-width: 480px;
      width: 90%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      animation: hammerPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    .hammer-svg-container {
      width: 220px;
      height: 220px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }
    .hammer-svg-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .hammer-sold-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 14px;
      border-radius: var(--radius-full);
      background: #059669;
      color: #FFFFFF;
      font-size: 0.8125rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .hammer-sold-title {
      font-family: var(--font-display);
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-bright);
      margin: 0 0 6px 0;
      line-height: 1;
    }
    .hammer-sold-player {
      font-size: 1.05rem;
      color: var(--text-main);
      margin-bottom: 12px;
    }
    .hammer-sold-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 10px 18px;
      border-radius: var(--radius-md);
      background: rgba(246, 249, 255, 0.85);
      border: 1px solid var(--border-subtle);
      width: 100%;
      box-sizing: border-box;
    }
    @keyframes hammerFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes hammerPop {
      from { opacity: 0; transform: scale(0.85); }
      to { opacity: 1; transform: scale(1); }
    }

    /* Toasts */
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
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid var(--border-medium);
      color: var(--text-main);
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

    /* Responsive Adaptations */
    @media (max-width: 900px) {
      .brand-logo-full { display: none; }
      .app-header { height: 60px; padding: 0 var(--space-4); }
      .main-container { padding: var(--space-4) var(--space-4) var(--space-12); }
      .footer-inner { flex-direction: column; gap: var(--space-6); }
    }
    /* Mobile Bottom Navigation */
    .mobile-bottom-nav {
      display: none;
    }
    @media (max-width: 640px) {
      .app-header {
        height: 56px;
        padding: 0 var(--space-4);
      }
      .brand-logo-img {
        width: 36px;
        height: 36px;
        border-radius: 8px;
      }
      .brand-logo-text {
        font-size: 1.2rem;
      }
      .nav-links {
        display: none !important;
      }
      .mobile-bottom-nav {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: calc(56px + env(safe-area-inset-bottom, 0px));
        padding-bottom: env(safe-area-inset-bottom, 0px);
        background: rgba(255, 255, 255, 0.72);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid rgba(255, 255, 255, 0.85);
        z-index: 90;
        align-items: center;
        justify-content: space-around;
        box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.04);
      }
      .mobile-nav-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-family: var(--font-sans);
        font-size: 0.6875rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        cursor: pointer;
      }
      .mobile-nav-btn.active {
        color: var(--color-green);
      }
      .btn-bid {
        font-size: 1.05rem;
        min-height: 56px;
        padding: 8px 12px;
      }
      .surface-card, .surface-elevated {
        max-width: 100%;
        box-sizing: border-box;
      }
      .main-container {
        padding: var(--space-4) var(--space-3) calc(76px + env(safe-area-inset-bottom, 0px));
        max-width: 100%;
        box-sizing: border-box;
      }
      .app-footer {
        padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px));
      }
      .modal-dialog {
        border-radius: var(--radius-md);
      }
    }
  </style>
  <!-- Google Firebase SDK (v10 compat scripts for Firestore, Realtime Database Presence, & Auth) -->
  <script src="https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.13.2/firebase-database-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.13.2/firebase-auth-compat.js"></script>
</head>
<body>

  <!-- UIVERSE SPEEDER LOADING OVERLAY (FIRST ORIGINAL LOADER) -->
  <div id="speederOverlay" class="speeder-overlay" style="display: flex;">
    <div class="speeder-wrapper">
      <div class="speeder-loader">
        <span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </span>
        <div class="speeder-base">
          <span></span>
          <div class="speeder-face"></div>
        </div>
      </div>
      <div class="longfazers">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    <div id="speederMsg" class="speeder-msg">LOADING ACC 2026 OS...</div>
    <div id="speederSub" class="speeder-sub">Synchronizing Authoritative Cloud State</div>
  </div>

  <!-- FLOATING ACTION NOTICE (NON-BLOCKING SLIM GLASS PILL) -->
  <div id="actionNotice" class="action-notice" role="status" aria-live="polite">
    <span id="noticeTitle" class="action-notice-title"></span>
    <span id="noticeSub" class="action-notice-sub"></span>
  </div>

  <!-- OPAL NATIVE VIDEO BACKGROUND (VIBRANT LIQUID GLASS) -->
  <div class="opal-bg-root" aria-hidden="true">
    <video class="opal-bg-video" autoplay loop muted playsinline webkit-playsinline disablePictureInPicture poster="opal-poster.jpg">
      <source src="Opal.mp4" type="video/mp4">
    </video>
    <div class="opal-bg-scrim"></div>
  </div>

  <div class="app-wrapper">
    <!-- MASTER MINIMAL HEADER -->
    <header class="app-header">
      <div class="header-inner">
        <div class="brand-mark" onclick="switchView('public')">
          <img src="acc-logo.jpg" alt="Avanthi Cricket Carnival Logo" class="brand-logo-img">
          <div>
            <div class="brand-logo-text">ACC 2026</div>
            <div class="brand-logo-full">AVANTHI CRICKET CARNIVAL</div>
          </div>
        </div>

        <nav class="nav-links" id="mainNavLinks"></nav>

        <div class="header-status-area">
          <span class="status-badge status-live" id="liveHeaderBadge">LIVE</span>
          <div id="headerAuthArea"></div>
        </div>
      </div>
    </header>

    <!-- MOBILE BOTTOM NAVIGATION -->
    <nav class="mobile-bottom-nav" id="mobileBottomNav"></nav>

    <!-- MAIN VIEW CONTAINER -->
    <main class="main-container" id="appMain"></main>

    <!-- MINIMAL TYPOGRAPHIC FOOTER -->
    <footer class="app-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
            <img src="acc-logo.jpg" alt="ACC Logo" style="width: 44px; height: 44px; border-radius: 10px; border: 1.5px solid var(--border-medium); object-fit: cover; background: #fff;">
            <div>
              <div style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--text-bright); line-height: 1.1;">ACC 2026</div>
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-green); text-transform: uppercase; letter-spacing: 0.08em;">Avanthi Cricket Carnival</div>
            </div>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-faint); margin-top: 2px;">Official Player Auction Operating System · ACC 2026 Edition</div>
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

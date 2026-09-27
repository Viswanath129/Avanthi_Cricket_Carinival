# generate_final_acc_system.py
"""
Complete generator for the Avanthi Cricket Carnival (ACC) Auction Operating System.
Builds the standalone Acc-Auction-Os.html and index.html with all user requirements:
- FeralUI Gradient Studio blend & SVG Film Grain overlay
- Uiverse speeder & longfazers loading animation
- Strict 4:3 Aspect Ratio Photo Upload for Player & Franchise Owner
- Base Price in Registration (20-250 Credits ceiling)
- Bidding opens at player's base price
- No jump bidding: +10 (<100), +20 (100-199), +30 (>=200)
- Timer: 30s first bid, 20s subsequent, full reset, runs full course, expiry doesn't auto-sell
- Reversible pass for franchises; live 11-team status badges
- Super Admin Hammer: sells if bids exist, marks unsold if no bids
- Franchise Add/Edit customization & full localStorage database persistence
- All 9 fully interactive views
"""

import os
import shutil

OUTPUT_FILE = r"B:\projects\ACC\Acc-Auction-Os.html"
INDEX_FILE = r"B:\projects\ACC\index.html"

def generate_html():
    html = r'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Avanthi Cricket Carnival — Player Auction Portal 2026</title>
  
  <!-- Typography: Inter (UI), Space Grotesk (Display), Barlow Condensed (Sports), JetBrains Mono (Numbers) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;0,900;1,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">

  <style>
    /* ========================================================
       ACC AUCTION OS - FERALUI PASTEL GLASS & TYPOGRAPHY TOKENS
       ======================================================== */
    :root {
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

      --glass-bg: rgba(255, 255, 255, 0.78);
      --glass-bg-elevated: rgba(255, 255, 255, 0.92);
      --glass-bg-subtle: rgba(255, 255, 255, 0.65);
      --glass-border: rgba(255, 255, 255, 0.95);
      --glass-border-subtle: rgba(15, 23, 42, 0.08);
      --glass-shadow: 0 12px 36px -4px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03);
      --glass-shadow-lg: 0 20px 48px -6px rgba(15, 23, 42, 0.09), 0 8px 16px -4px rgba(15, 23, 42, 0.04);

      --font-sans: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-display: 'Space Grotesk', var(--font-sans);
      --font-sports: 'Barlow Condensed', sans-serif;
      --font-mono: 'JetBrains Mono', ui-monospace, monospace;

      --radius-sm: 8px;
      --radius-md: 16px;
      --radius-lg: 24px;
      --radius-full: 9999px;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      min-height: 100%;
      font-family: var(--font-sans);
      color: var(--text-main);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      background-color: var(--bg-misted-sky);
      background-image: 
        radial-gradient(at 0% 0%, rgba(155, 224, 232, 0.65) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(196, 181, 247, 0.7) 0px, transparent 52%),
        radial-gradient(at 100% 100%, rgba(248, 184, 217, 0.6) 0px, transparent 50%),
        radial-gradient(at 0% 100%, rgba(155, 224, 232, 0.5) 0px, transparent 50%),
        radial-gradient(at 50% 50%, rgba(246, 249, 255, 0.8) 0px, transparent 70%);
      background-attachment: fixed;
      background-size: cover;
      position: relative;
    }

    /* Fixed SVG Film Grain Overlay */
    .grain-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1;
      opacity: 0.28;
    }

    .app-wrapper {
      position: relative;
      z-index: 2;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* ========================================================
       SURFACES & CARDS (WCAG AA Frosted Glassmorphism)
       ======================================================== */
    .surface-card {
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
      border-radius: var(--radius-md);
      position: relative;
      transition: all 0.25s ease;
    }

    .surface-elevated {
      background: var(--glass-bg-elevated);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow-lg);
      border-radius: var(--radius-lg);
      position: relative;
    }

    .surface-subtle {
      background: var(--glass-bg-subtle);
      backdrop-filter: blur(16px);
      border: 1px solid var(--glass-border-subtle);
      border-radius: var(--radius-sm);
    }

    /* ========================================================
       TYPOGRAPHY STYLES
       ======================================================== */
    .display-title {
      font-family: var(--font-display);
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text-main);
      line-height: 1.1;
    }

    .sports-price {
      font-family: var(--font-sports);
      font-weight: 900;
      letter-spacing: 0.02em;
      line-height: 1;
    }

    .eyebrow {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--text-faint);
    }

    /* ========================================================
       BUTTONS & INTERACTIVE CONTROLS
       ======================================================== */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 700;
      font-family: var(--font-sans);
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
      min-height: 44px;
    }

    .btn:active {
      transform: scale(0.97);
    }

    .btn:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .btn-primary {
      background: var(--emerald-600);
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
    }
    .btn-primary:hover {
      background: #047857;
      box-shadow: 0 6px 16px rgba(5, 150, 105, 0.35);
    }

    .btn-auction {
      background: var(--amber-600);
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
    }
    .btn-auction:hover {
      background: #B45309;
      box-shadow: 0 6px 16px rgba(217, 119, 6, 0.35);
    }

    .btn-danger {
      background: var(--rose-600);
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);
    }
    .btn-danger:hover {
      background: #BE123C;
      box-shadow: 0 6px 16px rgba(225, 29, 72, 0.35);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.8);
      color: var(--text-main);
      border-color: var(--border-medium);
    }
    .btn-secondary:hover {
      background: #FFFFFF;
      border-color: rgba(15, 23, 42, 0.3);
    }

    /* Badges & Status Pills */
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .pill-green {
      background: var(--emerald-100);
      color: #065F46;
      border: 1px solid rgba(5, 150, 105, 0.3);
    }

    .pill-orange {
      background: var(--amber-100);
      color: #92400E;
      border: 1px solid rgba(217, 119, 6, 0.3);
    }

    .pill-red {
      background: var(--rose-100);
      color: #9F1239;
      border: 1px solid rgba(225, 29, 72, 0.3);
    }

    .pill-grey {
      background: #E2E8F0;
      color: #475569;
      border: 1px solid rgba(100, 116, 139, 0.3);
    }

    .pill-blue {
      background: var(--blue-100);
      color: #1E40AF;
      border: 1px solid rgba(37, 99, 235, 0.3);
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      animation: pulseDotAnim 1.4s infinite ease-in-out;
    }

    @keyframes pulseDotAnim {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.75); }
    }

    /* Form Controls */
    .form-group {
      margin-bottom: 16px;
    }
    .form-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    .form-input, .form-select {
      width: 100%;
      height: 44px;
      padding: 8px 14px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-sm);
      font-family: var(--font-sans);
      font-size: 14px;
      color: var(--text-main);
      transition: all 0.2s ease;
    }
    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
      background: #FFFFFF;
    }

    /* Range Slider */
    .custom-range {
      width: 100%;
      height: 8px;
      border-radius: 4px;
      background: #CBD5E1;
      outline: none;
      accent-color: var(--emerald-600);
    }

    /* ========================================================
       STRICT 4:3 PHOTO UPLOADER STYLES
       ======================================================== */
    .photo-upload-container {
      border: 2px dashed rgba(15, 23, 42, 0.2);
      border-radius: var(--radius-md);
      padding: 16px;
      text-align: center;
      background: rgba(255, 255, 255, 0.6);
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .photo-upload-container:hover {
      border-color: var(--primary);
      background: rgba(255, 255, 255, 0.85);
    }
    .aspect-4-3-box {
      width: 100%;
      max-width: 240px;
      aspect-ratio: 4 / 3;
      margin: 0 auto;
      border-radius: 12px;
      overflow: hidden;
      background: #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border: 1px solid var(--border-medium);
    }
    .aspect-4-3-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* ========================================================
       CIRCULAR SVG TIMER RING
       ======================================================== */
    .timer-ring-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .timer-ring-svg {
      transform: rotate(-90deg);
      transform-origin: 50% 50%;
    }
    .timer-ring-circle-bg {
      fill: none;
      stroke: rgba(15, 23, 42, 0.08);
    }
    .timer-ring-circle {
      fill: none;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.8s linear, stroke 0.3s ease;
    }
    .timer-ring-text {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .timer-pulse-danger {
      animation: timerPulse 0.6s infinite alternate;
    }
    @keyframes timerPulse {
      from { transform: scale(1); filter: drop-shadow(0 0 4px rgba(225, 29, 72, 0.4)); }
      to { transform: scale(1.04); filter: drop-shadow(0 0 12px rgba(225, 29, 72, 0.8)); }
    }

    /* ========================================================
       UIVERSE SPEEDER LOADING ANIMATION (anand_4957)
       ======================================================== */
    #speederOverlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(246, 249, 255, 0.94);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: opacity 0.4s ease, visibility 0.4s;
    }
    #speederOverlay.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .speeder-stage {
      position: relative;
      width: 280px;
      height: 180px;
    }

    .loader {
      position: absolute;
      top: 50%;
      margin-left: -50px;
      left: 50%;
      animation: speeder 0.4s linear infinite;
    }
    .loader > span {
      height: 5px;
      width: 35px;
      background: #0F172A;
      position: absolute;
      top: -19px;
      left: 60px;
      border-radius: 2px 10px 1px 0;
    }
    .base span {
      position: absolute;
      width: 0;
      height: 0;
      border-top: 6px solid transparent;
      border-right: 100px solid #0F172A;
      border-bottom: 6px solid transparent;
    }
    .base span:before {
      content: "";
      height: 22px;
      width: 22px;
      border-radius: 50%;
      background: #0F172A;
      position: absolute;
      right: -110px;
      top: -16px;
    }
    .base span:after {
      content: "";
      position: absolute;
      width: 0;
      height: 0;
      border-top: 0 solid transparent;
      border-right: 55px solid #0F172A;
      border-bottom: 16px solid transparent;
      top: -16px;
      right: -98px;
    }
    .face {
      position: absolute;
      height: 12px;
      width: 20px;
      background: #0F172A;
      border-radius: 20px 20px 0 0;
      transform: rotate(-40deg);
      right: -125px;
      top: -15px;
    }
    .face:after {
      content: "";
      height: 12px;
      width: 12px;
      background: #059669;
      right: 4px;
      top: 7px;
      position: absolute;
      transform: rotate(40deg);
      transform-origin: 50% 50%;
      border-radius: 0 0 0 2px;
    }
    .loader > span > span:nth-child(1),
    .loader > span > span:nth-child(2),
    .loader > span > span:nth-child(3),
    .loader > span > span:nth-child(4) {
      width: 30px;
      height: 1px;
      background: #0F172A;
      position: absolute;
      animation: fazer1 0.2s linear infinite;
    }
    .loader > span > span:nth-child(2) {
      top: 3px;
      animation: fazer2 0.4s linear infinite;
    }
    .loader > span > span:nth-child(3) {
      top: 1px;
      animation: fazer3 0.4s linear infinite;
      animation-delay: -1s;
    }
    .loader > span > span:nth-child(4) {
      top: 4px;
      animation: fazer4 1s linear infinite;
      animation-delay: -1s;
    }
    @keyframes speeder {
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
    @keyframes fazer1 {
      0% { left: 0; }
      100% { left: -80px; opacity: 0; }
    }
    @keyframes fazer2 {
      0% { left: 0; }
      100% { left: -100px; opacity: 0; }
    }
    @keyframes fazer3 {
      0% { left: 0; }
      100% { left: -50px; opacity: 0; }
    }
    @keyframes fazer4 {
      0% { left: 0; }
      100% { left: -150px; opacity: 0; }
    }
    .longfazers {
      position: absolute;
      width: 100%;
      height: 100%;
    }
    .longfazers span {
      position: absolute;
      height: 2px;
      width: 20%;
      background: #059669;
    }
    .longfazers span:nth-child(1) {
      top: 20%;
      animation: lf 0.6s linear infinite;
      animation-delay: -5s;
    }
    .longfazers span:nth-child(2) {
      top: 40%;
      animation: lf2 0.8s linear infinite;
      animation-delay: -1s;
    }
    .longfazers span:nth-child(3) {
      top: 60%;
      animation: lf3 0.6s linear infinite;
    }
    .longfazers span:nth-child(4) {
      top: 80%;
      animation: lf4 0.5s linear infinite;
      animation-delay: -3s;
    }
    @keyframes lf {
      0% { left: 200%; }
      100% { left: -200%; opacity: 0; }
    }
    @keyframes lf2 {
      0% { left: 200%; }
      100% { left: -200%; opacity: 0; }
    }
    @keyframes lf3 {
      0% { left: 200%; }
      100% { left: -100%; opacity: 0; }
    }
    @keyframes lf4 {
      0% { left: 200%; }
      100% { left: -100%; opacity: 0; }
    }

    /* ========================================================
       NAVIGATION BAR & HEADER
       ======================================================== */
    .app-header {
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--glass-border-subtle);
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
    }
    .header-inner {
      max-width: 1440px;
      margin: 0 auto;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .logo-badge {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }
    .nav-tabs {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      padding: 4px 0;
    }
    .nav-tab-btn {
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 700;
      color: var(--text-muted);
      background: transparent;
      border: 1px solid transparent;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    }
    .nav-tab-btn:hover {
      background: rgba(15, 23, 42, 0.05);
      color: var(--text-bright);
    }
    .nav-tab-btn.active {
      background: #FFFFFF;
      color: var(--emerald-600);
      border-color: var(--border-subtle);
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
    }

    /* Modal System */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: modalFadeIn 0.2s ease;
    }
    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .modal-dialog {
      background: var(--bg-elevated);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--glass-shadow-lg);
      width: 100%;
      max-width: 620px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
    }

    /* Toast Notification */
    #toastContainer {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9990;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .toast-msg {
      background: var(--bg-elevated);
      color: var(--text-bright);
      border: 1px solid var(--border-medium);
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: var(--glass-shadow-lg);
      display: flex;
      align-items: center;
      gap: 10px;
      animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Projector Fullscreen Mode */
    body.projector-active .app-header {
      display: none;
    }
    body.projector-active {
      background: #090E17;
      color: #F8FAFC;
    }
    body.projector-active .surface-card {
      background: rgba(22, 33, 50, 0.85);
      border-color: rgba(255, 255, 255, 0.12);
      color: #F8FAFC;
    }
    body.projector-active .display-title,
    body.projector-active .sports-price {
      color: #FFFFFF;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .header-inner { flex-direction: column; align-items: stretch; gap: 8px; }
      .nav-tabs { justify-content: flex-start; }
    }
  </style>
</head>
<body>

  <!-- SVG Film Grain Texture Overlay -->
  <svg class="grain-overlay" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>

  <!-- UIVERSE SPEEDER LOADING ANIMATION (anand_4957) -->
  <div id="speederOverlay">
    <div class="speeder-stage">
      <div class="loader">
        <span><span></span><span></span><span></span><span></span></span>
        <div class="base">
          <span></span>
          <div class="face"></div>
        </div>
      </div>
      <div class="longfazers">
        <span></span><span></span><span></span><span></span>
      </div>
    </div>
    <div style="margin-top: 24px; text-align: center;">
      <div id="speederMsg" style="font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text-main);">
        AVANTHI CRICKET CARNIVAL 2026
      </div>
      <div id="speederSub" style="font-size: 13px; color: var(--text-dim); margin-top: 4px;">
        Synchronizing Authoritative Auction Engine...
      </div>
    </div>
  </div>

  <div class="app-wrapper">
    <!-- APP HEADER & NAVIGATION -->
    <header class="app-header">
      <div class="header-inner">
        <div class="logo-badge" onclick="switchView('public')">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #059669, #0284C7); display: grid; place-items: center; color: white; font-weight: 900; font-family: var(--font-display); font-size: 18px; box-shadow: 0 4px 12px rgba(5,150,105,0.3);">
            ACC
          </div>
          <div>
            <div style="font-family: var(--font-display); font-size: 15px; font-weight: 800; color: var(--text-bright); line-height: 1.1;">
              AVANTHI CRICKET CARNIVAL
            </div>
            <div style="font-size: 11px; font-weight: 700; color: var(--emerald-600); letter-spacing: 0.05em;">
              PLAYER AUCTION OS 2026
            </div>
          </div>
        </div>

        <nav class="nav-tabs" id="navTabs">
          <button class="nav-tab-btn" data-view="public" onclick="switchView('public')">Public View</button>
          <button class="nav-tab-btn" data-view="live" onclick="switchView('live')">Live Floor</button>
          <button class="nav-tab-btn" data-view="franchise" onclick="switchView('franchise')">Franchise Terminal</button>
          <button class="nav-tab-btn" data-view="teams" onclick="switchView('teams')">11 Teams</button>
          <button class="nav-tab-btn" data-view="register" onclick="switchView('register')">Register Player</button>
          <button class="nav-tab-btn" data-view="player" onclick="switchView('player')">Player Portal</button>
          <button class="nav-tab-btn" data-view="admin" onclick="switchView('admin')">Super Admin</button>
          <button class="nav-tab-btn" data-view="projector" onclick="switchView('projector')">📽 Hall Projector</button>
        </nav>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div id="sessionIndicator" class="surface-subtle" style="padding: 6px 12px; display: flex; align-items: center; gap: 8px; cursor: pointer;" onclick="openRoleSwitcherModal()">
            <div class="pulse-dot" style="color: var(--primary);"></div>
            <div style="font-size: 12px; font-weight: 700; color: var(--text-bright);" id="sessionName">Super Admin</div>
            <span style="font-size: 10px; color: var(--text-faint);">▼</span>
          </div>
        </div>
      </div>
    </header>

    <!-- MAIN VIEW CONTAINER -->
    <main style="flex: 1; padding: 24px 20px; max-width: 1440px; margin: 0 auto; width: 100%;" id="appMain">
      <!-- Dynamic View Injected Here -->
    </main>
  </div>

  <!-- MODAL CONTAINER -->
  <div id="modalContainer"></div>

  <!-- TOAST CONTAINER -->
  <div id="toastContainer"></div>

  <!-- JAVASCRIPT CORE ENGINE & LOGIC -->
  <script>
    // ========================================================
    // 1. DATA MODELS & SEED DATA
    // ========================================================
    const BUCKET_SEQUENCE = ["B1", "B2", "B3", "B4", "B5", "PG"];

    const INITIAL_FRANCHISES = [
      { id: "titans", name: "TITANS", short: "TIT", purse: 620, bought: 11, buckets: {B1:2,B2:1,B3:2,B4:1,B5:1,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#10B981", faculty: "Dr. R. Sharma", dept: "Mechanical", mobile: "+91 98765 43210", captainMobile: "+91 98765 43211", captain: "Arjun Kumar", vc: "Karthik V", ownerPhoto: null },
      { id: "warriors", name: "WARRIORS", short: "WAR", purse: 540, bought: 9, buckets: {B1:1,B2:2,B3:1,B4:2,B5:0,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#F59E0B", faculty: "Dr. M. Suresh", dept: "ECE", mobile: "+91 98765 43220", captainMobile: "+91 98765 43221", captain: "Rohan Reddy", vc: "Sai Kumar", ownerPhoto: null },
      { id: "royals", name: "ROYALS", short: "ROY", purse: 410, bought: 12, buckets: {B1:2,B2:2,B3:2,B4:2,B5:0,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#E11D48", faculty: "Prof. K. Prasad", dept: "CSE", mobile: "+91 98765 43230", captainMobile: "+91 98765 43231", captain: "Nikhil Varma", vc: "Vamsi Krishna", ownerPhoto: null },
      { id: "strikers", name: "STRIKERS", short: "STR", purse: 720, bought: 7, buckets: {B1:0,B2:1,B3:1,B4:0,B5:1,PG:0}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#0284C7", faculty: "Dr. P. Naidu", dept: "Civil", mobile: "+91 98765 43240", captainMobile: "+91 98765 43241", captain: "Harish Patel", vc: "Manoj K", ownerPhoto: null },
      { id: "blasters", name: "BLASTERS", short: "BLA", purse: 580, bought: 10, buckets: {B1:2,B2:1,B3:2,B4:1,B5:1,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#8B5CF6", faculty: "Prof. S. Rao", dept: "IT", mobile: "+91 98765 43250", captainMobile: "+91 98765 43251", captain: "Tarun Teja", vc: "Akhil M", ownerPhoto: null },
      { id: "mavericks", name: "MAVERICKS", short: "MAV", purse: 660, bought: 8, buckets: {B1:1,B2:1,B3:1,B4:1,B5:0,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#EA580C", faculty: "Dr. K. Venkat", dept: "EEE", mobile: "+91 98765 43260", captainMobile: "+91 98765 43261", captain: "Deepak N", vc: "Sai Teja", ownerPhoto: null },
      { id: "knights", name: "KNIGHTS", short: "KNI", purse: 490, bought: 13, buckets: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#64748B", faculty: "Prof. B. Anand", dept: "CSM", mobile: "+91 98765 43270", captainMobile: "+91 98765 43271", captain: "Praneeth R", vc: "Ajay V", ownerPhoto: null },
      { id: "eagles", name: "EAGLES", short: "EAG", purse: 600, bought: 9, buckets: {B1:2,B2:0,B3:2,B4:1,B5:0,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#2563EB", faculty: "Dr. C. Sekhar", dept: "CSD", mobile: "+91 98765 43280", captainMobile: "+91 98765 43281", captain: "Sandeep K", vc: "Rahul B", ownerPhoto: null },
      { id: "panthers", name: "PANTHERS", short: "PAN", purse: 550, bought: 10, buckets: {B1:1,B2:2,B3:1,B4:2,B5:1,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#EC4899", faculty: "Prof. D. Srinivas", dept: "AID", mobile: "+91 98765 43290", captainMobile: "+91 98765 43291", captain: "Yashwanth P", vc: "Pavan T", ownerPhoto: null },
      { id: "hawks", name: "HAWKS", short: "HAW", purse: 680, bought: 8, buckets: {B1:1,B2:1,B3:2,B4:0,B5:1,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#14B8A6", faculty: "Dr. G. Rajesh", dept: "MBA", mobile: "+91 98765 43300", captainMobile: "+91 98765 43301", captain: "Chetan M", vc: "Naveen G", ownerPhoto: null },
      { id: "lions", name: "LIONS", short: "LIO", purse: 630, bought: 9, buckets: {B1:2,B2:1,B3:1,B4:1,B5:1,PG:1}, needed: {B1:2,B2:2,B3:2,B4:2,B5:2,PG:1}, color: "#D97706", faculty: "Prof. V. Krishna", dept: "MCA", mobile: "+91 98765 43310", captainMobile: "+91 98765 43311", captain: "Sravan Kumar", vc: "Dileep S", ownerPhoto: null }
    ];

    const INITIAL_PLAYERS = [
      { id: "023", scopedNum: 14, name: "ARJUN KUMAR", program: "B.Tech", branch: "ECE", year: "3rd Year", bucket: "B3", basePrice: 40, status: "UNSOLD", type: "All-Rounder", tags: ["TOP ORDER", "RIGHT ARM MED", "PACE"], stats: { matches: 28, runs: 482, wickets: 34 }, roll: "23591-A-0402", cricHeroes: "VERIFIED", payment: "VERIFIED", photo: null },
      { id: "024", scopedNum: 15, name: "RAHUL VERMA", program: "B.Tech", branch: "CSE", year: "3rd Year", bucket: "B3", basePrice: 35, status: "UNSOLD", type: "Top-Order Batter", tags: ["AGGRESSIVE", "RIGHT HAND", "ANCHOR"], stats: { matches: 22, runs: 510, wickets: 4 }, roll: "23591-A-0518", cricHeroes: "VERIFIED", payment: "VERIFIED", photo: null },
      { id: "025", scopedNum: 16, name: "SAI TEJA", program: "B.Tech", branch: "MECH", year: "3rd Year", bucket: "B3", basePrice: 30, status: "UNSOLD", type: "Fast Bowler", tags: ["EXPRESS", "OUT-SWING", "DEATH OVERS"], stats: { matches: 19, runs: 65, wickets: 28 }, roll: "23591-A-0329", cricHeroes: "VERIFIED", payment: "VERIFIED", photo: null },
      { id: "026", scopedNum: 8, name: "VIGNESH RAO", program: "B.Tech", branch: "ECE", year: "4th Year", bucket: "B4", basePrice: 50, status: "UNSOLD", type: "All-Rounder", tags: ["EXPERIENCED", "SPIN", "MIDDLE ORDER"], stats: { matches: 35, runs: 620, wickets: 41 }, roll: "22591-A-0444", cricHeroes: "VERIFIED", payment: "VERIFIED", photo: null },
      { id: "027", scopedNum: 9, name: "HARISH NAIDU", program: "B.Tech", branch: "CIVIL", year: "4th Year", bucket: "B4", basePrice: 35, status: "UNSOLD", type: "Spin Bowler", tags: ["OFF-BREAK", "ECONOMICAL"], stats: { matches: 26, runs: 88, wickets: 31 }, roll: "22591-A-0112", cricHeroes: "VERIFIED", payment: "VERIFIED", photo: null },
      { id: "028", scopedNum: 21, name: "KIRAN KUMAR", program: "B.Tech", branch: "CSE", year: "2nd Year", bucket: "B2", basePrice: 25, status: "UNSOLD", type: "Wicket-Keeper Batter", tags: ["GLOVES", "QUICK HANDS", "FINISHER"], stats: { matches: 15, runs: 240, wickets: 0 }, roll: "24591-A-0533", cricHeroes: "VERIFIED", payment: "VERIFIED", photo: null },
      { id: "029", scopedNum: 5, name: "MANOJ SWAMY", program: "Diploma", branch: "DME", year: "3rd Year", bucket: "B5", basePrice: 45, status: "UNSOLD", type: "Fast Bowler", tags: ["SEAM", "POWERPLAY", "YORKERS"], stats: { matches: 16, runs: 33, wickets: 19 }, roll: "25597-ME-022", cricHeroes: "VERIFIED", payment: "VERIFIED", photo: null },
      { id: "030", scopedNum: 11, name: "SURESH BABU", program: "B.Tech", branch: "CSM", year: "1st Year", bucket: "B1", basePrice: 20, status: "UNSOLD", type: "Top-Order Batter", tags: ["CLEAN STRIKER", "POWERPLAY"], stats: { matches: 10, runs: 195, wickets: 2 }, roll: "25591-A-4210", cricHeroes: "VERIFIED", payment: "VERIFIED", photo: null },
      { id: "031", scopedNum: 3, name: "PRADEEP RAJ", program: "PG", branch: "MBA", year: "2nd Year", bucket: "PG", basePrice: 30, status: "UNSOLD", type: "All-Rounder", tags: ["LEADERSHIP", "MEDIUM SEAM"], stats: { matches: 24, runs: 380, wickets: 22 }, roll: "24591-E-0014", cricHeroes: "VERIFIED", payment: "VERIFIED", photo: null }
    ];

    let salesHistory = [
      { id: "SALE-0840", lotId: "020", playerName: "Suresh Babu", playerRole: "Top-Order Batter", bucket: "B1", franchiseId: "warriors", franchiseName: "WARRIORS", price: 60, timestamp: "19:35:10", status: "COMMITTED" },
      { id: "SALE-0841", lotId: "021", playerName: "Vignesh Rao", playerRole: "All-Rounder", bucket: "B4", franchiseId: "strikers", franchiseName: "STRIKERS", price: 160, timestamp: "19:38:42", status: "COMMITTED" },
      { id: "SALE-0842", lotId: "022", playerName: "Manoj Swamy", playerRole: "Fast Bowler", bucket: "B5", franchiseId: "titans", franchiseName: "TITANS", price: 90, timestamp: "19:40:15", status: "COMMITTED" }
    ];

    let auditLog = [
      { id: 1, time: "19:40:15", who: "TOURNAMENT DIRECTOR", role: "SUPER_ADMIN", type: "HAMMER", msg: "LOT #022 Manoj Swamy HAMMERED SOLD to TITANS for 90C." },
      { id: 2, time: "19:40:02", who: "TITANS", role: "FRANCHISE", type: "BID", msg: "Authoritative bid placed at 90C." }
    ];

    let bidHistory = [
      { price: 90, bidder: "TITANS", t: "19:40:02" },
      { price: 70, bidder: "WARRIORS", t: "19:39:48" },
      { price: 50, bidder: "TITANS", t: "19:39:30" }
    ];

    // Authoritative State
    let currentView = 'public';
    let lotIndex = 0;
    let currentPrice = 40;
    let leadingBidderId = null;
    let timerSeconds = 30; // 30s initial timer for lot
    let auctionState = 'LIVE'; // LIVE, PAUSED
    let passedFranchises = new Set();
    let bucketRecallQueue = [];
    let activeBucketIndex = 0;
    let auctionRound = 1;
    let drawMode = 'AUTO'; // 'AUTO', 'GUEST'
    let timerInterval = null;

    let currentUser = {
      role: 'SUPER_ADMIN', // SUPER_ADMIN, OPERATOR, FRANCHISE, PLAYER, SPECTATOR
      name: 'Dr. V. Prasad (Tournament Director)',
      title: 'Super Admin',
      franchiseId: 'titans',
      playerId: '023'
    };

    // ========================================================
    // 2. DATABASE PERSISTENCE (localStorage)
    // ========================================================
    let franchises = [...INITIAL_FRANCHISES];
    let players = [...INITIAL_PLAYERS];

    function saveDatabase() {
      try {
        localStorage.setItem("ACC_FRANCHISES_DB_V2", JSON.stringify(franchises));
        localStorage.setItem("ACC_PLAYERS_DB_V2", JSON.stringify(players));
        localStorage.setItem("ACC_SALES_DB_V2", JSON.stringify(salesHistory));
        localStorage.setItem("ACC_AUDIT_DB_V2", JSON.stringify(auditLog));
        const statePayload = {
          lotIndex,
          currentPrice,
          leadingBidderId,
          timerSeconds,
          auctionState,
          passedFranchises: Array.from(passedFranchises),
          activeBucketIndex,
          auctionRound,
          drawMode
        };
        localStorage.setItem("ACC_STATE_DB_V2", JSON.stringify(statePayload));
      } catch (e) {
        console.error("DB Save error:", e);
      }
    }

    function loadDatabase() {
      try {
        const savedF = localStorage.getItem("ACC_FRANCHISES_DB_V2");
        if (savedF) franchises = JSON.parse(savedF);

        const savedP = localStorage.getItem("ACC_PLAYERS_DB_V2");
        if (savedP) players = JSON.parse(savedP);

        const savedS = localStorage.getItem("ACC_SALES_DB_V2");
        if (savedS) salesHistory = JSON.parse(savedS);

        const savedA = localStorage.getItem("ACC_AUDIT_DB_V2");
        if (savedA) auditLog = JSON.parse(savedA);

        const savedSt = localStorage.getItem("ACC_STATE_DB_V2");
        if (savedSt) {
          const st = JSON.parse(savedSt);
          lotIndex = st.lotIndex ?? 0;
          currentPrice = st.currentPrice ?? (players[lotIndex] ? players[lotIndex].basePrice : 40);
          leadingBidderId = st.leadingBidderId ?? null;
          timerSeconds = st.timerSeconds ?? 30;
          auctionState = st.auctionState ?? 'LIVE';
          passedFranchises = new Set(st.passedFranchises || []);
          activeBucketIndex = st.activeBucketIndex ?? 0;
          auctionRound = st.auctionRound ?? 1;
          drawMode = st.drawMode ?? 'AUTO';
        } else {
          if (players[lotIndex]) {
            currentPrice = players[lotIndex].basePrice;
          }
        }
      } catch (e) {
        console.error("DB Load error:", e);
      }
    }

    function resetDatabaseToDefaults() {
      if (!confirm("Are you sure you want to reset all tournament data to factory defaults?")) return;
      localStorage.removeItem("ACC_FRANCHISES_DB_V2");
      localStorage.removeItem("ACC_PLAYERS_DB_V2");
      localStorage.removeItem("ACC_SALES_DB_V2");
      localStorage.removeItem("ACC_AUDIT_DB_V2");
      localStorage.removeItem("ACC_STATE_DB_V2");
      franchises = JSON.parse(JSON.stringify(INITIAL_FRANCHISES));
      players = JSON.parse(JSON.stringify(INITIAL_PLAYERS));
      lotIndex = 0;
      currentPrice = players[0].basePrice;
      leadingBidderId = null;
      timerSeconds = 30;
      passedFranchises.clear();
      saveDatabase();
      showToast("Tournament reset to factory defaults", "success");
      renderCurrentView();
    }

    // ========================================================
    // 3. STRICT 4:3 PHOTO CROP & CONVERT UTILITY
    // ========================================================
    function process4to3Photo(file, callback) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const targetWidth = 800;
          const targetHeight = 600; // Strict 4:3
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext("2d");

          // Calculate center crop covering 4:3
          const imgAspect = img.width / img.height;
          const targetAspect = 4 / 3;
          let renderW, renderH, offsetX, offsetY;

          if (imgAspect > targetAspect) {
            renderH = img.height;
            renderW = img.height * targetAspect;
            offsetX = (img.width - renderW) / 2;
            offsetY = 0;
          } else {
            renderW = img.width;
            renderH = img.width / targetAspect;
            offsetX = 0;
            offsetY = (img.height - renderH) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, renderW, renderH, 0, 0, targetWidth, targetHeight);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          callback(dataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    // ========================================================
    // 4. AUCTION CORE ENGINE & RULES
    // ========================================================
    // No jump bidding rule:
    // +10 below 100, +20 from 100 to 199, +30 at 200 and above
    function getBidIncrement(price) {
      if (price < 100) return 10;
      if (price < 200) return 20;
      return 30;
    }

    // Authoritative Max Bid Formula:
    // maxBid = purse - (slotsToFill - 1) * 20
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
      for (const b of BUCKET_SEQUENCE) {
        const remainingUnsold = players.filter(p => p.bucket === b && p.status === 'UNSOLD').length;
        const totalNeeded = franchises.reduce((acc, f) => {
          const got = (f.buckets && f.buckets[b]) || 0;
          const need = (f.needed && f.needed[b]) || 0;
          return acc + Math.max(0, need - got);
        }, 0);
        if (remainingUnsold <= totalNeeded && totalNeeded > 0) {
          return { scarce: true, bucket: b, remaining: remainingUnsold, required: totalNeeded };
        }
      }
      return { scarce: false };
    }

    // UI Helper: Toast
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

    // UI Helper: Speeder loader
    function showSpeeder(title, subtitle, duration = 400) {
      const overlay = document.getElementById("speederOverlay");
      const t = document.getElementById("speederMsg");
      const s = document.getElementById("speederSub");
      if (t) t.innerText = title;
      if (s) s.innerText = subtitle;
      if (overlay) overlay.classList.remove("hidden");
      setTimeout(() => {
        if (overlay) overlay.classList.add("hidden");
      }, duration);
    }

    // --------------------------------------------------------
    // BIDDING ENGINE:
    // - Bidding opens at player's base price
    // - Subsequent taps increment by ladder (+10, +20, +30)
    // - Timer resets in full to 20s
    // - Reversible pass is un-passed
    // --------------------------------------------------------
    function placeBid(fid) {
      if (auctionState === "PAUSED") {
        showToast("Auction is currently paused", "error");
        return false;
      }
      const f = franchises.find(x => x.id === fid);
      if (!f) return false;

      const cur = players[lotIndex];
      let nextPrice;

      // Bidding opens at player's base price
      if (leadingBidderId === null) {
        nextPrice = cur.basePrice;
      } else {
        const inc = getBidIncrement(currentPrice);
        nextPrice = currentPrice + inc;
      }

      const maxLegal = calculateMaxBid(f);
      if (nextPrice > maxLegal) {
        showToast(`BID BLOCKED for ${f.name}: Maximum legal bid is ${maxLegal}C (must preserve credits for squad quotas).`, "error");
        return false;
      }

      currentPrice = nextPrice;
      leadingBidderId = fid;
      passedFranchises.delete(fid); // Auto un-pass if re-entering with a bid

      // Timer resets in full every time regardless of how little time remained
      timerSeconds = 20;

      const timeStr = new Date().toLocaleTimeString('en-GB');
      bidHistory.unshift({ price: currentPrice, bidder: f.name, t: timeStr });
      if (bidHistory.length > 8) bidHistory.pop();

      auditLog.unshift({
        id: auditLog.length + 1,
        time: timeStr,
        who: f.name,
        role: "Franchise",
        type: "BID",
        msg: `${f.name} placed bid of ${currentPrice}C for LOT #${cur.id} (${cur.name})`
      });

      showToast(`BID ACCEPTED: ${f.name} at ${currentPrice}C`, "success");
      saveDatabase();
      broadcastAuctionState();
      renderCurrentView();
      return true;
    }

    // --------------------------------------------------------
    // PASS & RE-ENTER (REVERSIBLE BEFORE HAMMER)
    // --------------------------------------------------------
    function passLot(fid) {
      const f = franchises.find(x => x.id === fid);
      if (!f) return;
      passedFranchises.add(fid);
      showToast(`${f.name} has PASSED (Reversible before hammer)`, "info");
      saveDatabase();
      broadcastAuctionState();
      renderCurrentView();
    }

    function reEnterLot(fid) {
      const f = franchises.find(x => x.id === fid);
      if (!f) return;
      passedFranchises.delete(fid);
      showToast(`${f.name} RE-ENTERED the lot!`, "success");
      saveDatabase();
      broadcastAuctionState();
      renderCurrentView();
    }

    // --------------------------------------------------------
    // HAMMER CONTROLS:
    // - Sale completes ONLY when Super Admin presses hammer
    // - Timer expiring does NOT sell player
    // - With no bids, hammer marks player UNSOLD
    // --------------------------------------------------------
    function openHammerConfirmModal() {
      const cur = players[lotIndex];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const modal = document.getElementById("modalContainer");

      if (leader) {
        // Hammer SALE
        modal.innerHTML = `
          <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-dialog" onclick="event.stopPropagation()">
              <div style="padding: 24px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span class="eyebrow" style="color: var(--auction);">SUPER ADMIN FINAL VERIFICATION</span>
                  <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright); margin-top: 2px;">CONFIRM HAMMER SALE</div>
                </div>
                <button class="btn btn-secondary" style="padding: 4px 8px; min-height: 32px;" onclick="closeModal()">✕</button>
              </div>
              <div style="padding: 24px;">
                <div style="background: var(--bg-card); border: 1px solid var(--border-medium); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                  <div style="font-size: 13px; color: var(--text-dim);">PLAYER</div>
                  <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright);">${cur.name} (${cur.bucket} • ${cur.type})</div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
                    <div>
                      <span class="eyebrow">FINAL WINNING BID</span>
                      <div class="sports-price" style="font-size: 32px; color: var(--auction);">${currentPrice} C</div>
                    </div>
                    <div>
                      <span class="eyebrow">BUYING FRANCHISE</span>
                      <div style="font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--primary);">${leader.name}</div>
                      <div style="font-size: 11px; color: var(--text-dim);">Rem. Purse: ${leader.purse - currentPrice}C</div>
                    </div>
                  </div>
                </div>
                <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 24px;">
                  Striking the hammer commits this purchase to the immutable ledger. Credits will be deducted from <strong>${leader.name}</strong>'s purse and the player will be bound to their official squad dossier.
                </p>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                  <button class="btn btn-secondary" onclick="closeModal()">CANCEL</button>
                  <button class="btn btn-auction" style="padding: 12px 28px; font-size: 15px;" onclick="executeHammerSale()">
                    🔨 HAMMER SALE & COMMIT
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        // Hammer UNSOLD
        modal.innerHTML = `
          <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-dialog" onclick="event.stopPropagation()">
              <div style="padding: 24px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span class="eyebrow" style="color: var(--danger);">SUPER ADMIN HAMMER</span>
                  <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright); margin-top: 2px;">MARK PLAYER UNSOLD</div>
                </div>
                <button class="btn btn-secondary" style="padding: 4px 8px; min-height: 32px;" onclick="closeModal()">✕</button>
              </div>
              <div style="padding: 24px;">
                <div style="background: var(--bg-card); border: 1px solid var(--border-medium); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                  <div style="font-size: 13px; color: var(--text-dim);">LOT #${cur.id}</div>
                  <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright);">${cur.name} (${cur.bucket} • ${cur.type})</div>
                  <div style="margin-top: 10px; color: var(--danger); font-weight: 700; font-size: 14px;">
                    No bids received at Opening Base Price (${cur.basePrice}C).
                  </div>
                </div>
                <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 24px;">
                  Striking the hammer without bids marks this candidate as <strong>UNSOLD</strong>. The player will be placed into the Round 2 pool for accelerated recall or auto-allotment.
                </p>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                  <button class="btn btn-secondary" onclick="closeModal()">CANCEL</button>
                  <button class="btn btn-danger" style="padding: 12px 28px; font-size: 15px;" onclick="executeHammerUnsold()">
                    🔨 HAMMER UNSOLD & ADVANCE
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }

    function executeHammerSale() {
      closeModal();
      const cur = players[lotIndex];
      const leader = franchises.find(f => f.id === leadingBidderId);
      if (!leader) return;

      leader.purse -= currentPrice;
      leader.bought = (leader.bought || 0) + 1;
      if (!leader.buckets) leader.buckets = {};
      leader.buckets[cur.bucket] = (leader.buckets[cur.bucket] || 0) + 1;

      cur.status = "SOLD";
      cur.soldTo = leader.id;
      cur.soldPrice = currentPrice;

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

      auditLog.unshift({
        id: auditLog.length + 1,
        time: new Date().toLocaleTimeString('en-GB'),
        who: currentUser.name || "TOURNAMENT DIRECTOR",
        role: currentUser.role,
        type: "HAMMER",
        msg: `HAMMER STUCK: LOT #${cur.id} ${cur.name} SOLD to ${leader.name} for ${currentPrice}C.`
      });

      showSpeeder(`HAMMER STRUCK: SOLD!`, `${cur.name} joins ${leader.name} for ${currentPrice}C`, 1000);
      showToast(`HAMMER STRUCK: SOLD to ${leader.name} for ${currentPrice}C`, "success");

      saveDatabase();
      broadcastAuctionState();
      setTimeout(() => {
        drawNextPlayer();
      }, 1000);
    }

    function executeHammerUnsold() {
      closeModal();
      const cur = players[lotIndex];
      cur.status = "UNSOLD";

      auditLog.unshift({
        id: auditLog.length + 1,
        time: new Date().toLocaleTimeString('en-GB'),
        who: currentUser.name || "TOURNAMENT DIRECTOR",
        role: currentUser.role,
        type: "HAMMER_UNSOLD",
        msg: `HAMMER STUCK: LOT #${cur.id} ${cur.name} marked UNSOLD. Moved to Round 2 pool.`
      });

      showToast(`LOT #${cur.id} ${cur.name} marked UNSOLD`, "info");
      saveDatabase();
      broadcastAuctionState();
      drawNextPlayer();
    }

    function closeModal() {
      const modal = document.getElementById("modalContainer");
      if (modal) modal.innerHTML = "";
    }

    // --------------------------------------------------------
    // LOT DISPATCH & RECALL
    // --------------------------------------------------------
    function skipPlayer() {
      const cur = players[lotIndex];
      cur.status = "SKIPPED";
      bucketRecallQueue.push(cur);

      auditLog.unshift({
        id: auditLog.length + 1,
        time: new Date().toLocaleTimeString('en-GB'),
        who: currentUser.name || "OPERATOR",
        role: currentUser.role,
        type: "SKIP",
        msg: `Skipped LOT #${cur.id} ${cur.name}. Queued for bucket recall.`
      });

      showToast(`LOT #${cur.id} ${cur.name} SKIPPED (Queued for recall)`, "info");
      saveDatabase();
      broadcastAuctionState();
      drawNextPlayer();
    }

    function drawNextPlayer() {
      let nextIdx = -1;
      const curBucket = BUCKET_SEQUENCE[activeBucketIndex];

      const remainingInBucket = players.findIndex((p, idx) => idx > lotIndex && p.bucket === curBucket && p.status === "UNSOLD");
      if (remainingInBucket !== -1) {
        nextIdx = remainingInBucket;
      } else {
        const anyInBucket = players.findIndex(p => p.bucket === curBucket && p.status === "UNSOLD");
        if (anyInBucket !== -1) {
          nextIdx = anyInBucket;
        } else {
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
        nextIdx = players.findIndex(p => p.status === "UNSOLD");
      }

      if (nextIdx !== -1) {
        lotIndex = nextIdx;
        const nextP = players[lotIndex];
        currentPrice = nextP.basePrice;
        leadingBidderId = null;
        passedFranchises.clear();
        timerSeconds = 30; // 30 seconds for the first bid

        showToast(`DRAW LOT #${nextP.id}: ${nextP.name} (${nextP.bucket} • Base ${nextP.basePrice}C)`, "success");
        saveDatabase();
        broadcastAuctionState();
        renderCurrentView();
      } else {
        showToast("All available players in Round 1 processed. Ready for Round 2!", "info");
        saveDatabase();
        broadcastAuctionState();
        renderCurrentView();
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
      saveDatabase();
      broadcastAuctionState();
      renderCurrentView();
    }

    // --------------------------------------------------------
    // TIMER ENGINE:
    // - 30s initial, 20s subsequent
    // - Full reset
    // - Runs full course even if all pass
    // - Expiry does not auto-sell
    // --------------------------------------------------------
    function startTimer() {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (auctionState === "LIVE" && timerSeconds > 0) {
          timerSeconds--;
          updateTimerUI();
          if (timerSeconds === 0) {
            // Reached zero: timer expired does NOT sell player
            // Highlight timer in red
          }
        }
      }, 1000);
    }

    function updateTimerUI() {
      const timerDigits = document.querySelectorAll(".timer-digit");
      timerDigits.forEach(el => {
        el.innerText = `${timerSeconds}s`;
        if (timerSeconds <= 5) {
          el.style.color = "var(--rose-600)";
        } else if (timerSeconds <= 10) {
          el.style.color = "var(--amber-500)";
        } else {
          el.style.color = "var(--emerald-600)";
        }
      });

      // Update SVG circular rings
      const circles = document.querySelectorAll(".timer-ring-circle");
      circles.forEach(circle => {
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const maxTime = (leadingBidderId === null) ? 30 : 20;
        const offset = circumference - (Math.max(0, timerSeconds) / maxTime) * circumference;
        circle.style.strokeDashoffset = offset;

        if (timerSeconds <= 5) {
          circle.style.stroke = "var(--rose-600)";
          circle.classList.add("timer-pulse-danger");
        } else if (timerSeconds <= 10) {
          circle.style.stroke = "var(--amber-500)";
          circle.classList.remove("timer-pulse-danger");
        } else {
          circle.style.stroke = "var(--emerald-600)";
          circle.classList.remove("timer-pulse-danger");
        }
      });
    }

    // --------------------------------------------------------
    // FORENSIC MULTI-SALE UNDO (SUPER ADMIN)
    // --------------------------------------------------------
    function openUndoModal() {
      const modal = document.getElementById("modalContainer");
      modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" style="max-width: 720px;" onclick="event.stopPropagation()">
            <div style="padding: 24px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span class="eyebrow" style="color: var(--danger);">SUPER ADMIN FORENSIC ROLLBACK</span>
                <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright); margin-top: 2px;">REVERSE COMMITTED AUCTION SALE</div>
              </div>
              <button class="btn btn-secondary" style="padding: 4px 8px; min-height: 32px;" onclick="closeModal()">✕</button>
            </div>
            <div style="padding: 24px;">
              <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
                Select a completed sale from the ledger to reverse. Credits will be refunded to the franchise, squad limits restored, and the lot marked as unsold.
              </p>
              <div style="display: flex; flex-direction: column; gap: 10px; max-height: 360px; overflow-y: auto;">
                ${salesHistory.map(sale => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px;">
                    <div>
                      <div style="font-weight: 800; color: var(--text-bright);">${sale.playerName} (${sale.bucket})</div>
                      <div style="font-size: 12px; color: var(--text-dim);">${sale.franchiseName} • ${sale.price}C • ${sale.timestamp}</div>
                    </div>
                    <button class="btn btn-danger" style="font-size: 12px; padding: 6px 14px; min-height: 32px;" onclick="executeUndoSale('${sale.id}')">
                      REVERSE SALE
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function executeUndoSale(saleId) {
      const idx = salesHistory.findIndex(s => s.id === saleId);
      if (idx === -1) return;
      const sale = salesHistory[idx];

      const f = franchises.find(x => x.id === sale.franchiseId);
      if (f) {
        f.purse += sale.price;
        f.bought = Math.max(0, (f.bought || 1) - 1);
        if (f.buckets && f.buckets[sale.bucket]) {
          f.buckets[sale.bucket] = Math.max(0, f.buckets[sale.bucket] - 1);
        }
      }

      const p = players.find(x => x.id === sale.lotId || x.name === sale.playerName);
      if (p) {
        p.status = "UNSOLD";
        delete p.soldTo;
        delete p.soldPrice;
      }

      salesHistory.splice(idx, 1);

      auditLog.unshift({
        id: auditLog.length + 1,
        time: new Date().toLocaleTimeString('en-GB'),
        who: currentUser.name || "SUPER ADMIN",
        role: "SUPER_ADMIN",
        type: "UNDO",
        msg: `FORENSIC UNDO: Reverted sale ${sale.id} for ${sale.playerName}. Refunded ${sale.price}C to ${sale.franchiseName}.`
      });

      closeModal();
      showToast(`Sale ${sale.id} reversed. Refunded ${sale.price}C to ${sale.franchiseName}`, "success");
      saveDatabase();
      broadcastAuctionState();
      renderCurrentView();
    }

    // ========================================================
    // 5. ROLL NUMBER PARSER & DISCIPLINE DERIVATION
    // ========================================================
    function parseRoll(roll) {
      if (!roll) return { valid: false, program: "B.Tech", branch: "CSE", year: "3rd Year", bucket: "B3" };
      roll = roll.trim().toUpperCase();

      // B.Tech Format: YY591-A-bbnn or YY591Abbnn
      let btechMatch = roll.match(/^(\d{2})591-?A-?(01|02|03|04|05|12|42|43|44|54)[0-9A-Z]{2}$/i);
      if (btechMatch) {
        const yearMap = { "22": { b: "B4", y: "4th Year" }, "23": { b: "B3", y: "3rd Year" }, "24": { b: "B2", y: "2nd Year" }, "25": { b: "B1", y: "1st Year" } };
        const branchMap = { "01": "CIVIL", "02": "EEE", "03": "MECH", "04": "ECE", "05": "CSE", "12": "IT", "42": "CSM", "43": "CAI", "44": "CSD", "54": "AID" };
        const yr = yearMap[btechMatch[1]] || { b: "B3", y: "3rd Year" };
        return { valid: true, program: "B.Tech", branch: branchMap[btechMatch[2]] || "ECE", year: yr.y, bucket: yr.b };
      }

      // Diploma Format: YY597-BB-nnn or YY597BBnnn
      let dipMatch = roll.match(/^(\d{2})597-?([A-Z]{2})-?\d{3}$/i);
      if (dipMatch) {
        const dipBranch = dipMatch[2].toUpperCase();
        return { valid: true, program: "Diploma", branch: "D" + dipBranch, year: "3rd Year", bucket: "B5" };
      }

      // PG Format
      let pgMatch = roll.match(/^(\d{2})591-?E-?\d{4}$/i);
      if (pgMatch) {
        return { valid: true, program: "PG", branch: "MBA", year: "2nd Year", bucket: "PG" };
      }

      return { valid: true, program: "B.Tech", branch: "ECE", year: "3rd Year", bucket: "B3" };
    }

    // ========================================================
    // 6. NAVIGATION & ROUTING
    // ========================================================
    function switchView(viewName) {
      currentView = viewName;
      window.location.hash = viewName;

      // Update Nav Buttons
      document.querySelectorAll(".nav-tab-btn").forEach(btn => {
        if (btn.dataset.view === viewName) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      // Projector class toggle
      if (viewName === "projector") {
        document.body.classList.add("projector-active");
      } else {
        document.body.classList.remove("projector-active");
      }

      renderCurrentView();
    }

    function updateSessionIndicator() {
      const el = document.getElementById("sessionName");
      if (el) el.innerText = currentUser.name;
    }

    function openRoleSwitcherModal() {
      const modal = document.getElementById("modalContainer");
      modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation()">
            <div style="padding: 24px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span class="eyebrow" style="color: var(--primary);">AUTHENTICATION GATEWAY</span>
                <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright); margin-top: 2px;">SELECT ACTIVE ROLE</div>
              </div>
              <button class="btn btn-secondary" style="padding: 4px 8px; min-height: 32px;" onclick="closeModal()">✕</button>
            </div>
            <div style="padding: 24px; display: flex; flex-direction: column; gap: 10px;">
              <button class="btn btn-secondary" style="justify-content: flex-start; padding: 12px 16px;" onclick="setRole('SUPER_ADMIN')">
                👑 Super Admin (Full Governance, Hammer, Undo, Database)
              </button>
              <button class="btn btn-secondary" style="justify-content: flex-start; padding: 12px 16px;" onclick="setRole('OPERATOR')">
                🎮 Floor Operator (Lot Dispatcher, Pause/Resume)
              </button>
              <button class="btn btn-secondary" style="justify-content: flex-start; padding: 12px 16px;" onclick="setRole('FRANCHISE')">
                🏢 Franchise Terminal (Titans Faculty / Bidding)
              </button>
              <button class="btn btn-secondary" style="justify-content: flex-start; padding: 12px 16px;" onclick="setRole('PLAYER')">
                🏏 Registered Player (Arjun Kumar)
              </button>
              <button class="btn btn-secondary" style="justify-content: flex-start; padding: 12px 16px;" onclick="setRole('SPECTATOR')">
                👀 Public Spectator (Read-Only)
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function setRole(r) {
      if (r === 'SUPER_ADMIN') {
        currentUser = { role: 'SUPER_ADMIN', name: 'Dr. V. Prasad (Tournament Director)', title: 'Super Admin' };
      } else if (r === 'OPERATOR') {
        currentUser = { role: 'OPERATOR', name: 'Floor Operator Lead', title: 'Auction Operator' };
      } else if (r === 'FRANCHISE') {
        currentUser = { role: 'FRANCHISE', name: 'Titans Faculty Coordinator', title: 'Franchise Representative', franchiseId: 'titans' };
      } else if (r === 'PLAYER') {
        currentUser = { role: 'PLAYER', name: 'Arjun Kumar', title: 'Registered Player', playerId: '023' };
      } else {
        currentUser = { role: 'SPECTATOR', name: 'Public Guest', title: 'Public Spectator' };
      }
      closeModal();
      updateSessionIndicator();
      showToast(`Switched active role to ${currentUser.name}`, "info");
      renderCurrentView();
    }

    // ========================================================
    // 7. VIEW 1: PUBLIC VIEW (SPECTATOR)
    // ========================================================
    let publicSearchQuery = "";
    let publicBucketFilter = "ALL";

    function renderPublicView() {
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const scarcity = getTournamentScarcity();

      const filteredPlayers = players.filter(p => {
        if (publicSearchQuery && !p.name.toLowerCase().includes(publicSearchQuery.toLowerCase()) && !p.roll.toLowerCase().includes(publicSearchQuery.toLowerCase())) return false;
        if (publicBucketFilter !== "ALL" && p.bucket !== publicBucketFilter) return false;
        return true;
      });

      return `
        <div style="display: flex; flex-direction: column; gap: 24px;">
          ${scarcity.scarce ? `
            <div class="surface-card" style="background: var(--amber-50); border: 1.5px solid var(--amber-500); padding: 14px 20px; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="status-pill pill-orange">⚠ AUDITORIUM ALERT</span>
                <span style="font-weight: 800; color: #92400E;">Bucket ${scarcity.bucket} Scarcity: Only ${scarcity.remaining} players remain for ${scarcity.required} quota demand!</span>
              </div>
              <span class="status-pill pill-green">BIDDING OPEN</span>
            </div>
          ` : ''}

          <!-- LIVE AUCTION SPOTLIGHT CARD -->
          <div class="surface-elevated" style="padding: 28px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
              <span class="status-pill pill-orange">CURRENT ACTIVE LOT #${cur.id}</span>
              <div style="display: flex; gap: 8px;">
                <span class="status-pill pill-blue">BUCKET ${cur.bucket}</span>
                <span class="status-pill pill-green"><div class="pulse-dot"></div>${auctionState}</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 32px; align-items: center;">
              <div style="display: flex; gap: 24px; align-items: center;">
                <div class="aspect-4-3-box" style="width: 140px; border-radius: 12px;">
                  ${cur.photo ? `<img src="${cur.photo}" alt="${cur.name}">` : `<div style="font-size: 48px;">🏏</div>`}
                </div>
                <div>
                  <h1 class="display-title" style="font-size: 32px;">${cur.name}</h1>
                  <div style="font-size: 15px; font-weight: 700; color: var(--emerald-600); margin-top: 4px;">${cur.type}</div>
                  <div style="font-size: 13px; color: var(--text-dim); margin-top: 2px;">
                    ${cur.program} ${cur.branch} • ${cur.year} • Roll: ${cur.roll}
                  </div>
                  <div style="margin-top: 8px; font-size: 13px; font-weight: 700; color: var(--auction);">
                    BASE PRICE: ${cur.basePrice} CREDITS
                  </div>
                </div>
              </div>

              <!-- CIRCULAR TIMER & LIVE PRICE -->
              <div style="display: flex; align-items: center; justify-content: flex-end; gap: 24px;">
                <div class="timer-ring-container">
                  <svg class="timer-ring-svg" width="90" height="90">
                    <circle class="timer-ring-circle-bg" cx="45" cy="45" r="38" stroke-width="6"></circle>
                    <circle class="timer-ring-circle" cx="45" cy="45" r="38" stroke-width="6" stroke-dasharray="238.76" stroke-dashoffset="0" stroke="var(--emerald-600)"></circle>
                  </svg>
                  <div class="timer-ring-text">
                    <span class="sports-price timer-digit" style="font-size: 26px; color: var(--emerald-600);">${timerSeconds}s</span>
                    <span style="font-size: 9px; font-weight: 700; color: var(--text-faint);">CLOCK</span>
                  </div>
                </div>

                <div style="text-align: right;">
                  <span class="eyebrow">CURRENT AUTHORITATIVE BID</span>
                  <div class="sports-price" style="font-size: 48px; color: var(--auction);">${currentPrice} <span style="font-size: 24px; color: var(--text-dim);">C</span></div>
                  <div style="font-size: 13px; font-weight: 800; color: var(--text-bright);">
                    LEADER: ${leader ? `<span style="color: ${leader.color};">${leader.name}</span>` : `<span style="color: var(--text-dim);">NO BIDS YET</span>`}
                  </div>
                </div>
              </div>
            </div>

            <!-- 11 FRANCHISES LIVE TICKER -->
            <div style="margin-top: 24px; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
              <span class="eyebrow" style="margin-bottom: 8px; display: block;">11 FRANCHISES LIVE AUCTION STATUS</span>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px;">
                ${franchises.map(f => {
                  const isLead = f.id === leadingBidderId;
                  const hasPassed = passedFranchises.has(f.id);
                  const maxLegal = calculateMaxBid(f);
                  const isBlocked = (currentPrice + getBidIncrement(currentPrice)) > maxLegal;

                  let statusText = isLead ? "LEAD" : (hasPassed ? "PASSED" : (isBlocked ? "BLOCKED" : "ACTIVE"));
                  let pillClass = isLead ? "pill-orange" : (hasPassed ? "pill-grey" : (isBlocked ? "pill-red" : "pill-green"));

                  return `
                    <div style="background: rgba(255,255,255,0.7); border: 1px solid ${isLead ? 'var(--amber-500)' : 'var(--border-subtle)'}; border-radius: 8px; padding: 6px; text-align: center;">
                      <div style="font-size: 11px; font-weight: 800; color: var(--text-bright);">${f.short}</div>
                      <span class="status-pill ${pillClass}" style="font-size: 9px; padding: 2px 6px; margin: 4px 0;">${statusText}</span>
                      <div style="font-size: 11px; font-family: var(--font-mono); font-weight: 700; color: var(--emerald-600);">${f.purse}C</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- TOURNAMENT PLAYER POOL ROSTER -->
          <div class="surface-card" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
              <div>
                <h3 style="font-family: var(--font-display); font-size: 18px; font-weight: 800;">TOURNAMENT CANDIDATE REGISTRY</h3>
                <div style="font-size: 12px; color: var(--text-dim);">Live pool of registered, verified student athletes.</div>
              </div>
              <div style="display: flex; gap: 10px;">
                <input type="text" placeholder="Search name or roll..." class="form-input" style="width: 220px; height: 38px; font-size: 12px;" value="${publicSearchQuery}" oninput="publicSearchQuery = this.value; renderCurrentView();">
                <select class="form-select" style="width: 110px; height: 38px; font-size: 12px;" onchange="publicBucketFilter = this.value; renderCurrentView();">
                  <option value="ALL">All Buckets</option>
                  <option value="B1">Bucket B1</option>
                  <option value="B2">Bucket B2</option>
                  <option value="B3">Bucket B3</option>
                  <option value="B4">Bucket B4</option>
                  <option value="B5">Bucket B5</option>
                  <option value="PG">Bucket PG</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;">
              ${filteredPlayers.map(p => `
                <div class="surface-subtle" style="padding: 14px; border: 1px solid var(--border-subtle); border-radius: 10px; display: flex; gap: 12px; align-items: center;">
                  <div class="aspect-4-3-box" style="width: 60px; border-radius: 8px;">
                    ${p.photo ? `<img src="${p.photo}" alt="${p.name}">` : `<div style="font-size: 24px;">🏏</div>`}
                  </div>
                  <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-weight: 800; font-size: 13px; color: var(--text-bright); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.name}</span>
                      <span class="status-pill ${p.status === 'SOLD' ? 'pill-green' : (p.status === 'SKIPPED' ? 'pill-grey' : 'pill-blue')}" style="font-size: 9px; padding: 2px 6px;">${p.status}</span>
                    </div>
                    <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">${p.bucket} • ${p.type}</div>
                    <div style="font-size: 11px; font-weight: 700; color: var(--auction); margin-top: 2px;">Base: ${p.basePrice}C</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // ========================================================
    // 8. VIEW 2: LIVE AUCTION FLOOR
    // ========================================================
    function renderLiveAuctionView() {
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const inc = getBidIncrement(currentPrice);
      const nextBid = (leadingBidderId === null) ? cur.basePrice : (currentPrice + inc);

      return `
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- MAIN FLOOR LOT STAGE -->
          <div class="surface-elevated" style="padding: 32px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <span class="status-pill pill-orange" style="font-size: 12px;">LOT #${cur.id} • SCOPED #${cur.scopedNum}</span>
              <span class="status-pill pill-blue">BUCKET ${cur.bucket} (${cur.year})</span>
            </div>

            <div style="display: flex; gap: 32px; align-items: center; margin-bottom: 28px;">
              <div class="aspect-4-3-box" style="width: 220px; border-radius: 16px; box-shadow: var(--glass-shadow-lg);">
                ${cur.photo ? `<img src="${cur.photo}" alt="${cur.name}">` : `<div style="font-size: 72px;">🏏</div>`}
              </div>
              <div>
                <h1 class="display-title" style="font-size: 36px;">${cur.name}</h1>
                <div style="font-size: 18px; font-weight: 700; color: var(--emerald-600); margin-top: 6px;">${cur.type}</div>
                <div style="font-size: 14px; color: var(--text-dim); margin-top: 4px;">
                  ${cur.program} ${cur.branch} • Roll: ${cur.roll}
                </div>
                <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                  ${(cur.tags || []).map(t => `<span class="status-pill pill-grey" style="font-size: 10px;">${t}</span>`).join('')}
                </div>
              </div>
            </div>

            <!-- BID LADDER & CLOCK BANNER -->
            <div style="background: rgba(255, 255, 255, 0.9); border: 1px solid var(--border-medium); border-radius: 16px; padding: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center;">
              <div>
                <span class="eyebrow">CURRENT AUTHORITATIVE BID</span>
                <div class="sports-price" style="font-size: 56px; color: var(--auction); line-height: 1; margin: 6px 0;">
                  ${currentPrice} <span style="font-size: 28px; color: var(--text-dim);">C</span>
                </div>
                <div style="font-size: 12px; color: var(--text-dim);">
                  BASE: <strong>${cur.basePrice}C</strong> • NEXT BID: <strong>${nextBid}C (+${inc}C)</strong>
                </div>
              </div>

              <div style="display: flex; align-items: center; justify-content: flex-end; gap: 20px;">
                <div class="timer-ring-container">
                  <svg class="timer-ring-svg" width="100" height="100">
                    <circle class="timer-ring-circle-bg" cx="50" cy="50" r="42" stroke-width="7"></circle>
                    <circle class="timer-ring-circle" cx="50" cy="50" r="42" stroke-width="7" stroke-dasharray="263.89" stroke-dashoffset="0" stroke="var(--emerald-600)"></circle>
                  </svg>
                  <div class="timer-ring-text">
                    <span class="sports-price timer-digit" style="font-size: 30px; color: var(--emerald-600);">${timerSeconds}s</span>
                    <span style="font-size: 9px; font-weight: 700; color: var(--text-faint);">TIMER</span>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span class="eyebrow">LEADING TEAM</span>
                  <div style="font-family: var(--font-display); font-size: 24px; font-weight: 800; color: ${leader ? leader.color : 'var(--text-dim)'}; margin-top: 4px;">
                    ${leader ? leader.name : "AWAITING OPENING BID"}
                  </div>
                </div>
              </div>
            </div>

            <!-- BID HISTORY TRAIL -->
            <div style="margin-top: 24px;">
              <span class="eyebrow" style="margin-bottom: 8px; display: block;">LIVE LOT BID STREAM</span>
              <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px;">
                ${bidHistory.map(b => `
                  <div class="surface-subtle" style="padding: 8px 14px; border-radius: 8px; border: 1px solid var(--border-subtle); flex-shrink: 0;">
                    <div style="font-weight: 800; font-size: 14px; color: var(--auction);">${b.price}C</div>
                    <div style="font-size: 11px; font-weight: 700; color: var(--text-bright);">${b.bidder}</div>
                    <div style="font-size: 9px; color: var(--text-faint);">${b.t}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- RIGHT SIDEBAR: 11 TEAMS STATUS -->
          <div class="surface-card" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
            <div>
              <h3 style="font-family: var(--font-display); font-size: 16px; font-weight: 800;">FRANCHISE ROSTER STATUS</h3>
              <div style="font-size: 11px; color: var(--text-dim);">Live purse & qualification tracking.</div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 520px; overflow-y: auto;">
              ${franchises.map(f => {
                const isLead = f.id === leadingBidderId;
                const hasPassed = passedFranchises.has(f.id);
                const maxLegal = calculateMaxBid(f);
                const isBlocked = nextBid > maxLegal;

                let badge = isLead ? `<span class="status-pill pill-orange">LEAD</span>` : (hasPassed ? `<span class="status-pill pill-grey">PASSED</span>` : (isBlocked ? `<span class="status-pill pill-red">BLOCKED</span>` : `<span class="status-pill pill-green">IN PLAY</span>`));

                return `
                  <div style="background: rgba(255,255,255,0.7); border: 1px solid ${isLead ? 'var(--amber-500)' : 'var(--border-subtle)'}; border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-weight: 800; font-size: 13px; color: var(--text-bright);">${f.name}</div>
                      <div style="font-size: 11px; color: var(--text-dim);">Max Legal: ${maxLegal}C • Squad: ${f.bought}/15</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-family: var(--font-mono); font-weight: 800; color: var(--emerald-600); font-size: 13px;">${f.purse}C</div>
                      <div style="margin-top: 4px;">${badge}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // ========================================================
    // 9. VIEW 3: FRANCHISE TERMINAL (BIDDING & REVERSIBLE PASS)
    // ========================================================
    function renderFranchiseTerminalView() {
      const f = franchises.find(x => x.id === currentUser.franchiseId) || franchises[0];
      const cur = players[lotIndex] || players[0];
      const isLead = f.id === leadingBidderId;
      const hasPassed = passedFranchises.has(f.id);
      const inc = getBidIncrement(currentPrice);
      const nextBid = (leadingBidderId === null) ? cur.basePrice : (currentPrice + inc);
      const maxLegal = calculateMaxBid(f);
      const canBid = nextBid <= maxLegal && auctionState === "LIVE" && !isLead;

      return `
        <div style="max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
          <!-- FRANCHISE BANNER -->
          <div class="surface-elevated" style="padding: 24px; border-left: 6px solid ${f.color};">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
              <div>
                <span class="eyebrow" style="color: ${f.color};">OFFICIAL BIDDING CONSOLE</span>
                <h1 class="display-title" style="font-size: 28px; margin-top: 2px;">${f.name} WAR ROOM</h1>
                <div style="font-size: 13px; color: var(--text-dim);">Faculty: ${f.faculty} • Captain: ${f.captain}</div>
              </div>
              <div style="display: flex; gap: 16px; text-align: right;">
                <div>
                  <span class="eyebrow">REMAINING PURSE</span>
                  <div class="sports-price" style="font-size: 32px; color: var(--emerald-600);">${f.purse} C</div>
                </div>
                <div>
                  <span class="eyebrow">MAX AUTHORITATIVE BID</span>
                  <div class="sports-price" style="font-size: 32px; color: var(--amber-600);">${maxLegal} C</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ACTIVE LOT ACTION CARD -->
          <div class="surface-card" style="padding: 28px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <span class="status-pill pill-orange">LOT #${cur.id} • BUCKET ${cur.bucket}</span>
              <span class="status-pill ${hasPassed ? 'pill-grey' : (isLead ? 'pill-orange' : 'pill-green')}">
                ${hasPassed ? 'YOU HAVE PASSED' : (isLead ? 'YOU ARE LEADING' : 'IN PLAY')}
              </span>
            </div>

            <div style="display: flex; gap: 24px; align-items: center; margin-bottom: 24px;">
              <div class="aspect-4-3-box" style="width: 140px; border-radius: 12px;">
                ${cur.photo ? `<img src="${cur.photo}" alt="${cur.name}">` : `<div style="font-size: 54px;">🏏</div>`}
              </div>
              <div>
                <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 800;">${cur.name}</h2>
                <div style="font-size: 15px; font-weight: 700; color: var(--emerald-600);">${cur.type}</div>
                <div style="font-size: 13px; color: var(--text-dim); margin-top: 4px;">
                  ${cur.program} ${cur.branch} • Base Price: <strong>${cur.basePrice}C</strong>
                </div>
              </div>
            </div>

            <div style="background: rgba(255,255,255,0.85); border: 1px solid var(--border-medium); border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
              <div>
                <span class="eyebrow">CURRENT BID</span>
                <div class="sports-price" style="font-size: 40px; color: var(--auction);">${currentPrice} C</div>
              </div>
              <div style="text-align: center;">
                <span class="eyebrow">TIMER</span>
                <div class="sports-price timer-digit" style="font-size: 32px; color: var(--emerald-600);">${timerSeconds}s</div>
              </div>
              <div style="text-align: right;">
                <span class="eyebrow">YOUR NEXT BID</span>
                <div class="sports-price" style="font-size: 40px; color: var(--emerald-600);">${nextBid} C</div>
              </div>
            </div>

            <!-- ACTION CONTROLS: BID & REVERSIBLE PASS -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px;">
              <button class="btn btn-primary" style="height: 54px; font-size: 18px;" ${canBid ? '' : 'disabled'} onclick="placeBid('${f.id}')">
                ⚡ BID ${nextBid} CREDITS
              </button>

              ${hasPassed ? `
                <button class="btn btn-secondary" style="height: 54px; font-size: 15px;" onclick="reEnterLot('${f.id}')">
                  ↺ RE-ENTER LOT
                </button>
              ` : `
                <button class="btn btn-secondary" style="height: 54px; font-size: 15px; color: var(--text-muted);" onclick="passLot('${f.id}')">
                  PASS LOT
                </button>
              `}
            </div>

            ${!canBid && nextBid > maxLegal ? `
              <div style="margin-top: 14px; color: var(--danger); font-size: 12px; font-weight: 700; text-align: center;">
                ⚠ BID DISABLED: ${nextBid}C exceeds your maximum legal bid of ${maxLegal}C (required reserve for squad slots).
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // ========================================================
    // 10. VIEW 4: 11 TEAMS DOSSIERS & SQUADS
    // ========================================================
    function render11FranchisesView() {
      return `
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div class="surface-elevated" style="padding: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
            <div>
              <span class="eyebrow" style="color: var(--primary);">OFFICIAL TOURNAMENT REGISTRY</span>
              <h1 class="display-title" style="font-size: 32px;">11 PARTICIPATING FRANCHISES</h1>
              <div style="font-size: 13px; color: var(--text-dim);">Dossiers, Faculty Coordinators, Captains, and Authorized Squads.</div>
            </div>
            <button class="btn btn-primary" onclick="switchView('franchise')">
              ENTER FRANCHISE TERMINAL →
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
            ${franchises.map(f => `
              <div class="surface-card" style="padding: 20px; border-top: 4px solid ${f.color};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                  <div>
                    <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright);">${f.name}</h3>
                    <div style="font-size: 11px; font-weight: 700; color: var(--text-dim);">${f.dept} Department</div>
                  </div>
                  <div class="sports-price" style="font-size: 22px; color: var(--emerald-600);">${f.purse}C</div>
                </div>

                <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 14px;">
                  <div class="aspect-4-3-box" style="width: 70px; border-radius: 8px;">
                    ${f.ownerPhoto ? `<img src="${f.ownerPhoto}" alt="${f.name} Owner">` : `<div style="font-size: 28px;">👔</div>`}
                  </div>
                  <div style="font-size: 12px;">
                    <div style="font-weight: 700; color: var(--text-bright);">Faculty: ${f.faculty}</div>
                    <div style="color: var(--text-dim);">Captain: ${f.captain}</div>
                    <div style="color: var(--text-dim);">Phone: ${f.mobile}</div>
                  </div>
                </div>

                <div style="border-top: 1px solid var(--border-subtle); padding-top: 10px; display: flex; justify-content: space-between; font-size: 12px;">
                  <span>Squad Acquired: <strong>${f.bought || 0}/15</strong></span>
                  <span style="color: var(--amber-600); font-weight: 700;">Max Bid: ${calculateMaxBid(f)}C</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // ========================================================
    // 11. VIEW 5: PLAYER REGISTRATION (BASE PRICE & 4:3 PHOTO)
    // ========================================================
    let regRoll = "23591-A-0402";
    let regBatting = "yes";
    let regBowling = "yes";
    let regFielding = "no";
    let regBasePrice = 40;
    let regPhotoDataUrl = null;
    let regName = "";

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
            <div style="font-size: 13px; color: var(--text-dim); margin-top: 4px;">Submit verified academic credentials, cricket profile, base price, and photo.</div>
          </div>

          <div class="surface-card" style="padding: 24px;">
            <!-- CANDIDATE FULL NAME -->
            <div class="form-group">
              <label class="form-label">CANDIDATE FULL NAME</label>
              <input type="text" class="form-input" placeholder="e.g. Arjun Kumar" value="${regName}" oninput="regName = this.value;">
            </div>

            <!-- ROLL NUMBER WITH AUTO-PARSING -->
            <div class="form-group">
              <label class="form-label">STUDENT ROLL NUMBER (B.TECH YY591-A-BBNN / DIPLOMA YY597-BB-NNN)</label>
              <input type="text" class="form-input" value="${regRoll}" oninput="regRoll = this.value; renderCurrentView();">
            </div>

            <!-- PARSED ACADEMIC BADGES -->
            <div style="background: rgba(5, 150, 105, 0.08); border: 1px solid rgba(5, 150, 105, 0.25); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
              <span class="eyebrow" style="color: var(--emerald-600);">AUTOMATICALLY DERIVED ACADEMIC ATTRIBUTES</span>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 8px;">
                <div><span class="eyebrow">PROGRAM</span><div style="font-weight: 800; color: var(--text-bright);">${parsed.program}</div></div>
                <div><span class="eyebrow">BRANCH</span><div style="font-weight: 800; color: var(--text-bright);">${parsed.branch}</div></div>
                <div><span class="eyebrow">YEAR</span><div style="font-weight: 800; color: var(--text-bright);">${parsed.year}</div></div>
                <div><span class="eyebrow">BUCKET</span><div style="font-weight: 800; color: var(--auction);">${parsed.bucket}</div></div>
              </div>
            </div>

            <!-- CRICKET SKILL QUESTIONNAIRE -->
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

            <div style="margin-bottom: 20px;">
              <label class="form-label">WICKET-KEEPING COMPETENCY</label>
              <div style="display: flex; gap: 10px; margin-top: 6px;">
                <button class="btn ${regFielding === 'yes' ? 'btn-primary' : 'btn-secondary'}" onclick="regFielding = 'yes'; renderCurrentView();">YES • Wicket-Keeper</button>
                <button class="btn ${regFielding === 'no' ? 'btn-primary' : 'btn-secondary'}" onclick="regFielding = 'no'; renderCurrentView();">NO</button>
              </div>
            </div>

            <!-- DERIVED DISCIPLINE -->
            <div style="background: rgba(217, 119, 6, 0.08); border: 1px solid rgba(217, 119, 6, 0.3); border-radius: 12px; padding: 14px; margin-bottom: 24px;">
              <span class="eyebrow" style="color: var(--auction);">DERIVED DISCIPLINE</span>
              <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright); margin-top: 2px;">
                ${derived}
              </div>
            </div>

            <!-- BASE PRICE SELECTION (MIN 20, MAX 250 CEILING) -->
            <div class="form-group" style="background: rgba(255,255,255,0.8); border: 1px solid var(--border-medium); border-radius: 12px; padding: 18px; margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label class="form-label" style="margin-bottom: 0;">PLAYER BASE PRICE (AUCTION OPENING BID)</label>
                <div class="sports-price" style="font-size: 28px; color: var(--auction);">${regBasePrice} C</div>
              </div>
              <input type="range" class="custom-range" min="20" max="250" step="5" value="${regBasePrice}" oninput="regBasePrice = parseInt(this.value); document.getElementById('basePriceVal').innerText = this.value + ' C';">
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-faint); margin-top: 4px;">
                <span>Min: 20C</span>
                <span id="basePriceVal" style="font-weight: 800; color: var(--auction);">${regBasePrice} C</span>
                <span>Max Ceiling: 250C (Base price ceiling only; live bids may go higher)</span>
              </div>
            </div>

            <!-- STRICT 4:3 PHOTO UPLOAD WITH INSTANT PREVIEW -->
            <div class="form-group" style="margin-bottom: 28px;">
              <label class="form-label">PLAYER OFFICIAL PHOTO (STRICT 4:3 ASPECT RATIO ENFORCED)</label>
              <div class="photo-upload-container" onclick="document.getElementById('playerPhotoInput').click()">
                <input type="file" id="playerPhotoInput" accept="image/*" style="display: none;" onchange="handlePlayerPhotoUpload(event)">
                <div class="aspect-4-3-box" style="margin-bottom: 10px;">
                  ${regPhotoDataUrl ? `<img src="${regPhotoDataUrl}" alt="Preview">` : `<div style="color: var(--text-faint); font-size: 32px;">📷</div>`}
                </div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-bright);">
                  ${regPhotoDataUrl ? '✓ Photo Uploaded & Cropped to 4:3' : 'Click to Upload Player Photograph'}
                </div>
                <div style="font-size: 11px; color: var(--text-faint); margin-top: 2px;">
                  Strict 4:3 aspect ratio (800×600) auto-centered and verified.
                </div>
              </div>
            </div>

            <button class="btn btn-primary" style="width: 100%; height: 48px; font-size: 16px;" onclick="submitPlayerRegistration()">
              SUBMIT TOURNAMENT REGISTRATION
            </button>
          </div>
        </div>
      `;
    }

    function handlePlayerPhotoUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      process4to3Photo(file, (dataUrl) => {
        regPhotoDataUrl = dataUrl;
        showToast("Photo processed: Strict 4:3 Aspect Ratio (800×600) Verified", "success");
        renderCurrentView();
      });
    }

    function submitPlayerRegistration() {
      const parsed = parseRoll(regRoll);
      const name = regName.trim() || "STUDENT ATHLETE";
      let derived = "All-Rounder";
      if (regBatting === "yes" && regBowling === "no") derived = "Specialist Batter";
      if (regBatting === "no" && regBowling === "yes") derived = "Specialist Bowler";
      if (regFielding === "yes") derived = "Wicket-Keeper Batter";

      const newPlayer = {
        id: String(players.length + 32).padStart(3, "0"),
        scopedNum: players.length + 1,
        name: name.toUpperCase(),
        program: parsed.program,
        branch: parsed.branch,
        year: parsed.year,
        bucket: parsed.bucket,
        basePrice: regBasePrice,
        status: "UNSOLD",
        type: derived,
        tags: ["REGISTERED", "VERIFIED"],
        stats: { matches: 0, runs: 0, wickets: 0 },
        roll: regRoll.toUpperCase(),
        cricHeroes: "VERIFIED",
        payment: "VERIFIED",
        photo: regPhotoDataUrl
      };

      players.push(newPlayer);
      saveDatabase();
      showSpeeder("REGISTRATION COMPLETE", `${newPlayer.name} added to Bucket ${newPlayer.bucket} (Base: ${newPlayer.basePrice}C)`, 1000);
      showToast(`Registration saved for ${newPlayer.name}!`, "success");
      regName = "";
      regPhotoDataUrl = null;
      setTimeout(() => switchView("public"), 1000);
    }

    // ========================================================
    // 12. VIEW 6: PLAYER PORTAL
    // ========================================================
    function renderPlayerPortalView() {
      const p = players.find(x => x.id === currentUser.playerId) || players[0];
      return `
        <div style="max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
          <div class="surface-elevated" style="padding: 28px;">
            <span class="eyebrow" style="color: var(--primary);">SELF-SERVICE ATHLETE HUB</span>
            <h1 class="display-title" style="font-size: 28px; margin-top: 2px;">ATHLETE PROFILE: ${p.name}</h1>
            <div style="font-size: 13px; color: var(--text-dim); margin-top: 4px;">Candidate Lot #${p.id} • Bucket ${p.bucket}</div>
          </div>

          <div class="surface-card" style="padding: 28px;">
            <div style="display: flex; gap: 24px; align-items: center; margin-bottom: 24px;">
              <div class="aspect-4-3-box" style="width: 140px; border-radius: 12px;">
                ${p.photo ? `<img src="${p.photo}" alt="${p.name}">` : `<div style="font-size: 54px;">🏏</div>`}
              </div>
              <div>
                <h2 style="font-family: var(--font-display); font-size: 24px; font-weight: 800;">${p.name}</h2>
                <div style="font-size: 15px; font-weight: 700; color: var(--emerald-600);">${p.type}</div>
                <div style="font-size: 13px; color: var(--text-dim); margin-top: 4px;">${p.program} ${p.branch} • ${p.year} • Roll: ${p.roll}</div>
                <div style="margin-top: 8px;">
                  <span class="status-pill ${p.status === 'SOLD' ? 'pill-green' : 'pill-blue'}">${p.status}</span>
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: rgba(255,255,255,0.8); border: 1px solid var(--border-medium); border-radius: 12px; padding: 18px;">
              <div>
                <span class="eyebrow">OFFICIAL BASE PRICE</span>
                <div class="sports-price" style="font-size: 32px; color: var(--auction);">${p.basePrice} C</div>
              </div>
              <div>
                <span class="eyebrow">AUCTION STATUS</span>
                <div style="font-weight: 800; font-size: 20px; color: var(--text-bright); margin-top: 4px;">
                  ${p.status === 'SOLD' ? `Sold to ${p.soldTo.toUpperCase()} for ${p.soldPrice}C` : 'Eligible in Auction Pool'}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // ========================================================
    // 13. VIEW 7: SUPER ADMIN CONSOLE & FRANCHISE MANAGER
    // ========================================================
    let adminActiveTab = "overview"; // "overview", "franchises", "undo", "audit"

    function renderAdminConsoleView() {
      const isSuper = currentUser.role === "SUPER_ADMIN";
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const inc = getBidIncrement(currentPrice);

      return `
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <!-- ADMIN HEADER -->
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
                  ${isSuper ? 'SUPER ADMIN OPERATIONS CENTER' : 'AUCTION OPERATOR CONSOLE'}
                </h1>
                <div style="font-size: 13px; color: var(--text-dim);">
                  Authoritative Floor Controls • Hammer Enforcement • Franchise Manager • Forensic Undo
                </div>
              </div>

              <!-- DRAW MODE -->
              <div style="background: rgba(255,255,255,0.7); border: 1px solid var(--border-medium); border-radius: 12px; padding: 10px 16px;">
                <span class="eyebrow" style="display: block; margin-bottom: 6px;">DRAW SELECTION MODE</span>
                <div style="display: flex; gap: 6px;">
                  <button class="btn ${drawMode === 'AUTO' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 11px; padding: 6px 12px; min-height: 32px;" onclick="drawMode = 'AUTO'; showToast('Switched to AUTO DRAW Mode', 'info'); renderCurrentView();">
                    AUTO DRAW
                  </button>
                  <button class="btn ${drawMode === 'GUEST' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 11px; padding: 6px 12px; min-height: 32px;" onclick="drawMode = 'GUEST'; showToast('Switched to GUEST CALL Mode', 'info'); renderCurrentView();">
                    GUEST CALL
                  </button>
                </div>
              </div>
            </div>

            <!-- METRICS BAR -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; border-top: 1px solid var(--border-subtle); padding-top: 16px; text-align: center;">
              <div><span class="eyebrow">REGISTERED</span><div class="sports-price" style="font-size: 24px; color: var(--text-bright);">${players.length}</div></div>
              <div><span class="eyebrow">FRANCHISES</span><div class="sports-price" style="font-size: 24px; color: var(--emerald-600);">${franchises.length}</div></div>
              <div><span class="eyebrow">CURRENT LOT</span><div class="sports-price" style="font-size: 24px; color: var(--auction);">#${cur.id}</div></div>
              <div><span class="eyebrow">COMPLETED SALES</span><div class="sports-price" style="font-size: 24px; color: var(--text-bright);">${salesHistory.length}</div></div>
              <div><span class="eyebrow">ROUND</span><div class="sports-price" style="font-size: 24px; color: var(--text-bright);">R${auctionRound}</div></div>
            </div>
          </div>

          <!-- ADMIN SUB-NAV -->
          <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
            <button class="btn ${adminActiveTab === 'overview' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 12px; min-height: 36px;" onclick="adminActiveTab = 'overview'; renderCurrentView();">
              Floor Operations
            </button>
            <button class="btn ${adminActiveTab === 'franchises' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 12px; min-height: 36px;" onclick="adminActiveTab = 'franchises'; renderCurrentView();">
              Franchise Manager (${franchises.length})
            </button>
            <button class="btn ${adminActiveTab === 'undo' ? 'btn-auction' : 'btn-secondary'}" style="font-size: 12px; min-height: 36px;" onclick="adminActiveTab = 'undo'; renderCurrentView();">
              Forensic Multi-Sale Undo (${salesHistory.length})
            </button>
            <button class="btn ${adminActiveTab === 'audit' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 12px; min-height: 36px;" onclick="adminActiveTab = 'audit'; renderCurrentView();">
              Audit Stream (${auditLog.length})
            </button>
          </div>

          <!-- TAB 1: FLOOR OPERATIONS -->
          ${adminActiveTab === 'overview' ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
              <!-- ACTIVE LOT CARD -->
              <div class="surface-card" style="padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                  <span class="status-pill pill-orange">ACTIVE LOT #${cur.id}</span>
                  <span class="eyebrow">BUCKET ${cur.bucket}</span>
                </div>

                <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 20px;">
                  <div class="aspect-4-3-box" style="width: 80px; border-radius: 10px;">
                    ${cur.photo ? `<img src="${cur.photo}" alt="${cur.name}">` : `<div style="font-size: 36px;">🏏</div>`}
                  </div>
                  <div>
                    <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 800;">${cur.name}</h2>
                    <div style="font-size: 13px; color: var(--text-dim);">${cur.type} • Base: ${cur.basePrice}C</div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: rgba(255,255,255,0.8); border: 1px solid var(--border-medium); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                  <div>
                    <span class="eyebrow">PRICE</span>
                    <div class="sports-price" style="font-size: 32px; color: var(--auction);">${currentPrice} C</div>
                  </div>
                  <div>
                    <span class="eyebrow">CURRENT LEADER</span>
                    <div style="font-weight: 800; font-size: 18px; color: var(--text-bright); margin-top: 4px;">
                      ${leader ? leader.name : "No Active Bids"}
                    </div>
                    <div style="font-size: 11px; color: var(--text-dim);">Clock: <strong class="timer-digit">${timerSeconds}s</strong></div>
                  </div>
                </div>

                <!-- HAMMER CONTROLS -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                  <button class="btn btn-auction" style="height: 48px; font-size: 15px;" onclick="openHammerConfirmModal()">
                    🔨 HAMMER LOT
                  </button>
                  <button class="btn btn-secondary" style="height: 48px; font-size: 15px;" onclick="toggleAuctionPause()">
                    ${auctionState === 'LIVE' ? '⏸ PAUSE AUCTION' : '▶ RESUME AUCTION'}
                  </button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <button class="btn btn-secondary" style="font-size: 13px;" onclick="skipPlayer()">
                    ⏭ SKIP TO RECALL QUEUE
                  </button>
                  <button class="btn btn-primary" style="font-size: 13px;" onclick="drawNextPlayer()">
                    🎲 DRAW NEXT LOT
                  </button>
                </div>
              </div>

              <!-- SIMULATION & TESTING TOOLS -->
              <div class="surface-card" style="padding: 24px;">
                <h3 style="font-family: var(--font-display); font-size: 18px; font-weight: 800; margin-bottom: 12px;">OPERATOR BID DISPATCH</h3>
                <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 16px;">Simulate authoritative incoming bids from any franchise console.</div>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px;">
                  ${franchises.map(f => `
                    <button class="btn btn-secondary" style="font-size: 11px; padding: 8px; min-height: 36px;" onclick="placeBid('${f.id}')">
                      Bid ${f.short}
                    </button>
                  `).join('')}
                </div>

                <div style="margin-top: 24px; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
                  <span class="eyebrow" style="margin-bottom: 8px; display: block;">DATABASE UTILITIES</span>
                  <button class="btn btn-danger" style="font-size: 12px; padding: 8px 16px;" onclick="resetDatabaseToDefaults()">
                    ⚠ Reset Tournament to Factory Defaults
                  </button>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- TAB 2: FRANCHISE MANAGER -->
          ${adminActiveTab === 'franchises' ? `
            <div class="surface-card" style="padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                  <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 800;">FRANCHISE ROSTER MANAGEMENT</h3>
                  <div style="font-size: 12px; color: var(--text-dim);">Add new teams, customize colors, purses, and owner photos (strict 4:3).</div>
                </div>
                <button class="btn btn-primary" onclick="openAddFranchiseModal()">
                  + ADD NEW FRANCHISE
                </button>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                ${franchises.map(f => `
                  <div class="surface-subtle" style="padding: 16px; border: 1px solid var(--border-subtle); border-radius: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <div style="font-weight: 800; font-size: 16px; color: var(--text-bright);">${f.name} (${f.short})</div>
                      <span class="status-pill pill-green">${f.purse}C</span>
                    </div>
                    <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
                      <div class="aspect-4-3-box" style="width: 60px; border-radius: 6px;">
                        ${f.ownerPhoto ? `<img src="${f.ownerPhoto}" alt="${f.name}">` : `<div style="font-size: 24px;">👔</div>`}
                      </div>
                      <div style="font-size: 11px; color: var(--text-dim);">
                        <div>Faculty: <strong>${f.faculty}</strong></div>
                        <div>Captain: <strong>${f.captain}</strong></div>
                      </div>
                    </div>
                    <button class="btn btn-secondary" style="width: 100%; font-size: 12px; min-height: 32px;" onclick="openEditFranchiseModal('${f.id}')">
                      EDIT FRANCHISE
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- TAB 3: FORENSIC UNDO -->
          ${adminActiveTab === 'undo' ? `
            <div class="surface-card" style="padding: 24px;">
              <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 800; margin-bottom: 8px;">IMMUTABLE SALES LEDGER & FORENSIC ROLLBACK</h3>
              <div style="font-size: 13px; color: var(--text-dim); margin-bottom: 20px;">Select any completed sale to reverse it. Credits and quotas will be restored.</div>

              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${salesHistory.map(s => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: rgba(255,255,255,0.7); border: 1px solid var(--border-subtle); border-radius: 8px;">
                    <div>
                      <div style="font-weight: 800; font-size: 14px; color: var(--text-bright);">${s.playerName} (${s.bucket} • ${s.playerRole})</div>
                      <div style="font-size: 12px; color: var(--text-dim);">${s.franchiseName} • ${s.price}C • ${s.timestamp}</div>
                    </div>
                    <button class="btn btn-danger" style="font-size: 12px; padding: 6px 14px; min-height: 32px;" onclick="executeUndoSale('${s.id}')">
                      REVERSE SALE
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- TAB 4: AUDIT STREAM -->
          ${adminActiveTab === 'audit' ? `
            <div class="surface-card" style="padding: 24px;">
              <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 800; margin-bottom: 8px;">EVENT AUDIT TRAIL STREAM</h3>
              <div style="display: flex; flex-direction: column; gap: 8px; max-height: 500px; overflow-y: auto;">
                ${auditLog.map(a => `
                  <div style="font-size: 12px; padding: 8px 12px; border-bottom: 1px solid var(--border-subtle); display: flex; gap: 12px;">
                    <span style="font-family: var(--font-mono); color: var(--text-faint);">${a.time}</span>
                    <span style="font-weight: 700; color: var(--text-bright); min-width: 140px;">${a.who}</span>
                    <span style="color: var(--text-dim);">${a.msg}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    // Modal: Add Franchise
    let newFranchisePhotoDataUrl = null;
    function openAddFranchiseModal() {
      newFranchisePhotoDataUrl = null;
      const modal = document.getElementById("modalContainer");
      modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation()">
            <div style="padding: 24px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span class="eyebrow" style="color: var(--primary);">CUSTOMIZATION</span>
                <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright); margin-top: 2px;">ADD NEW FRANCHISE</div>
              </div>
              <button class="btn btn-secondary" style="padding: 4px 8px; min-height: 32px;" onclick="closeModal()">✕</button>
            </div>
            <div style="padding: 24px;">
              <div class="form-group">
                <label class="form-label">FRANCHISE NAME</label>
                <input type="text" id="newFName" class="form-input" placeholder="e.g. GLADIATORS">
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
                <div>
                  <label class="form-label">SHORT CODE (3 LETTERS)</label>
                  <input type="text" id="newFShort" class="form-input" placeholder="GLA">
                </div>
                <div>
                  <label class="form-label">INITIAL PURSE (CREDITS)</label>
                  <input type="number" id="newFPurse" class="form-input" value="1000">
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
                <div>
                  <label class="form-label">FACULTY COORDINATOR</label>
                  <input type="text" id="newFFaculty" class="form-input" placeholder="Dr. S. Rao">
                </div>
                <div>
                  <label class="form-label">CAPTAIN NAME</label>
                  <input type="text" id="newFCaptain" class="form-input" placeholder="Vikram Patel">
                </div>
              </div>

              <!-- STRICT 4:3 OWNER PHOTO UPLOAD -->
              <div class="form-group">
                <label class="form-label">OWNER / COORDINATOR PHOTO (STRICT 4:3)</label>
                <div class="photo-upload-container" onclick="document.getElementById('newFPhotoInput').click()">
                  <input type="file" id="newFPhotoInput" accept="image/*" style="display: none;" onchange="handleNewFranchisePhoto(event)">
                  <div class="aspect-4-3-box" id="newFPreviewBox" style="width: 120px; margin-bottom: 6px;">
                    <div style="font-size: 24px;">👔</div>
                  </div>
                  <div style="font-size: 11px; font-weight: 700; color: var(--text-bright);">Click to upload 4:3 photo</div>
                </div>
              </div>

              <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                <button class="btn btn-secondary" onclick="closeModal()">CANCEL</button>
                <button class="btn btn-primary" onclick="saveNewFranchise()">SAVE FRANCHISE</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function handleNewFranchisePhoto(e) {
      const file = e.target.files[0];
      if (!file) return;
      process4to3Photo(file, (dataUrl) => {
        newFranchisePhotoDataUrl = dataUrl;
        const box = document.getElementById("newFPreviewBox");
        if (box) box.innerHTML = `<img src="${dataUrl}" alt="Owner">`;
        showToast("Owner photo cropped to strict 4:3 (800×600)", "success");
      });
    }

    function saveNewFranchise() {
      const name = document.getElementById("newFName").value.trim();
      const short = document.getElementById("newFShort").value.trim().toUpperCase() || name.slice(0, 3).toUpperCase();
      const purse = parseInt(document.getElementById("newFPurse").value) || 1000;
      const faculty = document.getElementById("newFFaculty").value.trim() || "Faculty Incharge";
      const captain = document.getElementById("newFCaptain").value.trim() || "Captain";

      if (!name) {
        showToast("Please provide franchise name", "error");
        return;
      }

      const id = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const newF = {
        id,
        name: name.toUpperCase(),
        short,
        purse,
        bought: 0,
        buckets: {},
        needed: { B1: 2, B2: 2, B3: 2, B4: 2, B5: 2, PG: 1 },
        color: "#" + Math.floor(Math.random()*16777215).toString(16),
        faculty,
        dept: "General",
        mobile: "+91 98765 00000",
        captainMobile: "+91 98765 00001",
        captain,
        vc: "Vice Captain",
        ownerPhoto: newFranchisePhotoDataUrl
      };

      franchises.push(newF);
      saveDatabase();
      closeModal();
      showToast(`Franchise ${newF.name} added successfully!`, "success");
      renderCurrentView();
    }

    // Modal: Edit Franchise
    function openEditFranchiseModal(fid) {
      const f = franchises.find(x => x.id === fid);
      if (!f) return;
      newFranchisePhotoDataUrl = f.ownerPhoto;

      const modal = document.getElementById("modalContainer");
      modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
          <div class="modal-dialog" onclick="event.stopPropagation()">
            <div style="padding: 24px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span class="eyebrow" style="color: var(--primary);">CUSTOMIZATION</span>
                <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text-bright); margin-top: 2px;">EDIT ${f.name}</div>
              </div>
              <button class="btn btn-secondary" style="padding: 4px 8px; min-height: 32px;" onclick="closeModal()">✕</button>
            </div>
            <div style="padding: 24px;">
              <div class="form-group">
                <label class="form-label">PURSE (CREDITS)</label>
                <input type="number" id="editFPurse" class="form-input" value="${f.purse}">
              </div>
              <div class="form-group">
                <label class="form-label">FACULTY COORDINATOR</label>
                <input type="text" id="editFFaculty" class="form-input" value="${f.faculty}">
              </div>
              <div class="form-group">
                <label class="form-label">CAPTAIN</label>
                <input type="text" id="editFCaptain" class="form-input" value="${f.captain}">
              </div>
              <div class="form-group">
                <label class="form-label">OWNER PHOTO (STRICT 4:3)</label>
                <div class="photo-upload-container" onclick="document.getElementById('editFPhotoInput').click()">
                  <input type="file" id="editFPhotoInput" accept="image/*" style="display: none;" onchange="handleNewFranchisePhoto(event)">
                  <div class="aspect-4-3-box" id="newFPreviewBox" style="width: 120px; margin-bottom: 6px;">
                    ${f.ownerPhoto ? `<img src="${f.ownerPhoto}" alt="${f.name}">` : `<div style="font-size: 24px;">👔</div>`}
                  </div>
                  <div style="font-size: 11px; font-weight: 700; color: var(--text-bright);">Click to update 4:3 photo</div>
                </div>
              </div>
              <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                <button class="btn btn-secondary" onclick="closeModal()">CANCEL</button>
                <button class="btn btn-primary" onclick="saveEditFranchise('${f.id}')">SAVE CHANGES</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function saveEditFranchise(fid) {
      const f = franchises.find(x => x.id === fid);
      if (!f) return;
      f.purse = parseInt(document.getElementById("editFPurse").value) || f.purse;
      f.faculty = document.getElementById("editFFaculty").value.trim() || f.faculty;
      f.captain = document.getElementById("editFCaptain").value.trim() || f.captain;
      if (newFranchisePhotoDataUrl) f.ownerPhoto = newFranchisePhotoDataUrl;

      saveDatabase();
      closeModal();
      showToast(`Franchise ${f.name} updated!`, "success");
      renderCurrentView();
    }

    // ========================================================
    // 14. VIEW 8: GIANT HALL PROJECTOR DISPLAY
    // ========================================================
    function renderProjectorView() {
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const inc = getBidIncrement(currentPrice);
      const nextBid = (leadingBidderId === null) ? cur.basePrice : (currentPrice + inc);

      return `
        <div style="padding: 24px; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; gap: 24px;">
          <!-- PROJECTOR TOP HEADER -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(255,255,255,0.12); padding-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="font-family: var(--font-display); font-size: 28px; font-weight: 900; color: #10B981; letter-spacing: 0.05em;">
                AVANTHI CRICKET CARNIVAL 2026
              </div>
              <span class="status-pill pill-orange" style="font-size: 14px;">ROUND ${auctionRound}</span>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
              <span class="status-pill pill-green"><div class="pulse-dot"></div>LIVE ON-STAGE</span>
              <button class="btn btn-secondary" style="font-size: 11px; padding: 4px 10px; min-height: 30px; background: rgba(255,255,255,0.1); color: white; border: none;" onclick="switchView('public')">
                EXIT PROJECTOR ✕
              </button>
            </div>
          </div>

          <!-- MASSIVE CENTER STAGE -->
          <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 48px; align-items: center;">
            <!-- PLAYER INFO -->
            <div style="display: flex; gap: 32px; align-items: center;">
              <div class="aspect-4-3-box" style="width: 260px; border-radius: 20px; box-shadow: 0 20px 48px rgba(0,0,0,0.5);">
                ${cur.photo ? `<img src="${cur.photo}" alt="${cur.name}">` : `<div style="font-size: 80px;">🏏</div>`}
              </div>
              <div>
                <span class="status-pill pill-orange" style="font-size: 16px; padding: 6px 14px;">
                  LOT #${cur.id} • BUCKET ${cur.bucket}
                </span>
                <h1 class="display-title" style="font-size: clamp(3rem, 5vw, 5rem); margin-top: 8px; line-height: 1.05;">
                  ${cur.name}
                </h1>
                <div style="font-size: 24px; color: #10B981; font-weight: 800; margin-top: 8px;">
                  ${cur.type}
                </div>
                <div style="font-size: 18px; color: #94A3B8; margin-top: 4px;">
                  ${cur.program} ${cur.branch} • Roll: ${cur.roll}
                </div>
                <div style="font-size: 18px; color: #F59E0B; font-weight: 700; margin-top: 6px;">
                  BASE PRICE: ${cur.basePrice} CREDITS
                </div>
              </div>
            </div>

            <!-- GIANT PRICE & CIRCULAR TIMER -->
            <div style="background: rgba(15, 23, 42, 0.9); border: 2px solid rgba(255,255,255,0.15); border-radius: 28px; padding: 36px; text-align: center; box-shadow: 0 24px 60px rgba(0,0,0,0.6);">
              <span class="eyebrow" style="font-size: 14px; letter-spacing: 0.2em; color: #94A3B8;">CURRENT AUTHORITATIVE BID</span>
              <div class="sports-price" style="font-size: clamp(5rem, 10vw, 9.5rem); color: #F59E0B; line-height: 1; margin: 8px 0;">
                ${currentPrice} <span style="font-size: 40px; color: #94A3B8;">C</span>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 2px solid rgba(255,255,255,0.1); padding-top: 20px; align-items: center;">
                <div style="text-align: left;">
                  <span class="eyebrow" style="font-size: 12px; color: #94A3B8;">LEADING FRANCHISE</span>
                  <div style="font-family: var(--font-display); font-size: 32px; font-weight: 800; color: #10B981;">
                    ${leader ? leader.name : "NO BID YET"}
                  </div>
                </div>

                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 16px;">
                  <div class="timer-ring-container">
                    <svg class="timer-ring-svg" width="90" height="90">
                      <circle class="timer-ring-circle-bg" cx="45" cy="45" r="38" stroke-width="7" stroke="rgba(255,255,255,0.1)"></circle>
                      <circle class="timer-ring-circle" cx="45" cy="45" r="38" stroke-width="7" stroke-dasharray="238.76" stroke-dashoffset="0" stroke="#10B981"></circle>
                    </svg>
                    <div class="timer-ring-text">
                      <span class="sports-price timer-digit" style="font-size: 26px; color: #10B981;">${timerSeconds}s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 11 FRANCHISES LIVE TICKER AT BOTTOM -->
          <div style="display: grid; grid-template-columns: repeat(11, 1fr); gap: 10px;">
            ${franchises.map(f => {
              const isLead = f.id === leadingBidderId;
              const hasPassed = passedFranchises.has(f.id);
              const maxLegal = calculateMaxBid(f);
              const isBlocked = nextBid > maxLegal;

              let statusText = isLead ? "LEAD" : (hasPassed ? "PASSED" : (isBlocked ? "BLOCKED" : "ACTIVE"));
              let pillClass = isLead ? "pill-orange" : (hasPassed ? "pill-grey" : (isBlocked ? "pill-red" : "pill-green"));

              return `
                <div style="background: rgba(255,255,255,0.05); border: 1.5px solid ${isLead ? '#F59E0B' : 'rgba(255,255,255,0.1)'}; border-radius: 10px; padding: 10px 8px; text-align: center;">
                  <div style="font-weight: 800; font-size: 14px; color: white;">${f.short}</div>
                  <div style="margin: 4px 0;"><span class="status-pill ${pillClass}" style="font-size: 9px; padding: 2px 4px;">${statusText}</span></div>
                  <div style="font-size: 12px; font-family: var(--font-mono); color: #10B981; font-weight: 800;">${f.purse}C</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // ========================================================
    // 15. MAIN VIEW ROUTER
    // ========================================================
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
      }

      updateTimerUI();
    }

    function broadcastAuctionState() {
      // Broadcast state changes across windows
      const payload = {
        lotIndex,
        currentPrice,
        leadingBidderId,
        timerSeconds,
        auctionState,
        passedFranchises: Array.from(passedFranchises),
        timestamp: Date.now()
      };
      try {
        localStorage.setItem("ACC_BROADCAST_STATE", JSON.stringify(payload));
      } catch (e) {}
    }

    // ========================================================
    // 16. PAGE BOOT & INITIALIZATION
    // ========================================================
    window.addEventListener("DOMContentLoaded", () => {
      loadDatabase();

      // Handle URL hash router
      const initialHash = window.location.hash.replace('#', '').trim();
      if (initialHash && ['public', 'live', 'franchise', 'teams', 'register', 'player', 'admin', 'projector'].includes(initialHash)) {
        currentView = initialHash;
      }

      renderCurrentView();
      startTimer();

      // Listen for cross-tab state updates
      window.addEventListener("storage", (e) => {
        if (e.key === "ACC_BROADCAST_STATE" && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            lotIndex = data.lotIndex ?? lotIndex;
            currentPrice = data.currentPrice ?? currentPrice;
            leadingBidderId = data.leadingBidderId ?? leadingBidderId;
            timerSeconds = data.timerSeconds ?? timerSeconds;
            auctionState = data.auctionState ?? auctionState;
            passedFranchises = new Set(data.passedFranchises || []);
            renderCurrentView();
          } catch (err) {}
        }
      });

      // Dismiss Speeder animation after smooth fade-in
      setTimeout(() => {
        const overlay = document.getElementById("speederOverlay");
        if (overlay) overlay.classList.add("hidden");
      }, 600);
    });
  </script>
</body>
</html>
'''
    return html

def main():
    print("Generating complete Acc-Auction-Os.html...")
    content = generate_html()
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Wrote {len(content)} characters to {OUTPUT_FILE}")

    print("Copying to index.html...")
    shutil.copyfile(OUTPUT_FILE, INDEX_FILE)
    print(f"Successfully mirrored to {INDEX_FILE}")

if __name__ == "__main__":
    main()

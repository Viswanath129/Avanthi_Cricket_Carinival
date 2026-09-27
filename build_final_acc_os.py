# build_final_acc_os.py
import os, sys

def build():
    print("Writing Acc-Auction-Os.html...")
    with open("b:/projects/ACC/Acc-Auction-Os.html", "w", encoding="utf-8") as f:
        # Part 1: Head & CSS
        f.write(r'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Avanthi Cricket Carnival — Player Auction Portal 2026</title>
  
  <!-- Typography Stacks: Inter (UI), Space Grotesk (Display), JetBrains Mono (Numbers), Barlow Condensed (Sports) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,700;1,800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:ital,wght@0,500;0,600;0,700;0,800;1,600&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">

  <style>
    /* ========================================================
       FERALUI PASTEL GLASS & HIGH-PERFORMANCE AUCTION OS TOKENS
       MISTED SKY #F6F9FF · RAIN INDIGO #9BE0E8 · MISTED SKY #C4B5F7 · LILAC PAPER #F8B8D9
       ======================================================== */
    :root {
      --bg-base: #F6F9FF;
      --bg-surface: rgba(255, 255, 255, 0.68);
      --bg-card: rgba(255, 255, 255, 0.82);
      --bg-card-hover: rgba(255, 255, 255, 0.95);
      --bg-card-elevated: rgba(255, 255, 255, 0.92);
      --bg-subtle: rgba(241, 245, 249, 0.6);

      --border-subtle: rgba(255, 255, 255, 0.7);
      --border-medium: rgba(203, 213, 225, 0.8);
      --border-strong: rgba(148, 163, 184, 0.9);

      --primary: #059669;          /* Emerald: active / legal / in play */
      --primary-glow: rgba(5, 150, 105, 0.22);
      --auction: #D97706;          /* Amber Gold: current bid / auction lead */
      --auction-glow: rgba(217, 119, 6, 0.25);
      --warning: #D97706;          /* Warning / Scarcity */
      --danger: #DC2626;           /* Red: blocked / unsold / delete */
      --muted: #64748B;            /* Slate: passed / inactive */

      --text-bright: #0F172A;      /* Slate 900 high contrast */
      --text-body: #1E293B;        /* Slate 800 */
      --text-dim: #475569;         /* Slate 600 */
      --text-faint: #64748B;       /* Slate 500 */

      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-display: 'Space Grotesk', -apple-system, sans-serif;
      --font-sports: 'Barlow Condensed', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;

      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 20px;
      --radius-full: 9999px;

      --shadow-sm: 0 4px 12px rgba(15, 23, 42, 0.05);
      --shadow-md: 0 10px 25px rgba(15, 23, 42, 0.08);
      --shadow-lg: 0 20px 40px rgba(15, 23, 42, 0.12);
      --shadow-glow-green: 0 0 24px rgba(5, 150, 105, 0.28);
      --shadow-glow-orange: 0 0 28px rgba(217, 119, 6, 0.32);

      --loader-color: #0F172A;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      min-height: 100%;
      background: var(--bg-base);
      color: var(--text-body);
      font-family: var(--font-sans);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      line-height: 1.5;
    }

    /* FeralUI Fixed Gradient Studio Background */
    .gradient {
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      overflow: hidden;
    }
    .gradient svg {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Glassmorphic Surfaces */
    .glass-panel {
      background: var(--bg-card);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .glass-panel:hover {
      background: var(--bg-card-hover);
      box-shadow: var(--shadow-lg);
    }

    .glass-card {
      background: var(--bg-surface);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }

    /* Typography Utilities */
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
      letter-spacing: 0.14em;
      color: var(--text-dim);
    }

    /* Navigation Bar */
    .app-header {
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      background: rgba(246, 249, 255, 0.85);
      border-bottom: 1px solid var(--border-medium);
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-decoration: none;
    }
    .brand-logo-pill {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #059669, #0284C7);
      color: #FFF;
      display: grid;
      place-items: center;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 17px;
      box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
    }
    .brand-text-title {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 15px;
      letter-spacing: -0.02em;
      color: var(--text-bright);
      line-height: 1.1;
    }
    .brand-text-sub {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--text-dim);
      margin-top: 2px;
    }

    .nav-tabs {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.7);
      padding: 4px;
      border-radius: var(--radius-full);
      border: 1px solid var(--border-medium);
    }
    .nav-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: var(--radius-full);
      border: none;
      background: transparent;
      color: var(--text-dim);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;
      white-space: nowrap;
    }
    .nav-tab-btn:hover {
      color: var(--text-bright);
      background: rgba(255, 255, 255, 0.9);
    }
    .nav-tab-btn.active {
      background: var(--text-bright);
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
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
      color: #FFFFFF;
      border-color: var(--primary);
      box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
    }
    .btn-primary:hover {
      background: #047857;
      box-shadow: var(--shadow-glow-green);
    }
    .btn-auction {
      background: var(--auction);
      color: #FFFFFF;
      border-color: var(--auction);
      box-shadow: 0 4px 14px rgba(217, 119, 6, 0.25);
    }
    .btn-auction:hover {
      background: #B45309;
      box-shadow: var(--shadow-glow-orange);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.85);
      color: var(--text-bright);
      border-color: var(--border-medium);
    }
    .btn-secondary:hover {
      background: #FFFFFF;
      border-color: var(--border-strong);
    }
    .btn-danger {
      background: rgba(220, 38, 38, 0.1);
      color: var(--danger);
      border-color: rgba(220, 38, 38, 0.3);
    }
    .btn-danger:hover {
      background: var(--danger);
      color: #FFFFFF;
    }

    /* Giant Touch Bid Button */
    .btn-giant-bid {
      width: 100%;
      min-height: 80px;
      background: linear-gradient(135deg, #059669, #047857);
      color: #FFFFFF;
      border: none;
      border-radius: var(--radius-lg);
      font-family: var(--font-sports);
      font-size: 1.85rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      box-shadow: 0 10px 30px rgba(5, 150, 105, 0.35);
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-giant-bid:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 14px 36px rgba(5, 150, 105, 0.45);
    }
    .btn-giant-bid:active:not(:disabled) {
      transform: scale(0.99);
    }
    .btn-giant-bid:disabled {
      background: #E2E8F0;
      color: #94A3B8;
      cursor: not-allowed;
      box-shadow: none;
      opacity: 0.65;
    }

    /* Form Elements */
    .form-group {
      margin-bottom: 18px;
    }
    .form-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-dim);
      margin-bottom: 6px;
    }
    .form-input, .form-select {
      width: 100%;
      height: 44px;
      padding: 0 14px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-sm);
      color: var(--text-bright);
      font-family: var(--font-sans);
      font-size: 14px;
      outline: none;
      transition: all 0.18s ease;
    }
    .form-input:focus, .form-select:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
      background: #FFFFFF;
    }

    /* Badges & Tags */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .badge-inplay {
      background: rgba(5, 150, 105, 0.12);
      border: 1px solid rgba(5, 150, 105, 0.35);
      color: #059669;
    }
    .badge-leading {
      background: rgba(217, 119, 6, 0.15);
      border: 1px solid rgba(217, 119, 6, 0.4);
      color: #D97706;
      box-shadow: 0 0 12px rgba(217, 119, 6, 0.25);
    }
    .badge-passed {
      background: rgba(100, 116, 139, 0.12);
      border: 1px solid rgba(100, 116, 139, 0.3);
      color: #64748B;
    }
    .badge-blocked {
      background: rgba(220, 38, 38, 0.1);
      border: 1px solid rgba(220, 38, 38, 0.35);
      color: #DC2626;
    }
    .badge-scarcity {
      background: rgba(217, 119, 6, 0.12);
      border: 1px solid rgba(217, 119, 6, 0.4);
      color: #D97706;
    }

    /* Modals */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-dialog {
      width: 100%;
      max-width: 600px;
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-medium);
      overflow: hidden;
      max-height: 90vh;
      overflow-y: auto;
    }

    /* ========================================================
       UIVERSE.IO SPEEDER & LONGFAZERS LOADING ANIMATION
       by anand_4957
       ======================================================== */
    #speederOverlay {
      position: fixed;
      inset: 0;
      background: rgba(246, 249, 255, 0.92);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: opacity 0.35s ease, visibility 0.35s ease;
    }
    #speederOverlay.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .speeder-box {
      position: relative;
      width: 240px;
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
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
      background: var(--loader-color);
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
      border-right: 100px solid var(--loader-color);
      border-bottom: 6px solid transparent;
    }
    .base span:before {
      content: "";
      height: 22px;
      width: 22px;
      border-radius: 50%;
      background: var(--loader-color);
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
      border-right: 55px solid var(--loader-color);
      border-bottom: 16px solid transparent;
      top: -16px;
      right: -98px;
    }
    .face {
      position: absolute;
      height: 12px;
      width: 20px;
      background: var(--loader-color);
      border-radius: 20px 20px 0 0;
      transform: rotate(-40deg);
      right: -125px;
      top: -15px;
    }
    .face:after {
      content: "";
      height: 12px;
      width: 12px;
      background: var(--loader-color);
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
      background: var(--loader-color);
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
    .longfazers {
      position: absolute;
      width: 100%;
      height: 100%;
    }
    .longfazers span {
      position: absolute;
      height: 2px;
      width: 20%;
      background: var(--loader-color);
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

    .speeder-meta {
      margin-top: 20px;
      text-align: center;
    }
    .speeder-title {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 800;
      color: var(--text-bright);
      letter-spacing: 0.05em;
    }
    .speeder-subtitle {
      font-size: 13px;
      color: var(--text-dim);
      margin-top: 4px;
    }

    /* Toast Notifications */
    #toastContainer {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }
    .toast {
      padding: 12px 18px;
      border-radius: var(--radius-md);
      background: #FFFFFF;
      color: var(--text-bright);
      border: 1px solid var(--border-medium);
      box-shadow: var(--shadow-lg);
      font-size: 13px;
      font-weight: 600;
      animation: toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    @keyframes toastIn {
      from { transform: translateY(16px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Aspect Ratio Utilities */
    .aspect-4-3 {
      aspect-ratio: 4 / 3;
      object-fit: cover;
    }
  </style>
</head>
<body>
''')
    print("Part 1 written successfully.")

if __name__ == "__main__":
    build()

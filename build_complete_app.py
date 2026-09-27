# build_complete_app.py
import os, sys

def build():
    print("Writing Acc-Auction-Os.html...")
    with open("b:/projects/ACC/Acc-Auction-Os.html", "w", encoding="utf-8") as f:
        # Part 1: HTML Head and CSS
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
      --bg-surface: rgba(255, 255, 255, 0.72);
      --bg-card: rgba(255, 255, 255, 0.85);
      --bg-card-hover: rgba(255, 255, 255, 0.95);
      --bg-card-elevated: rgba(255, 255, 255, 0.92);
      --bg-subtle: rgba(241, 245, 249, 0.65);

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
      background: rgba(255, 255, 255, 0.75);
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
      background: rgba(246, 249, 255, 0.94);
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

    /* Aspect Ratio Utilities (4:3 enforcement) */
    .aspect-4-3 {
      aspect-ratio: 4 / 3;
      object-fit: cover;
    }

    .timer-ring-container {
      position: relative;
      width: 140px;
      height: 140px;
      display: grid;
      place-items: center;
    }
    .timer-ring-circle {
      transition: stroke-dashoffset 1s linear, stroke 0.3s ease;
    }
    .timer-pulse-danger {
      animation: pulseDanger 0.8s infinite;
    }
    @keyframes pulseDanger {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.04); }
    }
    .shake-error {
      animation: shake 0.4s ease-in-out;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }
  </style>
</head>
<body>

  <!-- FERALUI PASTEL GLASS BACKGROUND (MISTED SKY, RAIN INDIGO, LILAC PAPER + FILM GRAIN) -->
  <div class="gradient" role="img" aria-label="Untitled blend">
    <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" viewBox="0 0 2048 1166">
      <defs>
        <pattern id="grainp" width="256" height="256" patternUnits="userSpaceOnUse">
          <image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAQAElEQVR4ATTdBXQmxxEE4O4N8+VCjkPnxMzMIPOZZWZbZrbPzHBmZmZmZmZmZmZmpsl8c2/znp6kf3dnuqurqntWttOttdZa5eWXXy4rr7xyufbaa8vVV19dFl988bLuuuuWXXbZpUw++eTl/PPPLxtttFFZY401yl/+8pcy88wzl7333rtceumlZckllyynnXZamW666cquu+5aLr744nLYYYeVo48+upxwwgnlX//6V7n++uvLhhtuWGaaaaay2GKLlaGhoXLAAQeUww8/vGyzzTbta+ONNy6PPPJI2Xnnnct///vf9v2KK64oF110Udlkk03KnXfe2eLYb7/9yoorrljuvffectZZZ5WDDz64HH/88WWHHXYoCyywQJlvvvnKFltsUR5//PGy1VZblf/973/lscceK8cee2y7b4IJJiirrLJKi6F/Rp7jjTdee37hhRcuV111VTnqqKPKPvvsUzbbbLO2/5FHHlmWWmqpst1227W4t9xyy3LSSSeVrbfeuhx66KENn+mnn77cf//9DaeTTz657Qe7hx9+uOXzwQcfNIx23HHHAvcHH3ywPbvvvvs2PNZbb72ywgorlOuuu67stddeDZfbb7+95Xbqqae23996661ib/vONttsLZcTTzyx4T8wMNBiV8vllluu4aSmyyyzTDnuuOPKhRdeWHbbbbdirVdffbXho2b2s16P45NPPlnmmmuuMnr06HLBBRe0WlpHTuoudpwRv9jls84665S33367qCPc5DLvvPOWGWaYoeXz8ccflzXXXLNYW464Mc8887Q8PTPZZJO1/C6//PLy61//ugwODrY455577safM888s4waNapsuumm5cADDyynnHJK2XPPPdtnc845Z7nrrrvKIoss0mp19tlnl+23375svvnm5Y477mjYfvbZZ+Wll15q9+CnGPEAHrh10EEHlYPqlz38Ljb7wAQHNthgg7LggguW008/vYjRfddcc03BgSOOOKLgpfvsSUPWxrsPP/yw5aWe+HPPPfeUc845p8Af930u3gknnLDpY6GFFmr1pjdcE9Pyyy9ffvGLX5Q55pijiGuTqodnn322cdPndKU2eIjL2267bdMn3k0zzTQt5zPOOKPp8aSTTmqYwXz22Wcv3aqrrho16Jh22mmjFiEqYFGFHuOMM07UhKMSLp5//vl2vRIi6obt8x9//DF23nnn+OGHH6IaQNxwww1Ri9aercWKjz76KP75z3/G3/72t6gEaz9X84hK0nZfLXJU04hK4vj9738fxxxzTPzsZz+L3/zmN7H++uvH119/Hd9//31UUsW4447brj300ENRhdp+r0KLCkRUgrTnX3zxxdh9993j448/jkqyqMBFFWT7uuWWW6IKIL799tt49NFHowLW8qvAxthjjx2VzC2mf//739F1XVjLvpX8bV/5VCHGe++9F//5z3/ixhtvjFqoeOmll6KaUVv3z3/+c0w55ZRRjS/E+dRTT7W8qwGGXCsBo5pjVEJEJUJUY4pqtFHJE6WUqARq91XSxK9+9av47rvvGtbiOe+88+KnP/1pvPDCC1GF0+6vJhnV6OKbb76JJ554IqoYYuqpp4677767rV/NMKqZtdhmnXXWqGRucblHfrfddlurhVjlVY0zPv/887jvvvuiGmvD6KabboopppiiYfb+++/HAw880OpRydr2qwbQ4vTs2muvHSeffHKsttpqUUUf77zzTowePTpqI4lPP/00qgHHiBEjGgbjjz9+wwnGlYRRDStqUwn7ffHFF/HMM8+0ryqwhjd+qG0VZlThNM54Vq5ih281tajiiN/+9rfhPnuJCz/luMceezRO1oYW9sTxKtKoTaZhv+yyy4Z6Dxs2rGGAi1VAMdZYY0UVXiy33HJhPfq48sorWx3VALfFgAvVJBovcAVnq4lGNbsYPnx440w1rYaFWuEQXalTFWfQob2rsUQ1z6CVGWecseGi9mpNDyuttFKce+65DUe/iw23qlHFT37yk8Z3tcWhoaGhWHrppYMmaiNq2hIbzdAX3DuErh0lqqtFdY4m7tr9ojp+HHLIIU2MyEgEEqwu164pis0FBjxB1U4Tktxpp52aabzxxhuNuEC2voTefffdtpega/du99Vu3QK/+eab4/XXX486WYRnAUMogGYQgBdH7aRRnS0mnXTSIGJ7u4dA6oTRDAJxPSM2wifY2sWbYdibsE488cQmRGSRD3J99dVXTQiMZpJJJmmkVMjMbLkgG/C+/PLLZg5EHfV/E000UciNIK3NKMWHROJiCArEOOUrR6SvnSh++ctfBsyR9c0334zaJcLe8qxTUiBtv/Yf/vCH+Pvf/96IxHSHDRsWf/rTn5oR147bRG6v2hGD8Bkeg/azNcUlxqeffrrt6efa1eLWW28N5qMJ2FP+8iZk+yGreJiqXMXOKBgYXF9++eWW/yWXXBLWVh9m6Jo64hCjki9TxAXNQU1rx2zNAE8IqU6HUaeKZuwaES4QlFzFAp+RI0c247YvsjNyMRLuJ5980hqXBoSvaqW+dXqIf/zjH2EdsWsicra+GJk44eEFkYqzjxs3Xnnllbjsssua0QwMDDQd4BuDqxNuMEFfcMY/QhscHGyxuKdOuM3EGaW4Vl999ajTceCfxseo6mQbYpFPnc6C8eKRektNmT59esM9y2DkgV4Y6fA3h0hGAA/q75iBMx2j7Y0Y4K4e5u95fFNPjXgXk+v0Rk/6i8/64zQ84eI3F5eLdYyT9/e+eM3E+h6+4wWjQ3j2kReu0Y6R+10NuWk+xG3C033k4f64c+L/ARrD+53pD8X4AAAAAElFTkSuQmCC" width="256" height="256"/>
        </pattern>
        <linearGradient id="feralLinear" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F6F9FF"/>
          <stop offset="35%" stop-color="#9BE0E8"/>
          <stop offset="70%" stop-color="#C4B5F7"/>
          <stop offset="100%" stop-color="#F8B8D9"/>
        </linearGradient>
        <radialGradient id="meshRadial1" cx="20%" cy="15%" r="65%">
          <stop offset="0%" stop-color="#9BE0E8" stop-opacity="0.82"/>
          <stop offset="100%" stop-color="#F6F9FF" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="meshRadial2" cx="85%" cy="30%" r="60%">
          <stop offset="0%" stop-color="#F8B8D9" stop-opacity="0.75"/>
          <stop offset="100%" stop-color="#F6F9FF" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="meshRadial3" cx="50%" cy="85%" r="70%">
          <stop offset="0%" stop-color="#C4B5F7" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#F6F9FF" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="2048" height="1166" fill="url(#feralLinear)"/>
      <rect width="2048" height="1166" fill="url(#meshRadial1)"/>
      <rect width="2048" height="1166" fill="url(#meshRadial2)"/>
      <rect width="2048" height="1166" fill="url(#meshRadial3)"/>
      <rect width="2048" height="1166" fill="url(#grainp)" opacity="0.14"/>
    </svg>
  </div>

  <!-- UIVERSE.IO SPEEDER & LONGFAZERS LOADING OVERLAY -->
  <div id="speederOverlay">
    <div class="speeder-box">
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
    <div class="speeder-meta">
      <div id="speederTitle" class="speeder-title">INITIALIZING ACC AUCTION OS...</div>
      <div id="speederSubtitle" class="speeder-subtitle">Authoritative State Sync & Real-Time Engine Active</div>
    </div>
  </div>

  <!-- APPLICATION HEADER & NAVIGATION -->
  <header class="app-header">
    <div class="nav-brand" onclick="switchView('public')">
      <div class="brand-logo-pill">ACC</div>
      <div>
        <div class="brand-text-title">AVANTHI CRICKET CARNIVAL</div>
        <div class="brand-text-sub">PLAYER AUCTION 2026 • OFFICIAL OS</div>
      </div>
    </div>

    <!-- VIEW TABS -->
    <nav class="nav-tabs" role="tablist">
      <button class="nav-tab-btn active" id="tab-public" onclick="switchView('public')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
        Public
      </button>
      <button class="nav-tab-btn" id="tab-live" onclick="switchView('live')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        Live Bidding
      </button>
      <button class="nav-tab-btn" id="tab-franchise" onclick="switchView('franchise')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>
        Terminal
      </button>
      <button class="nav-tab-btn" id="tab-teams" onclick="switchView('teams')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        11 Franchises
      </button>
      <button class="nav-tab-btn" id="tab-register" onclick="switchView('register')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
        Registration
      </button>
      <button class="nav-tab-btn" id="tab-admin" onclick="switchView('admin')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>
        Admin Console
      </button>
      <button class="nav-tab-btn" id="tab-projector" onclick="switchView('projector')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"></rect><line x1="8" x2="16" y1="21" y2="21"></line><line x1="12" x2="12" y1="17" y2="21"></line></svg>
        Projector
      </button>
    </nav>

    <!-- RIGHT STATUS -->
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 9999px; background: rgba(5, 150, 105, 0.1); border: 1px solid rgba(5, 150, 105, 0.3);">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary);"></div>
        <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: var(--primary);">DB SYNCED</span>
      </div>
      <div id="lotIndicatorBadge" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; background: #FFFFFF; border: 1px solid var(--border-medium); font-size: 12px; font-weight: 700;">
        <span class="eyebrow" style="color: var(--text-dim);">LOT</span>
        <strong id="headerLotNum" style="font-family: var(--font-mono);">023</strong>
      </div>
    </div>
  </header>

  <!-- MAIN VIEW CONTAINER -->
  <main id="appMain" style="max-width: 1600px; margin: 0 auto; padding: 24px 20px 80px;"></main>

  <!-- MODAL CONTAINER -->
  <div id="modalContainer"></div>

  <!-- TOAST NOTIFICATIONS -->
  <div id="toastContainer"></div>

  <!-- APPLICATION JAVASCRIPT LOGIC -->
  <script>
''')
    print("Part 1 & 2 written.")

if __name__ == "__main__":
    build()

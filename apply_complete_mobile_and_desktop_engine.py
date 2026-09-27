# apply_complete_mobile_and_desktop_engine.py

for fname in [r'B:\projects\ACC\index.html', r'B:\projects\ACC\Acc-Auction-Os.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        text = f.read().replace('\r\n', '\n')

    # 1. Update Header HTML for responsive 2-row layout
    old_header = """  <header class="app-header">
    <div class="nav-brand" onclick="switchView('public')">
      <img src="data:image/jpeg;base64,"""

    # 2. Add classes to view templates:
    # Login container
    old_login_grid = '<div style="min-height: 80vh; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; padding: 20px 0;">'
    new_login_grid = '<div class="login-view-grid">'
    text = text.replace(old_login_grid, new_login_grid)

    # Public hero container
    old_hero_grid = '<div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 32px; align-items: center;">'
    new_hero_grid = '<div class="hero-grid">'
    text = text.replace(old_hero_grid, new_hero_grid)

    # Live auction main grid
    old_live_grid = '<div style="display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 24px; margin-bottom: 24px;">'
    new_live_grid = '<div class="responsive-auction-grid">'
    text = text.replace(old_live_grid, new_live_grid)

    # Live bidding metrics strip
    old_metrics_strip = '<div style="display: grid; grid-template-columns: 1fr 1fr 0.8fr; gap: 16px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; margin-bottom: 24px;">'
    new_metrics_strip = '<div class="live-metrics-strip">'
    text = text.replace(old_metrics_strip, new_metrics_strip)

    # Admin metrics grid
    old_admin_metrics = '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 24px;">'
    new_admin_metrics = '<div class="admin-metrics-grid">'
    text = text.replace(old_admin_metrics, new_admin_metrics)

    # Admin arena grid
    old_admin_arena = '<div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px;">'
    new_admin_arena = '<div class="admin-arena-grid">'
    text = text.replace(old_admin_arena, new_admin_arena)

    # Player status grid
    old_player_status = '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">'
    new_player_status = '<div class="player-status-grid">'
    text = text.replace(old_player_status, new_player_status)

    # 3. Add responsive styles into <style> block
    responsive_css = """
    /* ========================================================
       RESPONSIVE ADAPTIVE LAYOUT CLASSES (DESKTOP & MOBILE)
       ======================================================== */
    .login-view-grid {
      min-height: 80vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: center;
      padding: 20px 0;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 32px;
      align-items: center;
    }

    .responsive-auction-grid {
      display: grid;
      grid-template-columns: 1.25fr 0.75fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    .live-metrics-strip {
      display: grid;
      grid-template-columns: 1fr 1fr 0.8fr;
      gap: 16px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .admin-metrics-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .admin-arena-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 24px;
    }

    .player-status-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    /* Safe container boundaries */
    #appMain {
      width: 100%;
      max-width: 1360px;
      margin: 0 auto;
      padding: 24px 20px 80px;
      box-sizing: border-box;
    }

    /* TABLET & MOBILE BREAKPOINTS */
    @media (max-width: 960px) {
      .responsive-auction-grid {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
      }
      .admin-arena-grid {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
      }
      .hero-grid {
        grid-template-columns: 1fr !important;
        gap: 24px !important;
      }
      .login-view-grid {
        grid-template-columns: 1fr !important;
        gap: 28px !important;
        max-width: 500px;
        margin: 0 auto;
      }
      .admin-metrics-grid {
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 12px !important;
      }
      .player-status-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 12px !important;
      }
    }

    @media (max-width: 768px) {
      .app-header {
        height: auto !important;
        padding: 8px 12px 6px !important;
        display: flex !important;
        flex-wrap: wrap !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 6px !important;
      }
      .nav-brand {
        flex: 1;
        min-width: 0;
      }
      .brand-text-sub {
        display: none !important;
      }
      .brand-text-title {
        font-size: 13px !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .header-user-badge {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        flex-shrink: 0;
      }
      .header-user-badge .btn {
        padding: 6px 10px !important;
        font-size: 11px !important;
      }
      .header-user-badge .status-pill {
        padding: 3px 8px !important;
        font-size: 10px !important;
      }
      .nav-tabs {
        order: 3;
        width: 100% !important;
        max-width: 100% !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch;
        white-space: nowrap !important;
        justify-content: flex-start !important;
        scrollbar-width: none !important;
        padding: 3px 4px !important;
      }
      .nav-tabs::-webkit-scrollbar {
        display: none !important;
      }
      .nav-tab-btn {
        padding: 6px 12px !important;
        font-size: 11px !important;
        flex-shrink: 0 !important;
      }
      #appMain {
        padding: 12px 10px 60px !important;
      }
      .scarcity-banner {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 6px !important;
        font-size: 12px !important;
      }
    }

    @media (max-width: 640px) {
      .live-metrics-strip {
        grid-template-columns: 1fr 1fr !important;
        gap: 12px !important;
        padding: 14px 12px !important;
      }
      .live-metrics-strip > div:last-child {
        grid-column: span 2;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        margin-top: 6px !important;
        padding-top: 10px !important;
        border-top: 1px solid var(--border-subtle) !important;
      }
      .admin-metrics-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 8px !important;
      }
      .surface-card, .surface-elevated {
        padding: 16px 14px !important;
        border-radius: 14px !important;
      }
      .display-title {
        font-size: clamp(1.8rem, 6.5vw, 2.6rem) !important;
      }
      .sports-price {
        font-size: clamp(2rem, 8vw, 3rem) !important;
      }
      .btn-giant-bid {
        height: 64px !important;
        font-size: 1.45rem !important;
      }
    }

    @media (max-width: 380px) {
      .app-header {
        padding: 6px 8px !important;
      }
      .nav-brand img {
        width: 24px !important;
        height: 24px !important;
      }
      .brand-text-title {
        font-size: 11px !important;
      }
      .header-user-badge .btn {
        padding: 4px 6px !important;
        font-size: 10px !important;
      }
      .nav-tab-btn {
        padding: 5px 8px !important;
        font-size: 10px !important;
      }
    }
"""

    # Inject responsive_css before </style>
    idx_style_end = text.find('</style>')
    if idx_style_end != -1:
        text = text[:idx_style_end] + responsive_css + '\n' + text[idx_style_end:]

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(text)

print("Applied complete mobile and desktop engine!")

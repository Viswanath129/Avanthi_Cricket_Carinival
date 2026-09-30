import re, os

def fix_login_page():
    path = 'acc-auction-portal/client/src/pages/LoginPage.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Strip dark: classes
    content = re.sub(r'dark:[a-zA-Z0-9_\-\/\[\]#]+', '', content)
    # Remove redundant whitespace in className
    content = re.sub(r'className="([^"]*)"', lambda m: 'className="' + ' '.join(m.group(1).split()) + '"', content)

    # Emojis in tabs
    content = content.replace("'🏏 PLAYER'", "'PLAYER'")
    content = content.replace("'🛡️ FRANCHISE'", "'FRANCHISE'")
    content = content.replace("'👑 SUPER ADMIN'", "'SUPER ADMIN'")
    content = content.replace("'⚡ OPERATOR'", "'OPERATOR'")

    # Emojis in alerts and helpers
    content = content.replace("<span>⚠️</span>", "")
    content = content.replace('<span className="text-base">🛡️</span>', "")
    content = content.replace("{showPassword ? '🔒' : '👁️'}", "{showPassword ? 'Hide' : 'Show'}")
    content = content.replace("⚡ Titans PIN", "Titans PIN")
    content = content.replace("⚡ 26811A0501 (B1)", "26811A0501 (B1)")
    content = content.replace("⚡ 25815A0403 (B3)", "25815A0403 (B3)")
    content = content.replace("⚡ handler / Handler@2026", "handler / Handler@2026")
    content = content.replace("⚡ admin / ACC@Admin#2026!", "admin / ACC@Admin#2026!")
    content = content.replace("<span>👁️</span> Public Spectator Live Arena", "Public Spectator Live Arena")
    content = content.replace('<span className="text-lg">🏏</span>', "")
    content = content.replace('<span className="text-lg">🛡️</span>', "")
    content = re.sub(r'<span className="text-base">\{activeTab === [^}]*\}</span>', '', content)

    # Ensure light backgrounds
    content = content.replace('bg-slate-900', 'bg-white')
    content = content.replace('bg-slate-950', 'bg-slate-50')
    content = content.replace('bg-slate-800', 'bg-slate-100')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed LoginPage.tsx")

def fix_teams_board_page():
    path = 'acc-auction-portal/client/src/pages/TeamsBoardPage.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace emoji check/cross
    content = content.replace("{met ? '✔' : '✘'}", "{met ? ' (OK)' : ' (REQ)'}")

    # Convert dark theme to light theme
    content = content.replace('bg-[#060a12]', 'bg-slate-50')
    content = content.replace('bg-[#090e1a]/90', 'bg-white/95')
    content = content.replace('bg-[#0b1322]', 'bg-white')
    content = content.replace('bg-[#080d18]', 'bg-slate-50')
    content = content.replace('text-slate-100', 'text-slate-900')
    content = content.replace('text-white', 'text-slate-900')
    content = content.replace('border-slate-800', 'border-slate-200')
    content = content.replace('border-slate-700', 'border-slate-300')
    content = content.replace('text-slate-400', 'text-slate-600')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed TeamsBoardPage.tsx")

def fix_player_board_page():
    path = 'acc-auction-portal/client/src/pages/PlayerBoardPage.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace search emoji
    search_svg = '<svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>'
    content = content.replace('🔍', search_svg)
    content = content.replace('>✕</button>', '>&times;</button>')

    # Convert dark theme to light theme
    content = content.replace('bg-[#060a12]', 'bg-slate-50')
    content = content.replace('bg-[#090e1a]/90', 'bg-white/95')
    content = content.replace('bg-[#0b1322]', 'bg-white')
    content = content.replace('bg-[#080d18]', 'bg-slate-50')
    content = content.replace('text-slate-100', 'text-slate-900')
    content = content.replace('text-white', 'text-slate-900')
    content = content.replace('border-slate-800', 'border-slate-200')
    content = content.replace('border-slate-700', 'border-slate-300')
    content = content.replace('text-slate-400', 'text-slate-600')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed PlayerBoardPage.tsx")

def fix_live_auction_page():
    path = 'acc-auction-portal/client/src/pages/LiveAuctionPage.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove emojis
    content = content.replace('<span>⚠️</span>', '')
    content = content.replace('<span>⏱️</span>', '')
    content = content.replace('<span>🔨</span>', '')

    # Convert dark theme to light theme
    content = content.replace('bg-[#060a12]', 'bg-slate-50')
    content = content.replace('bg-[#090e1a]/90', 'bg-white/95')
    content = content.replace('bg-[#0b1322]', 'bg-white')
    content = content.replace('bg-[#070c17]', 'bg-white')
    content = content.replace('bg-[#080d18]', 'bg-slate-50')
    content = content.replace('text-slate-100', 'text-slate-900')
    content = content.replace('text-white', 'text-slate-900')
    content = content.replace('border-slate-800', 'border-slate-200')
    content = content.replace('border-slate-700', 'border-slate-300')
    content = content.replace('text-slate-400', 'text-slate-600')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed LiveAuctionPage.tsx")

def fix_projector_page():
    path = 'acc-auction-portal/client/src/pages/ProjectorPage.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove emojis
    content = content.replace('⚠️ {scarcityWarnings[0]}', 'WARNING: {scarcityWarnings[0]}')
    content = content.replace("'⛶ Fullscreen'", "'Fullscreen'")
    content = content.replace('<span>⏱️</span>', '')

    # Convert dark theme to high-contrast clean light theme
    content = content.replace('bg-[#050811]', 'bg-slate-100')
    content = content.replace('bg-[#070c17]', 'bg-white')
    content = content.replace('bg-[#080e1c]', 'bg-white')
    content = content.replace('bg-[#0c1428]', 'bg-slate-50')
    content = content.replace('bg-slate-950', 'bg-white')
    content = content.replace('bg-slate-900', 'bg-slate-50')
    content = content.replace('text-slate-100', 'text-slate-900')
    content = content.replace('text-white', 'text-slate-900')
    content = content.replace('border-slate-800', 'border-slate-200')
    content = content.replace('border-slate-700', 'border-slate-300')
    content = content.replace('text-slate-400', 'text-slate-600')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed ProjectorPage.tsx")

def fix_admin_live_dashboard():
    path = 'acc-auction-portal/client/src/pages/AdminLiveDashboard.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Emojis
    content = content.replace('>✕</button>', '>&times;</button>')
    content = content.replace('🔨', 'HAMMER')
    content = content.replace('⚠️ Warning:', 'Warning:')

    # Convert outer and card backgrounds to light theme
    content = content.replace('bg-slate-950 text-slate-100', 'bg-slate-100 text-slate-900')
    content = content.replace('bg-slate-950', 'bg-white')
    content = content.replace('bg-slate-900', 'bg-white')
    content = content.replace('border-slate-800', 'border-slate-200')
    content = content.replace('border-slate-700', 'border-slate-300')
    content = content.replace('text-slate-100', 'text-slate-900')
    content = content.replace('text-white', 'text-slate-900')
    content = content.replace('text-slate-400', 'text-slate-600')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed AdminLiveDashboard.tsx")

def fix_home_and_map():
    # Home.tsx
    home_path = 'acc-auction-portal/client/src/pages/Home.tsx'
    if os.path.exists(home_path):
        with open(home_path, 'r', encoding='utf-8') as f:
            c = f.read()
        c = c.replace('🏆', '').replace('✓', '').replace('⚠️', '').replace('🔨', '').replace('⚡', '').replace('✅', '')
        with open(home_path, 'w', encoding='utf-8') as f:
            f.write(c)
        print("Fixed Home.tsx")

    # Map.tsx
    map_path = 'acc-auction-portal/client/src/components/Map.tsx'
    if os.path.exists(map_path):
        with open(map_path, 'r', encoding='utf-8') as f:
            c = f.read()
        c = c.replace('📐', '').replace('🛣', '').replace('🌦', '').replace('🧭', '').replace('📍', '').replace('✅', '').replace('🏢', '')
        with open(map_path, 'w', encoding='utf-8') as f:
            f.write(c)
        print("Fixed Map.tsx")

if __name__ == '__main__':
    fix_login_page()
    fix_teams_board_page()
    fix_player_board_page()
    fix_live_auction_page()
    fix_projector_page()
    fix_admin_live_dashboard()
    fix_home_and_map()

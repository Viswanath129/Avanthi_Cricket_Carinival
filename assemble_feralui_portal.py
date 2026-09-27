# assemble_feralui_portal.py
# Seamlessly merges the FeralUI Pastel Glass Atmosphere, Radial Gradient Mesh, SVG Grain Overlay,
# and UIverse Speeder Loading Animation from the Firebase version into the 5-Role ACC Portal.

with open(r'B:\projects\ACC\firebase_live.html', 'r', encoding='utf-8') as f:
    fb_text = f.read()

with open(r'B:\projects\ACC\index.html', 'r', encoding='utf-8') as f:
    cur_text = f.read()

# 1. Speeder CSS
idx_sp_start = fb_text.find('/* ========================================================\n       UIVERSE SPEEDER')
idx_sp_end = fb_text.find('/* ========================================================\n       TIMER PROGRESS RING', idx_sp_start)
speeder_css = fb_text[idx_sp_start:idx_sp_end]

# 2. Timer ring CSS
idx_tr_end = fb_text.find('/* 11 Franchise Cards', idx_sp_end)
timer_ring_css = fb_text[idx_sp_end:idx_tr_end]

# 3. Speeder HTML
idx_sp_html_start = fb_text.find('<div id="speederOverlay"')
idx_sp_html_end = fb_text.find('<!-- MAIN APP CONTAINER -->', idx_sp_html_start)
speeder_html = fb_text[idx_sp_html_start:idx_sp_html_end].strip()

# 4. Grain SVG
grain_svg = """  <!-- SVG Film Grain Texture Overlay -->
  <svg class="grain-overlay" xmlns="http://www.w3.org/2000/svg">
    <filter id="feralui-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.06   0 0 0 0 0.09   0 0 0 0 0.16   0 0 0 0.1 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#feralui-grain)" />
  </svg>"""

print(f"Speeder CSS length: {len(speeder_css)}")
print(f"Timer Ring CSS length: {len(timer_ring_css)}")
print(f"Speeder HTML length: {len(speeder_html)}")

# restore_firebase_visuals.py
import re

with open(r'B:\projects\ACC\firebase_live.html', 'r', encoding='utf-8') as f:
    fb_text = f.read()

# 1. Extract the exact speeder CSS
idx_speeder_start = fb_text.find('/* ========================================================\n       UIVERSE SPEEDER')
if idx_speeder_start == -1:
    idx_speeder_start = fb_text.find('UIVERSE SPEEDER')
idx_speeder_end = fb_text.find('/* ========================================================\n       TIMER PROGRESS RING', idx_speeder_start)

speeder_css = fb_text[idx_speeder_start:idx_speeder_end]
print("Extracted speeder CSS, length:", len(speeder_css))

# 2. Extract timer progress ring CSS
idx_timer_ring_start = idx_speeder_end
idx_timer_ring_end = fb_text.find('/* 11 Franchise Cards', idx_timer_ring_start)
timer_ring_css = fb_text[idx_timer_ring_start:idx_timer_ring_end]
print("Extracted timer ring CSS, length:", len(timer_ring_css))

# 3. Extract the speeder HTML markup
idx_speeder_html_start = fb_text.find('<div id="speederOverlay"')
idx_speeder_html_end = fb_text.find('</div>\n  </div>\n\n  <!-- MAIN APP CONTAINER -->', idx_speeder_html_start) + 16
speeder_html = fb_text[idx_speeder_html_start:idx_speeder_html_end]
print("Extracted speeder HTML, length:", len(speeder_html))

# 4. Extract grain overlay SVG
grain_svg = '''  <!-- SVG Grain Pattern Filter -->
  <svg class="grain-overlay" aria-hidden="true">
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"></feTurbulence>
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)"></rect>
  </svg>'''

print("All visual components extracted from firebase_live.html successfully!")

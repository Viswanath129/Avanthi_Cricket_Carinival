# optimize_mobile_ui.py
for fname in ['index.html', 'Acc-Auction-Os.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    # Improve mobile responsiveness
    old_css_media = """    @media (max-width: 640px) {
      .app-header { height: auto; padding: 12px; flex-direction: column; gap: 10px; }
      .nav-tabs { width: 100%; max-width: 100%; overflow-x: auto; justify-content: flex-start; }
    }"""

    new_css_media = """    @media (max-width: 640px) {
      .app-header { height: auto; padding: 10px 12px; flex-direction: column; gap: 8px; }
      .nav-tabs { 
        width: 100%; 
        max-width: 100%; 
        overflow-x: auto; 
        justify-content: flex-start; 
        scrollbar-width: none; 
        -ms-overflow-style: none;
      }
      .nav-tabs::-webkit-scrollbar { display: none; }
      .nav-tab-btn { padding: 6px 10px; font-size: 0.75rem; }
      
      /* Mobile financial trading terminal adjustments */
      .financial-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 6px !important;
        padding: 12px 8px !important;
      }
      .financial-grid .sports-price {
        font-size: 20px !important;
      }
      .financial-grid .eyebrow {
        font-size: 8px !important;
      }
      .quotas-grid {
        grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
        gap: 3px !important;
      }
      .quotas-grid > div {
        padding: 4px 1px !important;
      }
      .quotas-grid .eyebrow {
        font-size: 8px !important;
      }
      .btn-giant-bid {
        height: 64px !important;
        font-size: 1.45rem !important;
      }
    }"""

    content = content.replace(old_css_media, new_css_media, 1)

    # Add class names to the franchise terminal elements
    content = content.replace(
      'style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center;"',
      'class="surface-elevated financial-grid" style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center;"'
    )
    content = content.replace(
      'style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; text-align: center;"',
      'class="quotas-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; text-align: center;"'
    )

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)

print("Mobile UI optimization applied to index.html and Acc-Auction-Os.html!")

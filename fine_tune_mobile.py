# fine_tune_mobile.py
for fname in ['index.html', 'Acc-Auction-Os.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    target = "/* Mobile financial trading terminal adjustments */"
    replacement = """/* Mobile financial trading terminal adjustments */
      #appMain { padding: 12px 10px 60px !important; }
      .surface-card, .surface-elevated { padding: 14px 12px !important; border-radius: 12px !important; }
      .financial-grid {
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 6px !important;
        padding: 10px 4px !important;
      }
      .financial-grid > div {
        padding: 8px 2px !important;
      }
      .financial-grid .sports-price {
        font-size: 17px !important;
      }
      .financial-grid .eyebrow {
        font-size: 8px !important;
        letter-spacing: 0.04em !important;
      }
      .quotas-grid {
        grid-template-columns: repeat(6, 1fr) !important;
        gap: 4px !important;
      }
      .quotas-grid > div {
        padding: 4px 2px !important;
        font-size: 10px !important;
      }"""

    if target in content:
        content = content.replace(target, replacement, 1)
        print(f"Applied fine-tuned mobile padding in {fname}")

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)

print("Mobile fine tuning complete!")

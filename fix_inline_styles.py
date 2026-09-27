# fix_inline_styles.py
for fname in ['index.html', 'Acc-Auction-Os.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    # Clean financial-grid inline style
    content = content.replace(
      'class="surface-elevated financial-grid" style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center;"',
      'class="surface-elevated financial-grid"'
    )
    # Clean quotas-grid inline style
    content = content.replace(
      'class="quotas-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; text-align: center;"',
      'class="quotas-grid"'
    )

    # Ensure CSS defines financial-grid and quotas-grid
    css_insert = """
    .financial-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      padding: 20px;
      text-align: center;
    }
    .quotas-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
      text-align: center;
    }
    """
    if ".financial-grid {" not in content:
        content = content.replace("/* Surface & Container Classes */", "/* Surface & Container Classes */\n" + css_insert)

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)

print("Inline styles cleaned and CSS classes applied!")

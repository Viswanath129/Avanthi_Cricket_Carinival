# extract_speeder.py
with open('firebase_live.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx1 = text.find('/* ========================================================\n       UIVERSE SPEEDER LOADING ANIMATION')
if idx1 == -1:
    idx1 = text.find('UIVERSE SPEEDER')
idx2 = text.find('</style>', idx1)
print("--- SPEEDER CSS ---")
print(text[idx1:idx2])

idx_html = text.find('id="speederOverlay"')
print("--- SPEEDER HTML ---")
print(text[idx_html-50:idx_html+1500])

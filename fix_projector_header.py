# fix_projector_header.py
for fname in ['index.html', 'Acc-Auction-Os.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    target = "function renderCurrentView() {"
    replacement = """function renderCurrentView() {
      const header = document.querySelector(".app-header");
      if (header) {
        header.style.display = (currentView === "projector") ? "none" : "flex";
      }"""

    if target in content:
        content = content.replace(target, replacement, 1)
        print(f"Fixed projector header visibility in {fname}")

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)

print("Projector header fix applied!")

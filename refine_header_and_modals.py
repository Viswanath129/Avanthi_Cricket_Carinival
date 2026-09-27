import re
import shutil

index_path = r"B:\projects\ACC\index.html"
backup_os_path = r"B:\projects\ACC\Acc-Auction-Os.html"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace 65KB base64 img tag with clean acc-logo.jpg
content = re.sub(
    r'<img src="data:image/jpeg;base64,[^"]+" alt="Avanthi Cricket Carnival Logo" class="brand-logo-img"[^>]*>',
    r'<img src="acc-logo.jpg" alt="Avanthi Cricket Carnival Logo" class="brand-logo-img">',
    content
)

# 2. Ensure base desktop styles for .brand-logo-img, .brand-text-title, .brand-text-sub
brand_css_replacement = """    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
      flex-shrink: 0;
    }

    .brand-logo-img {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    }

    .brand-text-title {
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: var(--text-main);
      line-height: 1.15;
      white-space: nowrap;
    }

    .brand-text-sub {
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      line-height: 1.2;
      white-space: nowrap;
    }"""

content = re.sub(
    r'    \.nav-brand \{\s+display: flex;\s+align-items: center;\s+gap: 12px;\s+cursor: pointer;\s+user-select: none;\s+\}',
    brand_css_replacement,
    content
)

# 3. Enhance modal styles for mobile
modal_replacement = """    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .modal-dialog {
      background: var(--glass-bg-elevated);
      backdrop-filter: blur(32px);
      -webkit-backdrop-filter: blur(32px);
      border: 1px solid rgba(255, 255, 255, 0.95);
      box-shadow: 0 25px 60px -10px rgba(15, 23, 42, 0.25);
      border-radius: 20px;
      max-width: 580px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      overflow-x: hidden;
      animation: modalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }"""

content = re.sub(
    r'    \.modal-overlay \{[\s\S]*?animation: modalIn 0\.22s cubic-bezier\(0\.16, 1, 0\.3, 1\);\s*\}',
    modal_replacement,
    content
)

# 4. In @media (max-width: 640px), add modal sizing
if ".modal-dialog {" not in content[content.find("@media (max-width: 640px)"):]:
    insert_point = content.find("@media (max-width: 640px) {") + len("@media (max-width: 640px) {\n")
    mobile_modal_css = """      .modal-overlay {
        padding: 10px !important;
      }
      .modal-dialog {
        border-radius: 16px !important;
        max-width: 100% !important;
      }
"""
    content = content[:insert_point] + mobile_modal_css + content[insert_point:]

with open(index_path, "w", encoding="utf-8") as f:
    f.write(content)

with open(backup_os_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Updated index.html ({len(content)} bytes) and synced to Acc-Auction-Os.html")

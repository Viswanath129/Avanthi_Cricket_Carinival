with open(r'B:\projects\ACC\generate_acc_2026.py', 'r', encoding='utf-8') as f:
    gen_lines = f.readlines()

login_block = "".join(gen_lines[1515:1718])

# Ensure login-view-grid is used for responsive mobile/desktop stacking
login_block = login_block.replace(
    '<div style="min-height: 80vh; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; padding: 20px 0;">',
    '<div class="login-view-grid">'
)

with open(r'B:\projects\ACC\index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

target = "    // ========================================================\n    // 8. VIEW 2: LIVE AUCTION FLOOR"
if target in index_content:
    index_content = index_content.replace(target, login_block + "\n" + target)

# Add login branch to renderCurrentView
rcv_target = '      } else if (currentView === "projector") {\n        container.innerHTML = renderProjectorView();\n      }'
rcv_replacement = '      } else if (currentView === "projector") {\n        container.innerHTML = renderProjectorView();\n      } else if (currentView === "login") {\n        container.innerHTML = renderLoginView();\n      }'
if rcv_target in index_content:
    index_content = index_content.replace(rcv_target, rcv_replacement)

with open(r'B:\projects\ACC\index.html', 'w', encoding='utf-8') as f:
    f.write(index_content)

with open(r'B:\projects\ACC\Acc-Auction-Os.html', 'w', encoding='utf-8') as f:
    f.write(index_content)

print("Inserted Section 6 (Login View) and updated renderCurrentView!")

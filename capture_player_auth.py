import subprocess
import os

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
base_dir = r"B:\projects\ACC"
html_file = os.path.join(base_dir, "test_player_auth.html")

with open(os.path.join(base_dir, "index.html"), "r", encoding="utf-8") as f:
    c = f.read()

c_p = c.replace(
    "let currentUser = {\n      role: 'PUBLIC',",
    "let currentUser = {\n      role: 'PLAYER', name: 'Arjun Kumar', title: 'Registered Student Player', playerId: '023',"
).replace(
    "let currentView = 'public';",
    "let currentView = 'player';"
).replace(
    'id="speederOverlay" class="speeder-overlay"',
    'id="speederOverlay" class="speeder-overlay hidden"'
)

with open(html_file, "w", encoding="utf-8") as f:
    f.write(c_p)

subprocess.run([
    edge_path, "--headless", "--disable-gpu",
    "--window-size=1440,900",
    f"--screenshot={os.path.join(base_dir, 'desktop_player_auth.png')}",
    "http://127.0.0.1:5000/test_player_auth.html"
], capture_output=True)

subprocess.run([
    edge_path, "--headless", "--disable-gpu",
    "--window-size=390,844",
    f"--screenshot={os.path.join(base_dir, 'mobile_player_auth.png')}",
    "http://127.0.0.1:5000/test_player_auth.html"
], capture_output=True)

if os.path.exists(html_file):
    os.remove(html_file)

print("Captured desktop_player_auth.png and mobile_player_auth.png successfully!")

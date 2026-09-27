import subprocess
import os
import time

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
base_dir = r"B:\projects\ACC"
html_file = os.path.join(base_dir, "test_admin_auth.html")

with open(os.path.join(base_dir, "index.html"), "r", encoding="utf-8") as f:
    c = f.read()

# In this test page, start directly as SUPER_ADMIN in admin view without speeder
c_admin = c.replace(
    "let currentUser = {\n      role: 'PUBLIC',",
    "let currentUser = {\n      role: 'SUPER_ADMIN',"
).replace(
    "let currentView = 'public';",
    "let currentView = 'admin';"
).replace(
    'id="speederOverlay" class="speeder-overlay"',
    'id="speederOverlay" class="speeder-overlay hidden"'
)

with open(html_file, "w", encoding="utf-8") as f:
    f.write(c_admin)

# Capture Desktop Admin
subprocess.run([
    edge_path, "--headless", "--disable-gpu",
    "--window-size=1440,900",
    f"--screenshot={os.path.join(base_dir, 'desktop_admin_auth.png')}",
    "http://127.0.0.1:5000/test_admin_auth.html"
], capture_output=True)

# Capture Mobile Admin
subprocess.run([
    edge_path, "--headless", "--disable-gpu",
    "--window-size=390,844",
    f"--screenshot={os.path.join(base_dir, 'mobile_admin_auth.png')}",
    "http://127.0.0.1:5000/test_admin_auth.html"
], capture_output=True)

if os.path.exists(html_file):
    os.remove(html_file)

print("Captured admin screenshots successfully without loader!")

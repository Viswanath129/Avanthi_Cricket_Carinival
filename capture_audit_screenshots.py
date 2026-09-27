import subprocess
import os

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
base_dir = r"B:\projects\ACC"

tests = [
    # (name, hash_view, width, height)
    ("desktop_public_v3", "public", 1440, 900),
    ("desktop_live_v3", "live", 1440, 900),
    ("desktop_admin_v3", "admin", 1440, 900),
    ("desktop_login_v3", "login", 1440, 900),
    ("mobile_public_v3", "public", 390, 844),
    ("mobile_live_v3", "live", 390, 844),
    ("mobile_franchise_v3", "franchise", 390, 844),
    ("mobile_admin_v3", "admin", 390, 844),
    ("mobile_login_v3", "login", 390, 844),
    ("mobile_teams_v3", "teams", 390, 844),
]

for name, view, w, h in tests:
    out_file = os.path.join(base_dir, f"{name}.png")
    url = f"http://127.0.0.1:5000/#{view}"
    cmd = [
        edge_path,
        "--headless",
        "--disable-gpu",
        "--virtual-time-budget=3000",
        f"--window-size={w},{h}",
        f"--screenshot={out_file}",
        url
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(out_file):
        size = os.path.getsize(out_file)
        print(f"Captured {name}: {w}x{h} -> {size} bytes")
    else:
        print(f"Failed to capture {name}")

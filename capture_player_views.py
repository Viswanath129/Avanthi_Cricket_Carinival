import subprocess
import os

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
base_dir = r"B:\projects\ACC"

tests = [
    ("mobile_player_v3", "player", 390, 844),
    ("mobile_register_v3", "register", 390, 844),
    ("desktop_player_v3", "player", 1440, 900),
    ("desktop_register_v3", "register", 1440, 900)
]

for name, view, w, h in tests:
    out_file = os.path.join(base_dir, f"{name}.png")
    url = f"http://127.0.0.1:5000/#{view}"
    cmd = [
        edge_path,
        "--headless",
        "--disable-gpu",
        "--virtual-time-budget=2000",
        f"--window-size={w},{h}",
        f"--screenshot={out_file}",
        url
    ]
    subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(out_file):
        print(f"Captured {name}: {os.path.getsize(out_file)} bytes")

# test_all_views.py
import subprocess
import os
import time

views = ["login", "franchise", "admin", "projector", "player"]
edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
temp_dir = os.environ.get("TEMP", r"C:\Users\kasiv\AppData\Local\Temp")

for v in views:
    out_file = os.path.join(temp_dir, f"acc_view_{v}.png")
    url = f"http://localhost:5000/#{v}"
    print(f"Capturing {v} from {url}...")
    cmd = [
        edge_path,
        "--headless",
        "--disable-gpu",
        f"--screenshot={out_file}",
        "--window-size=1440,900",
        url
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(out_file):
        print(f"  -> Captured {v} successfully ({os.path.getsize(out_file)} bytes)")
    else:
        print(f"  -> Failed to capture {v}")

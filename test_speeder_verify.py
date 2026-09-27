import subprocess
import os

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
base_dir = r"B:\projects\ACC"
index_html = os.path.join(base_dir, "index.html")
url = "file:///" + index_html.replace("\\", "/")

# 1. Capture during loading (speeder active at 600ms)
out_loading = os.path.join(base_dir, "speeder_loading_active.png")
cmd1 = [
    edge_path, "--headless", "--disable-gpu", "--allow-file-access-from-files",
    "--virtual-time-budget=600", "--window-size=1440,900", f"--screenshot={out_loading}", url
]
subprocess.run(cmd1, capture_output=True, text=True)

# 2. Capture after loaded (portal active at 3000ms)
out_loaded = os.path.join(base_dir, "speeder_loaded_public.png")
cmd2 = [
    edge_path, "--headless", "--disable-gpu", "--allow-file-access-from-files",
    "--virtual-time-budget=3000", "--window-size=1440,900", f"--screenshot={out_loaded}", url
]
subprocess.run(cmd2, capture_output=True, text=True)

print("speeder_loading_active exists:", os.path.exists(out_loading), os.path.getsize(out_loading) if os.path.exists(out_loading) else 0)
print("speeder_loaded_public exists:", os.path.exists(out_loaded), os.path.getsize(out_loaded) if os.path.exists(out_loaded) else 0)

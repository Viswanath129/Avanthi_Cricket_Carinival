import subprocess
import os

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
base_dir = r"B:\projects\ACC"
index_html = os.path.join(base_dir, "index.html")

# 1. Capture live auction with hourglass timer
url_live = f"file:///{index_html.replace(os.sep, '/')}#live"
out_live = os.path.join(base_dir, "test_hourglass_live.png")
cmd1 = [
    edge_path, "--headless", "--disable-gpu", "--allow-file-access-from-files",
    "--virtual-time-budget=1500", "--window-size=1440,900", f"--screenshot={out_live}", url_live
]
subprocess.run(cmd1, capture_output=True)
print("Captured test_hourglass_live.png:", os.path.exists(out_live), os.path.getsize(out_live) if os.path.exists(out_live) else 0)

# 2. Capture public view with hourglass timer
url_pub = f"file:///{index_html.replace(os.sep, '/')}#public"
out_pub = os.path.join(base_dir, "test_hourglass_public.png")
cmd2 = [
    edge_path, "--headless", "--disable-gpu", "--allow-file-access-from-files",
    "--virtual-time-budget=1500", "--window-size=1440,900", f"--screenshot={out_pub}", url_pub
]
subprocess.run(cmd2, capture_output=True)
print("Captured test_hourglass_public.png:", os.path.exists(out_pub), os.path.getsize(out_pub) if os.path.exists(out_pub) else 0)

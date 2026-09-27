import subprocess
import os

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
base_dir = r"B:\projects\ACC"
index_html = os.path.join(base_dir, "index.html")

# Test live auction view
url_live = "file:///" + index_html.replace("\\", "/") + "#live"
out_live = os.path.join(base_dir, "verify_view_live.png")
cmd = [
    edge_path, "--headless", "--disable-gpu", "--allow-file-access-from-files",
    "--virtual-time-budget=3000", "--window-size=1440,900", f"--screenshot={out_live}", url_live
]
subprocess.run(cmd, capture_output=True, text=True)

# Test login view
url_login = "file:///" + index_html.replace("\\", "/") + "#login"
out_login = os.path.join(base_dir, "verify_view_login.png")
cmd = [
    edge_path, "--headless", "--disable-gpu", "--allow-file-access-from-files",
    "--virtual-time-budget=3000", "--window-size=1440,900", f"--screenshot={out_login}", url_login
]
subprocess.run(cmd, capture_output=True, text=True)

print("verify_view_live exists:", os.path.exists(out_live), os.path.getsize(out_live) if os.path.exists(out_live) else 0)
print("verify_view_login exists:", os.path.exists(out_login), os.path.getsize(out_login) if os.path.exists(out_login) else 0)

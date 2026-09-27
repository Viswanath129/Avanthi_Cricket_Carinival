# test_screenshots_master.py
import subprocess
import os
import time
import requests
import json
import asyncio
import websockets
import base64

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
base_dir = r"B:\projects\ACC"
index_html = os.path.join(base_dir, "index.html")

tests = [
    ("master_desktop_public", "public", 1440, 900),
    ("master_desktop_live", "live", 1440, 900),
    ("master_desktop_login", "login", 1440, 900),
    ("master_desktop_admin", "admin", 1440, 900),
    ("master_desktop_projector", "projector", 1440, 900),
    ("master_mobile_public", "public", 390, 844),
    ("master_mobile_live", "live", 390, 844),
    ("master_mobile_franchise", "franchise", 390, 844),
    ("master_mobile_login", "login", 390, 844),
    ("master_mobile_register", "register", 390, 844)
]

port = 9339
proc = subprocess.Popen([
    edge_path,
    "--headless",
    "--disable-gpu",
    f"--remote-debugging-port={port}",
    "about:blank"
])

time.sleep(1.2)

async def capture_all():
    r = requests.get(f"http://127.0.0.1:{port}/json/list").json()
    page = [t for t in r if t.get("type") == "page"][0]
    ws_url = page["webSocketDebuggerUrl"]
    
    async with websockets.connect(ws_url) as ws:
        req_id = 100
        for name, view, w, h in tests:
            is_mobile = w <= 640
            req_id += 1
            await ws.send(json.dumps({
                "id": req_id,
                "method": "Emulation.setDeviceMetricsOverride",
                "params": {
                    "width": w,
                    "height": h,
                    "deviceScaleFactor": 1,
                    "mobile": is_mobile
                }
            }))
            await ws.recv()
            
            req_id += 1
            url = f"file:///{index_html.replace(os.sep, '/')}#{view}"
            await ws.send(json.dumps({
                "id": req_id,
                "method": "Page.navigate",
                "params": {"url": url}
            }))
            await ws.recv()
            await asyncio.sleep(2.0)
            
            # Dismiss speeder overlay
            req_id += 1
            await ws.send(json.dumps({
                "id": req_id,
                "method": "Runtime.evaluate",
                "params": {"expression": "if (window.hideSpeederOverlay) window.hideSpeederOverlay(0);"}
            }))
            await ws.recv()
            await asyncio.sleep(0.3)
            
            req_id += 1
            await ws.send(json.dumps({
                "id": req_id,
                "method": "Page.captureScreenshot",
                "params": {"format": "png"}
            }))
            shot_res = json.loads(await ws.recv())
            img_bytes = base64.b64decode(shot_res["result"]["data"])
            out_file = os.path.join(base_dir, f"{name}.png")
            with open(out_file, "wb") as f:
                f.write(img_bytes)
            print(f"Captured {name}: {w}x{h} -> {len(img_bytes)} bytes")

try:
    asyncio.run(capture_all())
finally:
    proc.terminate()

import subprocess
import time
import requests
import json
import asyncio
import websockets
import base64
import os

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
base_dir = r"B:\projects\ACC"
index_html = os.path.join(base_dir, "index.html")

port = 9336
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
        # Set 390x844 mobile device metrics
        await ws.send(json.dumps({
            "id": 1,
            "method": "Emulation.setDeviceMetricsOverride",
            "params": {
                "width": 390,
                "height": 844,
                "deviceScaleFactor": 1,
                "mobile": True
            }
        }))
        await ws.recv()
        
        # Test views
        views = [
            ("master_mobile_login", "login"),
            ("master_mobile_live", "live"),
            ("master_mobile_public", "public"),
            ("master_mobile_franchise", "franchise"),
            ("master_mobile_teams", "teams"),
            ("master_mobile_register", "register"),
            ("master_mobile_admin", "admin")
        ]
        
        req_id = 10
        for name, v in views:
            req_id += 1
            url = f"file:///{index_html.replace(os.sep, '/')}#{v}"
            await ws.send(json.dumps({
                "id": req_id,
                "method": "Page.navigate",
                "params": {"url": url}
            }))
            await ws.recv()
            await asyncio.sleep(1.5)
            
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
            print(f"Captured {name}: {len(img_bytes)} bytes")

try:
    asyncio.run(capture_all())
finally:
    proc.terminate()

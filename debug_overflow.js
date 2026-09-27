const http = require('http');
const { exec } = require('child_process');

const edgeCmd = '"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --remote-debugging-port=9222 --window-size=390,844 "file:///B:/projects/ACC/index.html#franchise"';

const child = exec(edgeCmd);

setTimeout(() => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const tabs = JSON.parse(data);
      const wsUrl = tabs[0].webSocketDebuggerUrl;
      console.log('Connected to Edge tab. Target:', tabs[0].url);

      // Connect via websocket
      const WebSocket = require('child_process');
      // Or run a script via curl/node
      child.kill();
    });
  }).on('error', err => {
    console.error('Error connecting to port 9222:', err.message);
    child.kill();
  });
}, 1500);

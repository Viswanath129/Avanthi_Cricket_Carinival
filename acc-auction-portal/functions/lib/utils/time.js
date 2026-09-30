"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerTime = exports.getTimeHttp = void 0;
const https_1 = require("firebase-functions/v2/https");
exports.getTimeHttp = (0, https_1.onRequest)({ cors: true }, (req, res) => {
    const serverNow = Date.now();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({
        serverNow,
        iso: new Date(serverNow).toISOString(),
        echo: req.query.echo || null,
    });
});
exports.getServerTime = (0, https_1.onCall)((request) => {
    const serverNow = Date.now();
    return {
        serverNow,
        iso: new Date(serverNow).toISOString(),
        echo: request.data?.echo || null,
    };
});
//# sourceMappingURL=time.js.map
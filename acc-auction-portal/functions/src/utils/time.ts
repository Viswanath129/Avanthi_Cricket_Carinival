import { onRequest, onCall } from 'firebase-functions/v2/https';

export const getTimeHttp = onRequest({ cors: true }, (req, res) => {
  const serverNow = Date.now();
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json({
    serverNow,
    iso: new Date(serverNow).toISOString(),
    echo: req.query.echo || null,
  });
});

export const getServerTime = onCall((request) => {
  const serverNow = Date.now();
  return {
    serverNow,
    iso: new Date(serverNow).toISOString(),
    echo: request.data?.echo || null,
  };
});

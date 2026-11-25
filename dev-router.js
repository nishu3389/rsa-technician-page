#!/usr/bin/env node
/* One https address for the technician page while the backend VM is http-only.

   Browsers block an https page (GitHub Pages) from calling an http API ("mixed content"). ngrok gives this machine
   an https URL, and this router sits behind it and splits the traffic:

     POST /api/v1/rsa/technician/photos   ->  UPLOAD_TARGET  (local photo-upload service, default http://localhost:8001)
     everything else under /api/v1/rsa/technician/  ->  VM_TARGET  (default http://20.244.83.128)

   Run:
     node dev-router.js                                   # listens on 8002
     ngrok http 8002 --url=<your-ngrok-domain>            # instead of "ngrok http 8001"
   and set both apiBase and uploadApiBase in config.json to https://<your-ngrok-domain>/api/

   Env: PORT (8002), VM_TARGET (http://20.244.83.128), UPLOAD_TARGET (http://localhost:8001).
   Only /api/v1/rsa/technician/ is forwarded. No dependencies. */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 8002);
const VM_TARGET = new URL(process.env.VM_TARGET || 'http://20.244.83.128');
const UPLOAD_TARGET = new URL(process.env.UPLOAD_TARGET || 'http://localhost:8001');
const ALLOWED = /^\/api\/v1\/rsa\/technician\//;
const UPLOAD = /^\/api\/v1\/rsa\/technician\/photos\/?$/;
const HOP = ['connection', 'keep-alive', 'proxy-connection', 'transfer-encoding', 'upgrade', 'te', 'trailer'];

function log(line) { console.log(new Date().toISOString() + ' ' + line); }

/* The page sends ngrok-skip-browser-warning to ngrok hosts; the VM's CORS list does not allow it, so CORS for
   VM-bound calls is answered here (the upload service already answers its own). */
function cors(req, headers) {
  headers['access-control-allow-origin'] = req.headers.origin || '*';
  headers['access-control-allow-methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
  headers['access-control-allow-headers'] = req.headers['access-control-request-headers']
    || 'accept, authorization, content-type, x-rsa-job-token, ngrok-skip-browser-warning';
  headers['access-control-max-age'] = '86400';
  headers.vary = 'Origin';
  return headers;
}

function isUpload(req, path) {
  if (!UPLOAD.test(path)) return false;
  if (req.method === 'POST') return true;
  /* a preflight for the upload goes where the upload goes */
  return req.method === 'OPTIONS' && String(req.headers['access-control-request-method'] || '').toUpperCase() === 'POST';
}

http.createServer((req, res) => {
  const path = req.url.split('?')[0];
  if (!ALLOWED.test(path) || path.indexOf('..') !== -1) {
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: false, error: 'not_found' }));
    return;
  }
  const upload = isUpload(req, path);
  const target = upload ? UPLOAD_TARGET : VM_TARGET;

  if (!upload && req.method === 'OPTIONS') {
    res.writeHead(204, cors(req, {}));
    res.end();
    log('OPTIONS ' + path + ' -> answered here');
    return;
  }

  const headers = {};
  Object.keys(req.headers).forEach((name) => {
    const lower = name.toLowerCase();
    if (HOP.indexOf(lower) === -1 && lower !== 'host' && lower !== 'ngrok-skip-browser-warning') headers[name] = req.headers[name];
  });
  headers.host = target.host;

  const client = target.protocol === 'https:' ? https : http;
  const upstream = client.request({
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port || (target.protocol === 'https:' ? 443 : 80),
    method: req.method,
    path: req.url,
    headers,
    timeout: 60000,
  }, (upstreamRes) => {
    const out = {};
    Object.keys(upstreamRes.headers).forEach((name) => {
      if (HOP.indexOf(name.toLowerCase()) === -1) out[name] = upstreamRes.headers[name];
    });
    if (!upload) {
      Object.keys(out).forEach((name) => { if (/^access-control-/i.test(name) || name.toLowerCase() === 'vary') delete out[name]; });
      cors(req, out);
    }
    res.writeHead(upstreamRes.statusCode || 502, out);
    upstreamRes.pipe(res);
    log(req.method + ' ' + path + ' -> ' + (upload ? 'upload' : 'vm') + ' ' + upstreamRes.statusCode);
  });
  upstream.on('timeout', () => upstream.destroy(new Error('timeout')));
  upstream.on('error', (error) => {
    log(req.method + ' ' + path + ' -> ' + (upload ? 'upload' : 'vm') + ' ERROR ' + error.message);
    if (res.headersSent) { res.end(); return; }
    res.writeHead(error.message === 'timeout' ? 504 : 502, cors(req, { 'content-type': 'application/json' }));
    res.end(JSON.stringify({ status: false, error: 'upstream_unreachable',
      errorMessage: 'The job service is not reachable right now. Try again in a moment.' }));
  });
  req.on('aborted', () => upstream.destroy());
  req.pipe(upstream);
}).listen(PORT, () => log('rsa dev router on :' + PORT + '  vm=' + VM_TARGET.origin + '  upload=' + UPLOAD_TARGET.origin));

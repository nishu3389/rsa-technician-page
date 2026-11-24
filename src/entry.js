/* Standalone entry: replaces the website's React route (index.js / RsaTechnicianJob.js).
   Everything the page needs comes from the URL or from window.RSA_CONFIG (see config.json):

     ?job=<jobToken>          the technician link token (also accepted: ?token=)
     &api=<url>               main API base, e.g. https://abc.ngrok-free.app/api/
     &upload_api=<url>        photo-upload API base (defaults to &api=)
     &ngrok=0                 do not add the ngrok-skip-browser-warning header
     ?demo=1                  boot.js demo mode: no API calls, sample data

   `markup`, `css` and `boot` are defined above this block by build.js. */

var cfg = window.RSA_CONFIG || {};
var query = new URLSearchParams(window.location.search);
var allowQuery = cfg.allowQueryApi !== false;

function pick(name, fallback) {
  var fromUrl = allowQuery ? (query.get(name) || '').trim() : '';
  return fromUrl || String(fallback || '').trim();
}

var jobToken = (query.get('job') || query.get('token') || cfg.jobToken || '').trim();
var apiBase = pick('api', cfg.apiBase);
var uploadApiBase = pick('upload_api', cfg.uploadApiBase) || apiBase;
var isDemo = query.get('demo') === '1';

/* ngrok's free tier answers browser requests with an HTML warning page unless this header is present.
   Added only for ngrok hosts. NOTE: the backend's CORS must list `ngrok-skip-browser-warning` in
   Access-Control-Allow-Headers, otherwise the browser blocks the call; use &ngrok=0 to turn this off. */
var ngrokHeader = query.get('ngrok') !== '0' && cfg.ngrokSkipWarning !== false;
var nativeFetch = window.fetch.bind(window);
window.fetch = function (url, init) {
  try {
    var target = typeof url === 'string' ? url : (url && url.url) || '';
    if (ngrokHeader && /ngrok/i.test(target)) {
      init = Object.assign({}, init);
      init.headers = Object.assign({}, init.headers, { 'ngrok-skip-browser-warning': '1' });
    }
  } catch (error) { /* fall through to a plain fetch */ }
  return nativeFetch(url, init);
};

function showSetupProblem(message) {
  var root = document.getElementById('rsa-job');
  root.innerHTML = '<div style="font-family:system-ui,sans-serif;max-width:520px;margin:48px auto;padding:20px;' +
    'border:1px solid #f5c2c7;background:#fff5f5;color:#842029;border-radius:10px;line-height:1.5">' +
    '<strong>Page not set up</strong><br>' + message + '</div>';
}

function start() {
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var root = document.getElementById('rsa-job');
  if (!isDemo && !apiBase) {
    showSetupProblem('No API address. Open this page as <code>?job=&lt;token&gt;&amp;api=https://your-api-host/api/</code> ' +
      'or set <code>apiBase</code> in config.json and rebuild.');
    return;
  }
  if (!isDemo && !jobToken) {
    showSetupProblem('No job token. Open this page as <code>?job=&lt;token&gt;&amp;api=...</code>.');
    return;
  }
  root.innerHTML = markup;
  boot({ jobToken: jobToken, apiBase: apiBase, uploadApiBase: uploadApiBase });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();

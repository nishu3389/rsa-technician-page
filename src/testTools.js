/* eslint-disable */
/* ==========================================================================================================
   TEST TOOLS - DEBUG ONLY. NOT FOR PRODUCTION.

   This module is never part of the normal page. boot.js loads it (a dynamic import, so a separate file / chunk) only
   when TEST_TOOLS_ENABLED is true, which needs BOTH `?debug=1` in the URL AND test/dev API hosts (see
   TEST_TOOLS_HOSTS in boot.js - the single place the flag is decided). On a production host the file is never
   requested and none of this code runs.

   Every request made here goes through the page's own request functions with the normal payloads: no new fields, no
   new endpoints. The tools only change which values are sent and when.

   ES5 on purpose, like boot.js. `tools` is the small set of the page's internals that boot.js hands over.
   ========================================================================================================== */

var CSS = [
  '#rsa-job .tt-icon{grid-area:dbg;justify-self:end;width:32px;height:32px;padding:0;border-radius:50%;background:#7b2cbf;color:#fff;',
  'font:700 16px/32px Georgia,serif;font-style:italic;text-align:center;box-shadow:0 0 0 2px rgba(255,255,255,.35)}',
  '#rsa-job .tt-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;z-index:1100;background:rgba(16,24,32,.35)}',
  '#rsa-job .tt-sheet{position:fixed;left:0;right:0;bottom:0;z-index:1101;max-height:78vh;overflow-y:auto;-webkit-overflow-scrolling:touch;',
  'background:#fff;color:#12161c;border-radius:16px 16px 0 0;border-top:5px solid #7b2cbf;box-shadow:0 -6px 30px rgba(0,0,0,.3);',
  'padding:0 14px calc(16px + env(safe-area-inset-bottom));font:14px/1.4 system-ui,-apple-system,sans-serif}',
  '#rsa-job .tt-head{position:sticky;top:0;background:#7b2cbf;color:#fff;margin:0 -14px 10px;padding:10px 14px;font-weight:800;',
  'letter-spacing:.06em;font-size:12px;display:flex;justify-content:space-between;align-items:center}',
  '#rsa-job .tt-head button{background:rgba(255,255,255,.2);color:#fff;border-radius:999px;min-width:44px;min-height:32px;padding:0 12px;font-weight:700}',
  '#rsa-job .tt-status{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;background:#f6f0fb;border-radius:10px;padding:10px;font-size:12.5px}',
  '#rsa-job .tt-status dt{color:#5a4570;font-weight:700}#rsa-job .tt-status dd{margin:0;font-variant-numeric:tabular-nums;word-break:break-word}',
  '#rsa-job .tt-sec{margin-top:14px;padding-top:12px;border-top:1px solid #eee}',
  '#rsa-job .tt-sec h3{margin:0 0 6px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7b2cbf}',
  '#rsa-job .tt-row{display:flex;gap:8px;align-items:center}',
  '#rsa-job .tt-btn{min-height:44px;padding:0 14px;border-radius:10px;background:#7b2cbf;color:#fff;font-weight:700;flex:1 1 auto}',
  '#rsa-job .tt-btn[disabled]{background:#d9cde6;color:#7a6b8a}',
  '#rsa-job .tt-in{width:88px;min-height:44px;border:1.5px solid #cdbfe0;border-radius:10px;padding:0 10px;font:inherit;font-size:15px}',
  '#rsa-job .tt-note{margin:4px 0 0;font-size:12px;color:#6b7885;min-height:0}#rsa-job .tt-note:empty{display:none}',
  '#rsa-job .tt-note.bad{color:#a4161a}#rsa-job .tt-stages{display:grid;gap:8px}'
].join('');

/* Google encoded polyline, precision 5 (the format the page sends). */
function encodePolyline(points) {
  var out = '', prevLat = 0, prevLng = 0;
  function enc(v) {
    v = v < 0 ? ~(v << 1) : (v << 1);
    var s = '';
    while (v >= 0x20) { s += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; }
    return s + String.fromCharCode(v + 63);
  }
  for (var i = 0; i < points.length; i += 1) {
    var lat = Math.round(points[i][0] * 1e5), lng = Math.round(points[i][1] * 1e5);
    out += enc(lat - prevLat) + enc(lng - prevLng);
    prevLat = lat; prevLng = lng;
  }
  return out;
}

function pad(n) { return (n < 10 ? '0' : '') + n; }
function clock(ms) { var d = new Date(ms); return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }

export default function startTestTools(tools) {
  var root = tools.root, state = tools.state, sim = tools.sim;
  var header = root.querySelector('header');
  if (!header) return function () {};

  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  /* room for the (i) icon next to Test drive (DEBUG ONLY: the production toolbar never has this column) */
  header.style.gridTemplateColumns = 'auto minmax(0, max-content) minmax(0, 1fr) auto auto auto';
  header.style.gridTemplateAreas = '"logo stage . send sim dbg"';

  var icon = document.createElement('button');
  icon.type = 'button';
  icon.className = 'tt-icon';
  icon.textContent = 'i';
  icon.title = 'TEST TOOLS: NOT FOR PRODUCTION';
  icon.setAttribute('aria-label', 'Test tools (not for production)');
  header.appendChild(icon);

  var backdrop = document.createElement('div');
  backdrop.className = 'tt-backdrop';
  backdrop.hidden = true;
  var sheet = document.createElement('div');
  sheet.className = 'tt-sheet';
  sheet.hidden = true;
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-label', 'Test tools, not for production');
  sheet.innerHTML =
    '<div class="tt-head"><span>TEST TOOLS: NOT FOR PRODUCTION</span><button type="button" data-tt="close">Close</button></div>' +
    '<dl class="tt-status" data-tt="status"></dl>' +
    '<div class="tt-sec"><h3>Send location once</h3><button class="tt-btn" type="button" data-tt="send">Send location now</button>' +
      '<p class="tt-note" data-tt="send-note"></p></div>' +
    '<div class="tt-sec"><h3>Jump along the route</h3><div class="tt-row"><input class="tt-in" data-tt="pct" type="number" min="0" max="100" step="1" value="90" inputmode="numeric" aria-label="Percent of the route">' +
      '<span>%</span><button class="tt-btn" type="button" data-tt="jump">Jump</button></div><p class="tt-note" data-tt="jump-note"></p></div>' +
    '<div class="tt-sec"><h3>Send an old position</h3><div class="tt-row"><input class="tt-in" data-tt="age" type="number" min="0" step="1" value="150" inputmode="numeric" aria-label="Age in seconds">' +
      '<span>s</span><button class="tt-btn" type="button" data-tt="old">Send old position</button></div><p class="tt-note" data-tt="old-note"></p></div>' +
    '<div class="tt-sec"><h3>Stages (real handlers)</h3><div class="tt-stages" data-tt="stages"></div></div>' +
    '<div class="tt-sec"><h3>Re-route</h3><button class="tt-btn" type="button" data-tt="reroute">Re-route (bump route_version)</button>' +
      '<p class="tt-note" data-tt="reroute-note"></p></div>';
  root.appendChild(backdrop);
  root.appendChild(sheet);
  function q(name) { return sheet.querySelector('[data-tt="' + name + '"]'); }
  function note(name, text, bad) { var el = q(name + '-note'); el.textContent = text || ''; el.classList.toggle('bad', !!bad); }

  /* ---------- A. status readout (DEBUG ONLY): refreshed every second, only while the sheet is open ---------- */
  var ticker = null;
  function row(label, value) { return '<dt>' + label + '</dt><dd>' + value + '</dd>'; }
  function esc(v) { return String(v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function renderStatus() {
    var now = Date.now();
    var last = state.lastLocPost;
    var sent = last ? clock(last.at) + ' (' + Math.round((now - last.at) / 1000) + ' s ago)' +
      (last.point ? ' at ' + Number(last.point.latitude).toFixed(5) + ', ' + Number(last.point.longitude).toFixed(5) : '') : 'nothing yet';
    var result = !last ? '-' : (last.error ? 'failed: ' + last.error : 'HTTP ' + last.status + (last.ok ? '' : ' (rejected)'));
    var prog = tools.routeProgress();
    var gps = tools.gpsState();
    var periodic = !state.sendOn ? 'off (Location unchecked)'
      : (tools.isPolling() ? 'on, every ' + (state.interval || 15) + ' s' + (sim.on ? (sim.paused ? ' (Test drive paused)' : ' (Test drive)') : '') : 'not running (stage ' + (state.stage || '-') + ')');
    q('status').innerHTML =
      row('Stage', esc(tools.stageLabel())) +
      row('Last sent', esc(sent)) +
      row('Last result', esc(result)) +
      row('Route', esc(prog === null ? 'no route' : prog.pct.toFixed(1) + ' % (' + prog.source + ')')) +
      row('route_version', esc(state.routeVersion === undefined || state.routeVersion === null ? 'not reported by backend' : state.routeVersion)) +
      row('GPS', esc(gps)) +
      row('Posting', esc(periodic));
    renderStages();
  }

  function open() {
    backdrop.hidden = false; sheet.hidden = false;
    renderStatus();
    if (!ticker) ticker = setInterval(renderStatus, 1000);
  }
  /* closing only hides the sheet: nothing that was started is stopped */
  function close() {
    backdrop.hidden = true; sheet.hidden = true;
    if (ticker) { clearInterval(ticker); ticker = null; }
  }
  icon.addEventListener('click', function () { if (sheet.hidden) open(); else close(); });
  backdrop.addEventListener('click', close);
  q('close').addEventListener('click', close);

  /* The position the page would send right now: the Test-drive position while it runs, otherwise the latest GPS fix. */
  function currentPoint() {
    var f = sim.on && sim.fix ? sim.fix : state.fix;
    if (!f) return null;
    return { latitude: f.latitude, longitude: f.longitude, accuracy_m: Math.round(f.accuracy || (sim.on ? 10 : 0)) };
  }

  /* One normal location post (same endpoint, same payload shape) via the page's own post function. */
  function postOne(point, recordedAtMs) {
    return tools.postLocation({ points: [{
      latitude: point.latitude,
      longitude: point.longitude,
      accuracy_m: point.accuracy_m,
      recorded_at: new Date(recordedAtMs).toISOString()
    }] });
  }
  function outcome() {
    var l = state.lastLocPost;
    return !l ? 'no answer' : (l.error ? 'failed: ' + l.error : 'HTTP ' + l.status);
  }

  /* ---------- B1. Send location once (DEBUG ONLY) ---------- */
  q('send').addEventListener('click', function () {
    var p = currentPoint();
    if (!p) { note('send', 'No position yet (no GPS fix and Test drive is off).', true); return; }
    note('send', 'Sending…');
    postOne(p, Date.now()).then(function () {
      note('send', 'Sent at ' + clock(state.lastLocPost ? state.lastLocPost.at : Date.now()) + ' · ' + outcome(), !!(state.lastLocPost && !state.lastLocPost.ok));
      renderStatus();
    });
  });

  /* ---------- B2. Jump to X% of the route (DEBUG ONLY) ---------- */
  q('jump').addEventListener('click', function () {
    var pct = Math.max(0, Math.min(100, Number(q('pct').value)));
    if (!isFinite(pct)) { note('jump', 'Enter 0 to 100.', true); return; }
    var p = tools.jumpTo(pct / 100);
    if (!p) { note('jump', 'No route on the map yet.', true); return; }
    postOne(p.point, Date.now()).then(function () {
      note('jump', 'Moved to ' + pct + ' % and sent at ' + clock(Date.now()) + ' · ' + outcome() +
        (p.simulated ? ' · Test drive continues from here.' : ' · Test drive is off, so the real GPS takes over again on the next post.'),
        !!(state.lastLocPost && !state.lastLocPost.ok));
      renderStatus();
    });
  });

  /* ---------- B3. Send a position with an age of N seconds (DEBUG ONLY) ----------
     The location contract carries recorded_at per point, so an old position is simply recorded_at = now - N s. */
  q('old').addEventListener('click', function () {
    var age = Number(q('age').value);
    if (!isFinite(age) || age < 0) { note('old', 'Enter a number of seconds.', true); return; }
    var p = currentPoint();
    if (!p) { note('old', 'No position yet (no GPS fix and Test drive is off).', true); return; }
    var at = Date.now() - age * 1000;
    postOne(p, at).then(function () {
      note('old', 'Sent with recorded_at ' + clock(at) + ' (' + age + ' s old) · ' + outcome(), !!(state.lastLocPost && !state.lastLocPost.ok));
      renderStatus();
    });
  });

  /* ---------- B4. Stage buttons (DEBUG ONLY): each calls the page's real handler ---------- */
  var stageBox = q('stages');
  var STAGES = [
    { key: 'start', label: 'Start trip', run: function () { tools.startTrip(); },
      why: function (s) { return s === 'assigning' ? '' : 'Only from "Assigned to you".'; } },
    { key: 'reached', label: 'Reached', run: function () { tools.markReached(); },
      why: function (s) { return (s === 'on_the_way' || s === 'almost_here') ? '' : 'Only while On the way / Almost here.'; },
      hint: 'The backend checks you are within ' + tools.arriveRadius + ' m: turn Test drive on and Jump to 100 % first.' },
    { key: 'work', label: 'Start work (verify OTP)', otp: true, run: function (otp) { tools.verifyOtp(otp); },
      why: function (s, otp) { return s !== 'reached' ? 'Only once Reached.' : (/^\d{4}$/.test(otp) ? '' : 'Enter the 4-digit OTP from the customer app.'); } },
    { key: 'photo', label: 'Upload photo (test image)', run: function () { tools.uploadTestPhoto(); },
      why: function (s) { return s !== 'working' ? 'Only in Work in progress.' : (state.photos.length >= state.minPhotos ? 'All photos are in.' : (state.photoBusy ? 'Uploading…' : '')); } },
    { key: 'complete', label: 'Complete', run: function () { tools.completeJob(); },
      why: function (s) { return s !== 'working' ? 'Only in Work in progress.' : (state.photos.length < state.minPhotos ? 'Needs ' + state.minPhotos + ' photos (' + state.photos.length + ' so far).' : ''); } }
  ];
  STAGES.forEach(function (st) {
    var wrap = document.createElement('div');
    var line = document.createElement('div');
    line.className = 'tt-row';
    if (st.otp) {
      var otp = document.createElement('input');
      otp.className = 'tt-in';
      otp.inputMode = 'numeric';
      otp.maxLength = 4;
      otp.placeholder = 'OTP';
      otp.setAttribute('aria-label', 'Arrival OTP');
      otp.addEventListener('input', renderStages);
      line.appendChild(otp);
      st.input = otp;
    }
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tt-btn';
    b.textContent = st.label;
    b.addEventListener('click', function () { st.run(st.input ? st.input.value.replace(/\D/g, '') : undefined); setTimeout(renderStatus, 300); });
    line.appendChild(b);
    var why = document.createElement('p');
    why.className = 'tt-note';
    wrap.appendChild(line);
    wrap.appendChild(why);
    stageBox.appendChild(wrap);
    st.button = b; st.whyEl = why;
  });
  function renderStages() {
    STAGES.forEach(function (st) {
      var reason = st.why(state.stage, st.input ? st.input.value.replace(/\D/g, '') : '');
      if (!reason && (state.posting || state.otpBusy)) reason = 'Waiting for the previous request…';
      st.button.disabled = !!reason;
      st.whyEl.textContent = reason || st.hint || '';
    });
    var rr = tools.rerouteBlocked();
    q('reroute').disabled = !!rr;
    if (rr && !q('reroute-note').textContent) note('reroute', rr);
  }

  /* ---------- B5. Re-route (DEBUG ONLY) ----------
     The page has no re-route flow: a route is only ever sent with start_journey (T2), and the contract has no
     route_version field for the page to set. So this shifts the middle of the current route a little sideways and
     re-sends start_journey with its normal fields (position, route_polyline, distance, duration, computed_at). The
     backend decides whether it accepts that outside "Assigned" and whether route_version changes; the answer is shown. */
  q('reroute').addEventListener('click', function () {
    var route = state.route;
    if (!route || route.length < 3) { note('reroute', 'No route to change.', true); return; }
    var p = currentPoint();
    if (!p) { note('reroute', 'No position yet.', true); return; }
    var n = route.length, a = Math.floor(n * 0.25), b = Math.ceil(n * 0.75);
    var shifted = route.map(function (pt, i) {
      if (i <= a || i >= b) return pt;
      var k = Math.sin(Math.PI * (i - a) / (b - a));        /* 0 at the ends of the shifted stretch, 1 in the middle */
      return [pt[0] + 0.0012 * k, pt[1] - 0.0012 * k];       /* roughly 130-170 m sideways at the widest */
    });
    var before = state.routeVersion;
    note('reroute', 'Sending…');
    tools.postJson(tools.API + 'start_journey', {
      latitude: p.latitude,
      longitude: p.longitude,
      recorded_at: new Date().toISOString(),
      route_polyline: encodePolyline(shifted),
      route_distance_meters: Math.round(tools.routeLength(shifted)),
      route_duration_minutes: Math.max(1, Math.round(tools.routeLength(shifted) / 1000 / 25 * 60)),
      route_computed_at: new Date().toISOString()
    }).then(function (result) {
      var body = result.body || {};
      var data = body.data || {};
      if (result.ok && body.status) {
        tools.useRoute(shifted, encodePolyline(shifted));
        var after = state.routeVersion;
        note('reroute', 'Accepted (HTTP ' + result.status + '). route_version: ' +
          (after === undefined || after === null ? 'not reported by backend' : (before + ' → ' + after)) +
          (data.route_accepted === false ? ' · backend says route_accepted=false' : ''));
      } else {
        note('reroute', 'Rejected: HTTP ' + result.status + ' ' + (body.error || '') + (body.errorMessage ? ' — ' + body.errorMessage : '') +
          '. The backend only takes a route with start_journey; a mid-trip re-route needs backend support.', true);
      }
      renderStatus();
    }).catch(function (error) { note('reroute', 'failed: ' + (error && error.message), true); });
  });

  return function dispose() {
    close();
    [icon, backdrop, sheet, style].forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
    header.style.gridTemplateColumns = '';
    header.style.gridTemplateAreas = '';
  };
}

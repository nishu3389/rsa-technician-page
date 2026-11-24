/* eslint-disable */
/* RSA technician page logic, ported verbatim in style from the standalone rsa_technician_job.html page (ES5 on
   purpose, so the repo's modern-JS lint rules are switched off for this file). It has no dependencies of its own:
   the markup is injected as HTML (see markup.js) and this module drives it by element id. */

var LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
var LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

/* Double-boot guard: remounts and fast refresh can call boot() twice. */
var started = false;

function noop() {}

export default function boot(options) {
  options = options || {};
  if (started) return noop;
  var root = document.getElementById('rsa-job');
  if (!root) return noop;
  started = true;

  /* The token comes from the route, never from the URL pathname. */
  var jobToken = String(options.jobToken || '').trim();
  var apiBase = String(options.apiBase || '');
  if (apiBase && apiBase.charAt(apiBase.length - 1) !== '/') apiBase += '/';
  var API = apiBase + 'v1/rsa/technician/';
  /* Photo upload (POST) may be served by a separate API base (e.g. a local upload service while testing).
     It falls back to the main API base when none is given. Retake (DELETE) stays on the main API. */
  var uploadApiBase = String(options.uploadApiBase || '') || apiBase;
  if (uploadApiBase && uploadApiBase.charAt(uploadApiBase.length - 1) !== '/') uploadApiBase += '/';
  var UPLOAD_API = uploadApiBase + 'v1/rsa/technician/';

  var destroyed = false;
  var injected = [];
  var windowListeners = [];
  var headerObserver = null;
  var objectUrls = [];
  var L = null;
  var initialMarkup = root.innerHTML;
  var previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  /* After teardown no request may be sent and no stale callback may touch the DOM: park the chain. */
  function halted() { return new Promise(function () {}); }
  function addWindowListener(type, handler) {
    window.addEventListener(type, handler);
    windowListeners.push([type, handler]);
  }

  /* The header renders taller inside the website than in the standalone page: measure it so the ETA pill clears it. */
  function syncHeaderHeight() {
    var header = document.querySelector('#rsa-job header');
    var height = header ? header.offsetHeight : 0;
    if (height > 0) root.style.setProperty('--rsa-header-h', height + 'px');
  }
  syncHeaderHeight();
  addWindowListener('resize', syncHeaderHeight);
  /* the header grows and shrinks with the stage text, so keep watching it rather than measuring once */
  if (typeof ResizeObserver !== 'undefined') {
    headerObserver = new ResizeObserver(syncHeaderHeight);
    var headerEl = document.querySelector('#rsa-job header');
    if (headerEl) headerObserver.observe(headerEl);
  }

    var STAGE_LABELS = {
      assigning: 'Assigned to you',
      on_the_way: 'On the way',
      almost_here: 'Almost here',
      reached: 'Reached you',
      working: 'Work in progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    /* Stages where the technician can still be driving, so the location poll runs. */
    var DRIVING_STAGES = { on_the_way: 1, almost_here: 1, reached: 1 };
    /* T4 "I have reached" is offered while driving; the backend only accepts it in these two stages. */
    var ARRIVAL_STAGES = { on_the_way: 1, almost_here: 1 };
    /* The OTP (T5) is accepted once the job is `reached` - the arrival tap moves it there. */
    var OTP_STAGES = { reached: 1 };
    /* The only stage where a photo may be uploaded (T6) and the job completed (T7). */
    var PHOTO_STAGES = { working: 1 };
    /* "I have reached" is only offered within ARRIVE_RADIUS_M of the customer. Once locked it re-opens at <= the radius and
       re-locks only above the wider ARRIVE_RELOCK_M, so a jittering fix does not flicker the button. */
    var ARRIVE_RADIUS_M = 200;
    var ARRIVE_RELOCK_M = 250;
    /* Unlock when distance - accuracy <= ARRIVE_RADIUS_M (GPS error counts in the technician's favour); once unlocked,
       re-lock only when distance > ARRIVE_RELOCK_M. wasLocked is null before the first known distance, which is
       evaluated strictly against the radius. */
    function arrivalLocked(wasLocked, distance, accuracy) {
      var acc = typeof accuracy === 'number' && isFinite(accuracy) && accuracy > 0 ? accuracy : 0;
      if (distance - acc <= ARRIVE_RADIUS_M) return false;
      return wasLocked === false ? distance > ARRIVE_RELOCK_M : true;
    }

    var byId = function (id) { return document.getElementById(id); };
    var params = new URLSearchParams(window.location.search);
    /* job_id is only a local-test path, used when the route gave no token. */
    var jobId = jobToken ? '' : (params.get('job_id') || '').trim();

    /* ---- DEMO MODE (local inspection only): active solely when the URL has ?demo=1. No API calls, no polling, no
       geolocation; sample data below. ?demo=1&stage=assigning shows the details view, anything else the trip view. */
    var demo = params.get('demo') === '1';
    var demoStage = params.get('stage') === 'assigning' ? 'assigning' : 'trip';
    var demoMock = params.get('mock') || '';
    /* ?away=<metres> (demo only) fakes the distance from the customer; without it the demo gate stays open. */
    var demoAway = params.get('away') !== null && params.get('away') !== '' && isFinite(Number(params.get('away')))
      ? Number(params.get('away')) : null;
    /* ?acc=<metres> (demo only) fakes the fix's reported accuracy fed to the same gate computation; default 0. */
    var demoAcc = params.get('acc') !== null && isFinite(Number(params.get('acc'))) && params.get('acc') !== ''
      ? Number(params.get('acc')) : 0;
    var DEMO_DETAIL = {
      stage: 'assigning',
      order_id: 'DEMO-100001',
      customer: { name: 'Sample Customer', phone_masked: '98XXXXXX10' },
      customer_location: { latitude: 12.9716, longitude: 77.5946, address: '12 MG Road, Bengaluru, Karnataka 560001' },
      car: { name: 'Maruti Suzuki Swift VXi', reg_number: 'KA 01 AB 1234' },
      services: ['Battery jump start', 'Tyre pressure check'],
      photos: { min_required: 4, uploaded: 0 },
      location_interval_sec: 15
    };
    /* ?mock=bad-car reproduces the payload seen on a live dev job (brand glued to the plate, object services). */
    var DEMO_BAD_CAR = {
      car: { name: '', reg_number: 'Hyundai978228400899268 9861' },
      services: [{ name: 'Tyre Puncture' }, { service_name: 'Battery Jumpstart' }],
      customer: { name: '', phone_masked: '97\u2022\u2022\u2022\u2022\u2022008' }
    };
    var DEMO_FIX = { latitude: 12.9650, longitude: 77.5990, accuracy: 10 };
    var DEMO_ROUTE = [[12.9650, 77.5990], [12.9672, 77.5975], [12.9690, 77.5962], [12.9705, 77.5951], [12.9716, 77.5946]];

    var state = {
      detail: null,
      stage: null,
      eta: null,
      route: [],
      fix: null,
      away: null,       /* metres to the customer, or null when unknown (the gate then stays open) */
      locked: null,     /* null until a distance is first known; then true/false */
      serverAway: null,
      routeAt: 0,
      pollTimer: null,
      watchId: null,
      posting: false,
      lastPostAt: 0,
      buffer: [],
      interval: 15,
      otpBusy: false,
      photoBusy: false,
      photos: [],
      minPhotos: 4,
      permission: 'prompt',  /* 'prompt' | 'granted' | 'denied': geolocation permission for this page */
      permApi: false,        /* true when the Permissions API answers for geolocation; only then is Start Trip gated */
      gateClosed: false      /* error / closed-link / finished job: the location banner has no business on screen */
    };
    var permissionStatus = null;
    var gateOverflow = null;  /* body overflow captured while the location dialog is up; null when it is down */

    function text(id, value, fallback) {
      var el = byId(id);
      if (!el) return;
      el.textContent = (value === null || value === undefined || value === '') ? (fallback || '\u2014') : String(value);
    }
    function firstText(values) {
      for (var i = 0; i < values.length; i += 1) {
        var v = values[i];
        if (v === null || v === undefined) continue;
        var t = String(v).replace(/\s+/g, ' ').trim();
        if (t) return t;
      }
      return '';
    }
    /* Vehicle fields differ between payloads, so several keys are accepted. Returns { name, reg } (empty strings when
       unknown). A plate with a brand glued to the front ("Hyundai978228400899268 9861") is split only when no car name
       is present; anything that already looks like a plate ("KA01AB1234", "HR 26 89861") is left alone. */
    function vehicleFields(car) {
      car = car || {};
      var name = firstText([car.name, car.display_name]);
      if (!name) {
        name = [car.make || car.brand, car.model, car.variant].map(function (p) { return firstText([p]); })
          .filter(Boolean).join(' ');
      }
      var reg = firstText([car.reg_number, car.registration_number, car.registration, car.reg_no, car.plate]).toUpperCase();
      if (!name && reg) {
        var m = /^([A-Z]{2,})(\d.*)$/.exec(reg);
        var raw = firstText([car.reg_number, car.registration_number, car.registration, car.reg_no, car.plate]);
        var looksLikePlate = /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{3,4}$/.test(reg.replace(/\s+/g, ''));
        if (m && !looksLikePlate) {
          name = raw.slice(0, m[1].length);
          reg = m[2].trim();
        }
      }
      return { name: name, reg: reg };
    }
    /* Break a long plate on the space nearest the middle so it wraps there rather than inside a digit run. */
    function plateWrap(reg) {
      if (!reg || reg.length <= 14 || reg.indexOf(' ') < 0) return reg;
      var mid = reg.length / 2, best = -1;
      for (var i = 0; i < reg.length; i += 1) {
        if (reg.charAt(i) === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
      }
      return reg.slice(0, best) + '\n' + reg.slice(best + 1);
    }
    function serviceNames(list) {
      if (!Array.isArray(list)) return [];
      return list.map(function (item) {
        if (item && typeof item === 'object') return firstText([item.name, item.service_name, item.title]);
        return firstText([item]);
      }).filter(Boolean);
    }
    function show(id) { byId(id).classList.remove('hidden'); }
    function hide(id) { byId(id).classList.add('hidden'); }

    function setNotice(id, message, isError) {
      var el = byId(id);
      if (!el) return;
      if (!message) { el.textContent = ''; el.classList.add('hidden'); return; }
      el.textContent = message;
      el.classList.toggle('error', !!isError);
      el.classList.remove('hidden');
    }

    function isoNow() { return new Date().toISOString(); }

    function readJson(response) {
      return response.json().catch(function () { return {}; })
        .then(function (body) {
          if (destroyed) return halted();
          return { ok: response.ok, status: response.status, body: body };
        });
    }

    /* Every technician call carries the job token from the link (contract section 1). */
    function authHeaders(extra) {
      var headers = extra || {};
      if (jobToken) headers['X-Rsa-Job-Token'] = jobToken;
      return headers;
    }

    function getJson(url) {
      if (destroyed) return halted();
      return fetch(url, { headers: authHeaders({ 'Accept': 'application/json' }), credentials: 'same-origin' }).then(readJson);
    }

    function postJson(url, payload) {
      if (destroyed) return halted();
      return fetch(url, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify(payload || {})
      }).then(readJson);
    }

    function postForm(url, form) {
      if (destroyed) return halted();
      return fetch(url, {
        method: 'POST',
        headers: authHeaders({ 'Accept': 'application/json' }),
        credentials: 'same-origin',
        body: form
      }).then(readJson);
    }

    /* 410 / 401 and job_token_revoked, link_bound_to_other_device, link_expired end the job for this page.
       A 409 invalid_stage is a normal stage error: it falls through to syncStage(). */
    function endOfLink(body, status) {
      var error = (body && body.error) || '';
      if (status === 410 || status === 401 || error === 'job_token_revoked' ||
          error === 'link_expired' || error === 'link_bound_to_other_device') {
        return (body && body.errorMessage) || 'This link is no longer valid. Ask the ops team for a fresh link.';
      }
      return null;
    }

    /* ---------------- location permission gate ---------------- */

    var GATE_PROMPT_COPY = 'Location is needed for this trip. Allow location for this page to start.';
    var GATE_BLOCKED_COPY = 'Location is blocked for this page. Open the browser’s site settings (padlock icon) ' +
      '→ Location → Allow, then reload this page.';

    /* Start Trip is disabled while a request is in flight, and (only when the Permissions API can tell us the state)
       until location is granted. Without that API the button stays live and the tap attempts the read, as before. */
    function syncStartButton() {
      var button = byId('start-trip');
      if (!button) return;
      button.disabled = state.posting || (state.permApi && state.permission !== 'granted');
    }

    /* Paint the blocking dialog from state.permission: prompt copy + "Allow location" button, or the blocked copy +
       "Reload page" (the browser silently swallows a repeat prompt, so only a reload after changing site settings
       helps). Hidden once granted, on closed screens and in demo mode. While it is up, page scroll is locked; hiding
       puts back whatever overflow the body had when the dialog went up. */
    function renderLocationGate() {
      if (demo) return;
      var gate = byId('location-gate');
      if (!gate) return;
      var blocked = state.permission === 'denied';
      var show = !(state.gateClosed || state.permission === 'granted');
      gate.classList.toggle('hidden', !show);
      gate.classList.toggle('error', blocked);
      byId('location-gate-text').textContent = blocked ? GATE_BLOCKED_COPY : GATE_PROMPT_COPY;
      byId('allow-location').classList.toggle('hidden', blocked);
      byId('reload-page').classList.toggle('hidden', !blocked);
      if (show && gateOverflow === null) {
        gateOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      } else if (!show && gateOverflow !== null) {
        document.body.style.overflow = gateOverflow;
        gateOverflow = null;
      }
      syncStartButton();
    }

    function setPermission(next) {
      if (next !== 'prompt' && next !== 'granted' && next !== 'denied') return;
      /* A fix proves access: a lagging or quirky 'prompt' report (older Safari) must not take it back. */
      if (next === 'prompt' && state.fix) return;
      if (state.permission === next) return;
      state.permission = next;
      renderLocationGate();
    }

    /* Keep state.permission in step with the browser via the Permissions API, where it exists. */
    function watchPermission() {
      if (demo || !navigator.permissions || typeof navigator.permissions.query !== 'function') return;
      state.permApi = true;     /* set now so Start Trip stays disabled until the first answer arrives */
      try {
        navigator.permissions.query({ name: 'geolocation' }).then(function (status) {
          if (destroyed) return;
          permissionStatus = status;
          status.onchange = function () { setPermission(status.state); };
          setPermission(status.state);
          renderLocationGate();
        }).catch(function () {
          state.permApi = false;  /* API present but not for geolocation: fall back to attempt-on-tap */
          renderLocationGate();
        });
      } catch (error) {
        state.permApi = false;
      }
    }

    /* One getCurrentPosition call whose job is to raise the browser's permission prompt (on open, and from the
       "Allow location" tap, where it runs inside the click so it counts as a user gesture). Any fix it returns is kept.
       Never throws and never blocks: failures just repaint the dialog. */
    function askLocation() {
      if (demo || destroyed || !navigator.geolocation) return;
      try {
        navigator.geolocation.getCurrentPosition(function (position) {
          if (destroyed) return;
          setFix({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        }, function () {
          if (!destroyed) renderLocationGate();
        }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 });
      } catch (error) { /* a broken geolocation implementation must not reach the job fetch */ }
    }

    function closeGate() {
      state.gateClosed = true;
      renderLocationGate();
    }

    function showError(message) {
      closeGate();
      hide('loading');
      hide('assigning-body');
      hide('view-trip');
      byId('view-assigning').style.display = '';
      byId('page-title').textContent = 'Job unavailable';
      hide('stage-pill');
      byId('error-title').textContent = 'This link does not open a job';
      byId('error-text').textContent = message;
      show('error');
    }

    function failLink(message) {
      closeGate();
      stopPolling();
      hide('view-trip');
      hide('assigning-body');
      hide('loading');
      byId('view-assigning').style.display = '';
      byId('page-title').textContent = 'Link closed';
      hide('stage-pill');
      byId('error-title').textContent = 'This link is closed';
      byId('error-text').textContent = message;
      show('error');
    }

    /* 409 invalid_stage means another request already moved the job: follow the stage the API reports. */
    function syncStage(body) {
      var data = (body && body.data) || {};
      if (body && body.error === 'invalid_stage' && data.stage) {
        applyStage(data.stage);
        return 'The job has moved on \u2014 it is now "' + (STAGE_LABELS[data.stage] || data.stage) + '".';
      }
      return null;
    }

    function currentPosition() {
      return new Promise(function (resolve, reject) {
        if (!navigator.geolocation) { reject(new Error('no_geolocation')); return; }
        navigator.geolocation.getCurrentPosition(
          function (position) {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          function (error) { reject(error); },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
        );
      });
    }

    /* A fresh fix when the browser gives us one quickly; otherwise the position the watch already reported. A slow or
       refused GPS must never leave a button spinning: after four seconds the last known fix is good enough. */
    function positionFix() {
      return new Promise(function (resolve, reject) {
        var settled = false;
        var timer = setTimeout(function () {
          if (settled) return;
          settled = true;
          if (state.fix) resolve(state.fix); else reject(new Error('position_timeout'));
        }, 4000);
        currentPosition().then(function (fix) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          setFix(fix);
          resolve(fix);
        }).catch(function (error) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (state.fix) resolve(state.fix); else reject(error);
        });
      });
    }

    /* Google encoded polyline, precision 5 - the format the route is sent and drawn in. */
    function decodePolyline(encoded) {
      var points = [], index = 0, lat = 0, lng = 0;
      while (encoded && index < encoded.length) {
        var shift = 0, result = 0, byte;
        do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20 && index <= encoded.length);
        lat += (result & 1) ? ~(result >> 1) : (result >> 1);
        shift = 0; result = 0;
        do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20 && index <= encoded.length);
        lng += (result & 1) ? ~(result >> 1) : (result >> 1);
        points.push([lat / 1e5, lng / 1e5]);
      }
      return points;
    }

    /* The page draws the trip route once at Start (T2); the backend stores it and serves it to the customer. */
    function drawRoute(from, to) {
      if (!from || !to || to.latitude === undefined || to.longitude === undefined) return Promise.resolve(null);
      if (destroyed) return halted();
      var url = 'https://router.project-osrm.org/route/v1/driving/' +
        from.longitude + ',' + from.latitude + ';' + to.longitude + ',' + to.latitude +
        '?overview=full&geometries=polyline&alternatives=false&steps=false';
      /* Third-party origin: plain fetch, no auth headers or credentials. The job token must never go to a third-party origin. */
      return fetch(url, { headers: { 'Accept': 'application/json' } }).then(readJson).then(function (result) {
        var route = result.ok && result.body && result.body.routes && result.body.routes[0];
        if (!route) return null;
        return {
          route_polyline: route.geometry,
          route_distance_meters: Math.round(route.distance),
          route_duration_minutes: Math.max(1, Math.round(route.duration / 60)),
          route_computed_at: isoNow()
        };
      }).catch(function () { return null; });
    }

    function renderDetails(detail) {
      var customer = detail.customer || {};
      var location = detail.customer_location || {};
      var services = serviceNames(detail.services);
      var vehicle = vehicleFields(detail.car);
      var photos = detail.photos || {};
      if (photos.min_required) state.minPhotos = photos.min_required;
      var uploaded = photos.uploaded || 0;
      /* Reloaded mid-job: photos already on the server fill the first tiles (there is no local preview for them). */
      if (!state.photos.length && uploaded) {
        for (var shotIndex = 0; shotIndex < uploaded; shotIndex += 1) state.photos.push({ photo_id: null, url: '' });
      }
      var photoLine = state.minPhotos ? (uploaded + ' of ' + state.minPhotos + ' photos') : null;

      text('customer-name', customer.name, 'Customer');
      text('customer-phone', customer.phone_masked, 'Not shared');
      text('customer-address', location.address, 'Address not shared');
      text('car-name', vehicle.name);
      text('car-reg', plateWrap(vehicle.reg));
      text('order-id', detail.order_id);
      text('photo-count', photoLine);

      text('trip-customer-name', customer.name, 'Customer');
      text('trip-customer-phone', customer.phone_masked, 'Not shared');
      text('trip-customer-address', location.address, 'Address not shared');
      text('trip-car-name', vehicle.name);
      text('trip-car-reg', plateWrap(vehicle.reg));
      text('trip-order-id', detail.order_id);
      text('trip-photo-count', photoLine);

      ['services', 'trip-services'].forEach(function (id) {
        var list = byId(id);
        list.innerHTML = '';
        services.forEach(function (name) {
          var li = document.createElement('li');
          li.textContent = name;
          list.appendChild(li);
        });
      });
      byId('services-empty').classList.toggle('hidden', services.length > 0);
      renderShots();
    }

    function haversineM(a, b) {
      var rad = Math.PI / 180;
      var dLat = (b.latitude - a.latitude) * rad;
      var dLon = (b.longitude - a.longitude) * rad;
      var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h)));
    }

    function fixAccuracy() {
      if (demo) return demoAcc;
      return state.fix ? state.fix.accuracy : 0;
    }

    /* Distance to the customer from the latest fix, or null when it cannot be known (no fix, no coordinates). */
    function distanceToCustomer() {
      if (demo) return demoAway;
      var at = (state.detail && state.detail.customer_location) || {};
      if (!state.fix || typeof at.latitude !== 'number' || typeof at.longitude !== 'number' ||
          !isFinite(at.latitude) || !isFinite(at.longitude) ||
          !isFinite(state.fix.latitude) || !isFinite(state.fix.longitude)) return null;
      return haversineM(state.fix, at);
    }

    /* Show the arrival action only while unlocked; locked shows one distance line instead. Unknown distance never locks. */
    function renderGate() {
      var arriving = !!ARRIVAL_STAGES[state.stage];
      var lockedNow = arriving && state.locked && state.away !== null;
      byId('arrive-block').classList.toggle('hidden', !arriving);
      byId('peek-reached').classList.toggle('hidden', !arriving || lockedNow);
      byId('reached').classList.toggle('hidden', lockedNow);
      var line = '';
      if (lockedNow) {
        line = Math.max(ARRIVE_RADIUS_M + 10, Math.round(state.away / 10) * 10) +
          ' m to the customer \u00b7 arrival unlocks within ' + ARRIVE_RADIUS_M + ' m';
      }
      ['peek-lock', 'arrive-lock'].forEach(function (id) {
        byId(id).textContent = line;
        byId(id).classList.toggle('hidden', !lockedNow);
      });
    }

    /* Re-evaluate from the current fix (every watch tick, fresh fix and stage change). */
    function updateGate() {
      var away = state.serverAway !== null ? state.serverAway : distanceToCustomer();
      state.away = away;
      if (away === null) state.locked = null;                                   /* fail open */
      else state.locked = arrivalLocked(state.locked, away, state.serverAway !== null ? 0 : fixAccuracy());
      renderGate();
    }

    /* The server said we are too far: lock now, whatever the last fix said, until a fix reads within the radius. */
    function lockFromServer(distance) {
      if (typeof distance !== 'number' || !isFinite(distance) || distance <= ARRIVE_RADIUS_M) return;
      state.serverAway = distance;      /* held until the next fix, so a stage poll cannot undo it */
      state.away = distance;
      state.locked = true;
      renderGate();
    }

    function setFix(fix) {
      state.fix = fix;
      state.serverAway = null;
      setPermission('granted');
      updateGate();
    }

    function applyStage(stage) {
      state.stage = stage;
      var pill = byId('stage-pill');
      pill.textContent = STAGE_LABELS[stage] || stage;
      show('stage-pill');
      renderEta();

      /* One block at a time: arrival tap while driving, OTP once reached, photos while working, a closing line at end. */
      updateGate();
      if (OTP_STAGES[stage]) setSheet(true);            /* the OTP is the next action: show it, do not make them hunt */
      byId('otp-block').classList.toggle('hidden', !OTP_STAGES[stage]);
      byId('photos-block').classList.toggle('hidden', !PHOTO_STAGES[stage]);
      byId('done-block').classList.toggle('hidden', stage !== 'completed' && stage !== 'cancelled');
      if (stage === 'completed' || stage === 'cancelled') {
        byId('done-line').textContent = stage === 'completed'
          ? ('Job completed \u00b7 ' + state.photos.length + ' photo' + (state.photos.length === 1 ? '' : 's') + ' uploaded')
          : 'Job cancelled by support';
        text('done-copy', stage === 'completed'
          ? 'The invoice has been generated. Nothing else is needed from you.'
          : 'Nothing else is needed from you. Support will follow up.');
        setSheet(true);
        stopPolling();
        closeGate();
      }
      if (stage === 'working') {
        stopPolling();
        setSheet(true);
      }
      renderShots();
    }

    function renderEta() {
      var label = STAGE_LABELS[state.stage] || '';
      if (state.stage === 'reached') label = 'At the customer';
      else if (DRIVING_STAGES[state.stage]) label = state.eta ? 'Arriving in ' + state.eta + ' min' : label;
      byId('eta-text').textContent = label;
      var customer = (state.detail && state.detail.customer) || {};
      text('peek-name', customer.name, 'Customer');
      byId('peek-what').textContent = state.eta
        ? (state.eta + ' min away \u00b7 ' + (STAGE_LABELS[state.stage] || ''))
        : (STAGE_LABELS[state.stage] || '');
    }

    /* ---------------- map ---------------- */

    var map = null, routeLayer = null, techMarker = null, pinMarker = null;

    function buildMap() {
      if (!L) return;   /* Leaflet could not be loaded: the trip sheet still works without the map */
      var location = (state.detail && state.detail.customer_location) || {};
      var pin = [location.latitude, location.longitude];
      if (!map) {
        map = L.map('map', { zoomControl: false }).setView(pin, 14);
        /* OpenStreetMap tiles need no key; the CARTO basemap now answers "API KEY REQUIRED" placeholders. */
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        setTimeout(function () { if (map) map.invalidateSize(); }, 60);
      }
      var pinIcon = L.divIcon({
        className: '',
        html: '<div style="width:18px;height:18px;border-radius:50%;background:#101820;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.4)"></div>',
        iconSize: [18, 18], iconAnchor: [9, 9]
      });
      if (pinMarker) { pinMarker.setLatLng(pin); } else { pinMarker = L.marker(pin, { icon: pinIcon }).addTo(map); }
      drawRouteLine();
      frameMap();
    }

    function drawRouteLine() {
      if (!map) return;
      if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
      if ((!state.route || state.route.length < 2) && state.fix && pinMarker) {
        // No route yet (reloaded mid-trip, or the route was refused): a dashed line beats an empty map.
        routeLayer = L.polyline([pinMarker.getLatLng(), L.latLng(state.fix.latitude, state.fix.longitude)],
          { color: '#9aa4ae', weight: 3, dashArray: '6 8' }).addTo(map);
        return;
      }
      if (!state.route || state.route.length < 2) return;
      routeLayer = L.layerGroup([
        L.polyline(state.route, { color: '#ffffff', weight: 9, opacity: .9 }),
        L.polyline(state.route, { color: '#f9c22e', weight: 5 })
      ]).addTo(map);
    }

    function frameMap() {
      if (!map) return;
      var points = [];
      if (pinMarker) points.push(pinMarker.getLatLng());
      if (techMarker) points.push(techMarker.getLatLng());
      state.route.forEach(function (point) { points.push(L.latLng(point[0], point[1])); });
      if (!points.length) return;
      map.fitBounds(L.latLngBounds(points), { paddingTopLeft: [40, 130], paddingBottomRight: [40, 40] });
    }

    function moveTech() {
      if (!map || !state.fix) return;
      var at = [state.fix.latitude, state.fix.longitude];
      if (techMarker) { techMarker.setLatLng(at); return; }
      var icon = L.divIcon({
        className: '',
        html: '<div style="width:20px;height:20px;border-radius:50%;background:#1a73e8;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.45)"></div>',
        iconSize: [20, 20], iconAnchor: [10, 10]
      });
      techMarker = L.marker(at, { icon: icon }).addTo(map);
    }

    /* ---------------- bottom sheet: grab handle, two resting heights ---------------- */

    var PEEK_OFFSET = 0.62;
    var sheet = byId('sheet');
    var dragStartY = null, dragStartOffset = null, sheetOpen = false;

    function sheetHeight() { return sheet.offsetHeight || window.innerHeight * 0.9; }

    function setSheet(open) {
      sheetOpen = open;
      sheet.classList.toggle('open', open);
      sheet.style.setProperty('--peek', open ? '0px' : Math.round(sheetHeight() * PEEK_OFFSET) + 'px');
    }

    function currentOffset() {
      var transform = getComputedStyle(sheet).transform;
      if (!transform || transform === 'none') return 0;
      var match = transform.match(/matrix\(([^)]+)\)/);
      return match ? parseFloat(match[1].split(',')[5]) : 0;
    }

    function bindSheet() {
      var handle = byId('sheet-grab');
      var peek = byId('sheet-peek');

      function start(event) {
        var point = event.touches ? event.touches[0] : event;
        dragStartY = point.clientY;
        dragStartOffset = currentOffset();
        sheet.classList.add('dragging');
      }
      function move(event) {
        if (dragStartY === null) return;
        var point = event.touches ? event.touches[0] : event;
        var next = dragStartOffset + (point.clientY - dragStartY);
        var max = sheetHeight() * PEEK_OFFSET;
        sheet.style.setProperty('--peek', Math.min(Math.max(next, 0), max) + 'px');
        if (event.cancelable) event.preventDefault();
      }
      function end() {
        if (dragStartY === null) return;
        var offset = currentOffset();
        sheet.classList.remove('dragging');
        dragStartY = null;
        setSheet(offset < sheetHeight() * PEEK_OFFSET / 2);
      }

      [handle, peek].forEach(function (element) {
        element.addEventListener('touchstart', start, { passive: true });
        element.addEventListener('touchmove', move, { passive: false });
        element.addEventListener('touchend', end);
        element.addEventListener('mousedown', start);
      });
      addWindowListener('mousemove', move);
      addWindowListener('mouseup', end);
      handle.addEventListener('click', function () { setSheet(!sheetOpen); });
    }

    /* ---------------- journey ---------------- */

    function showTrip() {
      byId('view-assigning').style.display = 'none';
      byId('view-trip').style.display = 'block';
      buildMap();
      moveTech();
      frameMap();
      setSheet(false);
    }

    function startTrip() {
      if (state.posting) return;
      if (!demo && state.permApi && state.permission !== 'granted') { renderLocationGate(); return; }
      if (demo) {
        state.fix = DEMO_FIX;
        state.route = DEMO_ROUTE;
        state.eta = 6;
        applyStage('on_the_way');
        showTrip();
        return;
      }
      state.posting = true;
      syncStartButton();
      setNotice('start-notice', 'Getting your location\u2026');

      positionFix().then(function (fix) {
        state.fix = fix;
        return drawRoute(fix, (state.detail || {}).customer_location).then(function (route) {
          var payload = {
            latitude: fix.latitude,
            longitude: fix.longitude,
            recorded_at: isoNow()
          };
          if (route) {
            payload.route_polyline = route.route_polyline;
            payload.route_distance_meters = route.route_distance_meters;
            payload.route_duration_minutes = route.route_duration_minutes;
            payload.route_computed_at = route.route_computed_at;
            state.route = decodePolyline(route.route_polyline);
            state.routeAt = Date.now();
          }
          return postJson(API + 'start_journey', payload);
        });
      }).then(function (result) {
        state.posting = false;
        arrivalBusy(false);
        var end = endOfLink(result.body, result.status);
        if (end) { failLink(end); return; }
        var body = result.body || {};
        if (!result.ok || !body.status) {
          setNotice('start-notice', body.errorMessage || 'Could not start the trip. Try again.', true);
          return;
        }
        var data = body.data || {};
        state.eta = typeof data.eta_minutes === 'number' ? data.eta_minutes : null;
        if (data.next_interval_sec) state.interval = data.next_interval_sec;
        else if (state.detail && state.detail.location_interval_sec) state.interval = state.detail.location_interval_sec;
        applyStage(data.stage || 'on_the_way');
        setNotice('start-notice', null);
        showTrip();
        /* route_source is 'technician' or 'backend'; a rejected route never blocks the trip and the map keeps ours. */
        setNotice('trip-notice', data.route_accepted === false
          ? 'Your route could not be used, so the backend drew its own.' : null);
        watchPosition();
        state.lastPostAt = Date.now();
        schedulePoll();
      }).catch(function (error) {
        state.posting = false;
        syncStartButton();
        renderLocationGate();
        setNotice('start-notice', error && error.code === 1
          ? 'Location permission is needed to start the trip. Use the location banner at the top of this page to allow it.'
          : 'Could not start the trip. Check your connection and try again.', true);
      });
    }

    function watchPosition() {
      if (demo) return;
      if (!navigator.geolocation || state.watchId !== null) return;
      state.watchId = navigator.geolocation.watchPosition(function (position) {
        setFix({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        moveTech();
      }, function () { /* the next poll keeps the last fix */ },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
    }

    function schedulePoll() {
      if (demo) return;
      var seconds = state.interval || 15;
      state.pollTimer = setTimeout(function () { sendLocation().then(schedulePoll); }, seconds * 1000);
    }

    /* T3: positions only (max 20 points). The route is drawn once at Start (T2) and is never sent here. */
    function sendLocation() {
      if (!DRIVING_STAGES[state.stage]) return Promise.resolve();
      if (!state.fix) return Promise.resolve();

      state.buffer.push({
        latitude: state.fix.latitude,
        longitude: state.fix.longitude,
        accuracy_m: Math.round(state.fix.accuracy || 0),
        recorded_at: isoNow()
      });
      if (state.buffer.length > 20) state.buffer = state.buffer.slice(-20);

      var payload = { points: state.buffer.slice(-20) };

      return postJson(API + 'location', payload).then(function (result) {
        var end = endOfLink(result.body, result.status);
        if (end) { failLink(end); return; }
        var body = result.body || {};
        if (!result.ok || !body.status) return;
        var data = body.data || {};
        if (data.accepted === false) { stopPolling(); applyStage(data.stage || state.stage); return; }
        state.buffer = [];
        state.lastPostAt = Date.now();
        if (typeof data.eta_minutes === 'number') state.eta = data.eta_minutes;
        if (data.next_interval_sec) state.interval = data.next_interval_sec;
        if (data.stage) applyStage(data.stage);
      }).catch(function () { /* buffered points go out on the next tick */ });
    }

    function stopWatch() {
      if (state.watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(state.watchId);
        state.watchId = null;
      }
    }

    function stopPolling() {
      if (state.pollTimer) { clearTimeout(state.pollTimer); state.pollTimer = null; }
      stopWatch();
    }

    /* ---------------- T5: arrival OTP ---------------- */

    function submitOtp() {
      if (state.otpBusy) return;
      var input = byId('otp-input');
      var otp = (input.value || '').replace(/\D/g, '');
      if (otp.length !== 4) {
        setNotice('otp-notice', 'Enter the 4-digit OTP the customer sees in their app.', true);
        return;
      }
      state.otpBusy = true;
      var button = byId('otp-submit');
      button.disabled = true;
      setNotice('otp-notice', 'Checking the OTP\u2026');

      positionFix().then(function (fix) {
        state.fix = fix;
        return postJson(API + 'verify_otp', {
          otp: otp,
          latitude: fix.latitude,
          longitude: fix.longitude,
          recorded_at: isoNow()
        });
      }).then(function (result) {
        state.otpBusy = false;
        button.disabled = false;
        var end = endOfLink(result.body, result.status);
        if (end) { failLink(end); return; }
        var body = result.body || {};
        if (result.ok && body.status) {
          input.value = '';
          setNotice('otp-notice', null);
          state.buffer = [];
          applyStage((body.data || {}).stage || 'working');
          return;
        }
        var data = body.data || {};
        if (body.error === 'otp_incorrect') {
          input.value = '';
          input.focus();
          setNotice('otp-notice', data.attempts_left !== undefined
            ? 'Wrong OTP. ' + data.attempts_left + ' attempt' + (data.attempts_left === 1 ? '' : 's') + ' left.'
            : (body.errorMessage || 'Wrong OTP. Check with the customer and try again.'), true);
          return;
        }
        if (body.error === 'otp_attempts_exceeded' || result.status === 429) {
          setNotice('otp-notice', 'Too many wrong attempts. Support has been alerted \u2014 call them to restart the visit.', true);
          return;
        }
        if (body.error === 'too_far_from_customer') {
          var away = data.distance_m;
          lockFromServer(away);
          setNotice('otp-notice', 'You look ' + (away ? Math.round(away) + ' m' : 'too far') +
            ' from the customer. Move closer to the car and enter the OTP again.', true);
          return;
        }
        var moved = syncStage(body);
        if (moved) { setNotice('otp-notice', moved, true); return; }
        setNotice('otp-notice', body.errorMessage || 'Could not verify the OTP. Try again.', true);
      }).catch(function (error) {
        state.otpBusy = false;
        button.disabled = false;
        setNotice('otp-notice', error && error.code === 1
          ? 'Location permission is needed to confirm you are at the car. Allow it for this page and try again.'
          : 'Could not verify the OTP. Check your connection and try again.', true);
      });
    }

    /* ---------------- T4: I have reached ---------------- */

    function arrivalBusy(busy) {
      byId('reached').disabled = busy;
      byId('peek-reached').disabled = busy;
    }

    function markReached() {
      if (state.posting) return;
      state.posting = true;
      arrivalBusy(true);
      setNotice('arrive-notice', 'Checking you are at the customer\u2026');

      /* One clean fix at the pin: a high-accuracy watch competing for the GPS is what makes this tap slow. */
      stopWatch();
      positionFix().then(function (fix) {
        state.fix = fix;
        return postJson(API + 'reached', {
          latitude: fix.latitude,
          longitude: fix.longitude,
          recorded_at: isoNow()
        });
      }).then(function (result) {
        state.posting = false;
        arrivalBusy(false);
        var end = endOfLink(result.body, result.status);
        if (end) { failLink(end); return; }
        var body = result.body || {};
        if (result.ok && body.status) {
          setNotice('arrive-notice', null);
          applyStage((body.data || {}).stage || 'reached');
          return;
        }
        watchPosition();                                   /* still driving: keep the map live */
        if (body.error === 'too_far_from_customer') {
          var away = ((body.data || {}).distance_m);
          lockFromServer(away);
          setNotice('arrive-notice', 'You look ' + (away ? Math.round(away) + ' m' : 'too far') +
            ' from the customer. Move closer and tap again.', true);
          return;
        }
        var moved = syncStage(body);
        if (moved) { setNotice('arrive-notice', moved, true); return; }
        setNotice('arrive-notice', body.errorMessage || 'Could not record your arrival. Try again.', true);
      }).catch(function (error) {
        state.posting = false;
        arrivalBusy(false);
        watchPosition();
        setNotice('arrive-notice', error && error.code === 1
          ? 'Location permission is needed to confirm you are at the car. Allow it for this page and try again.'
          : 'Could not record your arrival. Check your connection and try again.', true);
      });
    }

    /* ---------------- T6: live car photos, the closing action ---------------- */

    function renderShots() {
      var wrap = byId('shots');
      var uploaded = state.photos.length;
      var total = state.minPhotos || 4;
      wrap.innerHTML = '';
      for (var i = 0; i < total; i += 1) {
        var tile = document.createElement('div');
        var shot = state.photos[i];
        tile.className = 'shot' + (shot ? ' done' : '');
        if (shot && shot.url) {
          var img = document.createElement('img');
          img.src = shot.url;
          img.alt = 'Photo ' + (i + 1);
          tile.appendChild(img);
          tile.title = 'Tap to retake';
          (function (index) {
            tile.addEventListener('click', function () { retakePhoto(index); });
          }(i));
        } else if (shot) {
          tile.textContent = '\u2713';
        } else {
          tile.textContent = String(i + 1);
        }
        wrap.appendChild(tile);
      }
      var button = byId('take-photo');
      button.textContent = uploaded >= total ? 'All photos taken' : 'Take photo ' + (uploaded + 1) + ' of ' + total;
      button.disabled = uploaded >= total;
      var line = (uploaded + ' of ' + total + ' photos');
      text('photo-count', line);
      text('trip-photo-count', line);
      var complete = byId('complete');
      complete.classList.toggle('hidden', !(uploaded >= total && state.stage === 'working'));
      if (uploaded >= total) text('photos-copy', 'All photos uploaded. Tap Complete job to close it.');
    }

    function takePhoto() {
      if (state.photoBusy || state.photos.length >= state.minPhotos) return;
      byId('camera').click();
    }

    function uploadPhoto(file) {
      if (!file || state.photoBusy) return;
      state.photoBusy = true;
      byId('take-photo').disabled = true;
      setNotice('photos-notice', 'Uploading photo ' + (state.photos.length + 1) + '\u2026');

      positionFix().then(function (fix) {
        state.fix = fix;
        var form = new FormData();
        form.append('photo', file, file.name || 'photo.jpg');
        form.append('captured_at', isoNow());
        form.append('latitude', fix.latitude);
        form.append('longitude', fix.longitude);
        return postForm(UPLOAD_API + 'photos', form);
      }).then(function (result) {
        state.photoBusy = false;
        byId('take-photo').disabled = false;
        var end = endOfLink(result.body, result.status);
        if (end) { failLink(end); return; }
        var body = result.body || {};
        if (!result.ok || !body.status) {
          var movedStage = syncStage(body);
          if (movedStage) { setNotice('photos-notice', movedStage, true); return; }
          setNotice('photos-notice', body.errorMessage || 'Could not upload the photo. Try again.', true);
          return;
        }
        var data = body.data || {};
        var url = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(file) : '';
        if (url) objectUrls.push(url);
        state.photos.push({ photo_id: data.photo_id, url: url });
        if (data.min_required) state.minPhotos = data.min_required;
        setNotice('photos-notice', null);
        renderShots();
        if (data.completed || data.stage === 'completed') applyStage('completed');
      }).catch(function () {
        state.photoBusy = false;
        byId('take-photo').disabled = false;
        setNotice('photos-notice', 'Could not upload the photo. Check your connection and try again.', true);
      });
    }

    /* T7: the job closes once the required photos are in. A backend that closes the job on the last photo answers
       the upload with `completed`, and then this button never appears. */
    function completeJob() {
      if (state.posting || state.photoBusy) return;
      state.posting = true;
      var button = byId('complete');
      button.disabled = true;
      setNotice('photos-notice', 'Completing the job\u2026');
      postJson(API + 'complete', {}).then(function (result) {
        state.posting = false;
        arrivalBusy(false);
        var end = endOfLink(result.body, result.status);
        if (end) { failLink(end); return; }
        var body = result.body || {};
        if (result.ok && body.status) {
          setNotice('photos-notice', null);
          applyStage((body.data || {}).stage || 'completed');
          return;
        }
        if (body.error === 'photos_missing') {
          var data = body.data || {};
          if (data.min_required) state.minPhotos = data.min_required;
          renderShots();
          setNotice('photos-notice', 'Upload all ' + (data.min_required || state.minPhotos) +
            ' photos before completing the job.', true);
          return;
        }
        var moved = syncStage(body);
        if (moved) { setNotice('photos-notice', moved, true); return; }
        setNotice('photos-notice', body.errorMessage || 'Could not complete the job. Try again.', true);
      }).catch(function () {
        state.posting = false;
        button.disabled = false;
        setNotice('photos-notice', 'Could not complete the job. Check your connection and try again.', true);
      });
    }

    /* Retake: allowed only while the job is still working (never after it has completed). */
    function retakePhoto(index) {
      var shot = state.photos[index];
      if (!shot || !shot.photo_id || state.photoBusy || state.stage !== 'working') return;
      if (destroyed) return;
      state.photoBusy = true;
      fetch(API + 'photos/' + encodeURIComponent(shot.photo_id), {
        method: 'DELETE',
        headers: authHeaders({ 'Accept': 'application/json' }),
        credentials: 'same-origin'
      }).then(readJson).then(function (result) {
        state.photoBusy = false;
        var body = result.body || {};
        if (!result.ok || !body.status) {
          setNotice('photos-notice', body.errorMessage || 'Could not remove that photo.', true);
          return;
        }
        state.photos.splice(index, 1);
        setNotice('photos-notice', null);
        renderShots();
      }).catch(function () {
        state.photoBusy = false;
        setNotice('photos-notice', 'Could not remove that photo. Try again.', true);
      });
    }

    function startPage() {
      if (!demo && !jobToken && !jobId) {
        showError('Use the link WhatsApp sent you, or ask the ops team for a fresh link.');
        return;
      }
  
      byId('start-trip').addEventListener('click', startTrip);
      byId('allow-location').addEventListener('click', askLocation);
      byId('reload-page').addEventListener('click', function () { window.location.reload(); });
      byId('otp-submit').addEventListener('click', submitOtp);
      byId('otp-input').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') submitOtp();
      });
      byId('reached').addEventListener('click', markReached);
      byId('peek-reached').addEventListener('click', markReached);
      byId('complete').addEventListener('click', completeJob);
      byId('take-photo').addEventListener('click', takePhoto);
      byId('camera').addEventListener('change', function (event) {
        var file = event.target.files && event.target.files[0];
        event.target.value = '';
        uploadPhoto(file);
      });
      bindSheet();
  
      if (demo) {
        state.detail = JSON.parse(JSON.stringify(DEMO_DETAIL));
        if (demoMock === 'bad-car') {
          var badCar = JSON.parse(JSON.stringify(DEMO_BAD_CAR));
          state.detail.car = badCar.car;
          state.detail.services = badCar.services;
          state.detail.customer = badCar.customer;
        }
        renderDetails(state.detail);
        applyStage('assigning');
        hide('loading');
        show('assigning-body');
        if (demoStage === 'trip') {
          state.fix = DEMO_FIX;
          state.route = DEMO_ROUTE;
          state.eta = 6;
          applyStage('on_the_way');
          showTrip();
        }
        return;
      }

      /* Ask for location now, alongside the job fetch (also on a mid-trip reload), so the technician has already
         answered by the time they reach Start Trip. Neither call can block rendering or fail the fetch below. */
      watchPermission();
      renderLocationGate();
      askLocation();

      var jobUrl = API + 'job' +(jobId && !jobToken ? '?job_id=' + encodeURIComponent(jobId) : '');
      getJson(jobUrl).then(function (result) {
        var end = endOfLink(result.body, result.status);
        if (end) { failLink(end); return; }
        var body = result.body || {};
        if (!result.ok || !body.status || !body.data) {
          showError(body.errorMessage || 'Ask the ops team for a fresh link.');
          return;
        }
        state.detail = body.data;
        state.interval = state.detail.location_interval_sec || 15;
        renderDetails(state.detail);
        applyStage(state.detail.stage || 'assigning');
        hide('loading');
        if ((state.detail.stage || 'assigning') === 'assigning') {
          show('assigning-body');
          return;
        }
        // Reloaded mid-trip (or the job moved on): go straight back to the map and let the location poll rebuild the
        // ETA instead of offering Start Trip again.
        showTrip();
        if (DRIVING_STAGES[state.stage]) { watchPosition(); schedulePoll(); }
        if (state.stage === 'working' || state.stage === 'completed') setSheet(true);
      }).catch(function () {
        showError('Could not load the job. Check your connection and reload.');
      });
    }

    /* ---------------- Leaflet (first boot only) ---------------- */

    function withLeaflet(done) {
      if (window.L) { L = window.L; done(); return; }
      var remaining = 2;
      function settled() {
        remaining -= 1;
        if (remaining > 0 || destroyed) return;
        L = window.L || null;
        done();
      }
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      link.onload = settled;
      link.onerror = settled;
      var script = document.createElement('script');
      script.src = LEAFLET_JS;
      script.onload = settled;
      script.onerror = settled;
      injected.push(link, script);
      document.head.appendChild(link);
      document.head.appendChild(script);
    }

    withLeaflet(startPage);

    return function teardown() {
      if (destroyed) return;
      destroyed = true;
      if (state.pollTimer) { clearTimeout(state.pollTimer); state.pollTimer = null; }
      stopWatch();
      if (permissionStatus) { permissionStatus.onchange = null; permissionStatus = null; }
      windowListeners.forEach(function (entry) { window.removeEventListener(entry[0], entry[1]); });
      windowListeners = [];
      if (headerObserver) { headerObserver.disconnect(); headerObserver = null; }
      if (map) {
        try { map.remove(); } catch (error) { /* already gone */ }
        map = null; routeLayer = null; techMarker = null; pinMarker = null;
      }
      objectUrls.forEach(function (url) { try { window.URL.revokeObjectURL(url); } catch (error) { /* ignore */ } });
      objectUrls = [];
      injected.forEach(function (node) { if (node.parentNode) node.parentNode.removeChild(node); });
      injected = [];
      /* Fresh markup also drops every element listener bound by startPage(). */
      root.innerHTML = initialMarkup;
      document.body.style.overflow = previousOverflow;
      started = false;
    };
}

/* Stylesheet text for the RSA technician page, rendered through a <style> element
   (see RsaTechnicianJob.js): the repo CSS loader would drop or hash a plain import. */
const css = `/* Ported from the standalone rsa_technician_job.html page. Everything is scoped under #rsa-job:
   html, body and header are never styled globally, the root supplies what body used to. */

#rsa-job {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; height: 100%; z-index: 100000;
  margin: 0; background: #f4f5f7; color: #12161c; overflow: hidden;
  font: 15px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
#rsa-job, #rsa-job * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
#rsa-job button { font: inherit; border: 0; cursor: pointer; }

#rsa-job header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 20;
  background: #101820; color: #fff;
  /* a standard Android toolbar: 56px of content below the status-bar inset, on one row: the job status on the left,
     the location-sending and Test drive switches on the right */
  height: calc(56px + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) 10px 0 12px;
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; grid-template-areas: "stage . send sim";
  align-content: center; align-items: center; column-gap: 8px;
}
/* the brand line and page title are not shown: only the status sits in the toolbar */
#rsa-job header .brand, #rsa-job header h1 { display: none; }
#rsa-job header .stage {
  grid-area: stage; justify-self: start; display: inline-block; margin: 0; padding: 4px 10px; border-radius: 999px;
  background: #f9c22e; color: #101820; font-size: 12px; font-weight: 700; white-space: nowrap;
}
#rsa-job .tb-switch {
  justify-self: end; display: flex; align-items: center; gap: 6px; min-width: 0; padding: 6px 10px; border-radius: 999px;
  background: rgba(255, 255, 255, .14); color: #fff; font: 600 11px/1.2 system-ui, -apple-system, sans-serif;
  white-space: nowrap; cursor: pointer;
}
#rsa-job .tb-switch input { margin: 0; flex: none; }
#rsa-job .tb-switch span { overflow: hidden; text-overflow: ellipsis; font-variant-numeric: tabular-nums; }
#rsa-job .tb-switch.off { background: rgba(217, 48, 37, .85); }

/* ---------- start / details view ---------- */
#rsa-job #view-assigning { position: absolute; top: 0; left: 0; right: 0; bottom: 0; padding: calc(var(--rsa-header-h, 56px) + 16px) 14px 24px; overflow-y: auto; -webkit-overflow-scrolling: touch; }
#rsa-job .start {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; height: 68px; border-radius: 16px; background: #f9c22e; color: #101820;
  font-size: 18px; font-weight: 700; box-shadow: 0 2px 10px rgba(249, 194, 46, .35);
}
#rsa-job .start[disabled] { opacity: .6; box-shadow: none; }
#rsa-job .start-hint { margin: 8px 2px 16px; font-size: 12px; color: #6b7885; text-align: center; }
#rsa-job .card {
  background: #fff; border-radius: 16px; padding: 16px; margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(16, 24, 32, .08);
}
#rsa-job .card h2 { margin: 0 0 10px; font-size: 11px; letter-spacing: .09em; text-transform: uppercase; color: #6b7885; }
#rsa-job .row { display: flex; justify-content: space-between; gap: 14px; padding: 5px 0; }
#rsa-job .row + .row { border-top: 1px solid #f0f2f4; }
#rsa-job .row .label { color: #6b7885; flex: 0 0 auto; }
#rsa-job .row .value { text-align: right; font-weight: 600; word-break: break-word; }
#rsa-job .name { font-size: 18px; font-weight: 700; margin: 0 0 2px; }
#rsa-job .plate {
  display: inline-block; padding: 3px 9px; border: 1.5px solid #12161c; border-radius: 6px;
  font-weight: 700; letter-spacing: .06em; font-size: 13px;
  white-space: pre-line; max-width: 100%; text-align: center; overflow-wrap: anywhere;
}
#rsa-job .services { margin: 0; padding-left: 18px; }
#rsa-job .services li { padding: 2px 0; }
#rsa-job .address { margin: 8px 0 0; color: #3a444f; }
#rsa-job .link-btn { margin-top: 8px; padding: 6px 12px; border-radius: 999px; background: #f0f2f4; color: #101820; font-size: 13px; font-weight: 700; }
#rsa-job .muted { color: #6b7885; }
#rsa-job .tiny { font-size: 12px; }
#rsa-job .state { padding: 26px 18px; text-align: center; color: #6b7885; }
#rsa-job .state strong { display: block; color: #12161c; font-size: 16px; margin-bottom: 6px; }

/* ---------- trip view ---------- */
#rsa-job #view-trip { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: none; }
/* the map must own a stacking context so its panes never paint above the header (20) and the sheet (18).
   Its bottom edge follows the sheet's top edge (boot.js syncMapInset), so Google's logo, terms and the
   zoom / Re-centre buttons are never hidden under the sheet. */
#rsa-job #map { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #e8eaed; z-index: 0; isolation: isolate; }
#rsa-job .map-btn {
  margin: 0 10px 10px 0; padding: 0 14px; height: 40px; border-radius: 999px; background: #fff; color: #101820;
  font-size: 13px; font-weight: 700; box-shadow: 0 1px 6px rgba(16, 24, 32, .3);
}
#rsa-job #gps-pill {
  position: absolute; top: calc(var(--rsa-header-h, 56px) + env(safe-area-inset-top) + 50px); left: 50%; transform: translateX(-50%);
  z-index: 15; max-width: calc(100% - 32px); background: #8f1d1d; color: #fff; border-radius: 999px; padding: 7px 14px;
  font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  box-shadow: 0 2px 10px rgba(16, 24, 32, .25);
}
#rsa-job #eta-pill {
  position: absolute; top: calc(var(--rsa-header-h, 56px) + env(safe-area-inset-top)); left: 50%; transform: translateX(-50%);
  z-index: 15; display: flex; align-items: center; gap: 8px;
  background: #fff; border-radius: 999px; padding: 9px 16px;
  box-shadow: 0 2px 12px rgba(16, 24, 32, .18); font-weight: 600; white-space: nowrap;
}
#rsa-job #eta-pill .dot { width: 8px; height: 8px; border-radius: 50%; background: #f9c22e; }
#rsa-job #sheet {
  position: absolute; left: 0; right: 0; bottom: 0; z-index: 18;
  height: calc(100% - var(--rsa-header-h, 56px)); background: #fff; border-radius: 20px 20px 0 0;   /* open, it stops under the toolbar so its handle stays reachable */
  box-shadow: 0 -2px 18px rgba(16, 24, 32, .18);
  display: flex; flex-direction: column;
  transform: translateY(var(--peek, 62vh)); transition: transform .25s ease-out;
  will-change: transform;
}
#rsa-job #sheet.dragging { transition: none; }
#rsa-job .grab { flex: 0 0 auto; padding: 8px 0 8px; display: flex; flex-direction: column; align-items: center; gap: 5px; touch-action: none; cursor: grab; }
#rsa-job .grab .bar { width: 36px; height: 4px; border-radius: 999px; background: #d3d8dd; }
#rsa-job .grab .grab-title { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #4a5560; letter-spacing: .02em; max-width: 100%; padding: 0 16px; }
#rsa-job .grab .grip { flex: none; fill: #9aa4ae; }
/* closed: the handle carries the important detail (ETA + distance), the label becomes secondary */
#rsa-job .grab .grab-detail { display: none; color: #101820; font-size: 13px; font-weight: 700; white-space: nowrap; }
#rsa-job #sheet.closed .grab .grab-detail:not(:empty) { display: inline; }
#rsa-job #sheet.closed .grab .grab-detail:not(:empty)::after { content: "·"; margin-left: 8px; color: #9aa4ae; font-weight: 400; }
#rsa-job #sheet.closed .grab #grab-text { color: #6b7885; font-size: 11px; font-weight: 600; white-space: nowrap; }
#rsa-job .grab .chev { flex: none; font-size: 11px; color: #6b7885; }

#rsa-job .peek { padding: 0 20px 12px; border-bottom: 1px solid #f0f2f4; touch-action: none; }
#rsa-job .peek .who { font-size: 17px; font-weight: 700; }
#rsa-job .peek .what { color: #6b7885; font-size: 13px; margin-top: 2px; }
#rsa-job .peek-action {
  margin-top: 10px; width: 100%; height: 44px; border-radius: 12px;
  background: #f9c22e; color: #101820; font-size: 15px; font-weight: 700;
}
#rsa-job .peek-action[disabled] { opacity: .6; }
#rsa-job #sheet.open .peek-action { display: none; }
#rsa-job .lock-line { margin: 10px 0 0; color: #6b7885; font-size: 13px; font-weight: 600; }
#rsa-job #sheet.open #peek-lock { display: none; }
#rsa-job #sheet:not(.open) #arrive-block #arrive-lock { display: none; }
#rsa-job #sheet:not(.open) #arrive-block #reached { display: none; }
#rsa-job .sheet-body { flex: 1 1 auto; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; padding: 4px 20px 28px; }
#rsa-job .sheet-body .card { box-shadow: none; padding: 14px 0; margin: 0; border-bottom: 1px solid #f0f2f4; border-radius: 0; }
#rsa-job .sheet-body .card:last-of-type { border-bottom: 0; }
#rsa-job .action { width: 100%; height: 56px; border-radius: 14px; background: #101820; color: #fff; font-size: 16px; font-weight: 700; margin-top: 14px; }
#rsa-job .action.primary { background: #f9c22e; color: #101820; }
#rsa-job .action[disabled] { opacity: .5; }
#rsa-job .notice { margin: 10px 0 0; padding: 10px 12px; border-radius: 12px; background: #fff6dc; color: #7a5b00; font-size: 13px; }
#rsa-job .notice.error { background: #fdeaea; color: #8f1d1d; }
/* location gate: blocking modal. Fixed overlay above the header (z 20) and trip sheet (z 18) with a dimmed backdrop and a centred card */
#rsa-job .gate { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; margin: 0; padding: 0 16px; background: rgba(0,0,0,0.55); }
#rsa-job .gate-card { width: 100%; max-width: 360px; padding: 20px; border-radius: 16px; background: #fff; color: #12161c; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,.35); }
#rsa-job .gate-title { margin: 0 0 8px; font-size: 20px; font-weight: 700; }
#rsa-job .gate-card p { margin: 0; font-size: 15px; }
#rsa-job .gate.error .gate-title { color: #8f1d1d; }
#rsa-job .gate-btn { display: block; width: 100%; min-height: 48px; margin: 16px 0 0; padding: 0 18px; border-radius: 14px; background: #f9c22e; color: #101820; font-size: 16px; font-weight: 700; text-align: center; }
/* live camera sheet: full-screen over the page. z 500 sits above the trip sheet (18), header (20) and ETA pill (15)
   and below the location gate (1000), so a lost location permission still blocks the page on top of the camera */
#rsa-job .camera { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 500; background: #000; color: #fff; }
#rsa-job .camera video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; background: #000; }
#rsa-job .camera-status { position: absolute; top: 50%; left: 0; right: 0; transform: translateY(-50%); text-align: center; font-size: 15px; font-weight: 600; }
#rsa-job .camera-cancel {
  position: absolute; top: calc(12px + env(safe-area-inset-top)); right: 12px; min-width: 44px; min-height: 44px; padding: 0 18px;
  border-radius: 999px; background: rgba(16, 24, 32, .65); color: #fff; font-size: 15px; font-weight: 700;
}
#rsa-job .camera-bar {
  position: absolute; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; gap: 14px;
  padding: 36px 16px calc(24px + env(safe-area-inset-bottom)); background: linear-gradient(to top, rgba(0, 0, 0, .6), rgba(0, 0, 0, 0));
}
#rsa-job .camera-help { margin: 0; font-size: 13px; text-align: center; text-shadow: 0 1px 3px rgba(0, 0, 0, .6); }
#rsa-job .camera-shutter { width: 72px; height: 72px; padding: 0; border-radius: 50%; background: transparent; border: 4px solid #fff; display: flex; align-items: center; justify-content: center; }
#rsa-job .camera-shutter span { display: block; width: 56px; height: 56px; border-radius: 50%; background: #f9c22e; }
#rsa-job .camera-shutter:active span { background: #fff; }
#rsa-job .camera-shutter[disabled] { opacity: .4; }
/* upload progress: blocking overlay while a captured photo is being sent. z 800 sits above the camera sheet (500) and
   below the location gate (1000), so a lost location permission still wins. No close affordance by design. */
#rsa-job .progress { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 800; display: flex; align-items: center; justify-content: center; margin: 0; padding: 0 16px; background: rgba(0,0,0,0.55); touch-action: none; overscroll-behavior: contain; }
#rsa-job .progress-card { width: 100%; max-width: 360px; padding: 24px 20px; border-radius: 16px; background: #fff; color: #12161c; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,.35); }
#rsa-job .progress-title { margin: 14px 0 0; font-size: 20px; font-weight: 700; }
#rsa-job .progress-sub { margin: 6px 0 0; font-size: 15px; color: #3a444f; }
#rsa-job .spinner { width: 44px; height: 44px; margin: 0 auto; border-radius: 50%; border: 4px solid #e6e9ed; border-top-color: #f9c22e; animation: rsa-spin .8s linear infinite; }
@keyframes rsa-spin { to { transform: rotate(360deg); } }
#rsa-job .hidden { display: none !important; }

/* ---------- OTP ---------- */
#rsa-job .otp-copy { margin: 2px 0 12px; color: #3a444f; }
#rsa-job .otp-input {
  width: 100%; height: 62px; border: 2px solid #d3d8dd; border-radius: 14px; background: #fbfcfd;
  text-align: center; font-size: 30px; font-weight: 700; letter-spacing: .5em; text-indent: .5em;
  color: #12161c; font-family: inherit;
}
#rsa-job .otp-input:focus { outline: none; border-color: #f9c22e; background: #fff; }

/* ---------- photos ---------- */
#rsa-job .shots { display: flex; gap: 8px; margin: 4px 0 12px; }
#rsa-job .shot {
  flex: 1 1 0; aspect-ratio: 1; border-radius: 12px; background: #f4f5f7; border: 1.5px dashed #d3d8dd;
  display: flex; align-items: center; justify-content: center; color: #9aa4ae; font-size: 12px; overflow: hidden;
}
#rsa-job .shot.empty { cursor: pointer; color: #6b7885; }
#rsa-job .shot.empty:active { background: #fff6dc; border-color: #f9c22e; color: #7a5b00; }
#rsa-job .shot.done { border-style: solid; border-color: #1f9d55; background: #eef8f1; color: #1f9d55; font-weight: 700; }
#rsa-job .shot img { width: 100%; height: 100%; object-fit: cover; }
#rsa-job .done-line { display: flex; align-items: center; gap: 8px; color: #1f9d55; font-weight: 700; }
`;

export default css;

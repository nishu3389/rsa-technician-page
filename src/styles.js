/* Stylesheet text for the RSA technician page, rendered through a <style> element
   (see RsaTechnicianJob.js): the repo CSS loader would drop or hash a plain import.
   Look: GoMechanic "Field Ops" (Google Stitch redesign). The map, route line, markers, photo tiles and camera keep
   their earlier look on purpose. Icons are CSS masks, so boot.js can keep rewriting button text without losing them. */
var rsaIcon = function (d) {
  return 'url("data:image/svg+xml,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='" + d + "'/></svg>") + '")';
};
var RSA_ICONS = {
  nav: rsaIcon('M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z'),
  user: rsaIcon('M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'),
  car: rsaIcon('M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z'),
  wrench: rsaIcon('M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z'),
  clipboard: rsaIcon('M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z'),
  pin: rsaIcon('M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'),
  copy: rsaIcon('M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'),
  lock: rsaIcon('M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'),
  check: rsaIcon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'),
  camera: rsaIcon('M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'),
  shield: rsaIcon('M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z'),
  alert: rsaIcon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'),
  phone: rsaIcon('M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z'),
  linkoff: rsaIcon('M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.43-.98 2.63-2.31 2.98l1.46 1.46C20.88 15.61 22 13.95 22 12c0-2.76-2.24-5-5-5zm-1 4h-2.19l2 2H16v-2zM2 4.27l3.11 3.11C3.29 8.12 2 9.91 2 12c0 2.76 2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.59 1.21-2.9 2.76-3.07L8.73 11H8v2h2.73L13 15.27V17h1.73l4.01 4L20 19.74 3.27 3 2 4.27z')
};
var RSA_LOGO = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='97 233 648 128'%3E%3Cpath fill='white' d='M363.4,305.6v4.4c0,7.8-2.4,13.9-7.3,18.6c-4.8,4.6-10.9,6.9-18.3,6.9c-8.1,0-14.7-2.6-20.1-7.8 c-5.3-5.2-7.9-11.6-7.9-19.1c0-7.6,2.6-13.9,7.9-19.2s11.7-7.9,19.3-7.9c9.7,0,18.2,4.7,22.7,11.9l-10.1,5.8 c-2.3-3.6-7-6.1-12.7-6.1c-4.4,0-8.1,1.5-11,4.4s-4.3,6.7-4.3,11.2c0,4.5,1.5,8.2,4.4,11c3,2.8,6.9,4.2,11.9,4.2 c6.9,0,11.3-2.7,13.3-8h-13.9v-10.4H363.4z'/%3E%3Cpath fill='white' d='M387.6,335.5c-5.5,0-10.2-1.9-13.9-5.6c-3.8-3.8-5.7-8.4-5.7-13.9c0-5.5,1.9-10.1,5.7-13.9 c3.8-3.8,8.4-5.7,13.9-5.7s10.2,1.9,13.9,5.7c3.8,3.8,5.7,8.4,5.7,13.9c0,5.5-1.9,10.2-5.7,13.9 C397.7,333.6,393.1,335.5,387.6,335.5z M387.6,324.7c2.4,0,4.4-0.8,6.1-2.4c1.6-1.6,2.4-3.7,2.4-6.3c0-2.6-0.8-4.7-2.4-6.3 c-1.6-1.6-3.6-2.4-6.1-2.4c-2.4,0-4.4,0.8-6.1,2.4c-1.6,1.6-2.4,3.7-2.4,6.3c0,2.6,0.8,4.7,2.4,6.3 C383.1,323.9,385.1,324.7,387.6,324.7z'/%3E%3Cpath fill='white' d='M465.9,282.6v51.9h-11.9v-30.2l-13.4,22h-1.3l-13.4-22v30.2h-11.9v-51.9h11.9l14.1,23l14.1-23H465.9z'/%3E%3Cpath fill='white' d='M484.8,320.4c1.3,3.5,4.2,5.2,8.9,5.2c3,0,5.4-1,7.1-2.8l8.9,5.1c-3.6,5.1-9,7.6-16.2,7.6 c-6.2,0-11.2-1.9-15-5.6c-3.7-3.7-5.6-8.4-5.6-14c0-5.6,1.9-10.2,5.5-13.9c3.7-3.8,8.4-5.6,14.2-5.6c5.4,0,9.9,1.9,13.4,5.6 c3.6,3.7,5.4,8.4,5.4,13.9c0,1.6-0.1,3-0.4,4.4H484.8z M500.5,312.1c-1.1-3.9-3.7-5.9-7.9-5.9c-4.3,0-7,1.9-8.1,5.9H500.5z'/%3E%3Cpath fill='white' d='M521.5,329.9c-3.7-3.8-5.6-8.4-5.6-13.9c0-5.6,1.9-10.2,5.6-13.9c3.8-3.8,8.4-5.6,14.1-5.6 c7.1,0,13.5,3.8,16.7,9.5l-9.7,5.6c-1.3-2.7-3.7-4.2-7.2-4.2c-4.8,0-8.4,3.6-8.4,8.6c0,5,3.6,8.6,8.4,8.6c3.5,0,5.9-1.4,7.2-4.2 l9.7,5.6c-3.3,5.9-9.6,9.6-16.7,9.6C529.9,335.5,525.3,333.6,521.5,329.9z'/%3E%3Cpath fill='white' d='M588.8,300.4c2.7,2.7,4,6.4,4,11.3v22.8h-11.1v-21.1c0-4.4-2.7-6.7-6.4-6.7c-4.2,0-6.9,2.6-6.9,7.6v20.2 h-11.1v-51.9h11.1v18.3c2.2-3,5.8-4.5,10.6-4.5C582.8,296.4,586.2,297.7,588.8,300.4z'/%3E%3Cpath fill='white' d='M627.5,297.4h11.1v37.1h-11.1V331c-2.6,3-6.3,4.5-11,4.5c-4.9,0-9-1.9-12.5-5.6s-5.2-8.4-5.2-13.9 c0-5.5,1.7-10.1,5.2-13.9s7.6-5.7,12.5-5.7c4.7,0,8.4,1.5,11,4.5V297.4z M618.7,325c2.6,0,4.7-0.8,6.4-2.4 c1.6-1.6,2.4-3.9,2.4-6.6s-0.8-5-2.4-6.6c-1.6-1.6-3.8-2.4-6.4-2.4s-4.7,0.8-6.4,2.4c-1.6,1.6-2.4,3.9-2.4,6.6s0.8,5,2.4,6.6 C613.9,324.2,616.1,325,618.7,325z'/%3E%3Cpath fill='white' d='M678.4,300.4c2.7,2.7,4,6.4,4,11.3v22.8h-11.1v-21.1c0-4.4-2.7-6.7-6.4-6.7c-4.2,0-6.9,2.6-6.9,7.6v20.2 h-11.1v-37.1H658v3.5c2.2-3,5.8-4.5,10.6-4.5C672.5,296.4,675.8,297.7,678.4,300.4z'/%3E%3Cpath fill='white' d='M691,292.2c-2.6-2.7-2.6-6.8,0-9.4c2.7-2.7,6.8-2.7,9.4,0c2.7,2.6,2.7,6.7,0,9.4 C697.8,294.8,693.7,294.8,691,292.2z M690.2,334.5v-37.1h11.1v37.1H690.2z'/%3E%3Cpath fill='white' d='M712.8,329.9c-3.7-3.8-5.6-8.4-5.6-13.9c0-5.6,1.9-10.2,5.6-13.9c3.8-3.8,8.4-5.6,14.1-5.6 c7.1,0,13.5,3.8,16.7,9.5l-9.7,5.6c-1.3-2.7-3.7-4.2-7.2-4.2c-4.8,0-8.4,3.6-8.4,8.6c0,5,3.6,8.6,8.4,8.6c3.5,0,5.9-1.4,7.2-4.2 l9.7,5.6c-3.3,5.9-9.6,9.6-16.7,9.6C721.2,335.5,716.6,333.6,712.8,329.9z'/%3E%3Cpath fill='white' d='M136.7,319.2c-4.7,0-8.6-3.8-8.6-8.6c0-4.7,3.8-8.6,8.6-8.6s8.6,3.8,8.6,8.6 C145.3,315.3,141.5,319.2,136.7,319.2z'/%3E%3Cpath fill='white' d='M265.9,278c-0.6-0.4-1.1-1-1.2-1.7c-3.7-24.4-17.3-42-33.9-42h-79.3c-16.7,0-30.3,17.6-34,42 c-0.1,0.7-0.5,1.4-1.2,1.7c-11.6,6.4-18.1,18.9-18.1,33.4c0,11.1,4.1,21,10.9,27.9c0.4,0.4,0.7,1,0.7,1.7v10.9 c0,4.6,3.7,8.3,8.3,8.3H131c4.6,0,8.3-3.7,8.3-8.3v-2c0-0.3,0.3-0.6,0.6-0.6h102.7c0.3,0,0.6,0.3,0.6,0.6v2 c0,4.6,3.7,8.3,8.3,8.3h12.8c4.6,0,8.3-3.7,8.3-8.3v-10.9c0-0.6,0.3-1.2,0.7-1.7c6.9-6.9,10.9-16.9,10.9-27.9 C284.1,296.9,277.5,284.4,265.9,278z M136,269.6c3.7-13,11.9-22,20.3-22h69.5c8.4,0,16,8.8,20.3,21.1c1.3,3.7-0.9,5.4-2.7,5.4 c-0.4,0-2.7,0-3.1,0H142c-0.4,0-2.2,0-2.6,0C136.8,274.2,135.3,272,136,269.6z M265.1,321.4c-3.5,5.5-9.6,9.1-16.6,9.1 c-6.5,0-12.2-3.2-15.8-8c-0.6-0.8-1.5-1.2-2.4-1.2h-74.7c-1.3,0-2.5,0.6-3.3,1.6c-4,5-10.3,8.1-17.3,7.6 c-10-0.8-18-9.2-18.2-19.3c-0.3-11.3,8.7-20.5,19.9-20.5c6.6,0,12.4,3.2,16,8.1c0.8,1.1,2,1.7,3.4,1.7l74.2,0 c1,0,1.8-0.5,2.4-1.2c3.6-4.9,9.3-8.1,15.8-8.1c7,0,13.1,3.7,16.5,9.2c0.5,0.8-0.1,1.8-1,1.8h-11.1c-4.6,0-8.4,3.9-8.4,8.7 c0,4.8,3.7,8.7,8.4,8.7l11.1,0C265.1,319.6,265.6,320.6,265.1,321.4z'/%3E %3C/svg%3E\")";
const css = `/* Everything is scoped under #rsa-job: html, body and header are never styled globally. */

#rsa-job {
  --ink: #101820; --ink-2: #3a444f; --muted: #6b7885; --line: #e3e8ee; --canvas: #f4f6f9; --tint: #ecf3fc;
  --amber: #f9c22e; --amber-ink: #785a00; --blue: #1557c0; --green: #1f9d55; --red: #ba1a1a;
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; height: 100%; z-index: 100000;
  margin: 0; background: var(--canvas); color: var(--ink); overflow: hidden;
  font: 500 15px/1.45 Inter, Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased; font-variant-numeric: tabular-nums;
}
#rsa-job, #rsa-job * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
#rsa-job button { font: inherit; border: 0; cursor: pointer; }
#rsa-job button:focus-visible, #rsa-job [role="button"]:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }

/* the GoMechanic logo (white artwork used as a mask, so it takes the text colour) */
#rsa-job .gm-logo {
  display: block; flex: none; width: 104px; height: 21px; background: currentColor;
  -webkit-mask: ${RSA_LOGO} left center / contain no-repeat; mask: ${RSA_LOGO} left center / contain no-repeat;
}
#rsa-job .gm-logo.ink { color: var(--ink); margin: 0 auto 18px; width: 136px; height: 27px; }

/* ---------- toolbar ---------- */
#rsa-job header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 20;
  background: var(--ink); color: #fff; box-shadow: 0 1px 0 rgba(255, 255, 255, .06);
  height: calc(56px + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) 10px 0 14px;
  display: grid; grid-template-columns: auto minmax(0, max-content) minmax(0, 1fr) auto auto; grid-template-areas: "logo stage . send sim";
  align-content: center; align-items: center; column-gap: 6px;
}
#rsa-job header .gm-logo { grid-area: logo; }
/* narrow phones: the car mark alone, so the status and switches keep their room */
@media (max-width: 459px) { #rsa-job header .gm-logo { width: 31px; -webkit-mask-size: auto 100%; mask-size: auto 100%; } }
#rsa-job header .brand, #rsa-job header h1 { display: none; }
#rsa-job header .stage {
  grid-area: stage; justify-self: start; display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; margin: 0; padding: 6px 11px 6px 9px;
  border-radius: 999px; background: rgba(255, 255, 255, .1); border: 1px solid rgba(255, 255, 255, .14);
  color: #fff; font-size: 13px; font-weight: 700; white-space: nowrap;
}
#rsa-job header .stage::before { content: ""; display: inline-block; vertical-align: 1px; width: 8px; height: 8px; margin-right: 6px; border-radius: 50%; background: var(--amber); }
#rsa-job header .stage[data-stage="on_the_way"]::before, #rsa-job header .stage[data-stage="almost_here"]::before { background: #5b9bff; }
#rsa-job header .stage[data-stage="reached"]::before, #rsa-job header .stage[data-stage="completed"]::before { background: #3ad07a; }
#rsa-job header .stage[data-stage="cancelled"]::before { background: #ff6b5e; }
#rsa-job .tb-switch {
  justify-self: end; display: flex; align-items: center; gap: 5px; min-width: 0; padding: 6px 8px; border-radius: 999px;
  background: rgba(255, 255, 255, .1); border: 1px solid rgba(255, 255, 255, .12); color: #cfd6de;
  font: 600 11px/1.2 Inter, Roboto, system-ui, sans-serif; white-space: nowrap; cursor: pointer;
}
#rsa-job .tb-switch input { margin: 0; flex: none; accent-color: var(--amber); }
#rsa-job .tb-switch span { overflow: hidden; text-overflow: ellipsis; font-variant-numeric: tabular-nums; }
@media (max-width: 379px) { #rsa-job header .stage { font-size: 12px; padding: 5px 9px 5px 8px; } #rsa-job header { column-gap: 5px; padding-left: 12px; } }
#rsa-job .tb-switch.off { background: rgba(217, 48, 37, .85); border-color: transparent; color: #fff; }

/* ---------- shared pieces ---------- */
#rsa-job .card {
  background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 16px; margin-bottom: 12px;
}
#rsa-job .card h2 {
  display: flex; align-items: center; gap: 8px; margin: 0 0 12px;
  font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #4a5560;
}
#rsa-job .card h2::before {
  content: ""; width: 18px; height: 18px; flex: none; background: var(--blue);
  -webkit-mask: var(--ic) center / contain no-repeat; mask: var(--ic) center / contain no-repeat;
}
#rsa-job .c-customer { --ic: ${RSA_ICONS.user}; }
#rsa-job .c-vehicle { --ic: ${RSA_ICONS.car}; }
#rsa-job .c-services { --ic: ${RSA_ICONS.wrench}; }
#rsa-job .c-job { --ic: ${RSA_ICONS.clipboard}; }
#rsa-job .c-arrive { --ic: ${RSA_ICONS.pin}; }
#rsa-job .c-otp { --ic: ${RSA_ICONS.shield}; }
#rsa-job .c-photos { --ic: ${RSA_ICONS.camera}; }
#rsa-job .c-done { --ic: ${RSA_ICONS.check}; }
#rsa-job .card h2 { --ic: ${RSA_ICONS.clipboard}; }
#rsa-job .c-customer h2 { --ic: ${RSA_ICONS.user}; } #rsa-job .c-vehicle h2 { --ic: ${RSA_ICONS.car}; }
#rsa-job .c-services h2 { --ic: ${RSA_ICONS.wrench}; } #rsa-job .c-arrive h2 { --ic: ${RSA_ICONS.pin}; }
#rsa-job .c-otp h2 { --ic: ${RSA_ICONS.shield}; } #rsa-job .c-photos h2 { --ic: ${RSA_ICONS.camera}; }
#rsa-job .c-done h2 { --ic: ${RSA_ICONS.check}; }

#rsa-job .row { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 8px 0; }
#rsa-job .row + .row { border-top: 1px solid #eef1f4; }
#rsa-job .row .label { color: var(--muted); flex: 0 0 auto; font-weight: 600; }
#rsa-job .row .value { text-align: right; font-weight: 700; word-break: break-word; }
#rsa-job .row .value.tiny { font: 700 13px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--ink-2); }
#rsa-job .name { font-size: 22px; line-height: 1.2; font-weight: 800; margin: 0 0 4px; letter-spacing: -.01em; }
#rsa-job .c-customer .row { padding: 4px 0 10px; }
#rsa-job .c-customer .row .value { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .04em; color: var(--ink-2); }

#rsa-job .addr { display: flex; align-items: flex-start; gap: 10px; padding: 12px 12px 12px 14px; border-radius: 12px; background: var(--tint); }
#rsa-job .addr::before {
  content: ""; width: 20px; height: 20px; flex: none; margin-top: 1px; background: var(--amber-ink);
  -webkit-mask: ${RSA_ICONS.pin} center / contain no-repeat; mask: ${RSA_ICONS.pin} center / contain no-repeat;
}
#rsa-job .address { flex: 1 1 auto; margin: 0; color: var(--ink); font-weight: 500; line-height: 1.45; min-width: 0; }
#rsa-job .link-btn {
  flex: none; display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 12px; margin: -4px -4px -4px 0;
  border-radius: 10px; background: #dde9f8; color: var(--ink); font-size: 13px; font-weight: 700;
}
#rsa-job .link-btn::before {
  content: ""; width: 16px; height: 16px; background: currentColor;
  -webkit-mask: ${RSA_ICONS.copy} center / contain no-repeat; mask: ${RSA_ICONS.copy} center / contain no-repeat;
}

/* vehicle: model on the left, an HSRP-style number plate on the right */
#rsa-job .veh { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
#rsa-job .veh-name { margin: 0; font-size: 18px; font-weight: 800; line-height: 1.25; min-width: 0; flex: 1 1 140px; }
#rsa-job .plate {
  display: inline-flex; align-items: stretch; max-width: 100%; border: 1.5px solid var(--ink); border-radius: 5px; background: #fff;
  font: 800 15px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .08em; color: var(--ink);
  white-space: pre-line; text-align: center; overflow: hidden; overflow-wrap: anywhere;
}
#rsa-job .plate::before {
  content: "IND"; display: flex; align-items: flex-end; justify-content: center; width: 22px; padding: 0 0 4px; flex: none;
  background: #1a4fbf; color: #fff; font: 800 7px/1 Inter, Roboto, sans-serif; letter-spacing: 0;
}
#rsa-job .plate:empty { display: none; }
#rsa-job .veh .plate { padding: 0 10px 0 0; min-height: 34px; align-items: center; }
#rsa-job .veh .plate::before { align-self: stretch; margin-right: 9px; }

/* services: one tinted row each, with a tick */
#rsa-job .services { margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; }
#rsa-job .services li {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 13px 14px; border-radius: 12px;
  background: var(--tint); font-weight: 700; font-size: 16px;
}
#rsa-job .services li::after {
  content: ""; width: 22px; height: 22px; flex: none; background: var(--amber-ink);
  -webkit-mask: ${RSA_ICONS.check} center / contain no-repeat; mask: ${RSA_ICONS.check} center / contain no-repeat;
}
#rsa-job .muted { color: var(--muted); }
#rsa-job .tiny { font-size: 12px; }
#rsa-job #services-empty { margin: 0; padding: 12px 14px; border-radius: 12px; background: var(--canvas); font-size: 14px; }

/* notices: amber (info / progress), red (error), blue (screen-on hint) */
#rsa-job .notice {
  display: flex; align-items: flex-start; gap: 10px; margin: 12px 0 0; padding: 12px 14px; border-radius: 12px;
  background: #fff6dc; color: #4a3800; font-size: 14px; font-weight: 600; line-height: 1.4;
}
#rsa-job .notice::before {
  content: ""; width: 18px; height: 18px; flex: none; margin-top: 1px; background: #c77700;
  -webkit-mask: ${RSA_ICONS.alert} center / contain no-repeat; mask: ${RSA_ICONS.alert} center / contain no-repeat;
}
#rsa-job .notice.error { background: #ffdad6; color: #93000a; }
#rsa-job .notice.error::before { background: var(--red); }
#rsa-job #screen-hint { background: #e3eefc; color: #0d3b86; }
#rsa-job #screen-hint::before { background: var(--blue); -webkit-mask-image: ${RSA_ICONS.phone}; mask-image: ${RSA_ICONS.phone}; }

/* buttons */
#rsa-job .start, #rsa-job .action, #rsa-job .peek-action, #rsa-job .gate-btn {
  display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%;
  border-radius: 14px; font-weight: 800; letter-spacing: .01em; transition: transform .08s ease, filter .15s ease;
}
#rsa-job .start:active, #rsa-job .action:active, #rsa-job .peek-action:active, #rsa-job .gate-btn:active { transform: scale(.985); filter: brightness(.96); }
#rsa-job .start::before, #rsa-job .action::before, #rsa-job .peek-action::before {
  content: ""; width: 22px; height: 22px; flex: none; background: currentColor;
  -webkit-mask: var(--btn-ic) center / contain no-repeat; mask: var(--btn-ic) center / contain no-repeat;
}
#rsa-job .action { height: 56px; margin-top: 14px; background: var(--ink); color: #fff; font-size: 17px; --btn-ic: ${RSA_ICONS.check}; }
#rsa-job .action.primary { background: var(--amber); color: var(--ink); box-shadow: 0 2px 0 #d9a514; }
#rsa-job .action[disabled], #rsa-job .peek-action[disabled] { opacity: .5; box-shadow: none; }
#rsa-job #reached, #rsa-job #peek-reached { --btn-ic: ${RSA_ICONS.pin}; }
#rsa-job #otp-submit { --btn-ic: ${RSA_ICONS.shield}; }
#rsa-job #take-photo { --btn-ic: ${RSA_ICONS.camera}; }
#rsa-job #complete { background: var(--green); color: #fff; box-shadow: 0 2px 0 #16783f; }
#rsa-job .state { padding: 32px 20px; text-align: center; color: var(--muted); font-weight: 600; }
#rsa-job .state strong { display: block; color: var(--ink); font-size: 19px; font-weight: 800; margin-bottom: 6px; }
#rsa-job #loading .spinner { margin: 0 auto 14px; }
#rsa-job .state-icon {
  display: block; width: 56px; height: 56px; margin: 0 auto 14px; border-radius: 50%; background: #ffdad6; position: relative;
}
#rsa-job .state-icon::after {
  content: ""; position: absolute; inset: 14px; background: var(--red);
  -webkit-mask: ${RSA_ICONS.linkoff} center / contain no-repeat; mask: ${RSA_ICONS.linkoff} center / contain no-repeat;
}

/* ---------- start / details view ---------- */
#rsa-job #view-assigning { position: absolute; top: 0; left: 0; right: 0; bottom: 0; padding: calc(var(--rsa-header-h, 56px) + 16px) 16px 28px; overflow-y: auto; -webkit-overflow-scrolling: touch; }
#rsa-job .start {
  height: 68px; border-radius: 16px; background: var(--amber); color: var(--ink);
  font-size: 19px; letter-spacing: .08em; text-transform: uppercase; box-shadow: 0 3px 0 #d9a514, 0 6px 18px rgba(249, 194, 46, .35);
  --btn-ic: ${RSA_ICONS.nav};
}
#rsa-job .start[disabled] { opacity: .6; box-shadow: none; }
#rsa-job .start-hint { margin: 10px 2px 16px; font-size: 13px; font-weight: 600; color: var(--muted); text-align: center; }

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
  position: absolute; top: calc(var(--rsa-header-h, 56px) + env(safe-area-inset-top) + 58px); left: 50%; transform: translateX(-50%);
  z-index: 15; max-width: calc(100% - 32px); background: #8f1d1d; color: #fff; border-radius: 999px; padding: 7px 14px;
  font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  box-shadow: 0 2px 10px rgba(16, 24, 32, .25);
}
#rsa-job #eta-pill {
  position: absolute; top: calc(var(--rsa-header-h, 56px) + env(safe-area-inset-top) + 8px); left: 50%; transform: translateX(-50%);
  z-index: 15; display: flex; align-items: center; gap: 10px; max-width: calc(100% - 32px);
  background: var(--ink); color: #fff; border-radius: 999px; padding: 10px 18px;
  box-shadow: 0 4px 14px rgba(16, 24, 32, .3); font-size: 15px; font-weight: 700; white-space: nowrap;
}
#rsa-job #eta-pill #eta-text { overflow: hidden; text-overflow: ellipsis; }
#rsa-job #eta-pill .dot { width: 10px; height: 10px; flex: none; border-radius: 50%; background: var(--amber); box-shadow: 0 0 0 3px rgba(249, 194, 46, .25); }
#rsa-job #sheet {
  position: absolute; left: 0; right: 0; bottom: 0; z-index: 18;
  height: calc(100% - var(--rsa-header-h, 56px)); background: var(--canvas); border-radius: 22px 22px 0 0;   /* open, it stops under the toolbar so its handle stays reachable */
  box-shadow: 0 -4px 18px rgba(16, 24, 32, .16);
  display: flex; flex-direction: column;
  transform: translateY(var(--peek, 62vh)); transition: transform .25s ease-out;
  will-change: transform;
}
#rsa-job #sheet.dragging { transition: none; }
#rsa-job .grab { flex: 0 0 auto; padding: 8px 0 6px; display: flex; flex-direction: column; align-items: center; gap: 5px; touch-action: none; cursor: grab; background: #fff; }
#rsa-job .grab .bar { width: 40px; height: 5px; border-radius: 999px; background: #d3d8dd; }
#rsa-job .grab .grab-title { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: var(--blue); letter-spacing: .02em; max-width: 100%; padding: 0 16px; }
#rsa-job .grab .grip { flex: none; fill: #9aa4ae; }
/* closed: the handle carries the important detail (ETA + distance), the label becomes secondary */
#rsa-job .grab .grab-detail { display: none; color: var(--ink); font-size: 14px; font-weight: 800; white-space: nowrap; }
#rsa-job #sheet.closed .grab .grab-detail:not(:empty) { display: inline; }
#rsa-job #sheet.closed .grab .grab-detail:not(:empty)::after { content: "·"; margin-left: 8px; color: #9aa4ae; font-weight: 400; }
#rsa-job #sheet.closed .grab #grab-text { color: var(--muted); font-size: 11px; font-weight: 600; white-space: nowrap; }
#rsa-job .grab .chev { flex: none; font-size: 11px; color: var(--blue); }

#rsa-job .peek { padding: 2px 16px 14px; background: #fff; border-bottom: 1px solid var(--line); touch-action: none; }
#rsa-job .peek .who { font-size: 19px; font-weight: 800; letter-spacing: -.01em; }
#rsa-job .peek .what { display: flex; align-items: center; gap: 8px; color: var(--ink-2); font-size: 14px; font-weight: 700; margin-top: 3px; }
#rsa-job .peek .what::before { content: ""; width: 9px; height: 9px; flex: none; border-radius: 50%; background: var(--blue); box-shadow: 0 0 0 3px rgba(21, 87, 192, .18); }
#rsa-job .peek-action {
  margin-top: 12px; height: 54px; background: var(--amber); color: var(--ink); font-size: 17px; box-shadow: 0 2px 0 #d9a514;
}
#rsa-job #sheet.open .peek-action { display: none; }
#rsa-job .lock-line {
  display: flex; align-items: center; gap: 10px; margin: 12px 0 0; padding: 13px 14px; border-radius: 12px;
  background: #e8edf3; color: var(--ink-2); font-size: 15px; font-weight: 700;
}
#rsa-job .lock-line::before {
  content: ""; width: 20px; height: 20px; flex: none; background: var(--muted);
  -webkit-mask: ${RSA_ICONS.lock} center / contain no-repeat; mask: ${RSA_ICONS.lock} center / contain no-repeat;
}
#rsa-job #sheet.open #peek-lock { display: none; }
#rsa-job #sheet:not(.open) #arrive-block #arrive-lock { display: none; }
#rsa-job #sheet:not(.open) #arrive-block #reached { display: none; }
#rsa-job .sheet-body { flex: 1 1 auto; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; padding: 12px 12px 28px; }
#rsa-job .sheet-body > .notice { margin: 0 0 12px; }
#rsa-job .otp-copy { margin: 0 0 14px; color: var(--ink-2); font-weight: 500; }
#rsa-job .c-done { text-align: center; padding: 24px 18px; border-color: #bfe6cf; background: #f2fbf5; }
#rsa-job .c-done h2 { justify-content: center; color: var(--green); }
#rsa-job .c-done h2::before { display: none; }
#rsa-job .done-icon { display: block; width: 64px; height: 64px; margin: 0 auto 12px; border-radius: 50%; background: var(--green); position: relative; animation: rsa-pop .35s ease-out; }
#rsa-job .done-icon::after {
  content: ""; position: absolute; inset: 0; background: #fff;
  -webkit-mask: ${RSA_ICONS.check} center / 64px no-repeat; mask: ${RSA_ICONS.check} center / 64px no-repeat;
}
@keyframes rsa-pop { from { transform: scale(.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
#rsa-job .done-line { display: flex; justify-content: center; align-items: center; gap: 8px; margin: 0 0 6px; color: var(--ink); font-size: 18px; font-weight: 800; }
#rsa-job .c-done .muted { font-size: 14px; margin: 0; }
#rsa-job .c-done .gm-logo.ink { margin-bottom: 16px; width: 120px; height: 24px; }

/* location gate: blocking modal. Fixed overlay above the header (z 20) and trip sheet (z 18) with a dimmed backdrop and a centred card */
#rsa-job .gate { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; margin: 0; padding: 0 16px; background: rgba(16, 24, 32, .62); }
#rsa-job .gate-card { width: 100%; max-width: 360px; padding: 24px 20px 20px; border-radius: 20px; background: #fff; color: var(--ink); text-align: center; box-shadow: 0 12px 40px rgba(0, 0, 0, .35); }
#rsa-job .gate-icon { display: block; width: 64px; height: 64px; margin: 0 auto 14px; border-radius: 50%; background: #fff3cf; position: relative; }
#rsa-job .gate-icon::after {
  content: ""; position: absolute; inset: 16px; background: var(--amber-ink);
  -webkit-mask: ${RSA_ICONS.pin} center / contain no-repeat; mask: ${RSA_ICONS.pin} center / contain no-repeat;
}
#rsa-job .gate.error .gate-icon { background: #ffdad6; }
#rsa-job .gate.error .gate-icon::after { background: var(--red); }
#rsa-job .gate-title { margin: 0 0 8px; font-size: 21px; font-weight: 800; }
#rsa-job .gate-card p { margin: 0; font-size: 15px; color: var(--ink-2); }
#rsa-job .gate.error .gate-title { color: #8f1d1d; }
#rsa-job .gate-btn { min-height: 54px; margin: 18px 0 0; padding: 0 18px; background: var(--amber); color: var(--ink); font-size: 17px; box-shadow: 0 2px 0 #d9a514; }
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
#rsa-job .progress { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 800; display: flex; align-items: center; justify-content: center; margin: 0; padding: 0 16px; background: rgba(16, 24, 32, .62); touch-action: none; overscroll-behavior: contain; }
#rsa-job .progress-card { width: 100%; max-width: 360px; padding: 28px 20px; border-radius: 20px; background: #fff; color: var(--ink); text-align: center; box-shadow: 0 12px 40px rgba(0, 0, 0, .35); }
#rsa-job .progress-title { margin: 16px 0 0; font-size: 20px; font-weight: 800; }
#rsa-job .progress-sub { margin: 6px 0 0; font-size: 15px; color: var(--ink-2); }
#rsa-job .spinner { display: block; width: 44px; height: 44px; margin: 0 auto; border-radius: 50%; border: 4px solid #e6e9ed; border-top-color: var(--amber); animation: rsa-spin .8s linear infinite; }
@keyframes rsa-spin { to { transform: rotate(360deg); } }
#rsa-job .hidden { display: none !important; }

/* ---------- OTP ---------- */
#rsa-job .otp-input {
  width: 100%; height: 66px; border: 2px solid transparent; border-radius: 14px; background: var(--tint);
  text-align: center; font: 800 32px/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .6em; text-indent: .6em;
  color: var(--ink);
}
#rsa-job .otp-input::placeholder { color: #b8c3cf; }
#rsa-job .otp-input:focus { outline: none; border-color: var(--amber-ink); background: #fff; }

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
`;

export default css;

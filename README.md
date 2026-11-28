# RSA technician page — standalone

Self-contained copy of the technician page from the website, for hosting on its own (e.g. GitHub Pages).
The website's code is untouched; this folder shares nothing with it at runtime.

## Build
    node build.js            # src/ + config.json  ->  docs/index.html  (one file, no dependencies)
    node build.js --sync     # first re-copy markup/styles/boot from ../gomechanic, then build

`src/boot.js`, `markup.js`, `styles.js` are a snapshot copied from the website; `src/entry.js` is the standalone glue.

## Open it
    https://<user>.github.io/<repo>/?job=<jobToken>&api=https://<api-host>/api/&upload_api=https://<upload-host>/api/

| param         | meaning                                                         |
|---------------|-----------------------------------------------------------------|
| `job`         | technician job token (`token` also works)                       |
| `api`         | main API base (job, location, OTP, reached, complete, retake)   |
| `upload_api`  | photo-upload API base (defaults to `api`)                       |
| `maps_key`    | Google Maps browser key: Maps JavaScript API (no key = no map)  |
| `routes_key`  | Routes API key for the Start-trip route (defaults to `maps_key`) |
| `ngrok=0`     | don't send `ngrok-skip-browser-warning`                         |
| `demo=1`      | sample data, no API calls (`&stage=assigning` for details view) |

Defaults can instead be set in `config.json` (then rebuild). Set `"allowQueryApi": false` to ignore `api=` / `upload_api=`
in the URL (otherwise anyone can craft a link that sends the job token to a server of their choosing — fine for testing only).

## Host on GitHub Pages
    git init && git add . && git commit -m "RSA technician page"
    # create a PUBLIC repo, push, then: Settings -> Pages -> Deploy from branch -> main, folder /docs

## Requirements for it to work
- APIs must be public **https** URLs (a hosted page cannot call `localhost` or a LAN IP).
- Backend CORS must allow the Pages origin, and — when using ngrok — list `ngrok-skip-browser-warning` in
  `Access-Control-Allow-Headers` (or use `&ngrok=0`). Also allow `x-rsa-job-token`, `authorization`, `content-type`.
- Don't commit env files or keys here; the repo is public.

## Google Maps key
`config.json` holds a browser key for the map and the Start-trip route. It is public by design in a static page, so it must be restricted in Google Cloud: **Websites** `https://nishu3389.github.io/*` (plus `http://localhost:*/*` for testing) and the **Maps JavaScript API** (and **Routes API**) only. A link can still override it with `&maps_key=`.

## Which API the page uses
`&api=<url>` in the link wins. With no `api` in the link the page uses `apiBase` from `config.json` (production, `https://gomechanic.app/api/`). `&upload_api=` overrides the photo-upload base; without it uploads go to whichever API base is in use.

## Test tools (debug only, never in production)
An (i) icon next to "Test drive" opens a purple **TEST TOOLS: NOT FOR PRODUCTION** sheet: a live status readout,
send location once, jump to X % of the route, send an old position, stage buttons, re-route.

It appears only when **both** are true. That's decided in one place, `testToolsEnabled` / `TEST_TOOLS_ENABLED` in `src/boot.js`:
- the page URL has `?debug=1`
- the `api` **and** `upload_api` hosts are on `TEST_TOOLS_HOSTS` (leadmanagerdev…azure.com, `*.ngrok-free.dev|app`, localhost)

The code lives in `src/testTools.js` → published as `docs/testTools.js` and loaded with a dynamic `import()` only when the
flag is true. A page without the flag never requests that file.

**Before a production release, check:**
1. `src/boot.js`: `TEST_TOOLS_HOSTS` doesn't contain any production host. The production API / upload hosts must not match.
2. Open the production link with `&debug=1`: no (i) icon, and DevTools → Network shows no `testTools.js` request.
3. Optional hard removal: delete `src/testTools.js` (and `docs/testTools.js`). With the file gone, the import fails quietly
   and the page is unaffected. On the website the same file is `src/routes/rsaTechnicianJob/testTools.js` (its own webpack
   chunk, `rsaTestTools`).

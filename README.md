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

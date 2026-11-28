#!/usr/bin/env node
/* Builds docs/index.html: one self-contained file (CSS + markup + logic inlined) for static hosting.
   No dependencies. Usage:
     node build.js            bundle src/ + config.json into docs/index.html
     node build.js --sync     first re-copy markup/styles/boot from the website repo, then bundle
*/
const fs = require('fs');
const path = require('path');

const root = __dirname;
const src = (f) => path.join(root, 'src', f);
/* Website page files: next to the repo checkout (../gomechanic/...) or, when this folder lives inside the repo, ../src/... */
const WEBSITE_DIR = [
  path.resolve(root, '../gomechanic/src/routes/rsaTechnicianJob'),
  path.resolve(root, '../src/routes/rsaTechnicianJob'),
].find((dir) => fs.existsSync(path.join(dir, 'boot.js')));

if (process.argv.includes('--sync')) {
  if (!WEBSITE_DIR) throw new Error('--sync: could not find the website src/routes/rsaTechnicianJob folder');
  ['markup.js', 'styles.js', 'boot.js', 'testTools.js'].forEach((f) => {
    fs.copyFileSync(path.join(WEBSITE_DIR, f), src(f));
    console.log('synced', f);
  });
}

const read = (f) => fs.readFileSync(src(f), 'utf8');

/* The three sources are ES modules; inline them as plain script by dropping the `export default`. */
function stripExport(code, file) {
  const out = code
    .replace(/^export default function boot\(/m, 'function boot(')
    .replace(/^export default (markup|css);?\s*$/m, '');
  if (/^\s*export\s/m.test(out)) throw new Error(`${file}: unhandled export statement`);
  if (/^\s*import\s/m.test(out)) throw new Error(`${file}: unexpected import statement`);
  return out;
}

const markup = stripExport(read('markup.js'), 'markup.js');
const styles = stripExport(read('styles.js'), 'styles.js');
const boot = stripExport(read('boot.js'), 'boot.js');
const entry = read('entry.js');
const config = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));

/* A literal </script> inside the inlined code would end the tag early. */
const safe = (s) => s.replace(/<\/script/gi, '<\\/script');

const app = `(function () {\n${markup}\n${styles}\n${boot}\n${entry}\n})();`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Roadside assistance job</title>
<script>window.RSA_CONFIG = ${safe(JSON.stringify(config))};</script>
</head>
<body>
<div id="rsa-job"></div>
<script>
${safe(app)}
</script>
</body>
</html>
`;

fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', 'index.html'), html);
fs.writeFileSync(path.join(root, 'docs', '.nojekyll'), '');
/* DEBUG ONLY: the test tools stay a separate file. boot.js imports it (dynamic import) only when TEST_TOOLS_ENABLED,
   i.e. ?debug=1 on test/dev API hosts; a production page never requests it. */
if (fs.existsSync(src('testTools.js'))) fs.copyFileSync(src('testTools.js'), path.join(root, 'docs', 'testTools.js'));
console.log(`built docs/index.html (${(html.length / 1024).toFixed(1)} KB)`);

// All responses are local fixtures. No production email, consent or subscriber is changed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import http from 'node:http';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const sources = new Map([
  ['/baja-en.html', readFileSync('baja-en.html', 'utf8')],
  ['/content-lab/prompts/en/', readFileSync('content-lab/public/prompts/en/index.html', 'utf8')],
]);
const server = http.createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/site-config.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.end('window.PODCAST_CONFIG={unsubscribeEndpoint:"https://qa.invalid/unsubscribe"}');
  } else if (sources.has(path)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(sources.get(path));
  } else { res.writeHead(204); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
let browser;
try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  for (const width of [360, 390, 820, 1024, 1440]) {
    for (const accepted of [true, false]) {
      for (const [path, formId, emailId, statusId] of [
        ['/baja-en.html', 'unsubscribe-form', 'unsubscribe-email', 'unsubscribe-status'],
        ['/content-lab/prompts/en/', 'matcha-lead-form', 'matcha-email', 'matcha-lead-feedback'],
      ]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors = [], calls = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('https://**/*', async route => {
          const request = route.request(), url = new URL(request.url());
          if (url.hostname === 'qa.invalid' || url.pathname.endsWith('/tle-matcha-freebie')) {
            calls.push(request);
            await route.fulfill({ status: accepted ? 200 : 503, contentType: 'application/json', body: JSON.stringify({ ok: accepted }) });
          } else { await route.fulfill({ status: 204, body: '' }); }
        });
        await page.goto(origin + path, { waitUntil: 'load' });
        assert.deepEqual(errors, [], path + ' must initialize');
        assert.equal(calls.length, 0, 'loading the page must not send a request');
        await page.locator('#' + emailId).fill('fixture@example.invalid');
        await page.locator('#' + formId + ' button[type=submit]').click();
        const status = page.locator('#' + statusId);
        await status.filter({ hasText: accepted ? /You're all set|Done!/ : /couldn't/ }).waitFor();
        assert.equal(calls.length, 1, 'one deliberate submission');
        const request = calls[0];
        assert.equal(request.method(), 'POST');
        if (path.includes('prompts')) {
          const payload = request.postDataJSON();
          assert.equal(payload.language, 'en');
          assert.equal(payload.marketing_opt_in, false, 'newsletter consent stays optional');
        } else {
          const payload = new URLSearchParams(request.postData());
          assert.equal(payload.get('action'), 'unsubscribe');
          assert.equal(payload.get('email'), 'fixture@example.invalid');
        }
        if (!accepted) assert.equal(await page.locator('#' + formId + ' button[type=submit]').isEnabled(), true, 'failure allows retry');
        assert.deepEqual(errors, [], 'no runtime exception');
        console.log('PASS', width, path, accepted ? 'success fixture' : 'failure fixture');
        await page.close();
      }
    }
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}

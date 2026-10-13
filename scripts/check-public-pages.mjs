const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'node:fs';
import assert from 'node:assert/strict';
const phase = process.argv[2] || 'after';
const output = process.env.PERF_OUTPUT || '/tmp/redzone-performance';
const base = process.env.PERF_BASE_URL || 'http://127.0.0.1:3004';

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const results = [];
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      for (const path of ['/', '/calendario', '/roster', '/posiciones']) {
        const page = await browser.newPage({ viewport });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const response = await page.goto(base + path, { waitUntil: 'networkidle', timeout: 30000 });
        assert.equal(response.status(), 200);
        const snapshot = await page.evaluate(() => ({
          text: document.querySelector('main').innerText,
          overflow: document.documentElement.scrollWidth > innerWidth,
          images: [...document.images].map(image => ({ alt: image.alt, width: image.clientWidth, height: image.clientHeight, naturalWidth: image.naturalWidth, src: image.currentSrc, sizes: image.sizes })),
          links: [...document.querySelectorAll('a')].map(link => ({ text: link.textContent, href: link.getAttribute('href') })),
        }));
        assert.equal(snapshot.overflow, false);
        assert.deepEqual(errors, []);
        await page.screenshot({ path: `${output}/${phase}-${path === '/' ? 'home' : path.slice(1)}-${viewport.width}.png`, fullPage: true });
        results.push({ path, width: viewport.width, status: response.status(), errors, ...snapshot });
        if (path === '/') {
          const initial = await page.locator('main h3').allTextContents();
          const next = page.locator('main button').nth(1);
          if (await next.isEnabled()) {
            await next.click();
            assert.notDeepEqual(await page.locator('main h3').allTextContents(), initial);
            await page.locator('main button').first().click();
            assert.deepEqual(await page.locator('main h3').allTextContents(), initial);
          }
          await page.locator('nav a[href="/calendario"]').click();
          await page.waitForURL(base + '/calendario');
          await page.getByRole('heading', { name: 'Calendario Oficial' }).waitFor();
        }
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  const previous = `${output}/before-browser.json`;
  if (phase === 'after' && fs.existsSync(previous)) {
    const before = JSON.parse(fs.readFileSync(previous, 'utf8'));
    const normalize = text => text.replace(/\d+\n(DÍAS|HRS|MIN|SEG)/g, '[countdown]\n$1');
    results.forEach((current, index) => {
      assert.deepEqual(current.links, before[index].links);
      assert.deepEqual(current.images.map(image => [image.alt, image.width, image.height]), before[index].images.map(image => [image.alt, image.width, image.height]));
      assert.equal(normalize(current.text), normalize(before[index].text));
    });
  }
  fs.writeFileSync(`${output}/${phase}-browser.json`, JSON.stringify(results, null, 2));
  console.log('Eight page/viewport checks passed; text, links and image dimensions match the baseline when present.');
})().catch(error => { console.error(error); process.exitCode = 1; });

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Keep measurement tooling outside the application dependency tree.
const phase = process.argv[2] ?? 'baseline';
const output = process.env.PERF_OUTPUT ?? '/tmp/redzone-performance';
const base = process.env.PERF_BASE_URL ?? 'http://127.0.0.1:3004';
const cli = process.env.LIGHTHOUSE_CLI ?? '/tmp/redzone-perf-tools/node_modules/lighthouse/cli/index.js';
const runs = Number(process.env.PERF_RUNS ?? 3);
const paths = ['/', '/calendario', '/roster', '/posiciones'];
mkdirSync(output, { recursive: true });
const results = [];
for (const path of paths) {
  // Warm the route on the server, identically in both phases. Each Lighthouse
  // pass creates a fresh browser profile; external image-cache warmth is not guaranteed.
  await fetch(base + path).then(response => {
    if (!response.ok) throw new Error(`Warmup ${path}: HTTP ${response.status}`);
    return response.arrayBuffer();
  });
  for (const mode of ['mobile', 'desktop']) {
    for (let run = 1; run <= runs; run++) {
      const file = join(output, `${phase}-${path === '/' ? 'home' : path.slice(1)}-${mode}-${run}.json`);
      const args = [cli, base + path, '--only-categories=performance', '--output=json', `--output-path=${file}`, '--chrome-path=/usr/bin/chromium', '--chrome-flags=--headless --no-sandbox', '--quiet'];
      if (mode === 'desktop') args.push('--preset=desktop');
      const command = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 90000 });
      if (command.status !== 0) throw new Error(command.stderr || `Lighthouse failed: ${command.status}`);
      const report = JSON.parse(readFileSync(file, 'utf8'));
      if (report.runtimeError) throw new Error(JSON.stringify(report.runtimeError));
      const value = id => report.audits[id]?.numericValue ?? null;
      const item = { path, mode, run, score: report.categories.performance.score * 100, fcp: value('first-contentful-paint'), lcp: value('largest-contentful-paint'), cls: value('cumulative-layout-shift'), tbt: value('total-blocking-time'), bytes: value('total-byte-weight'), server: value('server-response-time'), lighthouse: report.lighthouseVersion, chrome: report.environment.hostUserAgent };
      results.push(item);
      writeFileSync(join(output, `${phase}-summary.json`), JSON.stringify(results, null, 2));
      console.log(JSON.stringify(item));
    }
  }
}

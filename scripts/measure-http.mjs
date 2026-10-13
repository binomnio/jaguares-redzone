import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
const phase = process.argv[2] ?? 'baseline';
const base = process.env.PERF_BASE_URL ?? 'http://127.0.0.1:3004';
const output = process.env.PERF_OUTPUT ?? '/tmp/redzone-performance';
const log = process.env.PERF_QUERY_LOG;
if (!log) throw new Error('PERF_QUERY_LOG must match the production-server trace log');
appendFileSync(log, '');
const rows = () => readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const results = [];
for (const path of ['/', '/calendario', '/roster', '/posiciones']) {
  await (await fetch(base + path)).arrayBuffer();
  for (let run = 1; run <= 10; run++) {
    const startRow = rows().length;
    const start = performance.now();
    const response = await fetch(base + path);
    const body = await response.arrayBuffer();
    const item = { path, run, status: response.status, ms: performance.now() - start, htmlBytes: body.byteLength, cacheControl: response.headers.get('cache-control'), queries: rows().slice(startRow).map(x => x.table) };
    results.push(item);
  }
}
writeFileSync(`${output}/${phase}-http.json`, JSON.stringify(results, null, 2));
console.log(results);

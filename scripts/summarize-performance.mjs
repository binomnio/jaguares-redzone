import { readFileSync, writeFileSync } from 'node:fs';
const output = process.env.PERF_OUTPUT ?? '/tmp/redzone-performance';
const read = name => JSON.parse(readFileSync(`${output}/${name}.json`, 'utf8'));
const median = values => {
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
};
const phases = {};
for (const phase of ['before', 'after']) {
  const samples = read(`${phase}-summary`);
  const http = read(`${phase}-http`);
  for (const sample of samples) {
    const route = sample.path === '/' ? 'home' : sample.path.slice(1);
    const report = read(`${phase}-${route}-${sample.mode}-${sample.run}`);
    const requests = report.audits['network-requests'].details.items;
    sample.scriptBytes = requests.filter(request => request.resourceType === 'Script').reduce((total, request) => total + request.transferSize, 0);
    sample.imageFailures = requests.filter(request => request.resourceType === 'Image' && request.statusCode !== 200).length;
  }
  const lighthouse = [];
  const server = [];
  for (const path of ['/', '/calendario', '/roster', '/posiciones']) {
    for (const mode of ['mobile', 'desktop']) {
      const group = samples.filter(sample => sample.path === path && sample.mode === mode);
      if (group.length !== 3) throw new Error(`Expected three Lighthouse samples: ${phase} ${path} ${mode}`);
      const metrics = Object.fromEntries(['score', 'fcp', 'lcp', 'cls', 'tbt', 'bytes', 'server', 'scriptBytes', 'imageFailures'].map(key => [key, median(group.map(sample => sample[key]))]));
      lighthouse.push({ path, mode, ...metrics, scoreRange: [Math.min(...group.map(sample => sample.score)), Math.max(...group.map(sample => sample.score))] });
    }
    const group = http.filter(sample => sample.path === path);
    if (group.length !== 10 || group.some(sample => sample.status !== 200)) throw new Error(`Expected ten successful HTTP samples: ${phase} ${path}`);
    server.push({ path, ms: median(group.map(sample => sample.ms)), htmlBytes: median(group.map(sample => sample.htmlBytes)), queryCounts: [...new Set(group.map(sample => sample.queries.length))], cacheControl: [...new Set(group.map(sample => sample.cacheControl))] });
  }
  phases[phase] = { lighthouse, server, lighthouseSamples: samples, httpSamples: http };
}
writeFileSync(`${output}/comparison.json`, JSON.stringify(phases, null, 2));
console.log(JSON.stringify(Object.fromEntries(Object.entries(phases).map(([phase, value]) => [phase, { lighthouse: value.lighthouse, server: value.server }])), null, 2));

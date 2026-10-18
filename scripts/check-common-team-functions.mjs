// Isolated fixtures: real pages/components, mocked Supabase, Next Image/Link/router.
// Never starts an auth bypass or sends requests to a team's database.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const { build } = await import(process.env.ESBUILD_MODULE || '/tmp/admin-mobile-tools/node_modules/esbuild/lib/main.js');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || '/tmp/admin-mobile-tools/node_modules/playwright/index.mjs');
const root = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const dir = process.env.COMMON_UI_OUTPUT || '/tmp/common-team-fixtures';
mkdirSync(dir, { recursive: true });
const logo = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#dc2626"/></svg>');
const games = [
  { id: 't10', opponent_name: 'Rival TBD diez', jornada: 'Semana 10', game_date: '2999-01-01T00:00:00.000Z' },
  { id: 'real', opponent_name: 'Rival con fecha', jornada: 'Semana 1', game_date: '2099-01-01T18:00:00Z' },
  { id: 't2', opponent_name: 'Rival TBD dos', jornada: 'Semana 2', game_date: '2999-01-01T00:00:00.000Z' },
].map(game => ({ ...game, opponent_logo_url: logo, is_home: true, status: 'upcoming', location: 'Estadio de prueba' }));
const players = Array.from({ length: 12 }, (_, index) => ({
  id: String(index), first_name: 'Jugador', last_name: 'Apellido ' + index,
  jersey_number: String(12 - index), position: null, photo_url: null, active: true, is_featured: index % 2 === 0,
}));
const tables = {
  games, players,
  team_settings: [{ team_name: 'Equipo de prueba', short_name: 'EP', logo_url: logo, header_bg_url: logo }],
  standings: [{ id: 'standing', position: 1, team_name: 'Equipo de prueba', short_name: 'EP', logo_url: logo, wins: 3, ties: 1, losses: 2, pf: 75, pc: 45 }],
};
writeFileSync(dir + '/supabase.ts', `const tables=${JSON.stringify(tables)};let empty=false;export function setEmpty(value){empty=value}export async function createClient(){return {from(table){const q={select(){return this},order(){return this},eq(){return this},limit(){return this},maybeSingle:async()=>({data:tables[table][0]}),then(resolve){return Promise.resolve({data:empty&&table!=='team_settings'?[]:structuredClone(tables[table])}).then(resolve)}};return q}}}`);
writeFileSync(dir + '/next.tsx', `import React from 'react';export default function Link(props){return <a {...props}/>}export function useRouter(){return {push(path){window.savedPath=path},refresh(){}}}export function Image({fill,unoptimized,sizes,priority,...props}){return <img {...props} style={fill?{position:'absolute',width:'100%',height:'100%',inset:0}:undefined}/>}`);
writeFileSync(dir + '/image.tsx', `export {Image as default} from './next';`);
writeFileSync(dir + '/hero-server.tsx', `import React from 'react';import Hero from '${root}/components/NextGameHero.tsx';export default function Wrapped(props){return <div id="fixture-hero"><Hero {...props}/></div>}`);
writeFileSync(dir + '/server.tsx', `import React from 'react';import {renderToString} from 'react-dom/server';import Home from '${root}/app/(public)/page.tsx';import Roster from '${root}/app/(public)/roster/page.tsx';import Calendar from '${root}/app/(public)/calendario/page.tsx';import {setEmpty} from './supabase';export async function render(path){setEmpty(path==='/empty');if(path.startsWith('/form'))return '<div id="fixture-form"></div>';const Page=path==='/roster'?Roster:path==='/calendario'?Calendar:Home;return renderToString(await Page());}`);
writeFileSync(dir + '/browser.tsx', `import React from 'react';import {createRoot,hydrateRoot} from 'react-dom/client';import Hero from '${root}/components/NextGameHero.tsx';import GameForm from '${root}/components/GameForm.tsx';const hero=document.getElementById('fixture-hero');if(hero)hydrateRoot(hero,<Hero allGames={window.fixtureGames} teamLogo={${JSON.stringify(logo)}} teamName="Equipo de prueba" teamRecord="0-0"/>);const form=document.getElementById('fixture-form');if(form)createRoot(form).render(<GameForm initialData={window.initialData}/>);`);
const plugin = {
  name: 'isolated-common-fixtures',
  setup(b) {
    b.onResolve({ filter: /^next\/(link|navigation|image)$/ }, args => ({ path: dir + (args.path === 'next/image' ? '/image.tsx' : '/next.tsx') }));
    b.onResolve({ filter: /^@\// }, args => ({
      path: args.path === '@/utils/supabase/server' ? dir + '/supabase.ts'
        : args.path === '@/components/NextGameHero' ? dir + '/hero-server.tsx'
          : root + '/' + args.path.slice(2) + (args.path.includes('components/') ? '.tsx' : '.ts'),
    }));
  },
};
const options = { bundle: true, jsx: 'automatic', nodePaths: [root + '/node_modules'], plugins: [plugin], logLevel: 'silent' };
await build({ ...options, entryPoints: [dir + '/server.tsx'], platform: 'node', format: 'cjs', outfile: dir + '/server.cjs' });
await build({ ...options, entryPoints: [dir + '/browser.tsx'], platform: 'browser', outfile: dir + '/browser.js' });
const { render } = (await import(dir + '/server.cjs')).default;
const css = readdirSync(root + '/.next/static/chunks').filter(name => name.endsWith('.css')).map(name => readFileSync(root + '/.next/static/chunks/' + name, 'utf8')).join('\n');
const server = createServer(async (req, res) => {
  try {
    if (req.url === '/style.css') { res.setHeader('Content-Type', 'text/css'); return res.end(css); }
    if (req.url === '/browser.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end(readFileSync(dir + '/browser.js')); }
    const initialData = req.url === '/form-edit' ? { ...games[0], id: '123e4567-e89b-12d3-a456-426614174000', maps_url: 'https://maps.google.com/test', stream_url: 'https://youtube.com/watch?v=test' } : {};
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<!doctype html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><link rel="stylesheet" href="/style.css"/></head><body style="margin:0;font-family:Arial">' + await render(req.url) + '<script>window.fixtureGames=' + JSON.stringify(req.url === '/empty' ? [] : games) + ';window.initialData=' + JSON.stringify(initialData) + '</script><script src="/browser.js"></script></body></html>');
  } catch (error) { res.statusCode = 500; res.end(String(error)); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;
const results = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, timezoneId: 'America/Mexico_City' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Keep the browser fully isolated from all external image hosts.
    await page.route('**/*', route => route.request().url().startsWith(baseUrl) || route.request().url().startsWith('data:') ? route.continue() : route.abort());
    await page.goto(baseUrl + '/');
    const hero = page.locator('#fixture-hero');
    await hero.getByRole('heading', { name: 'Rival con fecha' }).waitFor();
    assert.equal(await hero.getByText('Días', { exact: true }).count(), 1);
    await hero.locator('button').last().click();
    await hero.getByRole('heading', { name: 'Rival TBD dos' }).waitFor();
    assert.ok((await hero.textContent()).includes('Por Definir'));
    assert.equal(await hero.getByText('Días', { exact: true }).count(), 0);
    await hero.locator('button').last().click();
    await hero.getByRole('heading', { name: 'Rival TBD diez' }).waitFor();
    await hero.locator('button').first().click();
    await hero.locator('button').first().click();
    await hero.getByRole('heading', { name: 'Rival con fecha' }).waitFor();
    assert.equal(await page.getByRole('table', { name: 'Tabla de posiciones' }).locator('th').count(), 7);
    const roster = page.getByRole('heading', { name: 'Roster', exact: true }).locator('../..');
    const preview = (await roster.innerText()).match(/#\d+/g);
    assert.deepEqual(preview, Array.from({ length: 10 }, (_, index) => '#' + (index + 1)));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.ok(!(await page.locator('body').innerText()).includes('2999'));
    await page.screenshot({ path: dir + '/home-' + width + '.png', fullPage: true });
    results.push({ width, route: '/', passed: true });
    for (const route of ['/roster', '/calendario', '/empty']) {
      await page.goto(baseUrl + route);
      if (route === '/roster') {
        const headings = await page.locator('h3').allTextContents();
        assert.equal(headings.length, 12);
        assert.deepEqual(await page.locator('h3').first().locator('span').allTextContents(), ['Jugador', 'Apellido 11']);
      } else if (route === '/calendario') {
        const text = await page.locator('main').textContent();
        assert.ok(text.includes('Por Definir') && !text.includes('2999'));
        assert.ok(text.indexOf('Semana 2') < text.indexOf('Semana 10'));
      } else {
        await page.getByText('No hay posiciones registradas.').waitFor();
        assert.equal(await page.locator('#fixture-hero').innerText(), '');
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      results.push({ width, route, passed: true });
    }
    for (const route of ['/form-new', '/form-edit']) {
      const requests = [];
      await page.route('**/api/games**', async interception => {
        requests.push({ method: interception.request().method(), body: interception.request().postDataJSON() });
        await interception.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      });
      await page.goto(baseUrl + route);
      const toggle = page.getByRole('checkbox');
      if (route === '/form-new') {
        await page.locator('[name="opponent_name"]').fill('Rival');
        await page.locator('[name="location"]').fill('Estadio');
        await toggle.check();
      } else assert.equal(await toggle.isChecked(), true);
      assert.equal(await page.locator('[name="game_date"]').isDisabled(), true);
      await page.getByRole('button', { name: 'Guardar Partido' }).click();
      await page.waitForFunction(() => window.savedPath === '/admin/games');
      assert.equal(requests[0].method, route === '/form-new' ? 'POST' : 'PUT');
      assert.equal(requests[0].body.game_date, '2999-01-01T00:00:00.000Z');
      if (route === '/form-edit') {
        assert.equal(requests[0].body.maps_url, 'https://maps.google.com/test');
        assert.equal(requests[0].body.stream_url, 'https://youtube.com/watch?v=test');
      }
      await page.evaluate(() => { window.savedPath = null; });
      await toggle.uncheck();
      assert.equal(await page.locator('[name="game_date"]').evaluate(input => input.required), true);
      assert.equal(await page.locator('form').evaluate(form => form.checkValidity()), false);
      await page.locator('[name="game_date"]').fill('2026-11-01T18:30');
      await page.getByRole('button', { name: 'Guardar Partido' }).click();
      await page.waitForFunction(() => window.savedPath === '/admin/games');
      assert.equal(requests[1].body.game_date, '2026-11-02T00:30:00.000Z');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.unroute('**/api/games**');
      results.push({ width, route, passed: true });
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  writeFileSync(dir + '/results.json', JSON.stringify(results, null, 2));
  console.log('Passed', results.length, 'common-function route/viewport checks, including carousel, roster, standings and TBD create/edit');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}

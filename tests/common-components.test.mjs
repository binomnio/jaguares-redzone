import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire, Module } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TBD_GAME_DATE } from '../utils/games.ts';

function component(name) {
  const filename = fileURLToPath(new URL(`../components/${name}.tsx`, import.meta.url));
  const require = createRequire(filename);
  const compiled = new Module(filename);
  compiled.filename = filename;
  compiled.paths = require.resolve.paths('react');
  compiled.require = specifier => specifier === '@/utils/games' ? require('../utils/games.ts') : require(specifier);
  compiled._compile(ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, filename);
  return compiled.exports.default;
}
const NextGameHero = component('NextGameHero');
const HomeStandings = component('HomeStandings');
const game = { id: 'tbd', opponent_name: 'Rival TBD', opponent_logo_url: 'https://bnsports.com.mx/logos/rival.png',
  game_date: TBD_GAME_DATE, location: 'Estadio', is_home: true, status: 'upcoming' };
const renderHero = games => renderToStaticMarkup(React.createElement(NextGameHero, {
  allGames: games, teamLogo: 'https://bnsports.com.mx/logos/equipo.png', teamName: 'Equipo',
}));

test('TBD carousel displays no sentinel year or countdown and still serves original logos', () => {
  const html = renderHero([game]);
  assert.ok(html.includes('Por Definir') && html.includes('TBD'));
  for (const unwanted of ['2999', 'Días', '>Hrs<', '/_next/image']) assert.ok(!html.includes(unwanted));
  assert.ok(html.includes('Rival TBD'));
  assert.ok(html.includes('group-hover:scale-105'));
  assert.equal(renderHero([]), '');
});

test('carousel initially displays confirmed future fixture instead of TBD', () => {
  const html = renderHero([game, { ...game, id: 'real', opponent_name: 'Rival Confirmado', game_date: '2099-01-01T18:00:00Z' }]);
  assert.ok(html.includes('Rival Confirmado'));
  assert.ok(!html.includes('Rival TBD'));
  assert.ok(html.includes('Días'));
});

test('shared standings renders Supabase values, highlights its team and handles empty data', () => {
  const standings = [{ id: 'fixture', position: 2, team_name: 'Equipo Propio', short_name: 'EP', logo_url: null,
    wins: 3, ties: 1, losses: 2, pf: 75, pc: 45 }];
  const html = renderToStaticMarkup(React.createElement(HomeStandings, { standings, teamName: 'Equipo Propio' }));
  assert.equal((html.match(/<th\b/g) ?? []).length, 7);
  assert.ok(html.includes('EP') && html.includes('75') && html.includes('45'));
  assert.ok(html.includes('bg-team-primary/5'));
  const empty = renderToStaticMarkup(React.createElement(HomeStandings, { standings: null, teamName: 'Equipo Propio' }));
  assert.ok(empty.includes('No hay posiciones registradas.'));
  assert.ok(empty.includes('colSpan="7"'));
});

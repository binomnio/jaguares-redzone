import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire, Module } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Render the real component and next/image without the global Next config.
const filename = fileURLToPath(new URL('../components/NextGameHero.tsx', import.meta.url));
const require = createRequire(filename);
const compiled = new Module(filename);
compiled.filename = filename;
compiled.require = specifier => specifier === '@/utils/games' ? require('../utils/games.ts') : require(specifier);
compiled.paths = require.resolve.paths('react');
compiled._compile(ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText, filename);
const NextGameHero = compiled.exports.default;

for (const is_home of [true, false]) {
  test(`carousel logos bypass optimization with default Next config (home=${is_home})`, () => {
    const teamLogo = 'https://bnsports.com.mx/logos/jaguares.png';
    const opponentLogo = 'https://bnsports.com.mx/logos/rival.png';
    const html = renderToStaticMarkup(React.createElement(NextGameHero, {
      teamLogo, teamName: 'Jaguares',
      allGames: [{ id: 'fixture', opponent_name: 'Rival', opponent_logo_url: opponentLogo,
        game_date: '2099-01-01T18:00:00Z', location: 'Estadio', is_home, status: 'upcoming' }],
    }));
    const images = html.match(/<img\b[^>]*>/g) ?? [];
    assert.equal(images.length, 2);
    assert.ok(images[0].includes(`src="${is_home ? teamLogo : opponentLogo}"`));
    assert.ok(images[1].includes(`src="${is_home ? opponentLogo : teamLogo}"`));
    assert.ok(!html.includes('/_next/image'));
    assert.ok(!html.includes('srcSet='));
    assert.ok(html.includes('group-hover:scale-105'));
    for (const image of images) {
      assert.ok(image.includes('object-contain drop-shadow-xl'));
      assert.ok(image.includes('position:absolute'));
      assert.ok(image.includes('loading="lazy"'));
    }
  });
}

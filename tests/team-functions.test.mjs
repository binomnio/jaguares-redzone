import test from 'node:test';
import assert from 'node:assert/strict';
import { TBD_GAME_DATE, isTbdDate, formatGameDate, sortGames, getInitialGameIndex } from '../utils/games.ts';
import { sortPlayers, getHomePlayers } from '../utils/roster.ts';
import { validatePayload } from '../utils/security.ts';

test('TBD is compatible with existing sentinel dates and Mexico time formatting', () => {
  for (const value of [TBD_GAME_DATE, '2998-12-31T18:00:00-06:00']) {
    assert.equal(isTbdDate(value), true);
    assert.deepEqual(formatGameDate(value), { date: 'Por Definir', time: 'TBD', isTBD: true });
  }
  assert.equal(isTbdDate('2026-10-18T00:00:00Z'), false);
  assert.equal(formatGameDate('2026-10-18T00:00:00Z').time, '18:00');
  assert.equal(formatGameDate('2026-10-18T00:00:00Z').isTBD, false);
  for (const value of [null, undefined, '', 'invalid']) {
    assert.equal(isTbdDate(value), false);
    assert.deepEqual(formatGameDate(value), { date: '', time: '', isTBD: false });
  }
});

test('games sort chronologically, then TBD by natural jornada order without changing input', () => {
  const games = [
    { id: 't10', game_date: TBD_GAME_DATE, jornada: 'Semana 10' },
    { id: 'later', game_date: '2026-11-02T00:00:00Z' },
    { id: 't2', game_date: TBD_GAME_DATE, jornada: 'Semana 2' },
    { id: 'earlier', game_date: '2026-10-18T00:00:00Z' },
  ];
  const original = structuredClone(games);
  assert.deepEqual(sortGames(games).map(game => game.id), ['earlier', 'later', 't2', 't10']);
  assert.deepEqual(games, original);
  assert.deepEqual(sortGames(null), []);
});

test('carousel selects a real future game before TBD and skips finalized future games', () => {
  const now = Date.parse('2026-10-18T00:00:00Z');
  const games = sortGames([
    { id: 'past', game_date: '2026-10-01T00:00:00Z', status: 'final' },
    { id: 'tbd', game_date: TBD_GAME_DATE, status: 'upcoming' },
    { id: 'final-future', game_date: '2026-10-19T00:00:00Z', status: 'final' },
    { id: 'real', game_date: '2026-10-20T00:00:00Z', status: 'upcoming' },
  ]);
  assert.equal(games[getInitialGameIndex(games, now)].id, 'real');
  const noReal = games.filter(game => game.id !== 'real');
  assert.equal(noReal[getInitialGameIndex(noReal, now)].id, 'tbd');
  assert.equal(getInitialGameIndex([], now), -1);
  assert.equal(getInitialGameIndex([{ game_date: '2026-10-01T00:00:00Z', status: 'final' }], now), 0);
});

test('roster sorts numerical jersey numbers and preserves stable surname ties without mutation', () => {
  const players = [
    { id: 'ten', jersey_number: '10' }, { id: 'two-a', jersey_number: '02' },
    { id: 'zero', jersey_number: '0' }, { id: 'two-b', jersey_number: '2' },
    { id: 'blank', jersey_number: '' }, { id: 'text', jersey_number: 'STAFF' },
    { id: 'null', jersey_number: null },
  ];
  const original = structuredClone(players);
  assert.deepEqual(sortPlayers(players).map(player => player.id), ['zero', 'two-a', 'two-b', 'ten', 'blank', 'text', 'null']);
  assert.deepEqual(players, original);
  assert.deepEqual(sortPlayers(undefined), []);
});

test('every homepage uses ten numerical roster previews and four featured players', () => {
  const players = Array.from({ length: 12 }, (_, index) => ({
    id: String(12 - index), jersey_number: String(12 - index), is_featured: index % 2 === 0,
  }));
  const original = structuredClone(players);
  const { rosterPreview, featuredPlayers } = getHomePlayers(players);
  assert.deepEqual(rosterPreview.map(player => player.jersey_number), ['1','2','3','4','5','6','7','8','9','10']);
  assert.deepEqual(featuredPlayers.map(player => player.jersey_number), ['2','4','6','8']);
  assert.deepEqual(players, original);
  assert.deepEqual(getHomePlayers(null), { rosterPreview: [], featuredPlayers: [] });
});

test('existing game API validation accepts the TBD sentinel without weakening required fields', () => {
  const body = { opponent_name: 'Rival', game_date: TBD_GAME_DATE };
  assert.deepEqual(validatePayload('games', body), body);
  assert.throws(() => validatePayload('games', { ...body, opponent_name: '' }));
  assert.throws(() => validatePayload('games', { ...body, game_date: '' }));
});

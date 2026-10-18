import test from 'node:test';
import assert from 'node:assert/strict';
import { isAdmin, requireAdmin, safeColor, validatePayload, validateId, mutate } from '../utils/security.ts';

const id = '123e4567-e89b-12d3-a456-426614174000';
const game = {
  opponent_name: 'Rival', game_date: '2026-11-01T18:00:00.000Z', is_home: true, status: 'upcoming',
  our_score: 0, opponent_score: 0, jornada: 'Semana 1', maps_url: 'https://maps.google.com/test', stream_url: 'https://youtube.com/watch?v=test',
};
const bodies = {
  games: game,
  players: { first_name: 'Nombre', last_name: 'Apellido', jersey_number: '10', position: 'QB', active: true, is_featured: false },
  standings: { position: 1, team_name: 'Equipo', wins: 0, losses: 0, ties: 0, dif: -5 },
};
function client(user = { app_metadata: { role: 'admin' } }, options = {}) {
  const calls = [];
  const query = {
    insert(value) { calls.push(['insert', value]); return this; },
    update(value) { calls.push(['update', value]); return this; },
    eq(key, value) { calls.push(['eq', key, value]); return this; },
    async select() { return { data: options.data ?? [{ id }], error: options.error ?? null }; },
  };
  return {
    calls,
    auth: { async getUser() { return { data: { user }, error: options.authError ?? null }; } },
    from(table) { calls.push(['table', table]); return query; },
  };
}
const request = body => new Request('https://example.com/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('players can be created and edited without a position while other validation remains enforced', async () => {
  for (const editing of [false, true]) {
    for (const position of [undefined, null, '', 'QB']) {
      const body = { ...bodies.players };
      if (position === undefined) delete body.position;
      else body.position = position;
      const db = client();
      const response = await mutate(request(body), db, 'players', editing ? id : undefined);
      assert.equal(response.status, 200);
      const saved = db.calls.find(c => c[0] === (editing ? 'update' : 'insert'))[1];
      assert.deepEqual(editing ? saved : saved[0], body);
    }
  }
  for (const position of [123, 'x'.repeat(51)]) {
    assert.throws(() => validatePayload('players', { ...bodies.players, position }));
  }
  for (const key of ['first_name', 'last_name', 'jersey_number']) {
    assert.throws(() => validatePayload('players', { ...bodies.players, position: null, [key]: '' }));
  }
});

test('only server-controlled admin metadata grants access', async () => {
  assert.equal(isAdmin(null), false);
  assert.equal(isAdmin({ user_metadata: { role: 'admin' } }), false);
  assert.equal(isAdmin({ app_metadata: { role: 'staff' } }), false);
  await assert.rejects(requireAdmin(client(null)), e => e.status === 401);
  await assert.rejects(requireAdmin(client({ app_metadata: { role: 'user' } })), e => e.status === 403);
  await assert.rejects(requireAdmin(client({ app_metadata: { role: 'admin' } }, { authError: new Error('expired') })), e => e.status === 401);
});

for (const table of Object.keys(bodies)) {
  for (const editing of [false, true]) {
    test(`${table} ${editing ? 'update' : 'create'} rejects unauthenticated and non-admin users without database writes`, async () => {
      for (const [user, status] of [[null, 401], [{ app_metadata: { role: 'user' } }, 403]]) {
        const db = client(user);
        const response = await mutate(request(bodies[table]), db, table, editing ? id : undefined);
        assert.equal(response.status, status);
        assert.deepEqual(db.calls, []);
      }
    });
    test(`${table} ${editing ? 'update' : 'create'} permits verified admin and preserves fields`, async () => {
      const db = client();
      const response = await mutate(request(bodies[table]), db, table, editing ? id : undefined);
      assert.equal(response.status, 200);
      const saved = db.calls.find(c => c[0] === (editing ? 'update' : 'insert'))[1];
      assert.deepEqual(editing ? saved : saved[0], bodies[table]);
      if (editing) assert.deepEqual(db.calls.find(c => c[0] === 'eq'), ['eq', 'id', id]);
    });
  }
}

test('rejects invalid fields, numbers, dates, booleans, IDs and URL schemes', () => {
  for (const patch of [
    { opponent_name: '' }, { opponent_name: 'x'.repeat(201) }, { status: 'other' },
    { game_date: 'not-a-date' }, { game_date: '2026-02-30T18:00:00Z' }, { game_date: '2026-11-01T18:00:00' }, { our_score: -1 },
    { our_score: 1.5 }, { is_home: 'true' }, { stream_url: 'javascript:alert(1)' },
    { maps_url: 'https://user:password@example.com' }, { unexpected: 'field' },
    { opponent_logo_url: 'https://untrusted.example/logo.png' },
  ]) assert.throws(() => validatePayload('games', { ...game, ...patch }));
  for (const body of [null, [], 'text']) assert.throws(() => validatePayload('games', body));
  assert.throws(() => validateId('not-a-uuid'));
  assert.equal(validateId(id), id);
  assert.equal(validatePayload('games', { ...game, opponent_logo_url: '' }).opponent_logo_url, '');
});

test('malformed JSON and invalid updates fail before database writes', async () => {
  const db = client();
  const malformed = new Request('https://example.com/api', { method: 'POST', body: '{' });
  assert.equal((await mutate(malformed, db, 'games')).status, 400);
  assert.equal((await mutate(request(game), db, 'games', 'invalid')).status, 400);
  assert.equal((await mutate(request({ ...game, our_score: -2 }), db, 'games')).status, 400);
  assert.deepEqual(db.calls, []);
});

test('database failures do not expose internal details; missing updates return 404', async () => {
  const response = await mutate(request(game), client(undefined, { error: { message: 'sensitive database detail' } }), 'games');
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: 'Error interno' });
  assert.equal((await mutate(request(game), client(undefined, { data: [] }), 'games', id)).status, 404);
});

test('theme validation blocks CSS and HTML injection, including legacy database values', () => {
  assert.equal(safeColor('#Ab12Ef', '#111827'), '#Ab12Ef');
  for (const value of ['red; background:url(https://evil.example)', '</style><script>alert(1)</script>', null, '#fff']) {
    assert.equal(safeColor(value, '#111827'), '#111827');
    assert.throws(() => validatePayload('team_settings', { team_name: 'Equipo', primary_color: value }));
  }
  assert.deepEqual(validatePayload('team_settings', { team_name: 'Equipo', primary_color: '#dc2626' }), { team_name: 'Equipo', primary_color: '#dc2626' });
});

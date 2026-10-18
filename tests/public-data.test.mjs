import test from 'node:test';
import assert from 'node:assert/strict';
import { loadHomeData, GAME_FIELDS, PLAYER_FIELDS, STANDING_FIELDS } from '../utils/public-data.ts';

test('home reads start concurrently and preserve filters/order without the unused game query', async () => {
  const started = [], operations = [], finish = [];
  const client = {
    from(table) {
      const query = {
        select(fields) { operations.push([table, 'select', fields]); return this; },
        limit(count) { operations.push([table, 'limit', count]); return this; },
        maybeSingle() { operations.push([table, 'maybeSingle']); return this; },
        order(field, options) { operations.push([table, 'order', field, options]); return this; },
        eq(field, value) { operations.push([table, 'eq', field, value]); return this; },
        then(resolve) {
          started.push(table);
          return new Promise(done => finish.push(() => done({ data: [{ table }], error: null }))).then(resolve);
        },
      };
      return query;
    },
  };
  const loading = loadHomeData(client);
  await Promise.resolve();
  assert.deepEqual(started, ['team_settings', 'games', 'standings', 'players']);
  assert.deepEqual(operations.filter(x => x[1] === 'eq'), [['players', 'eq', 'active', true]]);
  assert.deepEqual(operations.filter(x => x[1] === 'order'), [
    ['games', 'order', 'game_date', { ascending: true }],
    ['standings', 'order', 'position', { ascending: true }],
    ['players', 'order', 'last_name', { ascending: true }],
  ]);
  finish.forEach(done => done());
  assert.deepEqual((await loading).map(x => x.data[0].table), started);
  for (const field of ['jornada', 'maps_url', 'stream_url', 'our_score', 'opponent_score']) assert.ok(GAME_FIELDS.split(',').includes(field));
  assert.ok(PLAYER_FIELDS.split(',').includes('is_featured'));
  assert.ok(STANDING_FIELDS.split(',').includes('stk'));
  for (const fields of [GAME_FIELDS, PLAYER_FIELDS, STANDING_FIELDS]) assert.ok(!fields.includes('created_at') && !fields.includes('*'));
});

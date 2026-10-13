import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const tables = ['team_settings', 'games', 'standings', 'players'];

test('migration is repeatable and restricts writes despite existing permissive policies', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      CREATE ROLE authenticated;
      CREATE SCHEMA auth;
      CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS
      $$ SELECT current_setting('request.jwt.claims', true)::jsonb $$;
      GRANT USAGE ON SCHEMA public, auth TO authenticated;
      GRANT EXECUTE ON FUNCTION auth.jwt() TO authenticated;
    `);
    for (const table of tables) {
      await db.exec(`
        CREATE TABLE public.${table} (id integer PRIMARY KEY, value text);
        INSERT INTO public.${table} VALUES (1, 'original');
        ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.${table} TO authenticated;
        CREATE POLICY public_read ON public.${table} FOR SELECT USING (true);
        CREATE POLICY broad_write ON public.${table} FOR ALL TO authenticated USING (true) WITH CHECK (true);
      `);
    }
    const migration = await readFile(new URL('../supabase/migrations/20261013_admin_write_policies.sql', import.meta.url), 'utf8');
    await db.exec(migration);
    await db.exec(migration);
    await db.exec('SET ROLE authenticated');
    for (const metadata of [{}, { app_metadata: { role: 'user' } }, { user_metadata: { role: 'admin' } }]) {
      await db.query("SELECT set_config('request.jwt.claims', $1, false)", [JSON.stringify(metadata)]);
      for (const table of tables) {
        assert.equal((await db.query(`SELECT * FROM public.${table}`)).rows.length, 1, 'public reads remain available');
        await assert.rejects(db.query(`INSERT INTO public.${table} VALUES (2, 'forbidden')`), /row-level security/);
        assert.equal((await db.query(`UPDATE public.${table} SET value = 'forbidden' RETURNING id`)).rows.length, 0);
        assert.equal((await db.query(`DELETE FROM public.${table} RETURNING id`)).rows.length, 0);
      }
    }
    await db.query("SELECT set_config('request.jwt.claims', $1, false)", [JSON.stringify({ app_metadata: { role: 'admin' } })]);
    for (const table of tables) {
      await db.query(`INSERT INTO public.${table} VALUES (2, 'allowed')`);
      assert.equal((await db.query(`UPDATE public.${table} SET value = 'allowed' RETURNING id`)).rows.length, 2);
      assert.equal((await db.query(`DELETE FROM public.${table} WHERE id = 2 RETURNING id`)).rows.length, 1);
      assert.equal((await db.query(`SELECT value FROM public.${table} WHERE id = 1`)).rows[0].value, 'allowed');
    }
  } finally {
    await db.close();
  }
});

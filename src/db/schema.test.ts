import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * Runs supabase/migrations/0001_init.sql in a real Postgres (PGlite) with the pieces Supabase provides:
 * the anon, authenticated and service_role roles, the auth.users table, auth.uid(), and the default grants
 * Supabase gives new tables. This proves the tables, constraints, row level security and the delete
 * function behave as designed. It is not a test of a real Supabase project. Run `npm run check:backend`
 * for that once a project exists.
 */
const A = '11111111-1111-1111-1111-111111111111';
const B = '22222222-2222-2222-2222-222222222222';

let db: PGlite;
const as = async (role: 'anon' | 'authenticated', uid?: string) => {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid ?? '']);
  await db.exec(`set role ${role}`);
};
const failsWith = async (sql: string, params: unknown[] = []) => {
  try { await db.query(sql, params); return null; } catch (e) { return (e as Error).message; }
};
const row = (uid: string, date: string, extra: Record<string, unknown> = {}) => ({ uid, date, phase: 'pregnancy', answers: JSON.stringify({ q_fits: 'no' }), tier: 'GREEN', ...extra });
const insert = (r: ReturnType<typeof row>) => db.query(
  'insert into public.checkins (user_id, entry_date, phase, answers, tier, rules_version) values ($1, $2, $3, $4::jsonb, $5, $6)',
  [r.uid, r.date, r.phase, r.answers, r.tier, '0.1-draft'],
);

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key default gen_random_uuid(), email text, phone text);
    create function auth.uid() returns uuid language sql stable as $$
      select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''), (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'))::uuid
    $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    grant select, delete on auth.users to postgres;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
  `);
  await db.exec(fs.readFileSync('supabase/migrations/0001_init.sql', 'utf8'));
  await db.query('insert into auth.users (id, email) values ($1, $2), ($3, $4)', [A, 'a@example.test', B, 'b@example.test']);
});
afterAll(async () => { await db.close(); });

describe('tables and constraints', () => {
  it('stores no name, email or phone number in our own tables', async () => {
    await db.exec('reset role');
    const cols = (await db.query<{ column_name: string }>("select column_name from information_schema.columns where table_schema = 'public' and table_name in ('checkins', 'profiles')")).rows.map((r) => r.column_name);
    expect(cols.length).toBeGreaterThan(5);
    for (const c of cols) expect(c).not.toMatch(/name|email|phone|mobile|address/i);
  });

  it('rejects an unknown phase, an unknown tier and a note over 1000 characters', async () => {
    await as('authenticated', A);
    expect(await failsWith('insert into public.checkins (user_id, entry_date, phase) values ($1, $2, $3)', [A, '2030-01-01', 'sideways'])).toMatch(/check constraint/);
    expect(await failsWith('insert into public.checkins (user_id, entry_date, phase, tier) values ($1, $2, $3, $4)', [A, '2030-01-02', 'pregnancy', 'PURPLE'])).toMatch(/check constraint/);
    expect(await failsWith('insert into public.checkins (user_id, entry_date, phase, note) values ($1, $2, $3, $4)', [A, '2030-01-03', 'pregnancy', 'x'.repeat(1001)])).toMatch(/check constraint/);
  });

  it('keeps one entry per person per day, and a repeat save replaces it (the app uses an upsert)', async () => {
    await as('authenticated', A);
    await insert(row(A, '2030-02-01'));
    expect(await failsWith('insert into public.checkins (user_id, entry_date, phase) values ($1, $2, $3)', [A, '2030-02-01', 'pregnancy'])).toMatch(/unique|duplicate/i);
    await db.query(
      `insert into public.checkins (user_id, entry_date, phase, tier) values ($1, $2, 'pregnancy', 'RED')
       on conflict (user_id, entry_date) do update set tier = excluded.tier`, [A, '2030-02-01']);
    const r = await db.query<{ tier: string }>('select tier from public.checkins where entry_date = $1', ['2030-02-01']);
    expect(r.rows).toEqual([{ tier: 'RED' }]);
  });
});

describe('row level security: each person sees only her own rows', () => {
  it('an anonymous visitor reads nothing and writes nothing', async () => {
    await as('authenticated', A);
    await insert(row(A, '2030-03-01'));
    await as('anon');
    expect((await db.query('select * from public.checkins')).rows).toEqual([]);
    expect((await db.query('select * from public.profiles')).rows).toEqual([]);
    expect(await failsWith('insert into public.checkins (user_id, entry_date, phase) values ($1, $2, $3)', [A, '2030-03-02', 'pregnancy'])).toMatch(/row-level security|permission denied/);
  });

  it('user B cannot read, change, delete or forge user A\'s entries', async () => {
    await as('authenticated', B);
    expect((await db.query('select * from public.checkins where user_id = $1', [A])).rows).toEqual([]);
    expect((await db.query("update public.checkins set tier = 'GREEN' where user_id = $1 returning id", [A])).rows).toEqual([]);
    expect((await db.query('delete from public.checkins where user_id = $1 returning id', [A])).rows).toEqual([]);
    expect(await failsWith('insert into public.checkins (user_id, entry_date, phase) values ($1, $2, $3)', [A, '2030-03-09', 'pregnancy'])).toMatch(/row-level security/);
    await as('authenticated', A);
    expect((await db.query('select * from public.checkins')).rows.length).toBeGreaterThan(0);
  });

  it('a person cannot hand an entry to someone else by editing user_id', async () => {
    await as('authenticated', A);
    expect(await failsWith('update public.checkins set user_id = $1 where user_id = $2', [B, A])).toMatch(/row-level security/);
  });

  it('profiles follow the same rule', async () => {
    await as('authenticated', A);
    await db.query("insert into public.profiles (user_id, stage, language) values ($1, 'pregnant', 'hi')", [A]);
    expect((await db.query('select * from public.profiles')).rows.length).toBe(1);
    await as('authenticated', B);
    expect((await db.query('select * from public.profiles')).rows).toEqual([]);
    expect(await failsWith("insert into public.profiles (user_id, stage) values ($1, 'pregnant')", [A])).toMatch(/row-level security/);
  });
});

describe('deleting an account', () => {
  it('is closed to anonymous visitors', async () => {
    await as('anon');
    expect(await failsWith('select public.delete_my_account()')).toMatch(/permission denied/);
  });

  it('removes only the caller\'s sign-in, entries and profile', async () => {
    await as('authenticated', B);
    await insert(row(B, '2030-04-01'));
    await db.query("insert into public.profiles (user_id, stage) values ($1, 'after_birth')", [B]);
    await db.query('select public.delete_my_account()');
    await db.exec('reset role');
    const users = (await db.query<{ id: string }>('select id from auth.users')).rows.map((r) => r.id);
    expect(users).toEqual([A]);
    expect((await db.query('select * from public.checkins where user_id = $1', [B])).rows).toEqual([]);
    expect((await db.query('select * from public.profiles where user_id = $1', [B])).rows).toEqual([]);
    expect((await db.query('select * from public.checkins where user_id = $1', [A])).rows.length).toBeGreaterThan(0);
  });

  it('does nothing for a caller who is not signed in', async () => {
    await as('authenticated', undefined);
    await db.query('select public.delete_my_account()');
    await db.exec('reset role');
    expect((await db.query('select id from auth.users')).rows.length).toBe(1);
  });
});

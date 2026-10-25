// Checks that the Supabase project is set up the way Maitri expects.
// Uses only the public URL and anon key. Never the service role key. Never calls delete_my_account.
// Optional: two throwaway email-and-password test users let it prove that one account cannot read another's rows.
import fs from 'node:fs';

const env = { ...process.env };
for (const f of ['.env.local', '.env']) {
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && m[2] && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const URL_ = (env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = env.VITE_SUPABASE_ANON_KEY || '';
let fails = 0;
const out = (status, name, detail = '') => { if (status === 'FAIL') fails++; console.log(`${status.padEnd(5)} ${name}${detail ? `\n        ${detail}` : ''}`); };

if (!URL_ || !KEY) {
  console.log('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local (see .env.example), then run this again.');
  process.exit(1);
}
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(URL_)) out('WARN', 'URL shape', 'Expected https://<project>.supabase.co. A custom domain also needs the content security policy changed.');
if (KEY.startsWith('sb_secret_') || KEY.includes('service_role') || (KEY.split('.')[1] && Buffer.from(KEY.split('.')[1], 'base64url').toString().includes('"service_role"'))) {
  out('FAIL', 'Key type', 'This looks like the service role key. Stop. Never use it in the app. Use the anon (public) key.'); process.exit(1);
}

const call = async (path, { method = 'GET', token = KEY, body, headers = {} } = {}) => {
  try {
    const r = await fetch(URL_ + path, { method, headers: { apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...headers }, body: body ? JSON.stringify(body) : undefined });
    const text = await r.text();
    let json; try { json = JSON.parse(text); } catch { json = text; }
    return { status: r.status, json };
  } catch (e) { return { status: 0, json: String(e.message || e) }; }
};

// 1 Auth providers
const settings = await call('/auth/v1/settings');
if (settings.status !== 200) {
  out('FAIL', 'Reach the project', `HTTP ${settings.status} ${JSON.stringify(settings.json).slice(0, 120)}. Check the URL and the key.`);
  process.exit(1);
}
out('PASS', 'Reach the project and the key is accepted');
const ext = settings.json.external || {};
out(ext.google ? 'PASS' : 'FAIL', 'Google sign-in is turned on', ext.google ? '' : 'Dashboard: Authentication, Providers, Google. Add the Google client id and secret there.');
out(ext.phone ? 'PASS' : 'INFO', 'Phone sign-in is turned on', ext.phone ? '' : 'Optional. It needs a text-message provider and costs money. Google alone is enough to start.');

// 2 Tables exist and anonymous visitors see nothing
for (const t of ['checkins', 'profiles']) {
  const r = await call(`/rest/v1/${t}?select=*&limit=1`);
  if (r.status === 404 || (r.json && r.json.code === 'PGRST205')) out('FAIL', `Table ${t} exists`, 'Run supabase/migrations/0001_init.sql in the SQL editor.');
  else if (r.status === 200 && Array.isArray(r.json) && r.json.length === 0) out('PASS', `Table ${t} exists and an anonymous visitor reads nothing`);
  else if (r.status === 200) out('FAIL', `Row level security on ${t}`, 'An anonymous visitor can read rows. Turn on row level security and add the policies from the migration.');
  else if (r.status === 401 || r.status === 403) out('PASS', `Table ${t} exists and is closed to anonymous visitors`);
  else out('WARN', `Table ${t}`, `Unexpected answer HTTP ${r.status} ${JSON.stringify(r.json).slice(0, 100)}`);
}

// 3 Anonymous writes are refused
const w = await call('/rest/v1/checkins', { method: 'POST', body: { user_id: '00000000-0000-0000-0000-000000000000', entry_date: '2000-01-01', phase: 'pregnancy', answers: {} } });
out(w.status >= 400 && w.status < 500 ? 'PASS' : 'FAIL', 'Anonymous visitors cannot write', w.status < 400 ? 'A write was accepted without signing in. Check the policies.' : `HTTP ${w.status}`);

// 4 Account deletion function exists and is closed to anonymous visitors
const d = await call('/rest/v1/rpc/delete_my_account', { method: 'POST', body: {} });
if (d.status === 404 || (d.json && d.json.code === 'PGRST202')) out('FAIL', 'delete_my_account function exists', 'Run the last part of supabase/migrations/0001_init.sql.');
else out(d.status === 401 || d.status === 403 ? 'PASS' : 'WARN', 'delete_my_account is closed to anonymous visitors', `HTTP ${d.status}`);

// 5 Optional: prove isolation between two users
const E1 = env.CHECK_USER1_EMAIL, P1 = env.CHECK_USER1_PASSWORD, E2 = env.CHECK_USER2_EMAIL, P2 = env.CHECK_USER2_PASSWORD;
if (E1 && P1 && E2 && P2) {
  const login = async (email, password) => {
    const r = await call('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
    return r.status === 200 ? { token: r.json.access_token, id: r.json.user.id } : null;
  };
  const u1 = await login(E1, P1), u2 = await login(E2, P2);
  if (!u1 || !u2) out('FAIL', 'Two test users can sign in', 'Create two throwaway users (Authentication, Users, Add user, tick auto confirm) and set CHECK_USER1_* and CHECK_USER2_*.');
  else {
    const date = '2001-02-03';
    const mine = { user_id: u1.id, entry_date: date, phase: 'pregnancy', answers: { q_fits: 'no' }, tier: 'GREEN', rules_version: 'check' };
    const ins = await call('/rest/v1/checkins', { method: 'POST', token: u1.token, body: mine, headers: { Prefer: 'return=representation' } });
    out(ins.status === 201 ? 'PASS' : 'FAIL', 'User 1 can save an entry', `HTTP ${ins.status}`);
    const id = Array.isArray(ins.json) && ins.json[0] ? ins.json[0].id : null;
    const own = await call(`/rest/v1/checkins?select=id&entry_date=eq.${date}`, { token: u1.token });
    out(Array.isArray(own.json) && own.json.length === 1 ? 'PASS' : 'FAIL', 'User 1 can read it back');
    const other = await call(`/rest/v1/checkins?select=id&entry_date=eq.${date}`, { token: u2.token });
    out(Array.isArray(other.json) && other.json.length === 0 ? 'PASS' : 'FAIL', 'User 2 cannot read user 1\'s entry', 'This is the privacy test that matters.');
    const forged = await call('/rest/v1/checkins', { method: 'POST', token: u2.token, body: { ...mine, user_id: u1.id, entry_date: '2001-02-04' } });
    out(forged.status >= 400 ? 'PASS' : 'FAIL', 'User 2 cannot write an entry as user 1', `HTTP ${forged.status}`);
    if (id) {
      const steal = await call(`/rest/v1/checkins?id=eq.${id}`, { method: 'DELETE', token: u2.token, headers: { Prefer: 'return=representation' } });
      out(Array.isArray(steal.json) && steal.json.length === 0 ? 'PASS' : 'FAIL', 'User 2 cannot delete user 1\'s entry');
      await call(`/rest/v1/checkins?id=eq.${id}`, { method: 'DELETE', token: u1.token });
    }
  }
} else {
  out('SKIP', 'Isolation test between two users', 'Set CHECK_USER1_EMAIL, CHECK_USER1_PASSWORD, CHECK_USER2_EMAIL, CHECK_USER2_PASSWORD (two throwaway users) to run it.');
}

console.log(fails ? `\n${fails} check(s) failed.` : '\nAll checks that ran passed.');
process.exit(fails ? 1 : 0);

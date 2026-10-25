// supabase/functions/speech-to-text/index.ts
// Receives a short audio recording and returns text, using Groq's hosted Whisper.
// The Groq key lives only in a Supabase secret. Audio and text are not logged or stored.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MODEL = 'whisper-large-v3';
const MAX_BYTES = 2_000_000; // about 60 seconds of compressed audio
const MAX_PER_MINUTE = 8;    // per visitor, best effort

const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_MINUTE;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const key = Deno.env.get('GROQ_API_KEY');
  if (!key) return json({ error: 'not-configured' }, 500);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (limited(ip)) return json({ error: 'rate-limit' }, 429);

  const lang = new URL(req.url).searchParams.get('lang') === 'en' ? 'en' : 'hi';
  const type = (req.headers.get('content-type') ?? 'audio/webm').split(';')[0];
  const buf = await req.arrayBuffer();
  if (buf.byteLength < 1000 || buf.byteLength > MAX_BYTES) return json({ error: 'bad-audio' }, 400);

  const ext = type.includes('mp4') ? 'mp4' : type.includes('ogg') ? 'ogg' : type.includes('wav') ? 'wav' : 'webm';
  const form = new FormData();
  form.append('file', new Blob([buf], { type }), `clip.${ext}`);
  form.append('model', MODEL);
  form.append('language', lang);
  form.append('response_format', 'json');
  form.append('temperature', '0');

  try {
    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
    if (!res.ok) return json({ error: 'asr-failed', status: res.status }, 502);
    const out = await res.json();
    return json({ text: String(out?.text ?? '') });
  } catch {
    return json({ error: 'network' }, 502);
  }
});
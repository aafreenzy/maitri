// Builds the audio clip manifest from the data files. Default is a dry run.
// `--run` calls the provider function below and writes public/audio/{lang}/{id}.mp3.
// The key is read from the environment only and is never printed or written.
import fs from 'node:fs';
import path from 'node:path';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const config = read('src/data/config.json');
const qdata = read('src/data/questions.json');
const dict = { en: read('src/data/i18n/en.json'), hi: read('src/data/i18n/hi.json') };

const DIGITS = {
  hi: ['शून्य', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ'],
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
};
const spoken = (lang, num) => [...num].map((c) => DIGITS[lang][Number(c)] ?? c).join(' ');
const num = (key) => config.numbers[key].number;

const withNumber = (lang, text, key) => (key ? text.split('{number}').join(spoken(lang, num(key))) : text);

const newborn = config.feature_flags.newborn_module;
const questions = qdata.questions.filter((q) => q.module === 'core' || newborn);

function clips(lang) {
  const d = dict[lang];
  const out = [];
  const add = (id, text) => out.push({ id, lang, text, chars: [...text].length });
  for (const q of questions) add(q.id, q[lang]);
  for (const s of qdata.stages) add(s.audio_id, s[lang]);
  add('stage_title', d['stage.title']);
  add('lang_title', d['lang.title']);
  add('mode_title', d['mode.title']);
  for (const m of ['woman', 'asha', 'family']) add(`intro_${m}`, d[`question.intro_${m}`]);
  for (const tier of ['RED', 'AMBER']) {
    add(`result_${tier}`, `${d[`result.${tier}.title`]}. ${withNumber(lang, d[`result.${tier}.body`], 'ambulance_primary')}`);
    add(`result_${tier}_family`, `${d[`result.${tier}.title_family`]}. ${withNumber(lang, d[`result.${tier}.body`], 'ambulance_primary')}`);
  }
  add('result_GREEN', `${d['result.GREEN.title']}. ${d['result.GREEN.body']}`);
  for (let i = 1; i <= 4; i++) add(`plan_step${i}`, withNumber(lang, d[`plan.step${i}`], 'ambulance_primary'));
  add('wellbeing_body', d['wellbeing.body']);
  return out;
}

const manifest = [...clips('hi'), ...clips('en')];

/** Provider hook. Replace the body to switch voice vendor. Must return mp3 bytes. */
async function synthesize(_clip) {
  throw new Error('No voice provider is configured yet. Choose one (docs/implementation.md section 20.3), read its current docs, then implement synthesize() here.');
}

const args = new Set(process.argv.slice(2));
fs.mkdirSync('audio', { recursive: true });
fs.writeFileSync('audio/manifest.json', JSON.stringify(manifest, null, 2) + '\n');

if (args.has('--check')) {
  let missing = 0, bytes = 0;
  for (const c of manifest) {
    const f = path.join('public/audio', c.lang, `${c.id}.mp3`);
    if (!fs.existsSync(f) || fs.statSync(f).size === 0) { missing++; console.log(`missing  ${c.lang}/${c.id}`); } else bytes += fs.statSync(f).size;
  }
  console.log(`${manifest.length - missing} of ${manifest.length} clips present, ${(bytes / 1048576).toFixed(2)} MB`);
  process.exit(missing ? 1 : 0);
}

if (args.has('--run')) {
  for (const c of manifest) {
    const f = path.join('public/audio', c.lang, `${c.id}.mp3`);
    if (fs.existsSync(f)) continue;
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, await synthesize(c));
    console.log(`wrote ${c.lang}/${c.id}`);
  }
} else {
  for (const lang of ['hi', 'en']) {
    const m = manifest.filter((c) => c.lang === lang);
    const chars = m.reduce((n, c) => n + c.chars, 0);
    console.log(`${lang}: ${m.length} clips, ${chars} characters, about INR ${((chars / 10000) * 30).toFixed(2)} at INR 30 per 10,000 (Sarvam Bulbul v3 list price; check current pricing)`);
  }
}

const rows = manifest.map((c) => `| ${c.lang} | ${c.id} | ${c.text.replace(/\|/g, '/')} |  |  |`).join('\n');
fs.writeFileSync('audio/REVIEW.md', `# Audio review checklist\n\nA native speaker listens to every clip and writes initials. Nothing here is marked reviewed by the tool.\n\n| Lang | Clip | Text | Reviewer initials | Notes |\n|---|---|---|---|---|\n${rows}\n`);

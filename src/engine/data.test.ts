import fs from 'node:fs';
import path from 'node:path';
import en from '../data/i18n/en.json';
import hi from '../data/i18n/hi.json';
import { data } from './loadData';

const stageIds = data.stages.map((s) => s.id);

describe('data integrity', () => {
  it('rules reference existing questions, sources and stages', () => {
    const qids = new Set(data.questions.map((q) => q.id));
    for (const r of data.rules) {
      const used = [r.question_id, ...(r.question_ids ?? []), ...(r.among ?? [])].filter(Boolean) as string[];
      for (const id of used) expect(qids.has(id), `${r.id} -> ${id}`).toBe(true);
      for (const s of r.source_refs) expect(data.sources[s], `${r.id} -> ${s}`).toBeDefined();
      for (const s of r.stages) expect(stageIds).toContain(s);
      for (const t of Object.values(r.tier_if)) expect(['GREEN', 'AMBER', 'RED']).toContain(t);
    }
  });
  it('every question is used by a rule', () => {
    const used = new Set<string>();
    for (const r of data.rules) [r.question_id, ...(r.question_ids ?? []), ...(r.among ?? [])].forEach((x) => x && used.add(x));
    for (const q of data.questions) expect(used.has(q.id), q.id).toBe(true);
  });
  it('questions have all four text fields', () => {
    for (const q of data.questions) for (const k of ['en', 'hi', 'short_en', 'short_hi'] as const) expect(q[k].trim()).not.toBe('');
  });
  it('en and hi have identical keys', () => {
    expect(Object.keys(hi).sort()).toEqual(Object.keys(en).sort());
  });
  it('no helpline literal in ui, lib or state', () => {
    const re = /(?<![\w.#-])(108|102|112|104|14416|181)(?![\w.%-])/;
    const walk = (d: string): string[] =>
      fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(d, e.name);
        return e.isDirectory() ? walk(p) : /\.(tsx?|css)$/.test(e.name) && !/\.test\./.test(e.name) ? [p] : [];
      });
    const root = path.resolve(__dirname, '..');
    for (const dir of ['ui', 'lib', 'state']) {
      const full = path.join(root, dir);
      if (!fs.existsSync(full)) continue;
      for (const f of walk(full)) expect(re.test(fs.readFileSync(f, 'utf8')), f).toBe(false);
    }
  });
});

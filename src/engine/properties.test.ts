import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { evaluate } from './evaluate';
import { applicableQuestions, data } from './loadData';
import type { Answer, StageId, Tier } from './types';

const STAGES: StageId[] = ['pregnant', 'labour', 'after_birth'];
const RANK: Record<Tier, number> = { GREEN: 1, AMBER: 2, RED: 3 };
const ORDER: Answer[] = ['no', 'not_sure', 'yes'];
const ids = (s: StageId) => applicableQuestions(s).map((q) => q.id);

// Small seeded generator so a failure can be reproduced.
function rng(seed: number) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 2 ** 32; }; }
const randomAnswers = (stage: StageId, r: () => number): Record<string, Answer> =>
  Object.fromEntries(ids(stage).map((id) => [id, ORDER[Math.floor(r() * 3)]!]));
const tierOf = (stage: StageId, a: Record<string, Answer>) => evaluate(stage, a, { now: () => 'T' }).tier;

describe('safety properties, all stages', () => {
  it('raising any answer (no, then not sure, then yes) never lowers the result', () => {
    const r = rng(42);
    for (const stage of STAGES) {
      for (let n = 0; n < 1500; n++) {
        const a = randomAnswers(stage, r);
        const base = RANK[tierOf(stage, a)];
        for (const id of ids(stage)) {
          const idx = ORDER.indexOf(a[id]!);
          if (idx === 2) continue;
          const raised = { ...a, [id]: ORDER[idx + 1]! };
          expect(RANK[tierOf(stage, raised)], `${stage} ${id} ${JSON.stringify(a)}`).toBeGreaterThanOrEqual(base);
        }
      }
    }
  });

  it('all no is GREEN, all not sure is at least AMBER, unanswered equals not sure', () => {
    for (const stage of STAGES) {
      const q = ids(stage);
      expect(tierOf(stage, Object.fromEntries(q.map((id) => [id, 'no'])))).toBe('GREEN');
      expect(RANK[tierOf(stage, Object.fromEntries(q.map((id) => [id, 'not_sure'])))]).toBeGreaterThanOrEqual(RANK.AMBER);
      expect(tierOf(stage, {})).toBe(tierOf(stage, Object.fromEntries(q.map((id) => [id, 'not_sure']))));
    }
  });

  it('answer order does not matter and answers to other stages are ignored', () => {
    const r = rng(7);
    for (const stage of STAGES) {
      for (let n = 0; n < 300; n++) {
        const a = randomAnswers(stage, r);
        const shuffled = Object.fromEntries(Object.entries(a).reverse());
        expect(tierOf(stage, shuffled)).toBe(tierOf(stage, a));
        const foreign = data.questions.filter((x) => !x.stages.includes(stage)).map((x) => x.id);
        const noisy = { ...a, ...Object.fromEntries(foreign.map((id) => [id, 'yes' as Answer])) };
        expect(tierOf(stage, noisy)).toBe(tierOf(stage, a));
      }
    }
  });

  it('every question alone says yes: result is exactly the highest rule that depends only on it', () => {
    for (const stage of STAGES) {
      for (const id of ids(stage)) {
        const answers = Object.fromEntries(ids(stage).map((x) => [x, x === id ? 'yes' : 'no'])) as Record<string, Answer>;
        const singles = data.rules.filter((rule) => rule.type === 'single' && rule.question_id === id && rule.stages.includes(stage) && rule.module === 'core');
        const want = singles.reduce<Tier>((m, rule) => (RANK[rule.tier_if.yes ?? 'GREEN'] > RANK[m] ? (rule.tier_if.yes as Tier) : m), 'GREEN');
        expect(tierOf(stage, answers), `${stage} ${id}`).toBe(want);
      }
    }
  });

  it('every RED-on-yes sign gives RED even when everything else is not sure or no', () => {
    for (const stage of STAGES) {
      for (const id of ids(stage)) {
        const redAlone = data.rules.some((rule) => rule.type === 'single' && rule.question_id === id && rule.stages.includes(stage) && rule.tier_if.yes === 'RED');
        if (!redAlone) continue;
        for (const rest of ['no', 'not_sure'] as Answer[]) {
          const a = Object.fromEntries(ids(stage).map((x) => [x, x === id ? 'yes' : rest])) as Record<string, Answer>;
          expect(tierOf(stage, a), `${stage} ${id} rest=${rest}`).toBe('RED');
        }
      }
    }
  });

  it('every pair of signs: the result is never lower than either sign alone', () => {
    for (const stage of STAGES) {
      const q = ids(stage);
      const alone = (id: string) => RANK[tierOf(stage, Object.fromEntries(q.map((x) => [x, x === id ? 'yes' : 'no'])) as Record<string, Answer>)];
      for (let i = 0; i < q.length; i++) for (let j = i + 1; j < q.length; j++) {
        const a = Object.fromEntries(q.map((x) => [x, x === q[i] || x === q[j] ? 'yes' : 'no'])) as Record<string, Answer>;
        expect(RANK[tierOf(stage, a)], `${stage} ${q[i]}+${q[j]}`).toBeGreaterThanOrEqual(Math.max(alone(q[i]!), alone(q[j]!)));
      }
    }
  });

  it('two AMBER-class signs together become RED (R-MULTI-01)', () => {
    const multi = data.rules.find((x) => x.id === 'R-MULTI-01')!;
    for (const stage of STAGES.filter((s) => multi.stages.includes(s))) {
      const pool = (multi.among ?? []).filter((id) => ids(stage).includes(id));
      for (let i = 0; i < pool.length; i++) for (let j = i + 1; j < pool.length; j++) {
        const a = Object.fromEntries(ids(stage).map((x) => [x, x === pool[i] || x === pool[j] ? 'yes' : 'no'])) as Record<string, Answer>;
        expect(tierOf(stage, a), `${stage} ${pool[i]}+${pool[j]}`).toBe('RED');
      }
    }
  });

  it('the wellbeing flag never changes the tier by itself beyond AMBER', () => {
    const a = Object.fromEntries(ids('after_birth').map((x) => [x, x === 'q_wellbeing' ? 'yes' : 'no'])) as Record<string, Answer>;
    const r = evaluate('after_birth', a);
    expect(r.tier).toBe('AMBER');
    expect(r.flags).toContain('wellbeing_support');
  });

  it('writes combinations for the independent Python cross-check', () => {
    const r = rng(2026);
    const out: { stage: StageId; answers: Record<string, Answer>; tier: Tier; fired: string[]; flags: string[] }[] = [];
    for (const stage of STAGES) {
      const q = ids(stage);
      for (const id of q) for (const v of ['yes', 'not_sure'] as Answer[]) {
        const answers = Object.fromEntries(q.map((x) => [x, x === id ? v : 'no'])) as Record<string, Answer>;
        const e = evaluate(stage, answers); out.push({ stage, answers, tier: e.tier, fired: e.fired.map((f) => f.rule_id).sort(), flags: e.flags });
      }
      for (let i = 0; i < q.length; i++) for (let j = i + 1; j < q.length; j++) for (const v of ['yes', 'not_sure'] as Answer[]) {
        const answers = Object.fromEntries(q.map((x) => [x, x === q[i] || x === q[j] ? v : 'no'])) as Record<string, Answer>;
        const e = evaluate(stage, answers); out.push({ stage, answers, tier: e.tier, fired: e.fired.map((f) => f.rule_id).sort(), flags: e.flags });
      }
      for (let n = 0; n < 4000; n++) {
        const answers = randomAnswers(stage, r);
        const e = evaluate(stage, answers); out.push({ stage, answers, tier: e.tier, fired: e.fired.map((f) => f.rule_id).sort(), flags: e.flags });
      }
    }
    fs.mkdirSync('tests/generated', { recursive: true });
    fs.writeFileSync('tests/generated/combos.json', JSON.stringify(out));
    expect(out.length).toBeGreaterThan(12000);
  });
});

import cases from '../../tests/rule_cases.json';
import { evaluate } from './evaluate';
import { applicableQuestions } from './loadData';
import type { Answer, StageId } from './types';

interface Case {
  id: string; title: string; stage: StageId; default_answer?: Answer; modules?: string[];
  answers: Record<string, Answer>; expect_tier: string; expect_rules_include?: string[];
  expect_rules_exclude?: string[]; expect_no_rules?: boolean; expect_flags?: string[];
}

describe('rule cases', () => {
  for (const c of (cases as unknown as { cases: Case[] }).cases) {
    it(`${c.id} ${c.title}`, () => {
      const modules = c.modules ?? ['core'];
      const answers: Record<string, Answer> = {};
      if (c.default_answer) for (const q of applicableQuestions(c.stage, modules)) answers[q.id] = c.default_answer;
      Object.assign(answers, c.answers);
      const r = evaluate(c.stage, answers, { modules, now: () => 'T' });
      expect(r.tier).toBe(c.expect_tier);
      const ids = r.fired.map((f) => f.rule_id);
      for (const id of c.expect_rules_include ?? []) expect(ids).toContain(id);
      for (const id of c.expect_rules_exclude ?? []) expect(ids).not.toContain(id);
      if (c.expect_no_rules) expect(ids).toEqual([]);
      if (c.expect_flags) expect(r.flags).toEqual([...c.expect_flags].sort());
    });
  }
});

describe('loader', () => {
  it('counts applicable questions per stage (core)', () => {
    expect(applicableQuestions('pregnant')).toHaveLength(11);
    expect(applicableQuestions('labour')).toHaveLength(12);
    expect(applicableQuestions('after_birth')).toHaveLength(11);
  });
});

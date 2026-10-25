import { applicableQuestions, data } from './loadData';
import type { Answer, EvalResult, FiredRule, StageId, Tier } from './types';

export interface EvalOptions { modules?: string[]; now?: () => string }

const RANK: Record<Tier, number> = { GREEN: 1, AMBER: 2, RED: 3 };

/**
 * Deterministic rule evaluator. Pure: no I/O, no randomness, no AI.
 *
 * Not-sure policy: an applicable question with no answer, or answered
 * `not_sure`, is treated as `not_sure`. A `not_sure` on a question whose rule
 * defines `tier_if.not_sure` fires that tier (AMBER in the rule table), so
 * doubt escalates and is never read as "no". Over-escalation is accepted
 * because missing a danger sign costs more. `count` rules use `yes` only.
 */
export function evaluate(
  stage: StageId,
  answers: Record<string, Answer>,
  options: EvalOptions = {},
): EvalResult {
  const modules = options.modules ?? ['core'];
  const questions = applicableQuestions(stage, modules);
  const norm: Record<string, Answer> = {};
  for (const q of questions) norm[q.id] = answers[q.id] ?? 'not_sure';

  const fired: FiredRule[] = [];
  const flags = new Set<string>();

  for (const rule of data.rules) {
    if (!modules.includes(rule.module) || !rule.stages.includes(stage)) continue;
    let tier: Tier | undefined;
    let qids: string[] = [];

    if (rule.type === 'single' && rule.question_id) {
      const a = norm[rule.question_id];
      if (a === undefined) continue;
      qids = [rule.question_id];
      if (a === 'yes') tier = rule.tier_if.yes;
      else if (a === 'not_sure') tier = rule.tier_if.not_sure;
    } else if (rule.type === 'all_of' && rule.question_ids) {
      qids = rule.question_ids;
      if (qids.every((id) => norm[id] === 'yes')) tier = rule.tier_if.yes;
    } else if (rule.type === 'count' && rule.among) {
      const yes = rule.among.filter((id) => norm[id] === 'yes');
      if (yes.length >= (rule.min ?? 1)) { tier = rule.tier_if.yes; qids = yes; }
    }

    if (tier) {
      fired.push({ rule_id: rule.id, tier, question_ids: qids, source_refs: rule.source_refs });
      (rule.flags ?? []).forEach((f) => flags.add(f));
    }
  }

  fired.sort((a, b) => RANK[b.tier] - RANK[a.tier] || a.rule_id.localeCompare(b.rule_id));
  const tier: Tier = fired[0]?.tier ?? 'GREEN';

  return {
    tier,
    fired,
    flags: [...flags].sort(),
    stage,
    not_sure_ids: questions.filter((q) => norm[q.id] === 'not_sure').map((q) => q.id),
    yes_ids: questions.filter((q) => norm[q.id] === 'yes').map((q) => q.id),
    rules_version: data.rulesVersion,
    evaluated_at: (options.now ?? (() => new Date().toISOString()))(),
  };
}

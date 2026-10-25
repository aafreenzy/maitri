import rulesJson from '../data/rules.json';
import questionsJson from '../data/questions.json';
import configJson from '../data/config.json';
import type { Config, Question, Rule, Source, Stage, StageId, Tier } from './types';

const rawRules = rulesJson as unknown as {
  version: string; status: string; tiers: Record<Tier, number>; tier_display: Record<Tier, string>;
  sources: Record<string, Source>; rules: Rule[];
};
const rawQuestions = questionsJson as unknown as {
  modules: Record<string, { enabled: boolean }>; stages: Stage[]; questions: Question[];
};

export const data = Object.freeze({
  rules: rawRules.rules,
  rulesVersion: rawRules.version,
  rulesStatus: rawRules.status,
  tiers: rawRules.tiers,
  sources: rawRules.sources,
  questions: rawQuestions.questions,
  stages: rawQuestions.stages,
  modules: rawQuestions.modules,
  config: configJson as unknown as Config,
});

export function defaultModules(): string[] {
  return data.config.feature_flags['newborn_module'] ? ['core', 'newborn'] : ['core'];
}

export function applicableQuestions(stage: StageId, modules: string[] = defaultModules()): Question[] {
  return data.questions
    .filter((q) => q.stages.includes(stage) && modules.includes(q.module))
    .sort((a, b) => a.order - b.order);
}

export type Tier = 'GREEN' | 'AMBER' | 'RED';
export type Answer = 'yes' | 'no' | 'not_sure';
export type StageId = 'pregnant' | 'labour' | 'after_birth';
export type Mode = 'woman' | 'asha' | 'family';

export interface Question {
  id: string; module: 'core' | 'newborn'; order: number; icon: string;
  stages: StageId[]; en: string; hi: string; short_en: string; short_hi: string;
}

export interface Rule {
  id: string; type: 'single' | 'all_of' | 'count'; module: string; stages: StageId[];
  question_id?: string; question_ids?: string[]; among?: string[]; min?: number;
  tier_if: { yes?: Tier; not_sure?: Tier }; flags?: string[]; source_refs: string[];
  confidence: string; reviewed_by: string | null; note?: string;
}

export interface FiredRule { rule_id: string; tier: Tier; question_ids: string[]; source_refs: string[] }

export interface EvalResult {
  tier: Tier; fired: FiredRule[]; flags: string[]; stage: StageId;
  not_sure_ids: string[]; yes_ids: string[]; rules_version: string; evaluated_at: string;
}

export interface Stage { id: StageId; icon: string; audio_id: string; en: string; hi: string }

export interface Source { title: string; url: string | null; confidence: string }

export interface NumberEntry {
  number: string; label_en: string; label_hi: string; status: string; note?: string; source?: string;
}

export interface Config {
  app: { name: string; name_hi: string; version: string; tagline_en: string; tagline_hi: string; region_default: string; postpartum_days: number };
  numbers: Record<string, NumberEntry>;
  entitlements: { jssk_en: string; jssk_hi: string; status: string; source: string };
  feature_flags: Record<string, boolean>;
  deadline_guard: { hard_stop_iso: string; official_deadline_iso: string; note: string };
}

export type Dictionary = Record<string, string>;

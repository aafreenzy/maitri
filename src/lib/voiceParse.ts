import kw from '../data/voice_keywords.json';
import { applicableQuestions } from '../engine/loadData';
import type { Answer, StageId } from '../engine/types';

type Lists = { yes?: string[]; not_sure?: string[] };
const data = kw as unknown as {
  stage_phrases: Record<StageId, string[]>;
  bleeding: { question_by_stage: Record<StageId, string>; mention: string[]; heavy: string[] };
  signs: Record<string, Lists>;
  answers: { yes: string[]; no: string[]; not_sure: string[] };
};

/** Lowercase, drop punctuation, unify Devanagari spellings (nukta, chandrabindu). */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/़/g, '')
    .replace(/ँ/g, 'ं')
    .normalize('NFC')
    .replace(/[.,!?;:।"'’]/g, (m) => (m === "'" || m === '’' ? "'" : ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

const has = (hay: string, phrases: string[]) => phrases.some((p) => hay.includes(normalize(p)));

/** Matches short words as whole tokens, longer phrases as substrings. */
function hasWord(norm: string, phrases: string[]): boolean {
  const tokens = norm.split(' ');
  return phrases.some((p) => {
    const n = normalize(p);
    return n.includes(' ') || n.length > 3 ? norm.includes(n) : tokens.includes(n);
  });
}

/** Reads a spoken yes, no or not sure. Returns null when unclear or when yes and no both appear. */
export function parseAnswer(text: string): Answer | null {
  const norm = normalize(text);
  if (!norm) return null;
  if (hasWord(norm, data.answers.not_sure)) return 'not_sure';
  const yes = hasWord(norm, data.answers.yes);
  const no = hasWord(norm, data.answers.no);
  if (yes && no) return null;
  if (yes) return 'yes';
  if (no) return 'no';
  return null;
}

export function detectStage(text: string): StageId | null {
  const norm = normalize(text);
  if (has(norm, data.stage_phrases.after_birth)) return 'after_birth';
  if (has(norm, data.stage_phrases.labour)) return 'labour';
  if (has(norm, data.stage_phrases.pregnant)) return 'pregnant';
  return null;
}

export interface Extracted { stage: StageId | null; signs: Record<string, Exclude<Answer, 'no'>> }

/**
 * Finds danger signs in free speech. A strong phrase gives yes, a weak phrase gives not_sure.
 * Every mention counts, with no negation handling. The woman removes wrong signs on the review
 * screen, so a missed sign is the only unsafe error and the lists err toward finding signs.
 */
export function extractSigns(text: string, stageOverride?: StageId | null): Extracted {
  const norm = normalize(text);
  const stage = stageOverride ?? detectStage(text);
  const applicable = stage ? new Set(applicableQuestions(stage).map((q) => q.id)) : null;
  const signs: Extracted['signs'] = {};
  const put = (id: string, v: 'yes' | 'not_sure') => {
    if (applicable && !applicable.has(id)) return;
    if (signs[id] === 'yes') return;
    signs[id] = v;
  };
  for (const [id, lists] of Object.entries(data.signs)) {
    if (lists.yes && has(norm, lists.yes)) put(id, 'yes');
    else if (lists.not_sure && has(norm, lists.not_sure)) put(id, 'not_sure');
  }
  if (has(norm, data.bleeding.mention)) {
    const heavy = has(norm, data.bleeding.heavy);
    if (stage) put(data.bleeding.question_by_stage[stage], stage === 'after_birth' && !heavy ? 'not_sure' : 'yes');
    else put('q_bleed_preg', 'yes');
  }
  return { stage, signs };
}

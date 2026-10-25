import { useMemo } from 'react';
import { evaluate } from '../engine/evaluate';
import { data } from '../engine/loadData';
import { questionShort, useLang } from '../lib/i18n';
import { useSession } from './session';

export function useResult() {
  const { state, questions } = useSession();
  useLang();
  const { stage, answers } = state;
  const result = useMemo(() => (stage ? evaluate(stage, answers) : null), [stage, answers]);
  if (!result || !stage) return null;
  const label = (id: string) => {
    const q = data.questions.find((x) => x.id === id);
    return q ? questionShort(q) : id;
  };
  const first = result.fired[0];
  const reasons = first ? first.question_ids.map(label) : [];
  return {
    result, tier: result.tier,
    headlineReason: reasons[0] ?? '',
    reasons,
    yesLabels: result.yes_ids.map(label),
    unsureLabels: result.not_sure_ids.map(label),
    hasNotSure: result.not_sure_ids.length > 0 && Object.values(answers).includes('not_sure'),
    hasWellbeingFlag: result.flags.includes('wellbeing_support'),
    isRed: result.tier === 'RED', isAmber: result.tier === 'AMBER',
    answeredCount: questions.filter((q) => answers[q.id]).length,
  };
}

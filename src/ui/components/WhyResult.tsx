import { useState } from 'react';
import { data } from '../../engine/loadData';
import { confidenceLabel, questionShort, t, useLang } from '../../lib/i18n';
import { useSession } from '../../state/session';
import { useResult } from '../../state/useResult';
import { Button } from './Button';
import { Sheet } from './Sheet';

/** Show-your-work panel: which fixed rules applied, to which signs, and where each rule comes from. */
export function WhyResult() {
  const [open, setOpen] = useState(false);
  const r = useResult();
  const { state } = useSession();
  useLang();
  if (!r) return null;
  // Questions she was never asked (the check ended early) count as not sure inside the engine. They are not shown here.
  const shown = r.result.fired.filter((f) => f.question_ids.some((id) => state.answers[id] !== undefined));
  const label = (id: string) => {
    const q = data.questions.find((x) => x.id === id);
    return q ? questionShort(q) : id;
  };
  return (
    <>
      <Button className="ghosted" onClick={() => setOpen(true)} aria-haspopup="dialog">{t('result.why')}</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t('result.why')}>
        <p>{t('result.why_body')}</p>
        <div className="why-list">
          {shown.length === 0 && <p className="why-item">{t('result.why_none')}</p>}
          {shown.map((f) => {
            const rule = data.rules.find((x) => x.id === f.rule_id);
            const unsure = f.question_ids.some((id) => state.answers[id] === 'not_sure');
            return (
              <div key={f.rule_id} className="why-item">
                <b>{f.question_ids.map(label).join(' + ')}</b>
                <span>{t(`tier.${f.tier}`)}{unsure ? `. ${t('result.why_not_sure')}` : ''}</span>
                <span className="muted small" lang="en">{f.source_refs.map((s) => data.sources[s]?.title ?? s).join('; ')}</span>
                {rule && <span className="muted small">{confidenceLabel(rule.confidence)}</span>}
                <span className="muted small" translate="no">{f.rule_id}</span>
              </div>
            );
          })}
        </div>
        <p className="muted small">{t('result.why_rules_version', { version: data.rulesVersion })}</p>
        <Button variant="ghost" onClick={() => setOpen(false)}>{t('common.close')}</Button>
      </Sheet>
    </>
  );
}

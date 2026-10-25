import { useState } from 'react';
import rulesJson from '../../data/rules.json';
import { data } from '../../engine/loadData';
import type { StageId } from '../../engine/types';
import { getLang, questionText, t, useLang } from '../../lib/i18n';
import { Button } from '../components/Button';
import { Page } from '../components/Layout';

export function buildExport(ticked: Record<string, boolean>, names: Record<string, string>) {
  const copy = JSON.parse(JSON.stringify(rulesJson)) as typeof rulesJson;
  for (const r of copy.rules as { id: string; reviewed_by: string | null }[]) {
    if (ticked[r.id]) r.reviewed_by = (names[r.id] ?? '').trim();
  }
  return copy;
}

export default function RuleReview() {
  useLang();
  const [ticked, setTicked] = useState<Record<string, boolean>>({});
  const [names, setNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const doExport = () => {
    const ids = Object.keys(ticked).filter((k) => ticked[k]);
    if (!ids.length) return setError(t('review.none_ticked'));
    if (ids.some((id) => !(names[id] ?? '').trim())) return setError(t('review.name_missing'));
    setError(null);
    const blob = new Blob([JSON.stringify(buildExport(ticked, names), null, 2) + '\n'], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'rules.json'; a.click();
  };

  const stages: StageId[] = ['pregnant', 'labour', 'after_birth'];
  return (
    <Page actions={<Button variant="primary" onClick={doExport}>{t('review.export')}</Button>}>
      <h1>{t('review.title')}</h1>
      <p className="hint">{t('review.note')}</p>
      {error && <p className="error-box" role="alert">{error}</p>}
      {stages.map((st) => (
        <section key={st} className="rows" style={{ gap: 12 }}>
          <h2>{data.stages.find((s) => s.id === st)![getLang() === 'hi' ? 'hi' : 'en']}</h2>
          {data.rules.filter((r) => r.stages.includes(st)).map((r) => {
            const qids = [r.question_id, ...(r.question_ids ?? []), ...(r.among ?? [])].filter(Boolean) as string[];
            const src = r.source_refs.map((s) => data.sources[s]?.title ?? s).join('; ');
            const invalid = ticked[r.id] && !(names[r.id] ?? '').trim();
            return (
              <div key={`${st}-${r.id}`} className="card">
                <b>{r.id} · {Object.entries(r.tier_if).map(([k, v]) => `${k}: ${v}`).join(', ')}</b>
                <p>{qids.map((id) => data.questions.find((q) => q.id === id)).map((q) => (q ? questionText(q) : '')).join(' / ')}</p>
                <p className="muted small">{t('review.source')}: {src}. {t('review.confidence')}: {r.confidence}</p>
                {r.note && <p className="muted small">{r.note}</p>}
                <label className="tick"><input type="checkbox" checked={!!ticked[r.id]} onChange={(e) => setTicked({ ...ticked, [r.id]: e.target.checked })} />{t('review.mark_reviewed')}</label>
                <div className="field">
                  <label htmlFor={`n-${st}-${r.id}`}>{t('review.reviewer_name')}</label>
                  <input id={`n-${st}-${r.id}`} type="text" value={names[r.id] ?? ''} aria-invalid={invalid || undefined} onChange={(e) => setNames({ ...names, [r.id]: e.target.value })} />
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </Page>
  );
}

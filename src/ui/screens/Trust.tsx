import { data } from '../../engine/loadData';
import { allNumbers } from '../../lib/config';
import { t, useLang } from '../../lib/i18n';
import { Page } from '../components/Layout';

interface Report { passed?: number; total?: number; generated_at?: string }
const found = import.meta.glob('../../generated/test-report.json', { eager: true, import: 'default' }) as Record<string, Report>;
const report = Object.values(found)[0];

export default function Trust() {
  useLang();
  const reviewed = data.rules.filter((r) => r.reviewed_by);
  const names = [...new Set(reviewed.map((r) => r.reviewed_by as string))];
  const ok = report && typeof report.passed === 'number' && typeof report.total === 'number' && report.total > 0;
  return (
    <Page>
      <h1>{t('trust.title')}</h1>
      <section className="card">
        <div className="kv"><span>{t('trust.rules_version')}</span><b>{data.rulesVersion}</b></div>
        <p className="muted small">{data.rulesStatus}</p>
      </section>
      <section className="card">
        <div className="kv"><span>{t('trust.tests')}</span><b>{ok ? t('trust.tests_of', { passed: report!.passed!, total: report!.total! }) : t('trust.not_available')}</b></div>
        {ok && <div className="meter" role="progressbar" aria-label={t('trust.tests')} aria-valuemin={0} aria-valuemax={report!.total} aria-valuenow={report!.passed}><i style={{ width: `${(report!.passed! / report!.total!) * 100}%` }} /></div>}
        <p className="muted small">{t('trust.tests_note')}</p>
      </section>
      <section className="card">
        <div className="kv"><span>{t('trust.reviewed')}</span><b>{reviewed.length ? t('trust.reviewed_count', { count: reviewed.length, total: data.rules.length }) : t('trust.reviewed_none')}</b></div>
        {names.length > 0 && <p>{names.join(', ')}</p>}
      </section>
      <section className="card"><p>{t('safety.tiers_ours')}</p></section>
      <section className="card">
        <h2>{t('trust.sources')}</h2>
        {Object.entries(data.sources).map(([id, s]) => (
          <div key={id} className="rows">
            <b>{id}</b>
            {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> : <span>{s.title}</span>}
            <span className="muted small">{t('trust.source_confidence')}: {s.confidence}</span>
          </div>
        ))}
      </section>
      <section className="card">
        <h2>{t('trust.numbers')}</h2>
        {allNumbers().map((n) => (
          <div key={n.key} className="kv">
            <span>{n.label}</span>
            <span><b>{n.number}</b> <span className="status-tag">{n.confirmed ? t('trust.status_confirmed') : t('trust.status_unverified')}</span></span>
          </div>
        ))}
        <p className="muted small">{t('trust.numbers_note')}</p>
      </section>
    </Page>
  );
}

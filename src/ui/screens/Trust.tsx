import { data } from '../../engine/loadData';
import { backendConfigured } from '../../lib/backend';
import { allNumbers } from '../../lib/config';
import { confidenceLabel, t, useLang } from '../../lib/i18n';
import { Page } from '../components/Layout';

interface Report { passed?: number; total?: number; rule_cases?: number; generated_at?: string }
const found = import.meta.glob('../../generated/test-report.json', { eager: true, import: 'default' }) as Record<string, Report>;
const report = Object.values(found)[0];

export default function Trust() {
  useLang();
  const reviewed = data.rules.filter((r) => r.reviewed_by);
  const names = [...new Set(reviewed.map((r) => r.reviewed_by as string))];
  const ok = report && typeof report.passed === 'number' && typeof report.total === 'number' && report.total > 0;
  const backend = backendConfigured();
  return (
    <Page>
      <h1>{t('trust.title')}</h1>
      <section className="card">
        <div className="kv"><span>{t('trust.rules_version')}</span><b translate="no">{data.rulesVersion}</b></div>
        {reviewed.length === 0 && <p className="strong">{t('trust.status_draft')}</p>}
      </section>
      <section className="card">
        <div className="kv"><span>{t('trust.tests')}</span><b>{ok ? t('trust.tests_of', { passed: report!.passed!, total: report!.total! }) : t('trust.not_available')}</b></div>
        {ok && <div className="meter" role="progressbar" aria-label={t('trust.tests')} aria-valuemin={0} aria-valuemax={report!.total} aria-valuenow={report!.passed}><i style={{ width: `${(report!.passed! / report!.total!) * 100}%` }} /></div>}
        {ok && typeof report!.rule_cases === 'number' && <div className="kv"><span>{t('trust.cases')}</span><b>{report!.rule_cases}</b></div>}
        <p className="muted small">{t('trust.second_impl')}</p>
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
            <b translate="no">{id}</b>
            {s.url ? <a lang="en" href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> : <span lang="en">{s.title}</span>}
            <span className="muted small">{t('trust.source_confidence')}: {confidenceLabel(s.confidence)}</span>
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
      <section className="card">
        <h2>{t('trust.data_title')}</h2>
        <div className="rows"><b>{t('trust.data_check')}</b><span>{t('trust.data_check_body')}</span></div>
        <div className="rows"><b>{t('trust.data_voice')}</b><span>{t('trust.data_voice_body')}</span></div>
        <div className="rows"><b>{t('trust.data_account')}</b><span>{t(backend ? 'trust.data_account_on' : 'trust.data_account_off')}</span></div>
        <div className="rows"><b>{t('common.quick_exit')}</b><span>{t('trust.data_exit_body')}</span></div>
      </section>
      <section className="card">
        <h2>{t('trust.sim_title')}</h2>
        <ul className="plain-list">
          <li>{t('trust.sim_clinician')}</li>
          <li>{t('trust.sim_voice')}</li>
          <li>{t('trust.sim_audio')}</li>
          <li>{t(backend ? 'trust.sim_backend_on' : 'trust.sim_backend_off')}</li>
          <li>{t('trust.sim_field')}</li>
          <li>{t('trust.sim_numbers')}</li>
        </ul>
      </section>
    </Page>
  );
}

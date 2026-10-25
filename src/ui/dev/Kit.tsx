import { ICON_IDS } from '../icons/registry';
import { Pictogram } from '../icons/Pictogram';
import { SignalShape } from '../components/SignalShape';

/** Development gallery, opened with ?kit. Not part of the normal flow. */
export default function Kit() {
  return (
    <div className="page"><main className="page-body">
      <h1>Kit</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
        {ICON_IDS.map((id) => (
          <figure key={id} className="card" style={{ margin: 0, alignItems: 'center' }}>
            <Pictogram id={id} size={96} />
            <Pictogram id={id} size={48} />
            <figcaption className="small">{id}</figcaption>
          </figure>
        ))}
      </div>
      <div className="row">
        <SignalShape tier="RED" word="RED" size={110} /><SignalShape tier="AMBER" word="AMBER" size={110} /><SignalShape tier="GREEN" word="GREEN" size={110} />
      </div>
    </main></div>
  );
}

export function ProgressDots({ total, current, answered, label }: { total: number; current: number; answered: Record<number, boolean> | number; label: string }) {
  const isOn = (i: number) => (typeof answered === 'number' ? i < answered : !!answered[i]);
  return (
    <div className="dots" role="img" aria-label={label}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`dot ${i === current ? 'cur' : isOn(i) ? 'on' : ''}`} />
      ))}
    </div>
  );
}

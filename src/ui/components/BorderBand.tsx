export function BorderBand() {
  return (
    <svg className="band" viewBox="0 0 96 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="band-motif" width="24" height="12" patternUnits="userSpaceOnUse">
          <rect width="24" height="12" fill="#E6EEF6" />
          <path d="M0 6L6 0L12 6L6 12Z" fill="#23358A" />
          <circle cx="18" cy="6" r="3.2" fill="#F7B500" />
          <path d="M12 6L18 0L24 6" fill="none" stroke="#111B38" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="96" height="12" fill="url(#band-motif)" />
    </svg>
  );
}

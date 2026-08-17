export function CoBrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`co-brand-lockup${compact ? " compact" : ""}`} aria-label="Global mais Docile">
      <span className="global-brand">
        <span className="global-symbol">G</span>
        <span className="global-wordmark"><b>GLOBAL</b>{!compact && <small>CONTENT OPS</small>}</span>
      </span>
      <span className="brand-plus" aria-hidden="true">+</span>
      <span className="docile-brand"><span>D</span><b>DOCILE</b></span>
    </div>
  );
}

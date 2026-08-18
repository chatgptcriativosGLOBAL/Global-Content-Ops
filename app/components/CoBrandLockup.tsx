export function CoBrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`co-brand-lockup${compact ? " compact" : ""}`} aria-label="Global mais Docile">
      <span className="official-brand global-brand">
        <img src="/brand/global-white.png" alt="Global" />
      </span>
      <span className="brand-plus" aria-hidden="true">+</span>
      <span className="official-brand docile-brand">
        <img src="/brand/docile-color.png" alt="Docile" />
      </span>
    </div>
  );
}

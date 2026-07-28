/* Minimal Tweaks panel — production trimmed.
 * Removes the host-postMessage protocol (no editor host on Vercel).
 * Persists state in localStorage instead.
 * Only exports what the portfolio app uses.
 */
import React, { useState, useRef, useEffect } from 'react';

const PANEL_STYLES = `
.twk-shell { position: fixed; bottom: 24px; left: 24px; z-index: 60; font-family: 'Inter', sans-serif; }
.twk-fab {
  width: 48px; height: 48px;
  background: var(--bg); color: var(--fg);
  border: 1px solid var(--line-strong);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.twk-fab:hover { background: var(--fg); color: var(--bg); }
.twk-fab svg { width: 18px; height: 18px; }

.twk-panel {
  position: absolute; bottom: 60px; left: 0;
  width: 280px;
  max-height: calc(100vh - 110px);
  overflow-y: auto;
  background: var(--bg);
  border: 1px solid var(--line-strong);
  padding: 16px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
  display: flex; flex-direction: column; gap: 14px;
}
.twk-head { display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 10px; border-bottom: 1px solid var(--line); }
.twk-title { font-size: 11px; letter-spacing: 2px; font-weight: 700; text-transform: uppercase; }
.twk-close { font-size: 16px; cursor: pointer; opacity: 0.6; }
.twk-close:hover { opacity: 1; }
.twk-sect { font-size: 9px; letter-spacing: 1.5px; font-weight: 700; text-transform: uppercase;
  color: var(--fg-soft); margin-top: 6px; }
.twk-row { display: flex; flex-direction: column; gap: 6px; }
.twk-row-h { flex-direction: row; align-items: center; justify-content: space-between; }
.twk-lbl { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; }
.twk-val { color: var(--fg-soft); font-family: 'JetBrains Mono', monospace; font-size: 11px; }
.twk-slider { width: 100%; accent-color: var(--crimson); }
.twk-field { width: 100%; padding: 6px 8px; border: 1px solid var(--line-strong);
  background: var(--bg); font-family: inherit; font-size: 12px; color: var(--fg); }
.twk-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
  background: var(--bg-2); padding: 2px; position: relative; }
.twk-seg button { padding: 6px 8px; font-size: 11px; font-weight: 600; position: relative;
  background: transparent; border: none; cursor: pointer; color: var(--fg-soft); transition: color 0.2s; z-index: 1; }
.twk-seg button[aria-checked="true"] { color: var(--bg); }
.twk-seg-thumb { position: absolute; top: 2px; bottom: 2px;
  background: var(--ink); transition: left 0.25s; }
`;

if (typeof document !== 'undefined' && !document.getElementById('twk-styles')) {
  const st = document.createElement('style');
  st.id = 'twk-styles';
  st.textContent = PANEL_STYLES;
  document.head.appendChild(st);
}

const STORAGE_KEY = 'portfolio-tweaks';

export function useTweaks(defaults) {
  const [values, setValues] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...defaults, ...stored };
    } catch { return defaults; }
  });
  const setTweak = (keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => {
      const next = { ...prev, ...edits };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };
  return [values, setTweak];
}

export function TweaksPanel({ title = 'Tweaks', children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="twk-shell">
      {open && (
        <div className="twk-panel">
          <div className="twk-head">
            <span className="twk-title">{title}</span>
            <span className="twk-close" onClick={() => setOpen(false)}>×</span>
          </div>
          {children}
        </div>
      )}
      <button className="twk-fab" onClick={() => setOpen(!open)} aria-label="Tweaks">
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        )}
      </button>
    </div>
  );
}

export function TweakSection({ label, children }) {
  return <><div className="twk-sect">{label}</div>{children}</>;
}

export function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }) {
  return (
    <div className="twk-row">
      <div className="twk-lbl"><span>{label}</span><span className="twk-val">{value}{unit}</span></div>
      <input type="range" className="twk-slider" min={min} max={max} step={step}
             value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function TweakSelect({ label, value, options, onChange }) {
  return (
    <div className="twk-row">
      <div className="twk-lbl"><span>{label}</span></div>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === 'object' ? o.value : o;
          const l = typeof o === 'object' ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </div>
  );
}

export function TweakRadio({ label, value, options, onChange }) {
  const opts = options.map(o => typeof o === 'object' ? o : { value: o, label: o });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  if (opts.length > 3 || opts.some(o => String(o.label).length > 10)) {
    return <TweakSelect label={label} value={value} options={opts} onChange={onChange} />;
  }
  return (
    <div className="twk-row">
      <div className="twk-lbl"><span>{label}</span></div>
      <div className="twk-seg" style={{ gridTemplateColumns: `repeat(${opts.length}, 1fr)` }}>
        <div className="twk-seg-thumb"
             style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${opts.length})`,
                      width: `calc((100% - 4px) / ${opts.length})` }} />
        {opts.map(o => (
          <button key={o.value} aria-checked={o.value === value}
                  onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

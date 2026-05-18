/* All section components. Globals exposed at bottom. */
import React, { useEffect, useRef, useState, useMemo } from 'react';

/* ---------- HOOKS ----------
 * Visibility detection via scroll + rAF + initial bounding-rect check.
 * Avoids IntersectionObserver — it doesn't fire reliably inside nested
 * preview iframes here. This implementation is fire-once.
 */
const __watchers = new Set();
let __tickQueued = false;
function __scheduleTick() {
  if (__tickQueued) return;
  __tickQueued = true;
  requestAnimationFrame(() => {
    __tickQueued = false;
    const vh = window.innerHeight || 800;
    __watchers.forEach((w) => {
      if (!w.el || !w.el.isConnected) { __watchers.delete(w); return; }
      const r = w.el.getBoundingClientRect();
      // visible if any part within viewport (with a small margin)
      const visible = r.top < vh - (w.threshold || 60) && r.bottom > (w.threshold || 60);
      if (visible) {
        w.cb();
        __watchers.delete(w);
      }
    });
  });
}
window.addEventListener('scroll', __scheduleTick, { passive: true });
window.addEventListener('resize', __scheduleTick);
// also poll a few times after load in case fonts/layout shift
for (const ms of [50, 200, 600, 1200, 2000]) setTimeout(__scheduleTick, ms);

function __watch(el, cb, threshold = 60) {
  if (!el) return;
  const w = { el, cb, threshold };
  __watchers.add(w);
  // immediate check (for above-the-fold elements)
  __scheduleTick();
  return () => __watchers.delete(w);
}

export function useReveal(ref, opts = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const off = __watch(el, () => el.classList.add('in'), opts.threshold ?? 60);
    return off;
  }, []);
}

export function useInView(ref, opts = {}) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const off = __watch(el, () => setSeen(true), opts.threshold ?? 60);
    return off;
  }, []);
  return seen;
}

/* ---------- COUNT-UP ---------- */
export function CountUp({ value, duration = 1800, decimals = null }) {
  const ref = useRef(null);
  const seen = useInView(ref, { threshold: 0.4 });
  const [display, setDisplay] = useState('0');

  // parse target
  const { target, dec, prefix } = useMemo(() => {
    const s = String(value);
    const negative = s.startsWith('−') || s.startsWith('-');
    const cleaned = s.replace(/[−-]/g, '');
    const n = parseFloat(cleaned);
    if (isNaN(n)) return { target: 0, dec: 0, prefix: '' };
    const dotIdx = cleaned.indexOf('.');
    const d = decimals != null ? decimals : (dotIdx >= 0 ? cleaned.length - dotIdx - 1 : 0);
    return { target: n, dec: d, prefix: negative ? '−' : '' };
  }, [value, decimals]);

  useEffect(() => {
    if (!seen) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = target * eased;
      setDisplay(prefix + cur.toFixed(dec));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, target, duration, dec, prefix]);

  // if not seen yet, render 0 with same format
  return <span ref={ref}>{seen ? display : (prefix + (0).toFixed(dec))}</span>;
}

/* ---------- SPLIT TEXT REVEAL ---------- */
export function SplitReveal({ text, delay = 0, stagger = 30, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll('.reveal-char');
    const trigger = () => {
      chars.forEach((c, i) => {
        setTimeout(() => c.classList.add('in'), delay + i * stagger);
      });
    };
    return __watch(el, trigger, 80);
  }, [text]);

  // split keeping spaces but wrapping each non-space char
  const parts = String(text).split(/(\s+|\n)/);
  return (
    <span ref={ref} className={className}>
      {parts.map((p, i) => {
        if (p === '\n') return <br key={i} />;
        if (/^\s+$/.test(p)) return <span key={i}>&nbsp;</span>;
        return (
          <span key={i} className="reveal-word">
            {[...p].map((ch, j) => (
              <span key={j} className="reveal-char">{ch}</span>
            ))}
          </span>
        );
      })}
    </span>
  );
}

/* ---------- SPARKLINE ---------- */
export function Sparkline({ points, color = '#D62828', height = 60, animate = true, fill = false }) {
  const ref = useRef(null);
  const seen = useInView(ref, { threshold: 0.4 });
  const W = 320, H = height;
  const xs = points.map((_, i) => (i / (points.length - 1)) * W);
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const ys = points.map(p => H - 6 - ((p - min) / range) * (H - 12));
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  const dFill = d + ` L ${W} ${H} L 0 ${H} Z`;

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      {fill && (
        <path d={dFill} fill={color} opacity="0.12" />
      )}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        className={`sk-path ${seen && animate ? 'in' : ''}`}
        style={{
          strokeDasharray: animate ? 1500 : 0,
          strokeDashoffset: seen || !animate ? 0 : 1500,
          transition: 'stroke-dashoffset 2.4s cubic-bezier(.2,.7,.2,1)',
        }}
      />
      {/* end dot */}
      <circle
        cx={xs[xs.length - 1]}
        cy={ys[ys.length - 1]}
        r="3"
        fill={color}
        opacity={seen ? 1 : 0}
        style={{ transition: 'opacity 0.4s 1.8s' }}
      />
    </svg>
  );
}

/* ---------- DUAL-LINE CHART ---------- */
export function DualLineChart({ a, b, labels, labelA = 'A', labelB = 'B', height = 200 }) {
  const ref = useRef(null);
  const seen = useInView(ref, { threshold: 0.3 });
  const W = 600, H = height;
  const pad = { l: 30, r: 12, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const all = [...a, ...b];
  const max = Math.max(...all), min = Math.min(...all, 0);
  const range = max - min || 1;
  const xs = a.map((_, i) => pad.l + (i / (a.length - 1)) * innerW);
  const yA = a.map(v => pad.t + (1 - (v - min) / range) * innerH);
  const yB = b.map(v => pad.t + (1 - (v - min) / range) * innerH);
  const pathA = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${yA[i].toFixed(1)}`).join(' ');
  const pathB = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${yB[i].toFixed(1)}`).join(' ');

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {/* gridlines */}
      {[0, 0.5, 1].map((t, i) => (
        <line key={i}
          x1={pad.l} x2={W - pad.r}
          y1={pad.t + t * innerH} y2={pad.t + t * innerH}
          stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      ))}
      {/* fills */}
      <path
        d={pathA + ` L ${W - pad.r} ${H - pad.b} L ${pad.l} ${H - pad.b} Z`}
        fill="#E8B23A" opacity={seen ? 0.18 : 0}
        style={{ transition: 'opacity 1.4s 0.4s' }}
      />
      {/* lines */}
      <path d={pathA} fill="none" stroke="#E8B23A" strokeWidth="2.2"
        strokeLinejoin="round" strokeLinecap="round"
        style={{
          strokeDasharray: 1500,
          strokeDashoffset: seen ? 0 : 1500,
          transition: 'stroke-dashoffset 2s cubic-bezier(.2,.7,.2,1)',
        }} />
      <path d={pathB} fill="none" stroke="#4F8A3F" strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4 3"
        style={{
          opacity: seen ? 1 : 0,
          transition: 'opacity 1.4s 1s',
        }} />
      {/* x-axis labels */}
      {labels && labels.map((lab, i) => i % Math.ceil(labels.length / 6) === 0 && (
        <text key={i} x={xs[i]} y={H - 8}
          textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.6"
          fontFamily="JetBrains Mono, monospace">{lab}</text>
      ))}
      {/* legend */}
      <g transform={`translate(${pad.l}, ${pad.t - 4})`}>
        <rect width="10" height="10" fill="#E8B23A" />
        <text x="16" y="9" fontSize="10" fill="currentColor" fontWeight="600">{labelA}</text>
        <rect x="80" width="10" height="2" y="4" fill="#4F8A3F" />
        <text x="96" y="9" fontSize="10" fill="currentColor" fontWeight="600">{labelB}</text>
      </g>
    </svg>
  );
}

/* ---------- FUNNEL ---------- */
export function FunnelChart({ stages }) {
  const ref = useRef(null);
  const seen = useInView(ref, { threshold: 0.4 });
  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {stages.map((s, i) => {
        const w = 100 - i * 22;
        return (
          <div key={i} style={{
            width: seen ? `${w}%` : '0%',
            background: i === 0 ? 'var(--ink)' : i === stages.length - 1 ? 'var(--crimson)' : 'var(--ink-3, #2a2a2a)',
            color: '#FAF7F0',
            padding: '10px 16px',
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: 12,
            alignItems: 'baseline',
            transition: `width 0.9s cubic-bezier(.2,.7,.2,1) ${i * 0.12}s`,
            fontSize: 13,
          }}>
            <span style={{ fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>{s.value}</span>
            <span style={{ fontSize: 11, color: i === stages.length - 1 ? '#FAF7F0' : '#E8B23A', letterSpacing: 0.5, minWidth: 40, textAlign: 'right' }}>{s.pct}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- RANK STRIP ---------- */
export function RankStrip({ ranks }) {
  const ref = useRef(null);
  const seen = useInView(ref, { threshold: 0.3 });
  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {ranks.map((r, i) => (
        <div key={i} style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 70px',
          gap: 12, alignItems: 'center',
          background: r.tier === 0 ? 'var(--ink)' : r.tier === 1 ? 'var(--crimson)' : 'var(--bg-2)',
          color: r.tier === 0 ? 'var(--gold)' : r.tier === 1 ? '#fff' : 'var(--fg)',
          padding: '10px 14px',
          fontSize: 13,
          opacity: seen ? 1 : 0,
          transform: seen ? 'translateX(0)' : 'translateX(-30px)',
          transition: `opacity 0.5s ${i * 0.12}s, transform 0.5s ${i * 0.12}s`,
        }}>
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em' }}>#{r.pos}</span>
          <span style={{ fontWeight: 600 }}>{r.name}</span>
          <span style={{ fontSize: 10, letterSpacing: 1, opacity: 0.85, textAlign: 'right' }}>{r.src}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
 *  NAV
 * ============================================================ */
export function Nav({ active, t, lang, setLang, sections }) {
  const cur = sections.findIndex(s => s.id === active);
  const curIdx = Math.max(0, cur);
  const curSec = sections[curIdx] || sections[0];
  return (
    <nav className="nav">
      <a href="#hero" className="brand">Anh<span className="dot">.</span></a>
      <div className="links">
        <a href="#profile" className={active === 'profile' ? 'active' : ''}>{t.nav.profile}</a>
        <a href="#pillars" className={active === 'pillars' ? 'active' : ''}>{t.nav.pillars}</a>
        <a href="#work"    className={active === 'work' ? 'active' : ''}>{t.nav.work}</a>
        <a href="#method"  className={active === 'method' ? 'active' : ''}>{t.nav.method}</a>
        <a href="#contact" className={active === 'contact' ? 'active' : ''}>{t.nav.contact}</a>
      </div>
      <div className="toggles">
        <div className="sec-ind">
          <span className="num">{String(curIdx + 1).padStart(2, '0')}</span>
          <span className="lbl">{curSec.label}</span>
        </div>
        <button className={`toggle ${lang === 'en' ? 'on' : ''}`} onClick={() => setLang('en')}>EN</button>
        <button className={`toggle ${lang === 'vi' ? 'on' : ''}`} onClick={() => setLang('vi')}>VI</button>
      </div>
    </nav>
  );
}

/* ============================================================
 *  TOP PROGRESS BAR (replaces left rail)
 * ============================================================ */
export function TopProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="topbar-progress">
      <div className="fill" style={{ transform: `scaleX(${progress})` }}></div>
    </div>
  );
}

/* ============================================================
 *  FLOATING DOCK
 * ============================================================ */
export function Dock() {
  return (
    <div className="dock">
      <a className="item" href="tel:+84886148937" aria-label="Call">
        <span className="tip">Call · 0886.148.937</span>
        <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>
      </a>
      <a className="item" href="https://zalo.me/0886148937" target="_blank" rel="noopener" aria-label="Zalo">
        <span className="tip">Zalo · 0886.148.937</span>
        <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: '-0.02em' }}>Z</span>
      </a>
      <a className="item" href="mailto:sandrabruh@proton.me" aria-label="Email">
        <span className="tip">sandrabruh@proton.me</span>
        <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      </a>
    </div>
  );
}

/* ============================================================
 *  HERO
 * ============================================================ */
export function Hero({ t, variant }) {
  // variant: 'split' (default), 'massive', 'meta'
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section className="s hero" id="hero">
      <div className="hero-stack" ref={ref}>
        <div className="hero-pills">
          {t.hero.pills.map((p, i) => (
            <span key={i} className={`pill ${i === 0 ? 'solid' : ''}`}>{p}</span>
          ))}
        </div>

        {variant === 'massive' ? (
          <h1 className="display-xl">
            <SplitReveal text={t.hero.title.replace('.', '')} stagger={60} />
            <span className="dot-crimson">.</span>
          </h1>
        ) : (
          <h1 className="display-xl">
            <SplitReveal text={t.hero.title.replace('.', '')} stagger={40} />
            <span className="dot-crimson">.</span>
          </h1>
        )}

        <div className="hero-meta">
          <div>
            <div className="who">{t.hero.name}</div>
            <div className="who-sub">{t.hero.role}</div>
            <p className="lead" style={{ marginTop: 18, maxWidth: '52ch' }}>
              {t.hero.lead}
            </p>
          </div>
          <div className="hero-kpis">
            {t.hero.kpis.map((k, i) => (
              <div className="kpi" key={i}>
                <div className="v">
                  <CountUp value={k.v} />
                  {k.u && <span className="u">{k.u}</span>}
                </div>
                <div className="l">{k.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="scroll-cue">
        <span>{t.hero.scroll}</span>
        <span className="bar"></span>
      </div>
    </section>
  );
}

/* ============================================================
 *  MARQUEE
 * ============================================================ */
export function Marquee({ items }) {
  // duplicate so loop is seamless
  const seq = [...items, ...items, ...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {seq.map((w, i) => (
          <span className="item" key={i}>
            {w}
            <span className="star">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function PortraitImage({ src, alt }) {
  const [status, setStatus] = useState('checking'); // checking | ok | missing
  useEffect(() => {
    let cancelled = false;
    fetch(src, { method: 'HEAD' })
      .then((r) => { if (!cancelled) setStatus(r.ok ? 'ok' : 'missing'); })
      .catch(() => { if (!cancelled) setStatus('missing'); });
    return () => { cancelled = true; };
  }, [src]);
  if (status !== 'ok') {
    return (
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 8,
          color: 'var(--fg-soft)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
          background: 'repeating-linear-gradient(45deg, var(--bg-2) 0 12px, var(--bg-3) 12px 24px)',
        }}
      >
        <span>[ portrait ]</span>
        <span style={{ opacity: 0.6 }}>
          {status === 'checking' ? 'loading…' : 'drop portrait.png in /public/'}
        </span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center',
        display: 'block',
      }}
    />
  );
}

/* ============================================================
 *  PROFILE
 * ============================================================ */
export function Profile({ t }) {
  return (
    <section className="s" id="profile">
      <div className="sec-head">
        <div className="left">
          <span className="sec-num">{t.profile.eyebrow}</span>
          <h2><SplitReveal text={t.profile.title} stagger={28} /></h2>
        </div>
        <div className="right">{t.profile.lead}</div>
      </div>

      <div className="profile-grid">
        <div>
          <p className="lead" style={{ fontSize: 17, marginBottom: 32, maxWidth: '60ch' }}>
            “{t.profile.quote}”
          </p>

          <div>
            {t.profile.stats.map((s, i) => (
              <div className="bio-stat" key={i}>
                <div className="v">
                  <CountUp value={s.v} />
                  {s.u && <span className="u">{s.u}</span>}
                </div>
                <div className="l" dangerouslySetInnerHTML={{ __html: s.l.replace(/\*([^*]+)\*/g, '<b>$1</b>') }}></div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="photo-wrap">
            <div className="corner-tl"></div>
            <div className="corner-br"></div>
            <div className="tag">2026</div>
            <PortraitImage src="portrait.png" alt="Le Hoang Tuan Anh" />
          </div>
          <div style={{
            marginTop: 14, display: 'flex', justifyContent: 'space-between',
            fontSize: 11, letterSpacing: 1.5, color: 'var(--fg-soft)', textTransform: 'uppercase', fontWeight: 600,
          }}>
            <span>Lê Hoàng Tuấn Anh</span>
            <span>Can Tho · 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
 *  PILLARS
 * ============================================================ */
export function Pillars({ t }) {
  return (
    <section className="s" id="pillars">
      <div className="sec-head">
        <div className="left">
          <span className="sec-num crimson">{t.pillars.eyebrow}</span>
          <h2>{t.pillars.title}</h2>
        </div>
        <div className="right">{t.pillars.sub}</div>
      </div>

      <div className="pillars-row">
        {t.pillars.items.map((p, i) => (
          <div className="pillar" key={i}>
            <div className="num">{p.num}</div>
            <h3>{p.h}</h3>
            <p>{p.p}</p>
            <div className="tags">
              {p.tags.map((tg, j) => <span className="tag" key={j}>{tg}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
 *  CASES TIMELINE
 * ============================================================ */
export function CaseChart({ kind, dark }) {
  if (kind === 'roas') {
    // ROAS trend Trung Son — 14 months
    const labels = ['Aug24','Sep','Oct','Nov','Dec','Jan25','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
    const a = [2.1, 2.4, 3.2, 4.1, 5.0, 5.8, 6.4, 7.2, 7.9, 8.6, 9.1, 9.5, 9.85, 9.7];
    const b = [1.0, 1.2, 1.5, 1.7, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.4, 2.5, 2.5, 2.6]; // cost
    return <DualLineChart a={a} b={b} labels={labels} labelA="ROAS" labelB="COST (norm.)" height={220} />;
  }
  if (kind === 'leads') {
    const labels = ['W1','W2','W3','W4'];
    const a = [32, 41, 48, 47];
    const b = [12, 14, 18, 19];
    return <DualLineChart a={a} b={b} labels={labels} labelA="LEADS" labelB="COST" height={180} />;
  }
  if (kind === 'funnel') {
    return <FunnelChart stages={[
      { label: 'Reach',     value: '480K', pct: '100%' },
      { label: 'Engaged',   value: '52K',  pct: '11%' },
      { label: 'Lead',      value: '1.9K', pct: '3.6%' },
      { label: 'Qualified', value: '420',  pct: '22% of L' },
    ]} />;
  }
  if (kind === 'rank') {
    return <RankStrip ranks={[
      { pos: 0, name: 'Featured Snippet · "ngói lợp loại nào tốt"', tier: 0, src: 'GOOGLE' },
      { pos: 1, name: 'SERP · "giá ngói lợp 2024"', tier: 1, src: 'GOOGLE' },
      { pos: 1, name: 'Shopping · "ngói màu xám"', tier: 1, src: 'SHOP' },
      { pos: 3, name: 'SERP · "đại lý ngói miền nam"', tier: 2, src: 'GOOGLE' },
      { pos: 5, name: 'SERP · "thi công ngói lợp"', tier: 2, src: 'GOOGLE' },
    ]} />;
  }
  return null;
}

export function CaseRow({ c, dark }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <div className="case-row reveal-up" ref={ref}>
      <div className="meta">
        <div className="yr">{c.yr}</div>
        <div className="idx">{c.idx}</div>
        <div className="ind">{c.ind}</div>
      </div>
      <div className={`case-card ${c.feature ? 'feature' : ''}`}>
        <h3>{c.name}</h3>
        <p className="summary">{c.summary}</p>

        <div className="case-kpis">
          {c.kpis.map((k, i) => (
            <div className="k" key={i}>
              <div className="v">
                <CountUp value={k.v} />
                {k.u && <span className="u">{k.u}</span>}
              </div>
              <div className="l">{k.l}</div>
            </div>
          ))}
        </div>

        {c.chart && (
          <div className="chart-shell">
            <div className="ct">
              <span>{c.chartTitle}</span>
              <span>[ FIG · {c.idx} ]</span>
            </div>
            <CaseChart kind={c.chart} dark={dark} />
          </div>
        )}

        <div className="case-tags">
          {c.tags.map((tg, i) => <span className="case-tag" key={i}>{tg}</span>)}
        </div>
      </div>
    </div>
  );
}

export function Cases({ t, dark }) {
  return (
    <section className="s" id="work">
      <div className="sec-head">
        <div className="left">
          <span className="sec-num crimson">{t.cases.eyebrow}</span>
          <h2>{t.cases.title}</h2>
        </div>
        <div className="right">{t.cases.sub}</div>
      </div>
      <div style={{ position: 'relative' }}>
        {t.cases.list.map((c, i) => <CaseRow key={i} c={c} dark={dark} />)}
      </div>
    </section>
  );
}

/* ============================================================
 *  METHODOLOGY
 * ============================================================ */
export function Methodology({ t }) {
  return (
    <section className="s" id="method">
      <div className="sec-head">
        <div className="left">
          <span className="sec-num">{t.method.eyebrow}</span>
          <h2>{t.method.title}</h2>
        </div>
        <div className="right">{t.method.sub}</div>
      </div>
      <div className="flow-grid">
        {t.method.steps.map((s, i) => {
          const ref = useRef(null);
          useReveal(ref);
          return (
            <div className="flow-cell reveal-up" ref={ref} key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="step">{s.step}</div>
              <div className="ttl">{s.h}</div>
              <div className="des">{s.d}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
 *  HIGHLIGHTS
 * ============================================================ */
export function Highlights({ t }) {
  // mini sparklines for each
  const sparks = [
    [2,2.4,3.1,4,5,5.8,6.4,7.2,7.9,8.6,9.1,9.5,9.85],
    [55,58,62,68,70,72,74,75],
    [80,120,160,200,260,300],
  ];
  const colors = ['#D62828', '#111', '#E8B23A'];
  return (
    <section className="s" id="highlights">
      <div className="sec-head">
        <div className="left">
          <span className="sec-num crimson">{t.highlights.eyebrow}</span>
          <h2>{t.highlights.title}</h2>
        </div>
        <div className="right">{t.highlights.sub}</div>
      </div>
      <div className="hl-grid">
        {t.highlights.items.map((it, i) => (
          <div className="hl-card" key={i}>
            <div className="tag">{it.tag}</div>
            <div className="v">
              <CountUp value={it.v} />
              <span className="u"> {it.u}</span>
            </div>
            <div className="l">{it.l}</div>
            <div className="spark">
              <Sparkline points={sparks[i]} color={colors[i]} height={50} fill />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
 *  SKILLS
 * ============================================================ */
export function Skills({ t }) {
  return (
    <section className="s" id="skills">
      <div className="sec-head">
        <div className="left">
          <span className="sec-num">{t.skills.eyebrow}</span>
          <h2>{t.skills.title}</h2>
        </div>
        <div className="right">{t.skills.sub}</div>
      </div>
      {t.skills.groups.map((g, i) => (
        <div key={i} style={{ marginTop: i === 0 ? 0 : 36 }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, letterSpacing: 2, color: 'var(--crimson)',
            fontWeight: 700, marginBottom: 10,
          }}>
            [{String(i + 1).padStart(2, '0')}] {g.cat.toUpperCase()}
          </div>
          <div className="skills-grid">
            {g.items.map(([nm, w], j) => {
              const ref = useRef(null);
              useReveal(ref);
              return (
                <div className="skill-tile reveal-up" ref={ref} key={j}
                  style={{ '--w': w, transitionDelay: `${j * 0.08}s` }}>
                  <div className="cat">{g.cat}</div>
                  <div className="nm">{nm}</div>
                  <div className="bar"><span></span></div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

/* ============================================================
 *  CONTACT
 * ============================================================ */
export function Contact({ t }) {
  return (
    <section className="s" id="contact">
      <div className="sec-head">
        <div className="left">
          <span className="sec-num crimson">{t.contact.eyebrow}</span>
          <h2><SplitReveal text={t.contact.title} stagger={50} /></h2>
        </div>
        <div className="right">{t.contact.lead}</div>
      </div>

      <div className="contact-grid">
        <div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
          }}>
            {t.contact.cards.map((c, i) => (
              <div className="contact-card" key={i}>
                <div className="lbl">{c.lbl}</div>
                <div className="val">{c.val}</div>
                <div className="sub">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{
            fontSize: 12, letterSpacing: 2, color: 'var(--crimson)',
            fontWeight: 700, marginBottom: 12, textTransform: 'uppercase',
          }}>● {t.contact.cta}</div>

          <a
            href="mailto:sandrabruh@proton.me"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 14,
              padding: '20px 28px',
              background: 'var(--crimson)',
              color: '#fff',
              fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#9F1F1F'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'var(--crimson)'; }}
          >
            <span>{t.nav.contact} →</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
 *  FOOTER
 * ============================================================ */
export function Footer({ t }) {
  return (
    <footer className="f">
      <div style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 30,
        alignItems: 'end', marginBottom: 24,
        borderBottom: '1px solid var(--line)', paddingBottom: 24,
      }}>
        <div style={{
          fontSize: 11, letterSpacing: 2, color: 'var(--fg-soft)',
          fontWeight: 600, textTransform: 'uppercase',
        }}>{t.footer.tag}</div>
        <div style={{
          fontSize: 15, letterSpacing: -0.2, color: 'var(--fg)',
          fontWeight: 600, textAlign: 'center', maxWidth: '40ch', margin: '0 auto',
        }}>“{t.footer.quote}”</div>
        <div style={{
          fontSize: 11, letterSpacing: 2, color: 'var(--fg-soft)',
          fontWeight: 600, textAlign: 'right', textTransform: 'uppercase',
        }}>17 PAGES · 6 CASE STUDIES</div>
      </div>
      <div className="big">Anh<span className="dot">.</span></div>
      <div className="meta">
        {t.footer.meta.map((m, i) => <span key={i}>{m}</span>)}
      </div>
    </footer>
  );
}


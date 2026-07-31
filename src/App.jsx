import React, { useEffect, useState } from 'react';
import { CONTENT } from './content.js';
import { initBackground } from './bg.js';
import {
  Nav, TopProgress, Dock, Hero, Marquee, Profile, Pillars, Cases,
  Methodology, Highlights, Skills, Faq, Contact, Footer,
} from './sections.jsx';
import {
  TweaksPanel, TweakSection, TweakSelect, TweakSlider, TweakRadio,
  useTweaks,
} from './components/TweaksPanel.jsx';

const TWEAK_DEFAULTS = {
  bgVariant: 'flowfield',
  motion: 70,
  fontScale: 1,
  heroVariant: 'split',
};

export default function App() {
  // Lúc prerender (Node) không có localStorage → mặc định 'vi', khớp với
  // <html lang="vi"> và FAQPage schema tiếng Việt trong index.html.
  const [lang, setLang] = useState(() => {
    if (typeof localStorage === 'undefined') return 'vi';
    return localStorage.getItem('portfolio-lang') || 'vi';
  });
  const [active, setActive] = useState('hero');
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Init background canvas once
  useEffect(() => {
    initBackground();
  }, []);

  useEffect(() => {
    localStorage.setItem('portfolio-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', tweaks.fontScale);
  }, [tweaks.fontScale]);

  useEffect(() => {
    window.__bg = {
      variant: tweaks.bgVariant,
      intensity: (tweaks.motion ?? 70) / 100,
      dark: false,
    };
  }, [tweaks.bgVariant, tweaks.motion]);

  const t = CONTENT[lang];

  // Section tracking via scroll
  useEffect(() => {
    const ids = ['hero', 'profile', 'pillars', 'work', 'method', 'highlights', 'skills', 'faq', 'contact'];
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const probe = window.innerHeight * 0.35;
        let cur = 'hero';
        for (const id of ids) {
          const el = document.getElementById(id);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (r.top <= probe && r.bottom > probe) { cur = id; break; }
          if (r.top <= probe) cur = id;
        }
        setActive(cur);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [lang]);

  // Smooth scroll
  useEffect(() => {
    const handler = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const nav = document.querySelector('.nav');
      const offset = (nav ? nav.offsetHeight : 64) + 16;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const railSections = [
    { id: 'hero',    label: 'Intro' },
    { id: 'profile', label: t.nav.profile },
    { id: 'pillars', label: t.nav.pillars },
    { id: 'work',    label: t.nav.work },
    { id: 'method',  label: t.nav.method },
    { id: 'highlights', label: 'Highlights' },
    { id: 'skills', label: 'Skills' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: t.nav.contact },
  ];

  return (
    <>
      <Nav active={active} t={t} lang={lang} setLang={setLang} sections={railSections} />
      <TopProgress />
      <Dock />

      <main id="main">
        <Hero t={t} variant={tweaks.heroVariant} />
        <Marquee items={t.marquee} />
        <Profile t={t} />
        <Pillars t={t} />
        <Cases t={t} />
        <Methodology t={t} />
        <Highlights t={t} />
        <Skills t={t} />
        <Faq t={t} />
        <Contact t={t} />
      </main>
      <Footer t={t} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Background">
          <TweakSelect
            label="Effect"
            value={tweaks.bgVariant}
            options={[
              { value: 'flowfield', label: 'Flowfield' },
              { value: 'mesh',      label: 'Gradient mesh' },
              { value: 'grid',      label: 'Grid + dots' },
              { value: 'minimal',   label: 'Minimal' },
            ]}
            onChange={(v) => setTweak('bgVariant', v)}
          />
        </TweakSection>

        <TweakSection label="Motion">
          <TweakSlider
            label="Intensity"
            value={tweaks.motion}
            min={0} max={100} step={5}
            onChange={(v) => setTweak('motion', v)}
            unit="%"
          />
        </TweakSection>

        <TweakSection label="Type">
          <TweakSlider
            label="Font scale"
            value={tweaks.fontScale}
            min={0.8} max={1.2} step={0.05}
            onChange={(v) => setTweak('fontScale', v)}
            unit="×"
          />
        </TweakSection>

        <TweakSection label="Hero">
          <TweakRadio
            label="Variant"
            value={tweaks.heroVariant}
            options={[
              { value: 'split',   label: 'Split' },
              { value: 'massive', label: 'Massive' },
            ]}
            onChange={(v) => setTweak('heroVariant', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

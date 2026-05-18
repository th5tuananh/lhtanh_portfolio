# Le Hoang Tuan Anh — Portfolio 2026

Senior Digital Marketing & Mar-Tech Specialist · Personal portfolio website.

Built with **React 18 + Vite**. Single-page scroll, bilingual (EN / VI), cream-paper aesthetic with a live WebGL-style flowfield background.

---

## ✨ Features

- **Hero** — animated letter-by-letter reveal + KPI count-ups
- **Capability pillars** — Data · System · Scale
- **Case timeline** — 5 case studies with live ROAS / funnel / rank charts (Trung Son Care featured)
- **Methodology** — 4-step data-driven loop
- **Highlights** — sparklines that draw on scroll
- **Tools & stack** — skill bars
- **Contact** — phone, Zalo, email, location
- **Bilingual toggle** EN ⇄ VI (persists in localStorage)
- **Floating dock** — call / Zalo / email always-on-screen
- **Tweaks panel** — change background effect, motion intensity, font scale, hero variant
- **Smooth-scroll** between sections, left-rail progress indicator

---

## 🚀 Run locally

Requires **Node.js 18+** and **npm**.

```bash
# from this directory
npm install
npm run dev
```

Open <http://localhost:5173>.

### Production build

```bash
npm run build      # → dist/
npm run preview    # serve dist/ locally to verify
```

---

## 📸 Adding your portrait photo

Drop your photo at `public/portrait.png`. Aspect ratio 4:5 looks best (e.g. 800×1000).

```
public/
  portrait.png   ← here
```

If the file is missing, a placeholder is shown automatically.

---

## ☁️ Deploy to Vercel

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vite is auto-detected, no further config needed.

### Option B — Push to GitHub + import on Vercel

1. Create a new GitHub repo and push this folder:

   ```bash
   git init
   git add .
   git commit -m "Initial commit — portfolio 2026"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

2. Go to <https://vercel.com/new>, import the repo. Vercel detects Vite automatically.
3. Click **Deploy**. Your site goes live at `https://<repo-name>.vercel.app`.

`vercel.json` is already included with Vite settings.

---

## ✏️ Editing content

All copy (English + Vietnamese) lives in **one file**: `src/content.js`.

Change values there and save — the dev server hot-reloads.

To change colors, edit the CSS tokens at the top of `src/styles.css`:

```css
:root {
  --cream:   #FAF7F0;
  --ink:     #111111;
  --crimson: #D62828;  /* primary accent */
  --gold:    #E8B23A;
  --green:   #4F8A3F;
}
```

---

## 🗂 Project structure

```
.
├── index.html                  # Vite entry — refs /src/main.jsx
├── package.json
├── vite.config.js
├── vercel.json                 # Vercel config (auto-detected Vite)
├── .gitignore
├── public/
│   └── portrait.png            # ← drop your photo here
└── src/
    ├── main.jsx                # bootstraps React
    ├── App.jsx                 # routes state + lays out sections
    ├── content.js              # ALL copy (EN + VI)
    ├── sections.jsx            # every section + chart components
    ├── bg.js                   # flowfield canvas
    ├── styles.css              # all styles
    └── components/
        └── TweaksPanel.jsx     # in-page settings panel
```

---

## 🎨 Brand

- **Wordmark**: `Anh.` with a crimson dot
- **Tagline**: *Marketing isn't art. It's the engineering of numbers.*
- **Pillars**: Data · System · Scale
- **Typography**: Inter (300–900) + JetBrains Mono for data labels

---

## 📞 Contact

- **Phone / Zalo** — 0886.148.937
- **Email** — sandrabruh@proton.me
- **Location** — Can Tho · HCMC (Remote flexible)

---

© 2026 Le Hoang Tuan Anh. All metrics in this portfolio come directly from dashboards I personally operated.

# SEO Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm full SEO stack vào portfolio — react-snap prerender, 3 JSON-LD schemas, hreflang, geo meta, robots.txt, sitemap.xml, vercel.json — để tăng cơ hội Top 1/Top 0 cho "digital marketing cần thơ" và branded queries.

**Architecture:** react-snap chạy sau Vite build (`postbuild` script), snapshot `dist/index.html` thành HTML tĩnh chứa full content — Googlebot thấy ngay không cần render JS. JSON-LD trong `<head>` cung cấp Person + WebSite + FAQ schema. Vercel nhận `dist/` tĩnh, không cần server config thêm.

**Tech Stack:** React 18, Vite 5, react-snap 1.23.0 (Puppeteer-based prerender), Vercel static hosting, Schema.org JSON-LD

---

## File Map

| File | Thay đổi |
|------|---------|
| `package.json` | Thêm `react-snap` devDep, `postbuild` script, `reactSnap` config block |
| `src/main.jsx` | Thay `createRoot` bằng hydrate-fallback pattern |
| `index.html` | Thêm 3 JSON-LD blocks + hreflang + geo meta + description mới |
| `public/robots.txt` | Tạo mới |
| `public/sitemap.xml` | Tạo mới |
| `vercel.json` | Tạo mới — cache header cho `/assets/` |

---

## Task 1: Cài react-snap và configure package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Cài react-snap**

  ```bash
  npm install --save-dev react-snap
  ```

  Kỳ vọng: `package.json` cập nhật `devDependencies` với `"react-snap": "^1.23.0"`.

- [ ] **Step 2: Thêm `postbuild` script và `reactSnap` config vào `package.json`**

  Sửa `package.json` thành:

  ```json
  {
    "name": "lhta-portfolio",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "description": "Le Hoang Tuan Anh — Senior Digital Marketing & Mar-Tech Specialist · Portfolio 2026",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "postbuild": "react-snap",
      "preview": "vite preview"
    },
    "reactSnap": {
      "source": "dist",
      "destination": "dist",
      "include": ["/"],
      "puppeteerArgs": ["--no-sandbox", "--disable-setuid-sandbox"],
      "inlineCss": false,
      "minifyHtml": false,
      "crawl": false
    },
    "dependencies": {
      "react": "^18.3.1",
      "react-dom": "^18.3.1"
    },
    "devDependencies": {
      "@vitejs/plugin-react": "^4.3.4",
      "react-snap": "^1.23.0",
      "vite": "^5.4.10"
    }
  }
  ```

  > `crawl: false` + `include: ["/"]` — chỉ snapshot root, không crawl link con (SPA một route).
  > `puppeteerArgs` — bắt buộc cho Linux build environment (Vercel, CI).

- [ ] **Step 3: Xác nhận cài đặt**

  ```bash
  node -e "require('./node_modules/react-snap/index.js'); console.log('react-snap OK')"
  ```

  Kỳ vọng: in ra `react-snap OK` (không throw error).

- [ ] **Step 4: Commit**

  ```bash
  git add package.json package-lock.json
  git commit -m "feat(seo): install react-snap, add postbuild prerender script"
  ```

---

## Task 2: Cập nhật src/main.jsx — hydrate fallback

**Files:**
- Modify: `src/main.jsx`

**Context:** react-snap tạo ra `dist/index.html` với HTML đã render sẵn. Khi Vercel serve file này, browser nhận HTML tĩnh với `<div id="app">` đã có content. React cần `hydrateRoot` thay vì `createRoot` để attach event listeners mà không re-render từ đầu (tránh flash).

- [ ] **Step 1: Thay nội dung `src/main.jsx`**

  ```jsx
  import React from 'react';
  import { hydrateRoot, createRoot } from 'react-dom/client';
  import App from './App.jsx';
  import './styles.css';

  const container = document.getElementById('app');

  if (container.hasChildNodes()) {
    hydrateRoot(container, <React.StrictMode><App /></React.StrictMode>);
  } else {
    createRoot(container).render(<React.StrictMode><App /></React.StrictMode>);
  }
  ```

  > `hasChildNodes()` — true khi react-snap đã inject HTML vào `#app`; false khi dev server (không prerender).

- [ ] **Step 2: Kiểm tra dev server vẫn chạy bình thường**

  ```bash
  npm run dev
  ```

  Mở `http://localhost:5173`. Portfolio load bình thường, không có console error.

- [ ] **Step 3: Commit**

  ```bash
  git add src/main.jsx
  git commit -m "feat(seo): add hydrateRoot fallback for react-snap prerender"
  ```

---

## Task 3: Cập nhật index.html — JSON-LD + meta

**Files:**
- Modify: `index.html`

**Context:** `index.html` hiện có canonical, OG, Twitter Card. Cần thêm: description mới (có keyword VI), geo meta, hreflang, và 3 JSON-LD script blocks (Person, WebSite, FAQPage).

- [ ] **Step 1: Thay toàn bộ `index.html`**

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Le Hoang Tuan Anh — Portfolio 2026</title>
  <meta name="description" content="Senior Digital Marketing &amp; Mar-Tech Specialist tại Cần Thơ, Việt Nam. 5+ năm vận hành Google Ads, Meta Ads, GA4, GTM Server-Side. Data · System · Scale." />
  <meta name="author" content="Le Hoang Tuan Anh" />
  <meta name="geo.region" content="VN-CT" />
  <meta name="geo.placename" content="Cần Thơ, Vietnam" />
  <meta name="theme-color" content="#FAF7F0" />
  <link rel="canonical" href="https://www.lhtanh.me/" />
  <link rel="alternate" hreflang="en" href="https://www.lhtanh.me/" />
  <link rel="alternate" hreflang="vi" href="https://www.lhtanh.me/" />
  <link rel="alternate" hreflang="x-default" href="https://www.lhtanh.me/" />

  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23FAF7F0'/><text x='6' y='24' font-family='Inter,sans-serif' font-weight='900' font-size='22' fill='%23111'>A</text><circle cx='25' cy='25' r='3' fill='%23D62828'/></svg>" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

  <!-- Open Graph -->
  <meta property="og:site_name" content="Le Hoang Tuan Anh" />
  <meta property="og:title" content="Le Hoang Tuan Anh — Portfolio 2026" />
  <meta property="og:description" content="Senior Digital Marketing &amp; Mar-Tech Specialist. Data · System · Scale." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.lhtanh.me/" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:locale:alternate" content="vi_VN" />
  <meta property="og:image" content="https://www.lhtanh.me/og-image.jpg" />
  <meta property="og:image:secure_url" content="https://www.lhtanh.me/og-image.jpg" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Le Hoang Tuan Anh — Digital Marketing Specialist · Google Ads, Meta Ads, TikTok Ads, GA4, GTM" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Le Hoang Tuan Anh — Portfolio 2026" />
  <meta name="twitter:description" content="Senior Digital Marketing &amp; Mar-Tech Specialist. Data · System · Scale." />
  <meta name="twitter:image" content="https://www.lhtanh.me/og-image.jpg" />
  <meta name="twitter:image:alt" content="Le Hoang Tuan Anh — Digital Marketing Specialist · Google Ads, Meta Ads, TikTok Ads, GA4, GTM" />

  <!-- JSON-LD: Person -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Le Hoang Tuan Anh",
    "alternateName": "Lê Hoàng Tuấn Anh",
    "jobTitle": "Senior Digital Marketing & Mar-Tech Specialist",
    "url": "https://www.lhtanh.me/",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Cần Thơ",
      "addressCountry": "VN"
    },
    "knowsAbout": [
      "Digital Marketing",
      "Mar-Tech",
      "Google Ads",
      "Meta Ads",
      "TikTok Ads",
      "GA4",
      "GTM Server-Side",
      "Facebook CAPI",
      "SEO",
      "E-Commerce",
      "Data Analytics"
    ],
    "sameAs": [
      "https://www.linkedin.com/in/lhtanhct/",
      "https://github.com/th5tuananh"
    ]
  }
  </script>

  <!-- JSON-LD: WebSite (Sitelinks Search Box) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Le Hoang Tuan Anh — Portfolio",
    "url": "https://www.lhtanh.me/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.lhtanh.me/?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }
  </script>

  <!-- JSON-LD: FAQPage (Top 0 / Featured Snippet) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Le Hoang Tuan Anh là ai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Le Hoang Tuan Anh (Lê Hoàng Tuấn Anh) là Senior Digital Marketing & Mar-Tech Specialist tại Cần Thơ, Việt Nam, với 5+ năm kinh nghiệm vận hành quảng cáo đa kênh (Google Ads, Meta Ads, TikTok Ads) và xây dựng hệ thống đo lường (GA4, GTM Server-Side, Facebook CAPI). Chuyên sâu về E-Commerce và Mar-Tech."
        }
      },
      {
        "@type": "Question",
        "name": "Dịch vụ digital marketing tại Cần Thơ gồm những gì?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dịch vụ digital marketing tại Cần Thơ bao gồm: chiến lược quảng cáo đa kênh (Google Ads, Meta Ads, TikTok Ads), triển khai tracking server-side (GTM Server, Facebook CAPI, GA4 Enhanced), tối ưu ROAS E-Commerce, và xây dựng hệ thống báo cáo tự động. Liên hệ Le Hoang Tuan Anh tại www.lhtanh.me."
        }
      },
      {
        "@type": "Question",
        "name": "Mar-Tech là gì?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Mar-Tech (Marketing Technology) là hệ thống công nghệ hỗ trợ marketing hiện đại: server-side tracking, CRM integration, data pipeline, và marketing automation. Le Hoang Tuan Anh chuyên triển khai Mar-Tech cho doanh nghiệp E-Commerce tại Việt Nam."
        }
      }
    ]
  }
  </script>
  </head>
  <body>
  <canvas id="bg-canvas"></canvas>
  <div id="app"></div>
  <script type="module" src="/src/main.jsx"></script>
  </body>
  </html>
  ```

- [ ] **Step 2: Verify cú pháp JSON-LD hợp lệ**

  ```bash
  node -e "
  const fs = require('fs');
  const html = fs.readFileSync('index.html', 'utf8');
  const matches = html.match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g);
  matches.forEach((m, i) => {
    const json = m.replace(/<script[^>]*>/, '').replace('<\/script>', '').trim();
    JSON.parse(json);
    console.log('Schema', i+1, 'valid OK');
  });
  "
  ```

  Kỳ vọng:
  ```
  Schema 1 valid OK
  Schema 2 valid OK
  Schema 3 valid OK
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add index.html
  git commit -m "feat(seo): add JSON-LD schemas, hreflang, geo meta, updated description"
  ```

---

## Task 4: Tạo public/robots.txt và public/sitemap.xml

**Files:**
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`

- [ ] **Step 1: Tạo `public/robots.txt`**

  ```
  User-agent: *
  Allow: /
  Sitemap: https://www.lhtanh.me/sitemap.xml
  ```

- [ ] **Step 2: Tạo `public/sitemap.xml`**

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:xhtml="http://www.w3.org/1999/xhtml">
    <url>
      <loc>https://www.lhtanh.me/</loc>
      <xhtml:link rel="alternate" hreflang="en" href="https://www.lhtanh.me/" />
      <xhtml:link rel="alternate" hreflang="vi" href="https://www.lhtanh.me/" />
      <lastmod>2026-05-21</lastmod>
      <changefreq>monthly</changefreq>
      <priority>1.0</priority>
    </url>
  </urlset>
  ```

- [ ] **Step 3: Verify Vite copy file vào dist khi build**

  ```bash
  npm run build 2>&1 | grep -E "dist|error|warn" | head -10
  ls dist/robots.txt dist/sitemap.xml
  ```

  Kỳ vọng: cả hai file có trong `dist/`. Nếu react-snap chạy (postbuild), build sẽ mất ~15-30s.

  > **Nếu react-snap timeout hoặc error:** Xem log. Thường gặp: port 45678 bị chiếm → thêm `"port": 45679` vào `reactSnap` config.

- [ ] **Step 4: Commit**

  ```bash
  git add public/robots.txt public/sitemap.xml
  git commit -m "feat(seo): add robots.txt and sitemap.xml"
  ```

---

## Task 5: Tạo vercel.json

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Tạo `vercel.json`**

  ```json
  {
    "headers": [
      {
        "source": "/assets/(.*)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
  ```

  > Assets Vite build (`/assets/*.js`, `/assets/*.css`) có content-hash trong tên file nên safe để cache 1 năm. Cải thiện Core Web Vitals (LCP) → gián tiếp tăng ranking.

- [ ] **Step 2: Commit**

  ```bash
  git add vercel.json
  git commit -m "feat(seo): add vercel.json with long-term asset cache headers"
  ```

---

## Task 6: Build test + verify prerender output

**Files:** Không thay đổi — chỉ verify

- [ ] **Step 1: Chạy full build**

  ```bash
  npm run build
  ```

  Kỳ vọng: build thành công, cuối log có thông báo react-snap hoàn thành (không có "Error" hay "Failed"). Thời gian ~20-40s.

  > Nếu thấy `Protocol error` hoặc `Navigation timeout` từ react-snap: thêm `"timeout": 60000` vào `reactSnap` config trong `package.json`.

- [ ] **Step 2: Verify HTML tĩnh chứa nội dung**

  ```bash
  grep -c "digital marketing" dist/index.html
  grep -c "Cần Thơ" dist/index.html
  grep -c "application/ld+json" dist/index.html
  grep -c "hreflang" dist/index.html
  ```

  Kỳ vọng (mỗi lệnh in ra số > 0):
  ```
  3   ← "digital marketing" trong JSON-LD + description
  3   ← "Cần Thơ" trong JSON-LD + description
  3   ← 3 script blocks JSON-LD
  3   ← 3 hreflang link tags
  ```

- [ ] **Step 3: Verify `#app` có content (prerender thành công)**

  ```bash
  node -e "
  const fs = require('fs');
  const html = fs.readFileSync('dist/index.html', 'utf8');
  const appMatch = html.match(/<div id=\"app\">([\s\S]{0,200})/);
  console.log(appMatch ? appMatch[1].substring(0, 100) : 'EMPTY — prerender FAILED');
  "
  ```

  Kỳ vọng: in ra HTML content (div, nav, section...) thay vì empty string.

  > Nếu `#app` empty: react-snap không snapshot được. Nguyên nhân thường gặp: app crash trong headless do `window.__bg` undefined. Fix: thêm guard trong `src/bg.js` — nhưng `initBackground()` đã có `if (!cvs) return` nên không cần sửa thêm.

- [ ] **Step 4: Preview build**

  ```bash
  npm run preview
  ```

  Mở `http://localhost:4173`. Portfolio load bình thường, không có console error.

---

## Task 7: Push lên GitHub → Vercel auto-deploy

**Files:** Không thay đổi

- [ ] **Step 1: Kiểm tra git status**

  ```bash
  git status
  git log --oneline -5
  ```

  Kỳ vọng: working tree clean, có 5 commits mới kể từ đầu task.

- [ ] **Step 2: Push lên GitHub**

  ```bash
  git push origin main
  ```

  Kỳ vọng: push thành công. Vercel sẽ auto-detect push và bắt đầu deploy.

- [ ] **Step 3: Kiểm tra Vercel deploy**

  Vào Vercel dashboard → xem deployment log. Tìm dòng `postbuild` script chạy react-snap. Deploy thành công khi status = "Ready".

- [ ] **Step 4: Verify live site**

  ```bash
  curl -s https://www.lhtanh.me/ | grep -c "application/ld+json"
  curl -s https://www.lhtanh.me/robots.txt
  curl -s https://www.lhtanh.me/sitemap.xml | head -10
  ```

  Kỳ vọng:
  - `3` (3 JSON-LD blocks)
  - robots.txt nội dung đúng
  - sitemap.xml nội dung đúng

- [ ] **Step 5: Test Rich Results**

  Truy cập `https://search.google.com/test/rich-results` → nhập `https://www.lhtanh.me/` → chạy test.

  Kỳ vọng: detect được **FAQPage** và **Person** schema, không có lỗi.

- [ ] **Step 6: Submit sitemap lên Google Search Console**

  - Vào Google Search Console → Sitemaps
  - Nhập `https://www.lhtanh.me/sitemap.xml` → Submit
  - Request indexing cho URL: `https://www.lhtanh.me/`

---

## Rollback

Nếu react-snap làm Vercel build fail:

1. Xóa `"postbuild"` khỏi `scripts` trong `package.json`
2. Xóa `"reactSnap"` config block
3. Push → Vercel build lại (không prerender, nhưng vẫn có JSON-LD + robots + sitemap)

Các JSON-LD, meta, robots.txt, sitemap.xml vẫn có tác dụng dù không prerender.

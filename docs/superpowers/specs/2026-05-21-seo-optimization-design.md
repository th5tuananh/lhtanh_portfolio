# Design Spec: SEO Optimization — lhtanh Portfolio

**Date:** 2026-05-21
**Status:** Approved
**Project:** lhtanh_portfolio — www.lhtanh.me

---

## 1. Context

Portfolio là React 18 + Vite 5 SPA, deploy Vercel từ GitHub. Hiện trạng SEO:
- Canonical + OG + Twitter Card đã có (origin/main)
- Không có JSON-LD, robots.txt, sitemap.xml, hreflang
- SPA: Googlebot phải render JS (2-pass) → chậm index, Top 0 khó

Mục tiêu: Job search + client acquisition. Keyword target: "digital marketing", "digital marketing cần thơ", "martech", tên cá nhân. Bilingual EN/VI.

---

## 2. Architecture

**Build pipeline sau khi implement:**

```
GitHub push
  → Vercel: npm run build
      → Vite build → dist/
      → postbuild: react-snap crawl dist/ (headless Chromium)
          → snapshot full HTML → dist/index.html
  → Vercel serve dist/ as static site
```

Canvas background (`initBackground`) fail silently trong headless vì `document.getElementById('bg-canvas')` trả về null → hàm `return` sớm, không crash.

**Vercel compatibility:** Output là `dist/` tĩnh thuần. Không cần server config. `vercel.json` chỉ thêm cache header cho `/assets/`.

---

## 3. Files thay đổi

| File | Thay đổi |
|------|---------|
| `package.json` | Thêm `react-snap` devDep, `"postbuild"` script, `reactSnap` config |
| `src/main.jsx` | Thêm `hydrate` fallback (snap detection) |
| `index.html` | JSON-LD schemas, hreflang, geo meta, description mới |
| `public/robots.txt` | Mới — allow all + sitemap pointer |
| `public/sitemap.xml` | Mới — single URL entry |
| `vercel.json` | Mới — cache header cho assets |

---

## 4. Structured Data (JSON-LD)

Ba script block trong `<head>` của `index.html`:

### 4.1 Person Schema

```json
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
```

Signal cho Google Knowledge Panel + branded search. `alternateName` giúp Google match cả tên tiếng Việt.

### 4.2 WebSite Schema (Sitelinks Search Box)

```json
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
```

Kích hoạt Sitelinks Search Box khi user search brand/tên ("Le Hoang Tuan Anh", "lhtanh.me"). Google quyết định show, schema là điều kiện cần.

### 4.3 FAQ Schema (Top 0 / Featured Snippet)

```json
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
```

Nhắm Top 0 (featured snippet) cho "digital marketing cần thơ", "martech là gì", và branded queries. Google có thể trích dẫn answer text trực tiếp lên đầu SERP.

---

## 5. Meta Tags bổ sung

```html
<!-- Author & Geo -->
<meta name="author" content="Le Hoang Tuan Anh" />
<meta name="geo.region" content="VN-CT" />
<meta name="geo.placename" content="Cần Thơ, Vietnam" />

<!-- Hreflang (cùng URL vì SPA toggle ngôn ngữ không đổi path) -->
<link rel="alternate" hreflang="en" href="https://www.lhtanh.me/" />
<link rel="alternate" hreflang="vi" href="https://www.lhtanh.me/" />
<link rel="alternate" hreflang="x-default" href="https://www.lhtanh.me/" />
```

**Description mới** (có keyword, bilingual signal):
```
Senior Digital Marketing & Mar-Tech Specialist tại Cần Thơ, Việt Nam.
5+ năm vận hành Google Ads, Meta Ads, GA4, GTM Server-Side.
Data · System · Scale.
```

---

## 6. Static Files

### `public/robots.txt`
```
User-agent: *
Allow: /
Sitemap: https://www.lhtanh.me/sitemap.xml
```

### `public/sitemap.xml`
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

### `vercel.json`
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 7. Prerender Config

### `package.json` additions

```json
{
  "scripts": {
    "postbuild": "react-snap"
  },
  "devDependencies": {
    "react-snap": "^1.23.0"
  },
  "reactSnap": {
    "source": "dist",
    "destination": "dist",
    "include": ["/"],
    "puppeteerArgs": ["--no-sandbox", "--disable-setuid-sandbox"],
    "inlineCss": false,
    "minifyHtml": false,
    "crawl": false
  }
}
```

`crawl: false` + `include: ["/"]` — chỉ snapshot root, không crawl link (SPA không có multi-route).
`puppeteerArgs` — cần cho Vercel build environment (Linux sandbox).

### `src/main.jsx` — hydrate fallback

```jsx
import { hydrateRoot, createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

const container = document.getElementById('app');
const isPrerendered = container.hasChildNodes();

if (isPrerendered) {
  hydrateRoot(container, <App />);
} else {
  createRoot(container).render(<App />);
}
```

Khi Vercel serve prerendered HTML, React hydrate thay vì render từ đầu → nhanh hơn, không flash.

---

## 8. Scope Boundary

- Chỉ thay đổi các file nêu trong mục 3
- Không thêm router, không đổi structure React component
- Không tạo OG image mới (đã có `og-image.jpg` từ origin/main)
- Không thêm Google Search Console setup (manual step sau deploy)

---

## 9. Post-Deploy Checklist (Manual)

Sau khi deploy thành công:
1. Submit `https://www.lhtanh.me/sitemap.xml` lên Google Search Console
2. Test JSON-LD tại `search.google.com/test/rich-results`
3. Test prerender: `curl -A "Googlebot" https://www.lhtanh.me/ | grep "digital marketing"`
4. Request indexing trong Google Search Console cho URL chính

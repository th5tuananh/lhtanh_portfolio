# CLAUDE.md — lhtanh_portfolio

Portfolio của Le Hoang Tuan Anh — Senior Digital Marketing & Mar-Tech Specialist.
React + Vite, song ngữ EN/VI, không backend.

## Tech Stack

- **React 18** + **Vite 5** (ESM modules)
- **Vanilla CSS** (`src/styles.css`) — không dùng Tailwind hay CSS-in-JS
- **No router** — single-page, scroll-based navigation
- **No state management library** — chỉ dùng React hooks

## Project Structure

```
src/
├── App.jsx          — Root: state, layout, TweaksPanel config
├── content.js       — Tất cả nội dung EN/VI (data-driven, chỉnh ở đây)
├── sections.jsx     — Tất cả section components (Hero, Profile, Skills...)
├── bg.js            — Canvas background (flowfield/mesh/grid/minimal)
├── styles.css       — Global styles, CSS variables
└── components/
    └── TweaksPanel.jsx — Real-time UI tweaks panel
```

## Sections (theo thứ tự render)

`Hero` → `Marquee` → `Profile` → `Pillars` → `Cases` → `Methodology` → `Highlights` → `Skills` → `Contact` → `Footer`

## Dev Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build (Vite only, ~300ms)
npm run preview  # Preview build
```

## Coding Rules

- Không thêm thư viện mới nếu không cần thiết
- Nội dung text luôn đặt trong `src/content.js` (cả EN lẫn VI)
- CSS custom properties (`--var`) dùng cho theming, không hardcode màu
- Components không có prop drilling sâu — data đi qua `t` (content object)

## Brand Tokens

```css
--cream:   #FAF7F0   /* text on dark */
--ink:     #111111   /* feature card bg */
--crimson: #D62828   /* alerts, milestone 1 */
--gold:    #E8B23A   /* primary accent, charts */
--green:   #4F8A3F   /* positive/growth */
```
Fonts: `Inter` (body) + `JetBrains Mono` (labels, charts, monospace). Sharp corners — không dùng `border-radius` cho feature elements.

## Deploy

- **Domain:** `https://www.lhtanh.id.vn/` (canonical)
- **Vercel:** auto-deploy từ GitHub `main` branch
- **Vercel subdomain:** `lhtanh-portfolio.vercel.app`
- **Build:** Vite ES2019 target (`vite.config.js`) — cần thiết cho compatibility

> ⚠️ **react-snap KHÔNG tương thích với Vercel** (thiếu `libnss3.so` cho Puppeteer 1.20.0). Không thêm lại. Prerendering có thể xem xét bằng giải pháp khác (vite-ssg, @prerenderer/renderer-jsdom) nếu cần.

## SEO (đã implement)

Tất cả nằm trong `index.html` (static, không cần JS render):
- **3 JSON-LD schemas:** Person (knowsAbout, image, sameAs LinkedIn/GitHub), WebSite (SearchAction sitelinks), FAQPage (3 Q&A VI cho Top 0)
- **`<html lang="vi">`** + `og:locale: vi_VN` — khớp với ngôn ngữ mặc định VI
- **Không dùng hreflang:** site one-page đổi ngôn ngữ client-side, EN và VI dùng chung một URL nên hreflang không có tác dụng. Chỉ thêm lại nếu tách `/en/` và `/vi/` thành URL riêng.
- **Geo meta:** `geo.region: VN-CT`, `geo.placename: Cần Thơ, Vietnam`
- **robots.txt** + **sitemap.xml** trong `/public/` — sitemap chỉ có `loc` + `lastmod` (Google bỏ qua `changefreq`/`priority`)
- **vercel.json:** cache 1 năm cho `/assets/`

> ⚠️ **FAQPage schema phải khớp nguyên văn với section FAQ trên trang.** Nội dung Q&A nằm ở `content.js` → `vi.faq.items` và được render bởi `Faq` trong `sections.jsx`. Google yêu cầu nội dung FAQ hiển thị thật trên trang — sửa schema thì phải sửa `content.js` (bản VI) và ngược lại.

## Prerender (GEO/AEO)

`npm run build` = `vite build` + `node scripts/prerender.mjs`. Bước prerender sinh HTML tĩnh vào `dist/index.html` để **GPTBot / ClaudeBot / PerplexityBot** (không chạy JS) đọc được nội dung. Trước khi có bước này `<body>` rỗng hoàn toàn — 0 ký tự text.

- `src/entry-server.jsx` — entry SSR, gọi `renderToString(<App />)`
- `scripts/prerender.mjs` — build SSR vào `.ssr-tmp/`, render, chèn vào `<div id="app">`, xoá thư mục tạm
- `npm run build:nossr` — build không prerender, dùng để đối chứng khi nghi ngờ hồi quy

**Client vẫn dùng `createRoot`, không hydrate.** Cố ý: người dùng đã chọn EN hoặc đổi tweaks trong `localStorage` sẽ gây hydration mismatch. React thay thế HTML tĩnh khi JS chạy; HTML tĩnh chỉ phục vụ crawler.

> ⚠️ **Guard bắt buộc cho prerender.** Code chạy ở module level hoặc trong `useState` initializer sẽ chạy trong Node (không có `window`/`localStorage`) và làm hỏng build. `useEffect` KHÔNG chạy khi prerender nên an toàn. Các guard hiện có:
> - `sections.jsx` — `window.addEventListener` ở module level và `__scheduleTick()` bọc `typeof window !== 'undefined'`
> - `App.jsx` — `localStorage` trong `useState` initializer, fallback `'vi'`
> - `TweaksPanel.jsx` — đã có sẵn `try/catch`, tự trả về defaults
>
> Prerender mặc định render bản **tiếng Việt**, khớp `<html lang="vi">` và FAQPage schema.

> ✅ `sandrabruh@proton.me` là **email thật** (user xác nhận 27/07/2026) — không phải placeholder. Xuất hiện ở `src/content.js` (EN + VI) và 2 link `mailto:` trong `src/sections.jsx` (Dock, nút CTA Contact). Đổi email thì phải sửa cả 4 chỗ.

## Ngôn ngữ & Responsive

- **Mặc định tiếng Việt** (`App.jsx` — `localStorage.getItem('portfolio-lang') || 'vi'`), `<html lang>` sync theo state.
- Breakpoints: `1080px` (tablet ngang) → `900px` (nav thu thành drawer, grid 1 cột) → `720px` (mobile) → `420px` / `360px` (máy nhỏ).
- Scroll reveal dùng IntersectionObserver + fallback rAF scan (`__watch` trong `sections.jsx`) — fire-once, có sweep 500ms để không element nào kẹt trạng thái ẩn.
- Hover effect bị tắt trên thiết bị cảm ứng qua `@media (hover: none)`; toàn bộ animation tôn trọng `prefers-reduced-motion`.

---

## AgentMemory — Persistent Memory

AgentMemory lưu context giữa các phiên làm việc. Khởi động: `npx @agentmemory/agentmemory` (API: http://localhost:3111 | Viewer: http://localhost:3113)

### Khi nào dùng

| Tình huống | Action |
|---|---|
| Quyết định kỹ thuật / chọn approach | `memory_save` — type: `architecture` |
| User preference, style guide | `memory_save` — type: `preference` |
| Bug pattern đã fix | `memory_save` — type: `bug` |
| Bắt đầu phiên mới | `memory_smart_search` với keyword liên quan |

### Workflow mỗi phiên

1. **Bắt đầu:** `memory_smart_search` — load context phiên trước
2. **Trong phiên:** `memory_save` sau mỗi quyết định quan trọng
3. **Kết thúc:** Lưu summary nếu có insight mới

---

## GitNexus Web UI

```bash
npx gitnexus serve   # Mở http://localhost:4747
```

Trên Web UI: visualize dependency graph, xem 12 execution flows, 7 clusters, tìm symbols theo tên, xem blast radius khi click vào node.

---

## Quy trình làm việc tối ưu

**Trước khi sửa code:**
1. `memory_smart_search` — tìm context từ phiên trước
2. `gitnexus_query` — hiểu luồng thực thi liên quan
3. `gitnexus_impact` — xem blast radius

**Sau khi sửa:**
4. `gitnexus_detect_changes` — xác nhận scope thay đổi đúng
5. `memory_save` — lưu quyết định/insight quan trọng
6. `npx gitnexus analyze` — re-index nếu thêm file/function mới

---

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **lhtanh_portfolio** (355 symbols, 442 relationships, 14 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/lhtanh_portfolio/context` | Codebase overview, check index freshness |
| `gitnexus://repo/lhtanh_portfolio/clusters` | All functional areas |
| `gitnexus://repo/lhtanh_portfolio/processes` | All execution flows |
| `gitnexus://repo/lhtanh_portfolio/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

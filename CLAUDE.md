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
npm run build    # Production build
npm run preview  # Preview build
```

## Coding Rules

- Không thêm thư viện mới nếu không cần thiết
- Nội dung text luôn đặt trong `src/content.js` (cả EN lẫn VI)
- CSS custom properties (`--var`) dùng cho theming, không hardcode màu
- Components không có prop drilling sâu — data đi qua `t` (content object)

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

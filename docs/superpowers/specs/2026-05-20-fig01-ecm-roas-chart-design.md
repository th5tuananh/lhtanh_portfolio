# Design Spec: FIG · 01 — ECM ROAS Chart Redesign

**Date:** 2026-05-20
**Status:** Approved
**Project:** lhtanh_portfolio — Trung Son Care case study

---

## 1. Context

FIG · 01 hiện tại (`chart: 'roas'`) dùng `DualLineChart` với dữ liệu ROAS giả (14 điểm, Aug24–Sep25). Cần thay bằng dữ liệu ECM thực tế 2025 của Trung Sơn Care, kể câu chuyện growth qua 2 mốc can thiệp kỹ thuật quan trọng.

---

## 2. Data

### ROAS Thực Tế (Sale ÷ Cost)

| Tháng | Sale (VND)  | Cost (VND) | ROAS  |
|-------|-------------|------------|-------|
| APR   | 283,809,000 | 43,559,000 | 6.51× |
| MAY   | 314,033,000 | 46,249,000 | 6.79× |
| JUN   | 330,265,000 | 49,415,000 | 6.69× |
| JUL   | 399,666,000 | 56,818,672 | 7.03× |
| AUG   | 452,908,540 | 63,907,950 | 7.09× |
| SEP   | 435,575,000 | 72,090,000 | 6.04× |
| OCT   | 482,378,000 | 68,012,000 | 7.09× |
| NOV   | 776,309,000 | 89,583,000 | 8.67× |
| DEC   | —           | —          | 9.85× |

> SEP dip = transition period trong tháng deploy server-side. DEC peak từ báo cáo cuối năm.

---

## 3. Narrative — 3 Phases

| Phase | Tháng | Màu | Sự kiện |
|-------|-------|-----|---------|
| I — Growth | APR–MAY | `--green: #4F8A3F` | CS-Cart + GA4 + GMC + FB Catalog (setup JAN) bắt đầu cho kết quả |
| II — Bottleneck | JUN–SEP | `--crimson: #D62828` | JUN: Pixel policy + iOS blocking → đề xuất server-side. SEP: Deploy Stape.io |
| III — Breakthrough | OCT–DEC | `--gold: #E8B23A` | Server-side data quality → ROAS bứt phá đến 9.85× |

### 2 Milestone Markers

**Milestone 1 — JUN 2025** (crimson `▮` marker)
- Nguyên nhân: Meta Pixel áp dụng policy mới, iOS chặn dữ liệu, Luật PDPA 2026 sắp có hiệu lực
- Hành động: Đề xuất và được phê duyệt triển khai server-side tracking

**Milestone 2 — SEP 2025** (gold `▮` marker)
- Sự kiện: Deploy Stape.io + GTM Server-side + Facebook CAPI + GA4 Enhanced
- ROAS dip 6.04× tạm thời (tháng chuyển đổi hệ thống) — intentional signal dùng open circle

---

## 4. Visual Design

### Brand Tokens (không sai lệch)

```css
--cream:   #FAF7F0   /* text on dark */
--ink:     #111111   /* feature card bg */
--crimson: #D62828   /* milestone 1, phase II zone */
--gold:    #E8B23A   /* ROAS line, milestone 2, phase III zone */
--green:   #4F8A3F   /* phase I zone */
```

Fonts: `Inter` (body) + `JetBrains Mono` (labels, axis, chart title)

### Chart Layout

- **SVG viewBox:** `0 0 600 200` (responsive, width: 100%)
- **Padding:** `{ l: 44, r: 16, t: 20, b: 32 }`
- **Y-axis range:** 5.5× → 10.5× (5 units, 150px usable height)
- **X-axis:** 9 points, equal spacing

### Visual Elements

| Element | Style |
|---------|-------|
| Phase zones | `fill` tại 6–9% opacity: green / crimson / gold |
| Grid lines | `stroke="#FAF7F0" opacity="0.07"` horizontal only, 5 lines |
| Y-axis labels | JetBrains Mono 9px, `opacity: 0.25`, right-aligned |
| ROAS line | `stroke="#E8B23A"` `stroke-width="2.2"`, drawn animation |
| Area fill | `fill="#E8B23A"` `opacity="0.08"`, fade animation |
| Data dots | `r=3` filled gold, `stroke="#111"` `stroke-width="1.5"` |
| SEP dot | Open circle `r=4`, `fill="#111"` `stroke="#D62828"` — signals anomaly |
| DEC peak dot | `r=5.5` filled gold + inner white dot `r=2.5` |
| DEC badge | `rect` sharp corner, `fill` gold 15% opacity, `stroke` gold |
| Milestone lines | `stroke-dasharray="3,3"` vertical, opacity 0.6 |
| Milestone markers | `8×8 rect` (sharp corner, no rx) filled at top of line |
| X-axis labels | JetBrains Mono 9px, `opacity: 0.35` default, colored for JUN/SEP/DEC |

---

## 5. Animations

Tất cả animations trigger qua `useInView` hook (đã có sẵn trong codebase).

| Element | Animation | Duration | Delay | Easing |
|---------|-----------|----------|-------|--------|
| ROAS line draw | `strokeDashoffset` 1800→0 | `2s` | `0s` | `cubic-bezier(.2,.7,.2,1)` |
| Area fill | `opacity` 0→0.08 | `1.4s` | `0.4s` | `ease` |
| Phase zones | `opacity` 0→1 | `0.8s` | `0s` | `ease` |
| Data dots | `opacity` 0→1 + `scale` 0→1 | `0.4s` | `i * 0.12s` stagger | `cubic-bezier(.2,.7,.2,1)` |
| Milestone lines | `strokeDashoffset` 120→0 | `0.6s` | `0.8s` | `ease-out` |
| DEC badge | `opacity` 0→1 | `0.5s` | `1.6s` | `ease` |
| Y-axis labels | `opacity` 0→0.25 | `0.6s` | `0.2s` | `ease` |

> Pattern giống hệt `DualLineChart` hiện có — nhất quán trải nghiệm.

---

## 6. Implementation Plan

### Files cần thay đổi

| File | Thay đổi |
|------|---------|
| `src/sections.jsx` | Thêm component `ECMROASChart` mới, cập nhật `CaseChart` switch |
| `src/content.js` | Cập nhật `chart: 'ecm-roas'` cho Trung Son/Trung Sơn case (EN + VI) |

### Không thay đổi

- `DualLineChart` — giữ nguyên, các case khác vẫn dùng
- `styles.css` — không cần CSS mới, chart dùng inline SVG styles + CSS vars
- `App.jsx`, `bg.js`, `main.jsx` — không liên quan

### Component signature

```jsx
export function ECMROASChart({ dark }) {
  const ref = useRef(null);
  const seen = useInView(ref, { threshold: 0.3 });
  // data inline
  // SVG render
}
```

`dark` prop: khi `true` (feature card context) dùng `--ink` bg tones. Chart được thiết kế chủ yếu cho dark context.

---

## 7. Scope Boundary

- Chỉ thay FIG · 01 của Trung Son Care
- Không thay đổi FIG · 02 (leads), FIG · 03 (funnel), FIG · 04 (rank)
- Không refactor `DualLineChart` hay các chart component khác
- `gitnexus_impact` cần chạy trước khi edit `CaseChart` switch trong sections.jsx

---

## 8. SEO Optimization (Task 2 — Separate Spec)

Sẽ được spec riêng sau khi hoàn thành task này. Focus: Việt Nam / Cần Thơ / Digital Marketing.

# FIG · 01 ECM ROAS Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay thế biểu đồ ROAS giả của Trung Son Care bằng `ECMROASChart` — SVG component dùng data thực tế APR–DEC 2025, 3 phase zones, 2 milestone markers, animations mượt theo brand.

**Architecture:** Component `ECMROASChart` mới trong `sections.jsx`, tính toán tọa độ SVG tại render time từ data inline. Animations dùng `strokeDashoffset` + `opacity` transition trigger bởi `useInView` hook (đã có sẵn). `CaseChart` switch nhận kind `'ecm-roas'` mới. Không thay đổi `DualLineChart` hay bất kỳ chart nào khác.

**Tech Stack:** React 18, SVG inline, CSS transitions, `useInView` hook (sections.jsx), CSS variables từ brand tokens

---

## File Map

| File | Thay đổi |
|------|---------|
| `src/sections.jsx` | Thêm `ECMROASChart` (~100 lines) sau dòng 238; thêm `case 'ecm-roas'` vào `CaseChart` (dòng 575) |
| `src/content.js` | Sửa 2 dòng: `chart: 'roas'` → `'ecm-roas'` + `chartTitle` (EN dòng 83–84, VI dòng 280–281) |

---

## Task 1: Thêm `ECMROASChart` vào `sections.jsx`

**Files:**
- Modify: `src/sections.jsx:238` — thêm component mới sau `DualLineChart`, trước `FunnelChart`

- [ ] **Step 1: Mở `src/sections.jsx`, xác nhận dòng 238 là dòng cuối của `DualLineChart`**

  Chạy: `grep -n "^}" src/sections.jsx | head -10`
  Xác nhận dòng 238 là `}` đóng của `DualLineChart`.

- [ ] **Step 2: Thêm `ECMROASChart` vào `src/sections.jsx` sau dòng 238**

  Insert đoạn sau ngay sau dòng 238 (trước `/* ---------- FUNNEL ---------- */`):

  ```jsx
  /* ---------- ECM ROAS CHART (Trung Son Care · FIG·01) ---------- */
  export function ECMROASChart() {
    const ref = useRef(null);
    const seen = useInView(ref, { threshold: 0.3 });

    const W = 600, H = 200;
    const pad = { l: 44, r: 16, t: 24, b: 36 };
    const iW = W - pad.l - pad.r;
    const iH = H - pad.t - pad.b;

    const data = [
      { m: 'APR', roas: 6.51 },
      { m: 'MAY', roas: 6.79 },
      { m: 'JUN', roas: 6.69, ms: 1 },
      { m: 'JUL', roas: 7.03 },
      { m: 'AUG', roas: 7.09 },
      { m: 'SEP', roas: 6.04, ms: 2, dip: true },
      { m: 'OCT', roas: 7.09 },
      { m: 'NOV', roas: 8.67 },
      { m: 'DEC', roas: 9.85, peak: true },
    ];

    const Y_MIN = 5.5, Y_MAX = 10.5;
    const xs = data.map((_, i) => pad.l + (i / (data.length - 1)) * iW);
    const ys = data.map(d => pad.t + (1 - (d.roas - Y_MIN) / (Y_MAX - Y_MIN)) * iH);

    const linePath = xs.map((x, i) =>
      `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`
    ).join(' ');
    const areaPath = linePath
      + ` L${xs[xs.length - 1].toFixed(1)},${(pad.t + iH).toFixed(1)}`
      + ` L${pad.l},${(pad.t + iH).toFixed(1)} Z`;

    const phaseX1 = (xs[1] + xs[2]) / 2;
    const phaseX2 = (xs[5] + xs[6]) / 2;

    const gridY = v => pad.t + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * iH;
    const gridVals = [6, 7, 8, 9, 10];

    return (
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>

        {/* Phase zones */}
        <rect x={pad.l}   y={pad.t} width={phaseX1 - pad.l}            height={iH} fill="rgba(79,138,63,0.08)" />
        <rect x={phaseX1} y={pad.t} width={phaseX2 - phaseX1}          height={iH} fill="rgba(214,40,40,0.06)" />
        <rect x={phaseX2} y={pad.t} width={W - pad.r - phaseX2}        height={iH} fill="rgba(232,178,58,0.09)" />

        {/* Grid lines */}
        {gridVals.map(v => (
          <line key={v}
            x1={pad.l} x2={W - pad.r}
            y1={gridY(v)} y2={gridY(v)}
            stroke="currentColor" strokeWidth="0.5" opacity="0.08"
          />
        ))}

        {/* Y-axis labels */}
        {gridVals.map(v => (
          <text key={v}
            x={pad.l - 6} y={gridY(v) + 3.5}
            textAnchor="end" fontSize="9"
            fontFamily="JetBrains Mono, monospace"
            fill="currentColor" opacity="0.3"
          >{v}×</text>
        ))}

        {/* Milestone line 1 — JUN (crimson) */}
        <line
          x1={xs[2]} x2={xs[2]} y1={pad.t} y2={pad.t + iH}
          stroke="#D62828" strokeWidth="1" strokeDasharray="3,3"
          style={{ opacity: seen ? 0.6 : 0, transition: 'opacity 0.5s 0.9s' }}
        />
        <rect
          x={xs[2] - 4} y={pad.t - 6} width={8} height={8}
          fill="#D62828"
          style={{ opacity: seen ? 0.85 : 0, transition: 'opacity 0.4s 1.1s' }}
        />

        {/* Milestone line 2 — SEP (gold) */}
        <line
          x1={xs[5]} x2={xs[5]} y1={pad.t} y2={pad.t + iH}
          stroke="#E8B23A" strokeWidth="1" strokeDasharray="3,3"
          style={{ opacity: seen ? 0.6 : 0, transition: 'opacity 0.5s 0.9s' }}
        />
        <rect
          x={xs[5] - 4} y={pad.t - 6} width={8} height={8}
          fill="#E8B23A"
          style={{ opacity: seen ? 0.85 : 0, transition: 'opacity 0.4s 1.1s' }}
        />

        {/* Area fill */}
        <path d={areaPath} fill="#E8B23A"
          opacity={seen ? 0.08 : 0}
          style={{ transition: 'opacity 1.4s 0.4s' }}
        />

        {/* ROAS line — drawn animation */}
        <path d={linePath}
          fill="none" stroke="#E8B23A" strokeWidth="2.2"
          strokeLinejoin="round" strokeLinecap="round"
          style={{
            strokeDasharray: 2000,
            strokeDashoffset: seen ? 0 : 2000,
            transition: 'stroke-dashoffset 2s cubic-bezier(.2,.7,.2,1)',
          }}
        />

        {/* Data dots — staggered fade in */}
        {data.map((d, i) => {
          const delay = `${0.4 + i * 0.1}s`;
          if (d.dip) return (
            <circle key={i} cx={xs[i]} cy={ys[i]} r={4}
              fill="#D62828" stroke="#D62828" strokeWidth="1.8"
              style={{ opacity: seen ? 1 : 0, transition: `opacity 0.4s ${delay}` }}
            />
          );
          if (d.peak) return (
            <g key={i} style={{ opacity: seen ? 1 : 0, transition: `opacity 0.4s ${delay}` }}>
              <circle cx={xs[i]} cy={ys[i]} r={5.5} fill="#E8B23A" stroke="#E8B23A" strokeWidth="1" />
              <circle cx={xs[i]} cy={ys[i]} r={2.5} fill="currentColor" opacity="0.9" />
            </g>
          );
          return (
            <circle key={i} cx={xs[i]} cy={ys[i]} r={3}
              fill="#E8B23A" stroke="currentColor" strokeWidth="1.5"
              style={{ opacity: seen ? 1 : 0, transition: `opacity 0.4s ${delay}` }}
            />
          );
        })}

        {/* Key value annotations */}
        <text x={xs[0]} y={ys[0] + 14}
          textAnchor="middle" fontSize="9"
          fontFamily="JetBrains Mono, monospace" fill="#E8B23A"
          style={{ opacity: seen ? 0.7 : 0, transition: 'opacity 0.6s 1.8s' }}
        >6.51×</text>

        <text x={xs[5]} y={ys[5] + 14}
          textAnchor="middle" fontSize="8"
          fontFamily="JetBrains Mono, monospace" fill="#D62828"
          style={{ opacity: seen ? 0.75 : 0, transition: 'opacity 0.6s 1.8s' }}
        >6.04× ↓</text>

        <text x={xs[7]} y={ys[7] - 9}
          textAnchor="middle" fontSize="9"
          fontFamily="JetBrains Mono, monospace" fill="#E8B23A"
          style={{ opacity: seen ? 0.7 : 0, transition: 'opacity 0.6s 2s' }}
        >8.67×</text>

        {/* DEC peak badge */}
        <rect
          x={xs[8] - 31} y={ys[8] - 23} width={60} height={16}
          fill="rgba(232,178,58,0.15)" stroke="#E8B23A" strokeWidth="0.5"
          style={{ opacity: seen ? 1 : 0, transition: 'opacity 0.5s 2.1s' }}
        />
        <text
          x={xs[8] - 1} y={ys[8] - 11}
          textAnchor="middle" fontSize="9.5" fontWeight="700"
          fontFamily="JetBrains Mono, monospace" fill="#E8B23A"
          style={{ opacity: seen ? 1 : 0, transition: 'opacity 0.5s 2.1s' }}
        >9.85× ▲</text>

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text key={i}
            x={xs[i]} y={H - 6}
            textAnchor="middle" fontSize="9"
            fontFamily="JetBrains Mono, monospace"
            fill={d.ms === 1 ? '#D62828' : (d.ms === 2 || d.peak) ? '#E8B23A' : 'currentColor'}
            opacity={d.ms || d.peak ? 0.8 : 0.4}
          >{d.m}</text>
        ))}
      </svg>
    );
  }
  ```

- [ ] **Step 3: Kiểm tra cú pháp — chạy dev server**

  ```bash
  npm run dev
  ```
  Mở `http://localhost:5173`. Portfolio phải load bình thường, không có lỗi console. Chart Trung Son Care vẫn hiển thị chart cũ (vì chưa đổi kind).

---

## Task 2: Đăng ký `'ecm-roas'` trong `CaseChart`

**Files:**
- Modify: `src/sections.jsx:575` — thêm branch mới trong `CaseChart`

- [ ] **Step 1: Thêm `'ecm-roas'` case vào `CaseChart`**

  Tìm dòng 575 trong `src/sections.jsx`:
  ```jsx
  export function CaseChart({ kind, dark }) {
    if (kind === 'roas') {
  ```

  Thêm branch MỚI ngay trước `if (kind === 'roas')`:

  ```jsx
  export function CaseChart({ kind, dark }) {
    if (kind === 'ecm-roas') {
      return <ECMROASChart />;
    }
    if (kind === 'roas') {
  ```

  > `'roas'` cũ giữ nguyên — không xóa, để phòng trường hợp rollback.

- [ ] **Step 2: Xác nhận dev server vẫn chạy, không có lỗi mới**

  Kiểm tra terminal `npm run dev` — không có compile error.

---

## Task 3: Cập nhật `content.js` — Trung Son Care (EN)

**Files:**
- Modify: `src/content.js:83–84`

- [ ] **Step 1: Sửa `chartTitle` và `chart` cho EN**

  Tìm và thay đổi trong `src/content.js` tại dòng 83–84:

  **Trước:**
  ```js
  chartTitle: "ROAS · 14-month trend",
  chart: "roas",
  ```

  **Sau:**
  ```js
  chartTitle: "ROAS · E-Commerce Channel · APR–DEC 2025",
  chart: "ecm-roas",
  ```

- [ ] **Step 2: Kiểm tra trên browser**

  Mở `http://localhost:5173`, scroll đến section **Work**, tìm case **Trung Son Care** (case đầu tiên, feature card dark).

  Kỳ vọng:
  - Chart title đổi thành "ROAS · E-Commerce Channel · APR–DEC 2025"
  - Biểu đồ `ECMROASChart` xuất hiện với data mới
  - Khi scroll đến chart: line draw animation chạy từ trái sang phải (~2s)
  - Area fill fade in (~0.4s delay)
  - Dots xuất hiện staggered
  - Milestone markers (crimson JUN, gold SEP) fade in
  - DEC badge "9.85× ▲" xuất hiện cuối cùng

---

## Task 4: Cập nhật `content.js` — Trung Sơn Care (VI)

**Files:**
- Modify: `src/content.js:280–281`

- [ ] **Step 1: Sửa `chartTitle` và `chart` cho VI**

  Tìm và thay đổi trong `src/content.js` tại dòng 280–281:

  **Trước:**
  ```js
  chartTitle: "ROAS · xu hướng 14 tháng",
  chart: "roas",
  ```

  **Sau:**
  ```js
  chartTitle: "ROAS · Kênh E-Commerce · APR–DEC 2025",
  chart: "ecm-roas",
  ```

- [ ] **Step 2: Kiểm tra VI trên browser**

  Click nút **VI** trên nav. Scroll đến case **Trung Sơn Care**.

  Kỳ vọng:
  - Chart title đổi sang VI
  - Chart hiển thị giống hệt EN (data/animation không thay đổi)
  - Các case khác (02, 03, 04) không bị ảnh hưởng

---

## Task 5: Cross-check toàn bộ Cases section

- [ ] **Step 1: Kiểm tra tất cả 5 case cards**

  Scroll qua toàn bộ section **Work**, kiểm tra từng case:

  | Case | Chart kind | Kỳ vọng |
  |------|-----------|---------|
  | Trung Son Care (01) | `ecm-roas` | ECMROASChart mới ✓ |
  | Case 02 | `leads` | DualLineChart cũ — không đổi ✓ |
  | Case 03 | `funnel` | FunnelChart cũ — không đổi ✓ |
  | Case 04 | `rank` | RankStrip cũ — không đổi ✓ |
  | Case 05 | `null` | Không có chart — không đổi ✓ |

- [ ] **Step 2: Test language toggle**

  Switch EN ↔ VI vài lần. Chart phải re-render đúng cả hai.

- [ ] **Step 3: Test scroll animation**

  Scroll xuống qua chart, rồi scroll ngược lên qua chart. Animation chỉ chạy 1 lần khi vào viewport lần đầu (`useInView` là fire-once).

- [ ] **Step 4: Kiểm tra responsive**

  Resize browser xuống 375px (mobile). Chart phải scale theo container, không bị overflow hay clip.

---

## Task 6: Commit + Re-index GitNexus

- [ ] **Step 1: Commit thay đổi**

  ```bash
  git add src/sections.jsx src/content.js
  git commit -m "$(cat <<'EOF'
  feat: replace FIG·01 with ECMROASChart — actual 2025 ROAS data

  Trung Son Care case: swap placeholder DualLineChart for new
  ECMROASChart component. Real APR–DEC 2025 data (6.51x→9.85x),
  3-phase zones, 2 milestone markers (JUN bottleneck, SEP server-side
  deploy), brand-accurate animations (strokeDashoffset + stagger).

  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
  EOF
  )"
  ```

- [ ] **Step 2: Re-index GitNexus**

  ```bash
  npx gitnexus analyze
  ```

  Kỳ vọng: `✅ up-to-date` sau khi re-index.

---

## Rollback

Nếu có vấn đề, revert về ROAS cũ bằng cách đổi lại 2 dòng trong `content.js`:
```js
chartTitle: "ROAS · 14-month trend",
chart: "roas",
```
`DualLineChart` vẫn còn nguyên, `'roas'` branch trong `CaseChart` không bị xóa.

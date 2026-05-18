/* Background canvas — flowfield + 3 alt variants. Cream-only.
 * Driven by window.__bg = { variant, intensity }.
 */
export function initBackground() {
/* Background canvas — 4 variants
 *  - flowfield  (default): simplex-noise particle field, drifts slowly
 *  - mesh:      slow rotating radial gradients
 *  - grid:      animated grid lines + drifting dots
 *  - minimal:   only grain (canvas empty)
 *
 *  Driven by window.__bg = { variant, intensity, dark } — re-read on every frame.
 */
  const cvs = document.getElementById('bg-canvas');
  if (!cvs) return;
  const ctx = cvs.getContext('2d', { alpha: true });

  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    cvs.width = W * DPR; cvs.height = H * DPR;
    cvs.style.width = W + 'px'; cvs.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    initParticles();
  }
  window.addEventListener('resize', resize);

  // ============ simplex noise (lightweight 2D) ============
  // Adapted from public-domain implementation
  const grad3 = [[1,1],[ -1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
  const perm = new Uint8Array(512);
  (function seedPerm(seed) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const j = s % (i + 1);
      const tmp = p[i]; p[i] = p[j]; p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  })(7);

  function noise2(xin, yin) {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s), j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t, Y0 = j - t;
    const x0 = xin - X0, y0 = yin - Y0;
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    const gi0 = perm[ii + perm[jj]] & 7;
    const gi1 = perm[ii + i1 + perm[jj + j1]] & 7;
    const gi2 = perm[ii + 1 + perm[jj + 1]] & 7;
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2); }
    return 70 * (n0 + n1 + n2);
  }

  // ============ Particles for flowfield ============
  let particles = [];
  function initParticles() {
    const target = Math.floor((W * H) / 7000); // density
    const n = Math.max(60, Math.min(target, 220));
    particles = [];
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        l: 0,
        maxL: 200 + Math.random() * 300,
        hue: Math.random(),
      });
    }
  }
  resize();

  // Mouse tracking for subtle reactive glow
  let mx = W / 2, my = H / 2;
  let tmx = mx, tmy = my;
  window.addEventListener('mousemove', (e) => { tmx = e.clientX; tmy = e.clientY; });
  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) { tmx = e.touches[0].clientX; tmy = e.touches[0].clientY; }
  }, { passive: true });

  // ============ Loop ============
  let t = 0;
  let lastFrame = performance.now();

  function frame(now) {
    const dt = Math.min(50, now - lastFrame) / 16.6667;
    lastFrame = now;

    const cfg = window.__bg || {};
    const variant = cfg.variant || 'flowfield';
    const intensity = Math.max(0, Math.min(1, cfg.intensity ?? 0.8));
    const dark = !!cfg.dark;

    // ease mouse
    mx += (tmx - mx) * 0.06;
    my += (tmy - my) * 0.06;

    t += 0.0025 * (0.4 + intensity);

    if (variant === 'minimal') {
      ctx.clearRect(0, 0, W, H);
      drawCursorGlow(dark, intensity * 0.4);
    } else if (variant === 'mesh') {
      drawMesh(dark, intensity, dt);
      drawCursorGlow(dark, intensity * 0.5);
    } else if (variant === 'grid') {
      drawGrid(dark, intensity, dt);
      drawCursorGlow(dark, intensity * 0.4);
    } else {
      drawFlowfield(dark, intensity, dt);
      drawCursorGlow(dark, intensity * 0.35);
    }

    requestAnimationFrame(frame);
  }

  function drawCursorGlow(dark, str) {
    if (str < 0.05) return;
    const r = 320;
    const g = ctx.createRadialGradient(mx, my, 0, mx, my, r);
    const c1 = dark ? `rgba(214,40,40,${0.18 * str})` : `rgba(214,40,40,${0.10 * str})`;
    g.addColorStop(0, c1);
    g.addColorStop(1, 'rgba(214,40,40,0)');
    ctx.save();
    ctx.globalCompositeOperation = dark ? 'lighter' : 'multiply';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // ---------- FLOWFIELD ----------
  function drawFlowfield(dark, intensity, dt) {
    // Fade trails — clear most of buffer
    const fadeAlpha = 0.07;
    ctx.fillStyle = `rgba(250,247,240,${fadeAlpha})`;
    ctx.fillRect(0, 0, W, H);

    const speed = 0.6 + intensity * 1.1;
    const stepLen = 2.2;
    const noiseScale = 0.0022;

    ctx.lineWidth = 0.55;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const ang = noise2(p.x * noiseScale + t, p.y * noiseScale) * Math.PI * 2;
      const vx = Math.cos(ang) * stepLen * speed * dt;
      const vy = Math.sin(ang) * stepLen * speed * dt;

      // hue distribution: most subtle ink lines, accents in crimson/gold
      let stroke;
      if (p.hue < 0.05) {
        stroke = 'rgba(232,178,58,0.32)';
      } else if (p.hue < 0.20) {
        stroke = 'rgba(214,40,40,0.26)';
      } else {
        stroke = 'rgba(17,17,17,0.085)';
      }

      ctx.strokeStyle = stroke;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      p.x += vx; p.y += vy;
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      p.l += 1;
      if (p.l > p.maxL || p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) {
        p.x = Math.random() * W;
        p.y = Math.random() * H;
        p.l = 0;
        p.maxL = 200 + Math.random() * 300;
        p.hue = Math.random();
      }
    }
  }

  // ---------- MESH ----------
  function drawMesh(dark, intensity, dt) {
    // clear
    ctx.clearRect(0, 0, W, H);

    const blobs = [
      { hue: '214,40,40',  a: 0.18, r: 1.0 },
      { hue: '232,178,58', a: 0.12, r: 0.7 },
      { hue: '79,138,63',  a: 0.10, r: 0.55 },
    ];
    blobs.forEach((b, i) => {
      const ph = t * (0.6 + i * 0.4);
      const cx = W * 0.5 + Math.cos(ph + i * 2) * W * 0.35 * b.r;
      const cy = H * 0.5 + Math.sin(ph * 1.2 + i * 1.7) * H * 0.4 * b.r;
      const rad = Math.max(W, H) * (0.45 * b.r + 0.06 * Math.sin(t * 2 + i));
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      const alpha = b.a * intensity * (dark ? 1.4 : 1);
      g.addColorStop(0, `rgba(${b.hue},${alpha})`);
      g.addColorStop(1, `rgba(${b.hue},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });
  }

  // ---------- GRID ----------
  let gridDots = null;
  function initGrid() {
    gridDots = [];
    for (let i = 0; i < 60; i++) {
      gridDots.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 1.2 + Math.random() * 2,
        crimson: Math.random() < 0.18,
      });
    }
  }
  function drawGrid(dark, intensity, dt) {
    if (!gridDots) initGrid();
    ctx.clearRect(0, 0, W, H);

    // grid
    const step = 80;
    const offset = (t * 30) % step;
    ctx.strokeStyle = dark ? 'rgba(242,238,227,0.05)' : 'rgba(17,17,17,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -step + offset; x <= W; x += step) {
      ctx.moveTo(x, 0); ctx.lineTo(x, H);
    }
    for (let y = -step + offset; y <= H; y += step) {
      ctx.moveTo(0, y); ctx.lineTo(W, y);
    }
    ctx.stroke();

    // accent lines
    ctx.strokeStyle = dark ? 'rgba(214,40,40,0.12)' : 'rgba(214,40,40,0.10)';
    ctx.lineWidth = 1.2;
    const aOff = (t * 18) % (step * 4);
    ctx.beginPath();
    for (let x = -step * 4 + aOff; x <= W; x += step * 4) {
      ctx.moveTo(x, 0); ctx.lineTo(x, H);
    }
    ctx.stroke();

    // dots
    for (const d of gridDots) {
      d.x += d.vx * intensity * dt * 2;
      d.y += d.vy * intensity * dt * 2;
      if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
      if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
      ctx.fillStyle = d.crimson
        ? 'rgba(214,40,40,0.7)'
        : (dark ? 'rgba(242,238,227,0.4)' : 'rgba(17,17,17,0.35)');
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  requestAnimationFrame(frame);
}

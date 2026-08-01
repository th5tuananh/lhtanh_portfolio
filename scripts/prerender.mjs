/**
 * Prerender: sinh HTML tĩnh cho dist/index.html.
 *
 * Lý do: GPTBot / ClaudeBot / PerplexityBot không chạy JavaScript. Không có
 * bước này, <div id="app"> rỗng và các engine đó không đọc được nội dung nào.
 *
 * Client vẫn dùng createRoot (không hydrate), nên HTML tĩnh sẽ được React
 * thay thế khi JS chạy. Điều đó là cố ý: tránh hydration mismatch khi người
 * dùng đã chọn EN hoặc đã đổi tweaks trong localStorage.
 *
 * Chạy sau `vite build` — xem script "build" trong package.json.
 */
import { build } from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ssrDir = path.join(root, '.ssr-tmp');
const indexPath = path.join(root, 'dist', 'index.html');
const PLACEHOLDER = '<div id="app"></div>';

async function main() {
  // 1. Build bundle SSR vào thư mục tạm
  await build({
    root,
    logLevel: 'warn',
    build: {
      ssr: 'src/entry-server.jsx',
      outDir: '.ssr-tmp',
      minify: false,
      emptyOutDir: true,
    },
  });

  // 2. Render App ra chuỗi HTML
  const entry = path.join(ssrDir, 'entry-server.js');
  const { render } = await import(pathToUrl(entry));
  const appHtml = render();

  if (!appHtml || appHtml.length < 1000) {
    throw new Error(`Prerender ra HTML quá ngắn (${appHtml?.length ?? 0} ký tự) — nhiều khả năng App render lỗi.`);
  }

  // 3. Chèn vào dist/index.html
  const index = await fs.readFile(indexPath, 'utf8');
  if (!index.includes(PLACEHOLDER)) {
    throw new Error(`Không tìm thấy "${PLACEHOLDER}" trong dist/index.html — placeholder đã bị đổi?`);
  }
  await fs.writeFile(indexPath, index.replace(PLACEHOLDER, `<div id="app">${appHtml}</div>`));

  // 4. Dọn thư mục tạm
  await fs.rm(ssrDir, { recursive: true, force: true });

  const text = appHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log(`✓ Prerender xong — ${appHtml.length} ký tự HTML, ${text.length} ký tự text hiển thị.`);
}

function pathToUrl(p) {
  return new URL(`file://${p}`).href;
}

main().catch((err) => {
  console.error('✗ Prerender thất bại:', err.message);
  process.exit(1);
});

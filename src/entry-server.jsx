import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App.jsx';

/* Entry dùng riêng cho bước prerender (scripts/prerender.mjs).
 * Không import styles.css — CSS đã do bundle client xử lý.
 * Không bọc StrictMode vì renderToString sẽ render hai lần một cách vô ích. */
export function render() {
  return renderToString(<App />);
}

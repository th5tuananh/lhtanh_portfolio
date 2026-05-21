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

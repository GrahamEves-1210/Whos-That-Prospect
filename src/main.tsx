import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { STORAGE_KEYS } from './game/config';
import './styles/global.css';

// DEMO RECORDING: every refresh starts today's game fresh. Set to false before pushing.
const DEMO_RESET = true;
if (DEMO_RESET) {
  try {
    window.localStorage.removeItem(STORAGE_KEYS.game);
  } catch {
    /* storage blocked: nothing saved to clear */
  }
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root element');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

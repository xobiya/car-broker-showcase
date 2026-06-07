import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ---------------------------------------------------------------------------
// Global fetch interceptor — auto-injects JWT on every API call
// ---------------------------------------------------------------------------
const _originalFetch = window.fetch.bind(window);

window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;

  // Only intercept same-origin /api/* requests
  if (url.startsWith('/api/') || url.startsWith(window.location.origin + '/api/')) {
    const token = localStorage.getItem('autobroker_token');
    if (token) {
      const headers = new Headers(init.headers);
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      init = { ...init, headers };
    }
  }

  const response = await _originalFetch(input, init);

  // Global 401 handler — dispatch event so the app can show the login modal
  if (response.status === 401) {
    const url2 = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    // Skip 401 handling for auth endpoints (login/register failures are expected)
    if (!url2.includes('/api/auth/')) {
      localStorage.removeItem('autobroker_token');
      localStorage.removeItem('autobroker_user');
      window.dispatchEvent(new CustomEvent('autobroker:unauthorized'));
    }
  }

  return response;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

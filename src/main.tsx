import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { SessionContextProvider } from "./components/auth/SessionContextProvider.tsx";
import { BrowserRouter } from "react-router-dom";

// Auto-clear stale cache on new deployment
try {
  const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
  const storedVersion = localStorage.getItem('app_version');
  if (storedVersion !== APP_VERSION) {
    localStorage.clear();
    sessionStorage.clear();
    if ('caches' in window) {
      caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
    }
    localStorage.setItem('app_version', APP_VERSION);
  }
} catch (e) {
  console.warn('Cache clear failed:', e);
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SessionContextProvider>
        <App />
      </SessionContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);

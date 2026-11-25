import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Recover automatically once if a stale Vite chunk fails after deployment
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;
  state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Unexpected application error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#041845] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white text-slate-900 rounded-2xl p-6 shadow-2xl space-y-4">
            <h1 className="text-lg font-extrabold text-[#082458]">Expert CRM Recovery</h1>
            <p className="text-xs text-slate-600">
              A browser cache or session mismatch occurred ({this.state.errorMessage}). Resetting local cache will restore your workspace.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="flex-1 py-2.5 px-4 bg-[#0b74f0] hover:bg-[#005be0] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Reset Cache & Reload
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);

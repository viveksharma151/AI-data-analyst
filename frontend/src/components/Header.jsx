import React, { useState, useEffect } from 'react';
import { BarChart3, MessageSquare, LayoutDashboard, Settings2, RefreshCw, CheckCircle2, XCircle, Globe } from 'lucide-react';
import { checkHealth, getBackendUrl, setBackendUrl } from '../services/api';

export default function Header({
  activeTab,
  setActiveTab,
  hasSession,
  onResetSession,
}) {
  const [backendUrl, setLocalBackendUrl] = useState(getBackendUrl());
  const [isHealthOk, setIsHealthOk] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const testConnection = async (url = backendUrl) => {
    setIsTesting(true);
    const res = await checkHealth(url);
    setIsHealthOk(res.ok);
    setIsTesting(false);
  };

  useEffect(() => {
    testConnection();
    const interval = setInterval(testConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveSettings = () => {
    const saved = setBackendUrl(backendUrl);
    setLocalBackendUrl(saved);
    testConnection(saved);
    setShowSettings(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-slate-100 tracking-tight">
                AI Data Analyst
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Vercel Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Intelligent SQL, Anomaly Detection & Insights
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Analysis</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Executive Dashboard</span>
          </button>
        </div>

        {/* Actions & Connection Status */}
        <div className="flex items-center gap-2">
          {/* Status Pill */}
          <div
            onClick={() => setShowSettings(true)}
            className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            title="Click to configure backend API URL"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isHealthOk === true
                  ? 'bg-emerald-400 animate-pulse'
                  : isHealthOk === false
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
              }`}
            />
            <span className="hidden md:inline text-slate-300">
              {isHealthOk === true
                ? 'Backend Online'
                : isHealthOk === false
                ? 'Backend Offline'
                : 'Checking API...'}
            </span>
            <Settings2 className="w-3 h-3 text-slate-400 ml-0.5" />
          </div>

          {hasSession && (
            <button
              onClick={onResetSession}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800"
              title="Reset current session"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Backend Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-slate-100 text-sm">
                  Backend API Configuration
                </h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">
                Backend Endpoint URL
              </label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setLocalBackendUrl(e.target.value)}
                placeholder="http://localhost:8000 or https://your-backend.onrender.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400">
                When deploying on Vercel, set this to your hosted FastAPI backend (e.g. Render, Railway, Fly.io, or AWS).
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => testConnection(backendUrl)}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                {isTesting ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                )}
                <span>Test Connection</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

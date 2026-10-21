import React, { useState } from 'react';
import { Database, Copy, Check } from 'lucide-react';

export default function SqlViewer({ query }) {
  const [copied, setCopied] = useState(false);

  if (!query) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-md">
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
          <Database className="w-3.5 h-3.5" />
          <span>Executed SQL Query</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-slate-200 transition-colors py-0.5 px-2 rounded hover:bg-slate-800 text-[11px]"
          title="Copy query"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-xs font-mono text-emerald-300/90 leading-relaxed bg-slate-950/90">
        <code>{query}</code>
      </div>
    </div>
  );
}

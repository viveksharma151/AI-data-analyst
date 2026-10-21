import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronRight, Activity } from 'lucide-react';

export default function ReasoningTrace({ trace }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!trace || !trace.length) return null;

  return (
    <div className="my-3 rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-900/60 hover:bg-slate-900/90 text-slate-300 font-medium transition-colors"
      >
        <div className="flex items-center gap-2 text-indigo-400">
          <Brain className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-200">Agent Reasoning Trace</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {trace.length} step{trace.length > 1 ? 's' : ''}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-3.5 space-y-2 border-t border-slate-800/60 bg-slate-950/60">
          {trace.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] text-slate-400">
                {idx + 1}
              </span>
              <div className="flex-1">
                <span className="inline-block px-1.5 py-0.5 mr-1.5 rounded bg-slate-800 text-slate-300 font-mono font-medium text-[11px] uppercase tracking-wider">
                  {step.step}
                </span>
                <span className="text-slate-300 leading-relaxed">
                  {step.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

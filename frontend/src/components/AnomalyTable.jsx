import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, ShieldAlert } from 'lucide-react';

export default function AnomalyTable({ anomaliesData }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!anomaliesData || !anomaliesData.total_flagged || anomaliesData.total_flagged === 0) {
    return null;
  }

  const { anomalies, total_flagged, method, columns_checked } = anomaliesData;

  const getSeverityBadge = (severity) => {
    if (severity >= 1.0) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
          High ({severity})
        </span>
      );
    }
    if (severity >= 0.5) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          Medium ({severity})
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
        Moderate ({severity})
      </span>
    );
  };

  return (
    <div className="my-3 rounded-xl border border-amber-500/30 bg-amber-950/10 overflow-hidden text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/15 text-amber-200 font-medium transition-colors"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-amber-300">
            {total_flagged} Outlier{total_flagged > 1 ? 's' : ''} Flagged
          </span>
          <span className="text-[10px] text-amber-400/80">({method})</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-amber-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-amber-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-3 bg-slate-950/90 border-t border-amber-500/20 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2 px-3 font-semibold">Row #</th>
                <th className="py-2 px-3 font-semibold">Severity</th>
                <th className="py-2 px-3 font-semibold">Reason</th>
                <th className="py-2 px-3 font-semibold">Row Attributes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {anomalies.slice(0, 15).map((a, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-400">
                    {a.row_index}
                  </td>
                  <td className="py-2.5 px-3">
                    {getSeverityBadge(a.severity)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">
                    <ul className="list-disc list-inside space-y-0.5">
                      {a.reasons?.map((r, rIdx) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                    <div className="flex flex-wrap gap-1 max-w-sm">
                      {Object.entries(a.row_data || {})
                        .filter(([k]) => !k.includes('id'))
                        .slice(0, 4)
                        .map(([k, v]) => (
                          <span
                            key={k}
                            className="bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300"
                          >
                            <span className="text-slate-500">{k}:</span> {String(v)}
                          </span>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {total_flagged > 15 && (
            <p className="mt-2 text-center text-slate-500 text-[11px]">
              Showing top 15 of {total_flagged} anomalies.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

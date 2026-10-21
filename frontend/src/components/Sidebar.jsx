import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  FileDown,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Trash2,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { uploadCsvFiles, exportPdfReport } from '../services/api';

const SAMPLE_QUESTIONS = [
  'Which region generated the highest revenue?',
  'Show monthly sales trends',
  'Which products are underperforming?',
  'What are the top 5 customers?',
  'Detect anomalies in the dataset',
  'Generate SQL for total revenue by category',
];

export default function Sidebar({
  sessionId,
  datasets,
  onSessionStarted,
  onSelectSampleQuestion,
  hasMessages,
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [openDataset, setOpenDataset] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const csvFiles = filesArray.filter((f) => f.name.toLowerCase().endsWith('.csv'));
      if (csvFiles.length !== filesArray.length) {
        setUploadError('Only .csv files are supported.');
      } else {
        setUploadError(null);
      }
      setSelectedFiles((prev) => [...prev, ...csvFiles]);
    }
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleStartSession = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const data = await uploadCsvFiles(selectedFiles);
      onSessionStarted(data.session_id, data.datasets);
      setSelectedFiles([]);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload files.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!sessionId) return;
    setIsExporting(true);
    try {
      await exportPdfReport(sessionId);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-88 flex-shrink-0 border-r border-slate-800/80 bg-slate-950/50 flex flex-col h-[calc(100vh-57px)] overflow-y-auto p-4 space-y-5">
      {/* Upload Box */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dataset Ingestion</span>
          </label>
          <span className="text-[11px] text-slate-400">CSV Only</span>
        </div>

        {/* Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-4 text-center bg-slate-900/40 hover:bg-indigo-950/10 cursor-pointer transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-indigo-600/20 text-slate-400 group-hover:text-indigo-400 mx-auto flex items-center justify-center transition-colors mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-300">
            Click to upload or drag & drop
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Multi-file joins and queries supported
          </p>
        </div>

        {uploadError && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Selected files preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-medium text-slate-400 flex justify-between">
              <span>Selected Files ({selectedFiles.length}):</span>
            </div>
            {selectedFiles.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900/80 rounded-lg text-xs text-slate-300 border border-slate-800"
              >
                <span className="truncate max-w-[180px]">{f.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              onClick={handleStartSession}
              disabled={isUploading}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading into DuckDB...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Start Analysis Session</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Active Datasets List */}
      {datasets && datasets.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Active Tables ({datasets.length})
            </label>
          </div>

          <div className="space-y-2">
            {datasets.map((d, idx) => {
              const isOpen = openDataset === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenDataset(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-2.5 text-left hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        📄 {d.filename}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {d.n_rows.toLocaleString()} rows · {d.n_cols} cols
                      </p>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-2.5 border-t border-slate-800 bg-slate-950/70 space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                          Columns
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {d.columns?.map((c) => (
                            <span
                              key={c}
                              className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {d.warnings && d.warnings.length > 0 && (
                        <div className="space-y-1 pt-1">
                          {d.warnings.map((w, wIdx) => (
                            <div
                              key={wIdx}
                              className="text-[11px] text-amber-400 bg-amber-500/10 p-1.5 rounded border border-amber-500/20 flex items-start gap-1.5"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span>{w}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Export Report Action */}
      {sessionId && hasMessages && (
        <div className="pt-2 border-t border-slate-800/80">
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium text-xs flex items-center justify-center gap-2 transition-all"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating PDF Report...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export Session as PDF</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Suggested Questions */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800/80 mt-auto">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Example Queries</span>
        </label>
        <div className="space-y-1.5">
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSampleQuestion(q)}
              className="w-full text-left p-2 rounded-lg bg-slate-900/50 hover:bg-indigo-950/30 hover:border-indigo-500/30 border border-slate-800 text-xs text-slate-300 hover:text-indigo-200 transition-all leading-snug"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

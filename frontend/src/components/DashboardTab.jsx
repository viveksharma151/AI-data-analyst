import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Layers,
  AlertCircle,
  Calendar,
  RefreshCw,
  Loader2,
  CheckCircle2,
  BarChart2,
} from 'lucide-react';
import { fetchDashboard } from '../services/api';
import PlotlyChart from './PlotlyChart';

export default function DashboardTab({ sessionId }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDashboard(sessionId);
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to load executive dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <Layers className="w-12 h-12 text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-300">
          No Active Session
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Upload a dataset in the sidebar to view executive KPIs and breakdown visualizations.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-slate-950">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span>Executive Business Intelligence</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-aggregated metrics and distribution breakdowns computed via DuckDB
          </p>
        </div>

        <button
          onClick={loadDashboard}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {isLoading && !dashboardData && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">
            Computing metrics and outlier distributions...
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {dashboardData && (
        <div className="space-y-6">
          {/* Date range & Data Quality info banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
            {dashboardData.date_range ? (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>
                  Dataset Timespan:{' '}
                  <b className="text-slate-200">
                    {dashboardData.date_range.start?.slice(0, 10)}
                  </b>{' '}
                  to{' '}
                  <b className="text-slate-200">
                    {dashboardData.date_range.end?.slice(0, 10)}
                  </b>
                </span>
              </div>
            ) : (
              <span>Full dataset summary</span>
            )}

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Total Dimensions:</span>
              <span className="font-mono text-slate-300">
                {dashboardData.total_columns} columns
              </span>
            </div>
          </div>

          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="glass-card p-4.5 rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/70 to-slate-950/70 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-medium">Total Revenue</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100 tracking-tight">
                ₹{(dashboardData.total_revenue || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Aggregated dataset sum</p>
            </div>

            {/* Avg Order Value */}
            <div className="glass-card p-4.5 rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/70 to-slate-950/70 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-medium">Avg Order Value</span>
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <BarChart2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100 tracking-tight">
                ₹{(dashboardData.avg_order_value || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Mean per transaction</p>
            </div>

            {/* Total Records */}
            <div className="glass-card p-4.5 rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/70 to-slate-950/70 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-medium">Total Rows</span>
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100 tracking-tight">
                {(dashboardData.total_rows || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Validated & parsed rows</p>
            </div>

            {/* Anomalies Flagged */}
            <div className="glass-card p-4.5 rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/70 to-slate-950/70 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-medium">Anomalies Detected</span>
                <div
                  className={`p-1.5 rounded-lg ${
                    dashboardData.anomaly_count > 0
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-slate-100 tracking-tight">
                  {dashboardData.anomaly_count ?? 0}
                </div>
                {dashboardData.anomaly_count > 0 ? (
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Review Advised
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Clean
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">IQR + Isolation Forest scan</p>
            </div>
          </div>

          {/* Breakdown Highlights */}
          {dashboardData.breakdowns && Object.keys(dashboardData.breakdowns).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 tracking-tight flex items-center gap-2">
                <span>Categorical & Dimensional Breakdowns</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(dashboardData.breakdowns).map(([dim, info]) => {
                  const labels = (info.all_values || []).map((v) => v.label);
                  const values = (info.all_values || []).map((v) => v.value);

                  const barChartJson = {
                    data: [
                      {
                        x: values,
                        y: labels,
                        type: 'bar',
                        orientation: 'h',
                        marker: {
                          color: '#6366f1',
                        },
                      },
                    ],
                    layout: {
                      margin: { l: 80, r: 20, t: 10, b: 30 },
                      height: 220,
                      yaxis: {
                        autorange: 'reversed',
                      },
                    },
                  };

                  return (
                    <div
                      key={dim}
                      className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                          Top {dim.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-semibold text-emerald-400 font-mono">
                          ₹{info.top_value_total?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      <div className="text-base font-bold text-slate-100">
                        {info.top_value}
                      </div>

                      {info.all_values && info.all_values.length > 0 && (
                        <PlotlyChart
                          chartJson={barChartJson}
                          title={null}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Data Quality Warnings */}
          {dashboardData.data_quality_warnings &&
            dashboardData.data_quality_warnings.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Data Quality Alerts</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-200/90">
                  {dashboardData.data_quality_warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

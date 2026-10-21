import React, { useEffect, useRef } from 'react';

export default function PlotlyChart({ chartJson, title }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !chartJson) return;

    try {
      const fig = typeof chartJson === 'string' ? JSON.parse(chartJson) : chartJson;
      const data = fig.data || [];
      const layout = {
        ...(fig.layout || {}),
        autosize: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
          family: 'Plus Jakarta Sans, sans-serif',
          color: '#cbd5e1',
          size: 12,
        },
        margin: { l: 50, r: 25, t: title ? 40 : 25, b: 45 },
        xaxis: {
          ...(fig.layout?.xaxis || {}),
          gridcolor: 'rgba(255,255,255,0.06)',
          zerolinecolor: 'rgba(255,255,255,0.1)',
        },
        yaxis: {
          ...(fig.layout?.yaxis || {}),
          gridcolor: 'rgba(255,255,255,0.06)',
          zerolinecolor: 'rgba(255,255,255,0.1)',
        },
      };

      const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
      };

      if (window.Plotly) {
        window.Plotly.newPlot(containerRef.current, data, layout, config);
      } else {
        console.warn('Plotly library not loaded on window.');
      }
    } catch (e) {
      console.error('Failed to parse or render Plotly chart:', e);
    }

    const handleResize = () => {
      if (window.Plotly && containerRef.current) {
        window.Plotly.Plots.resize(containerRef.current);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chartJson, title]);

  return (
    <div className="w-full my-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800 shadow-lg overflow-hidden">
      {title && (
        <h4 className="text-sm font-semibold text-slate-300 px-2 pt-1 pb-2">
          {title}
        </h4>
      )}
      <div ref={containerRef} className="w-full min-h-[340px]" />
    </div>
  );
}

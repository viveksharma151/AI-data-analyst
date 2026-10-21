import React from 'react';

/**
 * Formats AI responses into clean, elegant HTML elements:
 * - Highlights bullet points & numbered lists
 * - Renders **bold** values/metrics nicely with badge-like or bold styling
 * - Highlights key currency/numbers
 * - Code/SQL blocks and inline backticks
 */
export default function FormattedAnswer({ content }) {
  if (!content) return null;

  // Split content by paragraphs or list items
  const lines = content.split('\n');

  const renderInlineFormatted = (text) => {
    // Replace **bold**
    const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        // Highlight metric or currency if it looks like a value
        const isValue = /^[\$₹€]?\d+([.,]\d+)?%?$/.test(inner) || inner.length < 20;
        return (
          <strong
            key={i}
            className={
              isValue
                ? 'font-bold text-indigo-300 bg-indigo-950/40 px-1 py-0.5 rounded border border-indigo-500/20'
                : 'font-semibold text-slate-100'
            }
          >
            {inner}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-xs border border-slate-700/60"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const elements = [];
  let currentList = [];
  let isNumbered = false;

  const flushList = () => {
    if (currentList.length > 0) {
      if (isNumbered) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal list-outside pl-5 my-2.5 space-y-1.5 text-slate-200">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineFormatted(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc list-outside pl-5 my-2.5 space-y-1.5 text-slate-200">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineFormatted(item)}
              </li>
            ))}
          </ul>
        );
      }
      currentList = [];
      isNumbered = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check for empty line
    if (!trimmed) {
      flushList();
      return;
    }

    // Check for bullet point (*, -, •)
    const bulletMatch = trimmed.match(/^[\*\-•]\s+(.*)$/);
    if (bulletMatch) {
      if (isNumbered) flushList();
      isNumbered = false;
      currentList.push(bulletMatch[1]);
      return;
    }

    // Check for numbered list (1., 2., etc.)
    const numMatch = trimmed.match(/^\d+[\.\)]\s+(.*)$/);
    if (numMatch) {
      if (!isNumbered && currentList.length > 0) flushList();
      isNumbered = true;
      currentList.push(numMatch[1]);
      return;
    }

    // If it's a heading (### or ##)
    if (trimmed.startsWith('#')) {
      flushList();
      const level = trimmed.match(/^#+/)[0].length;
      const text = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <h4 key={`h-${idx}`} className="text-sm font-bold text-slate-100 mt-3 mb-1.5 flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full inline-block" />
          {renderInlineFormatted(text)}
        </h4>
      );
      return;
    }

    // Standard paragraph
    flushList();
    elements.push(
      <p key={`p-${idx}`} className="my-1.5 text-sm text-slate-200 leading-relaxed">
        {renderInlineFormatted(trimmed)}
      </p>
    );
  });

  flushList();

  return (
    <div className="formatted-answer space-y-1">
      {elements}
    </div>
  );
}

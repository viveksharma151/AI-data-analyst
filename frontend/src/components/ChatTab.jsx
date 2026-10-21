import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Pin, Loader2 } from 'lucide-react';
import PlotlyChart from './PlotlyChart';
import SqlViewer from './SqlViewer';
import ReasoningTrace from './ReasoningTrace';
import AnomalyTable from './AnomalyTable';
import FormattedAnswer from './FormattedAnswer';

export default function ChatTab({
  messages,
  onSendMessage,
  isLoading,
  sessionId,
  onSelectSampleQuestion,
}) {
  const [inputQuestion, setInputQuestion] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isLoading) return;
    onSendMessage(inputQuestion.trim());
    setInputQuestion('');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-57px)] bg-slate-950">
      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                Data Analyst Assistant
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {sessionId
                  ? 'Ask any analytical, trend, SQL or anomaly question about your uploaded dataset.'
                  : '👈 Upload one or more CSV files in the sidebar to initiate your analysis session.'}
              </p>
            </div>

            {sessionId && (
              <div className="w-full pt-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Quick Starter Queries
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {[
                    'Which region generated the highest revenue?',
                    'Show monthly sales trends',
                    'Detect anomalies in the dataset',
                    'Generate SQL for total revenue by category',
                  ].map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectSampleQuestion(sample)}
                      className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 transition-all leading-snug"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3.5 max-w-4xl mx-auto ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`rounded-2xl p-4.5 max-w-2xl w-full ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none ml-12'
                    : 'bg-slate-900/80 border border-slate-800/90 text-slate-200 rounded-tl-none mr-12 shadow-sm'
                }`}
              >
                {/* Proactive Similar Question Banner */}
                {msg.similar_past_question && (
                  <div className="mb-3.5 p-3 rounded-xl bg-indigo-500/10 border-l-4 border-indigo-500 border-y border-r border-indigo-500/20 text-xs text-indigo-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
                      <Pin className="w-3.5 h-3.5" />
                      <span>
                        Similar to previous query (
                        {Math.round(msg.similar_past_question.similarity * 100)}
                        % match):
                      </span>
                    </div>
                    <p className="italic text-slate-300">
                      "{msg.similar_past_question.question}"
                    </p>
                  </div>
                )}

                {/* Main text content with clean formatting */}
                {msg.role === 'assistant' ? (
                  <FormattedAnswer content={msg.content} />
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                )}

                {/* Plotly Chart */}
                {msg.chart_json && (
                  <PlotlyChart
                    chartJson={msg.chart_json}
                    title={msg.chart_title}
                  />
                )}

                {/* SQL Query */}
                {msg.sql_query && <SqlViewer query={msg.sql_query} />}

                {/* Flagged Anomalies */}
                {msg.anomalies && msg.anomalies.total_flagged > 0 && (
                  <AnomalyTable anomaliesData={msg.anomalies} />
                )}

                {/* Reasoning Trace */}
                {msg.trace && <ReasoningTrace trace={msg.trace} />}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex-shrink-0 flex items-center justify-center text-slate-300 border border-slate-700">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3.5 max-w-4xl mx-auto justify-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-3 text-sm text-slate-300">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Analyzing data, formulating query & generating insights...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-sm">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            disabled={!sessionId || isLoading}
            placeholder={
              sessionId
                ? 'Ask a question about your data (e.g. "show monthly sales trends", "detect anomalies")...'
                : 'Upload a CSV dataset in the sidebar to start asking questions...'
            }
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={!sessionId || !inputQuestion.trim() || isLoading}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

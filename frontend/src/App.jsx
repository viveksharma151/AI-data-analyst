import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatTab from './components/ChatTab';
import DashboardTab from './components/DashboardTab';
import { askQuestion } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('ai_analyst_session_id') || null;
  });
  const [datasets, setDatasets] = useState(() => {
    const saved = localStorage.getItem('ai_analyst_datasets');
    return saved ? JSON.parse(saved) : [];
  });
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('ai_analyst_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('ai_analyst_session_id', sessionId);
    } else {
      localStorage.removeItem('ai_analyst_session_id');
    }
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem('ai_analyst_datasets', JSON.stringify(datasets));
  }, [datasets]);

  useEffect(() => {
    localStorage.setItem('ai_analyst_messages', JSON.stringify(messages));
  }, [messages]);

  const handleSessionStarted = (newSessionId, newDatasets) => {
    setSessionId(newSessionId);
    setDatasets(newDatasets);
    setMessages([]);
    setActiveTab('chat');
  };

  const handleResetSession = () => {
    if (window.confirm('Are you sure you want to start a fresh session?')) {
      setSessionId(null);
      setDatasets([]);
      setMessages([]);
      localStorage.removeItem('ai_analyst_session_id');
      localStorage.removeItem('ai_analyst_datasets');
      localStorage.removeItem('ai_analyst_messages');
    }
  };

  const handleSendMessage = async (question) => {
    if (!sessionId || !question.trim()) return;

    const userMessage = {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await askQuestion(sessionId, question);

      const assistantMessage = {
        role: 'assistant',
        content: response.answer,
        intent: response.intent,
        sql_query: response.sql_query,
        chart_json: response.chart?.chart_json,
        chart_title: response.chart?.title,
        anomalies: response.anomalies,
        trace: response.trace,
        similar_past_question: response.similar_past_question,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error processing query: ${err.message}`,
          isError: true,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSampleQuestion = (question) => {
    handleSendMessage(question);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasSession={!!sessionId}
        onResetSession={handleResetSession}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Sidebar
          sessionId={sessionId}
          datasets={datasets}
          onSessionStarted={handleSessionStarted}
          onSelectSampleQuestion={handleSelectSampleQuestion}
          hasMessages={messages.length > 0}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {activeTab === 'chat' ? (
            <ChatTab
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              sessionId={sessionId}
              onSelectSampleQuestion={handleSelectSampleQuestion}
            />
          ) : (
            <DashboardTab sessionId={sessionId} />
          )}
        </main>
      </div>
    </div>
  );
}

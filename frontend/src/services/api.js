// API Client with dynamic backend URL support (configurable via UI or env)
const DEFAULT_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export function getBackendUrl() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ai_analyst_backend_url') || DEFAULT_BACKEND_URL;
  }
  return DEFAULT_BACKEND_URL;
}

export function setBackendUrl(url) {
  if (typeof window !== 'undefined') {
    const cleanUrl = url.replace(/\/+$/, '');
    localStorage.setItem('ai_analyst_backend_url', cleanUrl);
    return cleanUrl;
  }
  return url;
}

export async function checkHealth(customUrl = null) {
  const baseUrl = customUrl || getBackendUrl();
  try {
    const res = await fetch(`${baseUrl}/api/health`, { method: 'GET' });
    if (!res.ok) return { ok: false, status: res.status };
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function uploadCsvFiles(files) {
  const baseUrl = getBackendUrl();
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  const res = await fetch(`${baseUrl}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed with status ${res.status}`);
  }

  return await res.json();
}

export async function askQuestion(sessionId, question) {
  const baseUrl = getBackendUrl();
  const res = await fetch(`${baseUrl}/api/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
      question: question,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Query failed with status ${res.status}`);
  }

  return await res.json();
}

export async function fetchDashboard(sessionId, tableName = null) {
  const baseUrl = getBackendUrl();
  const url = new URL(`${baseUrl}/api/dashboard/${sessionId}`);
  if (tableName) {
    url.searchParams.append('table_name', tableName);
  }

  const res = await fetch(url.toString(), { method: 'GET' });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch dashboard data`);
  }

  return await res.json();
}

export async function exportPdfReport(sessionId) {
  const baseUrl = getBackendUrl();
  const res = await fetch(`${baseUrl}/api/export/pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!res.ok) {
    throw new Error(`Export failed with status ${res.status}`);
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `analysis_report_${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

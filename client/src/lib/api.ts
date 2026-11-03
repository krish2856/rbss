// API client with smart URL normalization and robust error handling

let rawBase = (process.env.NEXT_PUBLIC_API_URL || '').trim();
rawBase = rawBase.replace(/\/+$/, '');

// Automatically ensure /api is present, regardless of how user entered URL in Vercel
const API_BASE = rawBase
  ? rawBase.endsWith('/api')
    ? rawBase
    : `${rawBase}/api`
  : 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  [key: string]: any;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('rbs_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_BASE}${cleanEndpoint}`;

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';

    // Handle HTML error pages (e.g., 502/503 from Render cold start or 404) gracefully
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        throw new Error('Backend server is waking up on Render. Please wait 15 seconds and tap again.');
      }
      if (res.status === 404) {
        throw new Error('Backend API endpoint not found. Please verify backend URL in settings.');
      }
      throw new Error(`Server returned error (${res.status}). Please try again shortly.`);
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err: any) {
    console.error(`API Error on [${endpoint}]:`, err.message);
    throw err;
  }
}

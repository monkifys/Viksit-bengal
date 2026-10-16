/**
 * Viksit Bengal Dashboard - Frontend API Client
 * Connects Next.js client and server components to the NestJS backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers = {}, ...rest } = options;
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const authHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...rest,
    headers: authHeaders,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  getDistricts: () => fetchApi('/districts'),
  getDistrictByCode: (code: string) => fetchApi(`/districts/${code}`),
  getPromises: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchApi(`/promises${query}`);
  },
  getPromiseByCode: (code: string) => fetchApi(`/promises/${code}`),
  getIndicators: () => fetchApi('/indicators'),
  getEvidence: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchApi(`/evidence${query}`);
  },
  login: (credentials: { email: string; password: string }) =>
    fetchApi<{ accessToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: (token: string) =>
    fetchApi('/auth/me', { token }),
};

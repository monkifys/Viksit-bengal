/**
 * Viksit Bengal Dashboard - Live API Client
 * Robust HTTP client with connection detection, automatic token attachment, and JSON parsing
 */

export class ApiClient {
  constructor(baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async isServerAlive(timeoutMs = 1500) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(`${this.baseUrl}/districts`, {
        signal: controller.signal,
        method: 'GET'
      }).catch(() => null);
      clearTimeout(timeoutId);
      return res !== null;
    } catch {
      return false;
    }
  }

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {})
    };

    if (this.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const fetchOptions = {
      method: options.method || 'GET',
      headers,
      ...(options.body ? { body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body) } : {})
    };

    const startTime = Date.now();
    try {
      const res = await fetch(url, fetchOptions);
      const durationMs = Date.now() - startTime;
      let data = null;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      return {
        ok: res.ok,
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
        data,
        durationMs
      };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        headers: {},
        data: null,
        error: err.message,
        durationMs: Date.now() - startTime
      };
    }
  }

  get(path, headers = {}) {
    return this.request(path, { method: 'GET', headers });
  }

  post(path, body, headers = {}) {
    return this.request(path, { method: 'POST', body, headers });
  }

  patch(path, body, headers = {}) {
    return this.request(path, { method: 'PATCH', body, headers });
  }

  delete(path, headers = {}) {
    return this.request(path, { method: 'DELETE', headers });
  }

  async login(email, password) {
    const res = await this.post('/auth/login', { email, password });
    if (res.ok && res.data && res.data.accessToken) {
      this.setToken(res.data.accessToken);
    }
    return res;
  }
}

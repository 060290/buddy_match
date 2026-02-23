const base = '/api';

let authToken = null;

export function setAuthToken(token) {
  authToken = token || null;
}

async function request(method, path, body, opts = {}) {
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  const config = { method, headers, credentials: 'include', ...opts };
  if (body != null && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    config.body = JSON.stringify(body);
  }
  const res = await fetch(url, config);
  const data = res.headers.get('content-type')?.includes('json') ? await res.json().catch(() => ({})) : {};
  if (!res.ok) throw Object.assign(new Error(data.error || res.statusText), { status: res.status, data });
  return { data, status: res.status };
}

export const api = {
  get: (path, opts) => request('GET', path, null, opts),
  post: (path, body, opts) => request('POST', path, body, opts),
  patch: (path, body, opts) => request('PATCH', path, body, opts),
  delete: (path, opts) => request('DELETE', path, null, opts),
};

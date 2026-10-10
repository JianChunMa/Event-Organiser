export class ApiError extends Error { constructor(msg, status, details) { super(msg); this.status = status; this.details = details; } }

async function req(path, { method = 'GET', body, token, raw } = {}) {
  const res = await fetch('/api' + path, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { 'x-host-token': token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (raw && res.ok) return res;
  const data = res.status === 204 ? null : await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data?.error || 'Request failed', res.status, data?.details);
  return data;
}

export const api = {
  createEvent: (b) => req('/events', { method: 'POST', body: b }),
  getEvent: (slug) => req(`/events/${slug}`),
  register: (slug, b) => req(`/events/${slug}/registrations`, { method: 'POST', body: b }),
  hostGet: (slug, t) => req(`/host/events/${slug}`, { token: t }),
  hostUpdate: (slug, t, b) => req(`/host/events/${slug}`, { method: 'PATCH', token: t, body: b }),
  hostDelete: (slug, t) => req(`/host/events/${slug}`, { method: 'DELETE', token: t }),
  hostRemoveReg: (slug, t, id) => req(`/host/events/${slug}/registrations/${id}`, { method: 'DELETE', token: t }),
  hostExport: (slug, t, format) => req(`/host/events/${slug}/export?format=${format}`, { token: t, raw: true }),
};

// Host tokens live in this browser only
const KEY = 'px-hosted';
export const hosted = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
export const saveHost = (slug, token, title) => localStorage.setItem(KEY, JSON.stringify({ ...hosted(), [slug]: { token, title } }));
export const forgetHost = (slug) => { const h = hosted(); delete h[slug]; localStorage.setItem(KEY, JSON.stringify(h)); };

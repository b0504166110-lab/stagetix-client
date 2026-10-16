// One place for every HTTP call to the server.
// - The server address comes from VITE_API_URL (never hard-coded).
// - The JWT is attached as "Authorization: Bearer <token>".
// - Every non-2xx answer becomes an ApiError built from the server's uniform error body.

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.detail || `HTTP ${status}`);
    this.status = status;
    this.title = body?.title;
    this.detail = body?.detail;
    this.correlationId = body?.correlationId;
    this.errors = body?.errors;
  }
}

let getToken = () => null;
let onUnauthorized = () => {};

/** Called once by the AuthProvider, so this module can read the token and react to an expired one. */
export function configureApi(options) {
  getToken = options.getToken;
  onUnauthorized = options.onUnauthorized;
}

export async function request(path, { method = 'GET', body, query } = {}) {
  if (!API_URL) {
    throw new ApiError(0, { detail: 'VITE_API_URL is not set. Copy .env.example to .env.' });
  }

  const url = new URL(API_URL + path);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, { detail: 'The server cannot be reached.' });
  }

  const isJson = response.headers.get('content-type')?.includes('json');
  const data = response.status === 204 || !isJson ? null : await response.json();

  if (!response.ok) {
    if (response.status === 401 && token) onUnauthorized();
    throw new ApiError(response.status, data);
  }

  return data;
}

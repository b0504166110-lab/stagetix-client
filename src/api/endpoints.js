// Every server endpoint the client uses, by name. The URLs match the server's REST API.
import { request } from './client.js';

export const authApi = {
  login: (email, password) => request('/api/tokens', { method: 'POST', body: { email, password } }),
  register: (fullName, email, password) => request('/api/users', { method: 'POST', body: { fullName, email, password } })
};

export const showsApi = {
  list: (query) => request('/api/shows', { query }),
  get: (id) => request(`/api/shows/${id}`),
  seats: (id) => request(`/api/shows/${id}/seats`),
  create: (show) => request('/api/shows', { method: 'POST', body: show }),
  update: (id, show) => request(`/api/shows/${id}`, { method: 'PUT', body: show }),
  setStatus: (id, status) => request(`/api/shows/${id}/status`, { method: 'PATCH', body: { status } }),
  remove: (id) => request(`/api/shows/${id}`, { method: 'DELETE' })
};

export const ordersApi = {
  create: (showId, seatIds) => request('/api/orders', { method: 'POST', body: { showId, seatIds } }),
  list: (query) => request('/api/orders', { query }),
  cancel: (id) => request(`/api/orders/${id}/status`, { method: 'PATCH', body: { status: 'Cancelled' } })
};

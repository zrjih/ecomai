const API_BASE = '/v1';

let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');
let onAuthFail = null;

export function setAuthFailHandler(handler) {
  onAuthFail = handler;
}

export function setTokens(access, refresh) {
  accessToken = access;
  refreshToken = refresh;
  if (access) localStorage.setItem('accessToken', access);
  else localStorage.removeItem('accessToken');
  if (refresh) localStorage.setItem('refreshToken', refresh);
  else localStorage.removeItem('refreshToken');
}

export function getAccessToken() {
  return accessToken;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

async function request(method, path, body, extraHeaders = {}) {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && refreshToken) {
    // Try to refresh
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setTokens(data.accessToken, data.refreshToken);
      headers['Authorization'] = `Bearer ${data.accessToken}`;
      const retry = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || `${retry.status}`);
      }
      return retry.json();
    } else {
      clearTokens();
      if (onAuthFail) onAuthFail();
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `${res.status}`);
  }

  return res.json();
}

// Auth
export const auth = {
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  refresh: (token) => request('POST', '/auth/refresh', { refreshToken: token }),
  logout: (token) => request('POST', '/auth/logout', { refreshToken: token }),
};

// Users
export const users = {
  me: () => request('GET', '/users/me'),
  create: (data) => request('POST', '/users', data),
};

// Shops
export const shops = {
  list: () => request('GET', '/shops'),
  me: () => request('GET', '/shops/me'),
};

// Products
export const products = {
  list: () => request('GET', '/products'),
  get: (id) => request('GET', `/products/${id}`),
  create: (data) => request('POST', '/products', data),
  update: (id, data) => request('PATCH', `/products/${id}`, data),
  delete: (id) => request('DELETE', `/products/${id}`),
};

// Product Variants
export const variants = {
  list: (productId) => request('GET', `/products/${productId}/variants`),
  create: (productId, data) => request('POST', `/products/${productId}/variants`, data),
  get: (variantId) => request('GET', `/product-variants/${variantId}`),
  update: (variantId, data) => request('PATCH', `/product-variants/${variantId}`, data),
  delete: (variantId) => request('DELETE', `/product-variants/${variantId}`),
};

// Orders
export const orders = {
  list: () => request('GET', '/orders'),
  get: (id) => request('GET', `/orders/${id}`),
  create: (data) => request('POST', '/orders', data),
  updateStatus: (id, status) => request('PATCH', `/orders/${id}/status`, { status }),
  createDelivery: (orderId, data) => request('POST', `/orders/${orderId}/delivery-requests`, data),
  createPayment: (orderId, data) => request('POST', `/orders/${orderId}/payments`, data),
};

// Customers
export const customers = {
  list: () => request('GET', '/customers'),
  create: (data) => request('POST', '/customers', data),
};

// Payments
export const payments = {
  list: (orderId) => request('GET', `/payments${orderId ? `?orderId=${orderId}` : ''}`),
  get: (id) => request('GET', `/payments/${id}`),
  refund: (paymentId, data) => request('POST', `/payments/${paymentId}/refunds`, data),
};

// Delivery Requests
export const deliveries = {
  list: () => request('GET', '/delivery-requests'),
  updateStatus: (id, status) => request('PATCH', `/delivery-requests/${id}/status`, { status }),
};

// Marketing Campaigns
export const campaigns = {
  list: () => request('GET', '/marketing-campaigns'),
  create: (data) => request('POST', '/marketing-campaigns', data),
  generateDraft: (data) => request('POST', '/marketing-campaigns/generate-draft', data),
};

// Inventory Movements
export const inventory = {
  list: (variantId) => request('GET', `/inventory-movements${variantId ? `?variantId=${variantId}` : ''}`),
};

// Website Settings
export const websiteSettings = {
  get: () => request('GET', '/website-settings/me'),
  update: (data) => request('PATCH', '/website-settings/me', data),
};

/**
 * api.js — HaulSync frontend API client
 *
 * All requests go to the Express backend at BASE_URL.
 * Every method returns { success, data } and never throws —
 * callers get a graceful null on network failure.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(method, path, body) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: "include",          // send session cookie
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    return { ok: res.ok, ...json };
  } catch (err) {
    console.warn(`[api] ${method} ${path} failed:`, err.message);
    return { ok: false, error: err.message };
  }
}

// ── Orders ──────────────────────────────────────────────────────────────────
export const api = {
  orders: {
    list:   ()       => request("GET",    "/api/orders"),
    get:    (id)     => request("GET",    `/api/orders/${id}`),
    create: (order)  => request("POST",   "/api/orders", order),
  },

  addresses: {
    list:   ()           => request("GET",    "/api/addresses"),
    add:    (addr)       => request("POST",   "/api/addresses", addr),
    update: (id, patch)  => request("PUT",    `/api/addresses/${id}`, patch),
    remove: (id)         => request("DELETE", `/api/addresses/${id}`),
  },

  payments: {
    list:   ()       => request("GET",    "/api/payments"),
    add:    (method) => request("POST",   "/api/payments", method),
    remove: (id)     => request("DELETE", `/api/payments/${id}`),
  },

  apikeys: {
    list:   ()             => request("GET",    "/api/apikeys"),
    add:    (key)          => request("POST",   "/api/apikeys", key),
    remove: (id)           => request("DELETE", `/api/apikeys/${id}`),
    saveCookie: (platform, cookieBlob) =>
      request("POST", "/api/apikeys/cookies", { platform, cookieBlob }),
    getCookie: (platform)  => request("GET", `/api/apikeys/cookies/${platform}`),
  },

  health: () => request("GET", "/api/health"),
};

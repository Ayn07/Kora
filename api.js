/**
 * api.js — HaulSync API client
 *
 * All methods return a plain object with an `ok` boolean so callers
 * never have to try/catch; network errors are caught internally and
 * reflected in `ok: false`.
 *
 * Base URL is relative so Vite's proxy (/api → localhost:5000) handles
 * the redirect in dev, and the deployed host handles it in prod.
 */

const BASE = "/api";

async function request(method, path, body) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, ...data };
  } catch {
    return { ok: false, status: 0, error: "Network error" };
  }
}

export const api = {
  /** GET /api/health — used to detect whether the backend is running */
  health: () => request("GET", "/health"),

  users: {
    /** POST /api/users/signin */
    signin: (identifier, password) =>
      request("POST", "/users/signin", { identifier, password }),

    /** POST /api/users/signup */
    signup: (identifier, password) =>
      request("POST", "/users/signup", { identifier, password }),
  },

  orders: {
    /** GET /api/orders — returns { ok, orders: [...] } */
    list: () => request("GET", "/orders"),

    /** POST /api/orders — creates one or more orders */
    create: (payload) => request("POST", "/orders", payload),
  },
};

// src/lib/api.ts
import axios from 'axios';

/**
 * NOTE:
 * This module acts as the transport layer adapter of the frontend.
 * It mirrors the hexagonal boundary from backend:
 *
 * UI → API Client (this file) → HTTP → Backend
 *
 * No UI component should directly configure transport behavior.
 */


export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
});

/**
 * Request interceptor.
 *
 * Architectural reasoning:
 * - Authentication is transport concern, not feature concern.
 * - Features should not know how tokens are attached.
 * - Security must be enforced at infrastructure layer.
 *
 * This guarantees:
 * - Every request automatically carries JWT (if present).
 * - No developer can "forget" to attach Authorization header.
 * - Token injection is consistent and testable.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("currentUser");
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(err);
  }
);

export function toApiMessage(err: unknown): string {
  const e = err as any;
  const status = e?.response?.status;
  const code = e?.response?.data?.code;
  const msg = e?.response?.data?.message;

  if (status === 412) return "Conflict: data was changed by someone else. Refresh and try again.";
  if (status === 401 || status === 403) return "Session expired. Please log in again.";
  return msg || code || "Unexpected error";
}

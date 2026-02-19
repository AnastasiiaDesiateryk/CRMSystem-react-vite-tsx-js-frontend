// src/lib/auth-api.ts

/**
 * Auth API adapter.
 *
 * Architectural role:
 * - This module represents the authentication boundary of the frontend.
 * - It encapsulates all auth-related HTTP contracts.
 *
 * Why this exists:
 * - UI must not know HTTP routes.
 * - UI must not shape backend payloads.
 * - UI must not deal with transport details.
 *
 * This file mirrors backend hexagonal architecture:
 *
 * UI → Auth API Adapter → HTTP → AuthController → AuthService
 *
 * If backend contract changes, only this file changes.
 */

import { api } from './api';
import type { User } from "../types";

/**
 * TokenResponse reflects backend contract.
 *
 * Important:
 * - We deliberately model backend response explicitly.
 * - Avoid using `any` to preserve compile-time guarantees.
 * - This keeps frontend strongly aligned with backend DTO.
 */

export type TokenResponse = {
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds?: number;
};

/**
 * Login operation.
 *
 * Security model:
 * - Returns access + refresh token.
 * - Token persistence is NOT handled here.
 * - State management responsibility belongs to auth-context.
 *
 * Separation of concerns:
 * - API layer = transport.
 * - Context layer = session lifecycle.
 */

export async function login(email: string, password: string): Promise<TokenResponse> {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data as TokenResponse;
}

export async function register(email: string, password: string, name: string): Promise<TokenResponse> {
  const { data } = await api.post("/api/auth/register", { email, password, name });
  return data as TokenResponse;
}

/**
 * Fetch currently authenticated user.
 *
 * Architectural reasoning:
 * - Never trust locally stored user object.
 * - Always resolve user from backend.
 *
 * This guarantees:
 * - Roles are authoritative.
 * - hasAccess flag is authoritative.
 * - RBAC enforcement remains server-driven.
 */
export async function me(): Promise<User> {
  const { data } = await api.get("/api/me");
  return data as User;
}
// src/lib/auth-api.ts
import { api } from './api';

export async function login(email: string, password: string) {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data; // { accessToken, user }
}

export async function register(email: string, password: string, name: string) {
  const { data } = await api.post('/api/auth/register', {
    email, password, name,
  });
  return data;
}

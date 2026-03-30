import { api } from './api';
import type { User } from '../types';

export async function listAdminUsers(): Promise<User[]> {
  const { data } = await api.get('/api/admin/users');
  return data as User[];
}

export async function updateUserAccess(userId: string, hasAccess: boolean): Promise<User> {
  const { data } = await api.patch(`/api/admin/users/${userId}/access`, { hasAccess });
  return data as User;
}

export async function updateUserRoles(userId: string, roles: string[]): Promise<User> {
  const { data } = await api.put(`/api/admin/users/${userId}/roles`, { roles });
  return data as User;
}
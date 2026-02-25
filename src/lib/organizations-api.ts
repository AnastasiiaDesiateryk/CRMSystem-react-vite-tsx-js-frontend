import { api } from './api';
import { Organization } from '../types';

export async function listOrganizations(): Promise<Organization[]> {
  const res = await api.get('/api/organizations');
  return res.data.items ?? [];
}

export async function createOrganization(
  payload: Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'etag'>
): Promise<Organization> {
  const res = await api.post<Organization>('/api/organizations', payload);
  return res.data;
}

export async function patchOrganization(id: string, patch: Partial<Organization>, etag: string) {
  const res = await api.patch<Organization>(`/api/organizations/${id}`, patch, {
    headers: { 'If-Match': etag },
  });
  return res.data;
}

export async function deleteOrganization(id: string, etag: string): Promise<void> {
  await api.delete(`/api/organizations/${id}`, {
    headers: { 'If-Match': etag },
  });
}
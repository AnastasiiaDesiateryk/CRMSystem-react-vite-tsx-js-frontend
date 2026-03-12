import { api, authIfMatchHeaders } from './api';
import { Contact } from '../types';

function withEtag<T extends object>(data: T, etag?: string | null): T & { etag?: string } {
  return {
    ...data,
    etag: etag ?? undefined,
  };
}

export async function listContactsByOrganization(orgId: string): Promise<Contact[]> {
  const res = await api.get<Contact[]>(`/api/organizations/${orgId}/contacts`);
  return res.data.map((c) => withEtag(c, c.etag));
}

export async function getContact(orgId: string, contactId: string): Promise<Contact> {
  const res = await api.get<Contact>(`/api/organizations/${orgId}/contacts/${contactId}`);
  return withEtag(res.data, res.headers.etag);
}

export async function createContact(
  orgId: string,
  payload: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'etag'>
): Promise<Contact> {
  const res = await api.post<Contact>(`/api/organizations/${orgId}/contacts`, payload);
  return withEtag(res.data, res.headers.etag);
}

export async function patchContact(
  orgId: string,
  contactId: string,
  patch: Partial<Contact>,
  etag: string
): Promise<Contact> {
  const res = await api.patch<Contact>(
    `/api/organizations/${orgId}/contacts/${contactId}`,
    patch,
    { headers: authIfMatchHeaders(etag) }
  );
  return withEtag(res.data, res.headers.etag);
}

export async function deleteContact(
  orgId: string,
  contactId: string,
  etag: string
): Promise<void> {
  await api.delete(`/api/organizations/${orgId}/contacts/${contactId}`, {
    headers: authIfMatchHeaders(etag),
  });
}
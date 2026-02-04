import { api } from './api';
import { Organization } from '../types';

export const getOrganizations = async (): Promise<Organization[]> => {
  const { data } = await api.get('/api/organizations');
  return data;
};

export const createOrganization = async (payload: Partial<Organization>) => {
  const { data } = await api.post('/api/organizations', payload);
  return data;
};

// src/lib/import-api.ts
import { api } from './api';

export interface ImportOrganizationsResponse {
  organizationsCreated: number;
  organizationsUpdated: number;
  contactsCreated: number;
  rowsSkipped: number;
  warnings: string[];
}

export async function importOrganizationsExcel(
  file: File
): Promise<ImportOrganizationsResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ImportOrganizationsResponse>(
    '/api/imports/organizations/excel',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

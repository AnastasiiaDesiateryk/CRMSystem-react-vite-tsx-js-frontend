import { useRef, useState } from 'react';
import { useData } from '../lib/data-context';
import { api, toApiMessage } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

type ImportOrganizationsResponse = {
  organizationsCreated: number;
  organizationsUpdated: number;
  contactsCreated: number;
  rowsSkipped: number;
  warnings: string[];
};

const IMPORT_ENDPOINT = '/api/imports/organizations/excel';

export function ImportExportPage() {
  const { organizations, contacts } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [lastImportResult, setLastImportResult] =
    useState<ImportOrganizationsResponse | null>(null);

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    const orgsData = organizations.map((org) => ({
      ID: org.id,
      Name: org.name,
      Website: org.website,
      'Website Status': org.websiteStatus || '',
      'LinkedIn URL': org.linkedinUrl || '',
      'Country/Region': org.countryRegion,
      Email: org.email,
      Category: org.category,
      Status: org.status,
      Notes: org.notes || '',
      'Created At': org.createdAt,
      'Updated At': org.updatedAt,
    }));

    const orgsSheet = XLSX.utils.json_to_sheet(orgsData);
    XLSX.utils.book_append_sheet(wb, orgsSheet, 'Organizations');

    const contactsData = contacts.map((contact) => {
      const org = organizations.find((o) => o.id === contact.organizationId);

      return {
        ID: contact.id,
        'Organization Name': org?.name || '',
        'Organization ID': contact.organizationId,
        Name: contact.name,
        'Role/Position': contact.rolePosition,
        Email: contact.email,
        'Preferred Language': contact.preferredLanguage,
        Notes: contact.notes,
        'Created At': contact.createdAt,
        'Updated At': contact.updatedAt,
      };
    });

    const contactsSheet = XLSX.utils.json_to_sheet(contactsData);
    XLSX.utils.book_append_sheet(wb, contactsSheet, 'Contacts');

    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `crm-export-${timestamp}.xlsx`);

    toast.success('Export completed');
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setLastImportResult(null);

    const lowerName = file.name.toLowerCase();

    if (!lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      resetFileInput();
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsImporting(true);

      const { data } = await api.post<ImportOrganizationsResponse>(
        IMPORT_ENDPOINT,
        formData,
        {
          timeout: 300_000,
        }
      );

      setLastImportResult(data);

      toast.success(
        `Import completed: ${data.organizationsCreated} created, ${data.organizationsUpdated} updated, ${data.contactsCreated} contacts created`
      );
    } catch (error) {
      toast.error(toApiMessage(error));
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
      resetFileInput();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>
              Download all organizations and contacts as an Excel file.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button onClick={handleExport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>The export will include:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{organizations.length} organizations</li>
                <li>{contacts.length} contacts</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>
              Upload the source Excel file. The backend will parse the Database sheet and save the data.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
              id="file-upload"
              disabled={isImporting}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={isImporting}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import from Excel'}
            </Button>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>File requirements:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Excel format: .xlsx or .xls</li>
                <li>Sheet name: Database</li>
                <li>
                  Required columns: Company, Website, LinkedIn, Cantone, Email organization,
                  Category NEW, Name personal contact, Email personal contact (1), Email personal contact (2)
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Behavior</CardTitle>
          <CardDescription>
            The import is processed by the backend and written directly to the database.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Organizations are matched by website when available. If no website is available,
            the organization name is used.
          </p>

          <p>
            Existing organizations are updated. New organizations and contacts are created when
            no matching record exists.
          </p>

          <p>
            Empty rows are skipped. Duplicate contacts with the same organization and email are
            skipped and reported as warnings.
          </p>
        </CardContent>
      </Card>

      {lastImportResult && (
        <Card>
          <CardHeader>
            <CardTitle>Last Import Result</CardTitle>
            <CardDescription>
              Summary returned by the backend.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Organizations created</p>
                <p className="text-2xl font-semibold">{lastImportResult.organizationsCreated}</p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Organizations updated</p>
                <p className="text-2xl font-semibold">{lastImportResult.organizationsUpdated}</p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Contacts created</p>
                <p className="text-2xl font-semibold">{lastImportResult.contactsCreated}</p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Rows skipped</p>
                <p className="text-2xl font-semibold">{lastImportResult.rowsSkipped}</p>
              </div>
            </div>

            {lastImportResult.warnings.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="mb-2 font-medium text-amber-900">Warnings</p>

                <ul className="list-disc list-inside space-y-1 text-sm text-amber-900">
                  {lastImportResult.warnings.slice(0, 20).map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>

                {lastImportResult.warnings.length > 20 && (
                  <p className="mt-2 text-sm text-amber-900">
                    Showing first 20 of {lastImportResult.warnings.length} warnings.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { useRef, useState } from 'react';
import { useData } from '../lib/data-context';
import * as importApi from '../lib/import-api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Download, Upload, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function ImportExportPage() {
  const { organizations, contacts, reloadData } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedEmails, setImportedEmails] = useState<string>('');
  const [emailDelimiter, setEmailDelimiter] = useState<string>('comma');
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Organizations sheet
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

    // Contacts sheet
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

    // Download
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `crm-export-${timestamp}.xlsx`);
    toast.success('Data exported successfully!');
  };

  const DATABASE_SHEET_NAME = 'Database';

const REQUIRED_HEADERS = [
  'Company',
  'Website',
  'LinkedIn',
  'Cantone',
  'Email organization',
  'Category NEW',
  'Name personal contact',
  'Email personal contact (1)',
  'Email personal contact (2)',
] as const;

function normalizeHeader(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function buildHeaderIndexMap(sheet: XLSX.WorkSheet): Record<string, number> {
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: '',
  });

  const headerRow = rows[0];
  if (!headerRow || !Array.isArray(headerRow)) {
    throw new Error(`Sheet "${DATABASE_SHEET_NAME}" has no header row`);
  }

  const map: Record<string, number> = {};
  headerRow.forEach((cell, index) => {
    const header = normalizeHeader(String(cell ?? ''));
    if (header) {
      map[header] = index;
    }
  });

  return map;
}

function validateRequiredHeaders(headerMap: Record<string, number>) {
  const missing = REQUIRED_HEADERS.filter(
    (header) => headerMap[normalizeHeader(header)] === undefined
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required columns in "${DATABASE_SHEET_NAME}": ${missing.join(', ')}`
    );
  }
}

function extractImportedEmailsFromDatabaseSheet(sheet: XLSX.WorkSheet): string[] {
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: '',
  });

  const headerMap = buildHeaderIndexMap(sheet);
  validateRequiredHeaders(headerMap);

  const email1Index = headerMap[normalizeHeader('Email personal contact (1)')];
  const email2Index = headerMap[normalizeHeader('Email personal contact (2)')];

  const emails = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;

    const email1 = String(row[email1Index] ?? '').trim().toLowerCase();
    const email2 = String(row[email2Index] ?? '').trim().toLowerCase();

    if (email1) emails.add(email1);
    if (email2) emails.add(email2);
  }

  return Array.from(emails);
}

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const lowerName = file.name.toLowerCase();
    const isExcelFile = lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls');

    if (!isExcelFile) {
      throw new Error('Please upload an Excel file (.xlsx or .xls)');
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    if (!workbook.SheetNames.includes(DATABASE_SHEET_NAME)) {
      throw new Error(`Sheet "${DATABASE_SHEET_NAME}" not found`);
    }

    const databaseSheet = workbook.Sheets[DATABASE_SHEET_NAME];
    const emails = extractImportedEmailsFromDatabaseSheet(databaseSheet);
    formatAndDisplayEmails(emails);
    
    const result = await importApi.importOrganizationsExcel(file);

    await reloadData();

    toast.success(
      `Import completed: ${result.organizationsCreated} created, ${result.organizationsUpdated} updated, ${result.contactsCreated} contacts created`
    );

    if (result.rowsSkipped > 0) {
      toast.info(`${result.rowsSkipped} row(s) were skipped`);
    }

    if (result.warnings.length > 0) {
      console.warn('Import warnings:', result.warnings);
      toast.warning(
        result.warnings.length === 1
          ? result.warnings[0]
          : `${result.warnings.length} warning(s) during import. Check console for details.`
      );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error importing file';
    toast.error(message);
    console.error(error);
  } finally {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
};

  const formatAndDisplayEmails = (emails: string[]) => {
    let formatted = '';
    switch (emailDelimiter) {
      case 'comma':
        formatted = emails.join(', ');
        break;
      case 'semicolon':
        formatted = emails.join('; ');
        break;
      case 'newline':
        formatted = emails.join('\n');
        break;
      default:
        formatted = emails.join(', ');
    }
    setImportedEmails(formatted);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(importedEmails);
    setCopied(true);
    toast.success('Emails copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelimiterChange = (newDelimiter: string) => {
    setEmailDelimiter(newDelimiter);
    if (importedEmails) {
      // Re-format existing emails with new delimiter
      const emails = importedEmails.split(/[,;\n]/).map(e => e.trim()).filter(e => e);
      let formatted = '';
      switch (newDelimiter) {
        case 'comma':
          formatted = emails.join(', ');
          break;
        case 'semicolon':
          formatted = emails.join('; ');
          break;
        case 'newline':
          formatted = emails.join('\n');
          break;
        default:
          formatted = emails.join(', ');
      }
      setImportedEmails(formatted);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>
              Download all organizations and contacts as an Excel file
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
              Upload an Excel file to update your CRM data
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
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import from Excel
            </Button>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>File requirements:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Excel format (.xlsx or .xls)</li>
                <li>Required sheet: "Database"</li>
                <li>Columns must match the import template</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import/Export Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2">Excel File Structure</h3>
            <p className="text-muted-foreground mb-2">
              The import file must contain a sheet named <strong>Database</strong> with these required columns:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Company</li>
                  <li>Website</li>
                  <li>LinkedIn</li>
                  <li>Cantone</li>
                  <li>Email organization</li>
                  <li>Category NEW</li>
                  <li>Name personal contact</li>
                  <li>Email personal contact (1)</li>
                  <li>Email personal contact (2)</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-900">
              <strong>Note:</strong> Import reads the <strong>Database</strong> sheet and uploads data to the backend.
              Existing records are merged by deduplication rules and are not overwritten by blank Excel values.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imported Email List</CardTitle>
          <CardDescription>
            After importing an Excel file, all contact emails will appear here for easy copying
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-delimiter">Email Delimiter</Label>
            <Select value={emailDelimiter} onValueChange={handleDelimiterChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comma">Comma (,)</SelectItem>
                <SelectItem value="semicolon">Semicolon (;)</SelectItem>
                <SelectItem value="newline">New Line</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imported-emails">Email List</Label>
            <Textarea
              id="imported-emails"
              value={importedEmails}
              onChange={(e) => setImportedEmails(e.target.value)}
              placeholder="Import an Excel file to see emails here..."
              className="h-40 font-mono text-sm"
              readOnly
            />
            {importedEmails && (
              <p className="text-sm text-muted-foreground">
                {importedEmails.split(/[,;\n]/).filter(e => e.trim()).length} email(s) found
              </p>
            )}
          </div>
          <Button 
            onClick={handleCopy} 
            className="w-full"
            disabled={!importedEmails}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Emails to Clipboard
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
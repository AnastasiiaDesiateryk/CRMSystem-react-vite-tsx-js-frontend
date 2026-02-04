import { useRef, useState } from 'react';
import { useData } from '../lib/data-context';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Download, Upload, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function ImportExportPage() {
  const { organizations, contacts, importData } = useData();
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

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Read Organizations
        const orgsSheet = workbook.Sheets['Organizations'];
        const orgsJson = XLSX.utils.sheet_to_json(orgsSheet) as any[];
        const importedOrgs = orgsJson.map((row) => ({
          id: row.ID || Date.now().toString() + Math.random(),
          name: row.Name || '',
          website: row.Website || '',
          websiteStatus: row['Website Status'] as 'working' | 'not-working' | undefined,
          linkedinUrl: row['LinkedIn URL'] || '',
          countryRegion: row['Country/Region'] || '',
          email: row.Email || '',
          category: row.Category || 'additive-manufacturing',
          status: row.Status || 'active',
          notes: row.Notes || '',
          createdAt: row['Created At'] || new Date().toISOString(),
          updatedAt: row['Updated At'] || new Date().toISOString(),
        }));

        // Read Contacts
        const contactsSheet = workbook.Sheets['Contacts'];
        const contactsJson = XLSX.utils.sheet_to_json(contactsSheet) as any[];
        const importedContacts = contactsJson.map((row) => ({
          id: row.ID || Date.now().toString() + Math.random(),
          organizationId: row['Organization ID'] || '',
          name: row.Name || '',
          rolePosition: row['Role/Position'] || '',
          email: row.Email || '',
          preferredLanguage: (row['Preferred Language'] || 'EN') as 'DE' | 'EN' | 'FR',
          notes: row.Notes || '',
          createdAt: row['Created At'] || new Date().toISOString(),
          updatedAt: row['Updated At'] || new Date().toISOString(),
        }));

        // Extract emails and format them
        const emails = importedContacts.map(c => c.email).filter(e => e);
        formatAndDisplayEmails(emails);

        importData(importedOrgs, importedContacts);
        toast.success(`Imported ${importedOrgs.length} organizations and ${importedContacts.length} contacts!`);
      } catch (error) {
        toast.error('Error importing file. Please check the format.');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    const oldDelimiter = emailDelimiter;
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
                <li>Two sheets: "Organizations" and "Contacts"</li>
                <li>Same column structure as exported files</li>
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
              Your Excel file should contain two sheets with the following columns:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2">Organizations Sheet:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>ID</li>
                  <li>Name</li>
                  <li>Website</li>
                  <li>Website Status</li>
                  <li>LinkedIn URL</li>
                  <li>Country/Region</li>
                  <li>Email</li>
                  <li>Category (start-up, corporate, investor, etc.)</li>
                  <li>Status (active, inactive, closed)</li>
                  <li>Notes</li>
                </ul>
              </div>
              <div>
                <p className="mb-2">Contacts Sheet:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>ID</li>
                  <li>Organization ID</li>
                  <li>Organization Name</li>
                  <li>Name</li>
                  <li>Role/Position</li>
                  <li>Email</li>
                  <li>Preferred Language (DE, EN, FR)</li>
                  <li>Notes</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-900">
              <strong>Note:</strong> Importing data will replace all existing organizations and contacts. 
              Make sure to export your current data before importing to avoid data loss.
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
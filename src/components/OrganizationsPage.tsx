import { useState } from 'react';
import { useData } from '../lib/data-context';
import { Organization, Contact } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Plus, Pencil, Trash2, Users, Mail, Globe, FileText, StickyNote, Filter, CheckCircle2, XCircle, Eye, EyeOff, Linkedin } from 'lucide-react';
import { EmailDialog } from './EmailDialog';
import { Checkbox } from './ui/checkbox';

const CATEGORIES = [
  { value: 'additive-manufacturing', label: 'Additive Manufacturing' },
  { value: 'mobility-fleet-management', label: 'Mobility & Fleet Management' },
  { value: 'product-origin-authentication', label: 'Product Origin & Authentication' },
  { value: 'warehousing-intralogistics-robotics', label: 'Warehousing, Intralogistics & Robotics' },
  { value: 'packaging-bins-containers', label: 'Packaging, Bins & Containers' },
];

const formatCategory = (category: string) => {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat ? cat.label : category;
};

export function OrganizationsPage() {
  const { organizations, contacts, addOrganization, updateOrganization, deleteOrganization, addContact, updateContact, deleteContact } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isOrgDialogOpen, setIsOrgDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isSelectiveEmailDialogOpen, setIsSelectiveEmailDialogOpen] = useState(false);
  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>([]);
  const [selectiveEmailCategory, setSelectiveEmailCategory] = useState<string>('all');
  const [showWebsiteStatus, setShowWebsiteStatus] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [orgForm, setOrgForm] = useState({
    name: '',
    website: '',
    websiteStatus: 'working' as 'working' | 'not-working',
    linkedinUrl: '',
    countryRegion: '',
    email: '',
    category: 'additive-manufacturing' as Organization['category'],
    status: 'active' as Organization['status'],
    notes: '',
  });

  const [contactForm, setContactForm] = useState({
    organizationId: '',
    name: '',
    rolePosition: '',
    email: '',
    preferredLanguage: 'EN' as Contact['preferredLanguage'],
    notes: '',
  });

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(
    (org) => categoryFilter === 'all' || org.category === categoryFilter
  ).sort((a, b) => {
    // Если статусы показываются, сортируем: not-working наверх
    if (showWebsiteStatus) {
      if (a.websiteStatus === 'not-working' && b.websiteStatus !== 'not-working') {
        return -1;
      }
      if (a.websiteStatus !== 'not-working' && b.websiteStatus === 'not-working') {
        return 1;
      }
    }
    return 0;
  });

  const getOrgContacts = (orgId: string) => contacts.filter((c) => c.organizationId === orgId);

  const handleAddOrg = () => {
    if (editingOrg) {
      updateOrganization(editingOrg.id, orgForm);
      setEditingOrg(null);
    } else {
      addOrganization(orgForm);
    }
    setOrgForm({
      name: '',
      website: '',
      websiteStatus: 'working',
      linkedinUrl: '',
      countryRegion: '',
      email: '',
      category: 'additive-manufacturing',
      status: 'active',
      notes: '',
    });
    setIsOrgDialogOpen(false);
  };

  const handleEditOrg = (org: Organization) => {
    setEditingOrg(org);
    setOrgForm({
      name: org.name ?? '',
      website: org.website ?? '',
      websiteStatus: (org.websiteStatus ?? 'working') as 'working' | 'not-working',
      linkedinUrl: org.linkedinUrl ?? '',
      countryRegion: org.countryRegion ?? '',
      email: org.email ?? '',
      category: org.category,
      status: org.status,
      notes: org.notes ?? '',
});
    setIsOrgDialogOpen(true);
  };

  const handleAddContact = () => {
    if (editingContact) {
      updateContact(editingContact.id, contactForm);
      setEditingContact(null);
    } else {
      addContact(contactForm);
    }
    setContactForm({
      organizationId: '',
      name: '',
      rolePosition: '',
      email: '',
      preferredLanguage: 'EN',
      notes: '',
    });
    setIsContactDialogOpen(false);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setContactForm({
      organizationId: contact.organizationId,
      name: contact.name,
      rolePosition: contact.rolePosition,
      email: contact.email,
      preferredLanguage: contact.preferredLanguage,
      notes: contact.notes,
    });
    setIsContactDialogOpen(true);
  };

  const handleSendEmail = (orgId?: string) => {
    if (orgId) {
      const orgContacts = getOrgContacts(orgId);
      setSelectedEmails(orgContacts.map(c => c.email));
    } else {
      setSelectedEmails(contacts.map(c => c.email));
    }
    setEmailDialogOpen(true);
  };

  const handleSelectiveEmail = () => {
    if (!isSelectionMode) {
      // Первое нажатие - активировать режим выбора
      setIsSelectionMode(true);
      setSelectedOrgIds([]);
    } else {
      // Второе нажатие - отправить email
      const selectedOrgs = organizations.filter(org => selectedOrgIds.includes(org.id));
      const selectedContacts = selectedOrgs.flatMap(org => getOrgContacts(org.id));
      setSelectedEmails(selectedContacts.map(c => c.email));
      setEmailDialogOpen(true);
      setIsSelectionMode(false);
      setSelectedOrgIds([]);
    }
  };

  const toggleOrgSelection = (orgId: string) => {
    if (selectedOrgIds.includes(orgId)) {
      setSelectedOrgIds(selectedOrgIds.filter(id => id !== orgId));
    } else {
      setSelectedOrgIds([...selectedOrgIds, orgId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 max-w-md flex gap-2">
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowWebsiteStatus(!showWebsiteStatus)}
          >
            {showWebsiteStatus ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Status
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Status
              </>
            )}
          </Button>
          <Button onClick={() => handleSendEmail()}>
            <Mail className="w-4 h-4 mr-2" />
            Send Email to All
          </Button>
          <Button 
            variant={isSelectionMode ? "default" : "outline"} 
            onClick={handleSelectiveEmail}
            disabled={isSelectionMode && selectedOrgIds.length === 0}
          >
            <Filter className="w-4 h-4 mr-2" />
            {isSelectionMode ? `Send Email (${selectedOrgIds.length})` : 'Send to Selected'}
          </Button>
          <Dialog open={isOrgDialogOpen} onOpenChange={setIsOrgDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingOrg(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingOrg ? 'Edit Organization' : 'Add New Organization'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={orgForm.name}
                      onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={orgForm.website}
                      onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website Status</Label>
                    <Select
                      value={orgForm.websiteStatus}
                      onValueChange={(value: string) => setOrgForm({ ...orgForm, websiteStatus: value as 'working' | 'not-working' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="working">Working</SelectItem>
                        <SelectItem value="not-working">Not Working</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input
                      value={orgForm.linkedinUrl}
                      onChange={(e) => setOrgForm({ ...orgForm, linkedinUrl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country/Region</Label>
                    <Input
                      value={orgForm.countryRegion}
                      onChange={(e) => setOrgForm({ ...orgForm, countryRegion: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={orgForm.email}
                      onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={orgForm.category}
                      onValueChange={(value: string) => setOrgForm({ ...orgForm, category: value as Organization['category'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={orgForm.status}
                      onValueChange={(value: string) => setOrgForm({ ...orgForm, status: value as Organization['status'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={orgForm.notes}
                      onChange={(e) => setOrgForm({ ...orgForm, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <Button onClick={handleAddOrg} className="w-full">
                  {editingOrg ? 'Update Organization' : 'Add Organization'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrganizations.map((org) => {
          const orgContacts = getOrgContacts(org.id);
          const languages = [...new Set(orgContacts.map(c => c.preferredLanguage))];
          
          return (
            <Card key={org.id}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {isSelectionMode && (
                    <div className="pt-1">
                      <Checkbox
                        checked={selectedOrgIds.includes(org.id)}
                        onCheckedChange={() => toggleOrgSelection(org.id)}
                        className="h-6 w-6"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-start flex-1">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-3 flex-wrap">
                        {org.name}
                        <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                          {org.status}
                        </Badge>
                        <Badge variant="outline">{formatCategory(org.category)}</Badge>
                        {org.linkedinUrl && (
                          <a href={org.linkedinUrl} target="_blank" rel="noopener noreferrer">
                            <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
                              <Linkedin className="w-3 h-3" />
                            </Badge>
                          </a>
                        )}
                        {languages.map(lang => (
                          <Badge key={lang} variant="secondary" className="bg-blue-100 text-blue-800">
                            {lang}
                          </Badge>
                        ))}
                      </CardTitle>
                      <div className="mt-2 space-y-1 text-muted-foreground">
                        {org.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {org.website}
                            </a>
                            {showWebsiteStatus && org.websiteStatus && (
                              <span>
                                {org.websiteStatus === 'working' ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                        {org.email && <p>{org.email}</p>}
                        {org.countryRegion && <p>{org.countryRegion}</p>}
                        {org.notes && (
                          <div className="flex items-start gap-3">
                            <StickyNote className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground mb-1">Notes</p>
                              <p className="text-sm">{org.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleSendEmail(org.id)}>
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditOrg(org)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteOrganization(org.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Users className="w-4 h-4 mr-2" />
                            Contacts ({getOrgContacts(org.id).length})
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Contacts for {org.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  onClick={() => {
                                    setEditingContact(null);
                                    setContactForm({ ...contactForm, organizationId: org.id });
                                  }}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Contact
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{editingContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Name *</Label>
                                      <Input
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Role/Position</Label>
                                      <Input
                                        value={contactForm.rolePosition}
                                        onChange={(e) => setContactForm({ ...contactForm, rolePosition: e.target.value })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Email *</Label>
                                      <Input
                                        type="email"
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Preferred Language</Label>
                                      <Select
                                        value={contactForm.preferredLanguage}
                                        onValueChange={(value: string) => setContactForm({ ...contactForm, preferredLanguage: value as Contact['preferredLanguage'] })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="DE">German (DE)</SelectItem>
                                          <SelectItem value="EN">English (EN)</SelectItem>
                                          <SelectItem value="FR">French (FR)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                      <Label>Notes</Label>
                                      <Textarea
                                        value={contactForm.notes}
                                        onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                                        rows={3}
                                      />
                                    </div>
                                  </div>
                                  <Button onClick={handleAddContact} className="w-full">
                                    {editingContact ? 'Update Contact' : 'Add Contact'}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {getOrgContacts(org.id).length === 0 ? (
                              <div className="text-center py-12 text-muted-foreground">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No contacts yet</p>
                                <p className="text-sm mt-1">Click "Add Contact" to get started</p>
                              </div>
                            ) : (
                              <div className="grid gap-4">
                                {getOrgContacts(org.id).map((contact) => (
                                  <Card key={contact.id} className="overflow-hidden">
                                    <CardContent className="p-6">
                                      <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                          <h3 className="mb-1">{contact.name}</h3>
                                          <p className="text-muted-foreground">{contact.rolePosition}</p>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditContact(contact)}
                                          >
                                            <Pencil className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => deleteContact(contact.id)}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                          <Mail className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                                          <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                                              {contact.email}
                                            </a>
                                          </div>
                                        </div>
                                      
                                        <div className="flex items-start gap-3">
                                          <Globe className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                                          <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Preferred Language</p>
                                            <Badge variant="outline" className="mt-1">
                                              {contact.preferredLanguage === 'DE' && 'German (DE)'}
                                              {contact.preferredLanguage === 'EN' && 'English (EN)'}
                                              {contact.preferredLanguage === 'FR' && 'French (FR)'}
                                            </Badge>
                                          </div>
                                        </div>
                                      
                                        {contact.notes && (
                                          <div className="flex items-start gap-3">
                                            <FileText className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                                            <div className="flex-1">
                                              <p className="text-sm text-muted-foreground mb-1">Notes</p>
                                              <p className="text-sm">{contact.notes}</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {filteredOrganizations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No organizations found. Add your first organization to get started.
          </CardContent>
        </Card>
      )}

      <EmailDialog 
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        recipients={selectedEmails}
      />

      <Dialog open={isSelectiveEmailDialogOpen} onOpenChange={setIsSelectiveEmailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Email to Selected Organizations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Filter by Category</Label>
              <Select
                value={selectiveEmailCategory}
                onValueChange={(value: string) => {
                  setSelectiveEmailCategory(value);
                  setSelectedOrgIds([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Select Organizations</Label>
              <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto space-y-2">
                {organizations
                  .filter(org => selectiveEmailCategory === 'all' || org.category === selectiveEmailCategory)
                  .map(org => (
                    <div key={org.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`org-${org.id}`}
                        checked={selectedOrgIds.includes(org.id)}
                        onCheckedChange={(checked: boolean | 'indeterminate') => {
                          const isChecked = checked === true;

                          setSelectedOrgIds((prev) =>
                            isChecked ? (prev.includes(org.id) ? prev : [...prev, org.id]) : prev.filter((id) => id !== org.id)
                          );
                        }}
                      />
                      <label
                        htmlFor={`org-${org.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {org.name} ({getOrgContacts(org.id).length} contacts)
                      </label>
                    </div>
                  ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedOrgIds.length} organization(s) selected
              </p>
            </div>

            <Button 
              onClick={handleSelectiveEmail} 
              className="w-full"
              disabled={selectedOrgIds.length === 0}
            >
              Send Email to {selectedOrgIds.length} Organization(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
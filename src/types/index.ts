export interface Organization {
  id: string;
  name: string;
  website: string;
  websiteStatus?: 'working' | 'not-working';
  linkedinUrl?: string;
  countryRegion: string;
  email: string;
  category: 'additive-manufacturing' | 'mobility-fleet-management' | 'product-origin-authentication' | 'warehousing-intralogistics-robotics' | 'packaging-bins-containers';
  status: 'active' | 'inactive' | 'closed';
  notes?: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  etag?: string;
}

export interface Contact {
  id: string;
  organizationId: string;
  name: string;
  rolePosition: string;
  email: string;
  preferredLanguage: 'DE' | 'EN' | 'FR';
  notes: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  hasAccess: boolean;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  entityType: 'organization' | 'contact';
}
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Organization, Contact, CustomField } from '../types';
import * as orgApi from './organizations-api';
import * as contactApi from './contacts-api';

interface DataContextType {
  organizations: Organization[];
  contacts: Contact[];
  customFields: CustomField[];

  addOrganization: (org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'| 'etag'>) => Promise<void>;
  updateOrganization: (id: string, org: Partial<Organization>) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;

  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'| 'etag'>) => Promise<void>;
  updateContact: (id: string, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;

  addCustomField: (field: Omit<CustomField, 'id'>) => void;
  deleteCustomField: (id: string) => void;

  reloadData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

const reloadData = useCallback(async () => {
  try {
    const orgs = await orgApi.listOrganizations();
    setOrganizations(orgs);

    const contactLists = await Promise.all(
      orgs.map(async (org) => {
        try {
          return await contactApi.listContactsByOrganization(org.id);
        } catch {
          return [];
        }
      })
    );

    setContacts(contactLists.flat());
  } catch {
    setOrganizations([]);
    setContacts([]);
  }
}, []);

useEffect(() => {
  reloadData();
}, [reloadData]);



  const addOrganization: DataContextType['addOrganization'] = async (org) => {
    const created = await orgApi.createOrganization(org);
    setOrganizations((prev) => [...prev, created]);
  };

  const updateOrganization: DataContextType['updateOrganization'] = async (id, org) => {
    const current = organizations.find((o) => o.id === id);
    if (!current?.etag) throw new Error('Missing etag for organization');

    const updated = await orgApi.patchOrganization(id, org, current.etag);
    setOrganizations((prev) => prev.map((o) => (o.id === id ? updated : o)));
  };

  const deleteOrganization: DataContextType['deleteOrganization'] = async (id) => {
    const current = organizations.find((o) => o.id === id);
    if (!current?.etag) throw new Error('Missing etag for organization');

    await orgApi.deleteOrganization(id, current.etag);

    setOrganizations((prev) => prev.filter((o) => o.id !== id));
    setContacts((prev) => prev.filter((c) => c.organizationId !== id));
  };
  // contacts/customFields 
 const addContact: DataContextType['addContact'] = async (contact) => {
  const created = await contactApi.createContact(contact.organizationId, contact);
  setContacts((prev) => [...prev, created]);
};

const updateContact: DataContextType['updateContact'] = async (id, patch) => {
  const current = contacts.find((c) => c.id === id);
  if (!current) throw new Error('Contact not found');
  if (!current.organizationId) throw new Error('Missing organizationId for contact');

  let etag = current.etag;
  if (!etag) {
    const fresh = await contactApi.getContact(current.organizationId, current.id);
    etag = fresh.etag;
  }
  if (!etag) throw new Error('Missing etag for contact');

  const updated = await contactApi.patchContact(
    current.organizationId,
    id,
    patch,
    etag
  );

  setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
};

const deleteContact: DataContextType['deleteContact'] = async (id) => {
  const current = contacts.find((c) => c.id === id);
  if (!current) throw new Error('Contact not found');
  if (!current.organizationId) throw new Error('Missing organizationId for contact');

  let etag = current.etag;
  if (!etag) {
    const fresh = await contactApi.getContact(current.organizationId, current.id);
    etag = fresh.etag;
  }
  if (!etag) throw new Error('Missing etag for contact');

  await contactApi.deleteContact(current.organizationId, id, etag);
  setContacts((prev) => prev.filter((c) => c.id !== id));
};

  const addCustomField = (field: Omit<CustomField, 'id'>) => {
    const newField: CustomField = {
      ...field,
      id: Date.now().toString(),
    };
     setCustomFields((prev) => [...prev, newField]);
  };

  const deleteCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        organizations,
        contacts,
        customFields,
        addOrganization,
        updateOrganization,
        deleteOrganization,
        addContact,
        updateContact,
        deleteContact,
        addCustomField,
        deleteCustomField,
        reloadData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

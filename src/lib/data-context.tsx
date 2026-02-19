import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization, Contact, CustomField } from '../types';
import * as orgApi from './organizations-api';

interface DataContextType {
  organizations: Organization[];
  contacts: Contact[];
  customFields: CustomField[];

  addOrganization: (org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'| 'etag'>) => Promise<void>;
  updateOrganization: (id: string, org: Partial<Organization>) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;

  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  addCustomField: (field: Omit<CustomField, 'id'>) => void;
  deleteCustomField: (id: string) => void;

  importData: (orgs: Organization[], conts: Contact[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const orgs = await orgApi.listOrganizations();
        setOrganizations(orgs);
      } catch (e) {
        setOrganizations([]);
      }
    })();
  }, []);


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
  // contacts/customFields still local
  const addContact = (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...contacts, newContact];
    setContacts(updated);
    localStorage.setItem('contacts', JSON.stringify(updated));
  };

  const updateContact = (id: string, contact: Partial<Contact>) => {
    const updated = contacts.map((c) =>
      c.id === id ? { ...c, ...contact, updatedAt: new Date().toISOString() } : c
    );
    setContacts(updated);
    localStorage.setItem('contacts', JSON.stringify(updated));
  };

  const deleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    localStorage.setItem('contacts', JSON.stringify(updated));
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

  const importData = (orgs: Organization[], conts: Contact[]) => {
    setOrganizations(orgs);
    setContacts(conts);
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
        importData,
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

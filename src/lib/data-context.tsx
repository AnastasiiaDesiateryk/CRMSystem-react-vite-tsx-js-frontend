import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization, Contact, CustomField } from '../types';
import { mockOrganizations, mockContacts } from './mock-data';

interface DataContextType {
  organizations: Organization[];
  contacts: Contact[];
  customFields: CustomField[];
  addOrganization: (org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrganization: (id: string, org: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
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
    const savedOrgs = localStorage.getItem('organizations');
    const savedContacts = localStorage.getItem('contacts');
    const savedFields = localStorage.getItem('customFields');

    if (savedOrgs) {
      setOrganizations(JSON.parse(savedOrgs));
    } else {
      setOrganizations(mockOrganizations);
      localStorage.setItem('organizations', JSON.stringify(mockOrganizations));
    }

    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    } else {
      setContacts(mockContacts);
      localStorage.setItem('contacts', JSON.stringify(mockContacts));
    }

    if (savedFields) {
      setCustomFields(JSON.parse(savedFields));
    }
  }, []);

  const addOrganization = (org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrg: Organization = {
      ...org,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...organizations, newOrg];
    setOrganizations(updated);
    localStorage.setItem('organizations', JSON.stringify(updated));
  };

  const updateOrganization = (id: string, org: Partial<Organization>) => {
    const updated = organizations.map((o) =>
      o.id === id ? { ...o, ...org, updatedAt: new Date().toISOString() } : o
    );
    setOrganizations(updated);
    localStorage.setItem('organizations', JSON.stringify(updated));
  };

  const deleteOrganization = (id: string) => {
    const updated = organizations.filter((o) => o.id !== id);
    const updatedContacts = contacts.filter((c) => c.organizationId !== id);
    setOrganizations(updated);
    setContacts(updatedContacts);
    localStorage.setItem('organizations', JSON.stringify(updated));
    localStorage.setItem('contacts', JSON.stringify(updatedContacts));
  };

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
    const updated = [...customFields, newField];
    setCustomFields(updated);
    localStorage.setItem('customFields', JSON.stringify(updated));
  };

  const deleteCustomField = (id: string) => {
    const updated = customFields.filter((f) => f.id !== id);
    setCustomFields(updated);
    localStorage.setItem('customFields', JSON.stringify(updated));
  };

  const importData = (orgs: Organization[], conts: Contact[]) => {
    setOrganizations(orgs);
    setContacts(conts);
    localStorage.setItem('organizations', JSON.stringify(orgs));
    localStorage.setItem('contacts', JSON.stringify(conts));
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

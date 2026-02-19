import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { DataProvider } from './lib/data-context';
import { LoginPage } from './components/LoginPage';
import { AdminPanel } from './components/AdminPanel';
import { AboutPage } from './components/AboutPage';
import { OrganizationsPage } from './components/OrganizationsPage';
import { ImportExportPage } from './components/ImportExportPage';
import { Layout } from './components/Layout';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('organizations');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!user?.hasAccess && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4">Access Pending</h1>
          <p className="text-muted-foreground">
            Your account is pending approval. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'admin' && <AdminPanel />}
      {currentPage === 'organizations' && <OrganizationsPage />}
      {currentPage === 'import-export' && <ImportExportPage />}
      {currentPage === 'about' && <AboutPage />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
        <Toaster />
      </DataProvider>
    </AuthProvider>
  );
}

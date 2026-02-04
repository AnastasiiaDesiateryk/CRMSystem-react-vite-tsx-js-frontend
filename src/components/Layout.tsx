import { ReactNode, useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { Button } from './ui/button';
import { Building2, Users, FileUp, Info, LogOut, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'organizations', label: 'Organizations', icon: Building2 },
    { id: 'import-export', label: 'Import/Export', icon: FileUp },
    { id: 'about', label: 'About', icon: Info },
  ];

  if (user?.role === 'admin') {
    navigation.unshift({ id: 'admin', label: 'Admin Panel', icon: Users });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate('about')}>
                <img
                  src="/circle.png"
                  alt="Swiss SupplyChainTech"
                  className="w-10 h-10 object-contain"
                />
                <span className="ml-3 hidden sm:block">Swiss SupplyChainTech CRM</span>
              </div>
              <div className="hidden md:ml-8 md:flex md:space-x-8">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 border-b-2 transition-colors',
                      currentPage === item.id
                        ? 'border-blue-600 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" onClick={logout} className="hidden md:flex">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'flex items-center w-full px-4 py-2 border-l-4 transition-colors',
                    currentPage === item.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              ))}
              <div className="px-4 py-3 border-t border-gray-200">
                <p className="text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <Button variant="outline" onClick={logout} className="w-full mt-3">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
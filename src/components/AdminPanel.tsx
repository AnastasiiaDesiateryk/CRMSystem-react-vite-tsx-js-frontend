import { useState, useEffect } from 'react';
import { User } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        hasAccess: u.hasAccess,
        createdAt: u.createdAt,
      })));
    }
  }, []);

  const toggleAccess = (userId: string) => {
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = savedUsers.map((u: any) =>
      u.id === userId ? { ...u, hasAccess: !u.hasAccess } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setUsers(updatedUsers.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      hasAccess: u.hasAccess,
      createdAt: u.createdAt,
    })));
  };

  const toggleRole = (userId: string) => {
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = savedUsers.map((u: any) =>
      u.id === userId ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setUsers(updatedUsers.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      hasAccess: u.hasAccess,
      createdAt: u.createdAt,
    })));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Access Management</CardTitle>
          <CardDescription>
            Grant or revoke database access for registered users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Access Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No registered users yet
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.hasAccess ? 'default' : 'destructive'}>
                        {user.hasAccess ? 'Active' : 'Blocked'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.hasAccess}
                            onCheckedChange={() => toggleAccess(user.id)}
                          />
                          <span className="text-sm">Access</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleRole(user.id)}
                        >
                          {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

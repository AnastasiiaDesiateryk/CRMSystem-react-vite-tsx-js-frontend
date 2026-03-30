import { useState, useEffect } from 'react';
import { User } from '../types';
import { useAuth } from '../lib/auth-context';
import { listAdminUsers, updateUserAccess, updateUserRoles } from '../lib/admin-api';
import { toApiMessage } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';

function isUserAdmin(user: Pick<User, 'roles'> | null | undefined): boolean {
  return !!user?.roles?.includes('ROLE_ADMIN');
}

function nextRoles(user: User): string[] {
  return isUserAdmin(user) ? ['ROLE_USER'] : ['ROLE_USER', 'ROLE_ADMIN'];
}

export function AdminPanel() {
  const { user: currentUser, isAdmin } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [error, setError] = useState('');


  useEffect(() => {
    let cancelled = false;

    if (!isAdmin) {
      setUsers([]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await listAdminUsers();
        if (!cancelled) {
          setUsers(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(toApiMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const replaceUser = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const handleToggleAccess = async (target: User) => {
    if (!currentUser || currentUser.id === target.id) return;

    try {
      setBusyUserId(target.id);
      setError('');
      const updated = await updateUserAccess(target.id, !target.hasAccess);
      replaceUser(updated);
    } catch (err) {
      setError(toApiMessage(err));
    } finally {
      setBusyUserId(null);
    }
  };

  const handleToggleRole = async (target: User) => {
    if (!currentUser || currentUser.id === target.id) return;

    try {
      setBusyUserId(target.id);
      setError('');
      const updated = await updateUserRoles(target.id, nextRoles(target));
      replaceUser(updated);
    } catch (err) {
      setError(toApiMessage(err));
    } finally {
      setBusyUserId(null);
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access denied</CardTitle>
          <CardDescription>This page is available to admins only.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Access Management</CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

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
                users.map((target) => {
                  const self = currentUser?.id === target.id;
                  const busy = busyUserId === target.id;
                  const admin = isUserAdmin(target);

                  return (
                  <TableRow key={target.id}>
                    <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{target.name}</span>
                          {self && <Badge variant="outline">You</Badge>}
                        </div>
                      </TableCell>
                    <TableCell>{target.email}</TableCell>
                    <TableCell>
                      <Badge variant={admin ? 'default' : 'secondary'}>
                          {admin ? 'Admin' : 'User'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={target.hasAccess ? 'default' : 'destructive'}>
                          {target.hasAccess ? 'Active' : 'Blocked'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={target.hasAccess}
                              onCheckedChange={() => void handleToggleAccess(target)}
                              disabled={self || busy}
                          />
                          <span className="text-sm">Access</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleToggleRole(target)}
                            disabled={self || busy}
                        >
                          {admin ? 'Make User' : 'Make Admin'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                 );
               })
             )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

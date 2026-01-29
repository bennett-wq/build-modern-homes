// ============================================================================
// Admin User Management Page
// Manage admin and builder access
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth, type AppRole } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Loader2, 
  LogOut, 
  Users, 
  UserPlus,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Check,
  Shield,
  Hammer
} from 'lucide-react';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  email?: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user, isAdmin, hasAccess, isLoading: authLoading, signOut } = useAdminAuth();

  const [users, setUsers] = useState<UserRole[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Add user form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<AppRole>('builder');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Redirect if not authenticated or not admin (only admins can manage users)
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      if (hasAccess && !isAdmin) {
        // User is a builder, redirect to pricing (they can't manage users)
        navigate('/admin/pricing', { replace: true });
      } else {
        navigate('/admin/login', { replace: true });
      }
    }
  }, [user, isAdmin, hasAccess, authLoading, navigate]);

  // Load users
  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id, user_id, role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type the data properly
      const typedUsers: UserRole[] = (data || []).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        role: row.role as AppRole,
        created_at: row.created_at,
      }));

      setUsers(typedUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdmin) {
      loadUsers();
    }
  }, [user, isAdmin, loadUsers]);

  // Add a new user role
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    setIsAddingUser(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('add-team-member', {
        body: { email: newUserEmail.trim(), role: newUserRole }
      });

      if (fnError) {
        console.error('Function error:', fnError);
        setError(fnError.message || 'Failed to add team member');
        return;
      }

      if (data?.error) {
        if (data.code === 'USER_NOT_FOUND') {
          setError(
            `"${newUserEmail}" hasn't signed up yet.\n\n` +
            `Ask them to create an account at /admin/login first, then try again.`
          );
        } else {
          setError(data.error);
        }
        return;
      }

      const action = data?.updated ? 'Updated' : 'Added';
      setSuccessMessage(`${action} ${newUserEmail} as ${newUserRole}`);
      setNewUserEmail('');
      await loadUsers();

    } catch (err) {
      console.error('Failed to add user:', err);
      setError('Failed to add team member. Please try again.');
    } finally {
      setIsAddingUser(false);
    }
  };

  // Remove user role
  const handleRemoveUser = async (userId: string) => {
    // Prevent removing yourself
    if (userId === user?.id) {
      setError("You can't remove your own access");
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setSuccessMessage('User access removed');
      await loadUsers();
    } catch (err) {
      console.error('Failed to remove user:', err);
      setError('Failed to remove user');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin/pricing" className="p-2 rounded-lg hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Team Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage admin and builder access
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
            <Check className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Add User Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Team Member
            </CardTitle>
            <CardDescription>
              Add a new admin or builder to access the pricing console
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="builder@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div className="w-40">
                <Label htmlFor="role">Role</Label>
                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="builder">
                      <span className="flex items-center gap-2">
                        <Hammer className="h-4 w-4" />
                        Builder
                      </span>
                    </SelectItem>
                    <SelectItem value="admin">
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={isAddingUser}>
                  {isAddingUser ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-1" />
                  )}
                  Add Member
                </Button>
              </div>
            </form>
            <p className="text-sm text-muted-foreground mt-4">
              <strong>How to add partners:</strong>
              <br />
              1. Have your partner sign up at <code className="bg-muted px-1 rounded">/admin/login</code>
              <br />
              2. Enter their email above and select their role
              <br />
              3. They can then sign in and access the admin console
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              <strong>Role Permissions:</strong>
              <br />
              • <strong>Builder</strong>: Can view and edit pricing drafts
              <br />
              • <strong>Admin</strong>: Can publish pricing and manage team members
            </p>
          </CardContent>
        </Card>

        {/* Current Team */}
        <Card>
          <CardHeader>
            <CardTitle>Current Team</CardTitle>
            <CardDescription>
              Users with access to the pricing admin console
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No team members yet. Add your first team member above.
              </p>
            ) : (
              <div className="space-y-2">
                {users.map((teamUser) => (
                  <div 
                    key={teamUser.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        {teamUser.role === 'admin' ? (
                          <Shield className="h-4 w-4 text-primary" />
                        ) : (
                          <Hammer className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium font-mono text-sm">
                          {teamUser.user_id.slice(0, 8)}...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Added {new Date(teamUser.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={teamUser.role === 'admin' ? 'default' : 'secondary'}
                      >
                        {teamUser.role === 'admin' ? 'Admin' : 'Builder'}
                      </Badge>
                      
                      {teamUser.user_id !== user?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove their access to the pricing admin console.
                                They can be re-added later if needed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveUser(teamUser.user_id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove Access
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      
                      {teamUser.user_id === user?.id && (
                        <span className="text-xs text-muted-foreground">(you)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// ============================================================================
// Admin Shell Layout
// Shared layout wrapper with sidebar navigation for all admin pages
// ============================================================================

import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminNav } from './AdminNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LogOut, 
  Shield, 
  Hammer,
  Home,
  ChevronLeft
} from 'lucide-react';

interface AdminShellProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon?: ReactNode;
  user: {
    email?: string;
    id: string;
  };
  isAdmin: boolean;
  onSignOut: () => void;
  headerActions?: ReactNode;
}

export function AdminShell({
  children,
  title,
  description,
  icon,
  user,
  isAdmin,
  onSignOut,
  headerActions,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-background">
        {/* Logo / Brand */}
        <div className="p-4 border-b">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Home className="h-4 w-4" />
            <span>Back to Site</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Admin Console
          </p>
          <AdminNav isAdmin={isAdmin} />
        </div>

        {/* User Info */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              {isAdmin ? (
                <Shield className="h-4 w-4 text-primary" />
              ) : (
                <Hammer className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-xs">
                {isAdmin ? 'Admin' : 'Builder'}
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={onSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-background border-b sticky top-0 z-10">
          <div className="px-4 lg:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile back button */}
              <Link to="/" className="lg:hidden p-2 rounded-lg hover:bg-muted">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              
              {icon && (
                <div className="p-2 rounded-lg bg-primary/10">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-xl font-semibold">{title}</h1>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile nav links */}
              <div className="lg:hidden flex items-center gap-1">
                <AdminNav isAdmin={isAdmin} />
              </div>
              
              {headerActions}
              
              {/* Mobile sign out */}
              <Button variant="outline" size="sm" onClick={onSignOut} className="lg:hidden">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

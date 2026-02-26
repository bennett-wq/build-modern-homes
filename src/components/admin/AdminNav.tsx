// ============================================================================
// Admin Navigation Component
// Consistent sidebar navigation for admin pages
// ============================================================================

import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  Users,
  LayoutDashboard,
  Target
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Pricing',
    href: '/admin/pricing',
    icon: DollarSign,
  },
  {
    label: 'Leads',
    href: '/admin/leads',
    icon: TrendingUp,
  },
  {
    label: 'Acquisition',
    href: '/admin/acquisition',
    icon: Target,
    adminOnly: true,
  },
  {
    label: 'Team',
    href: '/admin/users',
    icon: Users,
    adminOnly: true,
  },
];

interface AdminNavProps {
  isAdmin: boolean;
}

export function AdminNav({ isAdmin }: AdminNavProps) {
  const location = useLocation();
  
  const filteredItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="flex flex-col gap-1">
      {filteredItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

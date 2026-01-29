// ============================================================================
// Admin Leads Dashboard
// View and manage pre-qualification / financing applications
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Loader2, 
  LogOut, 
  DollarSign,
  Users,
  Shield,
  Hammer,
  RefreshCw,
  Search,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

interface FinancingApplication {
  id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  purchase_price: number;
  down_payment_percent: number;
  down_payment_amount: number;
  loan_amount_requested: number;
  monthly_payment_estimate: number | null;
  credit_score_range: string;
  annual_income_range: string;
  employment_status: string;
  intended_use: string;
  purchase_timeframe: string;
  pre_qualification_status: 'pending' | 'pre_qualified' | 'needs_review' | 'declined';
  pre_qualified_amount: number | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
  pre_qualified: { label: 'Pre-Qualified', variant: 'default' as const, icon: CheckCircle2 },
  needs_review: { label: 'Needs Review', variant: 'outline' as const, icon: AlertCircle },
  declined: { label: 'Declined', variant: 'destructive' as const, icon: AlertCircle },
};

const CREDIT_LABELS: Record<string, string> = {
  excellent_750: '750+',
  good_700: '700-749',
  fair_650: '650-699',
  below_650: '<650',
  unsure: 'Unknown',
};

const INCOME_LABELS: Record<string, string> = {
  under_50k: '<$50k',
  '50k_75k': '$50-75k',
  '75k_100k': '$75-100k',
  '100k_150k': '$100-150k',
  '150k_plus': '$150k+',
};

const TIMEFRAME_LABELS: Record<string, string> = {
  '0_3_months': '0-3 mo',
  '3_6_months': '3-6 mo',
  '6_12_months': '6-12 mo',
  '12_plus': '12+ mo',
};

export default function AdminLeads() {
  const navigate = useNavigate();
  const { user, isAdmin, isBuilder, hasAccess, isLoading: authLoading, signOut } = useAdminAuth();

  const [applications, setApplications] = useState<FinancingApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!authLoading && (!user || !hasAccess)) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, hasAccess, authLoading, navigate]);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('financing_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && hasAccess) {
      loadApplications();
    }
  }, [user, hasAccess, loadApplications]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery === '' || 
      app.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.contact_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.contact_phone && app.contact_phone.includes(searchQuery));
    
    const matchesStatus = statusFilter === 'all' || app.pre_qualification_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalLeads = applications.length;
  const preQualifiedCount = applications.filter(a => a.pre_qualification_status === 'pre_qualified').length;
  const needsReviewCount = applications.filter(a => a.pre_qualification_status === 'needs_review').length;
  const totalPipelineValue = applications.reduce((sum, a) => sum + a.purchase_price, 0);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Financing Leads</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{user.email}</span>
                <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-xs">
                  {isAdmin ? (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </>
                  ) : (
                    <>
                      <Hammer className="h-3 w-3 mr-1" />
                      Builder
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/pricing">
                <DollarSign className="h-4 w-4 mr-1" />
                Pricing
              </Link>
            </Button>
            {isAdmin && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/users">
                  <Users className="h-4 w-4 mr-1" />
                  Team
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={loadApplications}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold">{totalLeads}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pre-Qualified</p>
                  <p className="text-2xl font-bold text-emerald-600">{preQualifiedCount}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Needs Review</p>
                  <p className="text-2xl font-bold text-amber-600">{needsReviewCount}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pipeline Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filter Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="pre_qualified">Pre-Qualified</SelectItem>
                  <SelectItem value="needs_review">Needs Review</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>
              {filteredApplications.length} of {totalLeads} applications
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No applications found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Purchase Price</TableHead>
                      <TableHead className="text-right">Down %</TableHead>
                      <TableHead className="text-right">Monthly Est.</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead>Income</TableHead>
                      <TableHead>Timeframe</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => {
                      const statusConfig = STATUS_CONFIG[app.pre_qualification_status];
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{app.contact_name}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <a href={`mailto:${app.contact_email}`} className="hover:underline">
                                  {app.contact_email}
                                </a>
                              </div>
                              {app.contact_phone && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <a href={`tel:${app.contact_phone}`} className="hover:underline">
                                    {app.contact_phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig.variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(app.purchase_price)}
                          </TableCell>
                          <TableCell className="text-right">
                            {app.down_payment_percent}%
                          </TableCell>
                          <TableCell className="text-right">
                            {app.monthly_payment_estimate 
                              ? formatCurrency(app.monthly_payment_estimate)
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {CREDIT_LABELS[app.credit_score_range] || app.credit_score_range}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {INCOME_LABELS[app.annual_income_range] || app.annual_income_range}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {TIMEFRAME_LABELS[app.purchase_timeframe] || app.purchase_timeframe}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(app.created_at)}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

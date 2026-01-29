// ============================================================================
// Admin Leads Dashboard
// View and manage pre-qualification / financing applications
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminShell } from '@/components/admin/AdminShell';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { 
  Loader2, 
  TrendingUp,
  RefreshCw,
  Search,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  Save
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  notes: string | null;
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

const EMPLOYMENT_LABELS: Record<string, string> = {
  employed: 'Employed',
  self_employed: 'Self-Employed',
  retired: 'Retired',
  other: 'Other',
};

const USE_LABELS: Record<string, string> = {
  primary: 'Primary Residence',
  second_home: 'Second Home',
  investment: 'Investment Property',
};

export default function AdminLeads() {
  const navigate = useNavigate();
  const { user, isAdmin, hasAccess, isLoading: authLoading, signOut } = useAdminAuth();

  const [applications, setApplications] = useState<FinancingApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Detail drawer state
  const [selectedApp, setSelectedApp] = useState<FinancingApplication | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

  // Update application status
  const handleStatusChange = async (appId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('financing_applications')
        .update({ pre_qualification_status: newStatus as 'pending' | 'pre_qualified' | 'needs_review' | 'declined' })
        .eq('id', appId);

      if (error) throw error;

      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === appId 
          ? { ...app, pre_qualification_status: newStatus as FinancingApplication['pre_qualification_status'] }
          : app
      ));

      if (selectedApp?.id === appId) {
        setSelectedApp(prev => prev ? { ...prev, pre_qualification_status: newStatus as FinancingApplication['pre_qualification_status'] } : null);
      }

      toast({ title: 'Status updated', description: `Changed to ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.label}` });
    } catch (err) {
      console.error('Failed to update status:', err);
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save notes
  const handleSaveNotes = async () => {
    if (!selectedApp) return;

    setIsSavingNotes(true);
    try {
      const { error } = await supabase
        .from('financing_applications')
        .update({ notes: editNotes })
        .eq('id', selectedApp.id);

      if (error) throw error;

      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === selectedApp.id ? { ...app, notes: editNotes } : app
      ));
      setSelectedApp(prev => prev ? { ...prev, notes: editNotes } : null);

      toast({ title: 'Notes saved' });
    } catch (err) {
      console.error('Failed to save notes:', err);
      toast({ title: 'Error', description: 'Failed to save notes', variant: 'destructive' });
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Open detail drawer
  const openDetail = (app: FinancingApplication) => {
    setSelectedApp(app);
    setEditNotes(app.notes || '');
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
  const pendingCount = applications.filter(a => a.pre_qualification_status === 'pending').length;
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
    <AdminShell
      title="Financing Leads"
      description="Pre-qualification applications"
      icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
      user={user}
      isAdmin={isAdmin}
      onSignOut={handleSignOut}
      headerActions={
        <Button variant="ghost" size="sm" onClick={loadApplications}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500/50" />
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
                  <p className="text-2xl font-bold text-orange-600">{needsReviewCount}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500/50" />
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
                      <TableHead>Credit</TableHead>
                      <TableHead>Timeframe</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => {
                      const statusConfig = STATUS_CONFIG[app.pre_qualification_status];
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <TableRow key={app.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(app)}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{app.contact_name}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[150px]">{app.contact_email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Select 
                              value={app.pre_qualification_status} 
                              onValueChange={(v) => handleStatusChange(app.id, v)}
                              disabled={isUpdatingStatus}
                            >
                              <SelectTrigger className="w-[140px] h-8">
                                <Badge variant={statusConfig.variant} className="gap-1">
                                  <StatusIcon className="h-3 w-3" />
                                  {statusConfig.label}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                                  const Icon = config.icon;
                                  return (
                                    <SelectItem key={key} value={key}>
                                      <span className="flex items-center gap-2">
                                        <Icon className="h-3 w-3" />
                                        {config.label}
                                      </span>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(app.purchase_price)}
                          </TableCell>
                          <TableCell className="text-right">
                            {app.down_payment_percent}%
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {CREDIT_LABELS[app.credit_score_range] || app.credit_score_range}
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
                              {new Date(app.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openDetail(app); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
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
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedApp && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedApp.contact_name}</SheetTitle>
                <SheetDescription>
                  Submitted {formatDate(selectedApp.created_at)}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Contact Info */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedApp.contact_email}`} className="text-primary hover:underline">
                        {selectedApp.contact_email}
                      </a>
                    </div>
                    {selectedApp.contact_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${selectedApp.contact_phone}`} className="text-primary hover:underline">
                          {selectedApp.contact_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Status</h4>
                  <Select 
                    value={selectedApp.pre_qualification_status} 
                    onValueChange={(v) => handleStatusChange(selectedApp.id, v)}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <SelectItem key={key} value={key}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {config.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Financial Details */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Financial Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-muted-foreground">Purchase Price</p>
                      <p className="font-semibold">{formatCurrency(selectedApp.purchase_price)}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-muted-foreground">Down Payment</p>
                      <p className="font-semibold">{selectedApp.down_payment_percent}% ({formatCurrency(selectedApp.down_payment_amount)})</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-muted-foreground">Loan Amount</p>
                      <p className="font-semibold">{formatCurrency(selectedApp.loan_amount_requested)}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-muted-foreground">Est. Monthly</p>
                      <p className="font-semibold">
                        {selectedApp.monthly_payment_estimate ? formatCurrency(selectedApp.monthly_payment_estimate) : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Buyer Profile</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-muted-foreground">Credit Score</p>
                      <p className="font-semibold">{CREDIT_LABELS[selectedApp.credit_score_range] || selectedApp.credit_score_range}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-muted-foreground">Annual Income</p>
                      <p className="font-semibold">{INCOME_LABELS[selectedApp.annual_income_range] || selectedApp.annual_income_range}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-muted-foreground">Employment</p>
                      <p className="font-semibold">{EMPLOYMENT_LABELS[selectedApp.employment_status] || selectedApp.employment_status}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-muted-foreground">Intended Use</p>
                      <p className="font-semibold">{USE_LABELS[selectedApp.intended_use] || selectedApp.intended_use}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg col-span-2">
                      <p className="text-muted-foreground">Purchase Timeframe</p>
                      <p className="font-semibold">{TIMEFRAME_LABELS[selectedApp.purchase_timeframe] || selectedApp.purchase_timeframe}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Notes</h4>
                  <Textarea
                    placeholder="Add internal notes about this lead..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    onClick={handleSaveNotes} 
                    disabled={isSavingNotes || editNotes === (selectedApp.notes || '')}
                    className="mt-2"
                    size="sm"
                  >
                    {isSavingNotes ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save Notes
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminShell>
  );
}

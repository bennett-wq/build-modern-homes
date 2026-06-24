// ============================================================================
// Admin Buyer Quote Requests
// Staff view for public.quotes — the system of record for build/land/community
// quotes plus contact and consultation leads submitted via the public site.
// Reads with the authenticated browser client under the existing
// team_read_all_quotes RLS (is_admin_or_builder). No service-role key here.
//
// Bridge note: contact and consultation leads currently share public.quotes
// with priced quotes (no separate table in this hotfix). They are clearly
// distinguished by source label and never presented as priced home quotes.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminShell } from '@/components/admin/AdminShell';
import type { QuoteRow } from '@/types/database';

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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Loader2,
  Inbox,
  RefreshCw,
  Search,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Source labels (parsed from the notes envelope written by submit-lead).
const SOURCE_LABELS: Record<string, string> = {
  build_quote: 'Build quote',
  land_quote: 'Land quote',
  community_quote: 'Community quote',
  contact: 'Contact message',
  consultation: 'Consultation request',
};
// Sources that are NOT priced home quotes.
const NON_QUOTE_SOURCES = new Set(['contact', 'consultation']);

// Status presentation (existing quote_status enum values).
const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'New',
  contacted: 'Contacted',
  converted: 'Converted',
};
const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  submitted: 'default',
  contacted: 'secondary',
  converted: 'outline',
  draft: 'outline',
};
const STATUS_OPTIONS = ['submitted', 'contacted', 'converted'] as const;

function parseSource(notes: string | null): { key: string; label: string } {
  const m = notes?.match(/^\[source:([a-z_]+)\]/);
  const key = m?.[1] ?? 'quote';
  return { key, label: SOURCE_LABELS[key] ?? 'Quote request' };
}

export default function AdminQuoteLeads() {
  const navigate = useNavigate();
  const { user, isAdmin, hasAccess, isLoading: authLoading, signOut } = useAdminAuth();

  const [leads, setLeads] = useState<QuoteRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selected, setSelected] = useState<QuoteRow | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !hasAccess)) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, hasAccess, authLoading, navigate]);

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Failed to load buyer quote requests:', err);
      setLoadError('Could not load buyer quote requests. Please refresh to try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && hasAccess) loadLeads();
  }, [user, hasAccess, loadLeads]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);

  const handleStatusChange = async (id: string, status: string) => {
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: status as QuoteRow['status'] })
        .eq('id', id);
      if (error) throw error;
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: status as QuoteRow['status'] } : l)));
      setSelected((prev) => (prev && prev.id === id ? { ...prev, status: status as QuoteRow['status'] } : prev));
      toast({ title: 'Status updated', description: `Marked as ${STATUS_LABELS[status] ?? status}` });
    } catch (err) {
      console.error('Failed to update status:', err);
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filtered = leads.filter((l) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === '' ||
      (l.contact_name || '').toLowerCase().includes(q) ||
      (l.contact_email || '').toLowerCase().includes(q) ||
      (l.contact_phone || '').includes(searchQuery);
    const matchesSource = sourceFilter === 'all' || parseSource(l.notes).key === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const newCount = leads.filter((l) => l.status === 'submitted').length;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user || !hasAccess) return null;

  return (
    <AdminShell
      title="Buyer Quote Requests"
      description="Build, land, community, contact and consultation leads"
      icon={<Inbox className="h-5 w-5 text-primary" />}
      user={user}
      isAdmin={isAdmin}
      onSignOut={handleSignOut}
      headerActions={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/leads">
              <TrendingUp className="h-4 w-4 mr-1" />
              Financing
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={loadLeads}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold">{leads.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">New</p>
              <p className="text-2xl font-bold text-primary">{newCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
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
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Lead type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All lead types</SelectItem>
                  {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requests</CardTitle>
            <CardDescription>
              {filtered.length} of {leads.length} requests
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : loadError ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>{loadError}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={loadLeads}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Inbox className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No buyer quote requests yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Est.</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((l) => {
                      const src = parseSource(l.notes);
                      const isQuote = !NON_QUOTE_SOURCES.has(src.key);
                      return (
                        <TableRow
                          key={l.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelected(l)}
                        >
                          <TableCell>
                            <p className="font-medium">{l.contact_name || '—'}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[180px]">{l.contact_email || '—'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{src.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={STATUS_VARIANT[l.status] ?? 'outline'}>
                              {STATUS_LABELS[l.status] ?? l.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {isQuote && l.total_estimate != null
                              ? formatCurrency(Number(l.total_estimate))
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(l.created_at).toLocaleDateString()}
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
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.contact_name || 'Buyer request'}</SheetTitle>
                <SheetDescription>
                  {parseSource(selected.notes).label} · {formatDate(selected.created_at)}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Contact</h4>
                  <div className="space-y-2 text-sm">
                    {selected.contact_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${selected.contact_email}`} className="text-primary hover:underline">
                          {selected.contact_email}
                        </a>
                      </div>
                    )}
                    {selected.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${selected.contact_phone}`} className="text-primary hover:underline">
                          {selected.contact_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Status</h4>
                  <Select
                    value={selected.status}
                    onValueChange={(v) => handleStatusChange(selected.id, v)}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(selected.zip_code || selected.address || selected.total_estimate != null) && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {selected.total_estimate != null &&
                        !NON_QUOTE_SOURCES.has(parseSource(selected.notes).key) && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-muted-foreground">Budgetary estimate</p>
                            <p className="font-semibold">{formatCurrency(Number(selected.total_estimate))}</p>
                          </div>
                        )}
                      {selected.address && (
                        <div className="p-3 bg-muted rounded-lg col-span-2">
                          <p className="text-muted-foreground">Address</p>
                          <p className="font-semibold">{selected.address}</p>
                        </div>
                      )}
                      {selected.zip_code && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-muted-foreground">ZIP</p>
                          <p className="font-semibold">{selected.zip_code}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold mb-3">Submission</h4>
                  {/* Plain text — React escapes by default, so notes render safely. */}
                  <pre className="whitespace-pre-wrap break-words text-sm bg-muted rounded-lg p-3 font-sans">
                    {selected.notes || '—'}
                  </pre>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminShell>
  );
}

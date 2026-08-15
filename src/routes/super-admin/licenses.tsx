import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getPlatformStats, getEklasProviderStatus, getRecentLicenses, retryLicenseFulfillment } from '@/lib/license-admin.functions';
import { exportLicensesCsv } from '@/lib/export.functions';
import { DataExportDialog } from '@/components/admin/DataExportDialog';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Server,
  ExternalLink,
  ShieldCheck,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const Route = createFileRoute('/super-admin/licenses')({
  component: LicenseCenterPage,
});

function LicenseCenterPage() {
  const fetchStats = useServerFn(getPlatformStats);
  const fetchProvider = useServerFn(getEklasProviderStatus);
  const fetchLicenses = useServerFn(getRecentLicenses);
  const retryFulfillment = useServerFn(retryLicenseFulfillment);
  const exportLicenses = useServerFn(exportLicensesCsv);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-license-stats'],
    queryFn: () => fetchStats(),
  });

  const { data: provider, isLoading: providerLoading } = useQuery({
    queryKey: ['admin-provider-status'],
    queryFn: () => fetchProvider(),
  });

  const { data: licenses, isLoading: licensesLoading, refetch: refetchLicenses } = useQuery({
    queryKey: ['admin-recent-licenses'],
    queryFn: () => fetchLicenses({ data: { limit: 20 } }),
  });

  const retryMutation = useMutation({
    mutationFn: (fulfillmentId: string) => retryFulfillment({ data: { fulfillmentId } }),
    onSuccess: () => {
      toast.success("Retry initiated successfully");
      refetchLicenses();
    },
    onError: (err: any) => toast.error(`Retry failed: ${err.message}`)
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              License Automation Center
            </h1>
            <p className="text-muted-foreground">Monitor and manage Eklas production fulfillment</p>
          </div>
          <div className="flex gap-2">
            <DataExportDialog 
              title="Export Licenses"
              description="Filter and export extension license records to CSV."
              exportFn={exportLicenses}
              statusOptions={[
                { label: 'Active', value: 'active' },
                { label: 'Expired', value: 'expired' },
                { label: 'Revoked', value: 'revoked' },
                { label: 'Suspended', value: 'suspended' },
              ]}
            />
            <Button variant="outline" className="glass-effect" onClick={() => refetchLicenses()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Licenses" 
            value={stats?.licenses || 0} 
            icon={<Key className="h-5 w-5" />} 
            loading={statsLoading}
          />
          <StatCard 
            title="Provider Status" 
            value={provider?.configured ? "Active" : "Offline"} 
            subtitle={provider?.provider}
            icon={<Server className="h-5 w-5" />} 
            status={provider?.configured ? 'success' : 'error'}
            loading={providerLoading}
          />
          <StatCard 
            title="Active Entitlements" 
            value={stats?.licenses || 0} 
            icon={<Activity className="h-5 w-5" />} 
            loading={statsLoading}
          />
          <StatCard 
            title="Revenue Protection" 
            value={`৳${stats?.revenue.toLocaleString()}`} 
            icon={<CheckCircle2 className="h-5 w-5" />} 
            loading={statsLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Provider Config */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-effect border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">License Provider</CardTitle>
                <CardDescription>Primary fulfillment configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-surface-2 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Provider</span>
                    <span className="text-sm font-bold">Eklas (io.eklas.dev)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Auth Method</span>
                    <Badge variant="outline" className="text-[10px]">Bearer Token</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</span>
                    {provider?.configured ? (
                      <div className="flex items-center gap-1.5 text-green-500">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold">Configured</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-destructive">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold">Key Missing</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] text-muted-foreground leading-relaxed">
                     Licensed products are automatically fulfilled via Eklas API upon payment confirmation. 
                     Check server environment variables for <code>EKLAS_LICENSE_API_KEY</code>.
                   </p>
                </div>

                <Button variant="outline" className="w-full text-xs h-8" asChild>
                  <a href="https://io.eklas.dev" target="_blank" rel="noopener noreferrer">
                    Provider Dashboard <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-effect border-none shadow-xl bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <History className="h-4 w-4" />
                  FULFILLMENT LOGS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  System logs for license generation events, including idempotency checks and API response codes.
                </p>
                <Button variant="link" className="px-0 h-auto text-xs mt-2" asChild>
                   <Link to="/super-admin">View System Logs</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Licenses */}
          <div className="lg:col-span-2">
            <Card className="glass-effect border-none shadow-xl overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent License Issuance</CardTitle>
                    <CardDescription>Live feed of automated delivery</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-2 text-left">
                        <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Product</th>
                        <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Customer</th>
                        <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Key (Partial)</th>
                        <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Date</th>
                        <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                      {licensesLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={5} className="px-6 py-4 h-12 bg-surface-1/50"></td>
                          </tr>
                        ))
                      ) : licenses?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                            No licenses generated yet.
                          </td>
                        </tr>
                      ) : (
                        licenses?.map((license: any) => (
                          <tr key={license.id} className="hover:bg-surface-1 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold">{license.products?.name}</div>
                              <div className="text-[10px] text-muted-foreground">{license.plan} Plan</div>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs">
                              {license.profiles?.email}
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="secondary" className="font-mono text-[10px]">
                                ****{license.license_key_last4}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-xs text-muted-foreground">
                              {format(new Date(license.created_at), 'MMM d, HH:mm')}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  // In a real app, this would get the fulfillment ID associated with the license
                                  toast.info("Fulfillment lookup not implemented for this view");
                                }}
                              >
                                <RefreshCcw className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ title, value, icon, subtitle, status, loading }: any) {
  return (
    <Card className="glass-effect border-none shadow-lg overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50" />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest">{title}</CardDescription>
          <div className="p-1.5 rounded-lg bg-surface-2 text-primary">
            {icon}
          </div>
        </div>
        <CardTitle className={`text-2xl font-black ${status === 'error' ? 'text-destructive' : ''}`}>
          {loading ? "..." : value}
        </CardTitle>
      </CardHeader>
      {subtitle && (
        <CardContent className="pt-0">
          <p className="text-[10px] text-muted-foreground font-medium">{subtitle}</p>
        </CardContent>
      )}
    </Card>
  );
}

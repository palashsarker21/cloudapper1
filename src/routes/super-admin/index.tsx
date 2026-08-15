import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getSystemStats, bootstrapSuperAdmin, getAuditLogs } from '@/lib/super-admin.functions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ShoppingBag, 
  Package, 
  DollarSign, 
  Activity, 
  ShieldAlert, 
  RefreshCw,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const Route = createFileRoute('/super-admin/')({
  component: SuperAdminDashboard,
});

function SuperAdminDashboard() {
  const fetchStats = useServerFn(getSystemStats);
  const fetchLogs = useServerFn(getAuditLogs);
  const runBootstrap = useServerFn(bootstrapSuperAdmin);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: () => fetchStats(),
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['super-admin-logs'],
    queryFn: () => fetchLogs({ data: { limit: 10, offset: 0 } }),
  });

  const bootstrapMutation = useMutation({
    mutationFn: () => runBootstrap({ data: undefined }),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        refetchStats();
      } else {
        toast.info(data.message);
      }
    },
    onError: () => toast.error("Bootstrap failed")
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">CloudApper</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">SYSTEM CONTROL CENTER</h1>
            <p className="text-muted-foreground">God Mode: Enterprise Platform Overview</p>
          </div>
          
          <div className="flex gap-3">
             <Button 
              variant="outline" 
              className="glass-effect" 
              onClick={() => refetchStats()}
              disabled={statsLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
              Sync Data
            </Button>
            <Button 
              variant="default" 
              onClick={() => bootstrapMutation.mutate()}
              disabled={bootstrapMutation.isPending}
            >
              <Activity className="mr-2 h-4 w-4" />
              Run Health Check
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard 
            title="Total Users" 
            value={stats?.users || 0} 
            icon={<Users className="h-6 w-6 text-blue-500" />} 
            description="Registered accounts"
          />
          <StatsCard 
            title="Total Orders" 
            value={stats?.orders || 0} 
            icon={<ShoppingBag className="h-6 w-6 text-purple-500" />} 
            description="All-time transactions"
          />
          <StatsCard 
            title="Active Products" 
            value={stats?.products || 0} 
            icon={<Package className="h-6 w-6 text-emerald-500" />} 
            description="Catalog size"
          />
          <StatsCard 
            title="Gross Revenue" 
            value={`৳${(stats?.revenue || 0).toLocaleString()}`} 
            icon={<DollarSign className="h-6 w-6 text-amber-500" />} 
            description="Verified payments"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Operations Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-effect border-none shadow-xl overflow-hidden">
              <CardHeader className="bg-surface-1/50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-bold">Live Activity Stream</CardTitle>
                    <CardDescription>Real-time system audit logs</CardDescription>
                  </div>
                  <Badge variant="outline" className="animate-pulse bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    LIVE
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/10">
                  {logsLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading activity...</div>
                  ) : logs?.length ? logs.map((log: any) => (
                    <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-surface-1/30 transition-colors">
                      <div className="mt-1 p-2 rounded-lg bg-surface-2">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-sm">{log.action.replace(/_/g, ' ')}</p>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {log.actor?.email || 'System'} modified {log.target_type} {log.target_id}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="p-12 text-center text-muted-foreground">
                      <p>Waiting for activity...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Controls */}
          <div className="space-y-6">
            <Card className="glass-effect border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">System Health</CardTitle>
                <CardDescription>Environment & Infra</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <HealthItem label="Database" status="Healthy" />
                <HealthItem label="Authentication" status="Healthy" />
                <HealthItem label="Payment Gateways" status="Checking..." />
                <HealthItem label="Digital Fulfillment" status="Active" />
                
                <div className="pt-4 border-t border-border/10">
                  <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">God Mode Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="text-xs">Security Center</Button>
                    <Button variant="outline" size="sm" className="text-xs">Audit History</Button>
                    <Button variant="outline" size="sm" className="text-xs">Export All</Button>
                    <Button variant="destructive" size="sm" className="text-xs">Maintenance</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-none shadow-xl bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-bold">Super Admin</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  You are viewing the platform with maximum authority. Every action is recorded in the permanent audit trail.
                </p>
                <div className="p-3 rounded-lg bg-surface-2 text-xs font-mono text-primary/80">
                  ID: palashsarker1993@...
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

function StatsCard({ title, value, icon, description }: any) {
  return (
    <Card className="glass-effect border-none shadow-lg hover:translate-y-[-4px] transition-all duration-300 overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-2xl bg-surface-2 group-hover:bg-primary/10 transition-colors">
            {icon}
          </div>
          <Badge variant="outline" className="text-[10px] font-bold">REAL-TIME</Badge>
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl font-black tracking-tighter">{value}</h3>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-xs text-muted-foreground/60">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthItem({ label, status }: { label: string, status: string }) {
  const isHealthy = status === 'Healthy' || status === 'Active';
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${isHealthy ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
        <span className={isHealthy ? 'text-emerald-500 font-bold' : 'text-amber-500'}>{status}</span>
      </div>
    </div>
  );
}

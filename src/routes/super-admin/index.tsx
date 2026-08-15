import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getSystemStats, bootstrapSuperAdmin } from '@/lib/super-admin.functions';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  ShoppingBag, 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight,
  Database,
  Lock,
  Zap,
  History,
  Terminal,
  Server
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/super-admin/')({
  component: SuperAdminDashboard,
});

function SuperAdminDashboard() {
  const fetchStats = useServerFn(getSystemStats);
  const bootstrap = useServerFn(bootstrapSuperAdmin);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: () => fetchStats(),
    refetchInterval: 30000, // Refresh every 30s
  });

  const bootstrapMutation = useMutation({
    mutationFn: () => bootstrap(),
    onSuccess: (res) => {
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
      refetch();
    },
    onError: () => toast.error("Bootstrap execution failed")
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/50 text-primary animate-pulse">
                System Active
              </Badge>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocol 5.0 God Mode</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Platform Control Center</h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="default" 
              className="glass-effect shadow-lg shadow-primary/20"
              onClick={() => bootstrapMutation.mutate()}
              disabled={bootstrapMutation.isPending}
            >
              <Zap className="mr-2 h-4 w-4" /> Bootstrap System
            </Button>
            <Button variant="outline" className="glass-effect" onClick={() => refetch()}>
              <Activity className="mr-2 h-4 w-4" /> Real-time Sync
            </Button>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DataCard 
            title="Total Citizens" 
            value={stats?.totalUsers || 0} 
            trend="+12%" 
            icon={<Users className="h-5 w-5" />} 
            color="text-primary"
            link="/super-admin/users"
          />
          <DataCard 
            title="Total Inventory" 
            value={stats?.totalProducts || 0} 
            trend="+5%" 
            icon={<ShoppingBag className="h-5 w-5" />} 
            color="text-secondary"
            link="/super-admin/products"
          />
          <DataCard 
            title="Revenue Pool" 
            value={`৳${(stats?.totalRevenue || 0).toLocaleString()}`} 
            trend="+24%" 
            icon={<TrendingUp className="h-5 w-5" />} 
            color="text-emerald-500"
            link="/super-admin/payments"
          />
          <DataCard 
            title="System Uptime" 
            value="99.99%" 
            trend="Stable" 
            icon={<Activity className="h-5 w-5" />} 
            color="text-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 glass-effect border-none shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-border/10 bg-surface-1/50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-black uppercase italic tracking-tight">Temporal Activity Stream</CardTitle>
                  <CardDescription>Real-time platform audit feed</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/super-admin/audit-logs">
                    View Archive <History className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/10">
                {stats?.recentLogs?.map((log: any) => (
                  <div key={log.id} className="p-4 hover:bg-surface-1/30 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-surface-2 ${
                        log.action === 'INSERT' ? 'text-emerald-500' : 
                        log.action === 'UPDATE' ? 'text-amber-500' : 
                        'text-red-500'
                      }`}>
                        {log.action === 'INSERT' ? <Zap className="h-4 w-4" /> : 
                         log.action === 'UPDATE' ? <Activity className="h-4 w-4" /> : 
                         <AlertCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          {log.action} <span className="text-primary">{log.resource_type}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-mono">{log.resource_id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(log.created_at).toLocaleTimeString()}</p>
                      <p className="text-[10px] font-mono text-primary/70">{log.user_email?.split('@')[0] || 'SYSTEM'}</p>
                    </div>
                  </div>
                ))}
                {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
                  <div className="py-20 text-center text-muted-foreground italic">
                    Temporal stream is currently static.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <div className="space-y-6">
            <Card className="glass-effect border-none shadow-xl border-t-2 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" /> Core Engine Health
                  </div>
                  <Link to="/super-admin/system/health" className="text-[10px] text-primary hover:underline">
                    Detailed View
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <HealthItem label="Database Engine" status="Operational" latency="14ms" />
                <HealthItem label="Auth Gate" status="Secure" latency="22ms" />
                <HealthItem label="Fulfillment API" status="Idle" latency="0ms" />
                <HealthItem label="Storage Cloud" status="Optimized" latency="45ms" />
              </CardContent>
            </Card>

            <Card className="glass-effect border-none shadow-xl border-t-2 border-secondary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Lock className="h-4 w-4 text-secondary" /> Access Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase font-bold tracking-tighter">Super Admins</span>
                  <Badge variant="destructive" className="text-[10px] font-black">{stats?.superAdminsCount || 1}</Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase font-bold tracking-tighter">Administrators</span>
                  <Badge variant="outline" className="text-[10px] font-black">2</Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase font-bold tracking-tighter">Standard Citizens</span>
                  <Badge variant="default" className="text-[10px] font-black">{stats?.totalUsers || 0}</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Button variant="outline" className="w-full glass-effect group" asChild>
              <Link to="/super-admin/settings">
                <Terminal className="mr-2 h-4 w-4 text-primary group-hover:animate-pulse" />
                Access God Settings
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DataCard({ title, value, trend, icon, color, link }: any) {
  const content = (
    <Card className="glass-effect border-none shadow-lg group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl bg-surface-2 group-hover:bg-primary/10 transition-colors ${color}`}>
            {icon}
          </div>
          <Badge variant="outline" className="text-[9px] font-black border-emerald-500/20 text-emerald-500">
            {trend}
          </Badge>
        </div>
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black tracking-tighter italic">{value}</h3>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return link ? <Link to={link as any}>{content}</Link> : content;
}

function HealthItem({ label, status, latency }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <p className="text-[10px] font-black uppercase tracking-tight text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[11px] font-bold">{status}</span>
        </div>
      </div>
      <span className="text-[10px] font-mono text-muted-foreground bg-surface-2 px-1.5 py-0.5 rounded">{latency}</span>
    </div>
  );
}

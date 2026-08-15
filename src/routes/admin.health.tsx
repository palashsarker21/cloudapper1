import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Shield, Database, Mail, CreditCard, Activity, Server, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/marketplace/Logo';


export const Route = createFileRoute('/admin/health')({
  head: () => ({
    title: 'System Health | CloudApper Admin',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: AdminHealthPage,
});

function AdminHealthPage() {
  const { data: health, isLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      // Basic connectivity checks
      const dbStart = performance.now();
      const { data: dbData, error: dbError } = await supabase.from('categories').select('count', { count: 'exact', head: true });
      const dbEnd = performance.now();

      const { data: authData } = await supabase.auth.getSession();

      return {
        database: {
          status: dbError ? 'Error' : 'Healthy',
          latency: `${Math.round(dbEnd - dbStart)}ms`,
          message: dbError ? dbError.message : 'Connection successful'
        },
        auth: {
          status: authData.session ? 'Authenticated' : 'Configured',
          method: 'Lovable Cloud Auth'
        },
        storage: {
          status: 'Configured',
          buckets: ['product-images', 'digital-products']
        },
        environment: {
          name: import.meta.env.MODE === 'production' ? 'Production' : 'Development',
          domain: 'cloudapper.online',
          version: '1.0.0-stable'
        }
      };
    },
    refetchInterval: 30000,
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const isHealthy = ['Healthy', 'Configured', 'Authenticated'].includes(status);
    const isError = ['Error', 'Not Configured'].includes(status);
    
    return (
      <Badge 
        variant={isHealthy ? 'success' : isError ? 'destructive' : 'warning'}
      >
        {isHealthy ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <AlertCircle className="mr-1 h-3 w-3" />}
        {status}
      </Badge>
    );

  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Logo variant="icon" className="h-10 w-10" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
            <p className="text-muted-foreground">Real-time status of CloudApper production infrastructure.</p>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-transparent bg-surface-1 shadow-sm">

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database (PostgreSQL)</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <StatusBadge status={health?.database.status || 'Checking...'} />
                <span className="text-xs text-muted-foreground">{health?.database.latency}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {health?.database.message}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-transparent bg-surface-1 shadow-sm">

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authentication</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <StatusBadge status={health?.auth.status || 'Checking...'} />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Provider: {health?.auth.method}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-transparent bg-surface-1 shadow-sm">

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <StatusBadge status={health?.storage.status || 'Checking...'} />
              </div>
              <div className="mt-4 space-y-1">
                {health?.storage.buckets.map(b => (
                  <div key={b} className="text-xs text-muted-foreground flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                    {b}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-transparent bg-surface-1 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Environment</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="font-medium">{health?.environment.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Domain</span>
                  <span className="font-medium">{health?.environment.domain}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">{health?.environment.version}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-60 border-2 border-transparent bg-surface-1 shadow-sm">

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payments (Stripe/BDT)</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <StatusBadge status="Not Configured" />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Requires API credentials for BDT processing.
              </p>
            </CardContent>
          </Card>

          <Card className="opacity-60 border-2 border-transparent bg-surface-1 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email (SMTP)</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <StatusBadge status="Not Configured" />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Requires custom domain verification.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

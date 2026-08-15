import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getSystemHealth } from '@/lib/env.server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Server, ShieldCheck, Mail, Wallet, Key } from 'lucide-react';

export const Route = createFileRoute('/super-admin/system/health')({
  component: SystemHealthPage,
});

function HealthIndicator({ status, label, icon: Icon, missing = [] }: { 
  status: boolean | 'API' | 'SMTP' | 'None', 
  label: string, 
  icon: any,
  missing?: string[]
}) {
  const isHealthy = status === true || status === 'API' || status === 'SMTP';
  
  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${isHealthy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <CardDescription className="text-xs">
              {typeof status === 'string' ? `Mode: ${status}` : (isHealthy ? 'Operational' : 'Action Required')}
            </CardDescription>
          </div>
        </div>
        <Badge variant={isHealthy ? 'outline' : 'destructive'} className={isHealthy ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : ''}>
          {isHealthy ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
          {isHealthy ? 'Healthy' : 'Missing'}
        </Badge>
      </CardHeader>
      <CardContent>
        {!isHealthy && missing.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Missing Keys:</p>
            <ul className="text-xs space-y-1">
              {missing.map(key => (
                <li key={key} className="flex items-center text-destructive/80 font-mono bg-destructive/5 p-1 rounded border border-destructive/10">
                  <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                  {key}
                </li>
              ))}
            </ul>
          </div>
        )}
        {isHealthy && (
          <div className="mt-2 text-xs text-muted-foreground">
            All required variables are present in the environment.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SystemHealthPage() {
  const { data: health, isLoading, error } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => getSystemHealth(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Auditing system infrastructure...</p>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="p-8">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              Health Check Failed
            </CardTitle>
            <CardDescription>
              Could not retrieve system health data. Please verify your admin session.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
        <p className="text-muted-foreground italic">
          Real-time status of CloudApper production infrastructure and external integrations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <HealthIndicator 
          status={health.supabase.url && health.supabase.anonKey && health.supabase.serviceRole}
          label="Supabase Core"
          icon={Server}
          missing={[
            !health.supabase.url && 'VITE_SUPABASE_URL',
            !health.supabase.anonKey && 'VITE_SUPABASE_ANON_KEY',
            !health.supabase.serviceRole && 'SUPABASE_SERVICE_ROLE_KEY'
          ].filter(Boolean) as string[]}
        />
        
        <HealthIndicator 
          status={health.binance.configured}
          label="Binance Pay"
          icon={Wallet}
          missing={health.binance.missing}
        />

        <HealthIndicator 
          status={health.eklas.configured}
          label="Eklas License API"
          icon={Key}
          missing={health.eklas.missing}
        />

        <HealthIndicator 
          status={health.email.configured ? health.email.type as any : false}
          label="Email Delivery"
          icon={Mail}
          missing={health.email.configured ? [] : ['EMAIL_PROVIDER_API_KEY or SMTP_HOST']}
        />
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-primary" />
            Infrastructure Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4 text-muted-foreground leading-relaxed">
          <p>
            CloudApper implements a <strong className="text-foreground">fault-tolerant architecture</strong>. 
            Missing optional integrations (Binance, Eklas, Email) will gracefully degrade the specific feature 
            without impacting the core marketplace or manual payment verification (bKash/Nagad).
          </p>
          <div className="grid gap-4 md:grid-cols-3 pt-2">
            <div className="p-3 rounded-lg border bg-muted/30">
              <h4 className="font-semibold text-foreground mb-1">Isolation</h4>
              <p className="text-xs">Unconfigured providers are automatically hidden from the checkout flow.</p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30">
              <h4 className="font-semibold text-foreground mb-1">Retention</h4>
              <p className="text-xs">Orders with fulfillment failures are preserved in a 'Pending Configuration' state.</p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30">
              <h4 className="font-semibold text-foreground mb-1">Security</h4>
              <p className="text-xs">Keys are validated server-side and never exposed to client-side bundles or logs.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

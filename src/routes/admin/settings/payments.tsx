import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getSettings, updateSettings } from "@/lib/admin.functions";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2, Save, CheckCircle2, XCircle, ShieldCheck, Clock, Coins, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/marketplace/Header";
import { Footer } from "@/components/marketplace/Footer";

export const Route = createFileRoute("/admin/settings/payments")({
  head: () => ({
    title: 'Payment Settings | Admin | CloudApper',
  }),
  component: AdminPaymentSettings,
});

function AdminPaymentSettings() {
  const fetchSettings = useServerFn(getSettings);
  const mutateSettings = useServerFn(updateSettings);
  const queryClient = useQueryClient();
  
  const [localProviders, setLocalProviders] = useState<any>(null);
  const [localConfig, setLocalConfig] = useState<any>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-payment-settings"],
    queryFn: () => fetchSettings(),
  });

  useEffect(() => {
    if (settings) {
      setLocalProviders(settings.payment_providers || {});
      setLocalConfig(settings.payment_config || {
        expiry_minutes: 30,
        default_currency: 'BDT',
        supported_networks: ['TRC20', 'ERC20', 'BEP20'],
        supported_assets: ['USDT', 'USDC', 'BTC']
      });
    }
  }, [settings]);

  const updateProvidersMutation = useMutation({
    mutationFn: (newValues: any) => mutateSettings({ data: { id: "payment_providers", value: newValues } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-settings"] });
      toast.success("Provider settings updated");
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: (newValues: any) => mutateSettings({ data: { id: "payment_config", value: newValues } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-settings"] });
      toast.success("Global payment config updated");
    },
  });

  const handleProviderToggle = (provider: string) => {
    setLocalProviders((prev: any) => ({
      ...prev,
      [provider]: { ...prev[provider], enabled: !prev[provider]?.enabled },
    }));
  };

  const handleProviderChange = (provider: string, field: string, value: string) => {
    setLocalProviders((prev: any) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field === 'webhook_url' ? 'webhook_url' : 'credentials']: 
          field === 'webhook_url' 
            ? value 
            : { ...prev[provider]?.credentials, [field]: value },
      },
    }));
  };

  const handleConfigChange = (field: string, value: any) => {
    setLocalConfig((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateProvidersMutation.mutate(localProviders);
    updateConfigMutation.mutate(localConfig);
  };

  if (isLoading || !localProviders || !localConfig) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-0">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container mx-auto py-10 px-4 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Infrastructure</h1>
            <p className="text-muted-foreground">Configure gateways, crypto networks, and payment rules.</p>
          </div>
          <Button onClick={handleSave} disabled={updateProvidersMutation.isPending || updateConfigMutation.isPending}>
            {(updateProvidersMutation.isPending || updateConfigMutation.isPending) ? 
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
              <Save className="mr-2 h-4 w-4" />
            }
            Save Configuration
          </Button>
        </div>

        <Tabs defaultValue="providers" className="w-full">
          <TabsList className="bg-surface-2 p-1">
            <TabsTrigger value="providers">Gateways</TabsTrigger>
            <TabsTrigger value="rules">Global Rules</TabsTrigger>
            <TabsTrigger value="crypto">Crypto Config</TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <GatewayCard 
                name="bKash"
                id="bkash"
                data={localProviders.bkash || { enabled: false, credentials: {} }}
                onToggle={() => handleProviderToggle('bkash')}
                onChange={handleProviderChange}
                fields={[
                  { id: 'app_key', label: 'App Key', type: 'password' },
                  { id: 'app_secret', label: 'App Secret', type: 'password' },
                  { id: 'username', label: 'Username', type: 'text' },
                  { id: 'password', label: 'Password', type: 'password' }
                ]}
              />
              <GatewayCard 
                name="Binance Pay"
                id="binance_pay"
                data={localProviders.binance_pay || { enabled: false, credentials: {} }}
                onToggle={() => handleProviderToggle('binance_pay')}
                onChange={handleProviderChange}
                fields={[
                  { id: 'api_key', label: 'API Key', type: 'password' },
                  { id: 'secret_key', label: 'Secret Key', type: 'password' }
                ]}
              />
              <GatewayCard 
                name="Bitget Pay"
                id="bitget_pay"
                data={localProviders.bitget_pay || { enabled: false, credentials: {} }}
                onToggle={() => handleProviderToggle('bitget_pay')}
                onChange={handleProviderChange}
                fields={[
                  { id: 'merchant_id', label: 'Merchant ID', type: 'text' },
                  { id: 'api_key', label: 'API Key', type: 'password' }
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="rules" className="mt-6">
            <Card className="bg-surface-1 border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Payment Lifecycle Rules
                </CardTitle>
                <CardDescription>Define how payments behave across the marketplace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <Label>Payment Expiry (Minutes)</Label>
                    <Input 
                      type="number" 
                      value={localConfig.expiry_minutes} 
                      onChange={(e) => handleConfigChange('expiry_minutes', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">Orders will expire if not paid within this window.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Marketplace Currency</Label>
                    <Input 
                      value={localConfig.default_currency} 
                      onChange={(e) => handleConfigChange('default_currency', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crypto" className="mt-6">
            <Card className="bg-surface-1 border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  Blockchain & Asset Config
                </CardTitle>
                <CardDescription>Enable or disable specific networks and crypto assets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <Label>Supported Networks (Comma separated)</Label>
                    <Input 
                      value={localConfig.supported_networks?.join(', ')} 
                      onChange={(e) => handleConfigChange('supported_networks', e.target.value.split(',').map(s => s.trim()))}
                      placeholder="TRC20, ERC20, BEP20"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Supported Assets (Comma separated)</Label>
                    <Input 
                      value={localConfig.supported_assets?.join(', ')} 
                      onChange={(e) => handleConfigChange('supported_assets', e.target.value.split(',').map(s => s.trim()))}
                      placeholder="USDT, USDC, BTC"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

function GatewayCard({ name, id, data, onToggle, onChange, fields }: any) {
  const configured = Object.values(data.credentials || {}).some(v => v !== "");
  
  return (
    <Card className="bg-surface-2 border-none shadow-md overflow-hidden group">
      <div className={`h-1 w-full ${data.enabled ? 'bg-primary' : 'bg-muted'}`} />
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          {configured ? (
            <Badge variant="outline" className="text-green-500 bg-green-500/10 border-green-500/20 gap-1">
              <CheckCircle2 className="h-3 w-3" /> Configured
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground gap-1">
              <XCircle className="h-3 w-3" /> Missing Keys
            </Badge>
          )}
          <Switch checked={data.enabled} onCheckedChange={onToggle} />
        </div>
        <CardTitle className="text-xl">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field: any) => (
          <div key={field.id} className="space-y-1.5">
            <Label className="text-xs uppercase font-bold text-muted-foreground">{field.label}</Label>
            <Input
              type={field.type}
              value={data.credentials[field.id] || ""}
              onChange={(e) => onChange(id, field.id, e.target.value)}
              className="bg-surface-3 border-none focus-visible:ring-1"
            />
          </div>
        ))}
        <div className="pt-2">
          <Label className="text-xs uppercase font-bold text-muted-foreground">Webhook Target</Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={data.webhook_url || ""}
              onChange={(e) => onChange(id, 'webhook_url', e.target.value)}
              placeholder="https://..."
              className="bg-surface-3 border-none text-xs"
            />
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
              navigator.clipboard.writeText(`https://cloudapper.online/api/public/webhooks/${id}`);
              toast.info("Endpoint copied");
            }}>
              <ShieldCheck className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

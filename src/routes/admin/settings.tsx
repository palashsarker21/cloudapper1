import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { Loader2, Save, CheckCircle2, XCircle, Globe, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const fetchSettings = useServerFn(getSettings);
  const mutateSettings = useServerFn(updateSettings);
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<any>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => fetchSettings(),
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings.payment_providers || {});
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (newValues: any) => mutateSettings({ data: { id: "payment_providers", value: newValues } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  const handleToggle = (provider: string) => {
    setLocalSettings((prev: any) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        enabled: !prev[provider].enabled,
      },
    }));
  };

  const handleChange = (provider: string, field: string, value: string) => {
    setLocalSettings((prev: any) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field === 'webhook_url' ? 'webhook_url' : 'credentials']: 
          field === 'webhook_url' 
            ? value 
            : { ...prev[provider].credentials, [field]: value },
      },
    }));
  };

  const handleSave = () => {
    updateMutation.mutate(localSettings);
  };

  if (isLoading || !localSettings) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isConfigured = (providerData: any) => {
    const creds = providerData.credentials || {};
    return Object.values(creds).some(v => v !== "");
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Manage payment providers and marketplace configuration.</p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="payments">Payment Providers</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* bKash */}
            <ProviderCard 
              name="bKash"
              id="bkash"
              description="Bangladesh's leading mobile financial service."
              data={localSettings.bkash}
              onToggle={() => handleToggle('bkash')}
              onChange={(field: string, val: string) => handleChange('bkash', field, val)}
              configured={isConfigured(localSettings.bkash)}
              fields={[
                { id: 'app_key', label: 'App Key', type: 'password' },
                { id: 'app_secret', label: 'App Secret', type: 'password' },
                { id: 'username', label: 'Username', type: 'text' },
                { id: 'password', label: 'Password', type: 'password' }
              ]}
            />

            {/* Nagad */}
            <ProviderCard 
              name="Nagad"
              id="nagad"
              description="Fast and secure digital financial service in Bangladesh."
              data={localSettings.nagad}
              onToggle={() => handleToggle('nagad')}
              onChange={(field: string, val: string) => handleChange('nagad', field, val)}
              configured={isConfigured(localSettings.nagad)}
              fields={[
                { id: 'merchant_id', label: 'Merchant ID', type: 'text' },
                { id: 'public_key', label: 'Public Key', type: 'textarea' },
                { id: 'private_key', label: 'Private Key', type: 'textarea' }
              ]}
            />

            {/* Binance Pay */}
            <ProviderCard 
              name="Binance Pay"
              id="binance_pay"
              description="Borderless, contactless crypto payment technology."
              data={localSettings.binance_pay}
              onToggle={() => handleToggle('binance_pay')}
              onChange={(field, val) => handleChange('binance_pay', field, val)}
              configured={isConfigured(localSettings.binance_pay)}
              fields={[
                { id: 'api_key', label: 'API Key', type: 'password' },
                { id: 'secret_key', label: 'Secret Key', type: 'password' }
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Configuration</CardTitle>
              <CardDescription>General settings for CloudApper.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="site_name">Store Name</Label>
                <Input id="site_name" defaultValue="CloudApper" disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="site_url">Website URL</Label>
                <Input id="site_url" defaultValue="https://cloudapper.online" disabled />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                <Globe className="h-4 w-4" />
                These values are managed via environment configuration.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProviderCard({ name, id, description, data, onToggle, onChange, configured, fields }: any) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          {configured ? (
            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 gap-1">
              <CheckCircle2 className="h-3 w-3" /> Configured
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground gap-1">
              <XCircle className="h-3 w-3" /> Not Configured
            </Badge>
          )}
          <Switch 
            checked={data.enabled} 
            onCheckedChange={onToggle}
          />
        </div>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="space-y-3">
          {fields.map((field: any) => (
            <div key={field.id} className="grid gap-1.5">
              <Label htmlFor={`${id}-${field.id}`}>{field.label}</Label>
              {field.type === 'textarea' ? (
                <textarea
                  id={`${id}-${field.id}`}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={data.credentials[field.id] || ""}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              ) : (
                <Input
                  id={`${id}-${field.id}`}
                  type={field.type}
                  value={data.credentials[field.id] || ""}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
          <div className="grid gap-1.5">
            <Label htmlFor={`${id}-webhook`}>Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id={`${id}-webhook`}
                value={data.webhook_url || ""}
                onChange={(e) => onChange('webhook_url', e.target.value)}
                placeholder="https://cloudapper.online/api/public/webhook"
              />
              <Button size="icon" variant="ghost" title="Copy default webhook URL" onClick={() => {
                const url = `https://cloudapper.online/api/public/webhook/${id}`;
                navigator.clipboard.writeText(url);
                toast.info("Webhook endpoint copied");
              }}>
                <ShieldCheck className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

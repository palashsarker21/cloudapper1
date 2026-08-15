import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getSettings, updateSettings } from '@/lib/admin.functions';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Shield, 
  Globe, 
  Mail, 
  Bell, 
  Save, 
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Wallet
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/super-admin/settings')({
  component: SuperAdminSettingsPage,
});

function SuperAdminSettingsPage() {
  const fetchSettings = useServerFn(getSettings);
  const saveSetting = useServerFn(updateSettings);
  
  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => fetchSettings(),
  });

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const mutation = useMutation({
    mutationFn: (variables: { id: string, value: any }) => 
      saveSetting({ data: { id: variables.id, value: variables.value } }),
    onSuccess: () => {
      toast.success("Settings updated successfully");
      refetch();
    },
    onError: () => toast.error("Failed to update settings")
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Platform Settings</h1>
            <p className="text-muted-foreground">Global configuration and system overrides</p>
          </div>
          <Button variant="default" className="glass-effect" onClick={() => refetch()}>
            <Save className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="glass-effect border-none shadow-lg">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  <Link to="/super-admin/settings">
                    <SidebarItem icon={<Globe className="h-4 w-4" />} label="General" active />
                  </Link>
                  <SidebarItem icon={<Shield className="h-4 w-4" />} label="Security" />
                  <Link to="/super-admin/settings/manual-payments">
                    <SidebarItem icon={<Wallet className="h-4 w-4" />} label="Manual Payments" />
                  </Link>
                  <SidebarItem icon={<Lock className="h-4 w-4" />} label="API Keys" />
                </nav>
              </CardContent>
            </Card>

            <Card className="bg-destructive/10 border-destructive/20 border text-destructive shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  DANGER ZONE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold uppercase tracking-wider">Maintenance Mode</p>
                    <p className="text-[10px] opacity-70">Take entire platform offline for public</p>
                  </div>
                  <Switch 
                    checked={isMaintenanceMode} 
                    onCheckedChange={(val) => {
                      if (confirm("Are you sure you want to toggle maintenance mode?")) {
                        setIsMaintenanceMode(val);
                        mutation.mutate({ id: 'system_config', value: { ...settings?.system_config, maintenance_mode: val } });
                      }
                    }} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-effect border-none shadow-xl">
              <CardHeader>
                <CardTitle>General Configuration</CardTitle>
                <CardDescription>Basic store information and locale</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Site Name</label>
                    <Input defaultValue="CloudApper" className="bg-surface-2 border-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Default Currency</label>
                    <Input defaultValue="BDT" className="bg-surface-2 border-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Support Email</label>
                    <Input defaultValue="support@cloudapper.online" className="bg-surface-2 border-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Timezone</label>
                    <Input defaultValue="UTC+6 (Asia/Dhaka)" className="bg-surface-2 border-none" />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                   <Button variant="default">Save General Changes</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-none shadow-xl">
              <CardHeader>
                <CardTitle>Branding Control</CardTitle>
                <CardDescription>Logo and visual identity assets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-8">
                  <div className="h-24 w-24 rounded-2xl bg-surface-2 border-2 border-dashed border-border/20 flex items-center justify-center">
                    <Settings className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">Upload New Logo</Button>
                    <p className="text-[10px] text-muted-foreground">Recommended: 512x512px SVG or PNG</p>
                  </div>
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

function SidebarItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface-2'}`}>
      {icon}
      {label}
    </button>
  );
}

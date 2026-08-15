import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getPaymentReceivers, updatePaymentReceiver, deletePaymentReceiver } from '@/lib/admin.functions';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  Save, 
  MoveUp, 
  MoveDown, 
  Wallet,
  Settings,
  Shield,
  Globe,
  Mail,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/super-admin/settings/manual-payments')({
  component: ManualPaymentsSettingsPage,
});

function ManualPaymentsSettingsPage() {
  const fetchReceivers = useServerFn(getPaymentReceivers);
  const saveReceiver = useServerFn(updatePaymentReceiver);
  const removeReceiver = useServerFn(deletePaymentReceiver);
  
  const { data: receivers, isLoading, refetch } = useQuery({
    queryKey: ['admin-payment-receivers'],
    queryFn: () => fetchReceivers(),
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newReceiver, setNewReceiver] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (data: any) => saveReceiver({ data }),
    onSuccess: () => {
      toast.success("Receiver saved successfully");
      setEditingId(null);
      setNewReceiver(false);
      refetch();
    },
    onError: (error: any) => toast.error(error.message || "Failed to save receiver")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeReceiver({ data: { id } }),
    onSuccess: () => {
      toast.success("Receiver deleted");
      refetch();
    },
    onError: () => toast.error("Failed to delete receiver")
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/super-admin/settings" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to Settings
              </Link>
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Manual Payment Receivers</h1>
            <p className="text-muted-foreground">Configure bKash, Nagad, and other personal account destinations</p>
          </div>
          <Button variant="default" className="glass-effect" onClick={() => setNewReceiver(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Receiver
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Reusing styles from main settings */}
          <div className="lg:col-span-1 space-y-4">
             <Card className="glass-effect border-none shadow-lg">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  <Link to="/super-admin/settings">
                    <SidebarItem icon={<Globe className="h-4 w-4" />} label="General" />
                  </Link>
                  <SidebarItem icon={<Shield className="h-4 w-4" />} label="Security" />
                  <SidebarItem icon={<Wallet className="h-4 w-4" />} label="Manual Payments" active />
                  <SidebarItem icon={<Lock className="h-4 w-4" />} label="API Keys" />
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {newReceiver && (
              <ReceiverForm 
                onSave={(data) => saveMutation.mutate(data)} 
                onCancel={() => setNewReceiver(false)} 
              />
            )}

            {isLoading ? (
              <div className="py-20 text-center italic text-muted-foreground">Loading payment infrastructure...</div>
            ) : (
              <div className="space-y-4">
                {receivers?.map((receiver) => (
                  editingId === receiver.id ? (
                    <ReceiverForm 
                      key={receiver.id}
                      initialData={receiver} 
                      onSave={(data) => saveMutation.mutate({ ...data, id: receiver.id })} 
                      onCancel={() => setEditingId(null)} 
                    />
                  ) : (
                    <Card key={receiver.id} className="glass-effect border-none shadow-xl group">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-xl bg-surface-2 flex items-center justify-center text-primary border border-border/10">
                              <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">{receiver.display_name}</h3>
                                {!receiver.enabled && (
                                  <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-destructive/20 text-destructive rounded">Disabled</span>
                                )}
                              </div>
                              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{receiver.provider} • {receiver.receiver_identifier}</p>
                              {receiver.instructions && (
                                <p className="text-xs mt-2 text-muted-foreground line-clamp-1">{receiver.instructions}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => setEditingId(receiver.id)}>
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                              if(confirm("Delete this receiver?")) deleteMutation.mutate(receiver.id);
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ReceiverForm({ initialData, onSave, onCancel }: { initialData?: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    provider: initialData?.provider || 'bkash',
    display_name: initialData?.display_name || '',
    receiver_identifier: initialData?.receiver_identifier || '',
    instructions: initialData?.instructions || '',
    currency: initialData?.currency || 'BDT',
    minimum_amount: initialData?.minimum_amount || 0,
    enabled: initialData?.enabled ?? true,
    sort_order: initialData?.sort_order || 0
  });

  return (
    <Card className="glass-effect border-2 border-primary/20 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-sm font-black uppercase tracking-widest">
          {initialData ? 'Edit Receiver' : 'New Payment Destination'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Provider Key</label>
            <Input 
              value={formData.provider} 
              onChange={e => setFormData({...formData, provider: e.target.value.toLowerCase()})}
              placeholder="bkash, nagad, rocket"
              className="bg-surface-2 border-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Display Name</label>
            <Input 
              value={formData.display_name} 
              onChange={e => setFormData({...formData, display_name: e.target.value})}
              placeholder="Personal bKash (017...)"
              className="bg-surface-2 border-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Wallet/Number/Address</label>
          <Input 
            value={formData.receiver_identifier} 
            onChange={e => setFormData({...formData, receiver_identifier: e.target.value})}
            placeholder="017XXXXXXXX"
            className="bg-surface-2 border-none font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Instructions</label>
          <Input 
            value={formData.instructions} 
            onChange={e => setFormData({...formData, instructions: e.target.value})}
            placeholder="Send money only. Do not use cash-in."
            className="bg-surface-2 border-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Currency</label>
            <Input 
              value={formData.currency} 
              onChange={e => setFormData({...formData, currency: e.target.value.toUpperCase()})}
              className="bg-surface-2 border-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Min Amount</label>
            <Input 
              type="number"
              value={formData.minimum_amount} 
              onChange={e => setFormData({...formData, minimum_amount: parseFloat(e.target.value)})}
              className="bg-surface-2 border-none"
            />
          </div>
          <div className="flex items-center gap-2 pt-4">
            <Switch 
              checked={formData.enabled} 
              onCheckedChange={val => setFormData({...formData, enabled: val})} 
            />
            <span className="text-[10px] font-bold uppercase tracking-widest">Active</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="default" size="sm" onClick={() => onSave(formData)}>
            <Save className="mr-2 h-4 w-4" /> Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface-2'}`}>
      {icon}
      {label}
    </div>
  );
}

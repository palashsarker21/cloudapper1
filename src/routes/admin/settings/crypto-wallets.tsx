import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCryptoWallets, updateCryptoWallet, deleteCryptoWallet } from "@/lib/admin.functions";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState } from "react";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Wallet, 
  Network, 
  Coins, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/settings/crypto-wallets")({
  beforeLoad: ({ context }: any) => {
    // This route is under /admin layout which already checks for admin role.
    // We can also double-check here if needed, but the parent gate is primary.
    if (!context.isAdmin) {
      throw redirect({ to: '/' });
    }
  },
  head: () => ({
    meta: [{ title: 'Crypto Wallets | Admin | CloudApper' }],
  }),
  component: AdminCryptoWallets,
});

function AdminCryptoWallets() {
  const fetchWallets = useServerFn(getCryptoWallets);
  const mutateWallet = useServerFn(updateCryptoWallet);
  const removeWallet = useServerFn(deleteCryptoWallet);
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<any>(null);

  const { data: wallets, isLoading } = useQuery({
    queryKey: ["admin-crypto-wallets"],
    queryFn: () => fetchWallets(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => mutateWallet({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-crypto-wallets"] });
      toast.success(editingWallet?.id ? "Wallet updated" : "Wallet added");
      setIsDialogOpen(false);
      setEditingWallet(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save wallet");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeWallet({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-crypto-wallets"] });
      toast.success("Wallet deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete wallet");
    }
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingWallet?.id,
      asset: formData.get("asset") as string,
      network: formData.get("network") as string,
      wallet_address: formData.get("wallet_address") as string,
      minimum_amount: parseFloat(formData.get("minimum_amount") as string || "0"),
      is_active: formData.get("is_active") === "on",
    };
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Crypto Destinations</h1>
          <p className="text-muted-foreground">Manage wallet addresses for customer payments.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingWallet(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface-1 border-none text-white sm:max-w-[425px]">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>{editingWallet ? "Edit Wallet" : "Add New Wallet"}</DialogTitle>
                <DialogDescription>
                  Enter the details for the crypto destination.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="asset">Asset (e.g., USDT, BTC)</Label>
                  <Input 
                    id="asset" 
                    name="asset" 
                    defaultValue={editingWallet?.asset} 
                    required 
                    placeholder="USDT"
                    className="bg-surface-2 border-none" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="network">Network (e.g., TRC20, ERC20)</Label>
                  <Input 
                    id="network" 
                    name="network" 
                    defaultValue={editingWallet?.network} 
                    required 
                    placeholder="TRC20"
                    className="bg-surface-2 border-none" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wallet_address">Wallet Address</Label>
                  <Input 
                    id="wallet_address" 
                    name="wallet_address" 
                    defaultValue={editingWallet?.wallet_address} 
                    required 
                    placeholder="T..."
                    className="bg-surface-2 border-none" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimum_amount">Minimum Confirmation/Amount (Optional)</Label>
                  <Input 
                    id="minimum_amount" 
                    name="minimum_amount" 
                    type="number" 
                    step="any"
                    defaultValue={editingWallet?.minimum_amount || 0} 
                    className="bg-surface-2 border-none" 
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="is_active" name="is_active" defaultChecked={editingWallet ? editingWallet.is_active : true} />
                  <Label htmlFor="is_active">Active for Payments</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Wallet
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {wallets?.map((wallet: any) => (
          <Card key={wallet.id} className="bg-surface-1 border-none shadow-md overflow-hidden relative group">
            <div className={`absolute top-0 left-0 w-1 h-full ${wallet.is_active ? 'bg-primary' : 'bg-muted'}`} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={wallet.is_active ? "default" : "secondary"} className="gap-1">
                  {wallet.is_active ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {wallet.is_active ? "Active" : "Inactive"}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-white"
                    onClick={() => {
                      setEditingWallet(wallet);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive/70 hover:text-destructive"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this wallet?")) {
                        deleteMutation.mutate(wallet.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Coins className="h-5 w-5 text-primary" />
                {wallet.asset}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                <Network className="h-3 w-3" />
                {wallet.network}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Address</Label>
                <div className="bg-surface-2 rounded p-2 text-xs font-mono break-all text-muted-foreground border border-white/5">
                  {wallet.wallet_address}
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Min Amount</span>
                <span className="text-white font-medium">{wallet.minimum_amount} {wallet.asset}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {wallets?.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-surface-1/30 rounded-lg border border-dashed border-white/10">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-muted-foreground">No crypto wallets configured</h3>
            <p className="text-sm text-muted-foreground/60 max-w-xs mt-1">
              Add your first wallet to start accepting crypto payments manually.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

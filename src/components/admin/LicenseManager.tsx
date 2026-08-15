import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLicenseInventory, updateLicenseStatus, addLicenseKeys } from "@/lib/licenses.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  RefreshCw, 
  Ban, 
  Key, 
  EyeOff, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export const LicenseManager = ({ productId }: { productId: string }) => {
  const queryClient = useQueryClient();
  const getInventory = useServerFn(getLicenseInventory);
  const updateStatus = useServerFn(updateLicenseStatus);
  const addKeys = useServerFn(addLicenseKeys);
  const [newKeysText, setNewKeysText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const { data: licenses, isLoading } = useQuery({
    queryKey: ['product-licenses', productId],
    queryFn: () => getInventory({ data: { productId } })
  });

  const updateStatusMutation = useMutation({
    mutationFn: (variables: { id: string, status: any }) => 
      updateStatus({ data: { licenseId: variables.id, status: variables.status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-licenses', productId] });
      toast.success("License status updated");
    },
    onError: (err: any) => toast.error(err.message)
  });

  const addKeysMutation = useMutation({
    mutationFn: (keys: string[]) => addKeys({ data: { productId, keys } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-licenses', productId] });
      setNewKeysText("");
      setIsAdding(false);
      toast.success("License keys added successfully");
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleAddKeys = () => {
    const keys = newKeysText.split('\n').map(k => k.trim()).filter(k => k.length > 0);
    if (keys.length === 0) return;
    addKeysMutation.mutate(keys);
  };

  const counts = {
    total: licenses?.length || 0,
    available: licenses?.filter((l: any) => l.status === 'available').length || 0,
    assigned: licenses?.filter((l: any) => l.status === 'assigned').length || 0,
    revoked: licenses?.filter((l: any) => l.status === 'revoked').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{counts.total}</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Keys</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{counts.available}</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Available</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{counts.assigned}</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Assigned</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{counts.revoked}</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Revoked</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>License Inventory</CardTitle>
            <CardDescription>Masked license keys for security. Keys are decrypted only for final delivery.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
            <Plus className="w-4 h-4 mr-2" /> {isAdding ? "Cancel" : "Add Keys"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {isAdding && (
            <div className="p-4 border rounded-xl bg-muted/20 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Batch Import Keys</label>
                <Textarea 
                  placeholder="Paste keys here, one per line..." 
                  className="min-h-[150px] font-mono text-sm"
                  value={newKeysText}
                  onChange={(e) => setNewKeysText(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleAddKeys} 
                disabled={addKeysMutation.isPending || !newKeysText.trim()}
              >
                {addKeysMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Import {newKeysText.split('\n').filter(k => k.trim()).length} Keys
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin opacity-20" /></div>
          ) : !licenses || licenses.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed rounded-xl">
              <Key className="w-10 h-10 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No license keys found. Import some to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>License Key (Masked)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map((license) => (
                    <TableRow key={license.id}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <EyeOff className="w-3 h-3 opacity-40" />
                          {license.license_key}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          license.status === 'available' ? 'secondary' :
                          license.status === 'assigned' ? 'default' :
                          license.status === 'revoked' ? 'destructive' : 'outline'
                        } className="capitalize">
                          {license.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {license.assigned_to ? `User: ${license.assigned_to.substring(0, 8)}...` : 'Unassigned'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(license.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {license.status === 'available' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                onClick={() => updateStatusMutation.mutate({ id: license.id, status: 'suspended' })}
                              >
                                <RefreshCw className="w-3 h-3 mr-1" /> Suspend
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-destructive hover:bg-red-50"
                                onClick={() => updateStatusMutation.mutate({ id: license.id, status: 'revoked' })}
                              >
                                <Ban className="w-3 h-3 mr-1" /> Revoke
                              </Button>
                            </>
                          )}
                          {license.status !== 'available' && license.status !== 'assigned' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2"
                              onClick={() => updateStatusMutation.mutate({ id: license.id, status: 'available' })}
                            >
                              Restore
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p className="font-semibold mb-1">Security Enforcement</p>
          <p>
            License keys are stored encrypted in the database. This UI only displays masked variants. 
            Full keys are only visible to customers through their secure dashboard after a verified purchase.
          </p>
        </div>
      </div>
    </div>
  );
};

import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getUserEntitlements, getDownloadUrl } from '@/lib/fulfillment.functions';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Download, 
  Key, 
  ExternalLink, 
  Package, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/account/entitlements')({
  component: EntitlementsPage,
});

function EntitlementsPage() {
  const fetchEntitlements = useServerFn(getUserEntitlements);
  const getDownload = useServerFn(getDownloadUrl);

  const { data: entitlements, isLoading, error } = useQuery({
    queryKey: ['user-entitlements'],
    queryFn: () => fetchEntitlements(),
  });

  const downloadMutation = useMutation({
    mutationFn: (id: string) => getDownload({ data: { entitlementId: id } }),
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      } else if (data.error) {
        toast.error(data.error);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate download link");
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your Products</h1>
          <p className="text-muted-foreground">Access your purchased AI tools, licenses, and digital files.</p>
        </div>

        {entitlements?.length === 0 ? (
          <Card className="border-dashed py-12 text-center">
            <CardContent>
              <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No products found</h3>
              <p className="text-muted-foreground mb-6">You haven't purchased any digital products yet.</p>
              <Button asChild>
                <Link to="/">Browse Marketplace</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entitlements?.map((ent: any) => (
              <Card key={ent.id} className="overflow-hidden flex flex-col">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="capitalize">
                      {ent.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Purchased {new Date(ent.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-xl line-clamp-1">{ent.products?.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex-grow">
                  {ent.type === 'license' ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-muted rounded-lg border font-mono text-sm break-all">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground uppercase">License Key</span>
                          <Key className="h-3 w-3 text-muted-foreground" />
                        </div>
                        {ent.data.license_key}
                      </div>
                      {ent.products?.delivery_instructions && (
                        <div className="text-xs text-muted-foreground">
                          <p className="font-semibold mb-1">Activation Instructions:</p>
                          <p>{ent.products.delivery_instructions}</p>
                        </div>
                      )}
                    </div>
                  ) : ent.type === 'file' ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Digital Download</span>
                        </div>
                        {ent.max_downloads && (
                          <span className="text-[10px] text-muted-foreground">
                            {ent.download_count} / {ent.max_downloads} used
                          </span>
                        )}
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => downloadMutation.mutate(ent.id)}
                        disabled={downloadMutation.isPending}
                      >
                        {downloadMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Download Files
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 text-center border rounded-lg bg-muted/50">
                      <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Account-based entitlement</p>
                      <p className="text-xs text-muted-foreground mt-1">Access instructions sent to email</p>
                    </div>
                  )}
                </CardContent>
                <div className="px-6 py-4 border-t bg-muted/10 mt-auto">
                  <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                    <Link to="/track-order" search={{ orderId: ent.order_id }}>
                      View Order Details
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

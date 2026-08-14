import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getAdminFulfillments, retryFulfillment } from '@/lib/fulfillment-admin.functions';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/fulfillment')({
  head: () => ({
    title: 'Fulfillment Management | Admin | CloudApper',
  }),
  component: AdminFulfillmentPage,

});

function AdminFulfillmentPage() {
  const fetchFulfillments = useServerFn(getAdminFulfillments);
  const retryFn = useServerFn(retryFulfillment);
  const queryClient = useQueryClient();

  const { data: fulfillments, isLoading, error } = useQuery({
    queryKey: ['admin-fulfillments'],
    queryFn: () => fetchFulfillments(),
  });

  const mutation = useMutation({
    mutationFn: (id: string) => retryFn({ data: { fulfillmentId: id } }),
    onSuccess: () => {
      toast.success("Fulfillment retry triggered");
      queryClient.invalidateQueries({ queryKey: ['admin-fulfillments'] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Retry failed");
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
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fulfillment Center</h1>
            <p className="text-muted-foreground">Monitor and manage digital product deliveries.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/orders">Orders</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/products">Products</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <h3 className="text-2xl font-bold">{fulfillments?.filter((f: any) => f.status === 'pending').length}</h3>
                </div>
                <Clock className="h-8 w-8 text-amber-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processing</p>
                  <h3 className="text-2xl font-bold">{fulfillments?.filter((f: any) => f.status === 'processing').length}</h3>
                </div>
                <RefreshCw className="h-8 w-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <h3 className="text-2xl font-bold">{fulfillments?.filter((f: any) => f.status === 'completed').length}</h3>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <h3 className="text-2xl font-bold">{fulfillments?.filter((f: any) => f.status === 'failed').length}</h3>
                </div>
                <XCircle className="h-8 w-8 text-red-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Delivery History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fulfillments?.map((f: any) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{f.orders?.customer_name || 'Anonymous'}</span>
                        <span className="text-xs text-muted-foreground">{f.orders?.customer_email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{f.metadata?.product_name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">x{f.metadata?.quantity}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {f.fulfillment_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        f.status === 'completed' ? 'default' :
                        f.status === 'pending' ? 'secondary' :
                        f.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {f.status}
                      </Badge>
                      {f.error_message && (
                        <p className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={f.error_message}>
                          {f.error_message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(f.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {f.status === 'failed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => mutation.mutate(f.id)}
                          disabled={mutation.isPending}
                        >
                          <RefreshCw className={`h-3 w-3 mr-1 ${mutation.isPending ? 'animate-spin' : ''}`} />
                          Retry
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!fulfillments || fulfillments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No fulfillment records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

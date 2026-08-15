import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getAdminOrders } from '@/lib/admin.functions';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute('/super-admin/orders')({
  component: SuperAdminOrdersPage,
});

function SuperAdminOrdersPage() {
  const fetchOrders = useServerFn(getAdminOrders);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['super-admin-orders'],
    queryFn: () => fetchOrders(),
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Order Management</h1>
            <p className="text-muted-foreground">Monitor and fulfill marketplace transactions</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="glass-effect">
              Export Orders
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total" count={orders?.length || 0} icon={<ShoppingBag className="h-4 w-4" />} />
          <StatsCard title="Pending" count={orders?.filter((o:any) => o.status === 'pending').length || 0} icon={<Clock className="h-4 w-4" />} color="text-amber-500" />
          <StatsCard title="Completed" count={orders?.filter((o:any) => o.status === 'paid').length || 0} icon={<CheckCircle2 className="h-4 w-4" />} color="text-emerald-500" />
          <StatsCard title="Failed" count={orders?.filter((o:any) => o.status === 'cancelled').length || 0} icon={<XCircle className="h-4 w-4" />} color="text-red-500" />
        </div>

        <div className="glass-effect rounded-2xl border-none shadow-xl overflow-hidden">
          <div className="p-4 border-b border-border/10 flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-1/30">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by Order ID or email..." 
                className="pl-10 bg-surface-2 border-none focus-visible:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="glass-effect">
                <Filter className="h-4 w-4 mr-2" />
                Status
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-muted-foreground">Loading transactions...</div>
            ) : (
              <Table>
                <TableHeader className="bg-surface-1/50">
                  <TableRow>
                    <TableHead className="font-bold">Order ID</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="font-bold">Amount</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-surface-1/30 transition-colors">
                      <TableCell className="font-mono text-[10px] uppercase">
                        {order.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{order.customer_name || 'Anonymous'}</span>
                          <span className="text-xs text-muted-foreground">{order.customer_email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        ৳{order.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'paid' ? 'success' : 'outline'} className="text-[10px] uppercase">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-effect border-none shadow-2xl">
                            <DropdownMenuItem asChild>
                              <Link to={`/track-order`} search={{ orderId: order.id }}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Truck className="mr-2 h-4 w-4" /> Retry Fulfillment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatsCard({ title, count, icon, color }: any) {
  return (
    <Card className="glass-effect border-none shadow-md">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
            <h3 className={`text-2xl font-black ${color}`}>{count}</h3>
          </div>
          <div className="p-2 rounded-lg bg-surface-2">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getMarketplaceProducts } from '@/lib/products.functions';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Plus, 
  Edit, 
  MoreVertical, 
  Globe, 
  Eye, 
  AlertCircle,
  Package,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute('/super-admin/products')({
  component: SuperAdminProductsPage,
});

function SuperAdminProductsPage() {
  const fetchProducts = useServerFn(getMarketplaceProducts);

  const { data: result, isLoading } = useQuery({
    queryKey: ['super-admin-catalog'],
    queryFn: () => fetchProducts({ data: { limit: 100 } }),
  });

  const products = (result as any)?.products;

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Global Catalog</h1>
            <p className="text-muted-foreground">Enterprise oversight of all marketplace items</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="default" className="glass-effect" asChild>
              <Link to="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" /> New Product
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard title="Active Products" count={products?.length || 0} icon={<Package className="h-4 w-4" />} />
          <StatsCard title="Categories" count={new Set(products?.map(p => p.category)).size} icon={<Layers className="h-4 w-4" />} color="text-primary" />
          <StatsCard title="Total Inventory" count="9,999+" icon={<ArrowUpRight className="h-4 w-4" />} color="text-emerald-500" />
        </div>

        <div className="glass-effect rounded-2xl border-none shadow-xl overflow-hidden">
          <div className="p-4 border-b border-border/10 flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-1/30">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search catalog by name, SKU or slug..." 
                className="pl-10 bg-surface-2 border-none focus-visible:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="px-3 py-1 bg-surface-2 border-none text-[10px] uppercase font-bold">
                All Categories
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-muted-foreground">Synchronizing catalog...</div>
            ) : (
              <Table>
                <TableHeader className="bg-surface-1/50">
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-bold">Product</TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="font-bold">Price</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id} className="hover:bg-surface-1/30 transition-colors">
                      <TableCell>
                        <div className="h-10 w-10 rounded-lg bg-surface-2 flex items-center justify-center border border-border/10 overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground/30" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm flex items-center gap-2">
                            {product.name}
                            {product.is_featured && (
                              <Badge variant="default" className="text-[8px] px-1 uppercase">Featured</Badge>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">{product.sku || product.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase border-border/20">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        ৳{product.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_available ? 'success' : 'destructive'} className="text-[10px] uppercase">
                          {product.is_available ? 'Active' : 'Hidden'}
                        </Badge>
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
                              <Link to="/product/$productId" params={{ productId: product.id }}>
                                <Eye className="mr-2 h-4 w-4" /> View Live
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to="/admin/products/$productId" params={{ productId: product.id }}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <AlertCircle className="mr-2 h-4 w-4" /> Deactivate
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

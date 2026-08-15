import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Package, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute('/super-admin/products')({
  component: SuperAdminProductsPage,
});

function SuperAdminProductsPage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['super-admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Product Catalog</h1>
            <p className="text-muted-foreground">Manage inventory and marketplace availability</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="glass-effect" asChild>
              <Link to="/admin/settings">System Settings</Link>
            </Button>
            <Button variant="default" asChild>
              <Link to="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Product
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-effect border-none shadow-md">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Items</p>
              <h3 className="text-2xl font-black">{products?.length || 0}</h3>
            </CardContent>
          </Card>
          <Card className="glass-effect border-none shadow-md">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Active</p>
              <h3 className="text-2xl font-black text-emerald-500">{products?.filter(p => p.status === 'active').length || 0}</h3>
            </CardContent>
          </Card>
          <Card className="glass-effect border-none shadow-md">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Low Stock</p>
              <h3 className="text-2xl font-black text-amber-500">0</h3>
            </CardContent>
          </Card>
          <Card className="glass-effect border-none shadow-md">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Out of Stock</p>
              <h3 className="text-2xl font-black text-red-500">0</h3>
            </CardContent>
          </Card>
        </div>

        <div className="glass-effect rounded-2xl border-none shadow-xl overflow-hidden">
          <div className="p-4 border-b border-border/10 flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-1/30">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products by name or SKU..." 
                className="pl-10 bg-surface-2 border-none focus-visible:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="glass-effect">
                <Filter className="h-4 w-4 mr-2" />
                Categories
              </Button>
              <Button variant="outline" size="sm" className="glass-effect">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>

          <div className="divide-y divide-border/10">
            {isLoading ? (
              <div className="py-20 text-center text-muted-foreground">Synchronizing with catalog...</div>
            ) : products && products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-1/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-surface-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Package className="h-6 w-6 text-primary/60" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg tracking-tight">{product.name}</h3>
                        {product.is_featured && (
                          <Badge variant="default" className="text-[8px] px-1 uppercase">Featured</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <span className="bg-surface-2 px-1.5 py-0.5 rounded uppercase tracking-wider">{product.sku || 'NO-SKU'}</span>
                        <span>•</span>
                        <span className="uppercase">{(product.categories as any)?.name || 'General'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black tracking-tighter text-primary">৳{product.price.toLocaleString()}</span>
                      <Badge variant={product.status === 'active' ? 'success' : 'secondary'} className="text-[10px] py-0 mt-1 uppercase">
                        {product.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10 group-hover:text-primary transition-colors" asChild>
                        <Link to="/admin/products/$productId" params={{ productId: product.id }}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 glass-effect border-none shadow-2xl">
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" /> View on Store
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ChevronRight className="h-4 w-4 mr-2" /> View Inventory
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/10" />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Archive Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-border/10 m-4 rounded-3xl">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-10" />
                <p className="text-muted-foreground font-medium">Platform catalog is currently empty.</p>
                <Button variant="link" className="text-primary mt-2" asChild>
                  <Link to="/admin/products/new">Add your first product</Link>
                </Button>
              </div>
            )}
          </div>
          
          {products && products.length > 0 && (
             <div className="p-4 bg-surface-1/20 border-t border-border/10 text-center">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
                  View Archival History
                </Button>
             </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

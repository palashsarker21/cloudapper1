import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { Logo } from '@/components/marketplace/Logo';


export const Route = createFileRoute('/admin/products')({
  head: () => ({
    meta: [{ title: 'Product Management | Admin | CloudApper' }],
  }),
  component: AdminProductsPage,
});


function AdminProductsPage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
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
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Products</h1>
            <p className="text-muted-foreground">Add and edit products in your marketplace.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/settings">
                Settings
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/orders">
                Orders
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Products</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-20 text-center">Loading products...</div>
            ) : products && products.length > 0 ? (
              <div className="divide-y">
                {products.map((product) => (
                  <div key={product.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.sku || 'No SKU'} • {(product.categories as any)?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                      <span className="font-bold text-primary">BDT {product.price}</span>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to="/admin/products/$productId" params={{ productId: product.id }}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed rounded-xl">
                <Package className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">No products found. Start by adding your first product.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
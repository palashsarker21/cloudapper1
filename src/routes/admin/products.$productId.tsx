import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { ProductForm } from '@/components/admin/ProductForm';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/admin/products/$productId')({
  component: EditProductPage,
});

function EditProductPage() {
  const { productId } = Route.useParams();

  const { data: product, isLoading } = useQuery({
    queryKey: ['admin-product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ProductForm product={product} />
        )}
      </main>
      <Footer />
    </div>
  );
}
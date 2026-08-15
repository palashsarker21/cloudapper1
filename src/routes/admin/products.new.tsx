import { createFileRoute, redirect } from '@tanstack/react-router';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { ProductForm } from '@/components/admin/ProductForm';

export const Route = createFileRoute('/admin/products/new')({
  beforeLoad: ({ context }: any) => {
    if (!context.isAdmin) {
      throw redirect({ to: '/' });
    }
  },
  component: NewProductPage,
});

function NewProductPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Add New Product</h1>
        <ProductForm />
      </main>
      <Footer />
    </div>
  );
}
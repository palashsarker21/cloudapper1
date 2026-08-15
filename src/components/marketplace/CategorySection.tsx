import { 
  Bot, 
  CreditCard, 
  Globe, 
  Layers, 
  FileCode, 
  Layout, 
  MessageSquare, 
  Zap,
  ArrowRight
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  CreditCard,
  Bot,
  Wrench: Bot, // Fallback
  Chrome: Globe,
  Globe,
  Layers,
  Cloud: Layers, // Fallback
  FileCode,
  Package: FileCode, // Fallback
  Layout,
  MessageSquare,
  Zap
};

const categoryColors: Record<string, string> = {
  'AI Credits': "bg-primary/10 text-primary border-primary/20",
  'AI Tools': "bg-accent/10 text-accent border-accent/20",
  'Browser Extensions': "bg-amber-500/10 text-amber-500 border-amber-500/20",
  'Extensions': "bg-amber-500/10 text-amber-500 border-amber-500/20",
  'SaaS Products': "bg-green-500/10 text-green-500 border-green-500/20",
  'Digital Products': "bg-primary/10 text-primary border-primary/20",
  'Templates': "bg-accent/10 text-accent border-accent/20",
  'Prompts': "bg-amber-500/10 text-amber-500 border-amber-500/20",
  'Automation Tools': "bg-red-500/10 text-red-500 border-red-500/20",
};



export const CategorySection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  return (
    <section className="py-24 bg-surface-1">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Explore Categories
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Find exactly what you need to boost your productivity.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl border bg-background animate-pulse" />
            ))
          ) : (
            data?.map((category) => {
              const Icon = iconMap[category.icon || 'Bot'] || Bot;
              const colorClass = categoryColors[category.name] || "bg-gray-50 text-gray-600";
              return (
                <Link
                  key={category.id}
                  to="/category/$slug"
                  params={{ slug: category.slug }}
                  search={{ sort: 'newest', page: 1 }}
                  className="group flex flex-col items-center justify-center rounded-3xl border-2 border-transparent bg-surface-2 p-8 text-center transition-all hover:border-primary/20 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1"
                >
                  <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border-2 ${colorClass} transition-all group-hover:scale-110 shadow-sm group-hover:shadow-[var(--brand-glow)]`}>

                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

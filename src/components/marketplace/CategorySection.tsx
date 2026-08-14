import { 
  Bot, 
  CreditCard, 
  Globe, 
  Layers, 
  FileCode, 
  Layout, 
  MessageSquare, 
  Zap 
} from "lucide-react";
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
  'AI Credits': "bg-blue-50 text-blue-600",
  'AI Tools': "bg-purple-50 text-purple-600",
  'Browser Extensions': "bg-orange-50 text-orange-600",
  'SaaS Products': "bg-green-50 text-green-600",
  'Digital Products': "bg-pink-50 text-pink-600",
  'Templates': "bg-indigo-50 text-indigo-600",
  'Prompts': "bg-yellow-50 text-yellow-600",
  'Automation Tools': "bg-red-50 text-red-600",
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
    <section className="py-16 bg-muted/30">
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
                <a
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group flex flex-col items-center justify-center rounded-xl border bg-background p-6 text-center transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${colorClass} transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </a>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

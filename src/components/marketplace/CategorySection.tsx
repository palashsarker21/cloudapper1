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
  'AI Credits': "bg-blue-500/10 text-blue-400 border-blue-500/20",
  'AI Tools': "bg-purple-500/10 text-purple-400 border-purple-500/20",
  'Browser Extensions': "bg-orange-500/10 text-orange-400 border-orange-500/20",
  'SaaS Products': "bg-green-500/10 text-green-400 border-green-500/20",
  'Digital Products': "bg-pink-500/10 text-pink-400 border-pink-500/20",
  'Templates': "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  'Prompts': "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  'Automation Tools': "bg-red-500/10 text-red-400 border-red-500/20",
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
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${colorClass} transition-all group-hover:scale-110 shadow-sm`}>
                    <Icon className="h-7 w-7" />
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

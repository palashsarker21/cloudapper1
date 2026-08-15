import { 
  Bot, 
  CreditCard, 
  Globe, 
  Layers, 
  FileCode, 
  Layout, 
  Zap,
  Package,
  ArrowRight
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const enterpriseCategories = [
  {
    name: "AI Tools",
    slug: "ai-tools",
    icon: Bot,
    description: "Practical AI tools designed to help you build and work faster."
  },
  {
    name: "AI Credits",
    slug: "ai-credits",
    icon: CreditCard,
    description: "Manage and purchase credits for leading AI services."
  },
  {
    name: "Extensions",
    slug: "extensions",
    icon: Globe,
    description: "Browser extensions to enhance your creative workflow."
  },
  {
    name: "SaaS & Software",
    slug: "saas-products",
    icon: Layout,
    description: "Professional software solutions and SaaS products."
  },
  {
    name: "Digital Products",
    slug: "digital-products",
    icon: Package,
    description: "Verified digital assets, resources and downloads."
  },
  {
    name: "Templates & Resources",
    slug: "templates",
    icon: FileCode,
    description: "Ready-to-use templates for modern teams."
  }
];

export const CategorySection = () => {
  return (
    <section className="py-24 bg-surface-1">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Explore the CloudApper Marketplace
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Find practical AI tools, credits and digital products designed to help you build, create and work faster.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enterpriseCategories.map((category) => (
            <Link
              key={category.slug}
              to="/category/$slug"
              params={{ slug: category.slug }}
              search={{ sort: 'newest', page: 1 }}
              className="group relative flex flex-col p-8 rounded-3xl bg-surface-2 border border-border/50 hover:border-primary/20 transition-all hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <category.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {category.description}
              </p>
              <div className="mt-auto flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Explore {category.name}
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

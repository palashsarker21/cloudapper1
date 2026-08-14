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

const categories = [
  { name: "AI Credits", icon: CreditCard, color: "bg-blue-50 text-blue-600" },
  { name: "AI Tools", icon: Bot, color: "bg-purple-50 text-purple-600" },
  { name: "Browser Extensions", icon: Globe, color: "bg-orange-50 text-orange-600" },
  { name: "SaaS Products", icon: Layers, color: "bg-green-50 text-green-600" },
  { name: "Digital Products", icon: FileCode, color: "bg-pink-50 text-pink-600" },
  { name: "Templates", icon: Layout, color: "bg-indigo-50 text-indigo-600" },
  { name: "Prompts", icon: MessageSquare, color: "bg-yellow-50 text-yellow-600" },
  { name: "Automation Tools", icon: Zap, color: "bg-red-50 text-red-600" },
];

export const CategorySection = () => {
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
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <a
                key={category.name}
                href="#"
                className="group flex flex-col items-center justify-center rounded-xl border bg-background p-6 text-center transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${category.color} transition-transform group-hover:scale-110`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

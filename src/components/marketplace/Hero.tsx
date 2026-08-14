import { Button } from "@/components/ui/button";
import { ArrowRight, PackageSearch, CreditCard } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-32">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2" />
            New: GPT-4o Credits available now
          </div>
          
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            AI Tools, Credits & <span className="text-primary">Digital Products</span> — All in One Place
          </h1>
          
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Discover useful AI tools, software products and digital resources with fast and secure delivery. The ultimate marketplace for the modern developer and creator.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Button size="lg" className="h-12 px-8 text-base">
              Explore Marketplace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base">
              <PackageSearch className="mr-2 h-4 w-4" />
              Track Order
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8 w-full max-w-4xl">
            {[
              { label: "Fast Delivery", icon: "⚡" },
              { label: "Secure Payments", icon: "🔒" },
              { label: "Verified Products", icon: "✅" },
              { label: "24/7 Support", icon: "💬" },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="text-lg">{feature.icon}</span>
                {feature.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

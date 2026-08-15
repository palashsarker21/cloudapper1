import { Button } from "@/components/ui/button";
import { ArrowRight, PackageSearch } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";



export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-surface-0 py-20 sm:py-32">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[120px]" />
      </div>


      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2" />
            New: GPT-4o Credits available now
          </div>
          
          <Logo variant="icon" className="h-24 w-24 mb-8 drop-shadow-[0_0_30px_rgba(var(--primary),0.3)] animate-float" />
          
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            AI Tools, Credits & <span className="bg-clip-text text-transparent bg-[var(--brand-gradient)]">Digital Products</span> — All in One Place
          </h1>

          
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Discover useful AI tools, software products and digital resources with fast and secure delivery. The ultimate marketplace for the modern developer and creator.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link to="/">
                Explore Marketplace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
              <Link to="/track-order" search={{ orderId: undefined }}>
                <PackageSearch className="mr-2 h-4 w-4" />
                Track Order
              </Link>
            </Button>
          </div>

          <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8 w-full max-w-5xl">
            {[
              { label: "Fast Delivery", icon: "⚡", color: "text-primary" },
              { label: "Secure Payments", icon: "🔒", color: "text-accent" },
              { label: "Verified Products", icon: "✅", color: "text-green-500" },
              { label: "24/7 Support", icon: "💬", color: "text-primary" },
            ].map((feature) => (
              <div key={feature.label} className="flex flex-col items-center justify-center p-6 rounded-3xl bg-surface-1 border-2 border-transparent hover:border-primary/10 transition-all group">
                <span className={cn("text-3xl mb-3 transform transition-transform group-hover:scale-110", feature.color)}>{feature.icon}</span>
                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{feature.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

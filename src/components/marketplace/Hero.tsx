import { Button } from "@/components/ui/button";
import { ArrowRight, PackageSearch, ShieldCheck, Zap, CheckCircle2, Headphones } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

export const Hero = () => {
  const { t } = useLanguage();
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
            {t.nav.marketplace}
          </div>
          
          <Logo variant="icon" className="h-24 w-24 mb-8 drop-shadow-[0_0_30px_rgba(var(--primary),0.3)] animate-float" />
          
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {t.home.heroTitle}
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {t.home.heroSub}
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link to="/search" search={{ sort: 'newest', page: 1 }}>
                {t.common.exploreMarketplace}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
              <Link to="/track-order" search={{ orderId: undefined }}>
                <PackageSearch className="mr-2 h-4 w-4" />
                {t.nav.trackOrder}
              </Link>
            </Button>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Verified Products</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span>Reliable Fulfillment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Headphones className="h-4 w-4 text-primary" />
              <span>Customer Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

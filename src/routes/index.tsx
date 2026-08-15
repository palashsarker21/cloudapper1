import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/marketplace/Header";
import { Hero } from "@/components/marketplace/Hero";
import { CategorySection } from "@/components/marketplace/CategorySection";
import { FeaturedProducts } from "@/components/marketplace/FeaturedProducts";
import { ProcessSection } from "@/components/marketplace/ProcessSection";
import { Footer } from "@/components/marketplace/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "CloudApper — AI Tools, Credits & Digital Products" },
      { 
        name: "description", 
        content: "Discover AI tools, credits, extensions, software and digital products through CloudApper, a secure marketplace for modern creators, developers and teams." 
      },
      { property: "og:title", content: "CloudApper — AI Tools, Credits & Digital Products" },
      { property: "og:description", content: "Discover AI tools, credits, extensions, software and digital products through CloudApper, a secure marketplace for modern creators, developers and teams." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://cloudapper.online/" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://cloudapper.online/brand/og-image.png" },
      { name: "twitter:image", content: "https://cloudapper.online/brand/og-image.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "CloudApper",
          "url": "https://cloudapper.online",
          "logo": "https://cloudapper.online/brand/cloudapper-logo.png"
        }),
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-surface-0 text-foreground">
      <Header />
      <main>
        <Hero />
        <CategorySection />
        <FeaturedProducts />
        <ProcessSection />
        {/* Additional Sections */}
        <TrustSection />
        <ProductDiscoverySection />
        <OrderTrackingCTA />
        <AccountBenefitsSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

const TrustSection = () => (
  <section className="py-24 bg-surface-1">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Designed for secure digital commerce</h2>
      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-8">
        {[
          "Secure account access",
          "Controlled payment verification",
          "Server-side validation",
          "Protected customer orders",
          "Authorized license delivery",
          "Audit-ready fulfillment workflow"
        ].map((item) => (
          <div key={item} className="p-6 bg-surface-2 rounded-2xl border border-border/50">
            <p className="font-medium text-foreground">{item}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ProductDiscoverySection = () => (
  <section className="py-24 bg-surface-0">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold tracking-tight text-foreground text-center mb-16">Built for builders, creators and modern teams</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { title: "For Developers", desc: "AI tools, extensions, credits and software resources for building faster." },
          { title: "For Creators", desc: "Digital products, templates and productivity resources for creative workflows." },
          { title: "For Teams", desc: "Practical software and digital solutions for modern business workflows." }
        ].map((item) => (
          <div key={item.title} className="p-8 bg-surface-1 rounded-3xl border border-border">
            <h3 className="text-xl font-bold text-foreground mb-4">{item.title}</h3>
            <p className="text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const OrderTrackingCTA = () => (
  <section className="py-24 bg-surface-1">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Already placed an order?</h2>
      <p className="text-lg text-muted-foreground mb-8">Track payment verification, fulfillment and delivery status from one place.</p>
      <div className="flex justify-center gap-4">
        <Button asChild size="lg"><Link to="/track-order">Track Order</Link></Button>
        <Button variant="outline" asChild size="lg"><Link to="/login">Sign In</Link></Button>
      </div>
    </div>
  </section>
);

const AccountBenefitsSection = () => (
  <section className="py-24 bg-surface-0">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Your CloudApper account</h2>
      <p className="text-lg text-muted-foreground mb-12">Manage everything from your orders and license keys to fulfillment statuses.</p>
      <Button asChild size="lg"><Link to="/account/orders">View My Orders</Link></Button>
    </div>
  </section>
);

const FinalCTA = () => (
  <section className="py-24 bg-surface-2 border-t border-border">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Find your next digital tool.</h2>
      <p className="text-lg text-muted-foreground mb-8">Explore AI tools, credits, extensions and digital products in one marketplace.</p>
      <div className="flex justify-center gap-4">
        <Button asChild size="lg"><Link to="/search">Explore Marketplace</Link></Button>
        <Button variant="outline" asChild size="lg"><Link to="/track-order">Track Order</Link></Button>
      </div>
    </div>
  </section>
);

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
      { title: "CloudApper | AI Tools & Digital Products Marketplace" },
      { 
        name: "description", 
        content: "Discover useful AI tools, software products and digital resources with fast and secure delivery. All-in-one place for credits, extensions, and SaaS tools." 
      },
      { property: "og:title", content: "CloudApper | AI Tools & Digital Products Marketplace" },
      { property: "og:description", content: "AI Tools, Credits & Digital Products — All in One Place" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-surface-0 text-foreground selection:bg-primary/20 selection:text-primary">
      <Header />
      <main>
        <Hero />
        <CategorySection />
        <FeaturedProducts />
        <ProcessSection />
      </main>
      <Footer />
    </div>
  );
}

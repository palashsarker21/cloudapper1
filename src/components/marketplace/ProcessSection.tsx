import { 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Clock,
  ArrowRight
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Verified Products",
    description: "Products are reviewed before being made available through the marketplace.",
    icon: CheckCircle2,
  },
  {
    title: "Secure Checkout",
    description: "Payment and order information are handled through a controlled checkout and verification workflow.",
    icon: ShieldCheck,
  },
  {
    title: "Reliable Fulfillment",
    description: "Approved purchases move through a controlled fulfillment process designed to deliver securely.",
    icon: Zap,
  },
  {
    title: "Transparent Order Tracking",
    description: "Track payment verification, fulfillment and delivery status from your account.",
    icon: Clock,
  },
];

const steps = [
  {
    id: "01",
    title: "Discover",
    description: "Find AI tools, credits, extensions and digital products.",
  },
  {
    id: "02",
    title: "Choose",
    description: "Review the product, package, pricing and available delivery method.",
  },
  {
    id: "03",
    title: "Checkout",
    description: "Submit your order and complete the available payment process.",
  },
  {
    id: "04",
    title: "Verification",
    description: "For manual payment methods, information is reviewed before fulfillment.",
  },
  {
    id: "05",
    title: "Fulfillment",
    description: "Once approved, your order moves through the secure fulfillment workflow.",
  },
  {
    id: "06",
    title: "Access",
    description: "Retrieve your purchased product or license from your CloudApper account.",
  },
];

export const ProcessSection = () => {
  return (
    <section className="py-24 bg-surface-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Why CloudApper */}
        <div className="mb-32 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why teams choose CloudApper
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center p-8 rounded-3xl bg-surface-1 border border-border/50 hover:border-primary/20 transition-all">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            From discovery to delivery
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => (
              <div key={step.id} className="relative flex flex-col items-center p-8 rounded-3xl bg-surface-1 border border-border/50 hover:border-primary/20 transition-all text-center">
                <div className="absolute top-4 right-6 text-4xl font-black text-primary/5 select-none">
                  {step.id}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

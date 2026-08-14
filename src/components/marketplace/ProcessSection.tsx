import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    title: "Choose product",
    description: "Browse our extensive marketplace of AI tools and digital products.",
    icon: "1",
  },
  {
    title: "Checkout",
    description: "Add items to your cart and proceed to our secure checkout process.",
    icon: "2",
  },
  {
    title: "Payment",
    description: "Pay securely using your preferred payment method.",
    icon: "3",
  },
  {
    title: "Receive product",
    description: "Get instant access or delivery details for your purchase.",
    icon: "4",
  },
];

const features = [
  {
    title: "Fast delivery",
    description: "Get your digital assets instantly after purchase confirmation.",
  },
  {
    title: "Secure checkout",
    description: "Industry-standard encryption protects your financial data.",
  },
  {
    title: "Verified products",
    description: "Every listing is manually reviewed for quality and safety.",
  },
  {
    title: "Customer support",
    description: "24/7 dedicated support team to assist with any inquiries.",
  },
];

export const ProcessSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Why CloudApper */}
        <div className="mb-24 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Choose CloudApper?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We provide a seamless experience for acquiring the best digital tools in the industry.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="aspect-square rounded-2xl bg-muted overflow-hidden">
               <img 
                 src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800" 
                 alt="Digital World"
                 className="h-full w-full object-cover opacity-80"
               />
            </div>
            <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-2xl bg-primary p-6 text-primary-foreground shadow-xl">
               <div className="text-4xl font-bold italic">10k+</div>
               <div className="text-xs font-medium uppercase tracking-wider opacity-90">Happy Users</div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <div className="mt-16 grid gap-8 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute top-8 left-[60%] hidden w-full border-t border-dashed border-muted-foreground/30 md:block" />
                )}
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background text-xl font-bold text-primary">
                  {step.icon}
                </div>
                <h3 className="mt-6 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { Header } from "@/components/marketplace/Header";
import { Footer } from "@/components/marketplace/Footer";
import { cn } from "@/lib/utils";
import { Settings, CreditCard, Shield, Globe } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsLayout,
});

function AdminSettingsLayout() {
  const location = useLocation();

  const sidebarLinks = [
    { label: "Payment Infrastructure", href: "/admin/settings/payments", icon: CreditCard },
    { label: "Security & Access", href: "/admin/settings", icon: Shield },
    { label: "General Settings", href: "/admin/settings/", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <div className="flex-grow container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-2">
            <h2 className="text-xl font-bold px-4 mb-4">Settings</h2>
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    to={link.href as any}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

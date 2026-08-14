import { Link } from "@tanstack/react-router";
import { Mail, Globe, MessageSquare, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/20">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link to="/" className="text-2xl font-bold text-primary">
              CloudApper
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              The premier marketplace for AI tools, digital credits, and professional software resources. Elevate your productivity today.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageSquare className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Info className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <ShieldCheck className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Marketplace</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary">AI Tools</Link></li>
              <li><Link to="/" className="hover:text-primary">Credits</Link></li>
              <li><Link to="/" className="hover:text-primary">Extensions</Link></li>
              <li><Link to="/" className="hover:text-primary">Digital Products</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Company</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary">Pricing</Link></li>
              <li><Link to="/" className="hover:text-primary">Support</Link></li>
              <li><Link to="/" className="hover:text-primary">About Us</Link></li>
              <li><Link to="/" className="hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Newsletter</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Get the latest updates on new tools and special offers.
            </p>
            <form className="mt-4 flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-background"
              />
              <Button type="submit" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} CloudApper. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

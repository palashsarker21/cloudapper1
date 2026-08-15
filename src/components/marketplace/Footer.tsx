import { Link } from "@tanstack/react-router";
import { Mail, Globe, MessageSquare, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { brand } from "@/lib/brand";


export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-surface-1">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link to="/">
              <Logo />
            </Link>

            <p className="mt-4 text-sm text-muted-foreground font-medium">
              AI Tools, Credits & Digital Products
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Discover trusted AI tools, software resources, and digital products through CloudApper, a secure marketplace for modern creators and developers.
            </p>
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Official Channels</p>
              <SocialLinks iconOnly />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Connect</h3>
            <div className="mt-4">
              <SocialLinks />
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/search" search={{ sort: 'newest', page: 1 }} className="hover:text-primary">AI Tools</Link></li>
              <li><Link to="/category/$slug" params={{ slug: 'ai-credits' }} search={{ sort: 'newest', page: 1 }} className="hover:text-primary">AI Credits</Link></li>
              <li><Link to="/category/$slug" params={{ slug: 'extensions' }} search={{ sort: 'newest', page: 1 }} className="hover:text-primary">Extensions</Link></li>
              <li><Link to="/category/$slug" params={{ slug: 'saas-products' }} search={{ sort: 'newest', page: 1 }} className="hover:text-primary">SaaS & Software</Link></li>
              <li><Link to="/category/$slug" params={{ slug: 'digital-products' }} search={{ sort: 'newest', page: 1 }} className="hover:text-primary">Digital Products</Link></li>
              <li><Link to="/category/$slug" params={{ slug: 'templates' }} search={{ sort: 'newest', page: 1 }} className="hover:text-primary">Templates & Resources</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Company</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/login" className="hover:text-primary">About</Link></li>
              <li><Link to="/login" className="hover:text-primary">Contact</Link></li>
              <li><Link to="/login" className="hover:text-primary">Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Customer</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/login" className="hover:text-primary">My Orders</Link></li>
              <li><Link to="/track-order" search={{ orderId: undefined }} className="hover:text-primary">Track Order</Link></li>
              <li><Link to="/login" className="hover:text-primary">Account</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/login" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link to="/login" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/login" className="hover:text-primary">Refund Policy</Link></li>
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

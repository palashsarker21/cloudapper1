import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();


  const navLinks = [
    { label: "Marketplace", href: "/" },
    { label: "AI Tools", href: "/" },
    { label: "Credits", href: "/" },
    { label: "Extensions", href: "/" },
    { label: "Digital Products", href: "/" },
    { label: "Track Order", href: "/track-order" },
    { label: "Pricing", href: "/" },
    { label: "Support", href: "/" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-primary">CloudApper</span>
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                {navLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <Link to={link.href as any} className={navigationMenuTriggerStyle()}>
                      {link.label}
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 bg-muted/50 focus-visible:bg-background transition-colors"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button variant="default" className="hidden sm:flex" asChild>
              <Link to="/login">
                <User className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t bg-background p-4 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-3">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 bg-muted/50"
              />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href as any}
                className="text-sm font-medium transition-colors hover:text-primary px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button variant="default" className="w-full mt-4" asChild>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <User className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

import { Link } from "@tanstack/react-router";
import { ShoppingCart, User, Menu, X, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { MarketplaceSearchBar } from "./MarketplaceSearchBar";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getUserNotifications } from "@/lib/notifications.functions";
import { supabase } from "@/integrations/supabase/client";


export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const fetchNotifications = useServerFn(getUserNotifications);
  
  const { data: notifications, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(),
    enabled: false, // Will enable manually based on session
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) refetch();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') refetch();
    });

    return () => subscription.unsubscribe();
  }, [refetch]);

  const unreadCount = (notifications as any[])?.filter((n: any) => !n.read).length || 0;


  const navLinks = [
    { label: "Marketplace", href: "/search", search: { sort: 'newest', page: 1 } },
    { label: "AI Tools", href: "/category/$slug", params: { slug: 'ai-tools' }, search: { sort: 'newest', page: 1 } },
    { label: "Extensions", href: "/category/$slug", params: { slug: 'extensions' }, search: { sort: 'newest', page: 1 } },
    { label: "Track Order", href: "/track-order", search: { orderId: undefined } },
    { label: "Admin", children: [
      { label: "Fulfillment", href: "/admin/fulfillment" },
      { label: "Payments", href: "/admin/settings/payments" },
      { label: "Products", href: "/admin/products" },
      { label: "Orders", href: "/admin/orders" },
    ]},
    { label: "Support", href: "/" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-surface-1/95 backdrop-blur supports-[backdrop-filter]:bg-surface-1/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">

          <div className="flex items-center gap-2">
            <Link to="/">
              <Logo />
            </Link>
          </div>


          <div className="hidden lg:flex flex-1 items-center justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                {navLinks.map((link) => (
                  <NavigationMenuItem key={link.label}>
                    {link.children ? (
                      <>
                        <NavigationMenuTrigger>{link.label}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[200px] gap-2 p-4">
                            {link.children.map((child) => (
                              <li key={child.href}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    to={child.href as any}
                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  >
                                    <div className="text-sm font-medium leading-none">{child.label}</div>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <Link
                        to={link.href as any}
                        params={(link as any).params}
                        search={(link as any).search}
                        className={navigationMenuTriggerStyle()}
                      >
                        {link.label}
                      </Link>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-2">
            <MarketplaceSearchBar className="hidden md:block w-48 lg:w-64" />
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/account/notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-primary animate-pulse" variant="default">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/checkout">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]" variant="destructive">
                    {itemCount}
                  </Badge>
                )}
              </Link>
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
            <div className="mb-4">
              <MarketplaceSearchBar />
            </div>
            {navLinks.map((link) => (
              <div key={link.label} className="flex flex-col space-y-2">
                {link.children ? (
                  <>
                    <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {link.label}
                    </div>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href as any}
                        className="text-sm font-medium transition-colors hover:text-primary px-4 py-1"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link
                    to={link.href as any}
                    params={(link as any).params}
                    search={(link as any).search}
                    className="text-sm font-medium transition-colors hover:text-primary px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
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

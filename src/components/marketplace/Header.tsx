import { Link } from "@tanstack/react-router";
import { ShoppingCart, User, Menu, X, Bell, Shield, Package, ShoppingBag, Truck, CreditCard, Settings, Users, History, DollarSign, Zap, MessageCircle, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { MarketplaceSearchBar } from "./MarketplaceSearchBar";
import { useLanguage } from "@/hooks/useLanguage";
import { brand } from "@/lib/brand";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const { data: notifications, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(),
    enabled: false,
  });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        refetch();
        
        // Check roles
        const { data: isSA } = await supabase.rpc('has_role' as any, {
          _user_id: session.user.id,
          _role: 'super_admin'
        });
        const { data: isA } = await supabase.rpc('has_role' as any, {
          _user_id: session.user.id,
          _role: 'admin'
        });
        
        setIsSuperAdmin(!!isSA);
        setIsAdmin(!!isA || !!isSA);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') refetch();
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [refetch]);

  const unreadCount = (notifications as any[])?.filter((n: any) => !n.read).length || 0;

  const { t, language, setLanguage } = useLanguage();

  const navLinks = [
    { label: t.nav.marketplace, href: "/search", search: { sort: 'newest', page: 1 } },
    { label: t.nav.aiTools, href: "/category/$slug", params: { slug: 'ai-tools' }, search: { sort: 'newest', page: 1 } },
    { label: t.nav.aiCredits, href: "/category/$slug", params: { slug: 'ai-credits' }, search: { sort: 'newest', page: 1 } },
    { label: t.nav.extensions, href: "/category/$slug", params: { slug: 'extensions' }, search: { sort: 'newest', page: 1 } },
    { label: t.nav.digitalProducts, href: "/category/$slug", params: { slug: 'digital-products' }, search: { sort: 'newest', page: 1 } },
    { label: t.nav.trackOrder, href: "/track-order", search: { orderId: undefined } },
    { label: "WhatsApp Support", href: "https://wa.me/8801557749217", external: true },
    { label: "Facebook Page", href: brand.social.facebook.url, external: true },
    { label: t.nav.support, href: "/login" },
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
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <Link to="/search" search={{ sort: 'newest', page: 1 }} className={navigationMenuTriggerStyle()}>
                    Marketplace
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50">Products</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] glass-effect border-none shadow-2xl">
                      {[
                        { title: "AI Tools", slug: "ai-tools", desc: "Practical AI solutions for creators." },
                        { title: "AI Credits", slug: "ai-credits", desc: "Credits for top-tier AI models." },
                        { title: "Extensions", slug: "extensions", desc: "Powerful browser enhancements." },
                        { title: "Digital Products", slug: "digital-products", desc: "Ready-to-use digital assets." },
                        { title: "SaaS & Software", slug: "saas-products", desc: "Enterprise software solutions." },
                        { title: "Templates", slug: "templates", desc: "Custom templates and resources." }
                      ].map((item) => (
                        <li key={item.slug}>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/category/$slug"
                              params={{ slug: item.slug }}
                              search={{ sort: 'newest', page: 1 }}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-bold leading-none text-primary">{item.title}</div>
                              <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                                {item.desc}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/track-order" search={{ orderId: undefined }} className={navigationMenuTriggerStyle()}>
                    Track Order
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/login" className={navigationMenuTriggerStyle()}>
                    Support
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-2">
            <MarketplaceSearchBar className="hidden md:block w-48 lg:w-64" />
            
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden xl:flex text-xs font-bold uppercase tracking-widest text-primary hover:text-primary animate-pulse">
                    <Shield className="mr-2 h-3 w-3" /> Control
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass-effect border-none shadow-2xl mt-2" align="end">
                  <div className="px-2 py-2 text-[10px] font-black uppercase tracking-widest text-primary/70">
                    Admin Tools
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/products" className="w-full flex items-center">
                      <Package className="mr-2 h-4 w-4" /> Products
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/orders" className="w-full flex items-center">
                      <ShoppingBag className="mr-2 h-4 w-4" /> Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/fulfillment" className="w-full flex items-center">
                      <Truck className="mr-2 h-4 w-4" /> Fulfillment
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/settings" className="w-full flex items-center">
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>

                  {isSuperAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-border/10" />
                      <div className="px-2 py-2 text-[10px] font-black uppercase tracking-widest text-destructive/70">
                        God Mode
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to="/super-admin" className="w-full flex items-center text-destructive focus:text-destructive">
                          <Shield className="mr-2 h-4 w-4" /> Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/super-admin/users" className="w-full flex items-center">
                          <Users className="mr-2 h-4 w-4" /> Users
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/super-admin/payments" className="w-full flex items-center">
                          <DollarSign className="mr-2 h-4 w-4" /> Payments
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/super-admin/audit-logs" className="w-full flex items-center">
                          <History className="mr-2 h-4 w-4" /> Logs
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
                    <a href="https://wa.me/8801557749217" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-5 w-5 text-[#25D366]" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>WhatsApp Support</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

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
            <div className="hidden sm:flex items-center gap-1 border-x px-2 h-10">
              <Button 
                variant={language === 'en' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-7 px-2 text-[10px]"
                onClick={() => setLanguage('en')}
              >
                EN
              </Button>
              <Button 
                variant={language === 'bn' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-7 px-2 text-[10px]"
                onClick={() => setLanguage('bn')}
              >
                বাংলা
              </Button>
            </div>
            
            <Button variant="default" className="hidden sm:flex" asChild>
              <Link to="/login">
                <User className="mr-2 h-4 w-4" />
                {t.nav.login}
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
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium transition-colors hover:text-primary px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
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

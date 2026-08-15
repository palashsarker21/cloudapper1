import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getMyLicenses, getLicenseKey } from '@/lib/licenses.functions';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Copy, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  Clock,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export const Route = createFileRoute('/_authenticated/account/entitlements')({
  component: EntitlementsPage,
});

function EntitlementsPage() {
  const fetchLicenses = useServerFn(getMyLicenses);
  
  const { data: licenses, isLoading } = useQuery({
    queryKey: ['my-licenses'],
    queryFn: () => fetchLicenses(),
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <Header />
      <main className="flex-grow container max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            {language === 'bn' ? 'আমার প্রোডাক্ট লাইব্রেরি' : 'Product Library'}
          </h1>
          <p className="text-muted-foreground">{language === 'bn' ? 'আপনার লাইসেন্স, ডাউনলোড এবং অটোমেশন টুলস এখানে পাবেন' : 'Access your licenses, downloads, and automation tools'}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
          </div>
        ) : !licenses || licenses.length === 0 ? (
          <Card className="glass-effect border-none shadow-xl py-20 text-center">
            <CardContent>
              <Package className="h-16 w-16 mx-auto mb-4 opacity-10 text-primary" />
              <h2 className="text-xl font-bold mb-2">{language === 'bn' ? 'আপনার লাইব্রেরি খালি' : 'Your library is empty'}</h2>
              <p className="text-muted-foreground mb-8">{language === 'bn' ? 'প্রোডাক্ট কিনলে এখানে দেখা যাবে' : 'Purchase an extension or tool to see it here.'}</p>
              <Button asChild>
                <Link to="/">{language === 'bn' ? 'মার্কেটপ্লেস দেখুন' : 'Browse Marketplace'}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {licenses.map((license: any) => (
              <LicenseCard key={license.id} license={license} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function LicenseCard({ license }: { license: any }) {
  const fetchKey = useServerFn(getLicenseKey);
  const { language } = useLanguage();
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleReveal = async () => {
    if (revealedKey) {
      navigator.clipboard.writeText(revealedKey);
      toast.success("License key copied to clipboard");
      return;
    }

    setIsRevealing(true);
    try {
      const { key } = await fetchKey({ data: { licenseId: license.id } });
      setRevealedKey(key);
      navigator.clipboard.writeText(key);
      toast.success("License key revealed and copied");
    } catch (err: any) {
      toast.error("Failed to reveal license key");
    } finally {
      setIsRevealing(false);
    }
  };

  const isExpired = license.expires_at && new Date(license.expires_at) < new Date();

  return (
    <Card className="glass-effect border-none shadow-lg overflow-hidden flex flex-col h-full group">
      <div className="h-2 bg-gradient-to-r from-primary to-accent opacity-50" />
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-surface-2 border border-border/10 flex items-center justify-center shrink-0">
            {license.products?.image_url ? (
              <img src={license.products.image_url} alt="" className="h-full w-full object-cover rounded-xl" />
            ) : (
              <Key className="h-6 w-6 text-primary/40" />
            )}
          </div>
          <Badge variant={isExpired ? "destructive" : "outline"} className="text-[10px] uppercase">
            {isExpired ? (language === 'bn' ? 'মেয়াদ উত্তীর্ণ' : "Expired") : license.status}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-4 leading-tight">
          {language === 'bn' && license.products?.name_bn ? license.products.name_bn : license.products?.name}
        </CardTitle>
        <CardDescription className="text-xs font-mono">
          {license.plan} Plan • ID: {license.id.substring(0, 8)}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        {/* Key Display */}
        <div className="p-3 rounded-xl bg-surface-2 border border-border/5 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>License Key</span>
            {revealedKey ? (
              <span className="text-primary flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> SECURE
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> MASKED
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-grow font-mono text-sm tracking-tight truncate">
              {revealedKey ? revealedKey : `•••• •••• •••• ${license.license_key_last4}`}
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-primary hover:bg-primary/10"
              onClick={handleReveal}
              disabled={isRevealing}
            >
              {isRevealing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : revealedKey ? (
                <Copy className="h-4 w-4" />
              ) : (
                <Key className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Expiry / Info */}
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Expires: {license.expires_at ? format(new Date(license.expires_at), 'MMM d, yyyy') : 'Never'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span>Max Devices: {license.max_activations}</span>
          </div>
        </div>

        {license.products?.delivery_instructions && (
          <div className="text-[10px] text-muted-foreground bg-primary/5 p-2 rounded-lg border border-primary/10">
            <strong>Instructions:</strong> {license.products.delivery_instructions}
          </div>
        )}
      </CardContent>

      <div className="p-4 pt-0 mt-auto grid grid-cols-2 gap-3">
        <Button variant="outline" size="sm" className="text-xs h-9 glass-effect" asChild>
          <Link to="/track-order" search={{ orderId: license.order_id }}>
            Order Details
          </Link>
        </Button>
        <Button size="sm" className="text-xs h-9" asChild>
          <a href="https://io.eklas.dev" target="_blank" rel="noopener noreferrer">
            Setup App <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        </Button>
      </div>
    </Card>
  );
}

function Activity({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

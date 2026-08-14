import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Logo } from '@/components/marketplace/Logo';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Loader2, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';


export const Route = createFileRoute('/login')({
  head: () => ({
    title: 'Login | CloudApper',
    meta: [
      { name: 'description', content: 'Sign in to your CloudApper account to access your AI tools, credits, and digital products.' },
      { property: 'og:title', content: 'Login | CloudApper' },
      { property: 'og:description', content: 'Sign in to your CloudApper account.' },
      { name: 'twitter:card', content: 'summary' },
    ],

  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch() as { redirect?: string };
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate({ to: redirect || '/' as any });
      }
    });
  }, [navigate, redirect]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="mb-4 transform transition-transform hover:scale-105 active:scale-95">
            <Logo variant="full" className="h-14 w-auto drop-shadow-2xl" />
          </Link>


          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        <Card className="border-muted/60 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Login</CardTitle>
            <CardDescription>
              Choose your preferred sign in method
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full" disabled={isLoading} onClick={handleGoogleLogin}>
                <Mail className="mr-2 h-4 w-4" />
                Google
              </Button>

            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center justify-center gap-1">
              Don't have an account?{" "}
              <button 
                onClick={async () => {
                  if (validate()) {
                    setIsLoading(true);
                    const { error } = await supabase.auth.signUp({ email, password });
                    if (error) toast.error(error.message);
                    else toast.success("Check your email for confirmation link!");
                    setIsLoading(false);
                  }
                }}
                className="text-primary font-medium hover:underline"
              >
                Create an account
              </button>
            </div>
          </CardFooter>

        </Card>
        
        <p className="px-8 text-center text-xs text-muted-foreground leading-relaxed">
          By clicking continue, you agree to our{" "}
          <Link to="/" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

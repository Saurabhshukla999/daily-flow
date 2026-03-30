
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/db';
import { setAuthToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // Login using API
        const result = await api.login(email, password);
        if (result.error) {
          throw new Error(result.error);
        }
        setAuthToken(result.token);
        navigate('/dashboard');
      } else {
        // Signup using API
        const result = await api.signup(email, password);
        if (result.error) {
          throw new Error(result.error);
        }
        setAuthToken(result.token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    toast({ 
      title: 'Google Login', 
      description: 'Google OAuth is not available with Neon database. Please use email/password.',
      variant: 'destructive' 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-orbs" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Daily Task Tracker</h1>
          <p className="text-muted-foreground font-body">Build habits. Track progress. Stay consistent.</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-secondary border-border text-foreground"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-secondary border-border text-foreground"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90" disabled={loading}>
              {loading ? 'Loading...' : isLogin ? 'Sign in' : 'Sign up'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

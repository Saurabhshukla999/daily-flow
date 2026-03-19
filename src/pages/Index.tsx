import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-orbs" />
        <div className="animate-pulse text-muted-foreground font-body">Loading...</div>
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/auth" replace />;
}

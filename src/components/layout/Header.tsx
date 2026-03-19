import { useAuth } from '@/hooks/useAuth';
import { LogOut, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { user, signOut } = useAuth();
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <header className="flex items-center justify-between px-4 py-4 md:px-8 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-heading font-bold text-foreground">Task Tracker</h1>
          <p className="text-xs font-mono text-muted-foreground">{dateStr}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden md:block">{user?.email}</span>
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
          {user?.email?.charAt(0).toUpperCase()}
        </div>
        <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}

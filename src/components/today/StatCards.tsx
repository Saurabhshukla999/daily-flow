import { CheckCircle, ListTodo, Clock, Target } from 'lucide-react';

interface StatCardsProps {
  done: number;
  total: number;
  hoursLogged: number;
  targetHours: number;
}

export default function StatCards({ done, total, hoursLogged, targetHours }: StatCardsProps) {
  const stats = [
    { label: 'Done', value: done, icon: CheckCircle, color: 'text-primary' },
    { label: 'Total', value: total, icon: ListTodo, color: 'text-foreground' },
    { label: 'Hours', value: hoursLogged.toFixed(1), icon: Clock, color: 'text-accent' },
    { label: 'Target', value: targetHours.toFixed(1), icon: Target, color: 'text-accent-pink' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <s.icon className={`w-4 h-4 ${s.color}`} />
            <span className="text-xs font-mono text-muted-foreground">{s.label}</span>
          </div>
          <span className="text-2xl font-heading font-bold text-foreground">{s.value}</span>
        </div>
      ))}
    </div>
  );
}

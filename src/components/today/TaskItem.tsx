import { useState } from 'react';
import { Check, Clock } from 'lucide-react';
import { cn, DAY_NAMES } from '@/lib/utils';
import LogHoursModal from './LogHoursModal';

interface TaskItemProps {
  task: {
    id: string;
    text: string;
    hours_per_day: number | null;
    days: number[] | null;
  };
  checked: boolean;
  hoursLogged: number;
  onToggleCheck: (checked: boolean) => void;
  onLogHours: (hours: number) => void;
}

export default function TaskItem({ task, checked, hoursLogged, onToggleCheck, onLogHours }: TaskItemProps) {
  const [showModal, setShowModal] = useState(false);
  const targetHours = Number(task.hours_per_day) || 0;
  const progressPct = targetHours > 0 ? Math.min((hoursLogged / targetHours) * 100, 100) : 0;
  const days = task.days ?? [];
  const dayLabel = days.length === 0 ? 'Every day' : days.map(d => DAY_NAMES[d]).join(', ');

  return (
    <>
      <div className={cn(
        'bg-card border border-border rounded-lg p-4 animate-slide-in transition-all',
        checked && 'border-primary/30 bg-primary/5'
      )}>
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggleCheck(!checked)}
            className={cn(
              'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0',
              checked ? 'bg-primary border-primary' : 'border-muted-foreground/40 hover:border-primary'
            )}
          >
            {checked && <Check className="w-3 h-3 text-primary-foreground" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={cn(
                'font-body font-medium text-foreground truncate',
                checked && 'line-through opacity-60'
              )}>
                {task.text}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {targetHours > 0 && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent/15 text-accent">
                    {targetHours}h/day
                  </span>
                )}
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground hidden md:inline">
                  {dayLabel}
                </span>
              </div>
            </div>

            {targetHours > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1 text-xs font-mono text-accent hover:text-accent/80 transition-colors"
                >
                  <Clock className="w-3 h-3" />
                  {hoursLogged > 0 ? `${hoursLogged}h` : 'Log'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <LogHoursModal
        open={showModal}
        onClose={() => setShowModal(false)}
        taskName={task.text}
        currentHours={hoursLogged}
        targetHours={targetHours}
        onSubmit={onLogHours}
      />
    </>
  );
}

import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DayPillPicker from './DayPillPicker';
import { Trash2 } from 'lucide-react';
import { DAY_NAMES, isTaskScheduledForDay } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ScheduleView() {
  const { tasks, addTask, deleteTask } = useTasks();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('');
  const [days, setDays] = useState<number[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTask.mutate(
      { text: text.trim(), hours_per_day: parseFloat(hoursPerDay) || 0, days },
      {
        onSuccess: () => {
          setText('');
          setHoursPerDay('');
          setDays([]);
          toast({ title: 'Task added!' });
        },
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    );
  };

  const todayDow = new Date().getDay();

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Add Task Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4">Add New Task</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Task name..."
            value={text}
            onChange={e => setText(e.target.value)}
            className="bg-secondary border-border text-foreground"
            required
          />
          <div className="flex items-center gap-3">
            <Input
              type="number"
              step="0.5"
              min="0"
              placeholder="Hours/day (optional)"
              value={hoursPerDay}
              onChange={e => setHoursPerDay(e.target.value)}
              className="bg-secondary border-border text-foreground w-48"
            />
          </div>
          <DayPillPicker selectedDays={days} onChange={setDays} />
          <Button type="submit" className="bg-primary text-primary-foreground" disabled={addTask.isPending}>
            {addTask.isPending ? 'Adding...' : 'Add Task'}
          </Button>
        </form>
      </div>

      {/* All Tasks */}
      <div>
        <h3 className="font-heading font-semibold text-foreground mb-4">All Scheduled Tasks</h3>
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No tasks yet. Add one above!</p>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => {
              const taskDays = task.days ?? [];
              const dayLabel = taskDays.length === 0 ? 'Every day' : taskDays.map(d => DAY_NAMES[d]).join(', ');
              return (
                <div key={task.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between animate-slide-in">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-body text-foreground truncate">{task.text}</span>
                    {(Number(task.hours_per_day) || 0) > 0 && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent/15 text-accent flex-shrink-0">
                        {task.hours_per_day}h
                      </span>
                    )}
                    <span className="text-xs font-mono text-muted-foreground hidden md:inline flex-shrink-0">{dayLabel}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask.mutate(task.id)}
                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Week At a Glance */}
      <div>
        <h3 className="font-heading font-semibold text-foreground mb-4">Week at a Glance</h3>
        <div className="grid grid-cols-7 gap-2">
          {DAY_NAMES.map((name, i) => {
            const isToday = i === todayDow;
            const dayTasks = tasks.filter(t => isTaskScheduledForDay(t.days ?? [], i));
            return (
              <div
                key={i}
                className={`rounded-lg border p-3 min-h-[100px] ${
                  isToday ? 'border-primary bg-primary/5' : 'border-border bg-card'
                }`}
              >
                <span className={`text-xs font-mono block mb-2 ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  {isToday ? 'Today' : name}
                </span>
                <div className="space-y-1">
                  {dayTasks.slice(0, 4).map(t => (
                    <div key={t.id} className="text-xs font-body text-foreground truncate bg-secondary rounded px-1.5 py-0.5">
                      {t.text}
                    </div>
                  ))}
                  {dayTasks.length > 4 && (
                    <span className="text-xs text-muted-foreground">+{dayTasks.length - 4} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

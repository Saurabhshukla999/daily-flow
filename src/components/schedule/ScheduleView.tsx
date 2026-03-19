import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Edit2, Trash2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import DayPillPicker from './DayPillPicker';
import { DAY_NAMES, isTaskScheduledForDay, isTaskActive } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ScheduleView() {
  const { tasks, addTask, deleteTask, updateTask } = useTasks();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('');
  const [days, setDays] = useState<number[]>([]);
  const [endDate, setEndDate] = useState<Date | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTask.mutate(
      { 
        text: text.trim(), 
        hours_per_day: parseFloat(hoursPerDay) || 0, 
        days,
        end_date: endDate ? endDate.toISOString().split('T')[0] : undefined
      },
      {
        onSuccess: () => {
          setText('');
          setHoursPerDay('');
          setDays([]);
          setEndDate(undefined);
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
          <div className="space-y-2">
            <Label htmlFor="end-date" className="text-foreground">End Date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-secondary border-border text-foreground",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => date < addDays(new Date(), -1)}
                />
              </PopoverContent>
            </Popover>
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
              const taskEndDate = task.end_date ? new Date(task.end_date) : null;
              const isExpired = taskEndDate && taskEndDate < new Date();
              
              return (
                <div key={task.id} className={cn(
                  "bg-card border rounded-lg p-4 flex items-center justify-between animate-slide-in",
                  isExpired ? "border-muted-foreground/30 opacity-60" : "border-border"
                )}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn(
                      "font-body truncate",
                      isExpired ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {task.text}
                    </span>
                    {(Number(task.hours_per_day) || 0) > 0 && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent/15 text-accent flex-shrink-0">
                        {task.hours_per_day}h
                      </span>
                    )}
                    <span className="text-xs font-mono text-muted-foreground hidden md:inline flex-shrink-0">{dayLabel}</span>
                    {taskEndDate && (
                      <span className={cn(
                        "text-xs font-mono px-2 py-0.5 rounded flex-shrink-0",
                        isExpired 
                          ? "bg-destructive/15 text-destructive" 
                          : "bg-secondary text-muted-foreground"
                      )}>
                        Until {format(taskEndDate, "MMM d")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {taskEndDate && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newDate = prompt('Update end date (YYYY-MM-DD):', task.end_date!);
                          if (newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
                            updateTask.mutate({
                              taskId: task.id,
                              updates: { end_date: newDate }
                            });
                          }
                        }}
                        className="text-muted-foreground hover:text-foreground flex-shrink-0"
                        title="Change end date"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask.mutate(task.id)}
                      className="text-muted-foreground hover:text-destructive flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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
            const dayTasks = tasks.filter(t => 
              isTaskScheduledForDay(t.days ?? [], i) && 
              isTaskActive(t.end_date)
            );
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

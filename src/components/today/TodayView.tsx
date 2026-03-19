import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useLogs } from '@/hooks/useLogs';
import { useStats } from '@/hooks/useStats';
import { getTodayStr, getDayOfWeek, isTaskScheduledForDay, isTaskActive, getMotivationalMessage } from '@/lib/utils';
import ProgressRing from './ProgressRing';
import StatCards from './StatCards';
import TaskItem from './TaskItem';
import StreakBadge from './StreakBadge';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function TodayView() {
  const [todayStr, setTodayStr] = useState(getTodayStr());
  const { tasks } = useTasks();
  const { logs, upsertLog, resetChecks } = useLogs(todayStr);
  const { data: stats } = useStats('week', 'completion');

  // Midnight rollover
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        const newToday = getTodayStr();
        if (newToday !== todayStr) setTodayStr(newToday);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [todayStr]);

  const dayOfWeek = getDayOfWeek();
  const todayTasks = tasks.filter(t => 
    isTaskScheduledForDay(t.days ?? [], dayOfWeek) && 
    isTaskActive(t.end_date)
  );

  const logsMap = new Map(logs.map(l => [l.task_id, l]));
  const doneCount = todayTasks.filter(t => logsMap.get(t.id)?.checked).length;
  const totalCount = todayTasks.length;
  const pct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
  const hoursLogged = logs.reduce((s, l) => s + (Number(l.hours_logged) || 0), 0);
  const targetHours = todayTasks.reduce((s, t) => s + (Number(t.hours_per_day) || 0), 0);
  const motivational = getMotivationalMessage(pct);

  const handleToggle = (taskId: string, checked: boolean) => {
    const existing = logsMap.get(taskId);
    upsertLog.mutate({
      task_id: taskId,
      date: todayStr,
      checked,
      hours_logged: existing ? Number(existing.hours_logged) || 0 : 0,
    });
  };

  const handleLogHours = (taskId: string, hours: number) => {
    const existing = logsMap.get(taskId);
    upsertLog.mutate({
      task_id: taskId,
      date: todayStr,
      checked: existing?.checked ?? false,
      hours_logged: hours,
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col items-center text-center space-y-4">
        <StreakBadge streak={stats?.current_streak ?? 0} />
        <h2 className="text-3xl font-heading font-bold text-foreground">{motivational.heading}</h2>
        <p className="text-muted-foreground font-body">{motivational.message}</p>
        <ProgressRing percentage={pct} />
      </div>

      <StatCards done={doneCount} total={totalCount} hoursLogged={hoursLogged} targetHours={targetHours} />

      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-foreground">Today's Tasks</h3>
        {doneCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resetChecks.mutate()}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {todayTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground font-body">No tasks scheduled for today.</p>
          <p className="text-sm text-muted-foreground mt-1">Head to the Schedule tab to add some!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayTasks.map(task => (
            <TaskItem
              key={task.id}
              task={{ ...task, hours_per_day: task.hours_per_day ?? 0, days: task.days ?? [] }}
              checked={logsMap.get(task.id)?.checked ?? false}
              hoursLogged={Number(logsMap.get(task.id)?.hours_logged) || 0}
              onToggleCheck={checked => handleToggle(task.id, checked)}
              onLogHours={hours => handleLogHours(task.id, hours)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

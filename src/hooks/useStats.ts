import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getDateRange, getDaysInRange, MONTH_NAMES } from '@/lib/utils';
import type { Stats, HistoryEntry } from '@/lib/types';

export function useStats(period: 'week' | 'month' | 'year', metric: 'completion' | 'hours') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['stats', user?.id, period, metric],
    queryFn: async (): Promise<Stats> => {
      const { start, end } = getDateRange(period);

      // Fetch all logs in range
      const { data: logs, error } = await supabase
        .from('daily_logs')
        .select('*')
        .gte('date', start)
        .lte('date', end);
      if (error) throw error;

      // Fetch all active tasks to know total tasks per day
      const { data: tasks, error: te } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_active', true);
      if (te) throw te;

      const allDates = getDaysInRange(start, end);

      // Group logs by date
      const logsByDate = new Map<string, typeof logs>();
      for (const log of logs ?? []) {
        const arr = logsByDate.get(log.date) ?? [];
        arr.push(log);
        logsByDate.set(log.date, arr);
      }

      let entries: HistoryEntry[];

      if (period === 'year') {
        // Group by month
        const monthMap = new Map<number, { completions: number; totals: number; hours: number; count: number }>();
        for (const dateStr of allDates) {
          const d = new Date(dateStr + 'T00:00:00');
          const month = d.getMonth();
          const dayOfWeek = d.getDay();
          const dayLogs = logsByDate.get(dateStr) ?? [];
          const scheduledTasks = (tasks ?? []).filter(t => {
            const days = t.days ?? [];
            return days.length === 0 || days.includes(dayOfWeek);
          });
          const totalTasks = scheduledTasks.length;
          const checkedCount = dayLogs.filter(l => l.checked).length;
          const hoursSum = dayLogs.reduce((s, l) => s + (Number(l.hours_logged) || 0), 0);

          const existing = monthMap.get(month) ?? { completions: 0, totals: 0, hours: 0, count: 0 };
          existing.completions += checkedCount;
          existing.totals += totalTasks;
          existing.hours += hoursSum;
          existing.count += 1;
          monthMap.set(month, existing);
        }

        entries = Array.from(monthMap.entries()).map(([month, data]) => ({
          date: `2024-${String(month + 1).padStart(2, '0')}-01`,
          label: MONTH_NAMES[month],
          completion_pct: data.totals > 0 ? Math.round((data.completions / data.totals) * 100) : 0,
          hours: Math.round((data.hours / Math.max(data.count, 1)) * 10) / 10,
        }));
      } else {
        entries = allDates.map(dateStr => {
          const d = new Date(dateStr + 'T00:00:00');
          const dayOfWeek = d.getDay();
          const dayLogs = logsByDate.get(dateStr) ?? [];
          const scheduledTasks = (tasks ?? []).filter(t => {
            const days = t.days ?? [];
            return days.length === 0 || days.includes(dayOfWeek);
          });
          const totalTasks = scheduledTasks.length;
          const checkedCount = dayLogs.filter(l => l.checked).length;
          const hoursSum = dayLogs.reduce((s, l) => s + (Number(l.hours_logged) || 0), 0);
          const pct = totalTasks > 0 ? Math.round((checkedCount / totalTasks) * 100) : 0;

          const today = new Date().toISOString().split('T')[0];
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const label = dateStr === today ? 'Today' : dayNames[dayOfWeek];

          return { date: dateStr, label, completion_pct: pct, hours: hoursSum };
        });
      }

      // Calculate averages
      const last7 = allDates.slice(-7);
      const last30 = allDates.slice(-30);

      const calcAvg = (dates: string[]) => {
        let sum = 0, count = 0;
        for (const d of dates) {
          const dayLogs = logsByDate.get(d) ?? [];
          const dt = new Date(d + 'T00:00:00');
          const scheduledTasks = (tasks ?? []).filter(t => {
            const days = t.days ?? [];
            return days.length === 0 || days.includes(dt.getDay());
          });
          if (scheduledTasks.length > 0) {
            if (metric === 'completion') {
              const checked = dayLogs.filter(l => l.checked).length;
              sum += (checked / scheduledTasks.length) * 100;
            } else {
              sum += dayLogs.reduce((s, l) => s + (Number(l.hours_logged) || 0), 0);
            }
            count++;
          }
        }
        return count > 0 ? Math.round(sum / count) : 0;
      };

      // Best day
      let bestDay: { date: string; value: number } | null = null;
      for (const dateStr of allDates) {
        const dayLogs = logsByDate.get(dateStr) ?? [];
        const dt = new Date(dateStr + 'T00:00:00');
        const scheduledTasks = (tasks ?? []).filter(t => {
          const days = t.days ?? [];
          return days.length === 0 || days.includes(dt.getDay());
        });
        if (scheduledTasks.length === 0) continue;
        const val = metric === 'completion'
          ? Math.round((dayLogs.filter(l => l.checked).length / scheduledTasks.length) * 100)
          : dayLogs.reduce((s, l) => s + (Number(l.hours_logged) || 0), 0);
        if (!bestDay || val > bestDay.value) bestDay = { date: dateStr, value: val };
      }

      // Streak
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        const dayLogs = logsByDate.get(ds) ?? [];
        const scheduledTasks = (tasks ?? []).filter(t => {
          const days = t.days ?? [];
          return days.length === 0 || days.includes(d.getDay());
        });
        if (scheduledTasks.length === 0) continue;
        const pct = (dayLogs.filter(l => l.checked).length / scheduledTasks.length) * 100;
        if (pct >= 50) streak++;
        else break;
      }

      return {
        entries,
        avg_7d: calcAvg(last7),
        avg_30d: calcAvg(last30),
        best_day: bestDay,
        current_streak: streak,
      };
    },
    enabled: !!user,
  });
}

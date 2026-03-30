import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { query } from '@/lib/db';
import { useAuth } from './useAuth';

export function useLogs(date: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const logsQuery = useQuery({
    queryKey: ['logs', user?.id, date],
    queryFn: async () => {
      if (!user) return [];
      const result = await query(
        'SELECT * FROM daily_logs WHERE user_id = $1 AND date = $2',
        [user.id, date]
      );
      return result.rows;
    },
    enabled: !!user,
  });

  const upsertLog = useMutation({
    mutationFn: async (log: { task_id: string; date: string; checked?: boolean; hours_logged?: number }) => {
      if (!user) throw new Error('User not authenticated');
      const result = await query(`
        INSERT INTO daily_logs (user_id, task_id, date, checked, hours_logged)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, task_id, date)
        DO UPDATE SET checked = $4, hours_logged = $5
        RETURNING *
      `, [user.id, log.task_id, log.date, log.checked ?? false, log.hours_logged ?? 0]);
      return result.rows[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const resetChecks = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      await query('UPDATE daily_logs SET checked = false WHERE user_id = $1 AND date = $2', [user.id, date]);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['logs'] }),
  });

  return { logs: logsQuery.data ?? [], isLoading: logsQuery.isLoading, upsertLog, resetChecks };
}

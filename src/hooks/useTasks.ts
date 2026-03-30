import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { query } from '@/lib/db';
import { useAuth } from './useAuth';
import { TaskWithEndDate } from '@/types/task';
import { getCurrentUser } from '@/lib/auth';

export function useTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const result = await query(
        'SELECT * FROM tasks WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
        [user.id]
      );
      return result.rows;
    },
    enabled: !!user,
  });

  const addTask = useMutation({
    mutationFn: async (task: { text: string; hours_per_day: number; days: number[]; end_date?: string }) => {
      if (!user) throw new Error('User not authenticated');
      const result = await query(
        'INSERT INTO tasks (text, hours_per_day, days, end_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [task.text, task.hours_per_day, task.days, task.end_date, user.id]
      );
      return result.rows[0];
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const updateTask = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
      const values = Object.values(updates);
      const result = await query(
        `UPDATE tasks SET ${fields} WHERE id = $1 RETURNING *`,
        [taskId, ...values]
      );
      return result.rows[0];
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      await query('UPDATE tasks SET is_active = false WHERE id = $1', [taskId]);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return { tasks: (tasksQuery.data ?? []) as TaskWithEndDate[], isLoading: tasksQuery.isLoading, addTask, updateTask, deleteTask };
}

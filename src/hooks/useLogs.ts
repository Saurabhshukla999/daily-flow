import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useLogs(date: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const logsQuery = useQuery({
    queryKey: ['logs', user?.id, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('date', date);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const upsertLog = useMutation({
    mutationFn: async (log: { task_id: string; date: string; checked?: boolean; hours_logged?: number }) => {
      const { data, error } = await supabase
        .from('daily_logs')
        .upsert(
          { ...log, user_id: user!.id },
          { onConflict: 'user_id,task_id,date' }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const resetChecks = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('daily_logs')
        .update({ checked: false })
        .eq('date', date)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['logs'] }),
  });

  return { logs: logsQuery.data ?? [], isLoading: logsQuery.isLoading, upsertLog, resetChecks };
}

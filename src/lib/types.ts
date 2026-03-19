export interface Task {
  id: string;
  user_id: string;
  text: string;
  hours_per_day: number;
  days: number[]; // 0=Sun, 1=Mon...6=Sat, empty=everyday
  created_at: string;
  is_active: boolean;
}

export interface DailyLog {
  id: string;
  user_id: string;
  task_id: string;
  date: string;
  checked: boolean;
  hours_logged: number;
  created_at: string;
}

export interface HistoryEntry {
  date: string;
  label: string;
  completion_pct: number;
  hours: number;
}

export interface Stats {
  entries: HistoryEntry[];
  avg_7d: number;
  avg_30d: number;
  best_day: { date: string; value: number } | null;
  current_streak: number;
}

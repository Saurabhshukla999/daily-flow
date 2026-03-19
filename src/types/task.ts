// Extended task types with end_date field
export interface TaskWithEndDate {
  id: string;
  user_id: string;
  text: string;
  hours_per_day: number;
  days: number[];
  end_date?: string;
  created_at: string;
  is_active: boolean;
}

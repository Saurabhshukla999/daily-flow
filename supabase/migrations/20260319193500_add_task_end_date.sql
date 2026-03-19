-- Add end_date column to tasks table
ALTER TABLE public.tasks ADD COLUMN end_date DATE;

-- Add comment to describe the end_date column
COMMENT ON COLUMN public.tasks.end_date IS 'Optional end date for the task. Task will not be scheduled after this date.';

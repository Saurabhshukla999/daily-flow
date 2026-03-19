# Task Duration Feature - Setup Instructions

## What's Been Added

I've successfully implemented the task duration feature with the following capabilities:

### ✅ New Features:
1. **End Date Selection**: Users can now set an optional end date when creating tasks
2. **Visual Date Display**: Tasks show their end date in the schedule view
3. **Edit End Date**: Users can modify the end date of existing tasks
4. **Expired Task Handling**: Tasks automatically expire after their end date
5. **Smart Filtering**: Expired tasks are hidden from Today view and Week view

### ✅ UI Changes:
- **Task Creation Form**: Added date picker for end date selection
- **Task List**: Shows "Until [date]" badge for tasks with end dates
- **Edit Button**: Edit icon appears for tasks with end dates to modify them
- **Visual Indicators**: Expired tasks show with strikethrough and muted colors

## Database Setup Required

Before using the new feature, you need to run the database migration:

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this SQL command:
```sql
ALTER TABLE public.tasks ADD COLUMN end_date DATE;
COMMENT ON COLUMN public.tasks.end_date IS 'Optional end date for the task. Task will not be scheduled after this date.';
```

### Option 2: Using Supabase CLI
```bash
npx supabase db push
```

## How to Use the New Feature

### Creating a Task with End Date:
1. Go to **Schedule** tab
2. Fill in task details (name, hours/day, days)
3. Click the **"Pick a date"** button to select an end date
4. Choose your desired end date from the calendar
5. Click **"Add Task"**

### Changing an End Date:
1. In the Schedule view, find your task with an end date
2. Click the **edit icon** (pencil) next to the delete button
3. Enter the new date in YYYY-MM-DD format
4. Press Enter to save

### How Expired Tasks Work:
- Tasks with end dates are automatically hidden from Today view after the end date
- Week at a Glance also hides expired tasks
- Expired tasks appear with strikethrough in the full task list
- You can still edit or delete expired tasks

## Technical Implementation

### Files Modified:
- `src/hooks/useTasks.ts` - Added updateTask mutation and end_date support
- `src/components/schedule/ScheduleView.tsx` - Added date picker and edit functionality
- `src/components/today/TodayView.tsx` - Added expired task filtering
- `src/lib/utils.ts` - Added isTaskActive utility function
- `src/types/task.ts` - Extended task interface with end_date

### Database Schema:
```sql
ALTER TABLE public.tasks ADD COLUMN end_date DATE;
```

The feature is now ready to use once you run the database migration!

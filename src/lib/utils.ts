import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDayOfWeek(): number {
  return new Date().getDay();
}

export function isTaskScheduledForDay(days: number[], dayOfWeek: number): boolean {
  if (!days || days.length === 0) return true;
  return days.includes(dayOfWeek);
}

export function isTaskActive(endDate?: string): boolean {
  if (!endDate) return true; // No end date means task is ongoing
  return new Date(endDate) >= new Date(); // Task is active if end date is today or in the future
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

export function getDateRange(period: 'week' | 'month' | 'year'): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  if (period === 'week') start.setDate(end.getDate() - 6);
  else if (period === 'month') start.setDate(end.getDate() - 29);
  else start.setFullYear(end.getFullYear() - 1);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function getMotivationalMessage(pct: number): { heading: string; message: string } {
  if (pct === 0) return { heading: "Let's get started!", message: "Every journey begins with a single step." };
  if (pct < 25) return { heading: "Getting warmed up", message: "Keep the momentum going!" };
  if (pct < 50) return { heading: "Making progress", message: "You're building great habits." };
  if (pct < 75) return { heading: "On a roll!", message: "More than halfway there. Keep pushing!" };
  if (pct < 100) return { heading: "Almost there!", message: "Just a few more tasks to crush it." };
  return { heading: "Perfect day! 🔥", message: "You completed everything. Incredible!" };
}

export function getDaysInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const d = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');
  while (d <= endDate) {
    dates.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

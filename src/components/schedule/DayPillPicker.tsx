import { cn, DAY_NAMES } from '@/lib/utils';

interface DayPillPickerProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export default function DayPillPicker({ selectedDays, onChange }: DayPillPickerProps) {
  const isEveryDay = selectedDays.length === 0;

  const toggleEveryDay = () => onChange([]);

  const toggleDay = (day: number) => {
    if (isEveryDay) {
      // Switching from everyday to specific days
      onChange([day]);
    } else if (selectedDays.includes(day)) {
      const newDays = selectedDays.filter(d => d !== day);
      onChange(newDays); // if empty, means everyday
    } else {
      onChange([...selectedDays, day]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={toggleEveryDay}
        className={cn(
          'px-3 py-1.5 rounded-full text-xs font-mono transition-all',
          isEveryDay
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-muted-foreground hover:text-foreground'
        )}
      >
        Every Day
      </button>
      {DAY_NAMES.map((name, i) => (
        <button
          key={i}
          type="button"
          onClick={() => toggleDay(i)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-mono transition-all',
            !isEveryDay && selectedDays.includes(i)
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

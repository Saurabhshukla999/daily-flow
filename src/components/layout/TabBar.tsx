import { cn } from '@/lib/utils';

type Tab = 'today' | 'schedule' | 'graphs';

interface TabBarProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'graphs', label: 'Graphs' },
];

export default function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1 px-4 md:px-8 py-3 overflow-x-auto border-b border-border">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-5 py-2 rounded-lg text-sm font-body font-medium transition-all whitespace-nowrap',
            activeTab === tab.id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

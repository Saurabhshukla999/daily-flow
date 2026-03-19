import { useState } from 'react';
import { useStats } from '@/hooks/useStats';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn, formatDate, MONTH_NAMES, getTodayStr } from '@/lib/utils';
import { TrendingUp, Calendar, Trophy } from 'lucide-react';

type Period = 'week' | 'month' | 'year';
type Metric = 'completion' | 'hours';

export default function GraphsView() {
  const [period, setPeriod] = useState<Period>('week');
  const [metric, setMetric] = useState<Metric>('completion');
  const { data: stats, isLoading } = useStats(period, metric);

  const todayStr = getTodayStr();

  const chartData = (stats?.entries ?? []).map(e => ({
    ...e,
    value: metric === 'completion' ? e.completion_pct : e.hours,
    isToday: e.date === todayStr,
  }));

  const summaryCards = [
    { label: '7-Day Avg', value: stats?.avg_7d ?? 0, suffix: metric === 'completion' ? '%' : 'h', icon: TrendingUp },
    { label: '30-Day Avg', value: stats?.avg_30d ?? 0, suffix: metric === 'completion' ? '%' : 'h', icon: Calendar },
    { label: 'Best Day', value: stats?.best_day?.value ?? 0, suffix: metric === 'completion' ? '%' : 'h', icon: Trophy, sub: stats?.best_day ? formatDate(stats.best_day.date) : '-' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {summaryCards.map(c => (
          <div key={c.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <c.icon className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">{c.label}</span>
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">
              {c.value}{c.suffix}
            </span>
            {c.sub && <p className="text-xs font-mono text-muted-foreground mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1">
          {(['week', 'month', 'year'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-body font-medium transition-all capitalize',
                period === p ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['completion', 'hours'] as Metric[]).map(m => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-body font-medium transition-all',
                metric === m ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {m === 'completion' ? 'Completion %' : 'Hours'}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">Loading...</div>
      ) : chartData.length === 0 || chartData.every(d => d.value === 0) ? (
        <div className="h-64 flex flex-col items-center justify-center text-center bg-card border border-border rounded-lg">
          <p className="text-muted-foreground font-body">Check off tasks daily — your graph builds over time</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barCategoryGap="20%">
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(220, 6%, 46%)', fontSize: 11, fontFamily: 'DM Mono' }}
                interval={period === 'month' ? 4 : 0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(220, 6%, 46%)', fontSize: 11, fontFamily: 'DM Mono' }}
                domain={metric === 'completion' ? [0, 100] : undefined}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(225, 24%, 12%)',
                  border: '1px solid hsl(225, 18%, 18%)',
                  borderRadius: '8px',
                  color: 'hsl(225, 33%, 93%)',
                  fontFamily: 'DM Sans',
                  fontSize: 13,
                }}
                formatter={(value: number) => [
                  `${value}${metric === 'completion' ? '%' : 'h'}`,
                  metric === 'completion' ? 'Completion' : 'Hours',
                ]}
                labelFormatter={(label: string, payload: any[]) => {
                  const entry = payload?.[0]?.payload;
                  return entry?.date ? formatDate(entry.date) : label;
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.isToday ? 'hsl(78, 88%, 67%)' : 'hsl(78, 88%, 67%, 0.4)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Heatmap (year view only) */}
      {period === 'year' && <Heatmap stats={stats} metric={metric} />}
    </div>
  );
}

function Heatmap({ stats, metric }: { stats: any; metric: Metric }) {
  // Build 365-day heatmap
  const today = new Date();
  const cells: { date: string; value: number; row: number; col: number }[] = [];

  // Start from 364 days ago, find the Sunday
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364);
  // Adjust to previous Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const endDate = new Date(today);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Create a map from stats entries if available
  // For year view, stats entries are monthly, so we need daily data
  // We'll just show empty for now and let the bar chart handle monthly
  // Actually let's build from the raw concept — the heatmap needs daily data
  // Since we only have monthly aggregates in year view, we'll show a simplified version

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const row = d.getDay();
    const col = Math.floor(i / 7);
    cells.push({ date: dateStr, value: 0, row, col });
  }

  const maxCol = Math.max(...cells.map(c => c.col));

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  for (const cell of cells) {
    const d = new Date(cell.date + 'T00:00:00');
    const month = d.getMonth();
    if (month !== lastMonth && cell.row === 0) {
      monthLabels.push({ label: MONTH_NAMES[month], col: cell.col });
      lastMonth = month;
    }
  }

  const shades = [
    'hsl(225, 22%, 10%)',
    'hsl(78, 88%, 67%, 0.2)',
    'hsl(78, 88%, 67%, 0.4)',
    'hsl(78, 88%, 67%, 0.6)',
    'hsl(78, 88%, 67%, 0.8)',
    'hsl(78, 88%, 67%)',
  ];

  const getShade = (value: number) => {
    if (value === 0) return shades[0];
    const maxVal = metric === 'completion' ? 100 : 10;
    const idx = Math.min(Math.ceil((value / maxVal) * 5), 5);
    return shades[idx];
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 overflow-x-auto">
      <h4 className="font-heading font-semibold text-foreground mb-4">Activity Heatmap</h4>
      <div className="text-center text-sm text-muted-foreground mb-4">
        Start tracking to fill in your heatmap!
      </div>
      <div className="relative" style={{ minWidth: (maxCol + 1) * 14 + 30 }}>
        {/* Month labels */}
        <div className="flex mb-1" style={{ paddingLeft: 30 }}>
          {monthLabels.map((m, i) => (
            <span
              key={i}
              className="text-xs font-mono text-muted-foreground absolute"
              style={{ left: m.col * 14 + 30 }}
            >
              {m.label}
            </span>
          ))}
        </div>
        <div className="mt-5">
          {[0, 1, 2, 3, 4, 5, 6].map(row => (
            <div key={row} className="flex items-center" style={{ height: 14 }}>
              <span className="text-xs font-mono text-muted-foreground w-[30px]">
                {row === 1 ? 'Mon' : row === 3 ? 'Wed' : row === 5 ? 'Fri' : ''}
              </span>
              {cells.filter(c => c.row === row).map((cell, i) => (
                <div
                  key={i}
                  title={`${cell.date}: ${cell.value}${metric === 'completion' ? '%' : 'h'}`}
                  className="rounded-sm m-[1px]"
                  style={{
                    width: 12,
                    height: 12,
                    background: getShade(cell.value),
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1 mt-3 justify-end">
          <span className="text-xs font-mono text-muted-foreground mr-1">Less</span>
          {shades.map((s, i) => (
            <div key={i} className="rounded-sm" style={{ width: 12, height: 12, background: s }} />
          ))}
          <span className="text-xs font-mono text-muted-foreground ml-1">More</span>
        </div>
      </div>
    </div>
  );
}

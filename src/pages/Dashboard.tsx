import { useState } from 'react';
import Header from '@/components/layout/Header';
import TabBar from '@/components/layout/TabBar';
import TodayView from '@/components/today/TodayView';
import ScheduleView from '@/components/schedule/ScheduleView';
import GraphsView from '@/components/graphs/GraphsView';

type Tab = 'today' | 'schedule' | 'graphs';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('today');

  return (
    <div className="min-h-screen bg-background relative">
      <div className="bg-orbs" />
      <div className="relative z-10">
        <Header />
        <TabBar activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === 'today' && <TodayView />}
        {activeTab === 'schedule' && <ScheduleView />}
        {activeTab === 'graphs' && <GraphsView />}
      </div>
    </div>
  );
}

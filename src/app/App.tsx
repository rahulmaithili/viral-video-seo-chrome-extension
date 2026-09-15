import React, { useEffect, useRef, useState } from 'react';
import { Navbar, ActiveTab } from '../components/layout/Navbar';
import { Dashboard } from '../pages/Dashboard';
import { BulkQueue } from '../pages/BulkQueue';
import { AnalysisWorkspace } from '../pages/AnalysisWorkspace';
import { History } from '../pages/History';
import { Templates } from '../pages/Templates';
import { TrendIntelligence } from '../pages/TrendIntelligence';
import { Settings } from '../pages/Settings';
import { Help } from '../pages/Help';
import { useSettingsStore } from '../state/settingsStore';
import { useQueueStore } from '../state/queueStore';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { loadSettings } = useSettingsStore();
  const { initQueue, addVideos, selectJob } = useQueueStore();

  useEffect(() => {
    loadSettings();
    initQueue();
  }, [loadSettings, initQueue]);

  const handleGlobalFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addVideos(Array.from(e.target.files));
      setActiveTab('queue');
    }
  };

  const handleOpenWorkspace = (jobId: string) => {
    selectJob(jobId);
    setActiveTab('workspace');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col">
      {/* Hidden Global File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleGlobalFiles}
        multiple
        accept="video/*,.mp4,.mov,.avi,.webm,.mkv"
        className="hidden"
      />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => fileInputRef.current?.click()}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigate={(tab) => {
              setActiveTab(tab);
            }}
          />
        )}
        {activeTab === 'queue' && <BulkQueue onOpenWorkspace={handleOpenWorkspace} />}
        {activeTab === 'workspace' && <AnalysisWorkspace />}
        {activeTab === 'history' && <History onOpenWorkspace={handleOpenWorkspace} />}
        {activeTab === 'templates' && <Templates />}
        {activeTab === 'trends' && <TrendIntelligence />}
        {activeTab === 'settings' && <Settings />}
        {activeTab === 'help' && <Help />}
      </main>
    </div>
  );
};

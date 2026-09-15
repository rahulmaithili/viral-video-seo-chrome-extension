import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  History as HistoryIcon,
  Sliders,
  TrendingUp,
  Settings,
  HelpCircle,
  Plus,
  Zap,
  Globe,
  Flag,
} from 'lucide-react';
import { useSettingsStore } from '../../state/settingsStore';
import { SupportedLanguage } from '../../types/video';

export type ActiveTab =
  | 'dashboard'
  | 'queue'
  | 'workspace'
  | 'history'
  | 'templates'
  | 'trends'
  | 'settings'
  | 'help';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenUpload?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenUpload }) => {
  const { settings, updateSettings } = useSettingsStore();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'queue', label: 'Bulk Queue', icon: <Layers className="w-4 h-4" /> },
    { id: 'workspace', label: 'Analyze', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <HistoryIcon className="w-4 h-4" /> },
    { id: 'templates', label: 'Templates', icon: <Sliders className="w-4 h-4" /> },
    { id: 'trends', label: 'Trends', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'help', label: 'Help', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F19]/95 backdrop-blur border-b border-gray-800 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-purple-400 p-0.5 shadow-lg shadow-brand-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-brand-400 fill-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold tracking-wider text-brand-400 uppercase">Rahul Scripts</span>
                <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-brand-900/60 text-brand-300 rounded border border-brand-700/50">PRO 3.0</span>
              </div>
              <h1 className="text-base font-extrabold text-white tracking-tight">Viral Video AI Studio</h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/60 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Global Controls & CTAs */}
          <div className="flex items-center space-x-3">
            {/* Global Language Toggle */}
            <div className="flex items-center space-x-1 bg-gray-900/90 border border-gray-800 rounded-lg px-2 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={settings.defaultLanguage}
                onChange={(e) => updateSettings({ defaultLanguage: e.target.value as SupportedLanguage })}
                className="bg-transparent text-gray-200 border-none outline-none text-xs cursor-pointer"
                title="Global Video Content Language"
              >
                <option value="English" className="bg-gray-900">English</option>
                <option value="Hindi" className="bg-gray-900">Hindi (हिन्दी)</option>
                <option value="Hinglish" className="bg-gray-900">Hinglish</option>
              </select>
            </div>

            {/* Global USA Target Toggle */}
            <button
              onClick={() => updateSettings({ defaultTargetUsa: !settings.defaultTargetUsa })}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                settings.defaultTargetUsa
                  ? 'bg-sky-950/60 text-sky-300 border-sky-600/50 shadow-sm shadow-sky-500/10'
                  : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-gray-200'
              }`}
              title="Optimize phrasing & hooks for USA audience (strictly grounded)"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>USA {settings.defaultTargetUsa ? 'ON' : 'OFF'}</span>
            </button>

            {/* AI Status Badge */}
            <div
              onClick={() => setActiveTab('settings')}
              className="cursor-pointer"
              title="Click to configure AI in Settings"
            >
              {settings.useMockAI ? (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-purple-950/60 text-purple-300 border border-purple-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5 animate-pulse" />
                  Mock Mode
                </span>
              ) : settings.geminiApiKey ? (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                  Gemini Ready
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60 animate-bounce">
                  Key Needed
                </span>
              )}
            </div>

            {/* Primary Action Button */}
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-medium text-xs shadow-md shadow-brand-600/20 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Videos</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

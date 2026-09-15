import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  ShieldCheck,
  Cpu,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Terminal,
} from 'lucide-react';
import { useSettingsStore } from '../state/settingsStore';
import { AVAILABLE_GEMINI_MODELS } from '../config/defaults';
import { GeminiProvider } from '../ai/providers/gemini';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();

  const [apiKeyInput, setApiKeyInput] = useState(settings.geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Auto-upgrade legacy model settings on component mount
  React.useEffect(() => {
    if (
      settings.geminiModel &&
      (settings.geminiModel.includes('2.5-flash') ||
        settings.geminiModel.includes('gemini-2.5') ||
        settings.geminiModel.startsWith('models/'))
    ) {
      updateSettings({ geminiModel: 'gemini-3.6-flash' });
    }
  }, [settings.geminiModel, updateSettings]);

  const handleSaveKey = async () => {
    await updateSettings({ geminiApiKey: apiKeyInput.trim() });
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      let activeModel = settings.geminiModel;
      if (!activeModel || activeModel.includes('2.5-flash') || activeModel.includes('gemini-2.5')) {
        activeModel = 'gemini-3.6-flash';
        await updateSettings({ geminiModel: 'gemini-3.6-flash' });
      }

      const provider = new GeminiProvider(apiKeyInput.trim(), activeModel);
      const res = await provider.testConnection(apiKeyInput.trim());
      setTestResult(res);
      if (res.success) {
        await updateSettings({
          geminiApiKey: apiKeyInput.trim(),
          geminiModel: res.modelUsed || activeModel,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('gemini-2.5-flash') || msg.includes('no longer available')) {
        await updateSettings({ geminiModel: 'gemini-3.6-flash' });
        setTestResult({
          success: false,
          message: `${msg} (Auto-switched to gemini-3.6-flash. Please click Test Connection again.)`,
        });
      } else {
        setTestResult({
          success: false,
          message: msg,
        });
      }
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5">
        <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">System Preferences</span>
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-brand-400" />
          <span>Studio Settings & API Configuration</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Configure your Gemini API credentials, local execution modes, queue thresholds, and developer tools.
        </p>
      </div>

      {/* Gemini API Key Section */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white">Google Gemini API Key</h3>
          </div>
          <span className="text-[11px] text-gray-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted locally in chrome.storage</span>
          </span>
        </div>

        <p className="text-xs text-gray-400">
          Obtain a free or paid API key from Google AI Studio (
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-brand-400 underline hover:text-brand-300"
          >
            aistudio.google.com
          </a>
          ). Your key never leaves your browser and is never sent to third-party analytics.
        </p>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 outline-none focus:border-brand-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleSaveKey}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs border border-gray-700 transition-colors"
          >
            Save Key
          </button>

          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
          </button>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
              testResult.success
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-200'
                : 'bg-rose-950/60 border-rose-800/60 text-rose-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Provider & Model Selection */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-brand-400" />
          <span>AI Provider & Execution Mode</span>
        </h3>

        {/* Mock Mode Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-950/60 border border-gray-800">
          <div>
            <h4 className="text-xs font-bold text-white">Enable Mock Mode (100% Offline)</h4>
            <p className="text-[11px] text-gray-400">
              Process videos using rich offline mock models without requiring an API key or spending quota.
            </p>
          </div>
          <button
            onClick={() => updateSettings({ useMockAI: !settings.useMockAI })}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.useMockAI ? 'bg-brand-600' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.useMockAI ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Model Selector */}
        <div className="space-y-1.5 text-xs">
          <label className="text-gray-300 font-semibold block">Gemini Model</label>
          <select
            value={
              AVAILABLE_GEMINI_MODELS.some((m) => m.id === settings.geminiModel)
                ? settings.geminiModel
                : 'gemini-3.6-flash'
            }
            onChange={(e) => updateSettings({ geminiModel: e.target.value })}
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-brand-500 cursor-pointer"
          >
            {AVAILABLE_GEMINI_MODELS.map((m: { id: string; name: string }) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-gray-500">
            <strong>Gemini 3.6 Flash</strong> is the official standard. Legacy models like 2.5-flash have been deprecated by Google and are automatically upgraded.
          </p>
        </div>
      </div>

      {/* Thresholds & Performance */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-brand-400" />
          <span>Queue Engine & Quality Thresholds</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Duplicate Threshold */}
          <div className="space-y-1.5 bg-gray-950/60 border border-gray-800 rounded-xl p-3">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-300">Duplicate Score Threshold</span>
              <strong className="text-brand-400">{settings.duplicateThreshold}%</strong>
            </div>
            <p className="text-[11px] text-gray-500">
              Videos with similarity greater than or equal to this score will be flagged as duplicates.
            </p>
            <input
              type="range"
              min="70"
              max="100"
              value={settings.duplicateThreshold}
              onChange={(e) => updateSettings({ duplicateThreshold: Number(e.target.value) })}
              className="w-full accent-brand-500 cursor-pointer mt-2"
            />
          </div>

          {/* Keyword Relevance Threshold */}
          <div className="space-y-1.5 bg-gray-950/60 border border-gray-800 rounded-xl p-3">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-300">Keyword Relevance Minimum</span>
              <strong className="text-brand-400">{settings.keywordRelevanceThreshold}%</strong>
            </div>
            <p className="text-[11px] text-gray-500">
              Filters out irrelevant buzzwords or unrelated viral spam below this score.
            </p>
            <input
              type="range"
              min="50"
              max="95"
              value={settings.keywordRelevanceThreshold}
              onChange={(e) => updateSettings({ keywordRelevanceThreshold: Number(e.target.value) })}
              className="w-full accent-brand-500 cursor-pointer mt-2"
            />
          </div>
        </div>
      </div>

      {/* Developer Mode */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-brand-400" />
            <div>
              <h4 className="text-xs font-bold text-white">Developer Mode</h4>
              <p className="text-[11px] text-gray-400">
                Display internal job IDs, frame dHash values, AI latency, and validation debug logs.
              </p>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ developerMode: !settings.developerMode })}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.developerMode ? 'bg-brand-600' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.developerMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

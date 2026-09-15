import React from 'react';
import { Sliders, Sparkles, Check, ShieldCheck } from 'lucide-react';
import { useSettingsStore } from '../state/settingsStore';
import { SMART_PRESETS } from '../config/defaults';
import { PresetConfig } from '../types/settings';

const STYLE_TEMPLATES = [
  { name: 'Viral', description: 'Curiosity-driven hooks, high retention pacing, maximum comment shareability' },
  { name: 'Funny', description: 'Lighthearted, comedic timing, meme-friendly phrasing and relatable humor' },
  { name: 'Educational', description: 'Clear step-by-step insight, how-to value, actionable takeaway focus' },
  { name: 'Professional', description: 'Clean, authoritative, brand-safe tone for businesses and product showcases' },
  { name: 'Emotional', description: 'Heartfelt storytelling, empathetic tone, deep viewer connection' },
  { name: 'Devotional', description: 'Respectful, serene, peaceful tone without sensationalism or exaggerated claims' },
  { name: 'Storytelling', description: 'Narrative arc, suspense building, captivating opening hook and resolution' },
  { name: 'Tech Review', description: 'Hardware clarity, specification focus, unbiased feature analysis' },
];

export const Templates: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();

  const handleApplyPreset = (preset: PresetConfig) => {
    updateSettings({
      defaultLanguage: preset.language,
      defaultTargetUsa: preset.targetUsa,
      defaultPlatforms: preset.platforms,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5">
        <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Workflow Accelerators</span>
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-brand-400" />
          <span>Smart Presets & Content Styles</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Apply proven targeting rules, platform conventions, and tone styles across your bulk queues.
        </p>
      </div>

      {/* Smart Presets Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Creator Targeting Presets</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SMART_PRESETS.map((preset: PresetConfig) => {
            const isApplied =
              settings.defaultLanguage === preset.language &&
              settings.defaultTargetUsa === preset.targetUsa &&
              JSON.stringify(settings.defaultPlatforms) === JSON.stringify(preset.platforms);

            return (
              <div
                key={preset.name}
                onClick={() => handleApplyPreset(preset)}
                className={`bg-gray-900/80 border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
                  isApplied
                    ? 'border-brand-500 bg-brand-950/20 shadow-lg shadow-brand-500/10'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{preset.label}</h4>
                    {isApplied && (
                      <span className="text-[10px] font-bold bg-brand-500 text-white px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{preset.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400 mt-3">
                  <span>{preset.language} • {preset.targetUsa ? 'USA ON' : 'Global'}</span>
                  <span className="font-semibold text-brand-400 uppercase">{preset.platforms.join(', ')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Style Templates */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-200">Content Tone & Style Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {STYLE_TEMPLATES.map((st) => {
            const isSelected = settings.defaultTemplateStyle === st.name;
            return (
              <div
                key={st.name}
                onClick={() => updateSettings({ defaultTemplateStyle: st.name })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-brand-950/40 border-brand-500 text-white'
                    : 'bg-gray-900/80 border-gray-800 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">{st.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                </div>
                <p className="text-[11px] text-gray-400 leading-snug">{st.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Instructions */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Custom Optimization Instructions</h3>
          <span className="text-[11px] text-brand-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict Factuality Protected</span>
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Add specific instructions for your workflow (e.g. &quot;Write short captions&quot;, &quot;Include call to action to subscribe&quot;, &quot;Keep titles under 60 characters&quot;).
        </p>
        <textarea
          rows={3}
          value={settings.customInstructions}
          onChange={(e) => updateSettings({ customInstructions: e.target.value })}
          placeholder="e.g. Always emphasize the unexpected plot twist in the hook. Keep titles under 55 characters."
          className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-600 outline-none focus:border-brand-500"
        />
      </div>
    </div>
  );
};

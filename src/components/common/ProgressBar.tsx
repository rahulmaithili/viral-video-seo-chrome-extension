import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  className?: string;
  showPercent?: boolean;
  status?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  className = '',
  showPercent = true,
  status,
}) => {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent || status) && (
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span className="truncate max-w-[200px]">{label || status}</span>
          {showPercent && <span className="font-semibold text-gray-300">{safeProgress}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden border border-gray-700/50">
        <div
          className="bg-gradient-to-r from-brand-600 via-brand-500 to-purple-400 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};

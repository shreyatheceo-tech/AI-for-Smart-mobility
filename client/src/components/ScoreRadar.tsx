import React from 'react';
import { ScoreBreakdown } from '../types/index.js';

interface ScoreRadarProps {
  scores: ScoreBreakdown;
  title?: string;
}

export const ScoreRadar: React.FC<ScoreRadarProps> = ({ scores, title = 'Decision Criteria Breakdown' }) => {
  const metrics = [
    { label: 'Time Efficiency', score: scores.timeScore, color: 'bg-cyan-500' },
    { label: 'Cost Value', score: scores.costScore, color: 'bg-emerald-500' },
    { label: 'Eco Footprint', score: scores.co2Score, color: 'bg-teal-500' },
    { label: 'Safety Index', score: scores.safetyScore, color: 'bg-blue-500' },
    { label: 'Accessibility', score: scores.accessibilityScore, color: 'bg-purple-500' },
  ];

  return (
    <div className="rounded-2xl p-5 bg-slate-900/60 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
          {title}
        </h4>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Composite: {scores.compositeScore}/100
        </span>
      </div>

      <div className="space-y-3">
        {metrics.map(m => (
          <div key={m.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">{m.label}</span>
              <span className="font-semibold text-slate-200">{m.score}/100</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${m.color} rounded-full transition-all duration-500`}
                style={{ width: `${m.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

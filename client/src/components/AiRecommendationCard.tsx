import React from 'react';
import {
  Sparkles,
  Navigation,
  ArrowRight,
  TrendingDown,
  CloudRain,
  Accessibility,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Bus,
  Train,
  Car,
  Footprints,
  Bike,
  Shuffle,
} from 'lucide-react';
import { AiRecommendation, MobilityOption, TransportMode } from '../types/index.js';

interface AiRecommendationCardProps {
  recommendation: AiRecommendation;
  option?: MobilityOption;
  onStartRoute: () => void;
}

export const getModeIcon = (mode: TransportMode, className = 'w-5 h-5') => {
  switch (mode) {
    case 'bus':
      return <Bus className={`${className} text-orange-400`} />;
    case 'metro':
      return <Train className={`${className} text-blue-400`} />;
    case 'train':
      return <Train className={`${className} text-purple-400`} />;
    case 'car':
      return <Car className={`${className} text-rose-400`} />;
    case 'walk':
      return <Footprints className={`${className} text-emerald-400`} />;
    case 'cycle':
      return <Bike className={`${className} text-teal-400`} />;
    case 'multimodal':
      return <Shuffle className={`${className} text-pink-400`} />;
  }
};

export const AiRecommendationCard: React.FC<AiRecommendationCardProps> = ({
  recommendation,
  option,
  onStartRoute,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 md:p-8 shadow-2xl glow-cyan">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm animate-pulse-subtle">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              MobiMind AI Copilot Recommendation
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Optimal Match
            </span>
          </div>

          {option && (
            <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
              <span>⏱️ <strong>{option.durationMin} mins</strong></span>
              <span>💰 <strong>₹{option.cost}</strong></span>
              <span>🌱 <strong>{option.co2Grams}g CO₂</strong></span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 font-bold">
                Score: {option.scores.compositeScore}/100
              </span>
            </div>
          )}
        </div>

        {/* Headline & Mode Title */}
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-inner flex items-center justify-center">
            {getModeIcon(recommendation.recommendedMode, 'w-8 h-8')}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {recommendation.headline}
            </h2>
            <p className="text-xs font-medium text-cyan-400/90">
              {recommendation.priorityAlignmentNote}
            </p>
          </div>
        </div>

        {/* Natural Language Explanation */}
        <div className="rounded-xl p-4 bg-slate-950/60 border border-slate-800/80 text-sm text-slate-200 leading-relaxed space-y-3">
          <p className="font-normal text-slate-300">
            {recommendation.explanation}
          </p>

          {/* Trade-Off Summary Callout */}
          {recommendation.tradeOffSummary && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm">
              <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 block font-semibold mb-0.5">Smart Trade-Off Analysis:</strong>
                <span>{recommendation.tradeOffSummary}</span>
              </div>
            </div>
          )}
        </div>

        {/* Advisories & Key Pros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Advantages */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Key AI Selected Advantages
            </div>
            <ul className="space-y-1.5 text-slate-300">
              {recommendation.keyAdvantages.map((adv, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Context Advisories */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Advisory & Route Notes
            </div>
            <div className="space-y-2 text-slate-300">
              {recommendation.weatherAdvisory && (
                <div className="flex items-start gap-2">
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{recommendation.weatherAdvisory}</span>
                </div>
              )}
              {recommendation.accessibilityAdvice && (
                <div className="flex items-start gap-2">
                  <Accessibility className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>{recommendation.accessibilityAdvice}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Call to Action Button: Start Smart Route */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
          <p className="text-xs text-slate-400 italic">
            Live turn-by-turn guidance and dynamic vehicle tracking ready.
          </p>

          <button
            onClick={onStartRoute}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Navigation className="w-4 h-4 text-slate-950" />
            <span>Start Smart Route</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
};

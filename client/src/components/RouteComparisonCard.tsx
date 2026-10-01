import React, { useState } from 'react';
import {
  Clock,
  DollarSign,
  Leaf,
  Shield,
  Accessibility,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { MobilityOption } from '../types/index.js';
import { getModeIcon } from './AiRecommendationCard.js';

interface RouteComparisonCardProps {
  option: MobilityOption;
  isSelected: boolean;
  isAiTopPick: boolean;
  onSelect: () => void;
  onStartRoute?: () => void;
}

export const RouteComparisonCard: React.FC<RouteComparisonCardProps> = ({
  option,
  isSelected,
  isAiTopPick,
  onSelect,
}) => {
  const [expanded, setExpanded] = useState(false);

  // CO2 badge color
  const getCo2BadgeClass = () => {
    switch (option.co2Level) {
      case 'Zero':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Low':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      case 'Moderate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'High':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border transition-all duration-300 p-5 cursor-pointer relative ${
        isSelected
          ? 'bg-slate-900/95 border-cyan-500/70 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/40'
          : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
      }`}
    >
      {/* Top Banner if AI Top Pick */}
      {isAiTopPick && (
        <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-md">
          ★ AI Top Recommendation
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Mode Icon, Rank, Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center shadow-inner">
              {getModeIcon(option.mode, 'w-6 h-6')}
            </div>
            {option.rank && (
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                #{option.rank}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base tracking-tight">{option.title}</h3>
              {isSelected && (
                <span className="text-[10px] font-semibold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  Active On Map
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{option.subtitle}</p>
          </div>
        </div>

        {/* Right: Composite Score & Map Toggle */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Smart Score</div>
            <div className="text-lg font-extrabold text-cyan-400">
              {option.scores.compositeScore}
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toggle route steps"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Metric Pillars Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-5 pt-4 border-t border-slate-800/80 text-xs">
        {/* Time */}
        <div className="rounded-xl p-2.5 bg-slate-950/40 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Time</span>
          </div>
          <div className="font-bold text-white text-sm">
            {option.durationMin} <span className="text-xs font-normal text-slate-400">min</span>
          </div>
          {option.trafficDelayMin > 0 && (
            <div className="text-[10px] text-rose-400 mt-0.5 font-medium">
              +{option.trafficDelayMin}m traffic delay
            </div>
          )}
        </div>

        {/* Cost */}
        <div className="rounded-xl p-2.5 bg-slate-950/40 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[11px]">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cost</span>
          </div>
          <div className="font-bold text-white text-sm">
            {option.cost === 0 ? 'Free' : `₹${option.cost}`}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {option.cost === 0 ? 'Active walk' : 'Estimated fare'}
          </div>
        </div>

        {/* CO2 Emissions */}
        <div className="rounded-xl p-2.5 bg-slate-950/40 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[11px]">
            <Leaf className="w-3.5 h-3.5 text-teal-400" />
            <span>CO₂ Impact</span>
          </div>
          <div className="font-bold text-white text-sm">
            {option.co2Grams} <span className="text-xs font-normal text-slate-400">g</span>
          </div>
          <span className={`inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded border font-semibold ${getCo2BadgeClass()}`}>
            {option.co2Level}
          </span>
        </div>

        {/* Safety */}
        <div className="rounded-xl p-2.5 bg-slate-950/40 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Safety</span>
          </div>
          <div className="font-bold text-white text-sm">
            {option.safetyScore} <span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {option.safetyScore >= 90 ? 'High security' : 'Standard urban'}
          </div>
        </div>

        {/* Accessibility */}
        <div className="rounded-xl p-2.5 bg-slate-950/40 border border-slate-800/60 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[11px]">
            <Accessibility className="w-3.5 h-3.5 text-purple-400" />
            <span>Accessibility</span>
          </div>
          <div className="font-bold text-white text-sm">
            {option.accessibilityScore} <span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {option.accessibilityScore >= 90 ? 'Full barrier-free' : 'Moderate ramps'}
          </div>
        </div>
      </div>

      {/* Expandable Step-by-Step Itinerary */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            Step-by-Step Transit Itinerary ({option.steps.length} segments)
          </h4>

          <div className="space-y-2.5 pl-2">
            {option.steps.map((step, idx) => (
              <div key={step.id || idx} className="flex items-start gap-3 relative">
                {/* Timeline connector */}
                {idx < option.steps.length - 1 && (
                  <div className="absolute left-3.5 top-6 bottom-0 w-0.5 bg-slate-800" />
                )}

                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 z-10">
                  {getModeIcon(step.mode, 'w-3.5 h-3.5')}
                </div>

                <div className="flex-1 text-xs">
                  <div className="text-white font-medium">{step.instruction}</div>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px] mt-0.5">
                    <span>⏱️ {step.durationMin} min</span>
                    <span>📍 {step.distanceMeters}m</span>
                    {step.lineOrRouteNumber && (
                      <span className="text-cyan-400 font-semibold">{step.lineOrRouteNumber}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

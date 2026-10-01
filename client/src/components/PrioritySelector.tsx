import React, { useState } from 'react';
import { Zap, DollarSign, Leaf, Shield, Accessibility, Check, Info } from 'lucide-react';
import { PriorityType } from '../types/index.js';

interface PriorityOption {
  id: PriorityType;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  activeColor: string;
  borderColor: string;
}

const PRIORITIES: PriorityOption[] = [
  {
    id: 'fastest',
    label: 'Fastest',
    sublabel: 'Minimize travel & dwell time',
    icon: <Zap className="w-4 h-4 text-amber-400" />,
    activeColor: 'bg-amber-500/15 text-amber-200 border-amber-500/40',
    borderColor: 'hover:border-amber-500/30',
  },
  {
    id: 'cheapest',
    label: 'Cheapest',
    sublabel: 'Lowest fares & commuting costs',
    icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
    activeColor: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40',
    borderColor: 'hover:border-emerald-500/30',
  },
  {
    id: 'eco',
    label: 'Eco-friendly',
    sublabel: 'Zero or ultra-low CO₂ emissions',
    icon: <Leaf className="w-4 h-4 text-teal-400" />,
    activeColor: 'bg-teal-500/15 text-teal-200 border-teal-500/40',
    borderColor: 'hover:border-teal-500/30',
  },
  {
    id: 'safer',
    label: 'Safer',
    sublabel: 'Monitored & secure urban transit',
    icon: <Shield className="w-4 h-4 text-blue-400" />,
    activeColor: 'bg-blue-500/15 text-blue-200 border-blue-500/40',
    borderColor: 'hover:border-blue-500/30',
  },
  {
    id: 'accessible',
    label: 'Accessible',
    sublabel: 'Step-free, elevators & level boarding',
    icon: <Accessibility className="w-4 h-4 text-purple-400" />,
    activeColor: 'bg-purple-500/15 text-purple-200 border-purple-500/40',
    borderColor: 'hover:border-purple-500/30',
  },
];

interface PrioritySelectorProps {
  primaryPriority: PriorityType;
  selectedPriorities: PriorityType[];
  onChangePrimary: (p: PriorityType) => void;
  onToggleSecondary: (p: PriorityType) => void;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  primaryPriority,
  selectedPriorities,
  onChangePrimary,
  onToggleSecondary,
}) => {
  const [showSaferTooltip, setShowSaferTooltip] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span>Travel Priorities</span>
          <span className="text-[10px] text-cyan-400 font-normal lowercase">(choose primary & secondary)</span>
        </label>
        <span className="text-[11px] text-slate-500">
          Primary: <strong className="text-slate-200 capitalize">{primaryPriority}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {PRIORITIES.map(p => {
          const isPrimary = primaryPriority === p.id;
          const isSelected = selectedPriorities.includes(p.id) || isPrimary;

          return (
            <div
              key={p.id}
              onClick={() => onChangePrimary(p.id)}
              className={`relative cursor-pointer rounded-xl p-3 border transition-all duration-200 text-left select-none ${
                isPrimary
                  ? `${p.activeColor} ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-950/40`
                  : isSelected
                  ? 'bg-slate-900/90 border-slate-700 text-slate-300'
                  : `bg-slate-900/40 border-slate-800 text-slate-400 ${p.borderColor}`
              }`}
            >
              {/* Header with Icon and Primary Tag */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="p-1 rounded-md bg-slate-800/80 border border-slate-700/50">
                  {p.icon}
                </div>
                {isPrimary ? (
                  <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 shadow-sm">
                    Primary
                  </span>
                ) : isSelected ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSecondary(p.id);
                    }}
                    className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-300 flex items-center gap-0.5 hover:text-white"
                    title="Click to remove secondary"
                  >
                    <Check className="w-2.5 h-2.5 text-cyan-400" /> Also
                  </span>
                ) : null}
              </div>

              {/* Title with Info Tooltip for "Safer" */}
              <div className="flex items-center justify-between gap-1">
                <div className="font-semibold text-xs text-white leading-tight">
                  {p.label}
                </div>

                {p.id === 'safer' && (
                  <div className="relative inline-flex items-center group/tooltip">
                    <button
                      type="button"
                      aria-label="Safety metric calculation parameters"
                      aria-describedby="safer-tooltip-desc"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSaferTooltip(!showSaferTooltip);
                      }}
                      onMouseEnter={() => setShowSaferTooltip(true)}
                      onMouseLeave={() => setShowSaferTooltip(false)}
                      onFocus={() => setShowSaferTooltip(true)}
                      onBlur={() => setShowSaferTooltip(false)}
                      className="p-0.5 text-slate-400 hover:text-cyan-300 focus:text-cyan-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded transition-colors"
                      title="Learn how Safety Index is quantified"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    {/* WCAG High-Contrast Accessible Tooltip */}
                    <div
                      id="safer-tooltip-desc"
                      role="tooltip"
                      className={`absolute bottom-full right-0 sm:left-1/2 sm:-translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-slate-900 border border-cyan-500/50 text-slate-100 text-[11px] leading-relaxed shadow-2xl backdrop-blur-md transition-all duration-200 z-50 ${
                        showSaferTooltip
                          ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                          : 'opacity-0 invisible translate-y-1 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-hover/tooltip:translate-y-0 group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:visible group-focus-within/tooltip:translate-y-0'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-cyan-300 block mb-0.5">Quantified Safety Index:</span>
                          <span className="text-slate-200">
                            Safety index dynamically calculated using open-source CCTV density data, historical incident reports (last 30 days), and real-time crowd volume.
                          </span>
                        </div>
                      </div>
                      {/* Tooltip downward arrow */}
                      <div className="absolute top-full right-3 sm:left-1/2 sm:-translate-x-1/2 border-4 border-transparent border-t-cyan-500/50" />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                {p.sublabel}
              </div>

              {/* Secondary toggle pill */}
              {!isPrimary && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSecondary(p.id);
                  }}
                  className={`mt-2 w-full text-[10px] py-0.5 rounded border transition-colors ${
                    isSelected
                      ? 'border-slate-700 bg-slate-800/80 text-cyan-300'
                      : 'border-slate-800/80 bg-slate-950/40 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {isSelected ? '✓ Included' : '+ Include'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

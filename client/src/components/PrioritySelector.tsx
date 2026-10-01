import React, { useState } from 'react';
import { Zap, DollarSign, Leaf, Shield, Accessibility, Check, Info } from 'lucide-react';
import { PriorityType } from '../types/index.js';

interface PriorityOption {
  id: PriorityType;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  activeColor: string;
  pastelBorder: string;
}

const PRIORITIES: PriorityOption[] = [
  {
    id: 'fastest',
    label: 'Fastest',
    sublabel: 'Minimize travel & dwell time',
    icon: <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />,
    activeColor: 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-300/60 shadow-float',
    pastelBorder: 'hover:border-amber-300',
  },
  {
    id: 'cheapest',
    label: 'Cheapest',
    sublabel: 'Lowest fares & commuting costs',
    icon: <DollarSign className="w-4 h-4 text-emerald-600" />,
    activeColor: 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-2 ring-emerald-300/60 shadow-float',
    pastelBorder: 'hover:border-emerald-300',
  },
  {
    id: 'eco',
    label: 'Eco-friendly',
    sublabel: 'Zero or ultra-low CO₂ emissions',
    icon: <Leaf className="w-4 h-4 text-sage-600 fill-sage-500" />,
    activeColor: 'bg-sage-100 text-sage-900 border-sage-400 ring-2 ring-sage-300/60 shadow-float',
    pastelBorder: 'hover:border-sage-300',
  },
  {
    id: 'safer',
    label: 'Safer',
    sublabel: 'Monitored & secure urban transit',
    icon: <Shield className="w-4 h-4 text-rose-500 fill-rose-400" />,
    activeColor: 'bg-rose-100 text-rose-900 border-rose-400 ring-2 ring-rose-300/60 shadow-float',
    pastelBorder: 'hover:border-rose-300',
  },
  {
    id: 'accessible',
    label: 'Accessible',
    sublabel: 'Step-free, elevators & level boarding',
    icon: <Accessibility className="w-4 h-4 text-lavender-600" />,
    activeColor: 'bg-lavender-100 text-lavender-900 border-lavender-400 ring-2 ring-lavender-300/60 shadow-float',
    pastelBorder: 'hover:border-lavender-300',
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
        <label className="text-xs font-bold uppercase tracking-wider text-warm-charcoal flex items-center gap-1.5">
          <span>Travel Priorities</span>
          <span className="text-[11px] text-warm-muted font-normal lowercase">(choose primary & secondary)</span>
        </label>
        <span className="text-xs text-warm-muted font-medium">
          Primary: <strong className="text-warm-charcoal capitalize">{primaryPriority}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {PRIORITIES.map((p) => {
          const isPrimary = primaryPriority === p.id;
          const isSelected = selectedPriorities.includes(p.id) || isPrimary;

          return (
            <div
              key={p.id}
              onClick={() => onChangePrimary(p.id)}
              className={`relative cursor-pointer rounded-cute p-3.5 border transition-all duration-200 text-left select-none squish-click ${
                isPrimary
                  ? `${p.activeColor} clay-tab-pressed font-extrabold`
                  : isSelected
                  ? 'clay-pill-floating bg-cream-100 border-warm-border text-warm-charcoal'
                  : `clay-pill-floating bg-warm-white border-warm-border/80 text-warm-muted hover:text-warm-charcoal hover:-translate-y-1 ${p.pastelBorder}`
              }`}
            >
              {/* Header with Icon and Primary Tag */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="w-7 h-7 rounded-cute-sm bg-warm-white/90 shadow-sm flex items-center justify-center border border-warm-border/60">
                  {p.icon}
                </div>
                {isPrimary ? (
                  <span className="text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-warm-charcoal text-white shadow-sm">
                    Primary
                  </span>
                ) : isSelected ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSecondary(p.id);
                    }}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cream-200 text-warm-charcoal flex items-center gap-0.5 hover:bg-cream-300"
                    title="Click to remove secondary"
                  >
                    <Check className="w-2.5 h-2.5 text-sage-600" /> Also
                  </span>
                ) : null}
              </div>

              {/* Title with Info Tooltip for "Safer" */}
              <div className="flex items-center justify-between gap-1">
                <div className="font-extrabold text-xs text-warm-charcoal leading-tight">
                  {p.label}
                </div>

                {p.id === 'safer' && (
                  <div className="relative inline-block">
                    <button
                      type="button"
                      aria-label="Safety metric calculation information"
                      aria-describedby="safety-tooltip"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSaferTooltip(!showSaferTooltip);
                      }}
                      onMouseEnter={() => setShowSaferTooltip(true)}
                      onMouseLeave={() => setShowSaferTooltip(false)}
                      onFocus={() => setShowSaferTooltip(true)}
                      onBlur={() => setShowSaferTooltip(false)}
                      className="p-1 text-warm-muted hover:text-rose-500 rounded-full focus:outline-none transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    {showSaferTooltip && (
                      <div
                        id="safety-tooltip"
                        role="tooltip"
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-cute bg-warm-white text-warm-charcoal text-[11px] leading-relaxed border border-warm-border shadow-float z-50 pointer-events-none"
                      >
                        <p className="font-bold text-rose-500 mb-1 flex items-center gap-1">
                          <Shield className="w-3 h-3 text-rose-500" /> Safety Index Calculation
                        </p>
                        <p className="text-warm-muted">
                          Safety index dynamically calculated using open-source CCTV density data, historical incident
                          reports (last 30 days), and real-time crowd volume.
                        </p>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-warm-white"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="text-[10px] text-warm-muted mt-1 leading-normal line-clamp-2 font-medium">
                {p.sublabel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrioritySelector;

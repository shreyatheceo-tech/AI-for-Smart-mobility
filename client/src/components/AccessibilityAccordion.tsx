import React from 'react';
import {
  Accessibility,
  Sliders,
  ChevronDown,
  ChevronUp,
  Volume2,
  Footprints,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface AccessibilityAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  maxWalkDistance: number;
  onChangeMaxWalk: (distance: number) => void;
  strictlyStepFree: boolean;
  onChangeStrictlyStepFree: (checked: boolean) => void;
  requiresAuditorySignals: boolean;
  onChangeRequiresAuditorySignals: (checked: boolean) => void;
}

export const AccessibilityAccordion: React.FC<AccessibilityAccordionProps> = ({
  isOpen,
  onToggle,
  maxWalkDistance,
  onChangeMaxWalk,
  strictlyStepFree,
  onChangeRequiresAuditorySignals,
  onChangeStrictlyStepFree,
  requiresAuditorySignals,
}) => {
  let activeCount = 0;
  if (strictlyStepFree) activeCount++;
  if (requiresAuditorySignals) activeCount++;
  if (maxWalkDistance < 800) activeCount++;

  const walkMinutes = Math.max(1, Math.round(maxWalkDistance / 80));

  return (
    <div className="clay-card rounded-cute border border-warm-border/80 bg-warm-white overflow-hidden transition-all duration-300 shadow-float">
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel-content"
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-cream-100/60 transition-colors focus-visible:outline-none squish-click"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-cute-sm bg-lavender-100 border border-lavender-200 flex items-center justify-center text-lavender-600 shadow-sm">
            <Accessibility className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-warm-charcoal flex items-center gap-2">
              <span>Granular Accessibility & Walk Constraints</span>
              {activeCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lavender-200 text-lavender-800">
                  {activeCount} active
                </span>
              )}
            </div>
            <p className="text-[11px] text-warm-muted font-medium">
              Configure physical mobility, step-free access, and sensory guidance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-warm-muted text-xs">
          <span className="text-[11px] text-rose-500 font-bold hidden sm:inline">
            {isOpen ? 'Collapse Panel' : 'Expand Configuration'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-rose-500" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Nested Configuration Panel */}
      {isOpen && (
        <div
          id="accessibility-panel-content"
          role="region"
          aria-label="Granular Accessibility Configuration"
          className="p-5 border-t border-warm-border bg-cream-100/50 space-y-5 animate-cascade"
        >
          {/* 1. Maximum Walk Distance Slider (50m to 1000m, default 200m) */}
          <div className="p-4 rounded-cute bg-warm-white border border-warm-border space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="max-walk-slider" className="font-bold text-warm-charcoal flex items-center gap-2">
                <Footprints className="w-4 h-4 text-sage-500" />
                <span>Maximum Walk Distance</span>
              </label>
              <div className="text-right">
                <span className="text-sm font-extrabold text-warm-charcoal">
                  {maxWalkDistance} meters
                </span>
                <span className="text-[11px] text-warm-muted block">
                  ~{walkMinutes} min calm walking pace
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <input
                id="max-walk-slider"
                type="range"
                min={50}
                max={1000}
                step={25}
                value={maxWalkDistance}
                onChange={(e) => onChangeMaxWalk(parseInt(e.target.value, 10))}
                className="w-full h-2 rounded-lg bg-cream-200 accent-rose-400 cursor-pointer focus-visible:outline-none"
              />
              <div className="flex justify-between text-[10px] text-warm-muted font-medium px-0.5">
                <span>50m (Minimal)</span>
                <span className="text-rose-500 font-bold">200m (Standard Default)</span>
                <span>500m</span>
                <span>1000m (Max 1km)</span>
              </div>
            </div>
          </div>

          {/* 2. Step-Free & Auditory Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Step-Free Checkbox */}
            <label className="clay-pill-floating p-4 rounded-cute bg-warm-white border border-warm-border/80 flex items-start gap-3 cursor-pointer hover:bg-cream-50 transition-colors squish-click">
              <input
                type="checkbox"
                checked={strictlyStepFree}
                onChange={(e) => onChangeStrictlyStepFree(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-rose-500 accent-rose-500 cursor-pointer"
              />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-warm-charcoal">Strictly Step-Free</p>
                <p className="text-[11px] text-warm-muted leading-relaxed">
                  Require verified working elevators and level ramp boarding at all interchanges.
                </p>
              </div>
            </label>

            {/* Auditory Signals Checkbox */}
            <label className="clay-pill-floating p-4 rounded-cute bg-warm-white border border-warm-border/80 flex items-start gap-3 cursor-pointer hover:bg-cream-50 transition-colors squish-click">
              <input
                type="checkbox"
                checked={requiresAuditorySignals}
                onChange={(e) => onChangeRequiresAuditorySignals(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-rose-500 accent-rose-500 cursor-pointer"
              />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-warm-charcoal flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-lavender-500" />
                  <span>Auditory Transit Cues</span>
                </p>
                <p className="text-[11px] text-warm-muted leading-relaxed">
                  Filter for buses and trains with acoustic crossing beepers and vocal stop announcements.
                </p>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityAccordion;

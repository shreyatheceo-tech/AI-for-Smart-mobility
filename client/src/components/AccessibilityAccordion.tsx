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
  // Count active constraints for quick badge display
  let activeCount = 0;
  if (strictlyStepFree) activeCount++;
  if (requiresAuditorySignals) activeCount++;
  if (maxWalkDistance < 800) activeCount++;

  const walkMinutes = Math.max(1, Math.round(maxWalkDistance / 80));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-all duration-300">
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel-content"
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Accessibility className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Granular Accessibility & Walk Constraints</span>
              {activeCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {activeCount} active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Configure physical mobility, step-free access, and sensory guidance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <span className="text-[11px] text-cyan-400 font-semibold hidden sm:inline">
            {isOpen ? 'Collapse Panel' : 'Expand Configuration'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Nested Configuration Panel */}
      {isOpen && (
        <div
          id="accessibility-panel-content"
          role="region"
          aria-label="Granular Accessibility Configuration"
          className="p-5 border-t border-slate-800 bg-slate-950/70 space-y-6 animate-fade-in"
        >
          {/* 1. Maximum Walk Distance Slider (50m to 1000m, default 200m) */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="max-walk-slider" className="font-bold text-slate-100 flex items-center gap-2">
                <Footprints className="w-4 h-4 text-emerald-400" />
                <span>Maximum Walk Distance</span>
              </label>
              <div className="text-right">
                <span className="text-sm font-extrabold text-cyan-300">
                  {maxWalkDistance} meters
                </span>
                <span className="text-[11px] text-slate-400 block">
                  ~{walkMinutes} min calm walking pace
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <input
                id="max-walk-slider"
                type="range"
                min={50}
                max={1000}
                step={25}
                value={maxWalkDistance}
                onChange={(e) => onChangeMaxWalk(parseInt(e.target.value, 10))}
                className="w-full h-2 rounded-lg bg-slate-800 accent-cyan-400 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-medium px-0.5">
                <span>50m (Minimal)</span>
                <span className="text-cyan-400 font-bold">200m (Standard Default)</span>
                <span>500m</span>
                <span>1000m (Max 1km)</span>
              </div>
            </div>
          </div>

          {/* Checkboxes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 2. Strictly Step-Free Checkbox */}
            <label
              htmlFor="step-free-checkbox"
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                strictlyStepFree
                  ? 'bg-purple-950/30 border-purple-500/50 ring-1 ring-purple-500/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <input
                id="step-free-checkbox"
                type="checkbox"
                checked={strictlyStepFree}
                onChange={(e) => onChangeStrictlyStepFree(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-purple-400 focus:ring-offset-slate-950 accent-purple-500 cursor-pointer"
              />
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>Strictly Step-Free (Elevators/Ramps Only)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Eliminates routes with stairs, escalators, or steep pedestrian overpasses. Enforces 100% barrier-free elevator ingress.
                </p>
              </div>
            </label>

            {/* 3. Requires Auditory Navigation Signals Checkbox */}
            <label
              htmlFor="auditory-signals-checkbox"
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                requiresAuditorySignals
                  ? 'bg-blue-950/30 border-blue-500/50 ring-1 ring-blue-500/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <input
                id="auditory-signals-checkbox"
                type="checkbox"
                checked={requiresAuditorySignals}
                onChange={(e) => onChangeRequiresAuditorySignals(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-400 focus:ring-offset-slate-950 accent-blue-500 cursor-pointer"
              />
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Requires Auditory Navigation Signals</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Prioritizes transit lines & vehicles equipped with acoustic platform chimes, automated voice announcements, and accessible signals.
                </p>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

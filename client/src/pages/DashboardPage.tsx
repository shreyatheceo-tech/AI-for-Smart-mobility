import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Compass,
  Sparkles,
  ArrowRight,
  Clock,
  Sliders,
  Accessibility,
  Footprints,
  MessageSquare,
  Send,
  Loader2,
  Calendar,
  Layers,
  Navigation,
} from 'lucide-react';
import { useJourney } from '../context/JourneyContext.js';
import { useAuth } from '../context/AuthContext.js';
import { PrioritySelector } from '../components/PrioritySelector.js';
import { AccessibilityAccordion } from '../components/AccessibilityAccordion.js';
import { PriorityType, TransportMode } from '../types/index.js';

const QUICK_PRESETS = [
  { origin: 'College', destination: 'Railway Station', priority: 'eco' as PriorityType, label: 'College → Railway Station' },
  { origin: 'Indiranagar', destination: 'Tech Park', priority: 'fastest' as PriorityType, label: 'Indiranagar → Tech Park' },
  { origin: 'Koramangala', destination: 'Airport', priority: 'cheapest' as PriorityType, label: 'Koramangala → Airport' },
  { origin: 'City Center', destination: 'University', priority: 'accessible' as PriorityType, label: 'City Center → University' },
];

export const DashboardPage: React.FC = () => {
  const { runAnalysis, parseNaturalLanguage, isLoading } = useJourney();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mode: 'structured' | 'natural'
  const [inputMode, setInputMode] = useState<'structured' | 'natural'>('structured');

  // Form Fields
  const [origin, setOrigin] = useState('College');
  const [destination, setDestination] = useState('Railway Station');
  const [departureTime, setDepartureTime] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [primaryPriority, setPrimaryPriority] = useState<PriorityType>(
    user?.preferences?.primaryPriority || 'fastest'
  );
  const [selectedPriorities, setSelectedPriorities] = useState<PriorityType[]>([
    user?.preferences?.primaryPriority || 'fastest',
  ]);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>(
    user?.preferences?.accessibilityNeeds || []
  );
  const [maxWalkMeters, setMaxWalkMeters] = useState<number>(
    user?.preferences?.maxWalkMeters || 200
  );
  const [strictlyStepFree, setStrictlyStepFree] = useState<boolean>(false);
  const [requiresAuditorySignals, setRequiresAuditorySignals] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Natural Language prompt
  const [nlQuery, setNlQuery] = useState(
    'I need to go from College to Railway Station, prefer eco and cheap'
  );
  const [nlLoading, setNlLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggleSecondary = (p: PriorityType) => {
    setSelectedPriorities(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleToggleAccessibility = (need: string) => {
    setAccessibilityNeeds(prev =>
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      setErrorMsg('Please specify both origin and destination.');
      return;
    }
    setErrorMsg(null);

    const mergedAccessibilityNeeds = [...accessibilityNeeds];
    if (strictlyStepFree && !mergedAccessibilityNeeds.includes('strictly_step_free')) {
      mergedAccessibilityNeeds.push('strictly_step_free');
    }
    if (requiresAuditorySignals && !mergedAccessibilityNeeds.includes('auditory_signals')) {
      mergedAccessibilityNeeds.push('auditory_signals');
    }

    try {
      await runAnalysis({
        origin: origin.trim(),
        destination: destination.trim(),
        departureTime,
        primaryPriority,
        selectedPriorities,
        accessibilityNeeds: mergedAccessibilityNeeds,
        maxWalkMeters,
      });
      navigate('/app/results');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error running mobility analysis');
    }
  };

  const handleNaturalLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    setNlLoading(true);
    setErrorMsg(null);

    try {
      const parsed = await parseNaturalLanguage(nlQuery);
      setOrigin(parsed.origin);
      setDestination(parsed.destination);
      setPrimaryPriority(parsed.primaryPriority);
      setSelectedPriorities(parsed.selectedPriorities || [parsed.primaryPriority]);
      if (parsed.accessibilityNeeds && parsed.accessibilityNeeds.length > 0) {
        setAccessibilityNeeds(parsed.accessibilityNeeds);
      }

      // Automatically execute analysis with parsed parameters
      await runAnalysis({
        origin: parsed.origin,
        destination: parsed.destination,
        departureTime,
        primaryPriority: parsed.primaryPriority,
        selectedPriorities: parsed.selectedPriorities,
        accessibilityNeeds: parsed.accessibilityNeeds,
      });
      navigate('/app/results');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process natural language travel intent');
    } finally {
      setNlLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Intelligent Journey Planner
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Enter your journey coordinates or describe your trip in plain language. MobiMind AI balances time, fare, emissions, and safety.
        </p>
      </div>

      {/* Input Mode Selector Tabs */}
      <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
        <button
          type="button"
          onClick={() => setInputMode('structured')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            inputMode === 'structured'
              ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Structured Route Form</span>
        </button>

        <button
          type="button"
          onClick={() => setInputMode('natural')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            inputMode === 'natural'
              ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Natural Language Copilot</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Quick Preset Buttons */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Quick Demo Journeys:
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setOrigin(preset.origin);
                setDestination(preset.destination);
                setPrimaryPriority(preset.priority);
                setSelectedPriorities([preset.priority]);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs transition-colors flex items-center gap-1.5"
            >
              <span>{preset.label}</span>
              <span className="text-[10px] text-slate-500 capitalize">({preset.priority})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Natural Language Prompt Tab */}
      {inputMode === 'natural' && (
        <form onSubmit={handleNaturalLanguageSubmit} className="space-y-4">
          <div className="rounded-2xl p-6 bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Describe Your Travel Intent</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Example: “I need to go from College to Railway Station, prefer eco and cheap” or “Take me from Indiranagar to Airport with wheelchair access”.
            </p>

            <div className="relative">
              <textarea
                value={nlQuery}
                onChange={e => setNlQuery(e.target.value)}
                rows={3}
                className="w-full rounded-xl p-4 bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Where would you like to travel, and what are your priorities?"
              />
            </div>

            <button
              type="submit"
              disabled={nlLoading || isLoading}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {nlLoading || isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>MobiMind AI is analyzing options...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Parse Intent & Recommend Route</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Structured Route Form Tab */}
      {inputMode === 'structured' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl p-6 sm:p-8 bg-slate-900/60 border border-slate-800/80 space-y-6">
            {/* Origin & Destination inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Origin Location</span>
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  required
                  placeholder="e.g. College, Indiranagar, Station..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Destination</span>
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  required
                  placeholder="e.g. Railway Station, Tech Park, Airport..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* Departure Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Departure Time (Traffic & Weather Sensitivity)</span>
              </label>
              <input
                type="datetime-local"
                value={departureTime}
                onChange={e => setDepartureTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Priority Selector Component */}
            <PrioritySelector
              primaryPriority={primaryPriority}
              selectedPriorities={selectedPriorities}
              onChangePrimary={setPrimaryPriority}
              onToggleSecondary={handleToggleSecondary}
            />

            {/* Granular Accessibility Controls Configuration Accordion */}
            <AccessibilityAccordion
              isOpen={showAdvanced}
              onToggle={() => setShowAdvanced(!showAdvanced)}
              maxWalkDistance={maxWalkMeters}
              onChangeMaxWalk={setMaxWalkMeters}
              strictlyStepFree={strictlyStepFree}
              onChangeStrictlyStepFree={setStrictlyStepFree}
              requiresAuditorySignals={requiresAuditorySignals}
              onChangeRequiresAuditorySignals={setRequiresAuditorySignals}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-bold text-base bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 text-slate-950 hover:brightness-110 shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>Analyzing All Multi-Modal Routes with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5 text-slate-950" />
                  <span>Analyze Mobility Options & Recommend</span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

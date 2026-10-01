import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Compass,
  Sparkles,
  ArrowRight,
  Clock,
  Sliders,
  Send,
  Loader2,
  Calendar,
  Layers,
  Navigation,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useJourney } from '../context/JourneyContext.js';
import { useAuth } from '../context/AuthContext.js';
import { PrioritySelector } from '../components/PrioritySelector.js';
import { AccessibilityAccordion } from '../components/AccessibilityAccordion.js';
import { ThreeDTabNav, TabItem } from '../components/ThreeDTabNav.js';
import { ElevatedLayout } from '../components/ElevatedLayout.js';
import { PriorityType } from '../types/index.js';

const QUICK_PRESETS = [
  { origin: 'College', destination: 'Railway Station', priority: 'eco' as PriorityType, label: 'College → Railway Station', badge: '🌱 Eco Trail' },
  { origin: 'Indiranagar', destination: 'Tech Park', priority: 'fastest' as PriorityType, label: 'Indiranagar → Tech Park', badge: '⚡ Rapid' },
  { origin: 'Koramangala', destination: 'Airport', priority: 'cheapest' as PriorityType, label: 'Koramangala → Airport', badge: '💰 Budget' },
  { origin: 'City Center', destination: 'University', priority: 'accessible' as PriorityType, label: 'City Center → University', badge: '♿ Step-Free' },
];

const PLANNER_TABS: TabItem[] = [
  { id: 'structured', label: 'Structured Planner', icon: <Sliders className="w-3.5 h-3.5" /> },
  { id: 'natural', label: 'AI Natural Language', icon: <Sparkles className="w-3.5 h-3.5 text-rose-500" /> },
];

export const DashboardPage: React.FC = () => {
  const { runAnalysis, parseNaturalLanguage, isLoading } = useJourney();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inputMode, setInputMode] = useState<'structured' | 'natural'>('structured');

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
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const [nlQuery, setNlQuery] = useState(
    'I need to go from College to Railway Station, prefer eco and cheap'
  );
  const [nlLoading, setNlLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggleSecondary = (p: PriorityType) => {
    setSelectedPriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
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
        accessibilityNeeds: mergedAccessibilityNeeds,
        maxWalkMeters,
      });
      navigate('/app/results');
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis failed. Please check network connection.');
    }
  };

  const handleNlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    setNlLoading(true);
    setErrorMsg(null);
    try {
      const parsed = await parseNaturalLanguage(nlQuery);
      if (parsed.origin) setOrigin(parsed.origin);
      if (parsed.destination) setDestination(parsed.destination);
      if (parsed.primaryPriority) setPrimaryPriority(parsed.primaryPriority);
      setInputMode('structured');
    } catch {
      setErrorMsg('Could not parse natural language. Please use the structured fields.');
    } finally {
      setNlLoading(false);
    }
  };

  return (
    <ElevatedLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-cascade">
        {/* 1. AIRY ELEVATED HERO HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-cute-full bg-sage-100 text-sage-700 text-xs font-bold border border-sage-200 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-sage-500" />
            <span>Interactive 3D Multi-Modal Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-warm-charcoal">
            Multi-Modal Route Planner
          </h1>
          <p className="text-sm text-warm-muted max-w-xl mx-auto font-normal leading-relaxed">
            AI balances time, cost, carbon emissions, and verified safety corridors to craft your optimal journey.
          </p>
        </div>

        {/* 2. 3D TAB NAVIGATION SELECTOR (PHYSICAL INSET) */}
        <div className="flex justify-center">
          <ThreeDTabNav
            tabs={PLANNER_TABS}
            activeTabId={inputMode}
            onChange={(id) => setInputMode(id as 'structured' | 'natural')}
          />
        </div>

        {/* 3. QUICK COMMUTER PRESET PILLS (STAGGERED 3D CARDS) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-warm-muted font-bold px-1">
            <span>QUICK URBAN PRESETS</span>
            <span>Tap to autofill</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setOrigin(preset.origin);
                  setDestination(preset.destination);
                  setPrimaryPriority(preset.priority);
                }}
                className="clay-card card-3d rounded-cute p-3.5 bg-warm-white border border-warm-border/80 text-left hover:-translate-y-1 transition-all duration-200 squish-click flex flex-col justify-between space-y-1.5"
              >
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cream-200 text-warm-charcoal self-start">
                  {preset.badge}
                </span>
                <span className="text-xs font-bold text-warm-charcoal line-clamp-1 leading-snug">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. MAIN 3D FLOATING PLANNING FORM */}
        <div className="clay-card rounded-cute-lg bg-warm-white p-6 sm:p-10 border border-warm-border/80 shadow-float relative overflow-hidden">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-cute bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-cascade">
              {errorMsg}
            </div>
          )}

          {inputMode === 'natural' ? (
            /* Natural Language AI Prompt Form */
            <form onSubmit={handleNlSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-warm-charcoal flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>Ask the AI Mobility Copilot in Plain English</span>
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={nlQuery}
                    onChange={(e) => setNlQuery(e.target.value)}
                    placeholder="e.g., 'Need to reach Railway Station from College by 6 PM, avoid crowded buses and prefer scenic bike paths'..."
                    className="w-full p-4 rounded-cute bg-cream-100/80 border border-warm-border text-sm text-warm-charcoal placeholder-warm-muted/70 focus:outline-none focus:bg-white focus:border-sage-400 shadow-neumorphic-inset transition-all leading-relaxed font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={nlLoading}
                className="w-full py-3.5 rounded-cute-full font-bold text-sm bg-rose-400 hover:bg-rose-500 text-white shadow-float hover:shadow-float-hover transition-all duration-200 squish-click flex items-center justify-center gap-2"
              >
                {nlLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Interpreting Intent with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
                    <span>Parse & Populate Route Parameters</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Structured Form */
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Origin and Destination Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Origin */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-warm-charcoal flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sage-500" />
                    <span>Origin / Starting Point</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. College, Indiranagar, Home"
                    className="w-full px-4 py-3 rounded-cute-sm bg-cream-100/80 border border-warm-border text-sm text-warm-charcoal placeholder-warm-muted focus:outline-none focus:bg-white focus:border-sage-400 shadow-neumorphic-inset transition-all font-medium"
                  />
                </div>

                {/* Destination */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-warm-charcoal flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-rose-500" />
                    <span>Destination</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Railway Station, Tech Park"
                    className="w-full px-4 py-3 rounded-cute-sm bg-cream-100/80 border border-warm-border text-sm text-warm-charcoal placeholder-warm-muted focus:outline-none focus:bg-white focus:border-rose-400 shadow-neumorphic-inset transition-all font-medium"
                  />
                </div>
              </div>

              {/* Departure Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-warm-charcoal flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-warm-muted" />
                  <span>Departure Time</span>
                </label>
                <input
                  type="datetime-local"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full sm:w-72 px-4 py-2.5 rounded-cute-sm bg-cream-100/80 border border-warm-border text-xs text-warm-charcoal focus:outline-none focus:bg-white focus:border-sage-400 shadow-neumorphic-inset font-medium"
                />
              </div>

              {/* 3D Priority Selector */}
              <PrioritySelector
                primaryPriority={primaryPriority}
                selectedPriorities={selectedPriorities}
                onChangePrimary={setPrimaryPriority}
                onToggleSecondary={handleToggleSecondary}
              />

              {/* 3D Accessibility Accordion */}
              <AccessibilityAccordion
                isOpen={isAccordionOpen}
                onToggle={() => setIsAccordionOpen(!isAccordionOpen)}
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
                className="w-full py-4 rounded-cute-full font-extrabold text-sm bg-rose-400 hover:bg-rose-500 text-white shadow-float hover:shadow-float-hover transition-all duration-200 squish-click flex items-center justify-center gap-2.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Evaluating Multi-Modal Routes & AI Rationale...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 text-white" />
                    <span>Find Optimal Multi-Modal Routes</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </ElevatedLayout>
  );
};

export default DashboardPage;

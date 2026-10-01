import React, { useEffect, useState } from 'react';
import {
  Sliders,
  Save,
  Check,
  Zap,
  DollarSign,
  Leaf,
  Shield,
  Accessibility,
  Footprints,
  Layers,
  RotateCcw,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { PriorityType, TransportMode } from '../types/index.js';
import { ElevatedLayout } from '../components/ElevatedLayout.js';

export const PreferencesPage: React.FC = () => {
  const { isAuthenticated, updateLocalPreferences } = useAuth();

  const [primaryPriority, setPrimaryPriority] = useState<PriorityType>('fastest');
  const [weights, setWeights] = useState({
    time: 0.35,
    cost: 0.25,
    co2: 0.2,
    safety: 0.1,
    accessibility: 0.1,
  });
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([]);
  const [preferredModes, setPreferredModes] = useState<TransportMode[]>([
    'bus',
    'metro',
    'train',
    'car',
    'walk',
    'cycle',
    'multimodal',
  ]);
  const [maxWalkMeters, setMaxWalkMeters] = useState<number>(800);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrefs = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getPreferences();
        const p = res.preferences;
        if (p) {
          setPrimaryPriority(p.primaryPriority);
          if (p.priorityWeights) setWeights(p.priorityWeights);
          if (p.accessibilityNeeds) setAccessibilityNeeds(p.accessibilityNeeds);
          if (p.preferredModes) setPreferredModes(p.preferredModes);
          if (p.maxWalkMeters) setMaxWalkMeters(p.maxWalkMeters);
        }
      } catch (err: any) {
        setError(err.message || 'Could not load saved preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchPrefs();
  }, [isAuthenticated]);

  const handleResetDefaults = () => {
    setPrimaryPriority('fastest');
    setWeights({
      time: 0.35,
      cost: 0.25,
      co2: 0.2,
      safety: 0.1,
      accessibility: 0.1,
    });
    setAccessibilityNeeds([]);
    setPreferredModes(['bus', 'metro', 'train', 'car', 'walk', 'cycle', 'multimodal']);
    setMaxWalkMeters(800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to persist travel preferences.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await api.updatePreferences({
        primaryPriority,
        priorityWeights: weights,
        accessibilityNeeds,
        preferredModes,
        maxWalkMeters,
      });
      updateLocalPreferences(res.preferences);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ElevatedLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-cascade">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-warm-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-cute-sm bg-sage-100 text-sage-600 flex items-center justify-center shadow-sm">
                <Sliders className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-extrabold text-warm-charcoal tracking-tight">
                Personalized Mobility Tuning
              </h1>
            </div>
            <p className="text-xs text-warm-muted pl-12 font-normal">
              Fine-tune how the Gemini Decision Engine weights travel duration, commuting expenses, emissions, and safety.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-4 py-2 rounded-cute-full bg-cream-100 hover:bg-cream-200 border border-warm-border text-xs font-bold text-warm-charcoal transition-colors squish-click"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-cute bg-sage-100 border border-sage-300 text-sage-800 text-xs font-bold flex items-center gap-2 animate-cascade">
            <Check className="w-4 h-4 text-sage-600" />
            <span>Mobility profile saved successfully! New recommendations will use these criteria.</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-cute bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Priority selector */}
          <div className="clay-card rounded-cute-lg p-6 bg-warm-white border border-warm-border space-y-4 shadow-float">
            <label className="font-extrabold text-warm-charcoal text-sm block">
              Default Primary Optimization Metric
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: 'fastest', label: 'Fastest', icon: <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> },
                { id: 'cheapest', label: 'Cheapest', icon: <DollarSign className="w-4 h-4 text-emerald-600" /> },
                { id: 'eco', label: 'Eco-friendly', icon: <Leaf className="w-4 h-4 text-sage-600 fill-sage-500" /> },
                { id: 'safer', label: 'Safer', icon: <Shield className="w-4 h-4 text-rose-500 fill-rose-400" /> },
                { id: 'accessible', label: 'Accessible', icon: <Accessibility className="w-4 h-4 text-lavender-600" /> },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPrimaryPriority(p.id as PriorityType)}
                  className={`p-3.5 rounded-cute border text-xs font-bold flex items-center justify-center gap-2 transition-all squish-click ${
                    primaryPriority === p.id
                      ? 'clay-tab-pressed bg-rose-100 text-rose-900 border-rose-400 font-extrabold shadow-sm'
                      : 'clay-pill-floating bg-cream-100 text-warm-muted border-warm-border hover:text-warm-charcoal'
                  }`}
                >
                  {p.icon}
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Decision Weights Sliders */}
          <div className="clay-card rounded-cute-lg p-6 bg-warm-white border border-warm-border space-y-6 shadow-float">
            <div>
              <h3 className="font-extrabold text-warm-charcoal text-sm">
                Multi-Criteria Heuristic Weights
              </h3>
              <p className="text-xs text-warm-muted mt-1">
                Calibrate how the ranking algorithm weights each dimension (0.0 = Ignore, 1.0 = Highest Priority).
              </p>
            </div>

            <div className="space-y-4">
              {/* Time */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-warm-charcoal">
                  <span>Travel Time Importance</span>
                  <span className="text-amber-600 font-extrabold">{(weights.time * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={weights.time}
                  onChange={(e) => setWeights({ ...weights, time: parseFloat(e.target.value) })}
                  className="w-full h-2 rounded-lg bg-cream-200 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Cost */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-warm-charcoal">
                  <span>Cost / Fare Sensitivity</span>
                  <span className="text-emerald-600 font-extrabold">{(weights.cost * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={weights.cost}
                  onChange={(e) => setWeights({ ...weights, cost: parseFloat(e.target.value) })}
                  className="w-full h-2 rounded-lg bg-cream-200 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* CO2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-warm-charcoal">
                  <span>Environmental Impact (CO₂ Savings)</span>
                  <span className="text-sage-600 font-extrabold">{(weights.co2 * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={weights.co2}
                  onChange={(e) => setWeights({ ...weights, co2: parseFloat(e.target.value) })}
                  className="w-full h-2 rounded-lg bg-cream-200 accent-sage-500 cursor-pointer"
                />
              </div>

              {/* Safety */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-warm-charcoal">
                  <span>Safety Corridor Index</span>
                  <span className="text-rose-500 font-extrabold">{(weights.safety * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={weights.safety}
                  onChange={(e) => setWeights({ ...weights, safety: parseFloat(e.target.value) })}
                  className="w-full h-2 rounded-lg bg-cream-200 accent-rose-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-cute-full font-extrabold text-sm bg-rose-400 hover:bg-rose-500 text-white shadow-float hover:shadow-float-hover transition-all duration-200 squish-click flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving tuning profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-white" />
                <span>Save Mobility Profile</span>
              </>
            )}
          </button>
        </form>
      </div>
    </ElevatedLayout>
  );
};

export default PreferencesPage;

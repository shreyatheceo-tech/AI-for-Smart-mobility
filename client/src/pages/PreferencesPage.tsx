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
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { PriorityType, TransportMode, UserPreferences } from '../types/index.js';

export const PreferencesPage: React.FC = () => {
  const { user, isAuthenticated, updateLocalPreferences } = useAuth();

  const [primaryPriority, setPrimaryPriority] = useState<PriorityType>('fastest');
  const [weights, setWeights] = useState({
    time: 0.35,
    cost: 0.25,
    co2: 0.20,
    safety: 0.10,
    accessibility: 0.10,
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
        console.warn('Could not load preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrefs();
  }, [isAuthenticated]);

  const handleWeightChange = (key: keyof typeof weights, value: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetDefaults = () => {
    setWeights({
      time: 0.35,
      cost: 0.25,
      co2: 0.20,
      safety: 0.10,
      accessibility: 0.10,
    });
    setPrimaryPriority('fastest');
    setPreferredModes(['bus', 'metro', 'train', 'car', 'walk', 'cycle', 'multimodal']);
    setAccessibilityNeeds([]);
    setMaxWalkMeters(800);
  };

  const handleToggleMode = (mode: TransportMode) => {
    setPreferredModes(prev =>
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    );
  };

  const handleToggleAccessibility = (need: string) => {
    setAccessibilityNeeds(prev =>
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    );
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Personalized Mobility Profile
            </h1>
          </div>
          <p className="text-xs text-slate-400 pl-10">
            Tune how the Gemini Decision Engine balances travel duration, commuting expenses, emissions, and safety.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Mobility profile saved successfully! New recommendations will use these criteria.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Primary Priority selector */}
        <div className="rounded-2xl p-6 bg-slate-900/60 border border-slate-800/80 space-y-4">
          <label className="font-bold text-white text-sm block">
            Default Primary Priority
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { id: 'fastest', label: 'Fastest', icon: <Zap className="w-4 h-4 text-amber-400" /> },
              { id: 'cheapest', label: 'Cheapest', icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
              { id: 'eco', label: 'Eco-friendly', icon: <Leaf className="w-4 h-4 text-teal-400" /> },
              { id: 'safer', label: 'Safer', icon: <Shield className="w-4 h-4 text-blue-400" /> },
              { id: 'accessible', label: 'Accessible', icon: <Accessibility className="w-4 h-4 text-purple-400" /> },
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPrimaryPriority(p.id as PriorityType)}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  primaryPriority === p.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-md ring-1 ring-cyan-400/30'
                    : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Priority Dimension Weights Sliders */}
        <div className="rounded-2xl p-6 bg-slate-900/60 border border-slate-800/80 space-y-6">
          <div>
            <h3 className="font-bold text-white text-sm">
              Decision Scoring Dimension Weights
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Adjust the relative importance of each metric (0.0 = Ignore, 1.0 = Highest Priority).
            </p>
          </div>

          <div className="space-y-4">
            {/* Time */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Time Efficiency Weight</span>
                </span>
                <strong className="text-cyan-400 font-bold">{Math.round(weights.time * 100)}%</strong>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={weights.time}
                onChange={e => handleWeightChange('time', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Cost */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cost Economy Weight</span>
                </span>
                <strong className="text-cyan-400 font-bold">{Math.round(weights.cost * 100)}%</strong>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={weights.cost}
                onChange={e => handleWeightChange('cost', parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* CO2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Leaf className="w-3.5 h-3.5 text-teal-400" />
                  <span>CO₂ Emission Reduction Weight</span>
                </span>
                <strong className="text-cyan-400 font-bold">{Math.round(weights.co2 * 100)}%</strong>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={weights.co2}
                onChange={e => handleWeightChange('co2', parseFloat(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

            {/* Safety */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>Safety & Station Surveillance Weight</span>
                </span>
                <strong className="text-cyan-400 font-bold">{Math.round(weights.safety * 100)}%</strong>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={weights.safety}
                onChange={e => handleWeightChange('safety', parseFloat(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer"
              />
            </div>

            {/* Accessibility */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Accessibility className="w-3.5 h-3.5 text-purple-400" />
                  <span>Accessibility & Step-Free Weight</span>
                </span>
                <strong className="text-cyan-400 font-bold">{Math.round(weights.accessibility * 100)}%</strong>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={weights.accessibility}
                onChange={e => handleWeightChange('accessibility', parseFloat(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Preferred Modes Selector */}
        <div className="rounded-2xl p-6 bg-slate-900/60 border border-slate-800/80 space-y-4">
          <label className="font-bold text-white text-sm block">
            Allowed & Preferred Transit Modes
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'metro', label: '🚇 Metro / Subway' },
              { id: 'bus', label: '🚌 Public Bus' },
              { id: 'train', label: '🚆 Suburban Rail' },
              { id: 'car', label: '🚗 Car / Taxi' },
              { id: 'cycle', label: '🚴 Smart Cycle' },
              { id: 'walk', label: '🚶 Walking' },
              { id: 'multimodal', label: '🔄 Multi-Modal' },
            ].map(m => (
              <label
                key={m.id}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={preferredModes.includes(m.id as TransportMode)}
                  onChange={() => handleToggleMode(m.id as TransportMode)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-xs text-slate-200 font-medium">{m.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Max Walk Distance */}
        <div className="rounded-2xl p-6 bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-emerald-400" />
              <span>Maximum Walking Tolerance</span>
            </span>
            <strong className="text-cyan-400 font-bold">{maxWalkMeters} meters (~{Math.round(maxWalkMeters / 80)} mins)</strong>
          </div>
          <input
            type="range"
            min={200}
            max={3000}
            step={100}
            value={maxWalkMeters}
            onChange={e => setMaxWalkMeters(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-slate-950" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

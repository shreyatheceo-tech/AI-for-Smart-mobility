import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Trash2,
  ArrowRight,
  Clock,
  Compass,
  MapPin,
  Calendar,
  Sparkles,
  TrendingDown,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useJourney } from '../context/JourneyContext.js';
import { Journey } from '../types/index.js';
import { getModeIcon } from '../components/AiRecommendationCard.js';
import { ElevatedLayout } from '../components/ElevatedLayout.js';

export const HistoryPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { loadSavedJourneyToAnalysis } = useJourney();
  const navigate = useNavigate();

  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchJourneys = async () => {
      try {
        const res = await api.getJourneys();
        setJourneys(res.journeys);
      } catch (err: any) {
        setError(err.message || 'Failed to load journey history.');
      } finally {
        setLoading(false);
      }
    };

    fetchJourneys();
  }, [isAuthenticated]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteJourney(id);
      setJourneys((prev) => prev.filter((j) => j.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete journey');
    }
  };

  const handleOpenJourney = (journey: Journey) => {
    loadSavedJourneyToAnalysis(journey);
    navigate('/app/results');
  };

  return (
    <ElevatedLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-cascade">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-warm-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-cute-sm bg-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
                <HistoryIcon className="w-4 h-4" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-warm-charcoal tracking-tight">
                Saved Journey Board
              </h1>
            </div>
            <p className="text-xs text-warm-muted pl-10 font-normal">
              Review saved multi-modal itineraries, carbon reductions, and route comparisons.
            </p>
          </div>

          <Link
            to="/app"
            className="px-5 py-2.5 rounded-cute-full bg-rose-400 hover:bg-rose-500 text-white font-bold text-xs shadow-float hover:shadow-float-hover spring-bounce squish-click flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Plan New Route</span>
          </Link>
        </div>

        {/* Not Authenticated Warning */}
        {!isAuthenticated && (
          <div className="clay-card rounded-cute-lg p-10 bg-warm-white border border-warm-border text-center space-y-4 max-w-lg mx-auto shadow-float">
            <HistoryIcon className="w-12 h-12 text-warm-muted mx-auto" />
            <h3 className="text-lg font-extrabold text-warm-charcoal">Sign In to Track Commutes</h3>
            <p className="text-xs text-warm-muted">
              Create an account or sign in to bookmark personalized mobility journeys and sync across devices.
            </p>
            <Link
              to="/login?redirect=/app/history"
              className="inline-flex px-6 py-3 rounded-cute-full font-bold text-xs bg-rose-400 hover:bg-rose-500 text-white shadow-float squish-click"
            >
              Sign In to MobiMind
            </Link>
          </div>
        )}

        {/* Loading Spinner */}
        {isAuthenticated && loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
            <span className="text-xs text-warm-muted font-medium">Fetching your journey board...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-cute bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Empty State */}
        {isAuthenticated && !loading && journeys.length === 0 && (
          <div className="clay-card rounded-cute-lg p-12 bg-warm-white border border-warm-border text-center space-y-4 max-w-lg mx-auto shadow-float">
            <Compass className="w-12 h-12 text-sage-400 mx-auto" />
            <h3 className="text-lg font-extrabold text-warm-charcoal">No Saved Journeys Yet</h3>
            <p className="text-xs text-warm-muted leading-relaxed">
              When you evaluate routes on the Route Planner or Pinterest Explore feed, click &quot;Save to Pins&quot; to keep them here for quick access.
            </p>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-cute-full font-bold text-xs bg-sage-400 hover:bg-sage-500 text-white shadow-float squish-click"
            >
              <span>Explore Multi-Modal Routes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Staggered Floating Cards (Zero Rigid Tables!) */}
        {isAuthenticated && !loading && journeys.length > 0 && (
          <div className="space-y-4">
            {journeys.map((j, idx) => {
              const recOption = j.aiRecommendation
                ? j.rawOptions.find((o) => o.id === j.aiRecommendation?.recommendedOptionId)
                : j.rawOptions[0];

              return (
                <div
                  key={j.id}
                  onClick={() => handleOpenJourney(j)}
                  className={`clay-card rounded-cute-lg p-6 bg-warm-white border border-warm-border/80 shadow-float hover:shadow-float-hover transition-all duration-300 transform hover:-translate-y-1 cursor-pointer squish-click flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 cascade-item stagger-${(idx % 9) + 1}`}
                >
                  {/* Origin & Destination Identity */}
                  <div className="space-y-2 min-w-[260px]">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-cute-sm bg-cream-100 border border-warm-border flex items-center justify-center text-warm-charcoal font-bold text-xs shadow-sm">
                        {recOption ? getModeIcon(recOption.mode) : '🧭'}
                      </span>
                      <h3 className="font-extrabold text-base text-warm-charcoal flex items-center gap-2">
                        <span>{j.origin}</span>
                        <span className="text-rose-400 font-normal">→</span>
                        <span>{j.destination}</span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-warm-muted pl-10 font-medium">
                      <span>Priority: <strong className="text-warm-charcoal capitalize">{j.primaryPriority}</strong></span>
                      <span>•</span>
                      <span>{new Date(j.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Multi-Modal Metrics */}
                  {recOption && (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="px-3.5 py-1.5 rounded-cute bg-cream-100 border border-warm-border text-center">
                        <p className="text-[10px] font-bold text-warm-muted uppercase">DURATION</p>
                        <p className="text-xs font-extrabold text-warm-charcoal">{recOption.durationMin} min</p>
                      </div>

                      <div className="px-3.5 py-1.5 rounded-cute bg-emerald-50 border border-emerald-200 text-center">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase">FARE</p>
                        <p className="text-xs font-extrabold text-emerald-800">
                          {recOption.cost === 0 ? 'FREE' : `₹${recOption.cost}`}
                        </p>
                      </div>

                      <div className="px-3.5 py-1.5 rounded-cute bg-sage-50 border border-sage-200 text-center">
                        <p className="text-[10px] font-bold text-sage-600 uppercase">CO₂ SAVED</p>
                        <p className="text-xs font-extrabold text-sage-800">
                          {recOption.co2Grams ? `-${(recOption.co2Grams / 1000).toFixed(1)} kg` : '0 kg'}
                        </p>
                      </div>

                      <div className="px-3.5 py-1.5 rounded-cute bg-rose-50 border border-rose-200 text-center">
                        <p className="text-[10px] font-bold text-rose-500 uppercase">SAFETY</p>
                        <p className="text-xs font-extrabold text-rose-800">
                          {recOption.scores?.safetyScore ? `${Math.round(recOption.scores.safetyScore)}%` : '95%'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                    <button
                      onClick={() => handleOpenJourney(j)}
                      className="px-4 py-2 rounded-cute-full bg-rose-400 hover:bg-rose-500 text-white font-bold text-xs shadow-sm squish-click flex items-center gap-1.5"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(j.id, e)}
                      className="p-2 rounded-cute-full bg-cream-100 hover:bg-rose-50 text-warm-muted hover:text-rose-600 transition-colors squish-click"
                      title="Delete Pin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ElevatedLayout>
  );
};

export default HistoryPage;

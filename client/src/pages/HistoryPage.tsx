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
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useJourney } from '../context/JourneyContext.js';
import { Journey } from '../types/index.js';
import { getModeIcon } from '../components/AiRecommendationCard.js';

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
      setJourneys(prev => prev.filter(j => j.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete journey');
    }
  };

  const handleOpenJourney = (journey: Journey) => {
    loadSavedJourneyToAnalysis(journey);
    navigate('/app/results');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
          <HistoryIcon className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Sign In to View Journey History</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your past mobility recommendations, saved itineraries, and commute analytics are stored securely with your account.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            to="/login?redirect=/app/history"
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 text-slate-950 hover:brightness-110"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-6 py-2.5 rounded-xl font-semibold text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <HistoryIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Journey History & Saved Routes
            </h1>
          </div>
          <p className="text-xs text-slate-400 pl-10">
            Review past multi-modal recommendations or re-run any saved route with current live traffic.
          </p>
        </div>

        <Link
          to="/app"
          className="px-4 py-2 rounded-xl font-semibold text-xs bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 hover:brightness-110 shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
        >
          <Compass className="w-4 h-4 text-slate-950" />
          <span>New Route Analysis</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <p className="text-xs text-slate-400">Loading your saved journeys...</p>
        </div>
      ) : journeys.length === 0 ? (
        <div className="rounded-2xl p-12 bg-slate-900/40 border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">No Saved Journeys Yet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Analyze a route from the Route Planner and click “Save Journey” to bookmark it here.
            </p>
          </div>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 text-slate-950 hover:brightness-110"
          >
            <span>Plan Your First Smart Route</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {journeys.map(j => {
            const topOption = j.rawOptions?.find(o => o.id === j.aiRecommendation?.recommendedOptionId) || j.rawOptions?.[0];
            const dateStr = new Date(j.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={j.id}
                onClick={() => handleOpenJourney(j)}
                className="group cursor-pointer rounded-2xl p-5 bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900/90 hover:border-cyan-500/50 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Left details */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center shrink-0">
                    {getModeIcon(j.aiRecommendation?.recommendedMode || 'multimodal', 'w-6 h-6')}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                        {j.origin} → {j.destination}
                      </h3>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                        {j.primaryPriority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {j.explanation || j.aiRecommendation?.headline}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {dateStr}
                      </span>
                      {topOption && (
                        <>
                          <span>•</span>
                          <span>⏱️ {topOption.durationMin} mins</span>
                          <span>•</span>
                          <span>💰 ₹{topOption.cost}</span>
                          <span>•</span>
                          <span>🌱 {topOption.co2Grams}g CO₂</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(j.id, e)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete journey from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-xs font-semibold text-slate-300 transition-all">
                    <span>Re-open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  ArrowLeft,
  Bookmark,
  Check,
  Share2,
  Sliders,
  MapPin,
  Calendar,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useJourney } from '../context/JourneyContext.js';
import { useAuth } from '../context/AuthContext.js';
import { AiRecommendationCard } from '../components/AiRecommendationCard.js';
import { RouteComparisonCard } from '../components/RouteComparisonCard.js';
import { InteractiveMap } from '../components/InteractiveMap.js';
import { NavigationSimulator } from '../components/NavigationSimulator.js';
import { ScoreRadar } from '../components/ScoreRadar.js';
import { WeatherWidget } from '../components/WeatherWidget.js';

export const ResultsPage: React.FC = () => {
  const { currentAnalysis, selectedOption, setSelectedOption, saveCurrentJourney, isSaving } = useJourney();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [navSimulatorOpen, setNavSimulatorOpen] = useState(false);

  // If no analysis exists yet in state, show fallback banner with button to launch search
  if (!currentAnalysis) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">No Journey Analyzed Yet</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Please enter your origin and destination in the Route Planner to receive AI-ranked mobility recommendations.
          </p>
        </div>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Route Planner</span>
        </Link>
      </div>
    );
  }

  const { origin, destination, originCoords, destinationCoords, options, recommendation, weather, primaryPriority } = currentAnalysis;
  const activeOption = selectedOption || options[0];

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/app/results');
      return;
    }
    const res = await saveCurrentJourney();
    if (res) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/app"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {origin} <span className="text-cyan-400 font-normal">→</span> {destination}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 pl-8">
            <span>Primary Priority: <strong className="text-cyan-300 capitalize">{primaryPriority}</strong></span>
            <span>•</span>
            <span>{options.length} viable modes analyzed</span>
          </div>
        </div>

        {/* Action buttons: Save & New Query */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleSave}
            disabled={isSaving || savedSuccess}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              savedSuccess
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-cyan-500/50'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved to History</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAuthenticated ? 'Save Journey' : 'Sign In to Save'}</span>
              </>
            )}
          </button>

          <Link
            to="/app"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Adjust Query</span>
          </Link>
        </div>
      </div>

      {/* Prominent Gemini AI Recommendation Card */}
      <AiRecommendationCard
        recommendation={recommendation}
        option={options.find(o => o.id === recommendation.recommendedOptionId)}
        onStartRoute={() => setNavSimulatorOpen(true)}
      />

      {/* Main Grid: Interactive Map + Ranked Options List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Comparison Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>All Viable Mobility Options</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                Ranked by AI Score
              </span>
            </h2>
            <span className="text-xs text-slate-400">Click a card to inspect on map</span>
          </div>

          <div className="space-y-3.5">
            {options.map(opt => (
              <RouteComparisonCard
                key={opt.id}
                option={opt}
                isSelected={activeOption.id === opt.id}
                isAiTopPick={opt.id === recommendation.recommendedOptionId}
                onSelect={() => setSelectedOption(opt)}
                onStartRoute={() => setNavSimulatorOpen(true)}
              />
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Interactive Map, Weather & Radar */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
                Interactive Route Map
              </span>
              <span className="text-cyan-400 font-medium capitalize">
                Showing: {activeOption.title}
              </span>
            </div>

            {/* Leaflet Map */}
            <InteractiveMap
              origin={origin}
              destination={destination}
              originCoords={originCoords}
              destinationCoords={destinationCoords}
              selectedOption={activeOption}
            />
          </div>

          {/* Weather Widget */}
          <WeatherWidget weather={weather} />

          {/* Decision Criteria Breakdown for the Active Option */}
          <ScoreRadar
            scores={activeOption.scores}
            title={`${activeOption.title} – Criteria Scores`}
          />
        </div>
      </div>

      {/* Live Navigation Guidance Simulator Modal */}
      <NavigationSimulator
        isOpen={navSimulatorOpen}
        option={activeOption}
        origin={origin}
        destination={destination}
        onClose={() => setNavSimulatorOpen(false)}
      />
    </div>
  );
};

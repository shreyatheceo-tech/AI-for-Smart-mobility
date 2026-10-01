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
  Navigation,
} from 'lucide-react';
import { useJourney } from '../context/JourneyContext.js';
import { useAuth } from '../context/AuthContext.js';
import { ElevatedLayout } from '../components/ElevatedLayout.js';
import { AiRecommendationCard } from '../components/AiRecommendationCard.js';
import { AiRationaleCard } from '../components/AiRationaleCard.js';
import { ActionableCtas } from '../components/ActionableCtas.js';
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

  // Fallback when no active query
  if (!currentAnalysis) {
    return (
      <ElevatedLayout>
        <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-cute bg-sage-100 border border-sage-200 flex items-center justify-center text-sage-600 mx-auto shadow-float">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-warm-charcoal">No Journey Analyzed Yet</h2>
            <p className="text-xs text-warm-muted leading-relaxed">
              Please enter your origin and destination in the Route Planner to receive AI-ranked mobility recommendations.
            </p>
          </div>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-cute-full font-bold text-xs bg-rose-400 hover:bg-rose-500 text-white shadow-float hover:shadow-float-hover spring-bounce squish-click"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Open Multi-Modal Route Planner</span>
          </Link>
        </div>
      </ElevatedLayout>
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
    <ElevatedLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-cascade">
        {/* Top Header & Navigation Bar */}
        <div className="clay-card rounded-cute-lg p-6 bg-warm-white border border-warm-border shadow-float flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link
                to="/app"
                className="p-2 rounded-cute-sm bg-cream-100 border border-warm-border text-warm-charcoal hover:bg-cream-200 transition-colors squish-click"
                title="Back to planner"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-xl sm:text-2xl font-extrabold text-warm-charcoal tracking-tight flex items-center gap-2">
                <span>{origin}</span>
                <span className="text-rose-400 font-normal">→</span>
                <span>{destination}</span>
              </h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-warm-muted pl-11 font-medium">
              <span>
                Optimization: <strong className="text-rose-500 capitalize">{primaryPriority}</strong>
              </span>
              <span>•</span>
              <span>{options.length} viable modes analyzed</span>
            </div>
          </div>

          {/* Action buttons: Save & New Query */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleSave}
              disabled={isSaving || savedSuccess}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-cute-full text-xs font-bold border transition-all squish-click ${
                savedSuccess
                  ? 'bg-sage-100 text-sage-700 border-sage-300'
                  : 'clay-pill-floating bg-warm-white hover:bg-cream-50 text-warm-charcoal border-warm-border'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-sage-600" />
                  <span>Saved to Board</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-rose-500" />
                  <span>{isAuthenticated ? 'Save to Pins' : 'Sign In to Save'}</span>
                </>
              )}
            </button>

            <Link
              to="/app"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-cute-full text-xs font-bold bg-cream-100 hover:bg-cream-200 text-warm-charcoal border border-warm-border transition-colors squish-click"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Modify Query</span>
            </Link>
          </div>
        </div>

        {/* Gemini AI Recommendation Card */}
        <AiRecommendationCard
          recommendation={recommendation}
          option={options.find((o) => o.id === recommendation.recommendedOptionId)}
          onStartRoute={() => setNavSimulatorOpen(true)}
        />

        {/* Main Grid: Interactive Map + Ranked Options List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Comparison Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-warm-charcoal flex items-center gap-2">
                <span>All Viable Mobility Options</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cream-200 text-warm-charcoal">
                  Ranked by AI
                </span>
              </h2>
              <span className="text-xs text-warm-muted">Click a card to inspect route</span>
            </div>

            <div className="space-y-4">
              {options.map((opt) => (
                <RouteComparisonCard
                  key={opt.id}
                  option={opt}
                  origin={origin}
                  destination={destination}
                  isSelected={activeOption.id === opt.id}
                  isAiTopPick={opt.id === recommendation.recommendedOptionId}
                  onSelect={() => setSelectedOption(opt)}
                  onStartRoute={() => setNavSimulatorOpen(true)}
                />
              ))}
            </div>
          </div>

          {/* Right Column: AI Rationale Card + Interactive Map, Actionable CTAs & Radar */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* AI Rationale Card directly above the map */}
            <AiRationaleCard
              selectedOption={activeOption}
              carOption={options.find((o) => o.mode === 'car')}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-warm-muted">
                <span className="font-extrabold text-warm-charcoal uppercase tracking-wider text-[11px]">
                  Interactive Route Map
                </span>
                <span className="text-rose-500 font-bold capitalize">
                  Showing: {activeOption.title}
                </span>
              </div>

              {/* Map in 3D Card Frame */}
              <div className="clay-card rounded-cute overflow-hidden border border-warm-border shadow-float">
                <InteractiveMap
                  origin={origin}
                  destination={destination}
                  originCoords={originCoords}
                  destinationCoords={destinationCoords}
                  selectedOption={activeOption}
                />
              </div>
            </div>

            {/* Actionable CTAs Booking Box */}
            <div className="clay-card rounded-cute p-5 bg-warm-white border border-warm-border shadow-float">
              <ActionableCtas
                option={activeOption}
                origin={origin}
                destination={destination}
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
    </ElevatedLayout>
  );
};

export default ResultsPage;

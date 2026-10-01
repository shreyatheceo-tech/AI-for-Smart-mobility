import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Zap,
  DollarSign,
  Leaf,
  Shield,
  Accessibility,
  Clock,
  Car,
  Bus,
  Train,
  Shuffle,
  CheckCircle2,
  TrendingDown,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useJourney } from '../context/JourneyContext.js';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { runAnalysis } = useJourney();
  const navigate = useNavigate();

  const handleLaunchPreset = async () => {
    try {
      await runAnalysis({
        origin: 'College',
        destination: 'Railway Station',
        primaryPriority: 'eco',
      });
      navigate('/app/results');
    } catch {
      navigate('/app');
    }
  };

  return (
    <div className="space-y-20 py-8 pb-20">
      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8 pt-6 sm:pt-12">
        {/* Glowing badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold shadow-lg shadow-cyan-500/10">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Next-Generation Intelligent Mobility Copilot</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          The Smartest Way To Move Through Your City.
        </h1>

        {/* Master Tagline */}
        <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
          “MobiMind AI doesn’t just find the fastest route. It uses AI to balance{' '}
          <span className="text-cyan-400 font-semibold">time</span>,{' '}
          <span className="text-emerald-400 font-semibold">cost</span>,{' '}
          <span className="text-amber-400 font-semibold">traffic</span>,{' '}
          <span className="text-teal-400 font-semibold">environmental impact</span> and{' '}
          <span className="text-purple-400 font-semibold">user preferences</span> to recommend the smartest way to travel.”
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={handleLaunchPreset}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 text-slate-950 hover:brightness-110 shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5"
          >
            <Navigation className="w-5 h-5 text-slate-950" />
            <span>Start Smart Route</span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>

          <Link
            to={isAuthenticated ? '/app' : '/login'}
            className="w-full sm:w-auto px-6 py-4 rounded-xl font-semibold text-sm bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <span>Open Custom Planner</span>
          </Link>
        </div>

        {/* Priority Chips Showcase */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2.5 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> ⚡ Fastest
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> 💰 Cheapest
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-teal-400" /> 🌱 Eco-friendly
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" /> 🛡️ Safer
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Accessibility className="w-3.5 h-3.5 text-purple-400" /> ♿ Accessible
          </span>
        </div>
      </section>

      {/* Demo Section: College → Railway Station Comparison */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block text-xs font-bold uppercase tracking-wider text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30">
            Live Copilot Demo Analysis
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Trip: College → Railway Station
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            See how MobiMind AI evaluates multiple transit modes against competing constraints in real time.
          </p>
        </div>

        {/* Demo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Private Cab */}
          <div className="rounded-2xl p-5 bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Private Cab / Taxi</h3>
                  <p className="text-[11px] text-slate-400">Door-to-door</p>
                </div>
              </div>
              <span className="text-xs text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-950/50 border border-rose-500/20">
                Heavy Traffic
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                <div className="text-slate-500 text-[10px]">TIME</div>
                <div className="font-bold text-white">28 min</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                <div className="text-slate-500 text-[10px]">COST</div>
                <div className="font-bold text-rose-400">₹280</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                <div className="text-slate-500 text-[10px]">CO₂</div>
                <div className="font-bold text-rose-400">1,240g</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Fastest off-peak, but expensive and heavily stalled by evening gridlock. Highest emissions profile.
            </p>
          </div>

          {/* Card 2: City Express Bus */}
          <div className="rounded-2xl p-5 bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Public Bus 335-E</h3>
                  <p className="text-[11px] text-slate-400">City Transit</p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/20">
                Ultra Cheap
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                <div className="text-slate-500 text-[10px]">TIME</div>
                <div className="font-bold text-white">38 min</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                <div className="text-slate-500 text-[10px]">COST</div>
                <div className="font-bold text-emerald-400">₹25</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                <div className="text-slate-500 text-[10px]">CO₂</div>
                <div className="font-bold text-teal-400">210g</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Great budget commuting option. 10 minutes slower than cab due to bus-stop dwell times, but saves 91% cost.
            </p>
          </div>

          {/* Card 3: AI Winner – Smart Multi-Modal */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/50 shadow-xl glow-cyan space-y-4 relative">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-extrabold uppercase tracking-wider">
              ★ AI Recommended
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Shuffle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Smart Multi-Modal</h3>
                  <p className="text-[11px] text-cyan-300">Metro + E-Feeder</p>
                </div>
              </div>
              <span className="text-xs text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
                Score: 94/100
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-cyan-500/30">
                <div className="text-slate-400 text-[10px]">TIME</div>
                <div className="font-bold text-white">25 min</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-cyan-500/30">
                <div className="text-slate-400 text-[10px]">COST</div>
                <div className="font-bold text-emerald-400">₹45</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-cyan-500/30">
                <div className="text-slate-400 text-[10px]">CO₂</div>
                <div className="font-bold text-teal-400">85g</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Trade-Off Win:</strong> Arrives 3 mins faster than cab, saving ₹235 and 1.15 kg CO₂!
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl p-8 sm:p-12 bg-slate-900/60 border border-slate-800/80 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Why Urban Commuters Depend On MobiMind AI
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Traditional GPS apps prioritize car routing. MobiMind AI calculates true multi-modal city intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Gemini AI Explanations</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clear human-readable reasoning explaining why an option wins for your stated priorities.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Leaf className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Carbon-Balanced Trips</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tracks emissions per passenger-kilometer, enabling informed eco-friendly commuting.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Traffic Delay Immunity</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically detects peak rush-hour gridlock and pivots to underground rail or BRT corridors.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Accessibility className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Accessibility Scoring</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates step-free elevator ingress, level platform boarding, and tactile pavement routes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

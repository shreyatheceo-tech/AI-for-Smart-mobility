import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  TrendingUp,
  Leaf,
  Shield,
  Zap,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  Filter,
} from 'lucide-react';
import { ElevatedLayout } from '../components/ElevatedLayout.js';

interface RecentCommute {
  id: string;
  origin: string;
  destination: string;
  user: string;
  avatar: string;
  modes: string[];
  durationMins: number;
  fareInr: number;
  co2SavedKg: number;
  safetyScore: number;
  status: 'optimized' | 'rerouted' | 'in_transit';
  timestamp: string;
}

const RECENT_COMMUTES: RecentCommute[] = [
  {
    id: 'TRIP-9021',
    origin: 'Indiranagar 100ft Rd',
    destination: 'Bagmane Tech Park',
    user: 'Aria Sharma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    modes: ['🚇 Metro', '🚲 E-Bike'],
    durationMins: 18,
    fareInr: 35,
    co2SavedKg: 1.6,
    safetyScore: 98,
    status: 'optimized',
    timestamp: '2 mins ago',
  },
  {
    id: 'TRIP-9022',
    origin: 'Koramangala 5th Block',
    destination: 'MG Road Metro Hub',
    user: 'Rohan Mehta',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    modes: ['🚶 Walk', '🚇 Metro'],
    durationMins: 22,
    fareInr: 25,
    co2SavedKg: 2.1,
    safetyScore: 99,
    status: 'in_transit',
    timestamp: '7 mins ago',
  },
  {
    id: 'TRIP-9023',
    origin: 'HSR Layout Sector 2',
    destination: 'Electronic City Phase 1',
    user: 'Pooja Iyer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    modes: ['🚗 Shared EV', '🚶 Walk'],
    durationMins: 26,
    fareInr: 80,
    co2SavedKg: 3.4,
    safetyScore: 96,
    status: 'optimized',
    timestamp: '14 mins ago',
  },
  {
    id: 'TRIP-9024',
    origin: 'Malleshwaram 18th Cross',
    destination: 'Central Railway Station',
    user: 'Vikram Joshi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    modes: ['🚌 Electric Bus'],
    durationMins: 19,
    fareInr: 15,
    co2SavedKg: 1.9,
    safetyScore: 95,
    status: 'rerouted',
    timestamp: '25 mins ago',
  },
];

export const AdminDashboardPage: React.FC = () => {
  const [cctvWeightActive, setCctvWeightActive] = useState(true);
  const [carbonFirstActive, setCarbonFirstActive] = useState(true);
  const [rainRerouteActive, setRainRerouteActive] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'optimized' | 'in_transit'>('all');

  const filteredCommutes = RECENT_COMMUTES.filter(
    (c) => selectedFilter === 'all' || c.status === selectedFilter
  );

  return (
    <ElevatedLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* 1. HEADER WITH AIRY ELEVATED WHITESPACE */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-cute-full bg-sage-100 text-sage-600 text-xs font-bold border border-sage-200">
                <span className="w-2 h-2 rounded-full bg-sage-500 animate-ping"></span>
                <span>Copilot Dispatch Engine Live</span>
              </span>
              <span className="text-xs text-warm-muted font-medium">Urban Zone: Metropolitan Core</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-warm-charcoal tracking-tight">
              Mobility Command Desk
            </h1>
            <p className="text-sm text-warm-muted mt-1 font-normal">
              Continuous multi-modal load balancing, AI carbon offsets, and commuter safety indices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 rounded-cute-full bg-warm-white border border-warm-border text-xs font-bold text-warm-charcoal shadow-neumorphic-sm hover:shadow-float spring-bounce flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-warm-muted" />
              <span>Sync Metrics</span>
            </button>
            <Link
              to="/app"
              className="px-5 py-2.5 rounded-cute-full bg-sage-400 hover:bg-sage-500 text-white text-xs font-bold shadow-float hover:shadow-float-hover spring-bounce flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Open Planner</span>
            </Link>
          </div>
        </div>

        {/* 2. ROUNDED PASTEL METRIC CARDS WITH DIFFUSED FLOATING SHADOWS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Sage Green (CO2 Eliminated) */}
          <div className="bg-sage-50 border border-sage-200/80 rounded-cute p-6 shadow-float hover:shadow-float-hover transition-all duration-300 transform hover:-translate-y-1 card-3d-subtle relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sage-600">
                Carbon Abatement
              </span>
              <div className="w-8 h-8 rounded-cute-sm bg-sage-200/80 flex items-center justify-center text-sage-600">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-3xl font-extrabold text-sage-900 tracking-tight">428.6 kg</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-sage-200 text-sage-700 font-bold text-[11px]">
                  +18.4%
                </span>
                <span className="text-xs text-sage-600 font-medium">vs city baseline</span>
              </div>
            </div>
            {/* Soft decorative visual SVG */}
            <div className="mt-4 pt-4 border-t border-sage-200/60 flex items-center justify-between text-[11px] text-sage-600 font-semibold">
              <span>🌱 21 Trees Planted Equiv.</span>
              <span>12,840 Green Trips</span>
            </div>
          </div>

          {/* Card 2: Dusty Rose (Safety Index) */}
          <div className="bg-rose-50 border border-rose-200/80 rounded-cute p-6 shadow-float hover:shadow-float-hover transition-all duration-300 transform hover:-translate-y-1 card-3d-subtle relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                Safety Corridors
              </span>
              <div className="w-8 h-8 rounded-cute-sm bg-rose-200/80 flex items-center justify-center text-rose-500">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-3xl font-extrabold text-rose-900 tracking-tight">98.7%</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-700 font-bold text-[11px]">
                  0 Incidents
                </span>
                <span className="text-xs text-rose-500 font-medium">high-CCTV routes</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-rose-200/60 flex items-center justify-between text-[11px] text-rose-500 font-semibold">
              <span>🛡️ 3,420 Active CCTV Feeds</span>
              <span>100% Lit Corridors</span>
            </div>
          </div>

          {/* Card 3: Soft Lavender (Active Multi-Modal Trips) */}
          <div className="bg-lavender-50 border border-lavender-200/80 rounded-cute p-6 shadow-float hover:shadow-float-hover transition-all duration-300 transform hover:-translate-y-1 card-3d-subtle relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-lavender-600">
                Active Commuters
              </span>
              <div className="w-8 h-8 rounded-cute-sm bg-lavender-200/80 flex items-center justify-center text-lavender-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-3xl font-extrabold text-lavender-900 tracking-tight">12,840</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-lavender-200 text-lavender-700 font-bold text-[11px]">
                  +320 Live Now
                </span>
                <span className="text-xs text-lavender-600 font-medium">multi-modal paths</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-lavender-200/60 flex items-center justify-between text-[11px] text-lavender-600 font-semibold">
              <span>🚇 Metro: 48%</span>
              <span>🚲 Micro: 34%</span>
            </div>
          </div>

          {/* Card 4: Warm White / Clay (Rider Savings) */}
          <div className="bg-warm-white border border-warm-border rounded-cute p-6 shadow-float hover:shadow-float-hover transition-all duration-300 transform hover:-translate-y-1 card-3d-subtle relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-clay-400">
                Fare Optimization
              </span>
              <div className="w-8 h-8 rounded-cute-sm bg-orange-100 flex items-center justify-center text-clay-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-3xl font-extrabold text-warm-charcoal tracking-tight">₹38.50</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                  Saved / Trip
                </span>
                <span className="text-xs text-warm-muted font-medium">vs private cab</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-warm-border flex items-center justify-between text-[11px] text-warm-muted font-semibold">
              <span>💰 ₹494,200 Total</span>
              <span>Citywide Today</span>
            </div>
          </div>
        </div>

        {/* 3. INTERACTIVE COPILOT SWITCHES & TUNING */}
        <div className="bg-warm-white rounded-cute-lg p-6 sm:p-8 border border-warm-border shadow-float space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-warm-charcoal flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sage-400" />
                <span>AI Mobility Engine Heuristics & Live Weights</span>
              </h3>
              <p className="text-xs text-warm-muted mt-0.5">
                Toggle dispatch model priorities across urban nodes in real time.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-sage-600 bg-sage-50 px-3 py-1.5 rounded-cute-full border border-sage-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-500" />
              <span>Multi-Agent Consensus Synced</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Toggle 1: CCTV Density */}
            <div className="bg-cream-100/70 p-5 rounded-cute border border-warm-border flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-warm-charcoal">CCTV Safety Monitored Priority</p>
                <p className="text-xs text-warm-muted">Filter walkways below 90% camera coverage</p>
              </div>
              <button
                onClick={() => setCctvWeightActive(!cctvWeightActive)}
                className={`w-12 h-7 rounded-cute-full transition-colors duration-200 ease-spring p-1 flex items-center ${
                  cctvWeightActive ? 'bg-sage-400 justify-end' : 'bg-gray-300 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-cute-full bg-white shadow-md transform transition-transform"></div>
              </button>
            </div>

            {/* Toggle 2: Zero Emission Preference */}
            <div className="bg-cream-100/70 p-5 rounded-cute border border-warm-border flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-warm-charcoal">Carbon-First Algorithm</p>
                <p className="text-xs text-warm-muted">Prioritize e-bike & solar metro links</p>
              </div>
              <button
                onClick={() => setCarbonFirstActive(!carbonFirstActive)}
                className={`w-12 h-7 rounded-cute-full transition-colors duration-200 ease-spring p-1 flex items-center ${
                  carbonFirstActive ? 'bg-rose-400 justify-end' : 'bg-gray-300 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-cute-full bg-white shadow-md transform transition-transform"></div>
              </button>
            </div>

            {/* Toggle 3: Rain Reroute */}
            <div className="bg-cream-100/70 p-5 rounded-cute border border-warm-border flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-warm-charcoal">Rain Avoidance Rerouting</p>
                <p className="text-xs text-warm-muted">Switch open trails to covered underground lines</p>
              </div>
              <button
                onClick={() => setRainRerouteActive(!rainRerouteActive)}
                className={`w-12 h-7 rounded-cute-full transition-colors duration-200 ease-spring p-1 flex items-center ${
                  rainRerouteActive ? 'bg-lavender-400 justify-end' : 'bg-gray-300 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-cute-full bg-white shadow-md transform transition-transform"></div>
              </button>
            </div>
          </div>
        </div>

        {/* 4. ELEGANT TASK-STYLE JOURNEY FEED (ZERO RIGID TABLES!) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-warm-charcoal flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-400" />
                <span>Real-Time Commute Dispatches</span>
              </h2>
              <p className="text-xs text-warm-muted mt-0.5">
                Staggered, tactile journey cards representing active commuter journeys across the city.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-warm-muted">Filter:</span>
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-cute-full text-xs font-bold transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-warm-charcoal text-white'
                    : 'bg-warm-white text-warm-muted hover:text-warm-charcoal'
                }`}
              >
                All (4)
              </button>
              <button
                onClick={() => setSelectedFilter('optimized')}
                className={`px-3 py-1.5 rounded-cute-full text-xs font-bold transition-all ${
                  selectedFilter === 'optimized'
                    ? 'bg-sage-400 text-white'
                    : 'bg-warm-white text-warm-muted hover:text-warm-charcoal'
                }`}
              >
                Optimized
              </button>
              <button
                onClick={() => setSelectedFilter('in_transit')}
                className={`px-3 py-1.5 rounded-cute-full text-xs font-bold transition-all ${
                  selectedFilter === 'in_transit'
                    ? 'bg-lavender-400 text-white'
                    : 'bg-warm-white text-warm-muted hover:text-warm-charcoal'
                }`}
              >
                In Transit
              </button>
            </div>
          </div>

          {/* Staggered Floating Cards (Elevated Task-Style Layout) */}
          <div className="space-y-3">
            {filteredCommutes.map((commute) => (
              <div
                key={commute.id}
                className="bg-warm-white rounded-cute-lg p-5 sm:p-6 border border-warm-border shadow-float hover:shadow-float-hover transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                {/* User & Route Identity */}
                <div className="flex items-center gap-4 min-w-[280px]">
                  <img
                    src={commute.avatar}
                    alt={commute.user}
                    className="w-12 h-12 rounded-cute-sm object-cover shadow-sm border border-warm-border"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-warm-charcoal">{commute.user}</h4>
                      <span className="text-[10px] font-bold text-warm-muted uppercase tracking-wider">
                        {commute.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-warm-muted mt-1 font-medium">
                      <span>{commute.origin}</span>
                      <ArrowRight className="w-3 h-3 text-warm-muted" />
                      <span className="font-semibold text-warm-charcoal">{commute.destination}</span>
                    </div>
                  </div>
                </div>

                {/* Multi-Modal Steps */}
                <div className="flex flex-wrap items-center gap-2">
                  {commute.modes.map((mode, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-cute-full bg-cream-100 text-warm-charcoal text-xs font-bold border border-warm-border"
                    >
                      {mode}
                    </span>
                  ))}
                  <span className="text-xs text-warm-muted font-medium ml-1">
                    • {commute.durationMins} mins
                  </span>
                </div>

                {/* Key Metrics Chips */}
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-cute bg-sage-50 border border-sage-200 text-center">
                    <p className="text-[10px] font-bold text-sage-600">CO₂ SAVED</p>
                    <p className="text-xs font-extrabold text-sage-800">-{commute.co2SavedKg} kg</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-cute bg-rose-50 border border-rose-200 text-center">
                    <p className="text-[10px] font-bold text-rose-500">SAFETY</p>
                    <p className="text-xs font-extrabold text-rose-800">{commute.safetyScore}%</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-cute bg-warm-white border border-warm-border text-center">
                    <p className="text-[10px] font-bold text-warm-muted">FARE</p>
                    <p className="text-xs font-extrabold text-warm-charcoal">₹{commute.fareInr}</p>
                  </div>
                </div>

                {/* Status Badge & Action */}
                <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                  <span
                    className={`px-3 py-1 rounded-cute-full text-xs font-bold capitalize ${
                      commute.status === 'optimized'
                        ? 'bg-sage-100 text-sage-700 border border-sage-300'
                        : commute.status === 'in_transit'
                        ? 'bg-lavender-100 text-lavender-700 border border-lavender-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {commute.status.replace('_', ' ')}
                  </span>

                  <span className="text-xs text-warm-muted font-medium">{commute.timestamp}</span>

                  <Link
                    to="/app"
                    className="p-2 rounded-cute-full bg-cream-100 hover:bg-cream-200 text-warm-charcoal transition-colors spring-bounce"
                    title="Simulate Route in Copilot"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ElevatedLayout>
  );
};

export default AdminDashboardPage;

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Sliders,
  History,
  LogOut,
  Leaf,
  DollarSign,
  Clock,
  Sparkles,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [journeyCount, setJourneyCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      api.getJourneys().then(res => {
        setJourneyCount(res.journeys.length);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Please Sign In</h2>
          <p className="text-xs text-slate-400">
            Sign in to access your profile settings and commute metrics.
          </p>
        </div>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 text-slate-950 hover:brightness-110"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Profile Card */}
      <div className="rounded-2xl p-6 sm:p-8 bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center font-extrabold text-2xl text-slate-950 shadow-xl shadow-cyan-500/20">
            {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {user.fullName}
            </h1>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>{user.email}</span>
            </p>
            <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Verified Urban Commuter
              </span>
              <span className="text-[10px] text-slate-500">
                Default: <strong className="capitalize text-slate-300">{user.preferences?.primaryPriority || 'Fastest'}</strong>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/10 text-xs font-semibold text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Impact & Commute Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Saved Journeys</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{journeyCount}</div>
          <p className="text-[11px] text-slate-400">Routes analyzed & bookmarked</p>
        </div>

        <div className="rounded-2xl p-5 bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Est. CO₂ Avoided</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {(journeyCount * 1.1 + 0.8).toFixed(1)} kg
          </div>
          <p className="text-[11px] text-slate-400">By choosing electrified transit</p>
        </div>

        <div className="rounded-2xl p-5 bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Est. Commute Savings</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            ₹{journeyCount * 140 + 105}
          </div>
          <p className="text-[11px] text-slate-400">Compared to solo cab travel</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/app/preferences"
          className="rounded-2xl p-5 bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
              Mobility Weights & Preferences
            </h3>
            <p className="text-xs text-slate-400">
              Customize priority percentages, wheelchair constraints, and preferred modes.
            </p>
          </div>
          <Sliders className="w-5 h-5 text-cyan-400 shrink-0 ml-4 group-hover:scale-110 transition-transform" />
        </Link>

        <Link
          to="/app/history"
          className="rounded-2xl p-5 bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
              Journey History
            </h3>
            <p className="text-xs text-slate-400">
              Inspect your past recommendations, route comparisons, and trade-off histories.
            </p>
          </div>
          <History className="w-5 h-5 text-cyan-400 shrink-0 ml-4 group-hover:scale-110 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

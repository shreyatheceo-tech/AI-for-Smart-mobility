import React from 'react';
import { Compass, Sparkles, Shield, Leaf, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">
                MobiMind <span className="text-cyan-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal italic">
              “MobiMind AI doesn’t just find the fastest route. It uses AI to balance time, cost, traffic, environmental impact and user preferences to recommend the smartest way to travel.”
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Gemini 2.0 Decision Engine
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Leaf className="w-3 h-3 text-emerald-400" />
              CO₂ Footprint Optimized
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-amber-400" />
              Safety & Accessibility First
            </span>
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MobiMind AI Copilot. Zero-emissions intelligent transportation.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 transition-colors">Privacy & Security</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors">Multi-Modal API</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors">GTFS Transit Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

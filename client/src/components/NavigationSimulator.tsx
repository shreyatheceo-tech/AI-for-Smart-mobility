import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  CheckCircle,
  Clock,
  MapPin,
  TrendingDown,
  ArrowRight,
  Volume2,
} from 'lucide-react';
import { MobilityOption } from '../types/index.js';
import { getModeIcon } from './AiRecommendationCard.js';

interface NavigationSimulatorProps {
  isOpen: boolean;
  option: MobilityOption;
  origin: string;
  destination: string;
  onClose: () => void;
}

export const NavigationSimulator: React.FC<NavigationSimulatorProps> = ({
  isOpen,
  option,
  origin,
  destination,
  onClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = option.steps;
  const currentStep = steps[currentStepIndex] || steps[0];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setProgressPercent(0);
      setIsCompleted(false);
      setIsPlaying(true);
      return;
    }

    if (!isPlaying || isCompleted) return;

    const interval = setInterval(() => {
      setProgressPercent(prev => {
        if (prev >= 100) {
          if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(idx => idx + 1);
            return 0;
          } else {
            setIsCompleted(true);
            setIsPlaying(false);
            return 100;
          }
        }
        return prev + 5; // advance 5% every 200ms
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, currentStepIndex, steps.length, isCompleted]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl border border-cyan-500/40 bg-slate-900 shadow-2xl p-6 space-y-6 glow-cyan">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 animate-pulse">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Smart Navigation Simulator
              </h3>
              <p className="text-xs text-slate-400">
                {origin} → {destination} • {option.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Step Card */}
        {!isCompleted ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-cyan-400 uppercase tracking-wider text-[11px]">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Volume2 className="w-3.5 h-3.5" /> Live Guidance Active
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                {getModeIcon(currentStep.mode, 'w-6 h-6')}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm sm:text-base leading-snug">
                  {currentStep.instruction}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>⏱️ Segment: ~{currentStep.durationMin} mins</span>
                  <span>📍 {currentStep.distanceMeters} meters</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Segment Progress</span>
                <span className="font-semibold text-cyan-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Completion State */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Destination Reached!</h4>
              <p className="text-xs text-slate-400 mt-1">
                You arrived at <strong className="text-slate-200">{destination}</strong> via {option.title}.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 max-w-md mx-auto space-y-1.5 text-left">
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" /> Commute Savings Realized:
              </div>
              <p>• Retained ~₹{Math.max(50, 250 - option.cost)} compared to a private cab.</p>
              <p>• Avoided ~{(Math.max(100, 1200 - option.co2Grams) / 1000).toFixed(1)} kg of CO₂ emissions.</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              setCurrentStepIndex(0);
              setProgressPercent(0);
              setIsCompleted(false);
              setIsPlaying(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart
          </button>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-400" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-cyan-400" /> Resume
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (currentStepIndex < steps.length - 1) {
                      setCurrentStepIndex(idx => idx + 1);
                      setProgressPercent(0);
                    } else {
                      setIsCompleted(true);
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  <span>Skip Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-xs"
              >
                Close Guidance
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

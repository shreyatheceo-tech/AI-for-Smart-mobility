import React, { useState } from 'react';
import {
  QrCode,
  Bike,
  Ticket,
  Train,
  Car,
  Footprints,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { MobilityOption } from '../types/index.js';

interface ActionableCtasProps {
  option: MobilityOption;
  origin: string;
  destination: string;
}

interface ActionModalState {
  isOpen: boolean;
  type: 'metro' | 'cycle' | 'bus' | 'train' | 'car' | 'walk' | null;
  title: string;
  description: string;
  badge: string;
  actionDetails: string;
}

export const ActionableCtas: React.FC<ActionableCtasProps> = ({
  option,
  origin,
  destination,
}) => {
  const [modalState, setModalState] = useState<ActionModalState>({
    isOpen: false,
    type: null,
    title: '',
    description: '',
    badge: '',
    actionDetails: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Scan steps to detect multi-modal sub-modes
  const stepModes = new Set(option.steps.map(s => s.mode));
  stepModes.add(option.mode);

  const hasMetro = stepModes.has('metro') || option.mode === 'multimodal';
  const hasCycle = stepModes.has('cycle') || option.steps.some(s => s.instruction.toLowerCase().includes('scooter') || s.instruction.toLowerCase().includes('feeder'));
  const hasBus = stepModes.has('bus') && !hasMetro;
  const hasTrain = stepModes.has('train');
  const hasCar = stepModes.has('car');
  const hasWalkOnly = option.mode === 'walk';

  const triggerAction = (
    type: ActionModalState['type'],
    title: string,
    description: string,
    badge: string,
    actionDetails: string
  ) => {
    setIsProcessing(true);
    setIsConfirmed(false);
    setModalState({
      isOpen: true,
      type,
      title,
      description,
      badge,
      actionDetails,
    });

    // Simulate instant secure transaction API execution
    setTimeout(() => {
      setIsProcessing(false);
      setIsConfirmed(true);
    }, 900);
  };

  return (
    <div className="space-y-3 pt-3 border-t border-slate-800">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Execute Route Booking & Access</span>
        </span>
        <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
          Instant Fulfillment
        </span>
      </div>

      {/* Button Row */}
      <div className="flex flex-wrap gap-2.5">
        {/* Metro E-Ticket Button */}
        {hasMetro && (
          <button
            type="button"
            onClick={() =>
              triggerAction(
                'metro',
                'Book Metro Purple Line E-Ticket',
                `One-tap QR access for ${origin} Metro to ${destination} Interchange. Valid on all NFC/QR turnstiles.`,
                'Automated AFC Fare Integration',
                `Fare: ₹${option.cost} • Platform 1 • Gates open in 3 mins`
              )
            }
            className="flex-1 min-w-[200px] py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 text-white hover:brightness-110 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 active:scale-95"
          >
            <Ticket className="w-4 h-4 text-white" />
            <span>🎟️ Book Metro E-Ticket</span>
          </button>
        )}

        {/* E-Bike / Smart Micromobility Unlock Button */}
        {hasCycle && (
          <button
            type="button"
            onClick={() =>
              triggerAction(
                'cycle',
                'Unlock Smart E-Bike / Feeder Dock',
                `Smart dock #24 near ${origin} is reserved. Bluetooth beacon handshake ready.`,
                'Micromobility Fleet Sync',
                'Station Dock #24 • 100% Battery • Helmet Compartment Unlocked'
              )
            }
            className="flex-1 min-w-[200px] py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 hover:brightness-110 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-95"
          >
            <Bike className="w-4 h-4 text-slate-950" />
            <span>🚲 Unlock E-Bike</span>
          </button>
        )}

        {/* Public Bus Pass */}
        {hasBus && (
          <button
            type="button"
            onClick={() =>
              triggerAction(
                'bus',
                'Reserve City Express Bus Pass',
                `Instant contactless e-ticket for Route 335-E towards ${destination}.`,
                'Transit Authority Transit Pass',
                `Fare: ₹${option.cost} • Next Bus in 4 mins`
              )
            }
            className="flex-1 min-w-[200px] py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 hover:brightness-110 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 active:scale-95"
          >
            <Ticket className="w-4 h-4 text-slate-950" />
            <span>🎫 Reserve Bus Pass</span>
          </button>
        )}

        {/* Suburban Train UTS Ticket */}
        {hasTrain && (
          <button
            type="button"
            onClick={() =>
              triggerAction(
                'train',
                'Book Suburban Rail Express Ticket',
                `Unreserved suburban local transit ticket to ${destination} Rail Platform.`,
                'Indian Railways UTS Sync',
                `Fare: ₹${option.cost} • Track 2 • Valid for 3 hours`
              )
            }
            className="flex-1 min-w-[200px] py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-500 text-white hover:brightness-110 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 active:scale-95"
          >
            <Train className="w-4 h-4 text-white" />
            <span>🚆 Book Rail UTS Ticket</span>
          </button>
        )}

        {/* Ride-Hail Hail Cab */}
        {hasCar && (
          <button
            type="button"
            onClick={() =>
              triggerAction(
                'car',
                'Hail Electric Cab / Auto',
                `Connecting directly to ride-hail dispatch API at ${origin} doorstep.`,
                'Live Fleet Dispatch',
                `Est. ₹${option.cost} • 4.8★ Driver 2 mins away`
              )
            }
            className="flex-1 min-w-[200px] py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 active:scale-95"
          >
            <Car className="w-4 h-4 text-slate-950" />
            <span>🚖 Hail Ride (Uber/Ola)</span>
          </button>
        )}

        {/* Walk Step Tracker */}
        {hasWalkOnly && (
          <button
            type="button"
            onClick={() =>
              triggerAction(
                'walk',
                'Start Active Pedestrian Tracker',
                `Sync pedestrian navigation route with step counter & health ring goals.`,
                'Active Travel & Wellness',
                `Target: ~${option.steps[0]?.distanceMeters || 1200}m • Est. ${option.caloriesBurned || 65} kcal`
              )
            }
            className="flex-1 min-w-[200px] py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-95"
          >
            <Footprints className="w-4 h-4 text-slate-950" />
            <span>👟 Start Step Counter</span>
          </button>
        )}
      </div>

      {/* Transaction Confirmation Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border-2 border-cyan-500/50 bg-slate-900 p-6 shadow-2xl space-y-5 text-slate-100 glow-cyan">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{modalState.title}</h4>
                  <span className="text-[10px] text-cyan-400 font-semibold uppercase">{modalState.badge}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {isProcessing ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-300 font-medium">Securing transit token and connecting to provider...</p>
              </div>
            ) : isConfirmed ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-emerald-300 block font-bold text-sm">Action Successfully Confirmed!</strong>
                    <p className="text-slate-300">{modalState.description}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Booking Voucher / Transit Pass:</div>
                  <div className="flex items-center justify-between text-xs text-white font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span>{modalState.actionDetails}</span>
                    <QrCode className="w-5 h-5 text-cyan-400 shrink-0 ml-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Authorized by MobiMind Copilot</span>
                  <span className="text-cyan-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Boarding
                  </span>
                </div>
              </div>
            ) : null}

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 text-slate-950 hover:brightness-110 shadow-md transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

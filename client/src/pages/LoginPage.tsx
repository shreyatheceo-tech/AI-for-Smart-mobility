import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, Lock, Mail, Loader2, Sparkles, ArrowRight, ShieldCheck, Leaf, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    try {
      await login('demo@mobimind.ai', 'mobimind123');
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-rose-400 selection:text-white">
      <div className="max-w-5xl w-full bg-warm-white rounded-cute-lg border border-warm-border shadow-float overflow-hidden flex flex-col md:flex-row min-h-[620px]">
        {/* LEFT COLUMN: 3D GRAPHIC & LIFESTYLE VISUAL */}
        <div className="md:w-1/2 bg-gradient-to-br from-cream-200 via-sage-100 to-rose-100 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative floating blur spheres */}
          <div className="absolute top-10 left-10 w-44 h-44 rounded-full bg-rose-200/50 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-52 h-52 rounded-full bg-sage-200/60 blur-3xl pointer-events-none"></div>

          {/* Top Brand Logo */}
          <Link to="/" className="flex items-center gap-3 relative z-10 group">
            <div className="w-10 h-10 rounded-cute-sm bg-gradient-to-tr from-sage-400 to-rose-400 flex items-center justify-center text-white shadow-float group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-warm-charcoal tracking-tight">MobiMind AI</span>
              <p className="text-[11px] text-warm-muted font-medium">Elevated Mobility Copilot</p>
            </div>
          </Link>

          {/* Central 3D Lifestyle Visual Card */}
          <div className="relative z-10 my-8">
            <div className="bg-warm-white/90 backdrop-blur-md rounded-cute p-6 border border-warm-border shadow-float card-3d">
              <img
                src="https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80"
                alt="Urban Green Commute"
                className="w-full h-44 object-cover rounded-cute-sm shadow-sm"
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-700 font-bold">
                    🌱 Eco Trail
                  </span>
                  <span className="font-bold text-warm-charcoal">14 mins • 0.0 kg CO₂</span>
                </div>
                <h3 className="font-bold text-sm text-warm-charcoal">
                  Riverbank Protected E-Bike Superhighway
                </h3>
              </div>
            </div>
          </div>

          {/* Bottom Social Proof */}
          <div className="relative z-10 flex items-center justify-between text-xs text-warm-muted font-medium pt-4 border-t border-warm-border/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sage-500" />
              <span>Verified 98.7% Safe Corridors</span>
            </div>
            <div className="flex items-center gap-1 text-rose-500 font-bold">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>12k Commuters</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FLOATING NEUMORPHIC AUTH CARD */}
        <div className="md:w-1/2 p-8 sm:p-12 flex flex-col justify-between space-y-8 bg-warm-white">
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sage-600 px-2.5 py-1 rounded-full bg-sage-50 border border-sage-200">
                Welcome Back
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-warm-charcoal tracking-tight mt-2">
                Sign in to your copilot
              </h2>
              <p className="text-xs text-warm-muted mt-1 leading-relaxed">
                Access your saved journey boards, personalized weights, and multi-modal routing history.
              </p>
            </div>

            {/* Quick Demo Commuter Button (One-Click) */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-3 rounded-cute bg-sage-50 hover:bg-sage-100 border border-sage-200 text-sage-700 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all duration-200 spring-bounce"
            >
              <Sparkles className="w-4 h-4 text-sage-500" />
              <span>Instant One-Click Login as Demo Commuter</span>
            </button>

            {error && (
              <div className="p-3.5 rounded-cute bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-warm-charcoal">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-warm-muted absolute left-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@mobimind.ai"
                    className="w-full pl-11 pr-4 py-3 rounded-cute-sm bg-cream-100 border border-warm-border text-xs text-warm-charcoal placeholder-warm-muted focus:outline-none focus:border-sage-400 focus:bg-white transition-all shadow-neumorphic-inset"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-warm-charcoal">Password</label>
                  <a href="#" className="text-[11px] font-semibold text-rose-500 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-warm-muted absolute left-4" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 rounded-cute-sm bg-cream-100 border border-warm-border text-xs text-warm-charcoal placeholder-warm-muted focus:outline-none focus:border-sage-400 focus:bg-white transition-all shadow-neumorphic-inset"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-cute font-bold text-xs sm:text-sm bg-rose-400 hover:bg-rose-500 text-white shadow-float hover:shadow-float-hover transition-all duration-200 spring-bounce flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to MobiMind</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center text-xs text-warm-muted border-t border-warm-border pt-4">
            Don’t have an account yet?{' '}
            <Link to="/register" className="font-bold text-rose-500 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

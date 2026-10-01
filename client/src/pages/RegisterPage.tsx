import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, Lock, Mail, User as UserIcon, Loader2, Sparkles, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const RegisterPage: React.FC = () => {
  const { register, login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/app';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter both passwords.');
      return;
    }

    setError(null);
    try {
      await register(cleanName, cleanEmail, password);
      navigate(redirect);
    } catch (err: any) {
      console.error('[Registration Error]:', err);
      setError(err.message || 'Registration failed. Please try again.');
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

  const signInUrl = redirect && redirect !== '/app' ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-rose-400 selection:text-white">
      <div className="max-w-5xl w-full bg-white rounded-cute-lg border border-warm-border shadow-float overflow-hidden flex flex-col md:flex-row min-h-[640px]">
        {/* LEFT COLUMN: 3D GRAPHIC & LIFESTYLE VISUAL */}
        <div className="md:w-1/2 bg-gradient-to-br from-cream-200 via-lavender-100 to-sage-100 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-10 left-10 w-44 h-44 rounded-full bg-lavender-200/50 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-52 h-52 rounded-full bg-sage-200/60 blur-3xl pointer-events-none"></div>

          {/* Top Brand Logo */}
          <Link to="/" className="flex items-center gap-3 relative z-10 group">
            <div className="w-10 h-10 rounded-cute-sm bg-gradient-to-tr from-lavender-500 to-rose-400 flex items-center justify-center text-white shadow-float group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-gray-900 tracking-tight">MobiMind AI</span>
              <p className="text-[11px] text-gray-600 font-medium">Elevated Mobility Copilot</p>
            </div>
          </Link>

          {/* Central 3D Visual Card */}
          <div className="relative z-10 my-8">
            <div className="bg-white/95 backdrop-blur-md rounded-cute p-6 border border-gray-200 shadow-float card-3d">
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"
                alt="Rapid Transit"
                className="w-full h-44 object-cover rounded-cute-sm shadow-sm"
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-lavender-100 text-lavender-800 font-bold border border-lavender-200">
                    ⚡ Rapid Transit
                  </span>
                  <span className="font-bold text-gray-900">22 mins • Direct Route</span>
                </div>
                <h3 className="font-bold text-sm text-gray-900">
                  Multi-Modal Rail & Last-Mile Scooter Interchanges
                </h3>
              </div>
            </div>
          </div>

          {/* Bottom Social Proof */}
          <div className="relative z-10 flex items-center justify-between text-xs text-gray-600 font-medium pt-4 border-t border-gray-200/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sage-600" />
              <span>Zero-Spam Privacy Verified</span>
            </div>
            <div className="flex items-center gap-1 text-rose-600 font-bold">
              <Heart className="w-3.5 h-3.5 fill-rose-600" />
              <span>Join 12k Commuters</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FLOATING NEUMORPHIC AUTH CARD */}
        <div className="md:w-1/2 p-8 sm:p-12 flex flex-col justify-between space-y-6 bg-white">
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-lavender-700 px-2.5 py-1 rounded-full bg-lavender-50 border border-lavender-200">
                New Commuter
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
                Create your copilot profile
              </h2>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Save custom mobility weights, bookmark scenic corridors, and sync across devices.
              </p>
            </div>

            {/* Error banner with smart 'Sign in instead' CTA */}
            {error && (
              <div className="p-3.5 rounded-cute bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center justify-between gap-2 shadow-sm">
                <span>{error}</span>
                {error.toLowerCase().includes('already exists') && (
                  <Link
                    to={signInUrl}
                    className="px-2.5 py-1 rounded-full bg-white text-rose-700 hover:text-rose-900 font-bold border border-rose-300 shadow-sm flex-shrink-0"
                  >
                    Sign in →
                  </Link>
                )}
              </div>
            )}

            {/* Quick Demo Commuter Shortcut */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-2.5 rounded-cute bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-900 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all duration-200 squish-click"
            >
              <Sparkles className="w-3.5 h-3.5 text-lavender-600" />
              <span>Explore instantly with 1-Click Demo Account</span>
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="reg-fullname" className="text-xs font-extrabold text-gray-900">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 text-gray-500 absolute left-4 pointer-events-none" />
                  <input
                    id="reg-fullname"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Chen"
                    autoComplete="name"
                    className="w-full pl-11 pr-4 py-3 rounded-cute-sm bg-white border border-gray-300 text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 transition-all shadow-neumorphic-inset"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="text-xs font-extrabold text-gray-900">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-4 pointer-events-none" />
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@mobimind.ai"
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 rounded-cute-sm bg-white border border-gray-300 text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 transition-all shadow-neumorphic-inset"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="reg-password" className="text-xs font-extrabold text-gray-900">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 pointer-events-none" />
                    <input
                      id="reg-password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-3 py-3 rounded-cute-sm bg-white border border-gray-300 text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 transition-all shadow-neumorphic-inset"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reg-confirm-password" className="text-xs font-extrabold text-gray-900">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 pointer-events-none" />
                    <input
                      id="reg-confirm-password"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-3 py-3 rounded-cute-sm bg-white border border-gray-300 text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 transition-all shadow-neumorphic-inset"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-cute font-bold text-xs sm:text-sm bg-lavender-600 hover:bg-lavender-700 text-white shadow-float hover:shadow-float-hover transition-all duration-200 squish-click flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center text-xs text-gray-600 border-t border-gray-200 pt-4">
            Already have an account?{' '}
            <Link
              to={signInUrl}
              className="font-bold text-rose-600 hover:text-rose-700 hover:underline transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

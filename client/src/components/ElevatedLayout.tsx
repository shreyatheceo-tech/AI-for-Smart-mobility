import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  Bookmark,
  Navigation,
  Sliders,
  Sparkles,
  User,
  Heart,
  Menu,
  X,
  Layers,
  Shield,
  Leaf,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface ElevatedLayoutProps {
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  savedPinsCount?: number;
}

export const ElevatedLayout: React.FC<ElevatedLayoutProps> = ({
  children,
  searchQuery = '',
  onSearchChange,
  savedPinsCount = 0,
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-cream-100 text-warm-charcoal font-sans selection:bg-rose-400 selection:text-white flex flex-col antialiased">
      {/* 1. STICKY FROSTED GLASS NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-cream-100/85 backdrop-blur-xl border-b border-warm-border/80 transition-all duration-300">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo & Cute Avatar */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 rounded-cute-sm bg-gradient-to-tr from-sage-400 via-sage-300 to-rose-300 flex items-center justify-center shadow-float group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300 ease-spring">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-lg text-warm-charcoal tracking-tight font-sans">
                  MobiMind
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sage-100 text-sage-600 border border-sage-200">
                  Curated
                </span>
              </div>
              <p className="text-[11px] text-warm-muted font-medium pt-0.5">
                Intelligent Lifestyle Mobility
              </p>
            </div>
          </Link>

          {/* Prominent Pill-Shaped Search Bar (Neumorphic-Lite Bevel) */}
          <div className="flex-1 max-w-2xl">
            <div className="relative flex items-center w-full bg-warm-white border border-warm-border rounded-cute-full px-5 py-2.5 shadow-neumorphic-sm hover:shadow-float focus-within:border-sage-400 focus-within:shadow-float-hover transition-all duration-300">
              <Search className="w-4 h-4 text-warm-muted shrink-0 mr-3" />
              <input
                type="text"
                placeholder="Search scenic cycle trails, safe night walks, electric metro links..."
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full bg-transparent text-sm text-warm-charcoal placeholder-warm-muted/70 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange && onSearchChange('')}
                  className="p-1 hover:bg-cream-200 rounded-full text-warm-muted hover:text-warm-charcoal transition-colors ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <nav className="hidden lg:flex items-center gap-2">
            <Link
              to="/"
              className={`px-4 py-2 rounded-cute-full text-xs font-bold transition-all duration-200 spring-bounce ${
                isActive('/')
                  ? 'bg-warm-charcoal text-white shadow-float'
                  : 'text-warm-charcoal hover:bg-cream-200'
              }`}
            >
              Explore
            </Link>

            <Link
              to="/app"
              className={`px-4 py-2 rounded-cute-full text-xs font-bold transition-all duration-200 spring-bounce ${
                isActive('/app')
                  ? 'bg-sage-400 text-white shadow-float'
                  : 'text-warm-charcoal hover:bg-sage-50 hover:text-sage-600'
              }`}
            >
              AI Planner
            </Link>

            <Link
              to="/admin"
              className={`px-4 py-2 rounded-cute-full text-xs font-bold transition-all duration-200 spring-bounce ${
                isActive('/admin')
                  ? 'bg-lavender-400 text-white shadow-float'
                  : 'text-warm-charcoal hover:bg-lavender-50 hover:text-lavender-600'
              }`}
            >
              Admin Desk
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Saved Pins Counter */}
            <div
              title={`${savedPinsCount} pins saved`}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-cute-full bg-warm-white border border-warm-border text-xs font-bold text-warm-charcoal shadow-neumorphic-sm"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  savedPinsCount > 0 ? 'text-rose-400 fill-rose-400' : 'text-warm-muted'
                }`}
              />
              <span>{savedPinsCount}</span>
            </div>

            {/* Quick Action Button in Dusty Rose Accent */}
            <Link
              to="/app"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-cute-full font-bold text-xs sm:text-sm bg-rose-400 hover:bg-rose-500 text-white shadow-float hover:shadow-float-hover spring-bounce flex items-center gap-2"
            >
              <Navigation className="w-3.5 h-3.5 text-white" />
              <span>Route Me</span>
            </Link>

            {/* Profile Avatar / Auth */}
            <Link
              to={isAuthenticated ? '/profile' : '/login'}
              className="w-10 h-10 rounded-cute-full bg-warm-white border border-warm-border flex items-center justify-center text-warm-charcoal hover:shadow-float transition-all spring-bounce shadow-neumorphic-sm"
              title={isAuthenticated ? user?.fullName || 'Profile' : 'Sign In'}
            >
              <User className="w-4 h-4 text-warm-charcoal" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-cute-full bg-warm-white border border-warm-border text-warm-charcoal"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pt-2 pb-4 bg-cream-100 border-b border-warm-border space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-cute text-sm font-bold text-warm-charcoal hover:bg-cream-200"
            >
              Explore Feed
            </Link>
            <Link
              to="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-cute text-sm font-bold text-warm-charcoal hover:bg-sage-50"
            >
              AI Route Planner
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-cute text-sm font-bold text-warm-charcoal hover:bg-lavender-50"
            >
              Admin Dashboard
            </Link>
            <Link
              to="/app/preferences"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-cute text-sm font-bold text-warm-charcoal hover:bg-cream-200"
            >
              Preferences
            </Link>
          </div>
        )}
      </header>

      {/* 2. MAIN CONTENT BODY */}
      <main className="flex-1">{children}</main>

      {/* 3. ELEVATED MINIMALIST FOOTER */}
      <footer className="border-t border-warm-border bg-warm-white py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-warm-muted">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-cute-sm bg-gradient-to-tr from-sage-400 to-rose-300 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              M
            </div>
            <div>
              <p className="font-extrabold text-warm-charcoal text-sm">MobiMind AI</p>
              <p className="text-[11px] text-warm-muted">Curated Urban Mobility & Green Living</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold text-warm-charcoal">
            <Link to="/" className="hover:text-rose-500 transition-colors">
              Explore Pins
            </Link>
            <Link to="/app" className="hover:text-sage-500 transition-colors">
              Route Engine
            </Link>
            <Link to="/admin" className="hover:text-lavender-500 transition-colors">
              Admin Insights
            </Link>
            <Link to="/app/history" className="hover:text-warm-charcoal transition-colors">
              Journey History
            </Link>
          </div>

          <p className="text-[11px] text-warm-muted">
            Designed with Elevated Pinterest Aesthetics • 2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ElevatedLayout;

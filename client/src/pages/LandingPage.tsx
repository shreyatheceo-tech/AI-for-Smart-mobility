import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Compass,
  Heart,
  Bookmark,
  Navigation,
  ArrowRight,
  Share2,
  Zap,
  Leaf,
  Shield,
  Accessibility,
  DollarSign,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useJourney } from '../context/JourneyContext.js';
import { useAuth } from '../context/AuthContext.js';
import { PriorityType } from '../types/index.js';

interface MobilityPin {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  imageUrl: string;
  aspectRatio: 'tall' | 'medium' | 'square';
  origin: string;
  destination: string;
  priority: PriorityType;
  durationMins: number;
  costInr: number;
  co2SavedKg: number;
  safetyScore: number;
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  savesCount: number;
  tags: string[];
}

const SAMPLE_PINS: MobilityPin[] = [
  {
    id: 'pin-1',
    title: 'Metro Express Line 3 • Airport Rapid Link',
    subtitle: 'Direct high-speed underground transit bypassing outer ring road rush-hour congestion.',
    category: 'metro',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'tall',
    origin: 'Downtown Central',
    destination: 'Terminal 2 International',
    priority: 'fastest',
    durationMins: 22,
    costInr: 40,
    co2SavedKg: 2.4,
    safetyScore: 97,
    creator: {
      name: 'Transit Authority Lab',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      verified: true,
    },
    savesCount: 1420,
    tags: ['⚡ Fastest', 'Subway', 'No Traffic'],
  },
  {
    id: 'pin-2',
    title: 'Riverbank Canopy • Protected E-Bike Superhighway',
    subtitle: 'Continuous separated greenway alongside the river with solar-lit pavement and zero cars.',
    category: 'bike',
    imageUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'medium',
    origin: 'Riverside Promenade',
    destination: 'Cyber Technology Park',
    priority: 'eco',
    durationMins: 14,
    costInr: 15,
    co2SavedKg: 1.8,
    safetyScore: 95,
    creator: {
      name: 'Urban Green Wheels',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      verified: true,
    },
    savesCount: 2890,
    tags: ['🌱 Zero Emission', 'E-Bike', 'Scenic'],
  },
  {
    id: 'pin-3',
    title: 'Illuminated Night Walk • High-CCTV Safe Corridor',
    subtitle: '100% active commercial street frontage, dense smart surveillance, and emergency SOS pillars.',
    category: 'safer',
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'square',
    origin: 'Central Library',
    destination: 'North Metro Interchange',
    priority: 'safer',
    durationMins: 12,
    costInr: 0,
    co2SavedKg: 0.9,
    safetyScore: 99,
    creator: {
      name: 'SafeCity Community',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      verified: true,
    },
    savesCount: 3120,
    tags: ['🛡️ 99% Safe', 'Night Corridor', 'Walk'],
  },
  {
    id: 'pin-4',
    title: 'Heritage Tramway & Civic Center Waterfront',
    subtitle: 'Quiet electric streetcar gliding through historic alleys with seamless hop-on QR ticketing.',
    category: 'metro',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'tall',
    origin: 'Old Town Heritage Gate',
    destination: 'Waterfront Civic Center',
    priority: 'cheapest',
    durationMins: 18,
    costInr: 12,
    co2SavedKg: 1.5,
    safetyScore: 94,
    creator: {
      name: 'City Tramways Co.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      verified: true,
    },
    savesCount: 940,
    tags: ['💰 ₹12 Fare', 'Tram', 'Historic'],
  },
  {
    id: 'pin-5',
    title: '100% Step-Free Accessible Commute Line',
    subtitle: 'Verified elevators at both nodes, wide automatic gates, tactile paving, and audio cues.',
    category: 'accessible',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'tall',
    origin: 'University Medical Campus',
    destination: 'Central Cultural Plaza',
    priority: 'accessible',
    durationMins: 24,
    costInr: 30,
    co2SavedKg: 2.1,
    safetyScore: 98,
    creator: {
      name: 'Inclusive Mobility Council',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      verified: true,
    },
    savesCount: 1840,
    tags: ['♿ Step-Free', 'Tactile Paving', 'Elevators'],
  },
  {
    id: 'pin-6',
    title: 'Solar Dock E-Scooter • Last-Mile Sprint',
    subtitle: 'Unlock directly at station exit; bypass gridlocked avenue intersection in under 6 minutes.',
    category: 'bike',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'medium',
    origin: 'South City Metro Station',
    destination: 'Fintech Innovation Tower',
    priority: 'fastest',
    durationMins: 6,
    costInr: 25,
    co2SavedKg: 0.7,
    safetyScore: 91,
    creator: {
      name: 'MobiRide Micro',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
      verified: true,
    },
    savesCount: 4210,
    tags: ['⚡ 6 Mins', 'E-Scooter', 'Solar Powered'],
  },
  {
    id: 'pin-7',
    title: 'Clean Electric Shared Cab • Carpool Priority',
    subtitle: 'Ride with verified commuters in dedicated HOV bus lanes to cut peak toll bridge waits by half.',
    category: 'carpool',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'square',
    origin: 'Suburban Hillview',
    destination: 'Global Trade Center',
    priority: 'fastest',
    durationMins: 21,
    costInr: 95,
    co2SavedKg: 3.2,
    safetyScore: 96,
    creator: {
      name: 'EcoRide Pools',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
      verified: true,
    },
    savesCount: 1650,
    tags: ['🚗 Shared EV', 'HOV Lane', 'AC Comfort'],
  },
  {
    id: 'pin-8',
    title: 'Botanical Park Canopy Walkway',
    subtitle: 'A cooling pedestrian shortcut with natural tree canopies saving 8 minutes vs road sidewalks.',
    category: 'walk',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'tall',
    origin: 'Botanical Garden West Gate',
    destination: 'Museum of Fine Arts',
    priority: 'eco',
    durationMins: 9,
    costInr: 0,
    co2SavedKg: 0.8,
    safetyScore: 93,
    creator: {
      name: 'City Parks Guild',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      verified: true,
    },
    savesCount: 2280,
    tags: ['🚶 Walk', 'Nature Canopy', '0 Cost'],
  },
  {
    id: 'pin-9',
    title: 'Electric Ferry & Harbor Light Tramway',
    subtitle: 'Gliding across the harbor bay under sunset skies, connecting to the central light rail terminal.',
    category: 'eco',
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'medium',
    origin: 'Harbor Wharf Terminal',
    destination: 'Island Technology Hub',
    priority: 'eco',
    durationMins: 16,
    costInr: 25,
    co2SavedKg: 2.9,
    safetyScore: 98,
    creator: {
      name: 'Marine Transit Board',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      verified: true,
    },
    savesCount: 3510,
    tags: ['⛴️ Electric Ferry', 'Scenic', 'Zero Jam'],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Ideas' },
  { id: 'fastest', label: '⚡ Fastest Transit' },
  { id: 'eco', label: '🌱 Zero Emission' },
  { id: 'safer', label: '🛡️ Safe Corridors' },
  { id: 'bike', label: '🚲 Scenic E-Bikes' },
  { id: 'metro', label: '🚇 Metro Links' },
  { id: 'accessible', label: '♿ Step-Free Access' },
];

export const LandingPage: React.FC = () => {
  const { runAnalysis } = useJourney();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [savedPins, setSavedPins] = useState<Record<string, boolean>>({});
  const [selectedPin, setSelectedPin] = useState<MobilityPin | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  // Filter pins based on category and search query
  const filteredPins = useMemo(() => {
    return SAMPLE_PINS.filter((pin) => {
      const matchesCategory =
        activeCategory === 'all' ||
        pin.category === activeCategory ||
        pin.priority === activeCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        pin.title.toLowerCase().includes(q) ||
        pin.subtitle.toLowerCase().includes(q) ||
        pin.origin.toLowerCase().includes(q) ||
        pin.destination.toLowerCase().includes(q) ||
        pin.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedPins((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLaunchRoute = async (pin: MobilityPin, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsRouting(true);
    try {
      await runAnalysis({
        origin: pin.origin,
        destination: pin.destination,
        primaryPriority: pin.priority,
      });
      navigate('/app/results');
    } catch {
      navigate('/app');
    } finally {
      setIsRouting(false);
    }
  };

  const savedCount = Object.values(savedPins).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-gray-900 font-sans antialiased selection:bg-[#E60023] selection:text-white">
      {/* 1. CLEAN STICKY TOP NAVIGATION HEADER (PINTEREST PILL SEARCH) */}
      <header className="sticky top-0 z-40 bg-[#F9F9F9]/90 backdrop-blur-xl border-b border-gray-200/70 transition-all duration-200">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-full bg-[#E60023] flex items-center justify-center shadow-md shadow-[#E60023]/25 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-lg text-gray-900 tracking-tight">MobiMind</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-700">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium pt-0.5">Mobility Copilot</p>
            </div>
          </Link>

          {/* Prominent Pill-Shaped Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative flex items-center w-full bg-white border border-gray-200 rounded-full px-4 py-2.5 shadow-sm hover:shadow transition-all duration-200 focus-within:border-gray-400 focus-within:shadow-md">
              <Search className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
              <input
                type="text"
                placeholder="Search eco routes, safe night walks, metro lines, scenic bike trails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Saved Pins Counter */}
            <div
              title={`${savedCount} saved pins`}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-sm"
            >
              <Bookmark className={`w-3.5 h-3.5 ${savedCount > 0 ? 'text-[#E60023] fill-[#E60023]' : 'text-gray-400'}`} />
              <span>{savedCount} Saved</span>
            </div>

            {/* Custom Planner Link */}
            <Link
              to="/app"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm bg-[#E60023] hover:bg-[#c9001f] text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 text-white" />
              <span>Plan Journey</span>
            </Link>

            {/* Auth / Profile Link */}
            <Link
              to={isAuthenticated ? '/profile' : '/login'}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
              title={isAuthenticated ? 'Your Profile' : 'Sign In'}
            >
              <span className="text-xs font-bold">{isAuthenticated ? '👤' : 'Sign'}</span>
            </Link>
          </div>
        </div>

        {/* 2. CATEGORY PILL SELECTOR (PINTEREST STYLE) */}
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pb-3 overflow-x-auto no-scrollbar flex items-center gap-2.5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* 3. HERO & WHITESPACE INTRO BANNER */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center pt-8 pb-6 space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Explore Smarter Ways to Move.
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto font-normal leading-relaxed">
          AI-curated urban journeys, sustainable micro-mobility trails, and verified safe corridors. Tap any pin to
          simulate live routing or save it to your board.
        </p>
      </section>

      {/* 4. FLUID RESPONSIVE MASONRY GRID FEED */}
      <main className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filteredPins.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 max-w-lg mx-auto shadow-sm p-8 space-y-4">
            <Search className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900">No journeys match your search</h3>
            <p className="text-sm text-gray-500">
              Try searching for different keywords like “metro”, “e-bike”, “safe night walk”, or clear your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-5 py-2.5 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6">
            {filteredPins.map((pin) => {
              const isSaved = !!savedPins[pin.id];

              return (
                <div
                  key={pin.id}
                  onClick={() => setSelectedPin(pin)}
                  className="break-inside-avoid mb-6 group cursor-pointer"
                >
                  <div className="bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_35px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col">
                    {/* Visual Media Container with Zoom Hover */}
                    <div className="relative overflow-hidden bg-gray-100">
                      <img
                        src={pin.imageUrl}
                        alt={pin.title}
                        loading="lazy"
                        className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${
                          pin.aspectRatio === 'tall'
                            ? 'h-80 sm:h-96'
                            : pin.aspectRatio === 'medium'
                            ? 'h-64 sm:h-72'
                            : 'h-52 sm:h-60'
                        }`}
                      />

                      {/* Top Overlay Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        {/* Quick metric badge */}
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur-md text-gray-900 shadow-sm flex items-center gap-1">
                          {pin.priority === 'fastest' && <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />}
                          {pin.priority === 'eco' && <Leaf className="w-3 h-3 text-emerald-600 fill-emerald-600" />}
                          {pin.priority === 'safer' && <Shield className="w-3 h-3 text-blue-600 fill-blue-600" />}
                          {pin.priority === 'accessible' && <Accessibility className="w-3 h-3 text-purple-600" />}
                          {pin.priority === 'cheapest' && <DollarSign className="w-3 h-3 text-teal-600" />}
                          <span>{pin.durationMins} min</span>
                        </span>

                        {/* Pinterest Red Save Button (Hover Reveal on desktop, persistent on mobile) */}
                        <button
                          onClick={(e) => toggleSave(pin.id, e)}
                          className={`pointer-events-auto px-3.5 py-1.5 rounded-full font-bold text-xs shadow-md transition-all duration-200 active:scale-90 flex items-center gap-1.5 ${
                            isSaved
                              ? 'bg-black text-white hover:bg-gray-800'
                              : 'bg-[#E60023] hover:bg-[#c9001f] text-white opacity-90 group-hover:opacity-100'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                          <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>

                      {/* Bottom Floating Quick Route Action (Hover Reveal) */}
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-end">
                        <button
                          onClick={(e) => handleLaunchRoute(pin, e)}
                          disabled={isRouting}
                          className="px-3.5 py-1.5 rounded-full font-bold text-xs bg-white/95 hover:bg-white text-gray-900 shadow-lg backdrop-blur-md flex items-center gap-1.5 hover:scale-105 transition-all"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[#E60023]" />
                          <span>Route This</span>
                        </button>
                      </div>
                    </div>

                    {/* Card Content & Metadata */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-bold text-sm text-gray-900 tracking-tight leading-snug line-clamp-2">
                          {pin.title}
                        </h3>
                        <p className="text-xs text-gray-500 font-normal line-clamp-2 mt-1 leading-relaxed">
                          {pin.subtitle}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {pin.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Creator attribution and social metrics */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <img
                            src={pin.creator.avatar}
                            alt={pin.creator.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="font-medium text-gray-700 truncate max-w-[110px]">
                            {pin.creator.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-[11px] text-gray-600">
                          <Heart className="w-3.5 h-3.5 text-gray-400" />
                          <span>{pin.savesCount + (isSaved ? 1 : 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 5. INTERACTIVE PIN DETAIL MODAL */}
      {selectedPin && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedPin(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 flex flex-col md:flex-row overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPin(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Visual Media */}
            <div className="md:w-1/2 bg-gray-100 relative min-h-[260px] md:min-h-full">
              <img
                src={selectedPin.imageUrl}
                alt={selectedPin.title}
                className="w-full h-full object-cover max-h-[460px] md:max-h-full"
              />
            </div>

            {/* Right Column: Route Specs & AI Execution */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Header actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <img
                      src={selectedPin.creator.avatar}
                      alt={selectedPin.creator.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span>{selectedPin.creator.name}</span>
                    {selectedPin.creator.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-100" />
                    )}
                  </div>

                  <button
                    onClick={(e) => toggleSave(selectedPin.id, e)}
                    className={`px-4 py-2 rounded-full font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 ${
                      savedPins[selectedPin.id]
                        ? 'bg-black text-white hover:bg-gray-800'
                        : 'bg-[#E60023] hover:bg-[#c9001f] text-white'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${savedPins[selectedPin.id] ? 'fill-white' : ''}`} />
                    <span>{savedPins[selectedPin.id] ? 'Saved' : 'Save Pin'}</span>
                  </button>
                </div>

                {/* Title & Description */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                    {selectedPin.title}
                  </h2>
                  <p className="text-sm text-gray-600 font-normal mt-2 leading-relaxed">
                    {selectedPin.subtitle}
                  </p>
                </div>

                {/* Origin / Destination specs */}
                <div className="bg-[#F9F9F9] rounded-2xl p-4 border border-gray-200/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-gray-700">
                    <span className="font-semibold text-gray-500">Origin:</span>
                    <span className="font-bold text-gray-900">{selectedPin.origin}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-700">
                    <span className="font-semibold text-gray-500">Destination:</span>
                    <span className="font-bold text-gray-900">{selectedPin.destination}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-700 pt-1 border-t border-gray-200">
                    <span className="font-semibold text-gray-500">Optimization Priority:</span>
                    <span className="font-bold text-[#E60023] capitalize">{selectedPin.priority}</span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-400 font-medium text-[10px]">ESTIMATED TIME</p>
                    <p className="text-base font-extrabold text-gray-900 mt-0.5">{selectedPin.durationMins} mins</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-400 font-medium text-[10px]">ESTIMATED FARE</p>
                    <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                      {selectedPin.costInr === 0 ? 'FREE' : `₹${selectedPin.costInr}`}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-400 font-medium text-[10px]">CO₂ REDUCTION</p>
                    <p className="text-base font-extrabold text-teal-600 mt-0.5">-{selectedPin.co2SavedKg} kg</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-400 font-medium text-[10px]">SAFETY RATING</p>
                    <p className="text-base font-extrabold text-blue-600 mt-0.5">{selectedPin.safetyScore}%</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  onClick={() => handleLaunchRoute(selectedPin)}
                  disabled={isRouting}
                  className="w-full py-3.5 rounded-full font-bold text-sm bg-[#E60023] hover:bg-[#c9001f] text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4 text-white" />
                  <span>{isRouting ? 'Calculating Optimal Journey...' : 'Run Live AI Multi-Modal Route'}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

                <Link
                  to="/app"
                  className="w-full py-2.5 rounded-full font-semibold text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Customize in Full Route Planner</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MINIMALIST PINTEREST FOOTER */}
      <footer className="border-t border-gray-200/80 bg-white py-8 px-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#E60023] flex items-center justify-center text-white text-[10px] font-bold">
              M
            </div>
            <span className="font-bold text-gray-800">MobiMind AI</span>
            <span>• Pinterest Aesthetic Mobility Feed</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-gray-600">
            <Link to="/app" className="hover:text-black transition-colors">
              Route Planner
            </Link>
            <Link to="/app/history" className="hover:text-black transition-colors">
              Journey History
            </Link>
            <Link to="/app/preferences" className="hover:text-black transition-colors">
              Preferences
            </Link>
            <Link to="/profile" className="hover:text-black transition-colors">
              Profile
            </Link>
          </div>

          <p className="text-gray-400">© 2026 MobiMind AI. Next-Gen Intelligent Urban Mobility.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

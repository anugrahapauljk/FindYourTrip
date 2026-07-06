import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, IndianRupee, ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { getSearchHistory } from '../services/firebaseService';

const travelSlides = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80', // Mountains
  'https://images.unsplash.com/photo-1432406186267-34a99e98e50b?auto=format&fit=crop&w=2000&q=80', // Waterfalls
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80', // Beaches
  'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=2000&q=80', // Tea plantations
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=80', // Forests
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80', // Lakes
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=2000&q=80'  // Coastal
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user, signInWithGoogle } = useAuth();
  const [latestSearch, setLatestSearch] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % travelSlides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        const history = await getSearchHistory(user.uid);
        if (history && history.length > 0) {
          setLatestSearch(history[0]);
        }
      } catch (err) {
        console.error('Failed to fetch search history for home page:', err);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-300 overflow-x-hidden flex flex-col justify-between">
      
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Image Slideshow */}
        <div className="absolute inset-0 z-0">
          {travelSlides.map((slide, idx) => (
            <img 
              key={slide}
              src={slide} 
              alt="Travel background" 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 scale-105 ${
                idx === currentSlide ? 'opacity-100 animate-zoom-slow' : 'opacity-0'
              }`}
            />
          ))}
          {/* Gradients and vignette */}
          <div className="absolute inset-0 bg-slate-950/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(5,12,36,0.85)_100%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-8">
          {!user ? (
            <div className="max-w-md mx-auto bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                <Logo className="w-24 h-24 scale-[1.6]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 uppercase tracking-tight">
                FIND YOUR <span className="bg-gradient-to-r from-sky-400 to-orange-400 bg-clip-text text-transparent">TRIP</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 mb-8 font-light">
                Discover personalized, AI-powered travel itineraries tailored to your budget and preferences.
              </p>
              <button
                onClick={signInWithGoogle}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
              >
                Sign In with Google
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tight uppercase animate-in fade-in slide-in-from-top-4 duration-500">
                PLAN YOUR <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-orange-400 bg-clip-text text-transparent">ESCAPE</span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-top-4 delay-75 duration-500">
                AI-Powered trips, tailored <span className="bg-gradient-to-r from-cyan-300 to-orange-300 bg-clip-text text-transparent font-medium">just for you</span>.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-top-4 delay-150 duration-500">
                <Link
                  to="/plan"
                  className="group relative flex items-center gap-2.5 px-10 py-5 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-orange-400 text-slate-950 font-bold text-lg shadow-2xl shadow-sky-500/25 hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative">Start Planning My Trip</span>
                  <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Latest Search Panel */}
              {latestSearch && (
                <div className="mt-16 inline-block bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 sm:p-5 max-w-lg mx-auto hover:bg-white/[0.05] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-300 duration-500">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 tracking-wider uppercase justify-center">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> Your Latest Search
                  </div>
                  <div className="text-sm sm:text-base text-white font-medium flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                    <span className="text-emerald-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {latestSearch.location}</span>
                    <span className="text-slate-500">·</span>
                    <span className="flex items-center gap-1 text-amber-400"><IndianRupee className="w-3.5 h-3.5" /> {Number(latestSearch.budget).toLocaleString()}</span>
                    {latestSearch.duration && (
                      <>
                        <span className="text-slate-500">·</span>
                        <span className="text-sky-400">{latestSearch.duration}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

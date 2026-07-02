import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, IndianRupee, Compass, Sparkles, ArrowRight, Zap, Heart, Globe, ChevronRight, Mountain, Waves, Trees, Shield } from 'lucide-react';

const travelSlides = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80', // Mountains
  'https://images.unsplash.com/photo-1432406186267-34a99e98e50b?auto=format&fit=crop&w=2000&q=80', // Waterfalls
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80', // Beaches
  'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=2000&q=80', // Tea plantations
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=80', // Forests
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80', // Lakes
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=2000&q=80'  // Coastal
];

const features = [
  { icon: Sparkles, title: 'AI Recommendations', desc: 'Smart AI analyzes your preferences to find perfect destinations.', color: 'from-cyan-400 to-sky-500', glow: 'group-hover:shadow-cyan-500/20' },
  { icon: IndianRupee, title: 'Budget Based Planning', desc: 'Get recommendations that fit your budget perfectly.', color: 'from-amber-400 to-orange-500', glow: 'group-hover:shadow-amber-500/20' },
  { icon: MapPin, title: 'Distance Filtering', desc: 'Find amazing places within your preferred travel radius.', color: 'from-emerald-400 to-teal-500', glow: 'group-hover:shadow-emerald-500/20' },
  { icon: Heart, title: 'Personalized Trips', desc: 'Save and revisit your favorite destinations anytime.', color: 'from-rose-400 to-orange-500', glow: 'group-hover:shadow-rose-500/20' },
];

const howItWorks = [
  { step: '01', icon: MapPin, title: 'Choose Location', desc: 'Enter your starting point', accent: 'text-cyan-400', ring: 'ring-cyan-500/20' },
  { step: '02', icon: IndianRupee, title: 'Set Budget', desc: 'Define your spending limit', accent: 'text-amber-400', ring: 'ring-amber-500/20' },
  { step: '03', icon: Compass, title: 'Select Experience', desc: 'Pick what excites you', accent: 'text-orange-400', ring: 'ring-orange-500/20' },
  { step: '04', icon: Sparkles, title: 'AI Finds Trips', desc: 'Get personalized results', accent: 'text-sky-400', ring: 'ring-sky-500/20' },
];

const popularDestinations = [
  { 
    name: 'Munnar', 
    state: 'Kerala', 
    tag: 'Nature', 
    image: '/images/munnar.jpg', 
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
  },
  { 
    name: 'Goa', 
    state: 'Goa', 
    tag: 'Beach', 
    image: '/images/goa.jpg', 
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
  },
  { 
    name: 'Manali', 
    state: 'Himachal Pradesh', 
    tag: 'Adventure', 
    image: '/images/manali.jpg', 
    tagColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30' 
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % travelSlides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-300 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
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
          
          {/* Animated Background Particles */}
          <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-sky-500/10 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-float-delayed" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-8">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-6 leading-[1.05] tracking-tight uppercase">
            Get <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-orange-400 bg-clip-text text-transparent">away</span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            AI-Powered trips, tailored <span className="bg-gradient-to-r from-cyan-300 to-orange-300 bg-clip-text text-transparent font-medium">just for you</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/plan"
              className="group relative flex items-center gap-2.5 px-10 py-5 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-orange-400 text-slate-950 font-bold text-lg shadow-2xl shadow-sky-500/25 hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative">Start Planning My Trip</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-10 py-5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-slate-200 font-semibold hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300"
            >
              How It Works
            </a>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-8 sm:gap-16 mt-24">
            {[
              { value: 'AI', label: 'POWERED' },
              { value: '500+', label: 'DESTINATIONS' },
              { value: '100%', label: 'PERSONALIZED' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-3xl font-extrabold bg-gradient-to-r from-sky-400 to-orange-400 bg-clip-text text-transparent transform group-hover:scale-105 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-[10px] text-slate-400 font-bold tracking-widest mt-1.5 uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
          <span className="text-[10px] tracking-widest text-slate-400 uppercase font-bold">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2 backdrop-blur-sm">
            <div className="w-1 h-2 rounded-full bg-cyan-400 animate-scroll" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-18 px-6 relative bg-slate-900/10">
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold tracking-widest uppercase mb-4">
              SIMPLE PROCESS
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">How It Works</h2>
            <p className="text-slate-350 mt-3 max-w-lg mx-auto">Four simple steps to generate your perfect itinerary</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="relative group">
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px">
                      <div className="w-full h-full bg-gradient-to-r from-white/10 to-transparent" />
                    </div>
                  )}
                  {/* Glass card */}
                  <div className="relative h-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-500/5">
                    <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-cyan-500/0 group-hover:bg-cyan-500/5 blur-2xl transition-all duration-500" />
                    <div className="relative">
                      <div className="text-xs font-mono text-cyan-500/30 mb-4 tracking-widest font-bold">{item.step}</div>
                      <div className={`w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6 ring-1 ${item.ring} group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${item.accent}`} />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-350 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-18 px-6 relative bg-slate-900/20">
        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold tracking-widest uppercase mb-4">
                TRENDING NOW
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Popular Destinations</h2>
              <p className="text-slate-350 mt-2">Beautiful locations handpicked by travelers and AI</p>
            </div>
            <Link to="/plan" className="inline-flex items-center gap-1.5 text-cyan-400 text-sm font-bold hover:text-cyan-300 transition-colors group">
              Explore all destinations <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularDestinations.map((dest, i) => {
              return (
                <Link
                  key={i}
                  to="/plan"
                  className="group relative overflow-hidden rounded-[24px] border border-white/[0.06] hover:border-cyan-500/25 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/5 bg-slate-900/20"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden relative">
                    <img 
                      src={dest.image} 
                      alt={dest.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className={`inline-block px-3 py-1 rounded-full backdrop-blur-md border ${dest.tagColor} text-xs font-bold mb-2.5`}>
                        {dest.tag}
                      </span>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">{dest.name}</h3>
                      <p className="text-sm text-slate-200 flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-orange-400" /> {dest.state}, India
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features / Why Choose Us */}
      <section className="py-18 px-6 relative bg-slate-900/10">
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold tracking-widest uppercase mb-4">
              WHY FINDYOURTRIP
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Smart Travel Planning</h2>
            <p className="text-slate-350 mt-3 max-w-lg mx-auto">Travel intelligence designed to make recommendations clean and effortless</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className={`group relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${feat.glow} overflow-hidden`}>
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-500" style={{background: `radial-gradient(circle, ${feat.color.includes('purple') ? 'rgba(168,85,247,0.08)' : feat.color.includes('amber') ? 'rgba(245,158,11,0.08)' : feat.color.includes('emerald') ? 'rgba(52,211,153,0.08)' : 'rgba(244,63,94,0.08)'}, transparent)`}} />
                  <div className="relative flex flex-col sm:flex-row items-start gap-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-lg`}>
                      <Icon className="w-6 h-6 text-slate-950 font-bold" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                      <p className="text-sm text-slate-350 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-18 px-6 relative bg-slate-900/20">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-[2.5rem] overflow-hidden border border-white/[0.05] bg-gradient-to-br from-sky-500/[0.08] via-cyan-500/[0.04] to-orange-500/[0.08]">
            <div className="absolute inset-0 backdrop-blur-3xl" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-sky-500/10 rounded-full blur-[80px]" />
            
            <div className="relative z-10 px-8 py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-8">
                <Globe className="w-8 h-8 text-sky-400" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 uppercase tracking-tight leading-tight">Ready to Find Your<br />Next Getaway?</h2>
              <p className="text-slate-350 mb-10 max-w-lg mx-auto leading-relaxed">Plan tailored routes matching your budget, experiences, and preferred travel times in seconds.</p>
              <Link
                to="/plan"
                className="group relative inline-flex items-center gap-2.5 px-10 py-5 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-orange-400 text-slate-950 font-extrabold text-lg shadow-2xl shadow-sky-500/20 hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative">Get Started — It's Free</span>
                <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-orange-400 flex items-center justify-center">
              <Compass className="w-4.5 h-4.5 text-slate-950 font-black animate-spin-slow" />
            </div>
            <span className="text-base font-bold text-slate-300 tracking-tight">FindYourTrip</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span>© 2026 FindYourTrip</span>
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Privacy First</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> AI Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

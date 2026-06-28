import { Link } from 'react-router-dom';
import { MapPin, IndianRupee, Compass, Sparkles, ArrowRight, Zap, Heart, Globe, ChevronRight, Mountain, Waves, Trees, Shield } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'AI Recommendations', desc: 'Smart AI analyzes your preferences to find perfect destinations', color: 'from-purple-500 to-pink-500', glow: 'group-hover:shadow-purple-500/20' },
  { icon: IndianRupee, title: 'Budget Based Planning', desc: 'Get recommendations that fit your budget perfectly', color: 'from-amber-500 to-orange-500', glow: 'group-hover:shadow-amber-500/20' },
  { icon: MapPin, title: 'Distance Filtering', desc: 'Find amazing places within your preferred travel radius', color: 'from-emerald-500 to-cyan-500', glow: 'group-hover:shadow-emerald-500/20' },
  { icon: Heart, title: 'Personalized Trips', desc: 'Save and revisit your favorite destinations anytime', color: 'from-rose-500 to-red-500', glow: 'group-hover:shadow-rose-500/20' },
];

const howItWorks = [
  { step: '01', icon: MapPin, title: 'Choose Location', desc: 'Enter your starting point', accent: 'text-emerald-400', ring: 'ring-emerald-500/20' },
  { step: '02', icon: IndianRupee, title: 'Set Budget', desc: 'Define your spending limit', accent: 'text-amber-400', ring: 'ring-amber-500/20' },
  { step: '03', icon: Compass, title: 'Select Experience', desc: 'Pick what excites you', accent: 'text-purple-400', ring: 'ring-purple-500/20' },
  { step: '04', icon: Sparkles, title: 'AI Finds Trips', desc: 'Get personalized results', accent: 'text-cyan-400', ring: 'ring-cyan-500/20' },
];

const popularDestinations = [
  { name: 'Munnar', state: 'Kerala', tag: 'Nature', icon: Trees, gradient: 'from-emerald-600 to-teal-700', tagColor: 'bg-emerald-500/20 text-emerald-300' },
  { name: 'Goa', state: 'Goa', tag: 'Beach', icon: Waves, gradient: 'from-cyan-600 to-blue-700', tagColor: 'bg-cyan-500/20 text-cyan-300' },
  { name: 'Manali', state: 'Himachal Pradesh', tag: 'Adventure', icon: Mountain, gradient: 'from-indigo-600 to-purple-700', tagColor: 'bg-purple-500/20 text-purple-300' },
];


export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-[15%] -left-10 w-80 h-80 bg-emerald-500/15 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-[15%] -right-10 w-96 h-96 bg-cyan-500/12 rounded-full blur-[100px] animate-float-delayed" />
          <div className="absolute top-[40%] left-[30%] w-72 h-72 bg-purple-500/8 rounded-full blur-[120px] animate-float" style={{animationDelay: '3s'}} />
          <div className="absolute top-[60%] right-[25%] w-64 h-64 bg-pink-500/6 rounded-full blur-[100px] animate-float-delayed" style={{animationDelay: '1s'}} />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px]" />
          {/* Radial vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,6,23,0.4)_70%,rgba(2,6,23,0.8)_100%)]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">


          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-7 leading-[1.1] tracking-tight animate-fadeInUp">
            Discover Places That
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Match Your Vibe
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400/90 mb-12 max-w-2xl mx-auto leading-relaxed animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            Tell us where you are, your budget, and what excites you — our AI curates the perfect destinations in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            <Link
              to="/plan"
              className="group relative flex items-center gap-2.5 px-9 py-4.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-lg shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative">Start Planning My Trip</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-9 py-4.5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] text-slate-300 font-medium hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300"
            >
              How It Works
            </a>
          </div>

          {/* Stats — glassmorphism cards */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mt-20 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
            {[
              { value: 'AI', label: 'Powered', icon: Sparkles },
              { value: '500+', label: 'Destinations', icon: Globe },
              { value: '100%', label: 'Personalized', icon: Heart },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="relative group">
                  <div className="text-center px-6 py-4 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] group-hover:border-white/[0.12] group-hover:bg-white/[0.06] transition-all duration-300">
                    <Icon className="w-4 h-4 text-emerald-400/60 mx-auto mb-2" />
                    <div className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-28 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium tracking-wider uppercase mb-4">Simple Process</span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Four simple steps to your perfect trip</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="relative group">
                  {/* Connector line */}
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px">
                      <div className="w-full h-full bg-gradient-to-r from-white/10 to-transparent" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/20" />
                    </div>
                  )}
                  {/* Glass card */}
                  <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-7 hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/5 overflow-hidden">
                    {/* Glow on hover */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500/10 blur-2xl transition-all duration-500" />
                    <div className="relative">
                      <div className="text-[10px] font-mono text-emerald-500/40 mb-3 tracking-widest">{item.step}</div>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] flex items-center justify-center mb-5 ring-1 ${item.ring} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${item.accent}`} />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-1.5">{item.title}</h3>
                      <p className="text-sm text-slate-400/80">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-28 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950" />
        <div className="max-w-6xl mx-auto relative">
          <div className="flex items-end justify-between mb-14">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium tracking-wider uppercase mb-4">Trending</span>
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-2">Popular Destinations</h2>
              <p className="text-slate-400/80">Trending places loved by travelers</p>
            </div>
            <Link to="/plan" className="hidden sm:flex items-center gap-1 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors group">
              Explore all <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDestinations.map((dest, i) => {
              const Icon = dest.icon;
              return (
                <Link
                  key={i}
                  to="/plan"
                  className="group relative overflow-hidden rounded-3xl border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/30"
                >
                  <div className={`aspect-[4/3] bg-gradient-to-br ${dest.gradient} flex items-center justify-center relative`}>
                    <Icon className="w-24 h-24 text-white/10 group-hover:text-white/15 group-hover:scale-110 transition-all duration-500" />
                    {/* Glass overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className={`inline-block px-3 py-1 rounded-full backdrop-blur-sm ${dest.tagColor} text-xs font-medium mb-2 border border-white/10`}>{dest.tag}</span>
                      <h3 className="text-2xl font-bold text-white">{dest.name}</h3>
                      <p className="text-sm text-white/50">{dest.state}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.015] to-transparent" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium tracking-wider uppercase mb-4">Features</span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">Why FindYourTrip?</h2>
            <p className="text-slate-400/80 max-w-lg mx-auto">Smart features that make trip planning effortless</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className={`group relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-7 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${feat.glow} overflow-hidden`}>
                  {/* Background glow */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-500" style={{background: `radial-gradient(circle, ${feat.color.includes('purple') ? 'rgba(168,85,247,0.08)' : feat.color.includes('amber') ? 'rgba(245,158,11,0.08)' : feat.color.includes('emerald') ? 'rgba(52,211,153,0.08)' : 'rgba(244,63,94,0.08)'}, transparent)`}} />
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
                    <p className="text-sm text-slate-400/80 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-[2rem] overflow-hidden">
            {/* Glass background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.08] via-cyan-500/[0.06] to-purple-500/[0.08]" />
            <div className="absolute inset-0 backdrop-blur-3xl" />
            <div className="absolute inset-[1px] rounded-[2rem] border border-white/[0.08]" />
            {/* Glow effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-emerald-500/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-1/4 w-60 h-40 bg-purple-500/8 rounded-full blur-[80px]" />

            <div className="relative z-10 px-8 py-16 sm:px-16 sm:py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.1] flex items-center justify-center mx-auto mb-8">
                <Globe className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-5">Ready to Find Your<br />Perfect Trip?</h2>
              <p className="text-slate-400/80 mb-10 max-w-lg mx-auto leading-relaxed">Let our AI analyze hundreds of destinations and find the ones that match your style, budget, and interests.</p>
              <Link
                to="/plan"
                className="group relative inline-flex items-center gap-2.5 px-10 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-lg shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative">Get Started — It's Free</span>
                <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <Compass className="w-4 h-4 text-slate-900" />
            </div>
            <span className="text-sm font-semibold text-slate-400">FindYourTrip</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <span>© 2026 FindYourTrip</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Privacy-First</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> AI-Powered</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

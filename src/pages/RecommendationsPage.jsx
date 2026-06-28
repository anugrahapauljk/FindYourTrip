import { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, SlidersHorizontal, ArrowUpDown, MapPin, IndianRupee, Star } from 'lucide-react';
import DestinationCard from '../components/DestinationCard';

export default function RecommendationsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { recommendations = [], searchParams = {} } = location.state || {};
  const [sortBy, setSortBy] = useState('match');

  const sortedRecommendations = useMemo(() => {
    const sorted = [...recommendations];
    switch (sortBy) {
      case 'match':
        return sorted.sort((a, b) => b.matchPercentage - a.matchPercentage);
      case 'distance':
        return sorted.sort((a, b) => (a.distanceValue || 0) - (b.distanceValue || 0));
      case 'cost':
        return sorted.sort((a, b) => (a.estimatedCost?.min || 0) - (b.estimatedCost?.min || 0));
      default:
        return sorted;
    }
  }, [recommendations, sortBy]);

  if (!recommendations.length) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Recommendations Yet</h2>
          <p className="text-slate-400 mb-6">Start by planning your trip to get AI-powered recommendations</p>
          <Link
            to="/plan"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium"
          >
            Plan a Trip
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/plan')}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to planning
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              Your AI Recommended Trips
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Based on: {searchParams.location} · ₹{Number(searchParams.budget).toLocaleString()} budget · {searchParams.maxDistance}km radius
            </p>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500">Sort by:</span>
            {[
              { key: 'match', label: 'Match %', icon: Star },
              { key: 'distance', label: 'Distance', icon: MapPin },
              { key: 'cost', label: 'Cost', icon: IndianRupee },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  sortBy === opt.key
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-6">{sortedRecommendations.length} destinations found</p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedRecommendations.map((dest, i) => (
            <DestinationCard
              key={dest.id || i}
              destination={dest}
              onClick={() => navigate(`/destination/${dest.id || dest.name.toLowerCase().replace(/\s+/g, '-')}`, {
                state: {
                  destination: dest,
                  searchParams,
                },
              })}
            />
          ))}
        </div>

        {/* Plan another */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm mb-3">Not what you're looking for?</p>
          <Link
            to="/plan"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Plan Another Trip
          </Link>
        </div>
      </div>
    </div>
  );
}

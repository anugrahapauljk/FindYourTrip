import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, CheckCircle2, Loader2, Compass, ArrowRight, Star } from 'lucide-react';
import ExperienceTag from '../components/ExperienceTag';
import { getSharedTrip } from '../services/firebaseService';

export default function SharedTripPage() {
  const { shareId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await getSharedTrip(shareId);
        if (data) {
          setTrip(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to load shared trip:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8 text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Trip Not Found</h2>
          <p className="text-slate-400 mb-6">This shared trip link may have expired or doesn't exist.</p>
          <Link to="/plan" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium">
            Plan Your Own Trip <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Shared badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-4">
            <Compass className="w-3.5 h-3.5" />
            Shared Trip
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {trip.customName || trip.name}
          </h1>
          {trip.state && (
            <p className="text-slate-400 flex items-center justify-center gap-1">
              <MapPin className="w-4 h-4" /> {trip.state}, India
            </p>
          )}
        </div>

        {/* Trip card */}
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Match */}
          {trip.matchPercentage && (
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 font-bold text-lg">
                {trip.matchPercentage}%
              </div>
              <span className="text-slate-400 text-sm">AI Match Score</span>
            </div>
          )}

          {/* Description */}
          {trip.description && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">About</h3>
              <p className="text-slate-400 leading-relaxed">{trip.description}</p>
            </div>
          )}

          {/* Tags */}
          {trip.experienceTags && (
            <div className="flex flex-wrap gap-2">
              {trip.experienceTags.map(tag => (
                <ExperienceTag key={tag} label={tag} selected size="sm" />
              ))}
            </div>
          )}

          {/* Travel info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {trip.distance && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs text-slate-500">Distance</div>
                  <div className="text-sm text-white font-medium">{trip.distance}</div>
                </div>
              </div>
            )}
            {trip.estimatedCost && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <IndianRupee className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs text-slate-500">Est. Cost</div>
                  <div className="text-sm text-white font-medium">₹{trip.estimatedCost.min?.toLocaleString()} - ₹{trip.estimatedCost.max?.toLocaleString()}</div>
                </div>
              </div>
            )}
            {trip.searchLocation && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <Star className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-xs text-slate-500">From</div>
                  <div className="text-sm text-white font-medium">{trip.searchLocation}</div>
                </div>
              </div>
            )}
          </div>

          {/* Cost breakdown */}
          {trip.estimatedCost?.breakdown && (() => {
            const modeEmojis = {
              car: '🚗',
              bike: '🏍',
              bus: '🚌',
              train: '🚆',
              flight: '✈'
            };
            const labels = {
              car: 'Car',
              bike: 'Bike',
              bus: 'Bus',
              train: 'Train',
              flight: 'Flight'
            };
            const travelModeKey = trip.travelMode || 'car';
            const emoji = modeEmojis[travelModeKey] || '🚗';
            const label = labels[travelModeKey] || 'Car';
            
            return (
              <div className="pt-4 border-t border-white/5 space-y-3">
                <h4 className="text-sm font-semibold text-slate-300">Budget Breakdown</h4>
                <div className="space-y-2.5 max-w-md">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span>{emoji}</span> Transport ({label})
                    </span>
                    <span className="text-white font-medium">₹{(trip.estimatedCost.breakdown.travel || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span>🏨</span> Stay
                    </span>
                    <span className="text-white font-medium">₹{(trip.estimatedCost.breakdown.stay || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span>🍽</span> Food
                    </span>
                    <span className="text-white font-medium">₹{(trip.estimatedCost.breakdown.food || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span>🎟</span> Activities
                    </span>
                    <span className="text-white font-medium">₹{(trip.estimatedCost.breakdown.activities || 0).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2.5 mt-2.5 flex items-center justify-between font-bold text-white">
                    <span>Total Estimated Budget</span>
                    <span>₹{trip.estimatedCost?.min?.toLocaleString()} - ₹{trip.estimatedCost?.max?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* CTA */}
          <div className="pt-4 border-t border-white/5 text-center">
            <p className="text-sm text-slate-500 mb-4">Want to discover your own perfect destinations?</p>
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5"
            >
              Plan My Trip <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

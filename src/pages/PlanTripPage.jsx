import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, IndianRupee, Clock, Sparkles, Search, RotateCcw, Car, Bus, TrainFront, Plane } from 'lucide-react';
import ExperienceTag from '../components/ExperienceTag';
import LoadingAnimation from '../components/LoadingAnimation';
import { geocodeLocation } from '../services/mapsService';
import { getAIRecommendations } from '../services/groqService';
import { useAuth } from '../contexts/AuthContext';
import { saveSearchHistory } from '../services/firebaseService';

const experienceOptions = ['Nature', 'Beach', 'Adventure', 'History', 'Food', 'Relaxation'];

const durationOptions = [
  { value: '1 day', label: '1 Day' },
  { value: '2-3 days', label: '2-3 Days' },
  { value: 'weekend', label: 'Weekend' },
  { value: '1 week', label: '1 Week' },
];

const travelModeOptions = [
  { value: 'car', label: 'Car', icon: Car, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  { value: 'bus', label: 'Bus', icon: Bus, color: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10' },
  { value: 'train', label: 'Train', icon: TrainFront, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { value: 'airplane', label: 'Airplane', icon: Plane, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
];

export default function PlanTripPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    location: '',
    maxDistance: 200,
    budget: '',
    experiences: [],
    duration: '',
    travelMode: 'car',
  });

  const toggleExperience = (exp) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.includes(exp)
        ? prev.experiences.filter(e => e !== exp)
        : [...prev.experiences, exp]
    }));
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.location.trim()) return setError('Please enter your location');
    if (!formData.budget || Number(formData.budget) <= 0) return setError('Please enter a valid budget');
    if (formData.experiences.length === 0) return setError('Please select at least one experience');
    if (!formData.duration) return setError('Please select trip duration');

    setLoading(true);

    try {
      // Geocode location
      let coordinates = null;
      try {
        coordinates = await geocodeLocation(formData.location);
      } catch (geoErr) {
        console.warn('Geocoding failed, proceeding without coordinates:', geoErr);
      }

      // Get AI recommendations
      const recommendations = await getAIRecommendations({
        location: formData.location,
        coordinates,
        maxDistance: formData.maxDistance,
        budget: formData.budget,
        experiences: formData.experiences,
        duration: formData.duration,
        travelMode: formData.travelMode,
      });

      // Save search history if user is logged in
      if (user) {
        try {
          await saveSearchHistory(user.uid, {
            location: formData.location,
            maxDistance: formData.maxDistance,
            budget: formData.budget,
            experiences: formData.experiences,
            duration: formData.duration,
            travelMode: formData.travelMode,
            resultsCount: recommendations.length,
          });
        } catch (histErr) {
          console.warn('Failed to save search history:', histErr);
        }
      }

      // Navigate to recommendations with data
      navigate('/recommendations', {
        state: {
          recommendations,
          searchParams: {
            ...formData,
            coordinates,
          },
        },
      });
    } catch (err) {
      console.error('Trip planning error:', err);
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, navigate, user]);

  const resetForm = () => {
    setFormData({ location: '', maxDistance: 200, budget: '', experiences: [], duration: '', travelMode: 'car' });
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Planning Your Perfect Trip</h2>
        <p className="text-slate-400 mb-8">Our AI is finding the best destinations for you...</p>
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs mb-4">
            <Sparkles className="w-3 h-3" />
            AI-Powered Planning
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Plan Your Perfect Trip</h1>
          <p className="text-slate-400">Tell us your preferences and let AI do the magic</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Where are you traveling from?
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Kochi, Kerala"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Max Distance */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
            <label className="flex items-center justify-between text-sm font-medium text-slate-300 mb-3">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Maximum Distance
              </span>
              <span className="text-emerald-400 font-mono">{formData.maxDistance} km</span>
            </label>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={formData.maxDistance}
              onChange={(e) => setFormData(prev => ({ ...prev, maxDistance: Number(e.target.value) }))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>10 km</span>
              <span>500 km</span>
            </div>
          </div>

          {/* Budget */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <IndianRupee className="w-4 h-4 text-amber-400" />
              Your Budget
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="5000"
                min="0"
                className="w-full pl-9 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Travel Mode */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-4">
              <Car className="w-4 h-4 text-blue-400" />
              Mode of Travel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {travelModeOptions.map(opt => {
                const Icon = opt.icon;
                const isSelected = formData.travelMode === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, travelMode: opt.value }))}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                      isSelected
                        ? `${opt.bg} ${opt.border} ${opt.color} shadow-lg`
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Experience Tags */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              What experience?
            </label>
            <div className="flex flex-wrap gap-2">
              {experienceOptions.map(exp => (
                <ExperienceTag
                  key={exp}
                  label={exp}
                  selected={formData.experiences.includes(exp)}
                  onClick={() => toggleExperience(exp)}
                />
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-4">
              <Clock className="w-4 h-4 text-pink-400" />
              Trip Duration
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {durationOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, duration: opt.value }))}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                    formData.duration === opt.value
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-medium hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-lg shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate My Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

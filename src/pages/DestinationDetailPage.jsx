import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, IndianRupee, Heart, CheckCircle2, Star, Navigation, Loader2, Utensils, Lightbulb, Calendar, Map as MapIcon, X, Download } from 'lucide-react';
import ExperienceTag from '../components/ExperienceTag';
import MapView from '../components/MapView';
import { useAuth } from '../contexts/AuthContext';
import { saveTrip } from '../services/firebaseService';
import { getDestinationDetails } from '../services/groqService';
import { getPlacePhoto } from '../services/mapsService';
import { exportElementToPDF } from '../utils/pdfExport';

export default function DestinationDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();
  const { destination, searchParams } = location.state || {};

  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [heroPhoto, setHeroPhoto] = useState(null);

  useEffect(() => {
    if (!destination) return;
    
    const fetchDetails = async () => {
      try {
        const data = await getDestinationDetails(destination.name, searchParams?.location || '', searchParams?.duration || '');
        setDetails(data);
      } catch (err) {
        console.error('Failed to load details:', err);
        setError('Failed to load destination details.');
      } finally {
        setLoadingDetails(false);
      }
    };

    // Fetch place photo
    const searchQuery = destination.state
      ? `${destination.name} ${destination.state} India tourism`
      : `${destination.name} India tourism`;
    getPlacePhoto(searchQuery, 1200)
      .then((url) => { if (url) setHeroPhoto(url); })
      .catch(() => {});
    
    fetchDetails();
  }, [destination, searchParams]);

  const handleSaveTrip = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
      } catch {
        return;
      }
    }
    
    setSaving(true);
    try {
      await saveTrip(user.uid, {
        name: destination.name,
        description: destination.description,
        distance: destination.distance,
        estimatedCost: destination.estimatedCost,
        matchPercentage: destination.matchPercentage,
        experienceTags: destination.experienceTags,
        state: destination.state,
        searchLocation: searchParams?.location,
      });
      setSaved(true);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save trip.');
    } finally {
      setSaving(false);
    }
  };

  const [exporting, setExporting] = useState(false);
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const element = document.getElementById('itinerary-content');
      await exportElementToPDF(element, `${destination.name}-Trip-Plan.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (!destination) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Destination not found</h2>
          <button onClick={() => navigate('/plan')} className="text-emerald-400">Plan a trip</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero */}
      <div className="relative h-72 sm:h-96 flex items-end overflow-hidden">
        {/* Background photo or gradient fallback */}
        {heroPhoto ? (
          <img
            src={heroPhoto}
            alt={destination.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 via-cyan-600/20 to-purple-600/30" />
        )}
        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto w-full px-4 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to recommendations
          </button>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {destination.experienceTags?.slice(0, 2).map(tag => (
                  <ExperienceTag key={tag} label={tag} selected size="sm" />
                ))}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{destination.name}</h1>
              <p className="text-white/60 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" /> {destination.state}, {destination.country || 'India'}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 font-bold text-lg shadow-lg`}>
              {destination.matchPercentage}%
            </div>
          </div>
        </div>
      </div>

      <div id="itinerary-content" className="max-w-5xl mx-auto px-4 mt-8">
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-3">About</h2>
              <p className="text-slate-400 leading-relaxed">{destination.description}</p>
              {details?.fullDescription && (
                <p className="text-slate-400 leading-relaxed mt-3">{details.fullDescription}</p>
              )}
              {details?.history && (
                <p className="text-slate-500 leading-relaxed mt-3 text-sm italic">{details.history}</p>
              )}
            </div>

            {/* Match Reasons */}
            {destination.matchReasons && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  Why This Matches You
                </h2>
                <div className="space-y-2">
                  {destination.matchReasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day-by-Day Itinerary */}
            {details?.itinerary && details.itinerary.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    AI-Generated Itinerary ({searchParams?.duration || 'Multi-day'})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Custom day-by-day plan prepared for your travel style</p>
                </div>
                
                <div className="relative border-l border-white/10 ml-4 pl-6 space-y-8">
                  {details.itinerary.map((dayPlan, i) => (
                    <div key={i} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border-2 border-emerald-400 group-hover:bg-emerald-400 transition-colors" />
                      
                      <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2">
                        Day {dayPlan.day || (i + 1)}: {dayPlan.title}
                      </h3>
                      
                      <div className="mt-4 space-y-3">
                        {dayPlan.activities?.map((act, j) => (
                          <div key={j} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-sm font-semibold text-white">{act.activity}</span>
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 text-[10px] uppercase font-mono">{act.time}</span>
                            </div>
                            {act.description && (
                              <p className="text-xs text-slate-400 leading-relaxed">{act.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Things to Do */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Things to Do</h2>
              {loadingDetails ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading activities...
                </div>
              ) : details?.thingsToDo ? (
                <div className="grid gap-3">
                  {details.thingsToDo.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-emerald-400">{i + 1}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white">{item.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          {item.duration && <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.duration}</span>}
                          {item.cost && <span className="text-xs text-slate-500 flex items-center gap-1"><IndianRupee className="w-3 h-3" /> {item.cost}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {destination.activities?.map((act, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {act}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Local Cuisine */}
            {details?.localCuisine && details.localCuisine.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-400" />
                  Local Cuisine
                </h2>
                <div className="flex flex-wrap gap-2">
                  {details.localCuisine.map((dish, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm">
                      {dish}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-cyan-400" />
                Map & Navigation
              </h2>
              <MapView
                destination={destination.name}
                origin={searchParams?.location}
                className="h-80"
              />
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(searchParams?.location || '')}&destination=${encodeURIComponent(destination.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-all"
              >
                <Navigation className="w-4 h-4" />
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Travel Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-white mb-4">Travel Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Distance</div>
                    <div className="text-sm text-white font-medium">{destination.distance}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Travel Time</div>
                    <div className="text-sm text-white font-medium">{destination.travelTime}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Estimated Cost</div>
                    <div className="text-sm text-white font-medium">₹{destination.estimatedCost?.min?.toLocaleString()} - ₹{destination.estimatedCost?.max?.toLocaleString()}</div>
                  </div>
                </div>

                {destination.bestTimeToVisit && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-pink-400" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Best Time</div>
                      <div className="text-sm text-white font-medium">{destination.bestTimeToVisit}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cost breakdown */}
              {destination.estimatedCost?.breakdown && (() => {
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
                const travelModeKey = destination.travelMode || 'car';
                const emoji = modeEmojis[travelModeKey] || '🚗';
                const label = labels[travelModeKey] || 'Car';
                
                return (
                  <div className="mt-5 pt-5 border-t border-white/5 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget Breakdown</h4>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <span>{emoji}</span> Transport ({label})
                        </span>
                        <span className="text-slate-350 font-medium">₹{(destination.estimatedCost.breakdown.travel || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <span>🏨</span> Stay
                        </span>
                        <span className="text-slate-350 font-medium">₹{(destination.estimatedCost.breakdown.stay || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <span>🍽</span> Food
                        </span>
                        <span className="text-slate-350 font-medium">₹{(destination.estimatedCost.breakdown.food || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <span>🎟</span> Activities
                        </span>
                        <span className="text-slate-350 font-medium">₹{(destination.estimatedCost.breakdown.activities || 0).toLocaleString()}</span>
                      </div>
                      <div className="border-t border-white/10 pt-2.5 mt-2.5 flex items-center justify-between text-xs sm:text-sm font-bold text-white">
                        <span>Total Budget</span>
                        <span>₹{destination.estimatedCost?.min?.toLocaleString()} - ₹{destination.estimatedCost?.max?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Travel tips */}
              {details?.travelTips && details.travelTips.length > 0 && (
                <div className="mt-5 pt-5 border-t border-white/5">
                  <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> Travel Tips
                  </h4>
                  <div className="space-y-2">
                    {details.travelTips.map((tip, i) => (
                      <p key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        {tip}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Save button */}
              <button
                onClick={handleSaveTrip}
                disabled={saved || saving}
                className={`w-full mt-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                  saved
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 hover:-translate-y-0.5'
                }`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <><CheckCircle2 className="w-4 h-4" /> Trip Saved!</>
                ) : (
                  <><Heart className="w-4 h-4" /> Save Trip ❤️</>
                )}
              </button>

              {/* Export button */}
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="w-full mt-3 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><Download className="w-4 h-4" /> Export as PDF</>
                )}
              </button>
            </div>

            {/* Nearby Attractions */}
            {(destination.nearbyAttractions || details?.nearbyAttractions) && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Nearby Attractions</h3>
                <div className="space-y-3">
                  {(details?.nearbyAttractions || destination.nearbyAttractions)?.map((attr, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-white">{attr.name}</div>
                        <div className="text-xs text-slate-500">{attr.distance} · {attr.type}</div>
                        {attr.description && <div className="text-xs text-slate-500 mt-0.5">{attr.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, IndianRupee, Clock, Sparkles, Navigation, ChevronRight, ChevronLeft, Car, Bus, TrainFront, Plane, Map as MapIcon, XCircle, Search, Bike, RotateCcw } from 'lucide-react';
import { useJsApiLoader, GoogleMap, MarkerF } from '@react-google-maps/api';
import ExperienceTag from '../components/ExperienceTag';
import LoadingAnimation from '../components/LoadingAnimation';
import { geocodeLocation, reverseGeocodeLocation, getRouteDetails } from '../services/mapsService';
import { getAIRecommendations } from '../services/groqService';
import { calculateTransportCost } from '../services/transportCalculator';
import { useAuth } from '../contexts/AuthContext';
import { saveSearchHistory } from '../services/firebaseService';

const experienceOptions = ['Nature', 'Beach', 'Adventure', 'History', 'Food', 'Relaxation', 'Culture', 'Wildlife', 'Mountains', 'Nightlife'];
const durationOptions = [
  { value: '1 day', label: '1 Day' },
  { value: '2-3 days', label: '2-3 Days' },
  { value: 'weekend', label: 'Weekend' },
  { value: '1 week', label: '1 Week' },
];
const travelModeOptions = [
  { value: 'car', label: 'Car', icon: Car, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  { value: 'bike', label: 'Bike', icon: Bike, color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10' },
  { value: 'bus', label: 'Bus', icon: Bus, color: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10' },
  { value: 'train', label: 'Train', icon: TrainFront, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { value: 'flight', label: 'Flight', icon: Plane, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
];

const mapContainerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '1rem',
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

const STEPS = [
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'budget', title: 'Budget', icon: IndianRupee },
  { id: 'duration', title: 'Duration', icon: Clock },
  { id: 'preferences', title: 'Experiences', icon: Sparkles },
  { id: 'transport', title: 'Transport', icon: Navigation },
];

export default function PlanTripPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Geolocation specific error
  const [geoError, setGeoError] = useState('');

  const [currentStep, setCurrentStep] = useState(0);
  const inputRef = useRef(null);

  const [formData, setFormData] = useState({
    location: '',
    maxDistance: 200,
    budget: '',
    experiences: [],
    duration: '',
    travelMode: 'car',
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(4);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  // Focus input when step changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentStep]);

  const toggleExperience = (exp) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.includes(exp)
        ? prev.experiences.filter(e => e !== exp)
        : [...prev.experiences, exp]
    }));
  };

  const handleSearchLocation = async () => {
    if (!formData.location.trim()) return;
    setIsSearchingMap(true);
    setError('');
    setGeoError('');
    try {
      const results = await geocodeLocation(formData.location);
      if (results && results.lat) {
        const coords = { lat: results.lat, lng: results.lng };
        setMapCenter(coords);
        setSelectedLocation(coords);
        setMapZoom(12);
        setFormData(prev => ({ ...prev, location: results.formattedAddress }));
      }
    } catch (err) {
      setGeoError('Could not find this location on the map.');
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const coords = { lat, lng };
    
    setSelectedLocation(coords);
    setMapCenter(coords);
    setGeoError('');

    try {
      const result = await reverseGeocodeLocation(lat, lng);
      if (result && result.formattedAddress) {
        setFormData(prev => ({ ...prev, location: result.formattedAddress }));
      }
    } catch (err) {
      setGeoError('Could not get address for this location.');
    }
  };

  const handleNext = (override = null) => {
    setError('');
    
    // Merge override data to validate the latest state if it was updated from quick-select
    const isEvent = override && typeof override.preventDefault === 'function';
    const dataToValidate = (override && !isEvent) ? { ...formData, ...override } : formData;

    // Step validation
    if (currentStep === 0 && !dataToValidate.location.trim()) return setError('Please enter your location');
    if (currentStep === 1 && (!dataToValidate.budget || Number(dataToValidate.budget) <= 0)) return setError('Please enter a valid budget');
    if (currentStep === 2 && !dataToValidate.duration) return setError('Please select trip duration');
    if (currentStep === 3 && dataToValidate.experiences.length === 0) return setError('Please select at least one experience');

    if (override && !isEvent) {
      setFormData(prev => ({ ...prev, ...override }));
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      handleSubmit(dataToValidate);
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 0) setCurrentStep(curr => curr - 1);
  };

  const handleGetCurrentLocation = () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`);
          const data = await response.json();
          if (data.status === 'OK' && data.results[0]) {
            // Get city/state level address roughly
            const address = data.results[0].address_components.filter(c => c.types.includes('locality') || c.types.includes('administrative_area_level_1')).map(c => c.long_name).join(', ');
            const formatted = address || data.results[0].formatted_address;
            setFormData(prev => ({ ...prev, location: formatted }));
            const coords = { lat, lng };
            setMapCenter(coords);
            setSelectedLocation(coords);
            setMapZoom(12);
          } else {
            setGeoError('Could not resolve your location address.');
          }
        } catch (err) {
          setGeoError('Failed to fetch address details.');
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Location access denied. Please type your location manually.');
        } else {
          setGeoError('Failed to get current location.');
        }
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (finalData = formData) => {
    setError('');
    setLoading(true);

    try {
      // 1. Geocode
      let coordinates = null;
      try {
        coordinates = await geocodeLocation(finalData.location);
      } catch (geoErr) {
        console.warn('Geocoding failed:', geoErr);
        // Fallback UI for geocoding zero results
        if (geoErr.message?.includes('ZERO_RESULTS')) {
          throw new Error('We could not find that location on the map. Please try a different name.');
        }
      }

      // 2. Fetch recommendations
      let recommendations = [];
      try {
        recommendations = await getAIRecommendations({
          location: finalData.location,
          coordinates,
          maxDistance: finalData.maxDistance,
          budget: finalData.budget,
          experiences: finalData.experiences,
          duration: finalData.duration,
          travelMode: finalData.travelMode,
        });
      } catch (aiErr) {
        console.error("AI Error:", aiErr);
        throw new Error(aiErr.message || 'Failed to generate recommendations. The AI might be busy, please try again.');
      }

      if (!recommendations || recommendations.length === 0) {
        throw new Error('No valid recommendations returned. Please try adjusting your preferences.');
      }

      // Programmatic distance, duration, transport cost, and budget breakdown calculations
      const augmentedRecommendations = await Promise.all(
        recommendations.map(async (dest) => {
          try {
            const route = await getRouteDetails(finalData.location, dest.name, finalData.travelMode);
            const transportCost = calculateTransportCost(route.distanceValue, finalData.travelMode);
            
            const stayMin = dest.stayCost?.min || 1500;
            const stayMax = dest.stayCost?.max || 3000;
            const foodMin = dest.foodCost?.min || 800;
            const foodMax = dest.foodCost?.max || 1500;
            const actMin = dest.activitiesCost?.min || 500;
            const actMax = dest.activitiesCost?.max || 1000;
            
            const minTotal = transportCost + stayMin + foodMin + actMin;
            const maxTotal = transportCost + stayMax + foodMax + actMax;

            return {
              ...dest,
              distance: route.distanceText,
              distanceValue: route.distanceValue,
              travelTime: route.durationText,
              travelMode: finalData.travelMode,
              estimatedCost: {
                min: minTotal,
                max: maxTotal,
                currency: 'INR',
                breakdown: {
                  travel: transportCost,
                  stay: Math.round((stayMin + stayMax) / 2),
                  food: Math.round((foodMin + foodMax) / 2),
                  activities: Math.round((actMin + actMax) / 2)
                }
              }
            };
          } catch (err) {
            console.error('Failed to augment route details:', err);
            return dest;
          }
        })
      );

      // 3. Save History
      if (user) {
        try {
          await saveSearchHistory(user.uid, {
            location: finalData.location,
            maxDistance: finalData.maxDistance,
            budget: finalData.budget,
            experiences: finalData.experiences,
            duration: finalData.duration,
            travelMode: finalData.travelMode,
            resultsCount: augmentedRecommendations.length,
          });
        } catch (histErr) {
          console.warn('Failed to save search history:', histErr);
        }
      }

      navigate('/recommendations', {
        state: {
          recommendations: augmentedRecommendations,
          searchParams: {
            ...finalData,
            coordinates,
          },
        },
      });
    } catch (err) {
      console.error('Trip planning error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
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

  const StepIcon = STEPS[currentStep].icon;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex flex-col">
      <div className="max-w-xl mx-auto w-full flex-1 flex flex-col">
        {/* Progress Indicator */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  idx === currentStep ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                  idx < currentStep ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-slate-800 text-slate-500'
                }`}>
                  <step.icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] sm:text-xs font-medium transition-colors ${
                  idx === currentStep ? 'text-white' : 'text-slate-500'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
            {/* Connecting lines */}
            <div className="absolute top-[16px] left-8 right-8 h-0.5 bg-slate-800 -z-0">
              <div 
                className="h-full bg-emerald-500/50 transition-all duration-300"
                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6 sm:p-8 flex-1 flex flex-col relative overflow-hidden transition-all duration-300">
          
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <StepIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {currentStep === 0 && 'Where are you starting?'}
                {currentStep === 1 && 'What is your budget?'}
                {currentStep === 2 && 'How long is the trip?'}
                {currentStep === 3 && 'What experiences do you want?'}
                {currentStep === 4 && 'How will you travel?'}
              </h2>
            </div>
          </div>

          <div className="flex-1">
            {/* Step 0: Location */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation()}
                        placeholder="e.g. Kochi, Kerala"
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all text-lg"
                      />
                    </div>
                    <button
                      onClick={handleSearchLocation}
                      disabled={isSearchingMap || !formData.location.trim()}
                      className="px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                    >
                      {isSearchingMap ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Search className="w-5 h-5 mr-2" /> Search</>}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={handleGetCurrentLocation}
                      className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Navigation className="w-4 h-4" /> Use current location
                    </button>
                    <span className="text-xs text-slate-500">Or click map to drop a pin</span>
                  </div>
                  
                  {geoError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-500/10 rounded-xl">
                      <XCircle className="w-4 h-4 flex-shrink-0" /> {geoError}
                    </div>
                  )}

                  {isLoaded ? (
                    <div className="w-full h-[250px] rounded-2xl overflow-hidden border border-white/10 relative mt-4 shadow-inner">
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={mapCenter}
                        zoom={mapZoom}
                        onClick={handleMapClick}
                        options={{
                          disableDefaultUI: true,
                          zoomControl: true,
                          styles: darkMapStyle,
                        }}
                      >
                        {selectedLocation && (
                          <MarkerF position={selectedLocation} animation={window.google?.maps?.Animation?.DROP} />
                        )}
                      </GoogleMap>
                    </div>
                  ) : (
                    <div className="w-full h-[250px] rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-center mt-4">
                      <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/5">
                    <label className="flex items-center justify-between text-sm font-medium text-slate-300 mb-4">
                      <span>Maximum Travel Distance</span>
                      <span className="text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-lg">{formData.maxDistance} km</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="10"
                      value={formData.maxDistance}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxDistance: Number(e.target.value) }))}
                      className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-900 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>10 km</span>
                      <span>1000 km</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Budget */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-2xl">₹</span>
                  <input
                    ref={inputRef}
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    placeholder="5000"
                    min="100"
                    className="w-full pl-12 pr-6 py-5 bg-slate-900/50 border border-white/10 rounded-2xl text-white text-2xl placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[3000, 5000, 10000, 20000, 50000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => handleNext({ budget: amt.toString() })}
                      className="py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 text-sm font-medium transition-all"
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Duration */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {durationOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleNext({ duration: opt.value })}
                    className={`p-5 rounded-2xl border text-left transition-all duration-200 group flex items-center justify-between ${
                      formData.duration === opt.value
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-emerald-400'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <span className="font-medium text-lg">{opt.label}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      formData.duration === opt.value ? 'border-emerald-500' : 'border-slate-600 group-hover:border-slate-400'
                    }`}>
                      {formData.duration === opt.value && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Experiences */}
            {currentStep === 3 && (
              <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                {experienceOptions.map(exp => (
                  <button
                    key={exp}
                    onClick={() => toggleExperience(exp)}
                    className={`px-5 py-3 rounded-xl text-sm font-medium border transition-all duration-300 ${
                      formData.experiences.includes(exp)
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)] scale-105'
                        : 'bg-slate-900/50 border-white/10 hover:border-white/20 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: Travel Mode */}
            {currentStep === 4 && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {travelModeOptions.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = formData.travelMode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setFormData(prev => ({ ...prev, travelMode: opt.value }))}
                      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-300 ${
                        isSelected
                          ? `${opt.bg} ${opt.border} ${opt.color} shadow-[0_0_20px_rgba(0,0,0,0.1)] scale-105`
                          : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300 hover:bg-slate-900/80'
                      }`}
                    >
                      <Icon className={`w-8 h-8 ${isSelected ? opt.color : 'text-slate-500'}`} />
                      <span className="font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-in fade-in">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-10 flex gap-4 pt-6 border-t border-white/5">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`px-6 py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
                currentStep === 0 
                  ? 'opacity-0 pointer-events-none' 
                  : 'bg-white/5 hover:bg-white/10 text-white w-32'
              }`}
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-2">
                {currentStep === STEPS.length - 1 ? (
                  <><Sparkles className="w-5 h-5" /> Generate My Trip</>
                ) : (
                  <>Continue <ChevronRight className="w-5 h-5" /></>
                )}
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

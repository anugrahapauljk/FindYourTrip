import { useState, useEffect } from 'react';
import { MapPin, Clock, IndianRupee, ArrowRight, ImageIcon } from 'lucide-react';
import ExperienceTag from './ExperienceTag';
import { getPlacePhoto } from '../services/mapsService';

export default function DestinationCard({ destination, onClick }) {
  const { name, description, distance, travelTime, estimatedCost, matchPercentage, experienceTags, activities, state } = destination;
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const searchQuery = state ? `${name} ${state} India tourism` : `${name} India tourism`;

    getPlacePhoto(searchQuery, 600)
      .then((url) => { if (!cancelled) setPhotoUrl(url); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPhotoLoading(false); });

    return () => { cancelled = true; };
  }, [name, state]);

  const getMatchColor = (pct) => {
    if (pct >= 85) return 'from-emerald-400 to-cyan-400';
    if (pct >= 70) return 'from-amber-400 to-orange-400';
    return 'from-slate-400 to-slate-500';
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden hover:border-emerald-500/30 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5"
    >
      {/* Photo area */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {photoLoading ? (
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-600">
                <ImageIcon className="w-8 h-8" />
                <span className="text-xs">No photo available</span>
              </div>
            )}
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Match badge */}
        <div className="absolute top-3 right-3">
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getMatchColor(matchPercentage)} text-slate-900 text-xs font-bold shadow-lg backdrop-blur-sm`}>
            {matchPercentage}% Match
          </div>
        </div>

        {/* Tags on photo */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {experienceTags?.slice(0, 2).map(tag => (
            <ExperienceTag key={tag} label={tag} selected size="sm" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
            {name}
          </h3>
          {state && (
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {state}
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{description}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{distance}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate">{travelTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <IndianRupee className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate">₹{estimatedCost?.min?.toLocaleString()}-{estimatedCost?.max?.toLocaleString()}</span>
          </div>
        </div>

        {/* Activities preview */}
        {activities && activities.length > 0 && (
          <div className="text-xs text-slate-500 mb-3">
            <span className="text-slate-400">Activities:</span> {activities.slice(0, 3).join(' · ')}
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center justify-end text-sm text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity pt-2 border-t border-white/5">
          View Details <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

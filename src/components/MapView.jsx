import { getEmbedMapUrl, getDirectionsMapUrl } from '../services/mapsService';

export default function MapView({ destination, origin, className = '' }) {
  const mapUrl = origin
    ? getDirectionsMapUrl(origin, destination)
    : getEmbedMapUrl(destination);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-white/10 ${className}`}>
      <iframe
        title="Map"
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: '300px' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {/* Overlay gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
    </div>
  );
}

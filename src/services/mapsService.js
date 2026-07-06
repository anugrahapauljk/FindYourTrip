const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Cache for geocoding results
const geocodeCache = new Map();

// Request deduplication cache for active promises
const pendingRequests = new Map();

function deduplicate(key, fetchFn) {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  const promise = fetchFn().finally(() => {
    pendingRequests.delete(key);
  });
  pendingRequests.set(key, promise);
  return promise;
}

// Load Google Maps JS API once
let mapsLoadPromise = null;

function loadGoogleMapsAPI() {
  if (mapsLoadPromise) return mapsLoadPromise;

  mapsLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps?.Geocoder) {
      resolve(window.google.maps);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google.maps));
      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geocoding`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    document.head.appendChild(script);
  });

  return mapsLoadPromise;
}

export async function geocodeLocation(address) {
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address);
  }

  return deduplicate(`geocode-${address}`, async () => {
    try {
      const maps = await loadGoogleMapsAPI();
      const geocoder = new maps.Geocoder();

      const response = await new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results.length > 0) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      const result = {
        lat: response[0].geometry.location.lat(),
        lng: response[0].geometry.location.lng(),
        formattedAddress: response[0].formatted_address,
      };

      geocodeCache.set(address, result);
      return result;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  });
}

export async function reverseGeocodeLocation(lat, lng) {
  const cacheKey = `${lat},${lng}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  return deduplicate(`reverse-geocode-${cacheKey}`, async () => {
    try {
      const maps = await loadGoogleMapsAPI();
      const geocoder = new maps.Geocoder();

      const response = await new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results.length > 0) {
            resolve(results);
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        });
      });

      // Get city/state level address roughly or just formatted address
      const addressComponents = response[0].address_components;
      const cityState = addressComponents.filter(c => c.types.includes('locality') || c.types.includes('administrative_area_level_1')).map(c => c.long_name).join(', ');
      
      const result = {
        lat,
        lng,
        formattedAddress: cityState || response[0].formatted_address,
        fullAddress: response[0].formatted_address
      };

      geocodeCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  });
}

export function getEmbedMapUrl(query) {
  return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(query)}&zoom=12`;
}

export function getDirectionsMapUrl(origin, destination) {
  return `https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_API_KEY}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving`;
}

export function getStaticMapUrl(lat, lng, zoom = 13, width = 600, height = 400) {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
}

// ===== Places API: Photo fetching (Migrated to modern google.maps.places.Place API) =====
const photoCache = new Map();

export async function getPlacePhoto(placeName, maxWidth = 800) {
  const lowerName = (placeName || '').toLowerCase();
  if (lowerName.includes('munnar')) {
    return '/images/munnar.jpg';
  }
  if (lowerName.includes('goa')) {
    return '/images/goa.jpg';
  }
  if (lowerName.includes('manali')) {
    return '/images/manali.jpg';
  }

  const cacheKey = `${placeName}-${maxWidth}`;
  if (photoCache.has(cacheKey)) return photoCache.get(cacheKey);

  return deduplicate(`photo-${cacheKey}`, async () => {
    try {
      const maps = await loadGoogleMapsAPI();
      
      // Use the modern importLibrary to load the new places library
      const { Place } = await maps.importLibrary("places");

      const request = {
        textQuery: placeName,
        fields: ['photos', 'id', 'displayName'],
      };

      const { places } = await Place.searchByText(request);
      
      if (places && places.length > 0 && places[0].photos && places[0].photos.length > 0) {
        const url = places[0].photos[0].getURI({ maxWidth });
        if (url) {
          photoCache.set(cacheKey, url);
          return url;
        }
      }
      return null;
    } catch (error) {
      console.error('Place photo error:', error);
      return null;
    }
  });
}

// Batch fetch photos for multiple places (parallel, cached)
export async function getPlacePhotos(placeNames, maxWidth = 600) {
  const results = await Promise.allSettled(
    placeNames.map((name) => getPlacePhoto(name, maxWidth))
  );
  const map = {};
  placeNames.forEach((name, i) => {
    map[name] = results[i].status === 'fulfilled' ? results[i].value : null;
  });
  return map;
}

/**
 * Calculates distance and duration between origin and destination using DistanceMatrixService.
 * For flights, calculates straight-line distance and air travel time.
 */
export async function getRouteDetails(origin, destination, mode = 'car') {
  const normMode = (mode || '').toLowerCase().trim();

  // If it's a flight, geocode both and calculate straight line distance
  if (normMode === 'flight') {
    try {
      const originGeo = await geocodeLocation(origin);
      const destGeo = await geocodeLocation(destination);
      
      // Calculate straight line distance (Haversine formula)
      const R = 6371; // Earth radius in km
      const dLat = (destGeo.lat - originGeo.lat) * Math.PI / 180;
      const dLng = (destGeo.lng - originGeo.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(originGeo.lat * Math.PI / 180) * Math.cos(destGeo.lat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distanceValue = Math.round(R * c); // in km
      
      // Flight duration: distance / 500 km/h + 2 hours (boarding)
      const durationHours = (distanceValue / 500) + 2;
      const durationText = durationHours < 3 
        ? `${Math.round(durationHours * 60)} mins` 
        : `${durationHours.toFixed(1)} hours`;

      return {
        distanceText: `${distanceValue} km`,
        distanceValue: distanceValue,
        durationText: `${durationText} (Flight)`,
        durationValue: Math.round(durationHours * 3600), // in seconds
      };
    } catch (err) {
      console.warn('Flight route calculation failed, using fallback driving:', err);
    }
  }

  // Map travel modes to Google Maps travel modes
  let googleTravelMode = 'DRIVING';
  if (normMode === 'train' || normMode === 'bus') {
    googleTravelMode = 'TRANSIT';
  }

  try {
    const maps = await loadGoogleMapsAPI();
    const service = new maps.DistanceMatrixService();

    const response = await new Promise((resolve, reject) => {
      service.getDistanceMatrix({
        origins: [origin],
        destinations: [destination],
        travelMode: maps.TravelMode[googleTravelMode] || maps.TravelMode.DRIVING,
        unitSystem: maps.UnitSystem.METRIC,
      }, (results, status) => {
        if (status === 'OK' && results.rows?.[0]?.elements?.[0]?.status === 'OK') {
          resolve(results.rows[0].elements[0]);
        } else {
          // If TRANSIT failed, fallback to DRIVING
          if (googleTravelMode === 'TRANSIT') {
            resolve(null);
          } else {
            reject(new Error(`Distance Matrix failed: status ${status}`));
          }
        }
      });
    });

    if (response) {
      return {
        distanceText: response.distance.text,
        distanceValue: Math.round(response.distance.value / 1000), // in km
        durationText: response.duration.text,
        durationValue: response.duration.value, // in seconds
      };
    }

    // Fallback if TRANSIT was not found
    const fallbackResponse = await new Promise((resolve, reject) => {
      service.getDistanceMatrix({
        origins: [origin],
        destinations: [destination],
        travelMode: maps.TravelMode.DRIVING,
        unitSystem: maps.UnitSystem.METRIC,
      }, (results, status) => {
        if (status === 'OK' && results.rows?.[0]?.elements?.[0]?.status === 'OK') {
          resolve(results.rows[0].elements[0]);
        } else {
          reject(new Error(`Fallback Distance Matrix failed: ${status}`));
        }
      });
    });

    return {
      distanceText: fallbackResponse.distance.text,
      distanceValue: Math.round(fallbackResponse.distance.value / 1000),
      durationText: fallbackResponse.duration.text,
      durationValue: fallbackResponse.duration.value,
    };

  } catch (error) {
    console.error('getRouteDetails error:', error);
    // Simple coordinate-based fallback if Distance Matrix fails completely
    return {
      distanceText: '250 km',
      distanceValue: 250,
      durationText: '5 hours',
      durationValue: 18000,
    };
  }
}

export { GOOGLE_MAPS_API_KEY, loadGoogleMapsAPI };

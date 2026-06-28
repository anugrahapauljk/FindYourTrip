const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Cache for geocoding results
const geocodeCache = new Map();

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

// ===== Places API: Photo fetching =====
const photoCache = new Map();
let placesService = null;

function getPlacesService(maps) {
  if (placesService) return placesService;
  const div = document.createElement('div');
  placesService = new maps.places.PlacesService(div);
  return div && placesService;
}

export async function getPlacePhoto(placeName, maxWidth = 800) {
  const cacheKey = `${placeName}-${maxWidth}`;
  if (photoCache.has(cacheKey)) return photoCache.get(cacheKey);

  try {
    const maps = await loadGoogleMapsAPI();
    const service = getPlacesService(maps);

    const result = await new Promise((resolve) => {
      service.findPlaceFromQuery(
        {
          query: placeName,
          fields: ['photos', 'place_id', 'name'],
        },
        (results, status) => {
          if (
            status === maps.places.PlacesServiceStatus.OK &&
            results?.[0]?.photos?.length > 0
          ) {
            const url = results[0].photos[0].getUrl({ maxWidth });
            resolve(url);
          } else {
            resolve(null);
          }
        }
      );
    });

    if (result) photoCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Place photo error:', error);
    return null;
  }
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

export { GOOGLE_MAPS_API_KEY, loadGoogleMapsAPI };


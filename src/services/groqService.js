const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Request deduplication cache
const pendingRequests = new Map();

// Helper to deduplicate identical concurrent promises (e.g. React Strict Mode renders)
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

// Helper to fetch with exponential backoff for 429 rate limit errors
async function fetchWithBackoff(url, options, retries = 3, delay = 1000) {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429 && retries > 0) {
      console.warn(`Rate limited (429). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithBackoff(url, options, retries - 1, delay * 2);
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Fetch failed (${error.message}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithBackoff(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function getAIRecommendations({ location, coordinates, maxDistance, budget, experiences, duration, travelMode }) {
  const cacheKey = `recommend-${location}-${maxDistance}-${budget}-${experiences.join(',')}-${duration}-${travelMode}`;

  return deduplicate(cacheKey, async () => {
    const systemPrompt = `You are a travel advisor. Recommend 8-10 real Indian destinations from ${location} matching: max distance ${maxDistance}km, budget ₹${budget}, experiences: ${experiences.join(', ')}, duration: ${duration}, mode: ${travelMode || 'car'}.

Calculate costs (INR) and travel times specifically for ${travelMode || 'car'}.

Return ONLY a JSON object:
{
  "destinations": [
    {
      "id": "slug",
      "name": "Name",
      "description": "Short description (max 2 sentences)",
      "distance": "XXX km",
      "distanceValue": 150,
      "travelMode": "${travelMode || 'car'}",
      "travelTime": "X hours by ${travelMode || 'car'}",
      "estimatedCost": {
        "min": 3000,
        "max": 5000,
        "currency": "INR",
        "breakdown": { "travel": 1000, "stay": 2000, "food": 1000, "activities": 500 }
      },
      "matchPercentage": 90,
      "matchReasons": ["Reason 1", "Reason 2"],
      "activities": ["Act 1", "Act 2"],
      "experienceTags": ["Tag 1", "Tag 2"],
      "bestTimeToVisit": "Months",
      "highlights": ["H1", "H2"],
      "nearbyAttractions": [{ "name": "Attraction", "distance": "X km", "type": "Type" }],
      "imageQuery": "Search term",
      "state": "State",
      "country": "India"
    }
  ]
}`;

    const response = await fetchWithBackoff(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Provide recommendations.' }
        ],
        temperature: 0.6,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      }),
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');
    
    let parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      parsed = parsed.destinations || parsed.recommendations || Object.values(parsed)[0];
    }
    return Array.isArray(parsed) ? parsed : [];
  });
}

export async function getDestinationDetails(destinationName, userLocation, duration) {
  const cacheKey = `details-${destinationName}-${userLocation}-${duration}`;

  return deduplicate(cacheKey, async () => {
    const systemPrompt = `You are a travel guide. Provide details for: ${destinationName}. User starts at: ${userLocation}.

If duration is >1 day, generate a day-by-day itinerary (keep descriptions very brief).

Return ONLY JSON:
{
  "name": "${destinationName}",
  "fullDescription": "Brief 2-3 sentence overview.",
  "history": "Ultra-short history.",
  "thingsToDo": [{ "name": "Activity", "description": "Brief desc", "duration": "X hr", "cost": "Cost" }],
  "bestTimeToVisit": "Months",
  "localCuisine": ["Dish 1", "Dish 2"],
  "travelTips": ["Tip 1"],
  "nearbyAttractions": [{ "name": "Place", "distance": "X km", "type": "Type", "description": "Brief desc" }],
  "itinerary": [
    {
      "day": 1,
      "title": "Day Title",
      "activities": [{ "time": "Morning", "activity": "Activity", "description": "Brief desc" }]
    }
  ]
}`;

    let maxTokens = 350;
    const durLower = (duration || '').toLowerCase();
    if (durLower.includes('week') || durLower.includes('7')) {
      maxTokens += 450;
    } else if (durLower.includes('2') || durLower.includes('3') || durLower.includes('weekend')) {
      maxTokens += 250;
    } else {
      maxTokens += 100;
    }

    const response = await fetchWithBackoff(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Details for ${destinationName}, duration: ${duration || '2-3 days'}` }
        ],
        temperature: 0.6,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' }
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0]?.message?.content || '{}');
  });
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

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

// Robust fallback call using client-side key & retry logic from main
async function callGroq(messages, maxTokens) {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API Key is missing. Please check your .env file.');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.3,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('Groq API Error:', err);
    throw new Error(err.error?.message || 'AI API failed to respond.');
  }

  return response.json();
}

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    return match[0];
  }
  return text;
}

// Client-side fallback recommendations using main's logic
async function getClientRecommendations(params) {
  const { location, maxDistance, budget, experiences, duration, travelMode } = params;
  const systemPrompt = `You are a travel advisor. Recommend 8-10 real Indian destinations from ${location} matching: max distance ${maxDistance}km, budget ₹${budget}, experiences: ${(experiences || []).join(', ')}, duration: ${duration}, mode: ${travelMode || 'car'}.
Do NOT generate travel distance, travel duration, transportation cost, or total budget. The application will compute those programmatically. Only generate qualitative information.

Return ONLY a JSON object:
{
  "destinations": [
    {
      "id": "slug",
      "name": "Name",
      "description": "Short description (max 2 sentences)",
      "localCuisine": ["Dish 1", "Dish 2"],
      "travelTips": ["Tip 1", "Tip 2"],
      "matchPercentage": 90,
      "matchReasons": ["Reason 1", "Reason 2"],
      "activities": ["Act 1", "Act 2"],
      "experienceTags": ["Tag 1", "Tag 2"],
      "bestTimeToVisit": "Months",
      "highlights": ["H1", "H2"],
      "nearbyAttractions": [{ "name": "Attraction", "distance": "X km", "type": "Type" }],
      "imageQuery": "Search term",
      "state": "State",
      "country": "India",
      "stayCost": { "min": 1500, "max": 3000 },
      "foodCost": { "min": 800, "max": 1500 },
      "activitiesCost": { "min": 500, "max": 1000 }
    }
  ]
}`;

  let content;
  try {
    const result = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Provide recommendations.' }
    ], 1500);
    content = result.choices[0]?.message?.content;
    content = extractJSON(content || '{}');
    let parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      parsed = parsed.destinations || parsed.recommendations || Object.values(parsed)[0];
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Initial fallback Groq call failed or returned invalid JSON. Retrying...', err);
    const result = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Provide recommendations. You must output VALID JSON only. Do NOT wrap in markdown backticks.' }
    ], 1500);
    content = result.choices[0]?.message?.content;
    content = extractJSON(content || '{}');
    let parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      parsed = parsed.destinations || parsed.recommendations || Object.values(parsed)[0];
    }
    return Array.isArray(parsed) ? parsed : [];
  }
}

// Client-side fallback details using main's logic
async function getClientDetails(destinationName, userLocation, duration) {
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

  try {
    const result = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Details for ${destinationName}, duration: ${duration || '2-3 days'}` }
    ], maxTokens);
    let content = result.choices[0]?.message?.content;
    content = extractJSON(content || '{}');
    return JSON.parse(content);
  } catch (err) {
    console.warn('Initial fallback Groq details call failed. Retrying...', err);
    const result = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Details for ${destinationName}, duration: ${duration || '2-3 days'}. Output MUST be valid JSON. Do NOT wrap in markdown backticks.` }
    ], maxTokens);
    let content = result.choices[0]?.message?.content;
    content = extractJSON(content || '{}');
    return JSON.parse(content);
  }
}

export async function getAIRecommendations(params) {
  const cacheKey = `recommend-${params.location}-${params.maxDistance}-${params.budget}-${params.experiences.join(',')}-${params.duration}-${params.travelMode}`;

  return deduplicate(cacheKey, async () => {
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (response.status === 404 || !response.ok) {
        console.warn("Backend API returned status 404 or error. Attempting client-side fallback...");
        return getClientRecommendations(params);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (!content) throw new Error('Empty AI response');
      
      let parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) {
        parsed = parsed.destinations || parsed.recommendations || Object.values(parsed)[0];
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn("Backend request failed, attempting client-side fallback:", err);
      try {
        return await getClientRecommendations(params);
      } catch (fallbackErr) {
        console.error("Both backend and client-side requests failed:", fallbackErr);
        throw fallbackErr;
      }
    }
  });
}

export async function getDestinationDetails(destinationName, userLocation, duration) {
  const cacheKey = `details-${destinationName}-${userLocation}-${duration}`;

  return deduplicate(cacheKey, async () => {
    try {
      const response = await fetch('/api/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destinationName, userLocation, duration }),
      });

      if (response.status === 404 || !response.ok) {
        console.warn("Backend API details returned status 404 or error. Attempting client-side fallback...");
        return getClientDetails(destinationName, userLocation, duration);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0]?.message?.content || '{}');
    } catch (err) {
      console.warn("Backend details request failed, attempting client-side fallback:", err);
      try {
        return await getClientDetails(destinationName, userLocation, duration);
      } catch (fallbackErr) {
        console.error("Both backend and client-side details requests failed:", fallbackErr);
        throw fallbackErr;
      }
    }
  });
}

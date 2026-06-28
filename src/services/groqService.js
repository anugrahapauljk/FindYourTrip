const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function getAIRecommendations({ location, coordinates, maxDistance, budget, experiences, duration, travelMode }) {
  const systemPrompt = `You are an expert AI travel advisor. Given a user's location, budget, travel radius, interests, trip duration, and preferred mode of travel, recommend 8-10 travel destinations.

The user's preferred travel mode is: ${travelMode || 'car'}. You MUST calculate travel costs, travel time, and the full budget breakdown based on this travel mode specifically.

Travel mode pricing guidelines (approximate per person for Indian travel):
- Car: ₹8-12 per km (fuel + tolls), flexible timing
- Bus: ₹1-3 per km (state/private bus), slower but economical
- Train: ₹1-4 per km (sleeper to AC), moderate speed, book in advance
- Airplane: ₹3000-8000 base + ₹2-5 per km for short routes, fastest for long distances

You MUST return ONLY a valid JSON array (no markdown, no explanation) with this structure:
[
  {
    "id": "unique-slug",
    "name": "Destination Name",
    "description": "2-3 sentence description of the destination",
    "distance": "XXX km",
    "distanceValue": 150,
    "travelMode": "${travelMode || 'car'}",
    "travelTime": "X hours by ${travelMode || 'car'}",
    "estimatedCost": {
      "min": 3000,
      "max": 5000,
      "currency": "INR",
      "breakdown": {
        "travel": 1500,
        "stay": 2000,
        "food": 1000,
        "activities": 500
      }
    },
    "matchPercentage": 92,
    "matchReasons": ["Within budget", "Matches nature preference", "Perfect for weekend trips"],
    "activities": ["Trekking", "Sightseeing", "Photography"],
    "experienceTags": ["Nature", "Adventure"],
    "bestTimeToVisit": "October to March",
    "highlights": ["Tea gardens", "Misty mountains", "Colonial architecture"],
    "nearbyAttractions": [
      { "name": "Attraction Name", "distance": "5 km", "type": "Waterfall" }
    ],
    "imageQuery": "keyword for destination photo",
    "state": "State Name",
    "country": "India"
  }
]

IMPORTANT RULES:
- All destinations must be real places
- Distances must be realistic from the user's location
- Costs must be in INR and realistic for Indian travel
- Travel cost in breakdown MUST be calculated based on the user's selected travel mode (${travelMode || 'car'})
- Travel time MUST reflect the selected travel mode
- Match percentage should reflect how well the destination fits ALL criteria
- Sort by match percentage descending
- Return 8-10 destinations
- Return ONLY the JSON array, nothing else`;

  const userMessage = `Find travel destinations for me:
- Current Location: ${location} (Lat: ${coordinates?.lat || 'unknown'}, Lng: ${coordinates?.lng || 'unknown'})
- Maximum Travel Distance: ${maxDistance} km
- Budget: \u20b9${budget}
- Preferred Experiences: ${experiences.join(', ')}
- Trip Duration: ${duration}
- Preferred Travel Mode: ${travelMode || 'car'}

Recommend the best matching destinations within my constraints. Calculate all travel costs and times based on my preferred travel mode (${travelMode || 'car'}).`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 8000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) throw new Error('Empty AI response');
    
    let parsed = JSON.parse(content);
    // Handle both array and object with destinations key
    if (!Array.isArray(parsed)) {
      parsed = parsed.destinations || parsed.recommendations || Object.values(parsed)[0];
    }
    
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('AI Recommendation Error:', error);
    throw error;
  }
}

export async function getDestinationDetails(destinationName, userLocation, duration) {
  const systemPrompt = `You are an expert travel guide. Given a destination name, user location, and trip duration, provide comprehensive travel information.

If the trip duration is more than 1 day (e.g., "2-3 days", "weekend", "1 week"), you MUST generate an "itinerary" array containing a day-by-day plan. Otherwise, return an empty "itinerary" array.

Return ONLY valid JSON with this structure:
{
  "name": "Destination",
  "fullDescription": "Detailed 4-5 sentence description",
  "history": "Brief history of the place",
  "thingsToDo": [
    { "name": "Activity", "description": "Brief description", "duration": "2 hours", "cost": "Free" }
  ],
  "bestTimeToVisit": "Month to Month",
  "localCuisine": ["Dish 1", "Dish 2"],
  "travelTips": ["Tip 1", "Tip 2"],
  "nearbyAttractions": [
    { "name": "Place", "distance": "10 km", "type": "Temple", "description": "Brief desc" }
  ],
  "itinerary": [
    {
      "day": 1,
      "title": "Exploring the Heart of the Place",
      "activities": [
        { "time": "Morning", "activity": "Visit Landmark A", "description": "Beautiful sunrise view..." },
        { "time": "Afternoon", "activity": "Lunch at Cafe B", "description": "Try local food..." }
      ]
    }
  ]
}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Provide detailed travel information and day-by-day itinerary for: ${destinationName}. Trip duration: ${duration || '2-3 days'}. User is traveling from: ${userLocation}` }
        ],
        temperature: 0.7,
        max_tokens: 3500,
        response_format: { type: 'json_object' }
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0]?.message?.content || '{}');
  } catch (error) {
    console.error('Destination details error:', error);
    throw error;
  }
}

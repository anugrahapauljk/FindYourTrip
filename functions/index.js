const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Simple helper to fetch with retry for 429 errors
async function fetchWithBackoff(url, options, retries = 3, delay = 1000) {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithBackoff(url, options, retries - 1, delay * 2);
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithBackoff(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

exports.api = onRequest((req, res) => {
  return cors(req, res, async () => {
    // Read key from environment variable
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      res.status(500).json({ error: "GROQ_API_KEY is not configured on the server." });
      return;
    }

    const { path } = req;
    
    try {
      if (path === "/recommendations" || path === "/api/recommendations") {
        const { location, maxDistance, budget, experiences, duration, travelMode } = req.body;
        
        const systemPrompt = `You are a travel advisor. Recommend 8-10 real Indian destinations from ${location} matching: max distance ${maxDistance}km, budget ₹${budget}, experiences: ${experiences.join(', ')}, duration: ${duration}.
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

        const response = await fetchWithBackoff(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Provide recommendations." }
            ],
            temperature: 0.6,
            max_tokens: 1500,
            response_format: { type: "json_object" }
          })
        });

        const data = await response.json();
        res.json(data);
      } else if (path === "/details" || path === "/api/details") {
        const { destinationName, userLocation, duration } = req.body;
        
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
        const durLower = (duration || "").toLowerCase();
        if (durLower.includes("week") || durLower.includes("7")) {
          maxTokens += 450;
        } else if (durLower.includes("2") || durLower.includes("3") || durLower.includes("weekend")) {
          maxTokens += 250;
        } else {
          maxTokens += 100;
        }

        const response = await fetchWithBackoff(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Details for ${destinationName}, duration: ${duration || '2-3 days'}` }
            ],
            temperature: 0.6,
            max_tokens: maxTokens,
            response_format: { type: "json_object" }
          })
        });

        const data = await response.json();
        res.json(data);
      } else {
        res.status(404).json({ error: "Endpoint not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
});

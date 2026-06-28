# FindYourTrip 🗺️

An AI-powered travel recommendation and itinerary planning platform that helps users discover personalized destinations based on their location, budget, travel distance, preferred experiences, trip duration, and preferred mode of transportation.

FindYourTrip combines AI-driven recommendations, real-time location services, route planning, and cloud-based trip management to create a personalized travel planning experience.

---

## 🌟 Key Features

### 🤖 AI-Powered Travel Recommendations
- Generates personalized travel suggestions based on user preferences such as:
  - Starting location
  - Budget
  - Maximum travel distance
  - Preferred experiences
  - Trip duration
  - Transportation mode
- Uses the Llama 3.3 model through Groq API to provide structured travel recommendations.

### 💰 Budget & Transit-Aware Trip Planning
- Calculates estimated trip expenses based on selected transportation modes
- Provides estimated travel duration and cost breakdowns to help users plan efficiently.

### 📍 Location-Based Destination Discovery
- Finds suitable destinations within the user's specified travel radius.
- Uses Google Places API to retrieve:
  - Destination images
  - Place information
  - Nearby attractions

### 🗺️ Interactive Maps & Navigation
- Integrates Google Maps services for:
  - Location search and geocoding
  - Route visualization
  - Distance calculation
  - Travel directions between locations

### 📂 Trip Dashboard & Management
Users can manage their saved travel plans through:
- Personalized "My Trips" dashboard
- Saved trip history
- Inline trip renaming
- Trip organization using categories and tags
- Shareable trip links for easy collaboration

### 🎨 Modern User Interface
- Responsive dark-themed interface built with Tailwind CSS.
- Includes:
  - Glassmorphism design
  - Interactive hover effects
  - Animated UI components
  - Smooth navigation experience

---

# 🛠️ Technical Stack

## Frontend
- React.js
- Vite
- React Router

## UI & Styling
- Tailwind CSS v4

## Artificial Intelligence
- Groq API
- Llama 3.3 70B Versatile model
- Structured JSON-based AI responses for travel recommendations

## Maps & Location Services
- Google Maps API:
  - Maps JavaScript API
  - Geocoding API
  - Directions API
  - Places API
  - Static Maps API

## Backend & Cloud Services
- Firebase Authentication
  - Google Sign-In integration
- Cloud Firestore
  - User-specific trip history
  - Saved trips
  - Shared trip data
- Firebase Hosting

---


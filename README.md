# FindYourTrip 🗺️✨

An elegant, AI-powered travel recommendation and itinerary planner application. It curates personalized travel recommendations based on starting location, budget, preferred travel experiences, maximum travel distance, duration, and preferred mode of travel (Car, Bus, Train, or Airplane). 

---

## 🌟 Key Features

*   **Custom AI Travel Advice**: Recommends 8–10 real travel destinations tailored directly to your preferences using the Llama 3.3 model on Groq.
*   **Transit-Aware Budget Planning**: Incorporates travel modes (Car, Bus, Train, and Flight) with dynamic budget calculations and accurate travel time estimates.
*   **Rich Visuals**: Pulls dynamic, real-world imagery for suggested destinations using the Google Places API.
*   **Premium Interactive Map Integration**: Employs Google Maps Embed & directions to provide route guidance from your starting location to the destination.
*   **Trip Dashboard ("My Trips")**:
    *   **Inline renaming** of saved trips.
    *   **Trip grouping** with visual folder tags and filter pills.
    *   **Instant link sharing** to send customized travel options to friends.
*   **Glassmorphism UI**: Beautifully designed dark-themed interface built using Tailwind CSS v4, containing dynamic hover glows and backdrop filters.

---

## 🛠️ Technical Stack

-   **Frontend**: React (Vite, lazy-loaded routing, dynamic code-splitting)
-   **Styling**: Tailwind CSS v4 (Glassmorphic panels, animated background grids, and interactive glow borders)
-   **AI Inference**: Groq API (`llama-3.3-70b-versatile` running in structured JSON mode)
-   **Maps & Photos**: Google Maps API (JavaScript SDK Geocoding, Directions API, Static Maps, and Places Service)
-   **Database & Auth**: Firebase (Google Sign-In, Cloud Firestore for user-specific search history and saved trips)

---

## 🚀 Setup & Run Locally

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org) installed.

### 2. Configure Environment Variables
Create a file named `.env` in the root of the project (this is automatically ignored in `.gitignore`) and define the following variables:

```env
# Firebase Settings
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Groq AI API
VITE_GROQ_API_KEY=your_groq_api_key
```

You can refer to `.env.example` as a template.

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
```

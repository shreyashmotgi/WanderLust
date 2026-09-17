WanderLust 🌍

A full-stack Airbnb-style rental platform with real bookings, payments, and an AI trip-planning assistant.

Live demo:https://wanderlust-s5uu.onrender.com

Features
Listings — create, browse, edit, and delete property listings with multi-image upload (Cloudinary) and category filtering
Bookings — real availability checking (date-overlap logic), booking history, cancellation
Payments — Razorpay integration with server-side signature verification
Reviews — star ratings and comments per listing
Maps — Mapbox integration showing listing location
AI Trip Planner — a chat widget powered by an 8-tool LLM agent (Groq) that can:
Search listings by location/budget
Check real-time availability
Estimate trip cost
Summarize guest reviews
Fetch nearby attractions and short-term weather forecasts (OpenTripMap, Open-Meteo)
Propose and confirm bookings directly through chat, with a human-confirmation step before anything is booked
Redis — rate limiting on the AI endpoint + multi-tier caching (DB → cache → external API) for location/weather lookups
Tech Stack

Backend: Node.js, Express, MongoDB (Mongoose), Passport.js
Frontend: EJS, Bootstrap, Flatpickr
AI: Groq (Llama/GPT-OSS via tool-calling), OpenTripMap API, Open-Meteo API
Infra: Redis (Redis Cloud), Cloudinary, Razorpay, deployed on Render

Setup
git clone <repo-url>
cd wanderlust
npm install

Create a .env file with:

ATLASDB_URL=
SECRET=
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=
MAP_TOKEN=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
GROQ_API_KEY=
OPENTRIPMAP_API_KEY=
REDIS_URL=
node app.js

const Listing = require("../Models/listing.js");
const Review = require("../Models/review.js");
const Booking = require("../Models/booking.js");
const { isAvailable } = require("../controllers/booking.js");
const {
  getCachedCoords,
  setCachedCoords,
  getCachedPlaces,
  setCachedPlaces,
  getCachedWeather,
  setCachedWeather,
} = require("./geoCache.js");

const OPENTRIPMAP_KEY = process.env.OPENTRIPMAP_API_KEY;

const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "searchListings",
      description:
        "Search WanderLust's listings. Provide a location to filter by city/area, and/or a maxBudget to filter by price. If the user wants to see all available listings with no specific location, call this with no location.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: ["string", "null"],
            description:
              "City or area name, e.g. 'Goa', 'Manali'. Omit or pass null to search all locations.",
          },
          maxBudget: {
            type: ["number", "null"],
            description:
              "Maximum price per night in INR. Omit or pass null if no budget was mentioned.",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getNearbyPlaces",
      description:
        "Find real tourist attractions, landmarks, and points of interest near a given location. Use this when the user asks what to see/do/visit near a place or listing.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "City or area name to search near, e.g. 'Goa'",
          },
        },
        required: ["location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "summarizeReviews",
      description:
        "Get and summarize real guest reviews for a specific listing. Use this when the user asks what people think of a listing, or wants a review summary.",
      parameters: {
        type: "object",
        properties: {
          listingTitle: {
            type: "string",
            description:
              "The title or name of the listing to look up reviews for",
          },
        },
        required: ["listingTitle"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "checkAvailability",
      description:
        "Check whether a specific listing is available for a given date range. Use this when the user asks if a place is free/bookable on certain dates.",
      parameters: {
        type: "object",
        properties: {
          listingTitle: {
            type: "string",
            description: "The title or name of the listing to check",
          },
          checkIn: {
            type: "string",
            description: "Check-in date in YYYY-MM-DD format",
          },
          checkOut: {
            type: "string",
            description: "Check-out date in YYYY-MM-DD format",
          },
        },
        required: ["listingTitle", "checkIn", "checkOut"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "estimateTripBudget",
      description:
        "Estimate the total cost of a stay at a listing for given dates, including accommodation plus a rough daily buffer for food/local travel/activities. Use this when the user asks how much a trip will cost.",
      parameters: {
        type: "object",
        properties: {
          listingTitle: {
            type: "string",
            description: "The title or name of the listing",
          },
          checkIn: {
            type: "string",
            description: "Check-in date in YYYY-MM-DD format",
          },
          checkOut: {
            type: "string",
            description: "Check-out date in YYYY-MM-DD format",
          },
        },
        required: ["listingTitle", "checkIn", "checkOut"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "proposeBooking",
      description:
        "Propose a booking for a listing with specific dates and guest count. This does NOT create a real booking -- it only calculates details and shows them to the user for confirmation. Always call this before confirmBooking, and always show the user the price/dates and explicitly ask them to confirm before calling confirmBooking.",
      parameters: {
        type: "object",
        properties: {
          listingTitle: { type: "string", description: "The listing to book" },
          checkIn: { type: "string", description: "YYYY-MM-DD" },
          checkOut: { type: "string", description: "YYYY-MM-DD" },
          guests: { type: "number", description: "Number of guests" },
        },
        required: ["listingTitle", "checkIn", "checkOut", "guests"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "confirmBooking",
      description:
        "Actually create the booking. ONLY call this after proposeBooking was called AND the user has explicitly said yes/confirm in their own words in a follow-up message. Never call this in the same turn as proposeBooking.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getWeatherForecast",
      description:
        "Get the REAL short-term weather forecast (next 7-16 days only) for a location. This does NOT provide long-range seasonal climate predictions (e.g. it cannot tell you if a whole month/season is generally rainy) -- only near-term forecast data. Use this only when the user's travel timing is within the next couple of weeks, or to give current conditions context.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "City or area name, e.g. 'Goa'",
          },
        },
        required: ["location"],
      },
    },
  },
];

async function findListingByTitle(title) {
  return Listing.findOne({ title: new RegExp(title, "i") });
}

async function searchListings({ location, maxBudget }) {
  const query = {};
  if (location) query.location = new RegExp(location, "i");
  if (maxBudget) query.price = { $lte: maxBudget };

  const isBroadSearch = !location;
  const limit = isBroadSearch ? 20 : 3;
  const listings = await Listing.find(query)
    .limit(limit)
    .select("title location price");

  if (listings.length === 0) {
    return {
      found: false,
      message: "No listings found for that location/budget.",
    };
  }

  return {
    found: true,
    listings: listings.map((l) =>
      isBroadSearch
        ? { id: l._id, title: l.title, location: l.location }
        : {
            id: l._id,
            title: l.title,
            location: l.location,
            pricePerNight: l.price,
          },
    ),
  };
}

async function geocodeLocation(location) {
  // TIER 1: check our own listings first -- if we already have coordinates
  // for this location from Mapbox (when the listing was created), use them.
  // Zero API calls, zero cache needed.
  const matchingListing = await Listing.findOne({
    location: new RegExp(location, "i"),
  }).select("geometry");

  if (matchingListing?.geometry?.coordinates) {
    const [lon, lat] = matchingListing.geometry.coordinates; // GeoJSON order: [lon, lat]
    console.log(`Using existing listing coordinates for "${location}"`);
    return { lat, lon };
  }

  // TIER 2: check Redis cache (a location we've geocoded before via API,
  // with no listing match)
  const cached = await getCachedCoords(location);
  if (cached) return cached;

  // TIER 3: real API call, only when the first two tiers miss
  try {
    const url = `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(
      location,
    )}&apikey=${OPENTRIPMAP_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.log("OpenTripMap geoname error:", res.status);
      return null;
    }
    const data = await res.json();
    if (!data.lat || !data.lon) return null;

    const coords = { lat: data.lat, lon: data.lon };
    await setCachedCoords(location, coords);
    return coords;
  } catch (err) {
    console.log("geocodeLocation failed:", err.message);
    return null;
  }
}

async function fetchNearbyRadius(coords, radius) {
  const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${coords.lon}&lat=${coords.lat}&limit=5&apikey=${OPENTRIPMAP_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.features || [])
    .map((f) => f.properties.name)
    .filter((name) => name && name.trim() !== "");
}

async function getNearbyPlaces({ location }) {
  const cachedPlaces = await getCachedPlaces(location);
  if (cachedPlaces) {
    console.log(`Places cache HIT for "${location}"`);
    return { found: true, places: cachedPlaces };
  }

  const coords = await geocodeLocation(location);
  if (!coords)
    return { found: false, message: "Could not find that location." };

  try {
    const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=10000&lon=${coords.lon}&lat=${coords.lat}&limit=5&apikey=${OPENTRIPMAP_KEY}`;
    const res = await fetch(url);
    if (!res.ok)
      return {
        found: false,
        message: "Nearby places lookup temporarily unavailable.",
      };

    const data = await res.json();
    const places = (data.features || [])
      .map((f) => f.properties.name)
      .filter((name) => name && name.trim() !== "");

    if (places.length === 0)
      return { found: false, message: "No notable places found nearby." };

    await setCachedPlaces(location, places);
    return { found: true, places };
  } catch (err) {
    console.log("getNearbyPlaces failed:", err.message);
    return {
      found: false,
      message: "Nearby places lookup temporarily unavailable.",
    };
  }
}

async function getWeatherForecast({ location }) {
  const cachedForecast = await getCachedWeather(location);
  if (cachedForecast) {
    console.log(`Weather cache HIT for "${location}"`);
    return {
      found: true,
      location,
      forecast: cachedForecast,
      note: "7-day forecast only, not a seasonal prediction.",
    };
  }

  const coords = await geocodeLocation(location);
  if (!coords)
    return { found: false, message: "Could not find that location." };

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7`;
    const res = await fetch(url);
    if (!res.ok)
      return {
        found: false,
        message: "Weather service temporarily unavailable.",
      };

    const data = await res.json();
    if (!data.daily)
      return {
        found: false,
        message: "No forecast data available for that location.",
      };

    const forecast = data.daily.time.map((date, i) => ({
      date,
      maxTempC: data.daily.temperature_2m_max[i],
      minTempC: data.daily.temperature_2m_min[i],
      precipitationMm: data.daily.precipitation_sum[i],
    }));

    await setCachedWeather(location, forecast);
    return {
      found: true,
      location,
      forecast,
      note: "7-day forecast only, not a seasonal prediction.",
    };
  } catch (err) {
    console.log("getWeatherForecast failed:", err.message);
    return {
      found: false,
      message: "Weather service temporarily unavailable.",
    };
  }
}

async function summarizeReviews({ listingTitle }) {
  const listing = await Listing.findOne({
    title: new RegExp(listingTitle, "i"),
  }).populate("reviews");

  if (!listing) {
    return { found: false, message: "Listing not found." };
  }
  if (!listing.reviews || listing.reviews.length === 0) {
    return { found: false, message: "This listing has no reviews yet." };
  }

  return {
    found: true,
    listingTitle: listing.title,
    reviewCount: listing.reviews.length,
    reviews: listing.reviews.map((r) => ({
      rating: r.rating,
      comment: r.comment,
    })),
  };
}

async function checkAvailability({ listingTitle, checkIn, checkOut }) {
  const listing = await findListingByTitle(listingTitle);
  if (!listing) {
    return { found: false, message: "Listing not found." };
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (
    isNaN(checkInDate) ||
    isNaN(checkOutDate) ||
    checkOutDate <= checkInDate
  ) {
    return { found: false, message: "Invalid date range provided." };
  }

  const available = await isAvailable(listing._id, checkInDate, checkOutDate);

  return {
    found: true,
    listingTitle: listing.title,
    checkIn,
    checkOut,
    available,
  };
}

async function estimateTripBudget({ listingTitle, checkIn, checkOut }) {
  const listing = await findListingByTitle(listingTitle);
  if (!listing) {
    return { found: false, message: "Listing not found." };
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (
    isNaN(checkInDate) ||
    isNaN(checkOutDate) ||
    checkOutDate <= checkInDate
  ) {
    return { found: false, message: "Invalid date range provided." };
  }

  const nights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
  );
  const accommodationCost = nights * listing.price;

  // rough, clearly-labeled estimate -- real cost varies a lot by traveler
  const dailyExtrasEstimate = 800;
  const estimatedExtrasCost = nights * dailyExtrasEstimate;
  const totalEstimate = accommodationCost + estimatedExtrasCost;

  return {
    found: true,
    listingTitle: listing.title,
    nights,
    pricePerNight: listing.price,
    accommodationCost,
    estimatedDailyExtras: dailyExtrasEstimate,
    estimatedExtrasCost,
    totalEstimate,
    note: "Extras estimate is a rough average for food, local transport, and activities per day -- actual costs vary by traveler.",
  };
}

async function proposeBooking(
  { listingTitle, checkIn, checkOut, guests },
  req,
) {
  const listing = await findListingByTitle(listingTitle);
  if (!listing) return { found: false, message: "Listing not found." };

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (
    isNaN(checkInDate) ||
    isNaN(checkOutDate) ||
    checkOutDate <= checkInDate
  ) {
    return { found: false, message: "Invalid date range." };
  }

  const available = await isAvailable(listing._id, checkInDate, checkOutDate);
  if (!available) {
    return {
      found: false,
      message: "Listing is not available for those dates.",
    };
  }

  const nights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
  );
  const totalPrice = nights * listing.price;

  // store the REAL proposal server-side -- this is the only source of truth
  // confirmBooking will use, regardless of what the model says later
  req.session.pendingBooking = {
    listingId: listing._id.toString(),
    listingTitle: listing.title,
    checkIn: checkInDate.toISOString(),
    checkOut: checkOutDate.toISOString(),
    guests,
    totalPrice,
    proposedAt: Date.now(),
  };

  return {
    found: true,
    listingTitle: listing.title,
    checkIn,
    checkOut,
    guests,
    nights,
    totalPrice,
    instruction:
      "Show these details to the user and explicitly ask them to confirm before calling confirmBooking.",
  };
}

async function confirmBooking(_args, req) {
  const pending = req.session.pendingBooking;

  if (!pending) {
    return {
      success: false,
      message:
        "No pending booking proposal found. Ask the user to search and propose again.",
    };
  }

  // expire proposals after 5 minutes -- avoids confirming a stale proposal
  // way later in an unrelated conversation
  const FIVE_MINUTES = 5 * 60 * 1000;
  if (Date.now() - pending.proposedAt > FIVE_MINUTES) {
    req.session.pendingBooking = null;
    return {
      success: false,
      message: "That proposal has expired. Please propose the booking again.",
    };
  }

  const booking = new Booking({
    listing: pending.listingId,
    user: req.user._id,
    checkIn: pending.checkIn,
    checkOut: pending.checkOut,
    guests: pending.guests,
    totalPrice: pending.totalPrice,
    status: "pending", // same as your normal booking flow -- payment confirms it
  });
  await booking.save();

  req.session.pendingBooking = null; // clear it -- can't double-confirm the same proposal

  return {
    success: true,
    bookingId: booking._id.toString(),
    message: `Booking created for ${pending.listingTitle}. Direct the user to /bookings/${booking._id} to complete payment.`,
  };
}

const availableFunctions = {
  searchListings,
  getNearbyPlaces,
  summarizeReviews,
  checkAvailability,
  estimateTripBudget,
  getWeatherForecast,
  proposeBooking,
  confirmBooking,
};

module.exports = { toolDefinitions, availableFunctions };

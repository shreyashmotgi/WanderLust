const redisClient = require("../redisConfig.js");

// Cache city coordinates for 7 days -- cities don't move, but a long
// (not infinite) expiry means stale/wrong entries eventually self-correct
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;

async function getCachedCoords(location) {
  try {
    const key = `geocode:${location.toLowerCase().trim()}`;
    const cached = await redisClient.get(key);
    if (cached) {
      console.log(`Geocode cache HIT for "${location}"`);
      return JSON.parse(cached);
    }
    console.log(`Geocode cache MISS for "${location}"`);
    return null;
  } catch (err) {
    console.error("Redis geocode cache read failed:", err.message);
    return null; // fail open -- just means we'll hit the real API instead
  }
}

async function setCachedCoords(location, coords) {
  try {
    const key = `geocode:${location.toLowerCase().trim()}`;
    await redisClient.set(key, JSON.stringify(coords), { EX: CACHE_TTL_SECONDS });
  } catch (err) {
    console.error("Redis geocode cache write failed:", err.message);
    // not fatal -- caching is an optimization, not a requirement
  }
}

async function getCachedPlaces(location) {
  try {
    const key = `places:${location.toLowerCase().trim()}`;
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.error("Redis places cache read failed:", err.message);
    return null;
  }
}

async function setCachedPlaces(location, places) {
  try {
    const key = `places:${location.toLowerCase().trim()}`;
    await redisClient.set(key, JSON.stringify(places), { EX: 24 * 60 * 60 }); // 24h -- attractions rarely change
  } catch (err) {
    console.error("Redis places cache write failed:", err.message);
  }
}

async function getCachedWeather(location) {
  try {
    const key = `weather:${location.toLowerCase().trim()}`;
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.error("Redis weather cache read failed:", err.message);
    return null;
  }
}

async function setCachedWeather(location, forecast) {
  try {
    const key = `weather:${location.toLowerCase().trim()}`;
    await redisClient.set(key, JSON.stringify(forecast), { EX: 2 * 60 * 60 }); // 2h -- forecasts update through the day
  } catch (err) {
    console.error("Redis weather cache write failed:", err.message);
  }
}

module.exports = {
  getCachedCoords, setCachedCoords,
  getCachedPlaces, setCachedPlaces,
  getCachedWeather, setCachedWeather,
};

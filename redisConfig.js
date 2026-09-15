const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));

// Redis's client needs an explicit connect() call before use -- this runs
// once when the app starts up.
(async () => {
  await redisClient.connect();
  console.log("Connected to Redis");
})();

module.exports = redisClient;
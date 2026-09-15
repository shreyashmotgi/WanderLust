const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync.js");
const tripPlannerController = require("../controllers/tripPlanner.js");
const { isLoggedinApi,chatRateLimiter } = require("../middleware.js");

router.get("/test", wrapAsync(tripPlannerController.testChat)); // keep for now, remove later
router.get("/", (req, res) => res.render("tripPlanner/chat.ejs"));
router.post("/chat", isLoggedinApi, chatRateLimiter, wrapAsync(tripPlannerController.chat));

router.post("/reset", (req, res) => {
  req.session.tripPlannerHistory = null;
  res.json({ success: true });
});

module.exports = router;

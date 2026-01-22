const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/WrapAsync.js");
const {
  validateReview,
  isLoggedin,
  isReviewAuthor,
} = require("../middleware.js");

const reviewcontroller = require("../controllers/review.js");

//Reviews
//Create Route
router.post("/", isLoggedin, validateReview, reviewcontroller.createReview);

//Delete Review
router.delete(
  "/:reviewId",
  isLoggedin,
  isReviewAuthor,
  wrapAsync(reviewcontroller.deleteReview),
);

module.exports = router;

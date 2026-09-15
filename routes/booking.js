const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/WrapAsync.js");
const { isLoggedin, validateBooking } = require("../middleware.js");
const bookingController = require("../controllers/booking.js");

// nested under /listings/:id -> mergeParams: true lets us read req.params.id
router
  .route("/book")
  .get(isLoggedin, wrapAsync(bookingController.renderBookingForm))
  .post(
    isLoggedin,
    validateBooking,
    wrapAsync(bookingController.createBooking)
  );

module.exports = router;
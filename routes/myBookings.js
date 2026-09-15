const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync.js");
const { isLoggedin } = require("../middleware.js");
const bookingController = require("../controllers/booking.js");

router.get("/", isLoggedin, wrapAsync(bookingController.index));
router.get("/:bookingId", isLoggedin, wrapAsync(bookingController.showBooking));
router.patch(
  "/:bookingId/cancel",
  isLoggedin,
  wrapAsync(bookingController.cancelBooking)
);
router.post(
  "/:bookingId/create-order",
  isLoggedin,
  wrapAsync(bookingController.createOrder)
);
router.post(
  "/:bookingId/verify-payment",
  isLoggedin,
  wrapAsync(bookingController.verifyPayment)
);

module.exports = router;
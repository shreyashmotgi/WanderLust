const Booking = require("../Models/booking.js");
const Listing = require("../Models/listing.js");
const razorpay = require("../razorpayConfig.js");
const crypto = require("crypto");

// Core rule: two date ranges overlap if one starts before the other ends,
// AND ends after the other starts. This is the standard interval-overlap
// check used for booking systems.
async function isAvailable(listingId, checkIn, checkOut, excludeBookingId = null) {
  const query = {
    listing: listingId,
    status: { $ne: "cancelled" },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };

  // used when cancelling/re-checking a specific booking, so it doesn't
  // count itself as a conflict
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflicting = await Booking.findOne(query);
  return !conflicting;
}
module.exports.isAvailable = isAvailable;

// GET /listings/:id/book - show booking form
module.exports.renderBookingForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  // only show bookings that are still relevant -- a booking whose checkout
  // has already passed doesn't block any future date, so no reason to show it
  const existingBookings = await Booking.find({
    listing: id,
    status: { $ne: "cancelled" },
    checkOut: { $gte: new Date() },
  }).select("checkIn checkOut");

  res.render("bookings/new.ejs", { listing, existingBookings });
};

// POST /listings/:id/book - create a booking
module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests } = req.body.booking;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const available = await isAvailable(id, checkInDate, checkOutDate);
  if (!available) {
    req.flash("error", "Sorry, this listing is already booked for those dates.");
    return res.redirect(`/listings/${id}/book`);
  }

  const nights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = nights * listing.price;

  const booking = new Booking({
    listing: id,
    user: req.user._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests,
    totalPrice,
    status: "pending", // Phase 2 (payment) will flip this to "confirmed"
  });

  await booking.save();
  req.flash("success", "Booking created! Complete payment to confirm it.");
  res.redirect(`/bookings/${booking._id}`);
};

// GET /bookings - logged-in user's own bookings ("My Trips")
module.exports.index = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });
  res.render("bookings/index.ejs", { bookings });
};

// GET /bookings/:bookingId - single booking detail / checkout page
module.exports.showBooking = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId).populate("listing");
  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/bookings");
  }
  res.render("bookings/show.ejs", { booking });
};

// PATCH /bookings/:bookingId/cancel
module.exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/bookings");
  }
  if (!booking.user.equals(req.user._id)) {
    req.flash("error", "You are not authorized to cancel this booking");
    return res.redirect("/bookings");
  }

  booking.status = "cancelled";
  await booking.save();
  req.flash("success", "Booking cancelled");
  res.redirect("/bookings");
};

// POST /bookings/:bookingId/create-order
// Creates a Razorpay order for this booking's total price and returns the
// order details to the frontend, which opens the Razorpay Checkout modal.
module.exports.createOrder = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (!booking.user.equals(req.user._id)) {
    return res.status(403).json({ error: "Not authorized" });
  }
  if (booking.status !== "pending") {
    return res.status(400).json({ error: "Booking is not payable" });
  }

  // Razorpay expects amount in the smallest currency unit (paise for INR)
  const order = await razorpay.orders.create({
    amount: Math.round(booking.totalPrice * 100),
    currency: "INR",
    receipt: `booking_${booking._id}`,
  });

  // stash the order id so we can cross-check it during verification
  booking.razorpayOrderId = order.id;
  await booking.save();

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    bookingId: booking._id,
  });
};

// POST /bookings/:bookingId/verify-payment
// Razorpay Checkout calls our frontend on success with payment_id, order_id,
// and a signature. We must recompute that signature server-side with our
// secret key and compare — this is what actually proves the payment is real,
// never trust the frontend success callback alone.
module.exports.verifyPayment = async (req, res) => {
  const { bookingId } = req.params;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ error: "Payment verification failed" });
  }

  booking.status = "confirmed";
  booking.razorpayPaymentId = razorpay_payment_id;
  await booking.save();

  res.json({ success: true });
};
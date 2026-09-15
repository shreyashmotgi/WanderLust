const Listing = require("../Models/listing.js");
const Booking = require("../Models/booking.js");
const { cloudinary } = require("../cloudConfig.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const { search, category } = req.query;
  let listings;

  if (search) {
    listings = await Listing.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ],
    });
  } else if (category) {
    listings = await Listing.find({ categories: category });
  } else {
    listings = await Listing.find({});
  }

  res.render("listings/index", { listings, search, category });
};

module.exports.rendernewform = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  // non-cancelled bookings only -> these are the dates that block new bookings
  const bookings = await Booking.find({
    listing: id,
    status: { $ne: "cancelled" },
  }).select("checkIn checkOut");

  res.render("listings/show.ejs", { listing, bookings });
};

module.exports.createListing = async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Send valid data for listing");
  }

  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  if (!req.files || req.files.length === 0) {
    req.flash("error", "At least one image is required");
    return res.redirect("/listings/new");
  }
  newListing.images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  newListing.geometry = response.body.features[0].geometry;
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditform = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Send valid data for listing");
  }

  const { id } = req.params;

  const listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true },
  );

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));
    listing.images.push(...newImages);
  }

  if (req.body.deleteImages) {
    const deleteImages = req.body.deleteImages;

    if (listing.images.length - deleteImages.length < 1) {
      req.flash("error", "At least one image must remain");
      return res.redirect(`/listings/${id}/edit`);
    }

    // delete from cloudinary
    for (let filename of deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }

    // delete from DB + memory
    listing.images = listing.images.filter(
      (img) => !deleteImages.includes(img.filename),
    );
  }

  await listing.save();

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
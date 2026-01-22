if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync.js");
const { isLoggedin, isOwner, validatelisting } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingcontroller = require("../controllers/listing.js");

router
  .route("/")
  .get(wrapAsync(listingcontroller.index))
  .post(
    isLoggedin,
    upload.array("images", 12),
    validatelisting,
    wrapAsync(listingcontroller.createListing),
  );

//New Route
router.get("/new", isLoggedin, listingcontroller.rendernewform);

router
  .route("/:id")
  .get(wrapAsync(listingcontroller.showListing))
  .put(
    isLoggedin,
    isOwner,
    upload.array("images", 12),
    validatelisting,
    wrapAsync(listingcontroller.updateListing),
  )
  .delete(isLoggedin, isOwner, wrapAsync(listingcontroller.deleteListing));

//Edit Route
router.get(
  "/:id/edit",
  isLoggedin,
  isOwner,
  wrapAsync(listingcontroller.renderEditform),
);

module.exports = router;

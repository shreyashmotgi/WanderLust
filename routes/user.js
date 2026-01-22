const express = require("express");
const router = express.Router();
const WrapAsync = require("../utils/WrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const usercontroller = require("../controllers/user.js");

router
  .route("/signup")
  .get(usercontroller.renderSignup)
  .post(usercontroller.Signup);

router
  .route("/login")
  .get(usercontroller.renderLoginform)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    usercontroller.Login,
  );

router.get("/logout", usercontroller.Logout);

module.exports = router;

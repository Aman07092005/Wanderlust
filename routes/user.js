const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(saveRedirectUrl,passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),userController.login
  );

router.get("/logout", userController.logout);

router
  .route("/forgot")
  .get(userController.renderforgotForm)
  .post(wrapAsync(userController.forgot));

router.get("/verify-otp",(req,res)=>{
  res.render("users/verifyOtp.ejs",{email:req.query.email});
});

router.post("/verify-otp",wrapAsync(userController.verifyOTP))

router
  .route("/reset-password")
  .get(userController.renderResetForm)
  .post(wrapAsync(userController.reset));

module.exports = router;
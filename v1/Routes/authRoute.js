const express = require("express");
const router = require("express-promise-router")();
const passport = require("passport");
const passportConf = require("../../passport");

const { validateBody, schemas } = require("../../Helpers/routeHelpers");
const UsersController = require("../Controllers/auth");
const passportSignIn = passport.authenticate("local", { session: false });
const passportJWT = passport.authenticate("jwt", { session: false });

router.route('/signup').post(validateBody(schemas.authSchema), UsersController.signUp);

router
  .route('/signin')
  .post(validateBody(schemas.authSchema), passportSignIn, UsersController.signIn);

router.route('/updatepassword').put(passportJWT, UsersController.updateUserPassword);

router
  .route('/oauth/google')
  .post(passport.authenticate('googleToken', { session: false }), UsersController.googleOAuth);

router
  .route('/oauth/facebook')
  .post(passport.authenticate('facebookToken', { session: false }), UsersController.facebookOAuth);

router.route("/forgotPassword").put(passportJWT,UsersController.forgotPassword);

router.route("/confirmToken").put(passportJWT,UsersController.confirmToken);

router.route("/resetPassword/").put(passportJWT,UsersController.resetPassword);

router.route("/unlink/google")
  .patch(passportJWT, UsersController.unlink_google_account);


router.route("/unlink/facebook")
  .patch(passportJWT, UsersController.unlink_facebook_account);


module.exports = router;

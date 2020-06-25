const express = require('express');
const router = require('express-promise-router')();
const passport = require('passport');
const passportConf = require('../../passport');

const { validateBody, schemas } = require('../../Helpers/routeHelpers');
const UsersController = require('../Controllers/auth');
const passportSignIn = passport.authenticate('local', { session: false });
const passportJWT = passport.authenticate('jwt', { session: false });

router.route('/signup')
  .post(validateBody(schemas.authSchema), UsersController.signUp);

router.route('/signin')
  .post(validateBody(schemas.authSchema), passportSignIn, UsersController.signIn
  );

router.route('/oauth/google')
  .post(passport.authenticate('googleToken', { session: false }), UsersController.googleOAuth);

router.route('/oauth/facebook')
  .post(passport.authenticate('facebookToken', { session: false}), UsersController.facebookOAuth);


module.exports = router;
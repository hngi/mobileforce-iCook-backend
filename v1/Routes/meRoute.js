const express = require('express');
const router = express.Router();
const me_controller = require('../Controllers/meController');

const passport = require('passport');
const passportJWT = passport.authenticate('jwt', { session: false });

router.get('/', passportJWT, me_controller.get_me);

// get profile 
router.get('/auth', passportJWT, me_controller.get_auth);

// get favourites
router.get('/favourites', passportJWT, me_controller.get_favourites);

// get settings
router.get('/settings', passportJWT, me_controller.get_settings);

// update profile
router.put('/update', passportJWT, me_controller.update_profile);

// update settings
router.put('/settings', passportJWT, me_controller.update_settings);

module.exports = router;
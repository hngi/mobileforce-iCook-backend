const express = require('express');
const router = express.Router();
const me_controller = require('../Controllers/meController');

router.get('/', passportJWT, me_controller.me);

// get profile 
router.get('/profile', passportJWT, me_controller.get_profile);

// get favourites
router.get('/favourites', passportJWT, me_controller.get_favourites);

// get settings
router.get('/settings', passportJWT, me_controller.get_settings);

// update profile
router.put('/update', passportJWT, me_controller.update_profile);

// update settings
router.put('/settings', passportJWT, me_controller.update_settings);

module.exports = router;
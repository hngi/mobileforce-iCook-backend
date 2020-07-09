const express = require('express');
const router = express.Router();
const search_controller = require('../Controllers/searchController');

const passport = require('passport');
const passportJWT = passport.authenticate('jwt', { session: false });

router.get('/', passportJWT, search_controller.search);

module.exports = router;
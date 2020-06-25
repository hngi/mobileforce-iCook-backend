const express = require('express');
const router = express.Router();
const dish_controller = require('../Controllers/dishController');
const user_controller = require('../Controllers/userController');

const passport = require('passport');
const passportJWT = passport.authenticate('jwt', { session: false });

router.get('/', dish_controller.get_all_dishes);

router.get('/:id', dish_controller.get_dishes_by_ID);

// delete a dish by id
router.delete('/:id', passportJWT, dish_controller.deleteDish);

module.exports = router;

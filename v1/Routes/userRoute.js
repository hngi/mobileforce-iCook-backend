const express = require('express');
const router = express.Router();
const user_controller = require('../Controllers/userController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const passport = require('passport');
const passportJWT = passport.authenticate('jwt', { session: false });

// get all users
router.get('/', user_controller.get_all_users);

//get user by id
router.get('/:id', user_controller.get_user_by_id);

//update user favourite
router.patch('/:id/favourites', user_controller.update_user_favourites);

//update user's list of dishes (add a dish)
//api/v1/users/:id/dishes
router.patch('/:id/dishes', upload.single('dishImage'), user_controller.add_dish);

// follow a user
router.put('/follow', passportJWT, user_controller.followUser);

// unfollow a user
router.put('/unfollow', passportJWT, user_controller.unfollowUser);

// get followers
router.get('/followers/:id', user_controller.get_followers);

// get following
router.get('/following/:id', user_controller.get_following);

module.exports = router;

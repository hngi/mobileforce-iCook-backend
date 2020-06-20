const express = require('express');
const router = express.Router();
const user_controller = require('../Controllers/userController');
const { protectedRoute } = require('../Middleware/auth');

// get all users
router.get('/', user_controller.get_all_users);

//get user by id
router.get('/:id', user_controller.get_user_by_id);

//update user favourite
router.patch('/:id/favourites', user_controller.update_user_favourites);

// follow a user
router.put('/follow', protectedRoute, user_controller.followUser);

// unfollow a user
router.put('/unfollow', protectedRoute, user_controller.unfollowUser);

module.exports = router;

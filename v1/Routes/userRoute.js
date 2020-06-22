const express = require('express');
const router = express.Router();
const user_controller = require('../Controllers/userController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
router.put('/follow', user_controller.followUser);

// unfollow a user
router.put('/unfollow', user_controller.unfollowUser);

// get followers
router.get('/followers', user_controller.get_followers);

// get following
router.get('/following', user_controller.get_following);

// delete a dish by id
router.get('/:id/dishes/dishId', user_controller.deleteDish);

module.exports = router;

const express = require('express')
const router = express.Router()
const user_controller = require('../Controllers/userController')
// const multer = require('multer');
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

const passport = require('passport')
const passportJWT = passport.authenticate('jwt', { session: false })

// get all users
router.get('/', passportJWT, user_controller.get_all_users)

//get user by id
router.get('/:id', passportJWT, user_controller.get_user_by_id)

// follow a user
router.put('/follow/:id', passportJWT, user_controller.followUser)

// unfollow a user
router.put('/unfollow/:id', passportJWT, user_controller.unfollowUser)

// get followers
router.get('/followers/:id', passportJWT, user_controller.get_followers)

// get following
router.get('/following/:id', passportJWT, user_controller.get_following)

module.exports = router

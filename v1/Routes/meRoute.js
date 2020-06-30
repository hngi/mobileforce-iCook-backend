const express = require('express')
const router = express.Router()
const me_controller = require('../Controllers/meController')

const passport = require('passport')
const passportJWT = passport.authenticate('jwt', { session: false })


router.get('/', passportJWT, me_controller.get_me)

// get profile
router.get('/auth', passportJWT, me_controller.get_auth)

//get user dishes
router.get('/dishes', passportJWT, me_controller.get_user_dishes);

// get favourites
router.get('/favourites', passportJWT, me_controller.get_favourites)

// get settings
router.get('/settings', passportJWT, me_controller.get_settings)

// update profile
router.patch('/update', passportJWT, me_controller.update_profile)

// update settings
router.put('/settings', passportJWT, me_controller.update_settings)

// unlink google
router.delete('/unlink_google', passportJWT, me_controller.unlink_google)

// unlink facebook
router.delete('/unlink_facebook', passportJWT, me_controller.unlink_facebook)

// upload photo
router.put('/upload_photo', passportJWT, me_controller.singleUpload,me_controller.upload_photo)

// delete my account
router.delete('/delete_account', passportJWT, me_controller.delete_account)


module.exports = router

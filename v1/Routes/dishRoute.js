const express = require('express')
const router = express.Router()
const dish_controller = require('../Controllers/dishController')

const passport = require('passport')
const passportJWT = passport.authenticate('jwt', { session: false })

router.post('/', passportJWT, dish_controller.createDish)

router.get('/', passportJWT, dish_controller.get_all_dishes)

// router.get('/me', passportJWT, dish_controller.get_user_dishes);

router.get('/:id', passportJWT, dish_controller.get_dishes_by_ID)

router.delete('/:id', passportJWT, dish_controller.delete_dish)

router.patch('/:id', passportJWT, dish_controller.edit_dish)

router.put('/toggle_like/:id', passportJWT, dish_controller.toggle_like)

router.put('/toggle_favourite/:id', passportJWT, dish_controller.toggle_favorite)

router.post('/comments/:dishId', passportJWT, dish_controller.addCommentToDish)

router.delete('/comments/:dishId/:commentId', passportJWT, dish_controller.removeDishComment)

module.exports = router

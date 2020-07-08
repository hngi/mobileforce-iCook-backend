const Dish = require('../../Models/dishModel')
const uploadImage = require('../../Database/uploadImage')
const Profile = require('../../Models/profileModel')
const User = require('../../Models/authModel')
const Comment = require('../../Models/commentModel')
const PublicResponse = require('../../Helpers/model')
const { findByIdAndRemove } = require('../../Models/commentModel')

exports.createDish = async (req, res, next) => {
  try {
    const { name, recipe, healthBenefits, ingredients } = req.body

    const userId = req.user._id

    const findProfile = await User.findById(userId).populate('profile')

    const profileId = findProfile.profile[0]._id

    const dish = new Dish({
      name: name,
      recipe: recipe,
      healthBenefits: healthBenefits,
      ingredients: ingredients,
      chefId: profileId
    })

    // const findProfile = await User.findById(userId).populate('profile')

    // const profileId = findProfile.profile[0]._id

    await Profile.findByIdAndUpdate(
      profileId,
      { $push: { dishes: dish } },
      { new: true, useFindAndModify: false }
    )
    await dish.save()
    return res.status(201).json({
      status: 'success',
      error: '',
      message: 'dish saved successfully!',
      data: {
        dish
      }
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error: error.message
    })
  }
}

//Get all dishes in DB

exports.get_all_dishes = async (req, res, next) => {
  try {
    const dishes = await Dish.find()
      .sort('-createdAt')
      .populate({ path: 'chefId', select: ['name', 'userImage'] })
    return res.status(200).json({
      status: 'success',
      error: '',
      result: dishes.length,
      data: {
        dishes: PublicResponse.dishes(dishes, req)
      }
    })
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      error: error.message
    })
  }
}

exports.get_dishes_by_ID = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id).populate({
      path: 'chefId',
      select: ['name', 'userImage']
    })
    if (dish) {
      const me = await Profile.findOne({
        userId: req.user._id
      })
      const isFavourite = me.favourites.includes(req.params.id)
      const d = PublicResponse.dish(dish, req, { isFavourite })
      res.status(200).json({
        status: 'success',
        error: '',
        data: {
          dish: d
        }
      })
    } else {
      throw new Error('Not found')
    }
  } catch (error) {
    return res.status(404).json({
      status: 'fail',
      error: `dish with ID ${req.params.id} not found`
    })
  }
}

// Edit PUT Dish api/v1/dishes/:id
exports.edit_dish = async (req, res, next) => {
  const { name, recipe, healthBenefits, ingredients } = req.body
  const fieldsToUpdate = {}
  if (name) fieldsToUpdate.name = name
  if (recipe) fieldsToUpdate.recipe = recipe
  if (healthBenefits) fieldsToUpdate.healthBenefits = healthBenefits
  if (ingredients) fieldsToUpdate.ingredients = ingredients

  try {
    const userId = req.user._id.toString()
    const dishId = req.params.id

    let dish = await Dish.findOne({ _id: dishId })
    if (!dish) {
      throw new Error('Dish not found')
    }

    if (dish.chefId.toString() !== userId) {
      throw new Error('Unauthorized')
    }

    dish = await Dish.findOneAndUpdate(
      { chefId: req.user._id },
      { $set: fieldsToUpdate },
      {
        new: true
      }
    )

    res.status(200).json({
      status: 'success',
      error: '',
      data: dish
    })
  } catch (error) {
    const code = error.message === 'Unauthorized' ? 403 : 400
    return res.status(code).json({
      status: 'fail',
      error: error.message
    })
  }
}

// Delete operation should be idempotent
// @Usman Jun 28
exports.delete_dish = async (req, res, next) => {
  try {
    const dish = await Dish.findOne({ _id: req.params.id })
    if (!dish) {
      throw new Error('Not found')
    }

    if (dish.chefId.toString() !== req.user._id.toString()) {
      throw new Error('Unauthorized')
    }
    const data = await Dish.findOneAndDelete({ _id: req.params.id })
    res.status(200).json({
      status: 'success',
      error: '',
      data: {}
    })
  } catch (error) {
    const code = error.message === 'Unauthorized' ? 403 : 400
    return res.status(code).json({
      status: 'fail',
      error: error.message
    })
  }
}

// @Usman - Jun 28
exports.toggle_like = async (req, res) => {
  try {
    const dish = await Dish.findOne({ _id: req.params.id })
    if (!dish) {
      throw new Error('Not found')
    }
    const userId = req.user._id.toString()
    const isLiked = dish.likes.includes(userId)
    if (isLiked) {
      dish.likes = dish.likes.filter((id) => userId !== id)
    } else {
      dish.likes.push(userId)
    }
    await dish.save()
    const d = PublicResponse.dish(dish, req)
    res.status(200).json({
      status: 'success',
      error: '',
      data: {
        dish: d
      }
    })
  } catch (error) {
    const code = error.message === 'Not found' ? 404 : 400
    return res.status(code).json({
      status: 'fail',
      error: error.message
    })
  }
}

// @Usman Jun 28
exports.toggle_favorite = async (req, res) => {
  try {
    const dishId = req.params.id
    const dish = await Dish.findOne({ _id: dishId })
    if (!dish) {
      throw new Error('Not found')
    }
    const me = await Profile.findOne({
      userId: req.user._id
    })
    const isFavorite = me.favourites && me.favourites.includes(dishId)

    if (isFavorite) {
      me.favourites = me.favourites.filter((id) => id.toString() !== dishId)
    } else {
      me.favourites.push(dishId)
    }
    me.save()

    return res.status(200).json({
      status: 'success',
      error: '',
      data: {
        dish: PublicResponse.dish(dish, req, { isFavorite: !isFavorite })
      }
    })
  } catch (error) {
    return res.status(400).json({
      status: 'fail',
      error: error.message
    })
  }
}

// POST /api/v1/dish/comment/:dishId
exports.addCommentToDish = async (req, res, next) => {
  // console.log(req.user)
  try {
    const user = await Profile.findOne({ userId: req.user.id }).populate({
      path: 'profile',
      select: 'id name'
    })
    // console.log('user', user)
    const dish = await Dish.findById(req.params.dishId)

    if (!user && !dish) {
      throw new Error('Not Found')
    }

    const newComment = new Comment({
      text: req.body.text,
      name: user.name,
      user: req.user.id,
      dish: req.params.dishId
    })
    console.log('newComment', newComment)
    await newComment.save()

    res.status(200).json({
      status: 'success',
      data: newComment,
      error: ''
    })
  } catch (err) {
    res.json({
      status: 'fail',
      error: err.message
    })
  }
}

// get comments for particular dish
// GET /api/v1/dishes/comments/dishId
exports.getDishComment = (req, res, next) => {
  try {
      const comment
  } catch (err) {
    
  }
}

// DELETE /api/v1/dish/comments/:dishId/:commentId
exports.removeDishComment = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.dishId)

    const comment = await Comment.findById(req.params.commentId)

    if (!dish || !comment) {
      throw new Error('Not Found')
    }

    // Check user
    if (comment.user.toString() !== req.user.id) {
      throw new Error('User nor authorized')
    }

    await Comment.findByIdAndRemove(req.params.commentId)

    res.status(200).json({
      status: 'success',
      message: 'Commment deleted',
      error: ''
    })
  } catch (err) {
    res.json({
      status: 'fail',
      error: err.message
    })
  }
}

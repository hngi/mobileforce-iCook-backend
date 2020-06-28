const mongoose = require('mongoose')
const User = require('../../Models/authModel')
const Dish = require('../../Models/dishModel')
const uploadImage = require('../../Database/uploadImage')
const Profile = require('../../Models/profileModel')
const PublicResponse = require('../../Helpers/model')

// @Usman Jun 27
exports.get_me = async (req, res) => {
  try {
    const userId = req.user._id.toString()
    const me = await Profile.findOne({ userId }).select([
      '-favourites',
      '-dishes',
      '-followers',
      '-following'
    ])

    if (me) {
      res.status(200).json({
        status: 'success',
        error: '',
        data: {
          me
        }
      })
    } else {
      throw new Error('Not found')
    }
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      error: `user with ID ${req.params.id} not found`
    })
  }
}

// @Usman Jun 27
exports.get_auth = async (req, res) => {
  try {
    const userId = req.user._id.toString()
    const me = await User.findOne({ _id: userId })

    if (me) {
      res.status(200).json({
        status: 'success',
        error: '',
        data: {
          me
        }
      })
    } else {
      throw new Error('Not found')
    }
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      error: `user with ID ${req.params.id} not found`
    })
  }
}

// @Usman Jun 27
exports.get_favourites = async (req, res) => {
  try {
    const userId = req.user._id.toString()
    const me = await Profile.findOne({ userId })
    const favourites = await Dish.find({
      _id: {
        $in: me.favourites.map((id) => mongoose.Types.ObjectId(id.toString()))
      }
    })

    if (me) {
      res.status(200).json({
        status: 'success',
        error: '',
        data: {
          count: favourites.length,
          dishes: PublicResponse.dishes(favourites, req)
        }
      })
    } else {
      throw new Error('Not found')
    }
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      error: `user with ID ${req.params.id} not found`
    })
  }
}

exports.get_settings = async (req, res, next) => {}

exports.update_profile = async (req, res) => {
  const { name, email, gender, phone } = req.body
  const fieldsToUpdate = {}
  if (name) fieldsToUpdate.name = name
  if (gender) fieldsToUpdate.gender = gender
  if (phone) fieldsToUpdate.phoneNumber = phone
  if (email) fieldsToUpdate.email = email

  try {
    let userProfile = await Profile.findOne({ userId: req.user._id })

    if (!userProfile) {
      throw new Error('Profile not found')
    }

    userProfile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: fieldsToUpdate },
      {
        new: true
      }
    )
    res.status(200).json({
      status: 'success',
      data: userProfile,
      error: {}
    })
  } catch (err) {
    res.status(500).json({
      error: err
    })
  }
}

exports.update_settings = async (req, res) => {}

exports.unlink_google = async (req, res) => {}

exports.unlink_facebook = async (req, res) => {}

exports.delete_account = async (req, res) => {}

exports.upload_photo = async (req, res) => {}

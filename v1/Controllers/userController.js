const User = require('../../Models/authModel')
const Dish = require('../../Models/dishModel')
const uploadImage = require('../../Database/uploadImage')
const Profile = require('../../Models/profileModel')
const PublicResponse = require('../../Helpers/model')

exports.get_all_users = async (req, res, next) => {
  try {
    // const users = await User.find().populate('profile').select('_id method local.email');
    const users = await Profile.find().select('-email').populate('dishes')
    res.status(200).json({
      status: 'success',
      error: '',
      results: users.length,
      data: {
        users: PublicResponse.users(users, req)
      }
    })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      error: err.message
    })
  }
}
//Get a User profile @omodauda
exports.get_user_by_id = async (req, res, next) => {
  try {
    const userId = req.params.id
    const user = await Profile.findOne({ user: userId })
      .select(['-email', '-favourites'])
      .populate('dishes')
    const _user = PublicResponse.user(user, req)

    if (user) {
      res.status(200).json({
        status: 'success',
        error: '',
        data: {
          user: _user
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

// /api/users/id/followers/:id - get
exports.get_followers = async (req, res, next) => {
  const id = req.params.id

  try {
    const user = await Profile.findById(id)

    if (!user) {
      throw new Error('Not found')
    }

    const followers = user.followers

    res.status(200).json({
      status: 'success',
      count: followers.length,
      data: followers,
      error: ''
    })
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found'
    })
  }
}

// /api/users/following/:id - get
exports.get_following = async (req, res, next) => {
  const id = req.params.id
  try {
    const user = await Profile.findById(id)

    if (!user) {
      throw new Error('Not found')
    }

    const following = user.following

    res.status(200).json({
      status: 'success',
      count: following.length,
      data: following,
      error: ''
    })
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found'
    })
  }
}
// /api/users/follow/:id - put
exports.followUser = async (req, res, next) => {
  try {
    const followId = req.params.id.toString()
    const id = req.user._id.toString()

    if (id === followId) {
      throw new Error('You cant follow your self')
    }

    const userProfile = await Profile.findOne({ user: id })
    const profileId = userProfile._id
    const following = userProfile.following

    const isMatch = following.some((fol) => fol == followId)

    if (isMatch) {
      // idempotent mutation
      return res.status(200).json({
        status: 'fail',
        message: `You are already following user with ID ${followId}`
      })
    }

    await Profile.findByIdAndUpdate(
      followId,
      {
        $push: { followers: profileId }
      },
      { new: true }
    )

    await Profile.findByIdAndUpdate(
      profileId,
      {
        $push: { following: followId }
      },
      { new: true }
    )

    res.status(200).json({
      status: 'success',
      message: `You have successfully followed user with ID ${followId} `,
      error: ''
    })
  } catch (err) {
    return res.status(400).json({ status: 'fail', error: err.message })
  }
}

// /api/users/unfollow/:id - put
exports.unfollowUser = async (req, res, next) => {
  try {
    const unfollowId = req.params.id.toString()
    const id = req.user._id.toString()

    if (id === unfollowId) {
      throw new Error('You cant unfollow your self')
    }

    const userProfile = await Profile.findOne({ user: id })
    const profileId = userProfile._id
    const following = userProfile.following

    const isMatch = following.find((fol) => fol == unfollowId)

    if (!isMatch) {
      // idempotent mutation
      return res.status(200).json({
        status: 'fail',
        message: `You have already unfollowed user with ID ${unfollowId}`
      })
    }

    await Profile.findByIdAndUpdate(
      unfollowId,
      {
        $pull: { followers: profileId }
      },
      { new: true }
    )
    await Profile.findByIdAndUpdate(
      profileId,
      {
        $pull: { following: unfollowId }
      },
      { new: true }
    )

    res.status(200).json({
      success: true,
      message: `You have successfully unfollowed user with ID ${unfollowId} `,
      error: ''
    })
  } catch (err) {
    return res.status(400).json({ status: 'fail', error: err.message })
  }
}

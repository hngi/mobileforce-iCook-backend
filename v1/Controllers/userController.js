const User = require('../../Models/authModel');
const Dish = require('../../Models/dishModel');
const mongoose = require('mongoose');
const uploadImage = require('../../Database/uploadImage');
const Profile = require("../../Models/profileModel");


exports.get_all_users = async (req, res, next) => {
  try {
    // const users = await User.find().populate('profile').select('_id method local.email');
    const users = await Profile.find().populate('dishes');
    res.status(200).json({
      status: 'success',
      error: '',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      error: err.message,
    });
  }
};

exports.get_user_by_id = async (req, res, next) => {
  try {
    const profileId = req.params.id; 
    const user = await Profile.findById({_id: profileId}).populate('dishes');
    if(user){
      res.status(200).json({
        status: 'success',
        error: '',
        results: user.length,
        data: {
          user,
        }
      })
    } else{
      return res.status(400).json({
        status: 'fail',
        error: `user with ID ${req.params.id} not found`,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      error: err.message,
    });
  }
};


// /api/users/id/followers/:id - get
exports.get_followers = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
      return res.status(404).json({
        status: fail,
        message: 'User not found',
      });
    }

    const followers = user.followers;

    res.status(200).json({
      status: success,
      count: followers.length,
      data: followers,
      error: '',
    });
  } catch (err) {
    return res.status(500).json({
      status: fail,
      error: err,
    });
  }
};

// /api/users/id/following - get
exports.get_following = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
      return res.status(404).json({
        status: fail,
        message: 'User not found',
      });
    }

    const following = user.following;

    res.status(200).json({
      status: success,
      count: following.length,
      data: following,
      error: '',
    });
  } catch (err) {
    return res.status(500).json({
      status: fail,
      error: err,
    });
  }
};

// /api/users/id/follow/ - put
exports.followUser = async (req, res, next) => {
  const followId = req.body.followId.toString();
  const id = req.user.profile.id.toString();

  const user = await User.findById(id);
  const following = user.following;

  const isMatch = following.some((fol) => fol == followId);

  if (isMatch) {
    return res.status(400).json({
      status: fail,
      message: `You are already following user with ID ${followId}`,
    });
  }

  try {
    await User.findByIdAndUpdate(
      followId,
      {
        $push: { followers: id },
      },
      { new: true }
    );

    await User.findByIdAndUpdate(
      id,
      {
        $push: { following: followId },
      },
      { new: true }
    );

    res.status(200).json({
      status: success,
      message: `You have successfully followed user with ID ${followId} `,
      error: '',
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ status: fail, error: err });
  }
};

// /api/users/id/unfollow - put
exports.unfollowUser = async (req, res, next) => {
  const unfollowId = req.body.unfollowId.toString();
  const id = req.user.profile.id.toString();

  const user = await User.findById(id);
  const following = user.following;

  const isMatch = following.find((fol) => fol == unfollowId);

  if (!isMatch) {
    return res.status(400).json({
      status: fail,
      message: `You have already unfollowed user with ID ${unfollowId}`,
    });
  }

  try {
    await User.findByIdAndUpdate(
      unfollowId,
      {
        $pull: { followers: id },
      },
      { new: true }
    );
    await User.findByIdAndUpdate(
      id,
      {
        $pull: { following: unfollowId },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `You have successfully unfollowed user with ID ${unfollowId} `,
      error: '',
    });
  } catch (err) {
    return res.status(400).json({ status: fail, error: err });
  }
};

const User = require('../../Models/authModel');
const Dish = require('../../Models/dishModel');
const mongoose = require('mongoose');
const uploadImage = require('../../Database/uploadImage');

exports.get_all_users = async (req, res, next) => {
  try {
    const users = await User.find().populate('profile').select('_id method local.email');
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
    const user = await User.findOne({ _id: req.params.id })
      .populate('profile')
      .select('_id method local.email');
    if (user) {
      res.status(200).json({
        status: 'success',
        error: '',
        results: user.length,
        data: {
          user,
        },
      });
    } else {
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
//patch request
//endpoint : /api/users/{id}/favourites - patch request
exports.update_user_favourites = (req, res, next) => {
  // to be refactored
  //a transaction should be done to add to the user's favourties and add to the likes of the dish
  User.findOneAndUpdate(
    { _id: req.params.id },
    { $push: { favourites: req.body.dishId } },
    null,
    (err, result) => {
      if (err) {
        res.status(500).json({ message: err.message });
      } else {
        console.log(result);
        res.status(200).json({ message: 'success' });
      }
    }
  );
};

//patch request
//endpoint: /api/users/{id}/dishes
exports.add_dish = async (req, res, next) => {
  const newDishID = mongoose.Types.ObjectId();
  const { name, description, ingredients, steps, healthBenefits } = req.body;
  const dishImages = req.files;
  const dishImagesLinks = [];

  try {
    dishImages.forEach((dishImage) => {
      dishImagesLinks.push(uploadImage(dishImage));
    });
    console.log(dishImagesLinks);
    const newDish = new Dish({
      _id: newDishID,
      chef: req.params.id,
      name,
      dishImages: dishImagesLinks,
      description,
      ingredients,
      steps,
      healthBenefits,
    });
    await newDish.save();
  } catch (err) {
    res.status(500).json({ message: err.message });
    return;
  }
  User.findOneAndUpdate(
    { _id: req.params.id },
    { $push: { dishes: newDishID } },
    null,
    (err, result) => {
      if (err) {
        res.status(500).json({ message: err.message });
        return;
      } else {
        console.log(result);
        res.status(201).json({ message: 'dish successfully added' });
      }
    }
  );
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

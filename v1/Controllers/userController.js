const User = require('../../Models/profileModel');
const Dish = require('../../Models/dishModel');
const mongoose = require('mongoose');
const uploadImage = require('../../Database/uploadImage');

exports.get_all_users = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.get_user_by_id = async (req, res, next) => {
  const doesUserExist = await User.exists({ _id: req.params.id });
  if (doesUserExist) {
    try {
      const user = await User.findOne({ _id: req.params.id });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(404).json({ message: `user with ID of ${req.params.id} not found` });
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
        message: 'User not found',
      });
    }

    const followers = user.followers;
    res.status(200).json({
      success: true,
      data: followers,
    });
  } catch (err) {
    return res.status(500).json({
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
        message: 'User not found',
      });
    }

    const following = user.following;
    res.status(200).json({
      success: true,
      data: following,
    });
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
};

// /api/users/id/follow/ - put
exports.followUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.body.followId,
      {
        $push: { name: req.user.name, followers: req.user._id },
      },
      { new: true }
    );

    const findUser = await User.findById(req.body, followId);

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { name: findUser.name, following: req.body.followId },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

// /api/users/id/unfollow - put
exports.unfollowUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.body.unfollowId,
      {
        $pull: { name: req.user.name, followers: req.user._id },
      },
      { new: true }
    );
    const findUser = await User.findById(req.body, followId);

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { name: findUser.name, following: req.body.unfollowId },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

// /api/v1/users/:id/dishes/:dishId
exports.deleteDish = async (req, res, next) => {
  const userId = req.params.id;
  const dishId = req.params.dishId;

  const user = await User.findOne({ _id: userId });
  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  const dish = await Dish.findById(dishId);
  if (!dish) {
    return res.status(404).json({
      message: 'Dish not found',
    });
  }

  await dish.remove();
  res.status(200).json({
    message: 'Dish removed',
  });
};

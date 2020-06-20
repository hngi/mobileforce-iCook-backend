const User = require('../Models/userModel');

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

// /api/users/id/followers - get
exports.get_followers = (req, res, next) => {};

// /api/users/id/following - get
exports.get_following = (req, res, next) => {};

// /api/users/id/follow - put
exports.followUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.body.followId,
      {
        $push: { followers: req.user._id },
      },
      { new: true }
    );

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { following: req.body.followId },
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

// /api/users/id/unfollow - post
exports.unfollowUser = (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.body.unfollowId,
      {
        $pull: { followers: req.user._id },
      },
      { new: true }
    );

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { following: req.body.unfollowId },
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

const User = require("../../Models/authModel");
const Dish = require("../../Models/dishModel")
const mongoose = require('mongoose');
const uploadImage = require("../../Database/uploadImage");
const Profile = require("../../Models/profileModel");


exports.get_all_users = async (req, res, next) => {
  try {
    // const users = await User.find().populate('profile').select('_id method local.email');
    const users = await Profile.find().populate('dishes');
    res.status(200).json({
      status:"success",
      error: "",
      results: users.length,
      data: {
        users
      }
    });
  } catch (err) {
    res.status(500).json({ 
      status: "fail",
      error: err.message 
    });
  }
};

exports.get_user_by_id = async (req, res, next) => {
  try {
    const profileId = req.params.id; 
    const user = await Profile.findById({_id: profileId}).populate('dishes');
    if(user){
      res.status(200).json({
        status: "success",
        error: "",
        results: user.length,
        data: {
          user,
        }
      })
    } else{
      return res.status(400).json({
        status: "fail",
        error: `user with ID ${req.params.id} not found`
      })
    }  
  } 
  catch (err) {
    res.status(500).json({
      status: "fail",
      error: err.message});
  }
}
















//patch request
//endpoint : /api/users/{id}/favourites - patch request
// exports.update_user_favourites = (req, res, next) => {
//     // to be refactored
//     //a transaction should be done to add to the user's favourties and add to the likes of the dish
//   User.findOneAndUpdate(
//     { _id: req.params.id },
//     { $push: { favourites: req.body.dishId } },
//     null,
//     (err, result) => {
//       if (err) {
//         res.status(500).json({ message: err.message });
//       } else {
//         console.log(result);
//         res.status(200).json({ message: "success" });
//       }
//     }
//   );
// };


// /api/users/id/followers - get 
exports.get_followers = (req, res, next) => {

}

// /api/users/id/following - get
exports.get_following = (req, res, next) => {

}

// /api/users/id/follow - put
exports.followUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.body.followId,
      {
        $push: { name: req.user.name, followers: req.user._id },
      },
      { new: true }
    );

    const findUser = await User.findById(req.body,followId)

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {name: findUser.name, following: req.body.followId },
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
        $pull: {name: req.user.name, followers: req.user._id },
      },
      { new: true }
    );
    const findUser = await User.findById(req.body,followId)

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {name: findUser.name, following: req.body.unfollowId },
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

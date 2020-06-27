const Dish = require("../../Models/dishModel");
const uploadImage = require("../../Database/uploadImage");
const Profile = require("../../Models/profileModel");
const User = require('../../Models/authModel');


exports.createDish = async(req, res, next) => {
  try{
    const{
      name,
      recipe,
      healthBenefits,
      ingredients,
      chefName
    } = req.body;

    const userId = req.user._id;

    const dish = new Dish({
      name: name,
      recipe: recipe,
      healthBenefits: healthBenefits,
      ingredients: ingredients,
      chefName: chefName,
      chefId: userId
    });

    const findProfile = await User.findById(userId).populate('profile');

    const profileId = findProfile.profile[0]._id

    await Profile.findByIdAndUpdate(profileId, {$push: { dishes: dish}}, {new: true, useFindAndModify: false });
    await dish.save();
    return res.status(201).json({
      status: "success",
      error: "",
      message: "dish saved successfully!",
      data: {
        dish
      }
    });

  }
  catch(error){
    res.status(400).json({
      status: "fail",
      error: error.message
    })
  }
}

exports.get_all_dishes = async (req, res, next) => {
  try {
    const dishes = await Dish.find({chefId: req.user._id});
    return res.status(200).json({
      status: "success",
      error: "",
      results: dishes.length,
      data: {
        dishes
      }
    })
  } 
  catch (error) {
    return res.status(404).json({
      status: "fail",
      error: error.message
    })
  }
};

exports.get_dishes_by_ID = async (req, res, next) => {
  try{
    const dish = await Dish.findById(req.params.id);
    if(dish){
      res.status(200).json({
        status: "success",
        error: "",
        data: {
          dish
        }
      });
    } else {
      throw new Error('Not found');
    }
  } catch(error){
      return res.status(404).json({
        status: "fail",
        error: `dish with ID ${req.params.id} not found`
      })
  }
};

// Delete operation should be idempotent
exports.delete_dish = async (req, res, next) => {
  try {
    const data = await Dish.deleteOne({id: req.params.id});
    res.status(200).json({
      status: "success",
      error: "",
      data
    });
  } catch(error) {
    return res.status(400).json({
      status: "fail",
      error: error.message
    });
  }
};

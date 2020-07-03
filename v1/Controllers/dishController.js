const Dish = require("../../Models/dishModel");
const uploadImage = require("../../Database/uploadImage");
const Profile = require("../../Models/profileModel");
const User = require("../../Models/authModel");
const PublicResponse = require("../../Helpers/model");

exports.createDish = async (req, res, next) => {
  try {
    const { name, recipe, description, healthBenefits, ingredients } = req.body;

    const userId = req.user._id;
    const findProfile = await User.findById(userId);
    const profileId = findProfile.profile[0]._id;
    console.log(ingredients);

    const dish = new Dish({
      name: name,
      recipe: recipe,
      description,
      healthBenefits: healthBenefits,
      ingredients: ingredients,
      chef: profileId,
    });

    await Profile.findByIdAndUpdate(
      profileId,
      { $push: { dishes: dish } },
      { new: true, useFindAndModify: false }
    );
    await (await dish.save())
      .populate({ path: "chef", select: "userImage name _id" })
      .execPopulate();
    return res.status(201).json({
      status: "success",
      error: "",
      message: "dish saved successfully!",
      data: {
        dish,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

//Get all dishes in DB

exports.get_all_dishes = async (req, res, next) => {
  try {
    const dishes = await Dish.find().populate({
      path: "chef",
      select: "name _id userImage",
    });
    return res.status(200).json({
      status: "success",
      error: "",
      result: dishes.length,
      data: {
        dishes: PublicResponse.dishes(dishes, req),
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.get_dishes_by_ID = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id).populate({
      path: "chef",
      select: ["name", "userImage"],
    });
    if (dish) {
      const me = await Profile.findOne({
        user: req.user._id,
      });
      const isFavourite = me.favourites.includes(req.params.id);
      const d = PublicResponse.dish(dish, req, { isFavourite });
      res.status(200).json({
        status: "success",
        error: "",
        data: {
          dish: d,
        },
      });
    } else {
      throw new Error("Not found");
    }
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      error: `dish with ID ${req.params.id} not found`,
    });
  }
};

// Edit PUT Dish api/v1/dishes/:id
exports.edit_dish = async (req, res, next) => {
  const { name, recipe, healthBenefits, ingredients } = req.body;
  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (recipe) fieldsToUpdate.recipe = recipe;
  if (healthBenefits) fieldsToUpdate.healthBenefits = healthBenefits;
  if (ingredients) fieldsToUpdate.ingredients = ingredients;

  try {
    const userId = req.user._id.toString();
    const dishId = req.params.id;

    let dish = await Dish.findOne({ _id: dishId });
    if (!dish) {
      throw new Error("Dish not found");
    }

    if (dish.chef.toString() !== userId) {
      throw new Error("Unauthorized");
    }

    dish = await Dish.findOneAndUpdate(
      { chef: req.user._id },
      { $set: fieldsToUpdate },
      {
        new: true,
      }
    );

    res.status(200).json({
      status: "success",
      error: "",
      data: dish,
    });
  } catch (error) {
    const code = error.message === "Unauthorized" ? 403 : 400;
    return res.status(code).json({
      status: "fail",
      error: error.message,
    });
  }
};

// Delete operation should be idempotent
// @Usman Jun 28
exports.delete_dish = async (req, res, next) => {
  try {
    const dish = await Dish.findOne({ _id: req.params.id });
    if (!dish) {
      throw new Error("Not found");
    }

    if (dish.chef.toString() !== req.user._id.toString()) {
      throw new Error("Unauthorized");
    }
    const data = await Dish.findOneAndDelete({ _id: req.params.id });
    res.status(200).json({
      status: "success",
      error: "",
      data: {},
    });
  } catch (error) {
    const code = error.message === "Unauthorized" ? 403 : 400;
    return res.status(code).json({
      status: "fail",
      error: error.message,
    });
  }
};

// @Usman - Jun 28
exports.toggle_like = async (req, res) => {
  try {
    const dish = await Dish.findOne({ _id: req.params.id });
    if (!dish) {
      throw new Error("Not found");
    }
    const userId = req.user._id.toString();
    const isLiked = dish.likes.includes(userId);
    if (isLiked) {
      dish.likes = dish.likes.filter((id) => userId !== id);
    } else {
      dish.likes.push(userId);
    }
    await dish.save();
    const d = PublicResponse.dish(dish, req);
    res.status(200).json({
      status: "success",
      error: "",
      data: {
        dish: d,
      },
    });
  } catch (error) {
    const code = error.message === "Not found" ? 404 : 400;
    return res.status(code).json({
      status: "fail",
      error: error.message,
    });
  }
};

// @Usman Jun 28
exports.toggle_favorite = async (req, res) => {
  try {
    const dishId = req.params.id;
    const dish = await Dish.findOne({ _id: dishId });
    if (!dish) {
      throw new Error("Not found");
    }
    const me = await Profile.findOne({
      user: req.user._id,
    });
    const isFavorite = me.favourites && me.favourites.includes(dishId);

    if (isFavorite) {
      me.favourites = me.favourites.filter((id) => id.toString() !== dishId);
    } else {
      me.favourites.push(dishId);
    }
    me.save();

    return res.status(200).json({
      status: "success",
      error: "",
      data: {
        dish: PublicResponse.dish(dish, req, { isFavorite: !isFavorite }),
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

// /api/v1/dish/comment/:dishId
exports.addCommentToDish = async (req, res, next) => {
  try {
    const user = await Profile.findOne({ userId: req.user.id }).select(
      "-password"
    );
    const dish = await Dish.findById(req.params.dishId);

    if (!user && !dish) {
      throw new Error("Not Found");
    }

    const newComment = {
      text: req.body.text,
      name: user.name,
      user: req.user.id,
    };

    dish.comments.unshift(newComment);

    await dish.save();
    res.status(200).json({
      status: "success",
      data: dish.comments,
      error: "",
    });
  } catch (err) {
    res.json({
      status: "fail",
      error: err.message,
    });
  }
};

// /api/v1/dish/comments/:dishId/:commentId
exports.removeDishComment = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.dishId);

    // Pull out comment
    const comment = dish.comments.find(
      (comment) => comment.id === req.params.commentId
    );

    if (!comment) {
      throw new Error("Not Found");
    }

    // Check user
    if (comment.user.toString() !== req.user.id) {
      throw new Error("User nor authorized");
    }

    const removeIndex = dish.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    dish.comments.splice(removeIndex, 1);

    await dish.save();

    res.status(200).json({
      status: "success",
      data: dish.comments,
      error: "",
    });
  } catch (err) {
    res.json({
      status: "fail",
      error: err.message,
    });
  }
};

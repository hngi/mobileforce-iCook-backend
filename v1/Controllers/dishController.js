const Dish = require('../../Models/dishModel');
const User = require('../../Models/profileModel');
const uploadImage = require('../../Database/uploadImage');

exports.get_all_dishes = async (req, res, next) => {
  res.header('Content-Type', 'application/json');
  try {
    const dishes = await Dish.find();
    res.send(JSON.stringify(dishes, null, 4));
  } catch (err) {
    res.status(500).send(JSON.stringify({ message: err.message }, null, 4));
  }
};

exports.get_dishes_by_ID = async (req, res, next) => {
  //to be refactored
  const doesDishExist = await Dish.exists({ _id: req.params.id });
  if (doesDishExist) {
    try {
      const dish = await Dish.findOne({ _id: req.params.id });
      res.json(dish);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(404).json({ message: `dish with ID of ${req.params.id} not found` });
  }
};

// /api/v1/dishes/:dishId
exports.deleteDish = async (req, res, next) => {
  const dishId = req.params.id;
  const user = req.user;

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

//moved to userController
/*exports.add_dish = async (req, res, next) => {
  const {
    chef,
    name,
    description,
    ingredients,
    steps,
    healthBenefits,
  } = req.body;
  const dishImages = req.files;
  const dishImagesLinks = [];

  try {
    dishImages.forEach((dishImage) => {
      dishImagesLinks.push(uploadImage(dishImage));
    });
    console.log(dishImagesLinks);
    const newDish = new Dish({
      chef,
      name,
      chefImage,
      dishImages,
      description,
      ingredients,
      steps,
      healthBenefits,
    });
    await newDish.save();
    res.status(201);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};*/

exports.delete_dish = (req, res, next) => {};

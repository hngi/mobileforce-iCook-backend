const User = require('../../Models/authModel');
const Dish = require('../../Models/dishModel');
const Profile = require("../../Models/profileModel");
const PublicResponse = require('../../Helpers/model');

exports.search_dish = async (req, res) => {
  const query = req.query;
  const { name } = query;
  const _dishes = await Dish.find({name:{ $regex: new RegExp("^" + name.toLowerCase(), "i") }});
  const dishes = PublicResponse.dishes(_dishes, req);
  res.status(200)
    .json({ 
      status: "success",
      error: "",
      data: {
        dishes
      }
    });
};
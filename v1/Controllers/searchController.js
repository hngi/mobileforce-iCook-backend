const User = require('../../Models/authModel');
const Dish = require('../../Models/dishModel');
const Profile = require("../../Models/profileModel");

exports.search_dish = async (req, res) => {
  const query = req.query;
  const { name } = query;
  const _dishes = await Dish.find({name:{ $regex: new RegExp("^" + name.toLowerCase(), "i") }});
  const dishes = _dishes.map(dish => {
    const d = Object.assign({}, {
      ...dish.toJSON(),
      likesCount: dish.likes.length,
      isLiked : dish._isLiked(req.user._id)
    });
    delete d.likes;
    delete d.comments;
    return d;
  });
  res.status(200)
    .json({ 
      status: "success",
      error: "",
      data: {
        dishes
      }
    });
};
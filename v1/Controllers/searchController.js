const Dish = require('../../Models/dishModel');
const Profile = require("../../Models/profileModel");
const PublicResponse = require('../../Helpers/model');

exports.search = async (req, res) => {
  const query = req.query;
  const { type, name, limit=20 } = query;
  let result = [];
  switch(type.toLowerCase()) {
    case 'dish': {
      const _dishes = await Dish.find({name:{ $regex: new RegExp("^" + name.toLowerCase(), "i") }});
      result = PublicResponse.dishes(_dishes, req);
      break;
    };
    case 'person': {
      const _users = await Profile.find({name:{ $regex: new RegExp("^" + name.toLowerCase(), "i") }});
      result = PublicResponse.users(_users, req);
      break;
    }
  }

  if (result.length) {
    result = result.slice(0, limit);
  }

  res.status(200)
    .json({ 
      status: "success",
      error: "",
      data: {
        count: result.length,
        result
      }
    });
};
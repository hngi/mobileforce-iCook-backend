const Dish = require("../../Models/dishModel");
const Profile = require("../../Models/profileModel");
const PublicResponse = require("../../Helpers/model");

// @Usman Jun 28
exports.search = async (req, res) => {
  const query = req.query;
  const { type = "dish", name = "", limit = 20, after = 0 } = query;
  let result = [];
  let total;
  switch (type.toLowerCase()) {
    case "dish": {
      const _dishes = await Dish.find({
        name: { $regex: new RegExp("^" + name.toLowerCase(), "i") },
      }).populate({ path: "chef", select: ["name", "userImage"] });
      result = PublicResponse.dishes(_dishes, req);
      total = _dishes.length;
      break;
    }
    case "person": {
      const _users = await Profile.find({
        name: { $regex: new RegExp("^" + name.toLowerCase(), "i") },
      });
      total = _users.length;
      result = PublicResponse.users(_users, req);
      break;
    }
  }

  if (result.length) {
    result = result.slice(after, after + limit);
  }

  const count = result.length;
  res.status(200).json({
    status: "success",
    error: "",
    data: {
      total,
      count,
      after: count,
      result,
    },
  });
};

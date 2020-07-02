const mongoose = require("mongoose");
const schema = mongoose.Schema;

const dishSchema = new schema(
  {
    name: {
      type: String,
      required: true,
    },
    chef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profile",
    },
    dishImages: {
      type: [String],
    },
    recipe: {
      type: [String],
    },
    likes: {
      type: [String], // You'll be able to make intelligent query based on user IDs
      default: [],
    },
    ingredients: {
      type: [String],
      required: true,
    },
    healthBenefits: {
      type: [String],
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "profile",
        },
        text: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

dishSchema.methods._isLiked = function (userId) {
  return this.likes.includes(userId);
};

dishSchema.post("findOneAndDelete", async function (document) {
  const Profile = mongoose.model("profile");
  const userId = document.chef;
  const dishId = document._id;
  await Profile.findOneAndUpdate(
    { user: userId },
    {
      $pull: {
        dishes: dishId,
      },
    },
    { new: true }
  );
});

const Dish = mongoose.model("dish", dishSchema);

module.exports = Dish;

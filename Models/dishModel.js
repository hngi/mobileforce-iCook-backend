const mongoose = require("mongoose");
const schema = mongoose.Schema;

const dishSchema = new schema({
  name: {
    type: String,
    required: true
  },
  chefId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "profile"
  },
  dishImages: {
    type: [String]
  },
  recipe: {
    type: [String]
  },
  likes: { 
    type: [String], // You'll be able to make intelligent query based on user IDs
    default: []
  },
  ingredients: {
    type: [String],
    required: true
  },
  healthBenefits: {
    type: [String]
  },
  comments: [{
    chefEmail: String,
    chefName: String,
    comment: String,
  }],
}, { timestamps: true });

dishSchema.methods._isLiked = function(userId) {
  return this.likes.includes(userId);
};

const Dish = mongoose.model("dish", dishSchema);

module.exports = Dish;

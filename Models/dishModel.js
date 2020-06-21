const mongoose = require("mongoose");
const schema = mongoose.Schema;

const dishSchema = new schema({
  name: {
    type: String,
    required: true
  },
  chef: {
    type: schema.Types.ObjectId,
    ref: 'Profile'
  },
  dishImages: [String],
  description: String,
  likes: { type: Number, min: 0, default: 0 },
  ingredients: {
    type: [String],
    required: true
  },
  steps: {
    type: [String],
    required: true
  },
  healthBenefits: [String],
  comments: [{
    chefEmail: String,
    chefName: String,
    comment: String,
  }],
});

const Dish = mongoose.model("Dish", dishSchema);

module.exports = Dish;

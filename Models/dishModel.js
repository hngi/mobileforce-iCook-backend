const mongoose = require("mongoose");
const schema = mongoose.Schema;

const dishSchema = new schema({
  name: {
    type: String,
    required: true
  },
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile"
  },
  dishImages: {
    type: [String]
  },
  recipe: {
    type: [String]
  },
  likes: { 
    type: Number, 
    min: 0, 
    default: 0 
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
});

const Dish = mongoose.model("Dish", dishSchema);

module.exports = Dish;

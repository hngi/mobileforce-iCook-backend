const mongoose = require("mongoose");
const schema = mongoose.Schema;

const profileSchema = new schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
  },
  gender: {
    type: String,
    default: "",
    enum: ["male", "female", "others"]
  },
  userImage: String,
  country: { 
    type: String
  },
  phoneNumber: {
    type: String
  },
  bio: {
    type: String
  },
  dishes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dish"
  }], //array of dishes posted by this user
  favDishes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dish"
  }], //array of dish IDs
  followers: [
    {
      name: String,
      id: mongoose.Schema.Types.ObjectId
    },
  ],
  following: [
    {
      name: String,
      id: mongoose.Schema.Types.ObjectId
    },
  ],
});


const Profile = mongoose.model("Profile", profileSchema);


module.exports = Profile;

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
  userImage: String,
  country: String,
  phoneNumber: String,
  dishes: [{
    type: schema.Types.ObjectId,
    ref: "Profile"
  }], //array of dishes posted by this user
  favourites: [{
    type: schema.Types.ObjectId,
    ref: "Dish"
  }], //array of dish IDs
  followers: [
    {
      name: String,
      id: schema.Types.ObjectId,
    },
  ],
  following: [
    {
      name: String,
      id: schema.Types.ObjectId,
    },
  ],
});

const Profile = mongoose.model("Profile", profileSchema);


module.exports = Profile;

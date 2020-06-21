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
  dishes: [String], //array of dishes posted by this user
  favourites: [String], //array of dish IDs
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

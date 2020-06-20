const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({
  auth: {
    type: schema.Types.ObjectId,
    ref: 'User',
  },
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
      id: schema.Types.ObjectId,
    },
  ],
  following: [
    {
      id: schema.Types.ObjectId,
    },
  ],
});

const User = mongoose.model('Profile', userSchema);

module.exports = User;

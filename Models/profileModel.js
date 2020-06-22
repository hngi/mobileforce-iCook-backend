const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;

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
  dishes: [
    {
      type: schema.Types.ObjectId,
      ref: 'Profile',
    },
  ], //array of dishes posted by this user
  favourites: [
    {
      type: schema.Types.ObjectId,
      ref: 'Dish',
    },
  ], //array of dish IDs
  followers: [{ type: ObjectId, ref: 'Profile' }],
  following: [{ type: ObjectId, ref: 'Profile' }],
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;

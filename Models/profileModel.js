const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;

const profileSchema = new schema({
  userId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
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
    default: '',
    enum: ['male', 'female', 'others'],
  },
  userImage: String,
  country: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  bio: {
    type: String,
  },
  dishes: [{ type: ObjectId, ref: 'dish' }],
  favourites: [{ type: ObjectId, ref: 'dish' }],
  followers: [{ type: ObjectId, ref: 'Profile' }],
  following: [{ type: ObjectId, ref: 'Profile' }],
});

profileSchema.methods._isFollowing = function (userId) {
  return this.followers.includes(userId);
}

const Profile = mongoose.model('profile', profileSchema);

module.exports = Profile;

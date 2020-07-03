const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;

const profileSchema = new schema({
  user: [{
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
  userImage: {
    type: String,
    default: 'https://icook-images.s3.us-east-2.amazonaws.com/user-5efa6f6b9e25253484f82ab2-1593520284454.jpeg'
  },
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
}, { timestamps: true });

profileSchema.methods._isFollowing = function (userId) {
  return this.followers.includes(userId);
}

const Profile = mongoose.model('profile', profileSchema);

module.exports = Profile;

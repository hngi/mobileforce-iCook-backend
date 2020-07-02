const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// Create a schema
const userSchema = new Schema({
  method: {
    type: String,
    enum: ['local', 'google', 'facebook'],
  },
  local: {
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  google: {
    id: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
    },
  },
  facebook: {
    id: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
    },
  },
  profile: [
    {
      type: Schema.Types.ObjectId,
      ref: 'profile',
    },
  ],
}, {timestamps:true});

userSchema.pre('save', async function (next) {
  try {
    if (this.method !== 'local') {
      next();
    }

    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Generate a password hash (salt + hash)
    const passwordHash = await bcrypt.hash(this.local.password, salt);
    // Re-assign hashed version over original, plain text password
    this.local.password = passwordHash;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isValidPassword = async function (newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.local.password);
  } catch (error) {
    throw new Error(error);
  }
};

userSchema.methods.createPasswordResetToken = function() {

  const resetToken =  Math.floor(100000 + Math.random() * 900000);

  //console.log({ resetToken }, this.local.passwordResetToken);
   const resetExpires = Date.now() + 10 * 60 * 1000;

  return {resetToken,resetExpires};
};

userSchema.methods.resetPassword = function(newPassword) {

  this.local.passwordResetToken = undefined;
  this.local.passwordResetExpires = undefined;
  this.local.password = newPassword;
};

// Create a model
const User = mongoose.model('user', userSchema);

// Export the model
module.exports = User;

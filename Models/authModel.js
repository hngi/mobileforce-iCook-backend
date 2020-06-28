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
      required: [true, 'A user requires an email'],
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
});

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

userSchema.methods.isValidPassword = async function (newPassword, res) {
  try {
    return await bcrypt.compare(newPassword, this.local.password);
  } catch (error) {
    throw new Error(error);
  }
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.local.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //console.log({ resetToken }, this.local.passwordResetToken);
  this.local.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Create a model
const User = mongoose.model('user', userSchema);

// Export the model
module.exports = User;

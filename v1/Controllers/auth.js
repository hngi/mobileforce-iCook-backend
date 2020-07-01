const crypto = require('crypto');
const JWT = require('jsonwebtoken');
const Profile = require('../../Models/profileModel');
const User = require('../../Models/authModel');
const { sendEmail } = require('./../../Helpers/email');

signToken = (user) => {
  return JWT.sign(
    {
      iss: 'CodeWorkr',
      sub: user.id,
      iat: new Date().getTime(), // current time
      exp: new Date().setDate(new Date().getDate() + 365), // current time + 1 year ahead
    },
    process.env.JWT_SECRET
  );
};

module.exports = {
  signUp: async (req, res, next) => {
    try {
      const { email, password, name, gender, phone } = req.body;

      // Check if there is a user with the same email
      const foundUser = await User.findOne({ 'local.email': email });
      const existingUser = await User.findOne({ 'google.email': email });
      const facebookUser = await User.findOne({ 'facebook.email': email });
      if (foundUser || existingUser || facebookUser) {
        return res.status(403).json({
          status: 'fail',
          error: 'Email is already in use'
        });
      }
      if (!(name && phone && gender && email && password)) {
        return res.status(400).json({
          status: 'fail',
          error: 'name, email, password, phone and gender fields are required',
        });
      }

      // Create a new user
      const newUser = new User({
        method: 'local',
        local: {
          email: email,
          password: password,
        },
      });

      const profile = new Profile({
        user: newUser._id,
        email: email,
        name: name,
        phoneNumber: phone,
        gender: gender,
      });

      await profile.save();
      await newUser.profile.push(profile);
      await newUser.save();

      // Generate the token
      const token = signToken(newUser);
      // Respond with token
      return res
        .status(201)
        .header('x-auth-token', token)
        .json({
          status: 'success',
          error: '',
          message: 'user successfully registered!',
          data: {
            token: token,
            userID: newUser._id,
            profileID: profile._id,
            email: newUser.local.email,
            name: profile.name,
            phone: newUser.local.phone,
            token,
          },
        });
    } catch (error) {
      return res.status(400).json({ status: 'fail', error: error.message });
    }
  },

  signIn: async (req, res, next) => {
    // Generate token
    try {
      const token = signToken(req.user);
      const userDetails = await User.findById(req.user._id).populate('profile');
      console.log(userDetails);
      res
        .header('x-auth-token', token)
        .status(200)
        .json({
          status: 'success',
          error: '',
          data: {
            user_id: req.user._id,
            user_name: userDetails.profile[0].name,
            email: userDetails.profile[0].email,
            token,
          },
        });
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        error: error.message,
      });
    }
  },

  updateUserPassword: async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      // Check current password
      if (!(await user.isValidPassword(req.body.currentPassword))) {
        throw new Error('Password is incorrect');
      }

      user.local.password = req.body.newPassword;
      await user.save();

      const token = signToken(user);
      res.status(200).json({
        status: 'success',
        token,
        error: {},
      });
    } catch (err) {
      res.status(500).json({
        error: err,
      });
    }
  },

  googleOAuth: async (req, res, next) => {
    // Generate token
    try {
      const token = signToken(req.user);
      res
        .header('x-auth-token', token)
        .status(200)
        .json({
          status: 'success',
          error: '',
          data: {
            user_id: req.user._id,
            token,
          },
        });
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        error: error.message,
      });
    }
  },

  facebookOAuth: async (req, res, next) => {
    try {
      const token = signToken(req.user);
      res
        .header('x-auth-token', token)
        .status(200)
        .json({
          status: 'success',
          error: '',
          data: {
            user_id: req.user._id,
            token,
          },
        });
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        error: error.message,
      });
    }
  },

  forgotPassword: async (req, res, next) => {
    // 1) Get user based on POSTed email
  const user = await User.findOne({ "local.email": req.body.email });
  //console.log("User",user)
  if (!user) {
    return res.status(400).json({
      status: "fail",
      message: "There is no user with email address"
    })
  }
  // 2) Generate the rendom reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3) Sent it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const text = `We've received a request to reset your password. If you didn't make the request,
just ignore this email.Otherwise, you can reset your password using the link below:\n ${resetURL}`;

  const subject = 'Your password reset token (valid for 10 min)';
  try {
    await sendEmail(user.local.email, { subject, text });
    res.status(200).json({
      status: 'success',
      message: 'Token sent Successfully!'
    });
  } catch (err) {
    user.PasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.log(err);

    return res.status(500).json({
      status: 'fail',
      message: 'There was an error sending the email. Try agaim later'
    })
  }
  },

  resetPassword: async (req, res, next) => {
      // 1) Get user based on the token
    const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    const user = await User.findOne({
    "local.passwordResetToken": hashedToken,
    "local.passwordResetExpires": { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
    return res.status(400).json({
      status: "fail",
      message: 'Token is invalid or has expired'
    })
    }


    // 3) Log the user in, send JWT
    user.local.password = req.body.password;
    user.local.passwordResetToken = undefined;
    user.local.passwordResetExpires = undefined;
    await user.save();
    const token = signToken(user._id);

    res.status(200).json({
    status: 'successful',
    token
    });
  },

  unlink_google_account: async (req, res, next) => {
    try{
      
      const user = await User.findById(req.user._id);
      if (user){
         user.method = 'local';
         user.local.email = user.google.email;
         user.local.password = req.body.setPassword;
         user.google = undefined;

         await user.save();
        return res.status(200).json({
          status: "success",
          error: "",
          data:{
            message: "Google oauth unlinked successfully"
          }
        })
      } 

    }
    catch(error){
      res.status(500).json({
        error: err,
      });
    }
  },

  //unlink facebook account
  unlink_facebook_account: async (req, res, next) => {
    try{
      
      const user = await User.findById(req.user._id);
      if (user){
         user.method = 'local';
         user.local.email = user.facebook.email;
         user.local.password = req.body.setPassword;
         user.facebook = undefined;

         await user.save();
        return res.status(200).json({
          status: "success",
          error: "",
          data:{
            message: "Facebook oauth unlinked successfully"
          }
        })
      } 

    }
    catch(error){
      res.status(500).json({
        error: err,
      });
    }
  },


}

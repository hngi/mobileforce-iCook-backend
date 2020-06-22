require('dotenv').config();
const JWT = require('jsonwebtoken');
const Profile = require('../../Models/profileModel');
const User = require('../../Models/authModel');
const mongoose = require('mongoose');

signToken = (user) => {
  return JWT.sign(
    {
      iss: 'CodeWorkr',
      sub: user.id,
      iat: new Date().getTime(), // current time
      exp: new Date().setDate(new Date().getDate() + 1), // current time + 1 day ahead
    },
    process.env.JWT_SECRET
  );
};

module.exports = {
  signUp: async (req, res, next) => {
    // const email = 'faruq@test.com';
    // const password = 'test123';
    const { email, password } = req.body;

    // Check if there is a user with the same email
    const foundUser = await User.findOne({ 'local.email': email });
    const existingUser = await User.findOne({ 'google.email': email });
    const facebookUser = await User.findOne({ 'facebook.email': email });
    if (foundUser || existingUser || facebookUser) {
      return res.status(403).json({ error: 'Email is already in use' });
    }

    // Create a new user
    const userID = mongoose.Types.ObjectId();
    const newUser = new User({
      method: 'local',
      local: {
        email: email,
        password: password,
      },
      user: {
        id: userID,
      },
    });
    //create new profile for new user
    const newProfile = new Profile({ _id: userID, email: email });
    await newUser.save();
    await newProfile.save();

    // Generate the token
    const token = signToken(newUser);
    // Respond with token
    // res.status(200).json({ token });
    return res
      .status(200)
      .json({ status: 'success', message: `user with email ${email} successfully registered!` });
  },

  signIn: async (req, res, next) => {
    // Generate token
    const token = signToken(req.user);
    res.status(200).json({ token, user: req.user });
  },

  googleOAuth: async (req, res, next) => {
    // Generate token
    // console.log('got here');
    const token = signToken(req.user);
    res.status(200).json({ token });
  },

  facebookOAuth: async (req, res, next) => {
    // console.log('got here');
    // console.log('req.user', req.user);
    const token = signToken(req.user);
    res.status(200).json({ token });
  },
};

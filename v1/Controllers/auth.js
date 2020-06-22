require('dotenv').config();
const JWT = require('jsonwebtoken');
const Profile = require("../../Models/profileModel")
const User = require('../../Models/authModel');
const mongoose = require('mongoose');



signToken = user => {
  return JWT.sign({
    iss: 'CodeWorkr',
    sub: user.id,
    iat: new Date().getTime(), // current time
    exp: new Date().setDate(new Date().getDate() + 1) // current time + 1 day ahead
  }, process.env.JWT_SECRET);
}

module.exports = {
  signUp: async (req, res, next) => {

    try{
      const { email, password, name, gender, phone } = req.body;

    // Check if there is a user with the same email
    const foundUser = await User.findOne({ "local.email": email });
    const existingUser = await User.findOne({"google.email": email});
    const facebookUser = await User.findOne({"facebook.email": email});
    if (foundUser || existingUser || facebookUser) { 
      return res.status(403).json({ error: 'Email is already in use'});
    } 
    if (!name || !phone || !gender) {
      return res.status(400).json({
        error: "name, phone and gender fields are required"
      })
    }
    

    // Create a new user
    const profileID = mongoose.Types.ObjectId();
    const newUser = new User({ 
      method: 'local',
      local: {
        email: email, 
        password: password,
      },
      profile: {
        id: profileID,
      }
    });
    //create new profile for new user
    const newProfile = new Profile({
      _id: profileID, 
      email: email,
      name: name,
      phoneNumber: phone,
      gender: gender  
    });
    await newProfile.save();
    await newUser.save();
    

    // Generate the token
    const token = signToken(newUser);
    // Respond with token
    // res.status(200).json({ token });
    return res.status(200).json({
      status: "success", 
      message: "user successfully registered!", 
      data: { 
        userID: newUser._id,
        profileID: newUser.profile.id,
        email: newUser.local.email, 
        name: newProfile.name,
        phone: newUser.local.phone
      }
    });
    }
    catch(error){
      res.status(400).json({status: "fail", message: error.message});
    }

  },  

  signIn: async (req, res, next) => {
    // Generate token
    console.log(req.user);
    const token = signToken(req.user);
    res.status(200).json({ user_id: req.user._id, token});
  },

  googleOAuth: async (req, res, next) => {
    // Generate token
    // console.log('got here');
    try{
      const token = signToken(req.user);
      res.status(200).json({ user_id: req.user._id, token });
    }
    catch(error){
      console.log(error)
      res.status(400).json({status: "fail", message: error.message});
    }
    
  },

  facebookOAuth: async (req, res, next) => {
    // console.log('got here');
    // console.log('req.user', req.user);
    const token = signToken(req.user);
    res.status(200).json({ user_id: req.user._id, token });
  }

}
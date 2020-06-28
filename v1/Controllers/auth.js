const JWT = require('jsonwebtoken');
const Profile = require('../../Models/profileModel');
const User = require('../../Models/authModel');

signToken = (user) => {
  return JWT.sign(
    {
      iss: 'CodeWorkr',
      sub: user.id,
      iat: new Date().getTime(), // current time
      exp: new Date().setDate(new Date().getDate() + 365), // current time + 1 day ahead
    },
    process.env.JWT_SECRET
  );
};

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
      if (!(name && phone && gender && email && password)) {
        return res.status(400).json({
          status: "fail",
          error: "name, email, password, phone and gender fields are required"
        });
      }

      // Create a new user
      const newUser = new User({ 
        method: 'local',
        local: {
          email: email, 
          password: password,
        }
      });

      const profile = new Profile({ 
        userId: newUser._id,
        email: email,
        name: name,
        phoneNumber: phone,
        gender: gender  
      });
      
      await profile.save();
      await newUser.profile.push(profile);
      await newUser.save();
      // await profile.userId.push(newUser._id);

      // Generate the token
      const token = signToken(newUser);
      // Respond with token
      return res.status(201)
      .header("x-auth-token", token)
      .json({
        status: "success",
        error: "",
        message: "user successfully registered!", 
        data: { 
          token: token,
          userID: newUser._id,
          profileID: profile._id,
          email: newUser.local.email, 
          name: profile.name,
          phone: newUser.local.phone,
          token
        }
      });
    } catch(error){
      return res.status(400).json({status: "fail", error: error.message});
    }
  },  

  signIn: async (req, res, next) => {
    // Generate token
    console.log(req.user);
    try{
      const token = signToken(req.user);
      res.header("x-auth-token", token)
      .status(200)
      .json({ 
        status: "success",
        error: "",
        data: {
          user_id: req.user._id, 
          token
        }
      });
    }
    catch(error){
      return res
      .status(400)
      .json({
        status: "fail",
        error: error.message
      })
    } 
  },

  googleOAuth: async (req, res, next) => {
    // Generate token
    try{
      const token = signToken(req.user);
      res.header("x-auth-token", token)
      .status(200)
      .json({ 
        status: "success",
        error: "",
        data: {
          user_id: req.user._id, 
          token
        }
      });
    }
    catch(error){
      return res
      .status(400)
      .json({
        status: "fail", 
        error: error.message
      });
    }
  },

  facebookOAuth: async (req, res, next) => {
    try{
      const token = signToken(req.user);
      res.header("x-auth-token", token)
      .status(200)
      .json({ 
        status: "success",
        error: "",
        data: {
          user_id: req.user._id, 
          token 
        }
        
      });
    }
    catch(error){
      return res
      .status(400)
      .json({
        status: "fail", 
        error: error.message
      });
    }
  },
}

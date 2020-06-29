const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const FacebookTokenStrategy = require('passport-facebook-token');
const User = require('./Models/authModel');
const Profile = require('./Models/profileModel');

// JSON WEB TOKENS STRATEGY
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader('authorization'),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        // Find the user specified in token
        const user = await User.findById(payload.sub);

        // If user doesn't exists, handle it
        if (!user) {
          return done(null, false);
        }
        // console.log(user);
        // req.user = user;

        // Otherwise, return the user
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  'googleToken',
  new GooglePlusTokenStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Should have full user profile over here
        console.log('profile', profile);
        console.log('accessToken', accessToken);
        console.log('refreshToken', refreshToken);
        const name = profile.name.givenName+ " "+profile.name.familyName
        const existingUser = await User.findOne({ 'google.id': profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = new User({
          method: 'google',
          google: {
            id: profile.id,
            email: profile.emails[0].value,
          },
        });
        //@omodauda create a profile for a user registering with Google oauth
        const newProfile = new Profile({
          userId: newUser._id,
          email: profile.emails[0].value,
          name: name,
          gender: "others"
        });

        await newProfile.save();
        await newUser.profile.push(newProfile);
        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error, false, error.message);
      }
    }
  )
);

//FACEBOOK OAUTH STRATEGY
passport.use(
  'facebookToken',
  new FacebookTokenStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ 'facebook.id': profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = new User({
          method: 'facebook',
          facebook: {
            id: profile.id,
            email: profile.emails[0].value,
          },
        });
        //@omodauda create a profile for a user registering with  oauth
        const newProfile = new Profile({
          userId: newUser._id,
          email: profile.emails[0].value,
          name: profile.displayName,
          gender: "others"
        });

        await newProfile.save();
        await newUser.profile.push(newProfile);
        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error, false, error.message);
      }
    }
  )
);

// LOCAL STRATEGY
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    async (email, password, done, res) => {
      try {
        // Find the user given the email
        const user = await User.findOne({ 'local.email': email });

        // If not, handle it
        if (!user) {
          return done(new Error('Invalid email or password'), false);
        }

        // Check if the password is correct
        const isMatch = await user.isValidPassword(password);

        // If not, handle it
        if (!isMatch) {
          return done(new Error('Authentication failed'), false);
        }

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

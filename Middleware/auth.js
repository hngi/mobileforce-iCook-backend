const jwt = require('jsonwebtoken');
const User = require('../Models/authModel');

exports.protectedRoute = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not Authorized',
    });
  }


try {
    //   Verify token
    const decoded = jwt.verify(token, 'CodeWorkr')

    req.user = await User.findById(decoded.id);

    next()
} catch (err) {
    return res.status(401).json({
        success: false,
        error: 'Not Authorized',
      });
}
};

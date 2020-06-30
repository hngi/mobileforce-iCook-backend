const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')

AWS.config.update({
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId:process.env.AWS_ACCESS_KEY,
    region:'us-east-2'
})

const s3 = new AWS.S3()

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'icook-images',
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, {fieldName: 'TESTING'});
      },
      key: function (req, file, cb) {
        cb(null, `user-${req.user._id}-${Date.now()}.jpeg`)
      }
    }),
  });

module.exports = upload;
const mongoose = require('mongoose')
const schema = mongoose.Schema

const commentSchema = new schema({
  text: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'users'
  },
  dish: {
    type: mongoose.Schema.ObjectId,
    ref: 'dish'
  }
})

const Comment = mongoose.model('comment', commentSchema)

module.exports = Comment

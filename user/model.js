const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const UserSchema = mongoose.Schema({
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  birthday:{
    type:Date,
    required:true
  },
  success_rate:{
    type:Number,
    min:0,
    max:100
  },
  friends:{
    type:[mongoose.Schema.Types.ObjectId]
  },
  created_at:{
    type: Date,
    default: Date.now
  },
  updated_at:{
    type: Date,
    default: Date.now
  },
  deleted_at:{
    type: Date
  }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
}

module.exports.getUser = function(username, callback) {
  // TODO: /users?filters link
  const query = {
    username: username
  }
  User.findOne(query, callback);
}

// TODO: Get Users
// TODO: Update User
// TODO: Delete User
// TODO: Change Password
// TODO: Forgot Password
// TODO: Add Friend
// TODO: Remove Friend

module.exports.addUser = function(newUser, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  })
}

module.exports.comparePassword = function(password, hash, callback) {
  bcrypt.compare(password, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  })
}

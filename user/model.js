const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const util = require('util');


// User Schema
const UserSchema = mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  birthday: {
    type: Date,
    required: true
  },
  correct_score: {
    type: Number,
    min: 0
  },
  uncorrect_score: {
    type: Number,
    min: 0
  },
  friends: {
    type: [mongoose.Schema.Types.ObjectId]
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  deleted_at: {
    type: Date
  }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
}

module.exports.getUserByEmail = function(email, callback) {
  const query = {
    email: email
  }
  User.findOne(query, callback);
}

module.exports.listUsers = function(filter, callback) {
  let limit = 25
  if (filter.limit)
    limit = filter.limit;

  query = {}

  if (filter.first_name)
    query["first_name"] = {
      "$regex": util.format(".*%s.*", filter.first_name)
    };

  if (filter.last_name)
    query["last_name"] = {
      "$regex": util.format(".*%s.*", filter.last_name)
    };

  if (filter.email)
    query["email"] = {
      "$regex": util.format(".*%s.*", filter.email)
    };

  if (filter.start_birthday_at || filter.end_birthday_at) {
    birthday_query = {}
    if (filter.start_birthday_at)
      birthday_query["$gt"] = filter.start_birthday_at;
    if (filter.end_birthday_at)
      birthday_query["$lt"] = filter.end_birthday_at;
    query["birthday"] = birthday_query;
  }

  if (filter.start_correct_score_at || filter.end_correct_score_at) {
    correct_score_query = {}
    if (filter.start_correct_score_at)
      correct_score_query["$gt"] = filter.start_correct_score_at;
    if (filter.end_correct_score_at)
      correct_score_query["$lt"] = filter.end_correct_score_at;
    query["correct_score"] = correct_score_query;
  }

  if (filter.start_uncorrect_score_at || filter.end_uncorrect_score_at) {
    uncorrect_score_query = {}
    if (filter.start_uncorrect_score_at)
      uncorrect_score_query["$gt"] = filter.start_uncorrect_score_at;
    if (filter.end_uncorrect_score_at)
      uncorrect_score_query["$lt"] = filter.end_uncorrect_score_at;
    query["uncorrect_score"] = uncorrect_score_query;
  }

  if (filter.friends) {
    query["friends"] = {
      "$in": filter.friends
    };
  }

  if (filter.start_created_at || filter.end_created_at) {
    created_at_query = {}
    if (filter.start_created_at)
      created_at_query["$gt"] = filter.start_created_at;
    if (filter.end_created_at)
      created_at_query["$lt"] = filter.end_created_at;
    query["created_at"] = created_at_query;
  }

  if (filter.start_updated_at || filter.end_updated_at) {
    updated_at_query = {}
    if (filter.start_updated_at)
      updated_at_query["$gt"] = filter.start_updated_at;
    if (filter.end_updated_at)
      updated_at_query["$lt"] = filter.end_updated_at;
    query["updated_at"] = updated_at_query;
  }

  User.find(query, callback);
}

// Update User
module.exports.updateUser = function(id, updateUser, callback) {
  User.findById(id, function(err, user) {
    if (err) return handleError(err);
    user.set(updateUser);
    user.save(callback);
  });
}

// TODO: Delete User
// TODO: Change Password
// TODO: Forgot Password
// TODO: Add Friend
// TODO: Remove Friend

module.exports.addUser = function(newUser, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err)
        throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  })
}

module.exports.comparePassword = function(password, hash, callback) {
  bcrypt.compare(password, hash, (err, isMatch) => {
    if (err)
      throw err;

    callback(null, isMatch);
  })
}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const VoteSchema = mongoose.Schema({
  user_id:{
    type:mongoose.Schema.Types.ObjectId,
    required:true
  },
  estimate_id:{
    type:mongoose.Schema.Types.ObjectId,
    required:true
  },
  vote:{
    type:String,
    required:true
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

const Vote = module.exports = mongoose.model('Vote', VoteSchema);

module.exports.getVoteById = function(id, callback) {
  Vote.findById(id, callback);
}

module.exports.getVote = function(vote_name, callback) {
  // TODO: /vote?filters link
  const query = {
    name: vote_name
  }
  Vote.findOne(query, callback);
}

// TODO: Update Vote
// TODO: Delete Vote
// TODO: Get Votes
// TODO: Add new Vote


}

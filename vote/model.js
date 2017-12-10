const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const VoteSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  estimate_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  vote: {
    type: String,
    required: true
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

const Vote = module.exports = mongoose.model('Vote', VoteSchema);

// GET Vote by id
module.exports.getVoteById = function(id, callback) {
  Vote.findById(id, callback);
}

// List Votes
module.exports.listVotes = function(filter, callback) {
  let limit = 25
  if (filter.limit)
    limit = filter.limit;

  query = {
    deleted_at: null
  }

  if (filter.userId)
    query["user_id"] = filter.userId;

  if (filter.voteId)
    query["vote_id"] = filter.voteId;

  if (filter.vote)
    query["vote"] = filter.vote

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

  Vote.find(query, callback).limit(limit);
}

// Update Vote
module.exports.updateVote = function(id, updateVote, callback) {
  Vote.findById(id, function(err, vote) {
    if (err) return handleError(err);
    updateVote.updated_at = new Date();
    vote.set(updateVote);
    vote.save(callback);
  });
}

// Create Vote
module.exports.createVote = function(newVote, callback) {
  newVote.save(callback);
}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Estimate Schema
const EstimateSchema = mongoose.Schema({
  total_votes: {
    type: Number,
    default: 0
  },
  rises: {
    type: Number,
    default: 0
  },
  falls: {
    type: Number,
    default: 0
  },
  type: {
    type: String,
    required: true
  },
  cc_id: {
    type: mongoose.Schema.Types.ObjectId
  },
  result: {
    type: Boolean
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

const Estimate = module.exports = mongoose.model('Estimate', EstimateSchema);

// GET Estimate By Id
module.exports.getEstimateById = function(id, callback) {
  Estimate.findById(id, callback);
}

// List Estimates
module.exports.listEstimates = function(filter, callback) {
  let limit = 25
  if (filter.limit)
    limit = filter.limit;

  query = {
    deleted_at: null
  }

  if (filter.ccId)
    query["cc_id"] = filter.ccId;

  if (filter.start_total_votes_at || filter.end_total_votes_at) {
    total_votes_query = {}
    if (filter.start_total_votes_at)
      total_votes_query["$gt"] = filter.start_total_votes_at;
    if (filter.end_total_votes_at)
      total_votes_query["$lt"] = filter.end_total_votes_at;
    query["total_votes"] = total_votes_query;
  }

  if (filter.start_rises_at || filter.end_rises_at) {
    rises_query = {}
    if (filter.start_rises_at)
      rises_query["$gt"] = filter.start_rises_at;
    if (filter.end_rises_at)
      rises_query["$lt"] = filter.end_rises_at;
    query["rises"] = rises_query;
  }

  if (filter.start_falls_at || filter.end_falls_at) {
    falls_query = {}
    if (filter.start_falls_at)
      falls_query["$gt"] = filter.start_falls_at;
    if (filter.end_falls_at)
      falls_query["$lt"] = filter.end_falls_at;
    query["falls"] = falls_query;
  }

  if (filter.type)
    query["type"] = filter.type

  if (filter.result)
    query["result"] = (filter.result == 'true');

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

  Estimate.find(query, callback).limit(limit);
}

// Update Estimate
module.exports.updateEstimate = function(id, updateEstimate, callback) {
  Estimate.findById(id, function(err, estimate) {
    if (err) return handleError(err);
    updateEstimate.updated_at = new Date();
    estimate.set(updateEstimate);
    estimate.save(callback);
  });
}

// Voting
module.exports.vote = function(id, type, callback) {
  if (type == "rises")
    return Estimate.findOneAndUpdate({
      _id: id
    }, {
      $inc: {
        'rises': 1,
        'total_votes': 1
      }
    }).exec();
  else if (type == "falls")
    return User.findOneAndUpdate({
      _id: id
    }, {
      $inc: {
        'falls': 1,
        'total_votes': 1
      }
    }).exec();
}

// Create Estimate
module.exports.createEstimate = function(newEstimate, callback) {
  newEstimate.save(callback);
}

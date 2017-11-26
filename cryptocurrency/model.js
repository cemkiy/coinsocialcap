const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const util = require('util');


// Cryptocurrency Schema
const CryptocurrencySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  shortening: {
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

const Cryptocurrency = module.exports = mongoose.model('Cryptocurrency', CryptocurrencySchema);

// Get CC by id
module.exports.getCryptocurrencyById = function(id, callback) {
  Cryptocurrency.findById(id, callback);
}

// Get CC by name
module.exports.getCryptocurrencyByName = function(cryptocurrency_name, callback) {
  const query = {
    shortening: cryptocurrency_name
  }
  Cryptocurrency.findOne(query, callback);
}

// List CCs
module.exports.listCryptocurrencies = function(filter, callback) {
  let limit = 25
  if (filter.limit)
    limit = filter.limit;

  query = {
    deleted_at:null
  }

  if (filter.name)
    query["name"] = {
      "$regex": util.format(".*%s.*", filter.name)
    };

  if (filter.shortening)
    query["shortening"] = {
      "$regex": util.format(".*%s.*", filter.shortening)
    };

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

  Cryptocurrency.find(query, callback).limit(limit);
}

// Update CC
module.exports.updateCryptocurrency = function(id, updateCryptocurrency, callback) {
  Cryptocurrency.findById(id, function(err, cryptocurrency) {
    if (err) return handleError(err);
    updateCryptocurrency.updated_at=new Date();
    cryptocurrency.set(updateCryptocurrency);
    cryptocurrency.save(callback);
  });
}

// Create CC
module.exports.createCryptocurrency = function(newCryptocurrency, callback) {
  newCryptocurrency.save(callback);
}

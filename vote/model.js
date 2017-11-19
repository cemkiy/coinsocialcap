const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const CryptocurrencySchema = mongoose.Schema({
  name: {
    type: String,
    required:true
  },
  shortening: {
    type: String,
    required: true
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

const Cryptocurrency = module.exports = mongoose.model('Cryptocurrency', CryptocurrencySchema);

module.exports.getCryptocurrencyById = function(id, callback) {
  Cryptocurrency.findById(id, callback);
}

module.exports.getCryptocurrency = function(cryptocurrency_name, callback) {
  // TODO: /cc?filters link
  const query = {
    name: cryptocurrency_name
  }
  Cryptocurrency.findOne(query, callback);
}

// TODO: Update CC
// TODO: Delete CC
// TODO: Get CCs
// TODO: Add new CC


}

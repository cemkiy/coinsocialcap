const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Estimate Schema
const EstimateSchema = mongoose.Schema({
  total_votes: {
    type: Number,
    default:0
  },
  rises: {
    type: Number,
    default: 0
  },
  falls:{
    type: Number,
    default: 0
  },
  type:{
    type:String,
    required:true
  },
  cc_id:{
    type:mongoose.Schema.Types.ObjectId
  },
  result:{
    type:Boolean
  }
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

const Estimate = module.exports = mongoose.model('Estimate', EstimateSchema);

module.exports.getEstimateById = function(id, callback) {
  Estimate.findById(id, callback);
}

// TODO: Update Estimate
// TODO: Delete Estimate
// TODO: Get Estimates
// TODO: Get Estimate
// TODO: Add new Estimate


}

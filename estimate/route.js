const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const Estimate = require('./model');


// Create Estimate
router.post('/', (req, res, next) => {
  let newEstimate = new Estimate(req.body);

  Estimate.createEstimate(newEstimate, (err, estimate) => {
    if (err) {
      res.status(400).json({
        msg: err
      });
    } else {
      res.status(201).json({
        msg: 'Estimate registered',
        estimate: newEstimate
      });
    }
  })
});

// Get Estimate
router.get('/:estimateId', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  Estimate.getEstimateById(req.params.estimateId, (err, estimate) => {
    if (err)
      throw err;

    if (!estimate) {
      return res.status(404).json({
        success: false,
        msg: 'Estimate not found'
      });
    }

    return res.status(200).json(estimate);
  });
});

// List Estimates
router.get('/', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  Estimate.listEstimates(req.query, (err, estimates) => {
    if (err)
      throw err;

    if (!estimates) {
      return res.status(404).json({
        msg: 'Estimate not found'
      });
    }
    return res.status(200).json(estimates);
  });
});

// Update Estimate
router.put('/:estimateId', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  Estimate.updateEstimate(req.params.estimateId, req.body, (err, updatedEstimate) => {
    if (err)
      throw err;

    if (!updatedEstimate) {
      return res.status(400).json({
        msg: 'Estimate not updated!'
      });
    }
    return res.status(200).json(updatedEstimate);
  });
});

// Delete Estimate
router.delete('/:estimateId', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  Estimate.updateEstimate(req.params.estimateId, {deleted_at:new Date()}, (err, deletedEstimate) => {
    if (err)
      throw err;

    if (!deletedEstimate) {
      return res.status(400).json({
        msg: 'Estimate not deleted!'
      });
    }
    return res.status(204).json();
  });
});

module.exports = router;

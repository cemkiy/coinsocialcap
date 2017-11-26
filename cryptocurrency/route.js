const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const Cryptocurrency = require('./model');


// Create CC
router.post('/', (req, res, next) => {
  let newCryptocurrency = new Cryptocurrency(req.body);

  Cryptocurrency.createCryptocurrency(newCryptocurrency, (err, cryptocurrency) => {
    if (err) {
      res.status(400).json({
        msg: err
      });
    } else {
      res.status(201).json({
        msg: 'Cryptocurrency registered',
        cryptocurrency: newCryptocurrency
      });
    }
  })
});

// Get CC by id
router.get('/:ccId', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  if (req.params.ccId.length > 3) { // get with id
    Cryptocurrency.getCryptocurrencyById(req.params.ccId, (err, cryptocurrency) => {
      if (err)
        throw err;

      if (!cryptocurrency) {
        return res.status(404).json({
          success: false,
          msg: 'Cryptocurrency not found'
        });
      }

      return res.status(200).json(cryptocurrency);
    });
  } else { // get with shortening
    Cryptocurrency.getCryptocurrencyByName(req.params.ccId, (err, cryptocurrency) => {
      if (err)
        throw err;

      if (!cryptocurrency) {
        return res.status(404).json({
          success: false,
          msg: 'Cryptocurrency not found'
        });
      }

      return res.status(200).json(cryptocurrency);
    });
  }
});

// List CCs
router.get('/', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  Cryptocurrency.listCryptocurrencies(req.query, (err, cryptocurrencies) => {
    if (err)
      throw err;

    if (!cryptocurrencies) {
      return res.status(404).json({
        msg: 'Cryptocurrency not found'
      });
    }
    return res.status(200).json(cryptocurrencies);
  });
});

// Update CC
router.put('/:ccId', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  Cryptocurrency.updateCryptocurrency(req.params.ccId, req.body, (err, updatedCryptocurrency) => {
    if (err)
      throw err;

    if (!updatedCryptocurrency) {
      return res.status(400).json({
        msg: 'Cryptocurrency not updated!'
      });
    }
    return res.status(200).json(updatedCryptocurrency);
  });
});

// Delete Cryptocurrency
router.delete('/:ccId', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  Cryptocurrency.updateCryptocurrency(req.params.ccId, {
    deleted_at: new Date()
  }, (err, deletedCryptocurrency) => {
    if (err)
      throw err;

    if (!deletedCryptocurrency) {
      return res.status(400).json({
        msg: 'Cryptocurrency not deleted!'
      });
    }
    return res.status(204).json();
  });
});

module.exports = router;

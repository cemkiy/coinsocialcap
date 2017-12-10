const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const Vote = require('./model');
const Estimate = require('../estimate/model');


// Create Vote
router.post('/', (req, res, next) => {
  let newVote = new Vote(req.body);

  Vote.listVotes({
    estimate_id: newVote.estimate_id,
    user_id: newVote.user_id
  }, (err, votes) => {
    if (err)
      throw err;

    if (votes) {
      return res.status(400).json({
        msg: 'Repeated Vote Request'
      });
    }

    Estimate.getEstimateById(newVote.estimate_id, (err, estimate) => {
      if (err)
        throw err;

      if (!estimate) {
        return res.status(404).json({
          msg: 'Estimate not found'
        });
      } else if (estimate.status != "active") {
        return res.status(400).json({
          msg: 'Estimate timeout!'
        });
      }

      Vote.createVote(newVote, (err, vote) => {
        if (err) {
          res.status(400).json({
            msg: err
          });
        }
      });

      Estimate.vote(estimate.id, vote.vote, err => {
        if (err)
          throw err;
      });

      res.status(201).json({
        msg: 'Vote registered',
        vote: newVote
      });
    });
  });
});

// Get Vote
router.get('/:voteId', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  Vote.getVoteById(req.params.voteId, (err, vote) => {
    if (err)
      throw err;

    if (!vote) {
      return res.status(404).json({
        success: false,
        msg: 'Vote not found'
      });
    }

    return res.status(200).json(vote);
  });
});

// List Votes
router.get('/', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  Vote.listVotes(req.query, (err, votes) => {
    if (err)
      throw err;

    if (!votes) {
      return res.status(404).json({
        msg: 'Vote not found'
      });
    }
    return res.status(200).json(votes);
  });
});

// Update Vote
router.put('/:voteId', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  Vote.updateVote(req.params.voteId, req.body, (err, updatedVote) => {
    if (err)
      throw err;

    if (!updatedVote) {
      return res.status(400).json({
        msg: 'Vote not updated!'
      });
    }
    return res.status(200).json(updatedVote);
  });
});

// Delete Vote
router.delete('/:voteId', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  Vote.updateVote(req.params.voteId, {
    deleted_at: new Date()
  }, (err, deletedVote) => {
    if (err)
      throw err;

    if (!deletedVote) {
      return res.status(400).json({
        msg: 'Vote not deleted!'
      });
    }
    return res.status(204).json();
  });
});

module.exports = router;

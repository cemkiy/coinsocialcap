const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('./model');

// Register
router.post('/', (req, res, next) => {
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  });

  User.addUser(newUser, (err, user) => {
    if (err) {
      res.status(400).json({
        msg: 'Failed to register user'
      });
    } else {
      res.status(201).json({
        msg: 'User registered',
        user: newUser
      });
    }
  })
});

// Login
router.post('/login', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;

      if (isMatch) {
        const token = jwt.sign({
          user
        }, config.SECRET_KEY, {
          expiresIn: 604800 // 1 week
        });

        return res.status(200).json({
          token: "Bearer " + token,
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        });
      } else {
        return res.status(400).json({
          msg: 'Wrong password'
        });
      }
    });
  });
});

// Profile
router.get('/me', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  res.status(200).json({
    user: req.user
  });
});

module.exports = router;

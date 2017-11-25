const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('./model');

// Create User
router.post('/', (req, res, next) => {
  let newUser = new User(req.body);

  User.addUser(newUser, (err, user) => {
    if (err) {
      res.status(400).json({
        msg: err
      });
    } else {
      res.status(201).json({
        msg: 'User registered',
        user: newUser
      });
    }
  })
});

// Get User
router.get('/:userId', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  User.getUserById(req.params.userId, (err, user) => {
    if (err)
      throw err;

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    return res.status(200).json(user);
  });
});

// List Users
router.get('/', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  User.listUsers(req.query, (err, users) => {
    if (err)
      throw err;

    if (!users) {
      return res.status(404).json({
        msg: 'User not found'
      });
    }
    return res.status(200).json(users);
  });
});

// Update User
router.put('/:userId', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  User.updateUser(req.params.userId, req.body, (err, updatedUser) => {
    if (err)
      throw err;

    if (!updatedUser) {
      return res.status(400).json({
        msg: 'User not updated!'
      });
    }
    return res.status(200).json(updatedUser);
  });
});

// Login
router.post('/login', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.getUserByEmail(email, (err, user) => {
    if (err)
      throw err;

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err)
        throw err;

      if (isMatch) {
        const token = jwt.sign({
          user
        }, config.SECRET_KEY, {
          expiresIn: 604800 // 1 week
        });

        return res.status(201).json({
          token: token,
        });
      } else {
        return res.status(400).json({
          msg: 'Wrong password'
        });
      }
    });
  });
});


module.exports = router;

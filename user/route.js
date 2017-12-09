const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Set = require('set')
const config = require('../config');
const User = require('./model');


// Create User
router.post('/', (req, res, next) => {
  let newUser = new User(req.body);

  User.createUser(newUser, (err, user) => {
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

// Delete User
router.delete('/:userId', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  User.updateUser(req.params.userId, {
    deleted_at: new Date()
  }, (err, deletedUser) => {
    if (err)
      throw err;

    if (!deletedUser) {
      return res.status(400).json({
        msg: 'User not deleted!'
      });
    }
    return res.status(204).json();
  });
});

// Follow User
router.put('/:userId/friends/:friendId', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  User.getUserById(req.params.friendId, (err, user) => {
    if (err)
      throw err;

    if (!user) {
      return res.status(404).json({
        msg: 'User not found'
      });
    }

    following = new Set(req.user.following);
    following.add(user.id);
    followers = new Set(user.followers);
    followers.add(req.user.id);
    User.updateUser(req.user.id, {
      following: following.get()
    }, (err, updatedUser) => {
      if (err)
        throw err;

      if (!updatedUser) {
        return res.status(400).json({
          msg: 'User not updated!'
        });
      }

      User.updateUser(user.id, {
        followers: followers.get()
      }, (err, updatedOtherUser) => {
        if (err)
          throw err;

        if (!updatedOtherUser) {
          return res.status(400).json({
            msg: 'User not updated!'
          });
        }
        return res.status(200).json(updatedUser);
      });
    });
  });
});

// Unfollow User
router.delete('/:userId/friends/:friendId', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  User.getUserById(req.params.friendId, (err, user) => {
    if (err)
      throw err;

    if (!user) {
      return res.status(404).json({
        msg: 'User not found'
      });
    }

    following = new Set(req.user.following);
    following.remove(user.id);
    followers = new Set(user.followers);
    followers.remove(req.user.id);
    User.updateUser(req.user.id, {
      following: following.get()
    }, (err, updatedUser) => {
      if (err)
        throw err;

      if (!updatedUser) {
        return res.status(400).json({
          msg: 'User not updated!'
        });
      }

      User.updateUser(user.id, {
        followers: followers.get()
      }, (err, updatedOtherUser) => {
        if (err)
          throw err;

        if (!updatedOtherUser) {
          return res.status(400).json({
            msg: 'User not updated!'
          });
        }
        return res.status(200).json(updatedUser);
      });
    });
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

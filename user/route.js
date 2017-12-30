const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Set = require('set')
const config = require('../config');
const mustache = require('mustache');
const fs = require('fs');
const mailgun = require('mailgun.js');
const User = require('./model');

var mg = mailgun.client({
  username: 'api',
  key: config.MAILGUN_API_KEY
});
var path = require('path');


// Create User
router.post('/', (req, res, next) => {
  let newUser = new User(req.body);

  User.createUser(newUser, (err, user) => {
    if (err) {
      res.status(400).json({
        msg: err
      });
    } else {
      // send e-mail
      module.exports.getUserById = function(id, callback) {
        filePath = path.join(__dirname, '../email_templates/basic.html');
        fs.readFile(filePath, {
          encoding: 'utf-8'
        }, function(err, template_html) {
          if (!err) {
            var view = {
              message: "Please confirm your email with click below button.",
              button_text: "Confirm Your Email"
            }
            var output = mustache.render(template_html, view);
            mg.messages.create(config.MAILGUN_SANDBOX, {
              from: "CoinSocialCap <info@coinsocialcap.com>",
              to: [user.email],
              subject: "Confirmation Account",
              html: output
            })
              .then(msg => console.log(msg)) // logs response data
              .catch(err => console.log(err)); // logs any error
          } else {
            console.log(err);
          }
        });

        res.status(201).json({
          msg: 'User registered',
          user: newUser
        });
      }
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

// Change Password
router.put('/:userId/change_password', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  if (req.body.password != req.body.repeat_password) {
    return res.status(400).json({
      msg: 'Password arent same!'
    });
  }

  User.changePassword(req.user, req.body.password, (err, user) => {
    if (err)
      throw err;

    return res.status(200).json(user);
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

    if (!user.verfied) {
      return res.status(400).json({
        msg: 'User not verified'
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

const jwt = require('jwt-simple');
const config = require('../config');
const User = require('../models/user');

function tokenForUser(user) {
  const timestamp = new Date().getTime();

  let userToken = jwt.encode({ sub: user.id, iat: timestamp }, config.secret);

  return userToken;
}

exports.signin = function(req, res, next) {
  //User has already have username and password, we have to supply token
  res.send({ token: tokenForUser(req.user) });
};

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;

  if (!email || !password || !username) {
    return res
      .status(422)
      .send({ error: 'You must provide email,username and password' });
  }

  //See if user exists with given email
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) {
      return next(err);
    }
    //If a user with email does exist display Error
    if (existingUser) {
      return res.status(422).send({ error: 'Email is in use' });
    }
    //If a user doesnot exist create a user record
    const user = new User({
      email: email,
      password: password
    });
    user.save(function(err) {
      if (err) {
        return next(err);
      }
    });
    //Respond to request indicating user created
    res.json({ token: tokenForUser(user) });
  });
};

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Authentication = require('./controllers/authentication');
const passportService = require('./services/passport');
const passport = require('passport');
const morgan = require('morgan');
const { UserPlan } = require('./models/userPlan');
const jwtDecode = require('jwt-decode');
const jwt = require('jwt-simple');
const secret = 'janaganamana';

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });
function getuserid(token) {
  let payload = token.split('.')[1];
  console.log('app.get: payload=' + payload);
  payload.replace('-', '+');
  payload.replace('_', '/');
  let userinfo = JSON.parse(Buffer.from(payload, 'base64'));
  console.log('getuserid: userid=' + userinfo.sub);
  return userinfo;
}

module.exports = function(app) {
  app.use(morgan('common'));

  app.get('/', requireAuth, function(req, res) {
    res.send({ hi: 'there' });
  });
  app.post('/signin', requireSignin, Authentication.signin);
  app.post('/signup', Authentication.signup);

  app.get('/userplans', requireAuth, (req, res) => {
    let userinfo = getuserid(req.headers.authorization);
    console.log('app.get: userid=' + userinfo.sub);

    UserPlan.find({ user: userinfo.sub })
      .then(userplans => {
        res.json(userplans.map(plan => plan.serialize()));
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'something went terribly wrong' });
      });
  });

  app.get('/userplans/:id', requireAuth, (req, res) => {
    UserPlan.findById(req.params.id)
      .then(userplan => res.json(userplan.serialize()))
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'something went horribly awry' });
      });
  });

  app.post('/userplans/add', requireAuth, (req, res) => {
    const requiredFields = ['title', 'destination'];
    let userinfo = getuserid(req.headers.authorization);
    console.log('app.get: userid=' + userinfo.sub);
    //'token';
    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (!(field in req.body)) {
        const message = `Missing \`${field}\` in request body`;
        console.error(message);
        return res.status(400).send(message);
      }
    }

    UserPlan.create({
      title: req.body.title,
      destination: req.body.destination,
      packinglist: req.body.packinglist,
      tripnotes: req.body.tripnotes,
      feedback: req.body.feedback,
      user: userinfo.sub
    })
      .then(userplan => res.status(201).json(userplan.serialize()))
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
      });
  });

  app.put('/userplans/:id', requireAuth, (req, res) => {
    console.log(req.params.id);
    console.log(req.body.id);

    let userinfo = getuserid(req.headers.authorization);
    console.log('app.get: userid=' + userinfo.sub);

    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
      res.status(400).json({
        error: 'Request path id and request body id values must match'
      });
    }

    const updated = {};
    const updateableFields = [
      'title',
      'destination',
      'packinglist',
      'tripnotes',
      'feedback'
    ];
    updateableFields.forEach(field => {
      if (field in req.body) {
        updated[field] = req.body[field];
      }
    });

    UserPlan.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
      .then(updated => res.status(204).end())
      .catch(err => res.status(500).json({ message: 'Something went wrong' }));
  });

  app.delete('/userplans/:id', requireAuth, (req, res) => {
    UserPlan.findByIdAndRemove(req.params.id).then(() => {
      console.log(`Deleted user plan with id \`${req.params.id}\``);
      res.status(204).end();
    });
  });
};

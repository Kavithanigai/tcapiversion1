'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
const { TEST_DATABASE_URL } = require('../config/database');
const faker = require('faker');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { app, runServer, closeServer } = require('../index');
const { User } = require('../models/user');
const { userPlan } = require('../models/userPlan');

const testUsers = [];

function seedUsers() {
  for (let i = 0; i < 10; i++) {
    testUsers.push(createUser());
  }
  return User.insertMany(testUsers);
}

function createUser() {
  const user = {
    name: faker.name.firstName(),
    email: faker.internet.email(),
    password: 'password'
  };
  return user;
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

function makeTravelerIdList() {
  const travelerIdList = testUsers.map(testUsers => ObjectId(user._id));
  return travelerIdList;
}

describe('UserPlan API', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  beforeEach(function() {
    return;
  });
  afterEach(function() {
    return;
  });
  after(function() {
    //return tearDownDb()
    return closeServer();
  });

  describe('New User', function() {
    let newUser = createUser();
    const agent = chai.request.agent(app);
    let title;
    let destination;

    it('should sign up', function() {
      return agent
        .post('/signup')
        .send(newUser)
        .then(
          function(res) {
            newUser._id = res.body._id;
            newUser.email = res.body.email;
            newUser.password = res.body.password;
          },
          err => console.log('errormessage', err.message)
        );
    });
    it('should sign in', function() {
      return agent
        .post('/signin')
        .send({
          email: newUser.email,
          password: newUser.password
        })
        .then(function(res) {
          expect('Location', '/userplan/existing');
        });
    });

    it('should add a user plan', function() {
      return agent
        .post('/userplan/add')
        .send({
          Title: 'New Test Trip Plan',
          destination: 'Ohio, CL',
          user: 'users.id'
        })
        .then(function(res) {
          expect('Location', '/userplan/existing');
        });
    });

    it('should remove a riddle', function() {
      return agent
        .delete(`/:{users.id}`)
        .send([])
        .then(function(res) {
          expect(res).to.have.status(404);
          expect('Location', '/userplan/existing');
        });
    });
  });
});

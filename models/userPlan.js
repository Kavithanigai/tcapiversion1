'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

// Create Schema
const UserPlanSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  packinglist: {
    type: String
  },
  destination: {
    type: String,
    required: true
  },
  tripnotes: {
    type: String
  },
  feedback: {
    type: String
  },
  user: {
    type: String,
    required: true
  }
  //,
  // token:{
  //   type: String,
  //   required: true
  // }
});

UserPlanSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    destination: this.destination,
    packinglist: this.packinglist,
    tripnotes: this.tripnotes,
    feedback: this.feedback,
    token: this.token,
    user: this.user
  };
};

const UserPlan = mongoose.model('UserPlan', UserPlanSchema);

module.exports = { UserPlan };

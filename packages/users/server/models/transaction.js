'use strict';

var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    crypto    = require('crypto'),
          _   = require('lodash');

var UserSchema = new Schema({
  date_time: {
    type: String,
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required true,
  },
  failed: {
    type: Boolean,
    required true,
  }
});


'use strict';

var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    ObjectId  = Schema.ObjectId,
    crypto    = require('crypto'),
          _   = require('lodash');

var TransactionSchema = new Schema({
  date_time: {
    type: Date,
    required: true,
  },
  sender: {
    type: ObjectId, 
    ref: 'User',
    required: true,
  },
  receiver: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  failed: {
    type: Boolean,
    required: true,
  }
});

mongoose.model('Transaction', TransactionSchema);

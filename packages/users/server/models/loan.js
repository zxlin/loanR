'use strict';

var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    ObjectId  = Schema.ObjectId,
    crypto    = require('crypto'),
          _   = require('lodash');

var states = {
  values : [
    'Open',
    'Contracted',
    'Closed'
  ],
  message : 'enum validator failed for path `{PATH}` with value `{VALUE}`'
};

var LoanSchema = new Schema({
  lender: {
    type : ObjectId,
    ref : 'User',
    required : true
  },
  borrower: {
    type : ObjectId,
    ref : 'User',
    required : true
  },
  monthly_fee: {
    type: Number,
    required: true
  },
  amount_left: {
    type: Number,
    required: true
  },
  monthly_fee_left_to_pay_this_month: {
    type: Number,
    required: true
  },
  pay_day: {
    type: Number,
    required: true
  },
  missed_last_payment: {
    type: Boolean,
    required: true 
  },
  estimated_time_left: {
    type: Number,
    required: true
  },
  states: {
    type: String,
    enum: states,
    required: true
  }
  // need to complete
});

mongoose.model('Loan', LoanSchema);

'use strict';

var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    crypto    = require('crypto'),
          _   = require('lodash');


var LoanSchema = new Schema({
  lender: {},
  borrower: {},
  monthly_fee: {
    type: Number,
    required: true
  },
  amount_left_total: {
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
  }
  // need to complete
});

mongoose.model('Loan', LoanSchema);

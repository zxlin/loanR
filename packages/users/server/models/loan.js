'use strict';

var UserSchema = new Schema({
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
    type: boolean,
    required: true 
  },
  estimated_time_left: {
    type: Number,
    required: true
  }
  // need to complete
});



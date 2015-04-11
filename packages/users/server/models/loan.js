'use strict';

var UserSchema = new Schema({
  lender: {},
  borrower: {},
  monthly_fee: int,
  amount_left_total: int,
  monthly_fee_left_to_pay_this_month: int,
  pay_day: int,
  // need to complete
});



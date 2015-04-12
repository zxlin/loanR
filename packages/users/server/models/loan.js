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
  monthly_bill: {
    type: Number,
    required: true
  },
  original_amount : {
    type : Number,
    required : true
  },
  amount_left: {
    type: Number,
    required: true
  },
  interest : {
    type : Number,
    required : true
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
  transactions  : [
    {
      type : ObjectId,
      ref : 'Transaction',
    }
  ],
  estimated_time_left: {
    type: Number,
    required: true
  },
  /*
  state: {
    type: String,
    enum: states,
    required: true
  }
  */
  // need to complete
});

var expected_time = function(amount, interest, monthly) {
  for (var t = 1; t <= 10000; t++) {
    amount -= monthly;
    amount *= (1 + interest);
    if (amount <= 0) {
      return t;
    }
  }
  return Infinity;
};

LoanSchema.statics = {
  add_payment : function(id, sender, receiver, amount, cb) {
    var Loan = mongoose.model('Loan');
    var Transaction = mongoose.model('Transaction');

    async.waterfall([
      function(d) {
        var trans = new Transaction({
          sender : sender,
          receiver : receiver,
          amount : amount
        });
        trans.save(function(err) {
          d(err, trans);
        });
      },
      function(trans, d) {
        Load.update(
          { _id : id },
          {
            $push : {
              transactions : trans._id
            }
          }
        ).exec(function(err) {
          d(err);
        });
      }
    ], function(err) {
      cb(err);
    });
  },

  estimate_time : function(id, cb) {
    var Loan = mongoose.model('Loan');

    async.waterfall([
      function(d) {
        Loan.findOne({
          _id : id
        }).exec(function(err, loan) {
          d(err, loan);
        });
      },
      function(loan, d) {
        Loan.update(
          { _id : loan._id },
          { 
            $set : {
              estimated_time_left : expected_time(loan.amount_left, loan.interest, loan.monthly_bill)
            }
          }
        ).exec(function(err) {
          d(err);
        });
      },
    ], function(err) {
      cb(err);
    });
  }
}

mongoose.model('Loan', LoanSchema);

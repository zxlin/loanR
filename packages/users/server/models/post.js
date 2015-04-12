'use strict';

var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    ObjectId  = Schema.ObjectId,
    crypto    = require('crypto'),
          _   = require('lodash');

var roles = {
  values : [
    'Lender',
    'Borrower'
  ],
  message : 'enum validator failed for path `{PATH}` with value `{VALUE}`'
};


var PostSchema = new Schema({
  poster: {
    type : ObjectId,
    required : true,
    ref : 'User'
  },
  amount: {
    type: Number,
    required: true
  },
  interest: {
    type: Number,
    required: true
  },
  monthly_bill: {
    type: Number,
    required: true
  },
  estimated_completion: {
    type: Number,
    required: true
  }, 
  role : {
    type : String,
    enum : roles,
    required : true
  },
  desired_rating: {
    type: Number,
    required: false,
    default : 0
  }
});

PostSchema.statics = { 
};

mongoose.model('Post', PostSchema);

var mongoose = require('mongoose');
var async = require('async');
var config = require('meanio').loadConfig();
var ret = { };
var app;

ret.createPost = function(data) {
  var socket = this;
  var user = socket.user;

  var Post = mongoose.model('Post');
  
  var post = new Post({
    poster : user._id,
    amount : data.amount,
    interest : data.interest,
    monthly_bill : data.monthly_bill,
    estimated_completion : 0, //TODO Save
    desired_rating : data.desired_rating,
    lender : user.user_role
  });
  post.save(function(err) {
    if (err) {
      socket.emit('createPost', false);
    } else {
      socket.emit('createPost', true);
    }
  });
};

ret.takeLoan = function(data) {
  var socket = this;
  var user = socket.user;

  var postId = data.postId;

  var Loan = mongoose.model('Loan');
  var Post = mongoose.model('Post');

  async.waterfall([
    function(d) {
      //Load post object
      Post.findOne({
        _id : postId
      }).exec(function(err, post) {
        d(err, post);
      });
    },
    function(post, d) {
      var lender;
      var borrower;
      
      if (post.role === 'Lender') {
        lender = post.poster;
        borrower = user._id;
      } else {
        lender = user._id;
        borrower = post.poster;
      }

      var loan = new Load({
        lender : lender,
        borrower : borrower,
        monthly_fee : post.monthly_fee,
        amount_left : post.amount,
        monthly_fee_left_to_pay_this_month : post.monthly_fee,
        pay_day : (new Date()).getDay(),
        missed_last_payment : false,
        estimated_time_left: 0 //TODO use func
      });
      loan.save(function(err) {
        d(err, loan);
      });
    },
    function(loan) {
      Post.remove({
        _id : postId
      }).exec(c);
    }
  ], function(err, result) {
    if (err) {
      console.error(err);
      socket.emit('takeLoan', false);
    } else {
      socket.emit('takeLoan', true);
    }
  });
};

ret.query = function(data) {
  var socket = this;
  
  var Post = mongoose.model('Post');
  Post.find({
    amount : {
      $gte : data.min_amount,
      $lte : data.max_amount
    },
    interest : {
      $gte : data.min_interest,
      $lte : data.max_amount
    },
    monthly_bill : {
      $gte : data.min_monthly,
      $lte : data.max_monthly
    }
  }).limit(20).exec(function(err, posts) {
    if (err) {
      console.error(err);
    }
    socket.emit('query', posts);
  });
};

ret.loadPosts = function(data) {
  var socket = this;

  var Post = mongoose.model('Post');
  Post.find({}).exec(function(err, posts) {
    socket.emit('loadPosts', posts);
  });
};
/*
// get open loans
ret.openLoans = function() {
  var socket = this;
  var user = socket.user;
  var Loan = mongoose.model('Loan');
  Loan.find({something here later}).exec(function(err, loans) {
    if (err) {
      console.error(err);
    }
    socket.emit('openLoans', loans);
  });
  // query all loans where user is the lender or borrower
  // add all to return array
};
// get contracted loans
// get closed loans
TODO
*/

ret.loadTransactions = function(data) {
  var socket = this;

  var Transaction = mongoose.model('Transaction');
  Transaction.find({}).exec(function(err, transactions) {
    socket.emit('loadTransactions', transactions);
  });
};

module.exports = function(a) {
  app = a;
  return ret;
};

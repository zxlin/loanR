var mongoose = require('mongoose');
var async = require('async');
var config = require('meanio').loadConfig();
var ret = { };
var app;

/* Create a post
 * Data hash:
 * amount Number, 
 * interest Number, 
 * mountly_bill number,
 * desired_rating Number,
 * user_role Enum
 */
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

/* select a Loan
 * Data: postId
 */
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

      var loan = new Loan({
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

/* Filter posts/ search posts
 * Data hash:
 * min_amount Number, 
 * max_amount Number, 
 * min_interest number,
 * max_interest Number,
 * min_monthly Number,
 * max_mountly Number,
 */
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
      $lte : data.max_interest
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

// get open loans
ret.openLoans = function() {
  var socket = this;
  var user = socket.user;
  var Loan = mongoose.model('Loan');
  Loan.find({
    $and: [{
      state : 'Open'
    }, {
      $or: [{
        lender : user
      }, {
        borrower : user
      }]
    }]
  }).or().exec(function(err, loans) {
    if (err) {
      console.error(err);
    }
    socket.emit('openLoans', loans);
  });
  // query all loans where user is the lender or borrower
  // add all to return array
};
// get contracted loans
ret.contractedLoans = function() {
  var socket = this;
  var user = socket.user;
  var Loan = mongoose.model('Loan');
  Loan.find({
    $and: [{
      state : 'Contracted'
    }, {
      $or: [{
        lender : user
      }, {
        borrower : user
      }]
    }]
  }).or().exec(function(err, loans) {
    if (err) {
      console.error(err);
    }
    socket.emit('contractedLoans', loans);
  });
  // query all loans where user is the lender or borrower
  // add all to return array
};

// get closed loans
ret.closedLoans = function() {
  var socket = this;
  var user = socket.user;
  var Loan = mongoose.model('Loan');
  Loan.find({
    $and: [{
      state : 'Closed'
    }, {
      $or: [{
        lender : user
      }, {
        borrower : user
      }]
    }]
  }).or().exec(function(err, loans) {
    if (err) {
      console.error(err);
    }
    socket.emit('closedLoans', loans);
  });
  // query all loans where user is the lender or borrower
  // add all to return array
};

/* Create a transaction 
 * Data hash:
 * date_time Date, 
 * sender userid, 
 * receiver userid, 
 * amount Number
 */
ret.createTransaction = function(data) {
  var socket = this;

  var Transaction = mongoose.model('Transaction');

  var transaction = new Transaction({
    date_time : data.date_time,
    sender : data.sender,
    receiver : data.receiver,
    amount : data.amount
  });
  transaction.save(function(err) {
    if (err) {
      socket.emit('createTransaction', false);
    } else {
      socket.emit('createTransaction', true);
    }
  });
};

// Get all transactions
ret.loadTransactions = function(data) {
  var socket = this;

  var Transaction = mongoose.model('Transaction');
  Transaction.find({}).exec(function(err, transactions) {
    socket.emit('loadTransactions', transactions);
  });
};

// Get a specific user's transactions
ret.userTransactions = function(data) {
  var socket = this;
  var user = socket.user;

  var Transaction = mongoose.model('Transaction');
  Transaction.find({
    $or : [
      {sender : user._id}, 
      {receiver : user._id}
  ]}).exec(function(err, transactions) {
    socket.emit('userTransactions', transactions);
  });
};

module.exports = function(a) {
  app = a;
  return ret;
};

find_person = function(first_name, last_name){
  var cap_id;  

  //Finds users based off of name put in the box and gets their ID
  $.get( "http://api.reimaginebanking.com/customers/?key=ENT0a1ef41ece34435feeffd062b38dd917", function( data ) {
    var x = 0;
      while (x < data.length) {
        var entry = data[x];
        //alert(document.getElementById("fn").value)
        if ((first_name === data[x].first_name) && 
            (last_name === data[x].last_name)){
          cap_id = data[x]._id;
          break;
        } else {
          //alert("ERROR: USER NOT FOUND!")
        }
        //console.log(entry);
      x++;
      }
    alert( "Load was performed." );
    find_acct(cap_id)   
  });  
}

find_acct = function(cap_id){
  //Finds accounts and balances
  var balance;
  var url_acct = "http://api.reimaginebanking.com/customers/" + cap_id + "/accounts/?key=ENT0a1ef41ece34435feeffd062b38dd917";
  $.get(url_acct, function( data ) {
    var x = 0;
    while (x < data.length) {
      var entry = data[x];
      /* balance = balance + entry.balance;*/
      cap_id = entry.customer;
      x++;
      break;
    }
    if (entry.balance <= 1000){
      find_bills(0, cap_id)
    } else if ((entry.balance <= 10000) && (entry.balance > 1000)) {
      find_bills(10, cap_id)
    } else if ((entry.balance <= 100000) && (entry.balance > 10000)) {
      find_bills(20, cap_id)
    } else if ((entry.balance <= 1000000) && (entry.balance > 100000)) {
      find_bills(30, cap_id)
    } else if ((entry.balance <= 10000000) && (entry.balance > 1000000)) {
      find_bills(40, cap_id)
    } else  {
      find_bills(50, cap_id)
    }
  });    
}

//Finds bills and debts
find_bills = function(score, cap_id){
  var debt;
  var url_acct = "http://api.reimaginebanking.com/customers/" + cap_id + "/bills/?key=ENT0a1ef41ece34435feeffd062b38dd917";
  $.get(url_acct, function( data ) {
    var x = 0;
    while (x < data.length) {
      var entry = data[x];
      /* debt += data[x].payment_amount;*/
      debt = entry.payment_amount;
      x++;
    }

    if (data.length == 0){
      debt = 0;
    }

    if (debt <= 1000){
      find_history(score-0, cap_id)
    } else if ((debt <= 10000) && (debt > 1000)) {
      find_history(score-10, cap_id)
    } else if ((debt <= 100000) && (debt > 10000)) {
      find_history(score-20, cap_id)
    } else if ((debt <= 1000000) && (debt > 100000)) {
      find_history(score-30, cap_id)
    } else if ((debt <= 10000000) && (debt > 1000000)) {
      find_history(score-40, cap_id)
    } else  {
      find_history(score-50, cap_id)
    }
  }); 
}

find_history = function(score, cap_id){
  alert(cap_id + " has score of: " + score);
}


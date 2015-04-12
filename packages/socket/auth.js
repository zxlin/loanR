var mongoose = require('mongoose');
var async = require('async');
var config = require('meanio').loadConfig();
var ret = { };
var app;

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

  var Post = mongoose.model('Post');

  Post.create({
    poster : data.user,
    amount : data.amount,
    interest : data.interest,
    monthly_bill : data.monthly_bill,
    estimated_completion : expected_time(data.amount, data.interest, data.monthly_bill), 
    desired_rating : data.rating,
    role : data.user_role
  }, socket, function(err) {
    if (err) {
      console.log(err);
    }
    socket.emit('createPost', err);
  });
};

ret.deletePost = function(post) {
  var socket = this;

  var Post = mongoose.model('Post');

  Post.remove(
    { _id : post }
  ).exec(function(err) {
    if (err) {
      console.log(err);
    }
    socket.emit('deletePost', {
      id : post,
      error : err 
    });
  });
};

/* take a Loan
 * Data: postId
 */
ret.takeLoan = function(data) {
  var socket = this;

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
        borrower = data.user;
      } else {
        lender = data.user;
        borrower = post.poster;
      }

      var loan = new Loan({
        lender : lender,
        borrower : borrower,
        monthly_bill : post.monthly_bill,
        amount_left : post.amount,
        original_amount : post.amount,
        interest : post.interest,
        monthly_fee_left_to_pay_this_month : post.monthly_bill,
        pay_day : (new Date()).getDate(),
        missed_last_payment : false,
        estimated_time_left: expected_time(post.amount, post.interest, post.monthly_bill)
      });
      loan.save(function(err) {
        d(err, loan);
      });
    },
    function(loan, d) {
      Post.del(postId, socket, d);
    }
  ], function(err, result) {
    if (err) {
      console.error(err);
    }
    socket.emit('takeLoan', {
      id : postId,
      error : err 
    });
  });
};

/* Filter posts/ search posts
 * Data hash:
 * amount Number, 
 * interest number,
 * monthly Number,
 */
ret.query = function(data) {
  var socket = this;
  
  var Post = mongoose.model('Post');
  Post.find({
    amount : {
      $gte : data.amount * .8,
      $lte : data.amount * 1.2
    },
    interest : {
      $gte : data.interest - .02,
      $lte : data.interest + .02
    },
    monthly_bill : {
      $gte : data.monthly * .8,
      $lte : data.monthly * 1.2
    },
    role : data.role
  }).limit(20).exec(function(err, posts) {
    if (err) {
      console.error(err);
    }
    socket.emit('query', posts);
  });
};

//Get all posts of a type
ret.loadPosts = function(data) {
  var socket = this;

  var Post = mongoose.model('Post');
  Post.find({
    role : data  
  }).exec(function(err, posts) {
    socket.emit('loadPosts', posts);
  });
};

//Get all posts from a user
ret.loadUserPosts = function(user) {
  var socket = this;

  var Post = mongoose.model('Post');
  Post.find({
    poster : user
  }).exec(function(err, posts) {
    socket.emit('loadUserPosts', posts);
  });
};

// get open loans
ret.openLoans = function(user) {
  var socket = this;
  
  var Loan = mongoose.model('Loan');
  Loan.find({
    $and: [{
      amount_left : {
        $ne : 0
      }
    }, {
      $or: [{
        lender : user
      }, {
        borrower : user
      }]
    }]
  }).exec(function(err, loans) {
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

var find_person = function(first_name, last_name, cb){
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
    //alert( "Load was performed." );
    cb(null, cap_id);  
  });  
};

var find_acct = function(cap_id, cb){
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
      cb(null, 0, cap_id)
    } else if ((entry.balance <= 10000) && (entry.balance > 1000)) {
      cb(null, 10, cap_id)
    } else if ((entry.balance <= 100000) && (entry.balance > 10000)) {
      cb(null, 20, cap_id)
    } else if ((entry.balance <= 1000000) && (entry.balance > 100000)) {
      cb(null, 30, cap_id)
    } else if ((entry.balance <= 10000000) && (entry.balance > 1000000)) {
      cb(null, 40, cap_id)
    } else  {
      cb(null, 50, cap_id)
    }
  });    
};

//Finds bills and debts
var find_bills = function(score, cap_id, cb){
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
      cb(null, score-0, cap_id)
    } else if ((debt <= 10000) && (debt > 1000)) {
      cb(null, score-10, cap_id)
    } else if ((debt <= 100000) && (debt > 10000)) {
      cb(null, score-20, cap_id)
    } else if ((debt <= 1000000) && (debt > 100000)) {
      cb(null, score-30, cap_id)
    } else if ((debt <= 10000000) && (debt > 1000000)) {
      cb(null, score-40, cap_id)
    } else  {
      cb(null, score-50, cap_id)
    }
  }); 
};

var find_history = function(score, cap_id, cb){
  //alert(cap_id + " has score of: " + score);
  cb(null, score);
};

/*Payer account ID ("5516c07ba520e0066c9ac6ec") will pay money into Payee acount ID("5516c07ba520e0066c9aca3d")*/
var make_payment = function(transaction_id, payment_amount, payer_id, payee_id, account_into_id){   
    url = "http://api.reimaginebanking.com/accounts/" + payer_id.toString() + "/transactions/?key=CUST0a1ef41ece34435feeffd062b38dd917";
    var dataObj = JSON.stringify({"transaction_type": "cash",  "payee_id": payee_id.toString(),  "amount": payment_amount});
    console.log(dataObj);
      $.ajax({          
          type: "POST",
          url:  "http://api.reimaginebanking.com/accounts/" + payer_id.toString() + "/transactions/?key=CUST0a1ef41ece34435feeffd062b38dd917",
          data:  dataObj,
          contentType: 'application/json',
          success: function(data, textStatus, jqXHR)
          {
            console.log("SUCCESS");
              console.log(data);
          },
          error: function (jqXHR, textStatus, errorThrown)
          {
          console.log("ERROR");
          console.log(errorThrown);
          console.log(jqXHR.responseText);
          console.log(textStatus)
          }
    });

};

ret.creditScore = function() {
  var socket = this;
  var user = socket.user;

  var name = user.name;
  var names = name.split(' '); // split first and last name
  var first = '';
  var last = '';
  if (names.length > 0) {
    first = names[0];
  }
  if (names.length > 1) {
    last = names[1];
  }
  
/*
find_person(first,last,cb)
find_acct(cap_id, cb)
find_bills(score, cap_id)
find_history(score, cap_id)
*/
  async.waterfall([
    find_person(first, last, cb),
    find_acct(cap_id, cb),
    find_bills(score, cap_id, cb),
    find_history(score, cap_id)
  ], function(err, result){
    if (err) {
      console.log(err);
    } else {
      socket.emit('creditScore', result);
    } 
  });
};

module.exports = function(a) {
  app = a;
  return ret;
};


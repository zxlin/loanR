var mongoose = require('mongoose');
var async = require('async');
var config = require('meanio').loadConfig();
var ret = { };
var app;
var http = require('http');

ret.createAccount = function(data) {
  var socket = this;
  //Do validation? Maybe, do we need it?

  var User = mongoose.model('User');

  var firstName = data.name.split(' ')[0];
  var lastName = data.name.split(' ')[1];
  var balance = 0;

  async.waterfall([
    function(d) {
      http.get('http://api.reimaginebanking.com/customers/?key=ENT0a1ef41ece34435feeffd062b38dd917', function(res) {
        var str = '';
        res.on('data', function(chunk) {
          str += chunk;
        });
        res.on('end', function() {
          var data = JSON.parse(str);
          var x = 0 ;
          var found = false
          while (x < data.length) {
            var entry = data[x];
            if (firstName === entry.first_name && lastName === entry.last_name) {
              found = true;
              d(null, entry._id);
              break;
            }
            x++;
          }
          if (!found) {
            d('Account does not exist');
          }
        });
      });
    },
    function(cap_id, d) {
      http.get('http://api.reimaginebanking.com/customers/' + cap_id + '/accounts/?key=ENT0a1ef41ece34435feeffd062b38dd917', function(res) {
        var str = '';
        res.on('data', function(chunk) {
          str += chunk;
        });
        res.on('end', function() {
          var data = JSON.parse(str);
          var x = data.length;
          while (x--) {
            balance += data[x].balance;
          }
          d(null, (Math.log(balance) / Math.LN10) * 150, cap_id);
        });
      });
    },
    function(score, cap_id, d) {
      http.get('http://api.reimaginebanking.com/customers/' + cap_id + '/bills/?key=ENT0a1ef41ece34435feeffd062b38dd917', function(res) {
        var str = '';
        res.on('data', function(chunk) {
          str += chunk;
        });
        res.on('end', function() {
          var data = JSON.parse(str);
          var x = data.length;
          var debt = 0;
          while (x--) {
            debt += data[x].payment_amount;
          }
          d(null, score - Math.max(0, (Math.log(debt) / Math.LN10) * 100));
        });
      });
    }
  ], function(err, rating) {
    if (err) {
      console.log(err);
      data.balance = 1000;
      data.rating = 728;
    } else {
      data.balance = balance;
      data.rating = Math.ceil(Math.min(1000, Math.max(0, rating)));
    }
  
    var user = new User(data);
    user.save(function(err) {
      if (err) {
        console.log(err);
        socket.emit('createAccount', false);
      } else {
        socket.emit('createAccount', true);
      }
    });
    //console.log(balance);
    //socket.emit('createAccount', false);
  });

  /*




  */
};

module.exports = function(a) {
  app = a;
  return ret;
};

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
          while (x < data.length) {
            var entry = data[x];
            if (firstName === entry.first_name && lastName === entry.last_name) {
              d(null, entry._id);
              break;
            }
            x++;
          }
          d('Account does not exist');
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
          var balance = 0;
          while (x--) {
            balance += data[x].balance;
          }
          d(null, balance);
        });
      });
    }
  ], function(err, balance) {
    if (err) {
      data.balance = 1000;
    } else {
      data.balance = balance;
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

  data.rating = 0; //TODO, create function for this


  */
};

module.exports = function(a) {
  app = a;
  return ret;
};

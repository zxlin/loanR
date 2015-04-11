var mongoose = require('mongoose');
var async = require('async');
var config = require('meanio').loadConfig();
var ret = { };
var app;

ret.createAccount = function(data) {
  var socket = this;
  //Do validation? Maybe, do we need it?

  var User = mongoose.model('User');

  data.rating = 0; //TODO, create function for this

  var user = new User(data);
  user.save(function(err) {
    if (err) {
      console.log(err);
      socket.emit('createAccount', false);
    } else {
      socket.emit('createAccount', true);
    }
  });
};

module.exports = function(a) {
  app = a;
  return ret;
};

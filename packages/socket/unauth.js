var mongoose = require('mongoose');
var async = require('async');
var config = require('meanio').loadConfig();
var ret = { };
var app;

ret.createAccount = function(data) {
  var socket = this;
  //Do validation? Maybe, do we need it?
  var user = new User(data);
  user.save(function(err) {
    if (err) {
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

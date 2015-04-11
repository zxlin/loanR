var mongoose = require('mongoose');
var async = require('async');
var config = require('meanio').loadConfig();
var ret = { };
var app;

/*
ret.createAccount = function(data) {
  var socket = this;
};
*/

module.exports = function(a) {
  app = a;
  return ret;
};

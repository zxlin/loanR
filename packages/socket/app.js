'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Socket = new Module('socket');

var cookieParser = require('cookie-parser');
var passportSocketIo = require('passport.socketio');
var config = require('meanio').loadConfig();

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Socket.register(function(app, auth, database, http) {
  var unauth = require('./unauth')(app, auth, database);
  var userauth = require('./auth')(app, auth, database); 

  var io = require('socket.io')(http);
  io.set('authorization', passportSocketIo.authorize({
    cookieParser: cookieParser,
    secret: config.sessionSecret,
    key: config.sessionName,
    store: app.session_storage,
    fail: function(data, message, err, accept) {
      accept(null, !err);
    }
  }));

  io.on('connection', (function() {
    return function(socket) {
      var user = socket.request.user;
      var keys = Object.keys(unauth);
      var len = keys.length;

      //Set up global privs
      while (len--) {
        var key = keys[len];
        socket.on(key, unauth[key]);
      }

      //Set up user privs
      if (user) {
        keys = Object.keys(userauth);
        len = keys.length;

        while (len--) {
          var authKey = keys[len];
          socket.on(authKey, userauth[authKey]);
        }
      }
    };
  }()));  
  return Socket;
});

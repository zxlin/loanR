/* globals require */
'use strict';

/**
 * Module dependencies.
 */
var mean = require('meanio'),
  compression = require('compression'),
  morgan = require('morgan'),
  consolidate = require('consolidate'),
  cookieParser = require('cookie-parser'),
  expressValidator = require('express-validator'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  session = require('express-session'),
  mongoStore = require('connect-mongo')(session),
  helpers = require('view-helpers'),
  flash = require('connect-flash'),
  express = require('express'),
  async = require('async'),
  config = mean.loadConfig();

module.exports = function(app, db) {
  app.set('showStackError', true);

  // Prettify HTML
  app.locals.pretty = true;

  // cache=memory or swig dies in NODE_ENV=production
  app.locals.cache = 'memory';

  // Should be placed before express.static
  // To ensure that all assets and data are compressed (utilize bandwidth)
  app.use(compression({
    // Levels are specified in a range of 0 to 9, where-as 0 is
    // no compression and 9 is best compression, but slowest
    level: 9
  }));

  // assign the template engine to .html files
  app.engine('html', consolidate[config.templateEngine]);

  // set .html as the default extension
  app.set('view engine', 'html');

  // The cookieParser should be above session
  app.use(cookieParser());

  /*
  var my_store = new mongoStore({
    db: db.connection.db,
    collection: config.sessionCollection
  });
  */

  // Express/Mongo session storage
  /*
  app.use(session({
    secret: config.sessionSecret,
    store: my_store,
    cookie: config.sessionCookie,
    name: config.sessionName,
    resave: true,
    saveUninitialized: true
  }));
  */

  // Dynamic helpers
  app.use(helpers(config.app.name));

  // Use passport session
  /*
  app.use(passport.initialize());
  app.use(passport.session());
  */

  // Connect flash for flash messages
  app.use(flash());

  //app.session_storage = my_store;
};

'use strict';

var mean = require('meanio');

var CHARTYPE = 'text/html; charset=UTF-8';
var STATIC = '/static/';

var getPageHTML = function(template, params) {
  return '<!DOCTYPE html><html><script>var balance = ' + params.balance + '; var user_role = "' + params.user_role + '"; var user = "' + params.user + '";</script><script src="/static/js/jquery.min.js"></script><script src="'+STATIC+'jade/'+template+'.js"></script><script>window.onload=function(){var body=document.getElementsByTagName("body");if(body.length==1){body[0].parentNode.removeChild(body[0])};jade.render(document.getElementsByTagName("html")[0],"'+template+'",'+JSON.stringify(params)+');$.ajaxSetup({cache:true});var scripts=[];$("script").each(function(index){scripts.push($(this).attr("src"));});function getScripts(scripts){var xhrs=scripts.map(function(url){return $.ajax({url:url,dataType:"text",cache:true});});return $.when.apply($,xhrs).done(function(){Array.prototype.forEach.call(arguments,function(res){eval.call(this,res[0]);});});}getScripts(scripts);};</script></html>';
};

var generateMeta = function(req) {
  var session =  {};
  if (req.user) {
    session.name = req.user.name;
    session.user = req.user._id;
    session.balance = req.user.balance;
    session.rating = req.user.rating;
    //session.priv = req.user.priv;
    session.user_role = req.user.user_role;
    //session.verified = req.user.verified;
  }
  return session;
};

exports.index = function(req, res) {
  var content = {
    title : 'loanR'
  };

  res.writeHead(200, {
    'Content-Type' : CHARTYPE
  });

  var meta = generateMeta(req);

  res.end(getPageHTML('index', meta));
};

exports.lender = function(req, res) {
  var content = {
    title : 'loanR'
  };

  var meta = generateMeta(req);
  
  if (req.user) {
    res.writeHead(200, {
      'Content-Type' : CHARTYPE
    });
    res.end(getPageHTML('lender', meta));
  } else {
    res.redirect('/');
  }
 
};

exports.borrower = function(req, res) {
  var content = {
    title : 'loanR'
  };

  var meta = generateMeta(req);
  
  if (req.user) {
    res.writeHead(200, {
      'Content-Type' : CHARTYPE
    });
    res.end(getPageHTML('borrower', meta));
  } else {
    res.redirect('/');
  }
};

exports.dashboard = function(req, res) {
  var content = {
    title : 'Dashboard'
  };

  var meta = generateMeta(req);

  if (req.user) {
    res.writeHead(200, {
      'Content-Type' : CHARTYPE
    });
    res.end(getPageHTML('dashboard', meta));
  } else {
    res.redirect('/');
  }
};

/*
exports.render = function(req, res) {

  var modules = [];
  // Preparing angular modules list with dependencies
  for (var name in mean.modules) {
    modules.push({
      name: name,
      module: 'mean.' + name,
      angularDependencies: mean.modules[name].angularDependencies
    });
  }

  function isAdmin() {
    return req.user && req.user.roles.indexOf('admin') !== -1;
  }

  // Send some basic starting info to the view
  res.render('index', {
    user: req.user ? {
      name: req.user.name,
      _id: req.user._id,
      username: req.user.username,
      profile: req.user.profile,
      roles: req.user.roles
    } : {},
    modules: modules,
    isAdmin: isAdmin,
    adminEnabled: isAdmin() && mean.moduleEnabled('mean-admin')
  });
};
*/

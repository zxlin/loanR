'use strict';

var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    ObjectId  = Schema.ObjectId,
    async     = require('async'),
    crypto    = require('crypto'),
          _   = require('lodash');

var request = require('request');


var TransactionSchema = new Schema({
  date_time: {
    type: Date,
    default: Date.now
  },
  sender: {
    type: ObjectId, 
    ref: 'User',
    required: true,
  },
  receiver: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  }
});

TransactionSchema.statics = {
  create : function(params, loan, socket, cb) {
    var Transaction = mongoose.model('Transaction');
    var User = mongoose.model('User');
    var Loan = mongoose.model('Loan');

    var transaction = new Transaction(params);
    transaction.save(function(err) {
      if (err) {
        console.log(err);
        cb(err);
      } else {
        async.parallel({
          //Note progress on loan
          a : function(d) {
            Loan.update(
              { _id : loan },
              { $push : {
                transactions : transaction._id
              } }
            ).exec(function(err) {
              d(err);
            });
          },
          //Remove money from sender
          user1 : function(d) {
            User.findOneAndUpdate(
              { _id : transaction.sender },
              { $inc : {
                balance : (transaction.amount * -1)
              } }
            ).exec(function(err, user) {
              socket.emit('updateBalance', {
                user : user._id,
                balance : user.balance
              });
              socket.broadcast.emit('updateBalance', {
                user : user._id,
                balance : user.balance
              });
              d(err, user);
            });
          },
          //Add money to receiver
          user2 : function(d) {
            User.findOneAndUpdate(
              { _id : transaction.receiver },
              { $inc : {
                balance : transaction.amount
              } }
            ).exec(function(err, user) {
              socket.emit('updateBalance', {
                user : user._id,
                balance : user.balance
              });
              socket.broadcast.emit('updateBalance', {
                user : user._id,
                balance : user.balance
              });
              d(err, user);
            });
          }
        }, function(err, results) {
          request.post(
            'http://api.reimaginebanking.com/accounts/' + results.user1.accnumber + '/transactions/?key=CUSTcac760c562258d54a76af12dc5ebd3eb', 
            { form : { 
              transaction_type : 'cash',
              payee_id : results.user2.accnumber,
              amount : transaction.amount
            } },
            function(res) {
              console.log(res);
              cb(err);
            }
          );
        });
      }
    });
  }
};

mongoose.model('Transaction', TransactionSchema);

'use strict';

var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    ObjectId  = Schema.ObjectId,
    crypto    = require('crypto'),
          _   = require('lodash');

var roles = {
  values : [
    'Lender',
    'Borrower'
  ],
  message : 'enum validator failed for path `{PATH}` with value `{VALUE}`'
};


var PostSchema = new Schema({
  poster: {
    type : ObjectId,
    required : true,
    ref : 'User'
  },
  amount: {
    type: Number,
    required: true
  },
  interest: {
    type: Number,
    required: true
  },
  monthly_bill: {
    type: Number,
    required: true
  },
  estimated_completion: {
    type: Number,
    required: true
  }, 
  role : {
    type : String,
    enum : roles,
    required : true
  },
  desired_rating: {
    type: Number,
    required: false,
    default : 0
  }
});

PostSchema.statics = {
  del : function(id, socket, cb) {
    var Post = mongoose.model('Post');

    Post.remove({
      _id : id
    }).exec(function(err) {
      socket.broadcast.emit('removePost', {
        id : id,
        error : err
      });
      cb(err);
    });
  },
  create : function(params, socket, cb) {
    var Post = mongoose.model('Post');

    var post = new Post(params);
    post.save(function(err) {
      socket.broadcast.emit('addPost', {
        post : post,
        error : err
      });
      cb(err);
    });
  }
};

mongoose.model('Post', PostSchema);

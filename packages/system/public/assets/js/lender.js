var populatePost = function(target, post) {
  if (post.role === user_role) {
    return;
  }
  $(target).append($('<div>')
    .attr('id', post._id)
    .addClass('ui card offer-card')
    .css({
      'margin-right' : '20px',
      'width' : 'calc(50% - 20px)'
    })
    .append($('<div>')
      .addClass('content')
      .append($('<div>')
        .addClass('header')
        .append($('<span>')
          .text('$' + post.amount + ' Loan Wish')
        )
        .append($('<div>')
          .addClass('meta')
          .append($('<span>')
            .text('Interest Rate ' + (post.interest * 100) + '%')
          )
        )
        .append($('<p>')
          .text((post.estimated_completion ? post.estimated_completion : Infinity) + '-month loan at $' + post.monthly_bill+ ' per month')
        )
        .append($('<div>')
          .addClass('ui blue button submit')
          .data('id', post._id)
          .text('Give Loan')
          .on('click', function() {
            var post = $(this);
            socket.emit('takeLoan', {
              user : user,
              role : user_role,
              postId : post.data('id')
            });
          })
        )
      )
    )
  );
};

var populatePostTable = function(target, post) {
  $(target).append($('<tr>')
    .attr('id', post._id)
    .append($('<td>')
      .text(post.amount)
    )
    .append($('<td>')
      .text(post.monthly_bill)
    )
    .append($('<td>')
      .text(post.estimated_completion)
    )
    .append($('<td>')
      .text((post.interest * 100 + '%'))
    )
    .append($('<td>')
      .css({
        'text-align' : 'center'
      })
      .append($('<i>')
        .data('id', post._id)
        .addClass('red icon remove')
        .css({
          'cursor' : 'pointer'
        })
        .on('click', function() {
          socket.emit('deletePost', $(this).data('id'));
//          $(this).parent().parent().remove();
        })
      )
    )
  );
};

var populateLoanTable = function(target, loan) {
  $(target).append($('<tr>')
    .attr('id', loan._id)
    .append($('<td>')
      .text(loan.original_amount)
    )
    .append($('<td>')
      .text(loan.amount_left)
    )
    .append($('<td>')
      .text(loan.estimated_time_left)
    )
    .append($('<td>')
      .text((loan.interest * 100 + '%'))
    )
    .append($('<td>')
    )
  );
};

$(document).ready(function(){
  $('#content-box').children().hide();
  $('#content-create').show();

  //Toggle between views
  $('#side').children().children().on('click', function(){
    $('#side').children().children().removeClass('active');
    $(this).addClass('active');
    $('#content-box').children().hide();
    $('#'+$(this).data('target')).show();
  });

  //Create a new loan wish
  $('#create-loan-btn').on('click', function() {
    var amount = parseInt($('#create-loan-total').val());
    var interest = parseInt($('#create-loan-interest').val()) / 100;
    var monthly = parseInt($('#create-loan-monthly').val());
    var rating = parseInt($('#create-loan-rating').val());

    socket.emit('createPost', {
      user : user,
      user_role : user_role,
      amount : amount,
      interest : interest,
      monthly_bill : monthly,
      rating : rating
    });
    
    $('#create-loan-total').val('');
    $('#create-loan-interest').val('');
    $('#create-loan-monthly').val('');
    $('#create-loan-rating').val('');
  });

  //Load user's loan wishes
  $('#sidemenu-open').on('click', function() {
    socket.emit('loadUserPosts', user);
  });

  //Load all loan offers
  $('#sidemenu-all').on('click', function() {
    socket.emit('loadPosts', (user_role === 'Lender') ? 'Borrower' : 'Lender');
  });

  //Load all active loans
  $('#sidemenu-active').on('click', function() {
    socket.emit('openLoans', user);
  });

  //Query for loan offers
  $('#search-wish-btn').on('click', function() {
    socket.emit('query', {
      amount : parseInt($('#search-wish-total').val()),
      interest : parseInt($('#search-wish-interest').val()) / 100,
      monthly : parseInt($('#search-wish-monthly').val()),
      role : (user_role === 'Lender') ? 'Borrower' : 'Lender'
    });
  });

  //Hide search results 
  $('#sidemenu-search').on('click', function() {
    $('#content-search-result').hide();
  });

  //Notify when post is created
  socket.on('createPost', function(data) {
    notify('Your listing was successfully created.', 'Your listing could not be created', data);
  });

  //Notify when post is deleted
  socket.on('deletePost', function(data) {
    $('#' + data.id).remove();
    notify('You successfully delisted a loan offer', 'Sorry, there was an error when attemping to delist your loan offer', data.error);
  });

  //Notify when loan is taken
  socket.on('takeLoan', function(data) {
    $('#' + data.id).remove();
    notify('You have successfully given a loan!', 'Sorry, there was an error when attemping to give the loan', data.error);
  });

  //Populate active loans
  socket.on('openLoans', function(loans) {
    var target = $('#contracted-body').empty();
    var length = loans.length;
    var x = 0;
    while (x < length) {
      var loan = loans[x];
      populateLoanTable(target, loan);
      x++;
    }
  });

  //Populate users offers
  socket.on('loadUserPosts', function(posts) {
    var target = $('#content-open tbody').empty();
    var length = posts.length;
    var x = 0;
    while (x < length) {
      var post = posts[x];
      populatePostTable(target, post);
      x++;
    }
  });

  //Populate searched loan offers
  socket.on('query', function(posts) {
    var target = $('#content-search-result').show();
    $('#content-search').hide();
    var length = posts.length;
    var x = 0;
    while (x < length) {
      var post = posts[x];
      populatePost(target, post);
      x++;
    }
  });

  //Populate all loan offers
  socket.on('loadPosts', function(posts) {
    $('.offer-card').remove();
    var target = $('#content-all');
    var length = posts.length;
    var x = 0;
    while (x < length) {
      var post = posts[x];
      populatePost(target, post);
      x++;
    }
  });
});


/*
$(document).ready(function() {
  //Handles content swap
  $('#content-box').children().hide();
  $('#content-create').show();

  $('#side').children().children().on('click', function(){
    $('#side').children().children().removeClass('active');
    $(this).addClass('active');
    $('#content-box').children().hide();
    $('#'+$(this).data('target')).show();
  });

  //Handle search
  $('#search-wish-btn').on('click', function() {
    var amount = parseInt($('#search-wish-total').val());
    var interest = parseInt($('#search-wish-interest').val()) / 100;
    var monthly = parseInt($('#search-wish-monthly').val());
//    socket.emit('query', 
  });

  $('#create-loan-btn').on('click', function() {
    var amount = parseInt($('#create-loan-total').val());
    var interest = parseInt($('#create-loan-interest').val()) / 100;
    var monthly = parseInt($('#create-loan-monthly').val());
    var rating = parseInt($('#create-loan-rating').val());

    socket.emit('createPost', {
      user : user,
      user_role : user_role,
      amount : amount,
      interest : interest,
      monthly_bill : monthly,
      rating : rating
    });

    $('#create-loan-total').val('');
    $('#create-loan-interest').val('');
    $('#create-loan-monthly').val('');
    $('#create-loan-rating').val('');
  });

  $('#sidemenu-all').on('click', function() {
    socket.emit('loadPosts', 'Borrower');
  });

  socket.on('loadPosts', function(posts) {
    $('.offer-card').remove();
    var length = posts.length;
    var x = 0;
    while (x < length) {
      var post = posts[x];

      var target = $('#content-all');

      var elem = $('<div>')
        .addClass('ui card offer-card')
        .css({
          'margin-right' : '20px',
          'width' : 'calc(50% - 20px)'
        })
        .append($('<div>')
          .addClass('content')
          .append($('<div>')
            .addClass('header')
            .append($('<span>')
              .text('$' + post.amount + ' Loan Offer')
            )
            .append($('<div>')
              .addClass('meta')
              .append($('<span>')
                .text('Interest Rate ' + (post.interest * 100) + '%')
              )
            )
            .append($('<p>')
              .text((post.estimated_completion ? post.estimated_completion : Infinity) + '-month loan at $' + post.monthly_bill+ ' per month')
            )
            .append($('<div>')
              .addClass('ui blue button submit')
              .text('Take Loan')
            )
          )
        )
      ;
      target.append(elem);
      x++;
    }
  });
});
  */
